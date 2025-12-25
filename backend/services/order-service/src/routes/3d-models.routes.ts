/**
 * 3D Models & Customization API Routes
 * Handles all 3D model operations, customization, and material management
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import { v4 as uuid } from 'uuid';
import ModelProcessorService from '../services/model-processor.service';
import DatabaseService from '../services/database.service';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

// Multer config for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

const db = new DatabaseService();
const modelProcessor = new ModelProcessorService(null); // Cloud storage client

// ============================================================
// 3D MODEL ENDPOINTS
// ============================================================

/**
 * GET /api/products/:productId/3d-models
 * Retrieve all 3D models for a product
 */
router.get('/products/:productId/3d-models', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { variant_id, view_type } = req.query;

    // Build query
    let sql = `
      SELECT 
        id,
        product_id,
        variant_id,
        model_url,
        compressed_model_url,
        textures,
        vertex_count,
        triangle_count,
        scale_factor,
        ar_placement,
        lod_urls,
        thumbnail_url,
        is_primary,
        view_type,
        view_count,
        created_at
      FROM product_3d_models
      WHERE product_id = $1
    `;

    const params: any[] = [productId];

    if (variant_id) {
      sql += ` AND variant_id = $${params.length + 1}`;
      params.push(variant_id);
    }

    if (view_type) {
      sql += ` AND view_type = $${params.length + 1}`;
      params.push(view_type);
    }

    sql += ` ORDER BY is_primary DESC, created_at DESC`;

    const models = await db.getMany(sql, params);

    // Increment view count for each model
    for (const model of models) {
      await db.update('product_3d_models', { view_count: model.view_count + 1 }, {
        id: model.id
      });
    }

    res.json({
      success: true,
      data: {
        product_id: productId,
        models: models,
        total: models.length
      }
    });
  } catch (error) {
    console.error('Error fetching 3D models:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch 3D models',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/products/:productId/variants/:variantId/3d-models
 * Retrieve 3D models for a specific product variant
 */
router.get(
  '/products/:productId/variants/:variantId/3d-models',
  async (req: Request, res: Response) => {
    try {
      const { productId, variantId } = req.params;

      const models = await db.getMany(
        `SELECT * FROM product_3d_models 
         WHERE product_id = $1 AND variant_id = $2
         ORDER BY is_primary DESC`,
        [productId, variantId]
      );

      res.json({
        success: true,
        data: models
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
);

/**
 * POST /api/admin/products/:productId/3d-models
 * Upload and process new 3D model (admin only)
 */
router.post(
  '/admin/products/:productId/3d-models',
  authMiddleware,
  adminMiddleware,
  upload.single('model'),
  async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      const { variant_id, is_primary, view_type, scale, rotation, position } = req.body;

      if (!req.file) {
        return res.status(400).json({ error: 'No model file uploaded' });
      }

      // Process model
      console.log(`Processing 3D model for product ${productId}...`);

      const processed = await modelProcessor.processUploadedModel(
        req.file.buffer,
        req.file.originalname,
        productId
      );

      // Create database record
      const modelId = uuid();

      const modelData = {
        id: modelId,
        product_id: productId,
        variant_id: variant_id || null,
        model_url: processed.originalUrl,
        compressed_model_url: processed.compressedUrl,
        textures: processed.textures,
        vertex_count: processed.metadata.vertexCount,
        triangle_count: processed.metadata.triangleCount,
        file_size_mb: processed.statistics.originalFileSize / (1024 * 1024),
        model_format: processed.metadata.format,
        material_count: processed.metadata.materialCount,
        bounding_box: processed.metadata.boundingBox,
        center_point: processed.metadata.centerPoint,
        scale_factor: parseFloat(scale) || 1.0,
        lod_urls: processed.lodUrls,
        ar_placement: req.body.ar_placement || 'floor',
        ar_shadows: req.body.ar_shadows !== 'false',
        is_primary: is_primary === 'true' || false,
        view_type: view_type || 'default',
        thumbnail_url: processed.metadata.boundingBox ? 'generated' : null,
        created_by: (req as any).user?.id,
        created_at: new Date()
      };

      // If marking as primary, unset other models
      if (modelData.is_primary) {
        await db.query(
          `UPDATE product_3d_models 
           SET is_primary = false 
           WHERE product_id = $1 AND id != $2`,
          [productId, modelId]
        );
      }

      // Insert into database
      const inserted = await db.insert('product_3d_models', modelData);

      res.status(201).json({
        success: true,
        message: '3D model uploaded and processed successfully',
        data: {
          id: modelId,
          ...modelData,
          processing_stats: processed.statistics
        }
      });
    } catch (error) {
      console.error('Error uploading 3D model:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upload 3D model',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * DELETE /api/admin/3d-models/:modelId
 * Delete a 3D model (admin only)
 */
router.delete(
  '/admin/3d-models/:modelId',
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { modelId } = req.params;

      // Delete from cloud storage
      await modelProcessor.deleteProcessedModel(modelId);

      // Delete from database
      await db.delete('product_3d_models', { id: modelId });

      res.json({
        success: true,
        message: '3D model deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// ============================================================
// CUSTOMIZATION TEMPLATE ENDPOINTS
// ============================================================

/**
 * GET /api/products/:productId/customization-template
 * Get customization template for a product
 */
router.get('/products/:productId/customization-template', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    const template = await db.getOne(
      `SELECT * FROM customization_templates WHERE product_id = $1`,
      [productId]
    );

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'No customization template found for this product'
      });
    }

    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/admin/products/:productId/customization-templates
 * Create customization template (admin only)
 */
router.post(
  '/admin/products/:productId/customization-templates',
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      const {
        name,
        template_type,
        customizable_parts,
        base_price,
        customization_price
      } = req.body;

      const templateId = uuid();

      const templateData = {
        id: templateId,
        product_id: productId,
        name,
        template_type,
        customizable_parts: customizable_parts || [],
        base_price: parseFloat(base_price) || 0,
        customization_price: parseFloat(customization_price) || 0,
        created_at: new Date()
      };

      await db.insert('customization_templates', templateData);

      res.status(201).json({
        success: true,
        data: templateData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// ============================================================
// MATERIAL LIBRARY ENDPOINTS
// ============================================================

/**
 * GET /api/materials
 * Get all materials with optional filtering
 */
router.get('/materials', async (req: Request, res: Response) => {
  try {
    const { type, brand_id, search, page = 1, limit = 20 } = req.query;

    let sql = `SELECT * FROM material_library WHERE 1=1`;
    const params: any[] = [];

    if (type) {
      sql += ` AND material_type = $${params.length + 1}`;
      params.push(type);
    }

    if (brand_id) {
      sql += ` AND brand_id = $${params.length + 1}`;
      params.push(brand_id);
    }

    if (search) {
      sql += ` AND name ILIKE $${params.length + 1}`;
      params.push(`%${search}%`);
    }

    // Pagination
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    sql += ` ORDER BY popularity_score DESC LIMIT ${limit} OFFSET ${offset}`;

    const materials = await db.getMany(sql, params);

    res.json({
      success: true,
      data: {
        materials,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: materials.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/admin/materials
 * Create new material (admin only)
 */
router.post(
  '/admin/materials',
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const {
        name,
        material_type,
        base_color_hex,
        roughness,
        metallic,
        albedo_map_url,
        normal_map_url,
        roughness_map_url,
        swatch_url,
        price_per_sq_m,
        sustainability_score,
        brand_id,
        tags
      } = req.body;

      const materialId = uuid();

      const materialData = {
        id: materialId,
        name,
        material_type,
        base_color_hex: base_color_hex || '#FFFFFF',
        roughness: parseFloat(roughness) || 0.5,
        metallic: parseFloat(metallic) || 0,
        albedo_map_url,
        normal_map_url,
        roughness_map_url,
        swatch_url,
        price_per_sq_m: parseFloat(price_per_sq_m) || 0,
        sustainability_score: parseInt(sustainability_score) || 50,
        brand_id: brand_id || null,
        tags: tags || [],
        created_at: new Date()
      };

      await db.insert('material_library', materialData);

      res.status(201).json({
        success: true,
        data: materialData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// ============================================================
// CUSTOMIZATION OPTIONS ENDPOINTS
// ============================================================

/**
 * GET /api/customization-templates/:templateId/options
 * Get customization options for a template
 */
router.get(
  '/customization-templates/:templateId/options',
  async (req: Request, res: Response) => {
    try {
      const { templateId } = req.params;
      const { part_id } = req.query;

      let sql = `SELECT * FROM customization_options WHERE template_id = $1`;
      const params: any[] = [templateId];

      if (part_id) {
        sql += ` AND part_id = $${params.length + 1}`;
        params.push(part_id);
      }

      sql += ` ORDER BY sort_order ASC, popularity_score DESC`;

      const options = await db.getMany(sql, params);

      res.json({
        success: true,
        data: options
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * POST /api/admin/customization-options
 * Create customization option (admin only)
 */
router.post(
  '/admin/customization-options',
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response) => {
    try {
      const {
        template_id,
        part_id,
        name,
        description,
        material_id,
        color_hex,
        price_adjustment,
        is_premium
      } = req.body;

      const optionId = uuid();

      const optionData = {
        id: optionId,
        template_id,
        part_id,
        name,
        description,
        material_id,
        color_hex,
        price_adjustment: parseFloat(price_adjustment) || 0,
        is_premium: is_premium === 'true',
        is_available: true,
        created_at: new Date()
      };

      await db.insert('customization_options', optionData);

      res.status(201).json({
        success: true,
        data: optionData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// ============================================================
// USER CUSTOMIZATION ENDPOINTS
// ============================================================

/**
 * POST /api/users/:userId/custom-configurations
 * Save user's custom configuration
 */
router.post(
  '/users/:userId/custom-configurations',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { product_id, template_id, name, configuration, preview_image_url } = req.body;

      const configId = uuid();

      const configData = {
        id: configId,
        user_id: userId,
        product_id,
        template_id,
        name: name || `Custom Configuration ${new Date().toLocaleDateString()}`,
        configuration,
        preview_image_url,
        is_saved: true,
        created_at: new Date()
      };

      await db.insert('user_custom_configurations', configData);

      res.status(201).json({
        success: true,
        data: configData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/users/:userId/custom-configurations
 * Get user's saved configurations
 */
router.get(
  '/users/:userId/custom-configurations',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { product_id } = req.query;

      let sql = `SELECT * FROM user_custom_configurations WHERE user_id = $1 AND is_saved = true`;
      const params: any[] = [userId];

      if (product_id) {
        sql += ` AND product_id = $${params.length + 1}`;
        params.push(product_id);
      }

      sql += ` ORDER BY created_at DESC`;

      const configs = await db.getMany(sql, params);

      res.json({
        success: true,
        data: configs
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;
