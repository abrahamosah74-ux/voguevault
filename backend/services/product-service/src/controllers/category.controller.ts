// Category Controller
import { Request, Response } from 'express';
import { successResponse } from '../../../shared/utils';

class CategoryController {
  // Get All Categories
  async getAllCategories(req: Request, res: Response) {
    try {
      // Mock categories (would query PostgreSQL in real implementation)
      const categories = [
        {
          id: 'cat_1',
          name: 'Tops',
          slug: 'tops',
          description: 'T-shirts, Shirts, Blouses',
          depth: 1,
          is_active: true,
        },
        {
          id: 'cat_2',
          name: 'Bottoms',
          slug: 'bottoms',
          description: 'Jeans, Pants, Shorts',
          depth: 1,
          is_active: true,
        },
        {
          id: 'cat_3',
          name: 'Dresses',
          slug: 'dresses',
          description: 'Casual, Formal, Cocktail',
          depth: 1,
          is_active: true,
        },
      ];

      res.json(successResponse(categories, 'Categories retrieved'));
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get Category by ID
  async getCategoryById(req: Request, res: Response) {
    try {
      const { categoryId } = req.params;

      const category = {
        id: categoryId,
        name: 'Tops',
        slug: 'tops',
        description: 'T-shirts, Shirts, Blouses',
        depth: 1,
        is_active: true,
      };

      res.json(successResponse(category, 'Category retrieved'));
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Create Category
  async createCategory(req: Request, res: Response) {
    try {
      const categoryData = req.body;

      const newCategory = {
        id: 'cat_' + Date.now(),
        ...categoryData,
        created_at: new Date(),
      };

      res.status(201).json(
        successResponse(newCategory, 'Category created', 201)
      );
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Update Category
  async updateCategory(req: Request, res: Response) {
    try {
      const { categoryId } = req.params;
      const updates = req.body;

      const updatedCategory = {
        id: categoryId,
        ...updates,
      };

      res.json(successResponse(updatedCategory, 'Category updated'));
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Delete Category
  async deleteCategory(req: Request, res: Response) {
    try {
      const { categoryId } = req.params;

      res.json(successResponse(null, 'Category deleted'));
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new CategoryController();
