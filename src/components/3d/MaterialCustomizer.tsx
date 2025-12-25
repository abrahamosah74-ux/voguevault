/**
 * Material Customizer Component
 * Allows real-time material and color customization of 3D products
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface Material {
  id: string;
  name: string;
  material_type: string;
  base_color_hex: string;
  roughness: number;
  metallic: number;
  albedo_map_url?: string;
  normal_map_url?: string;
  roughness_map_url?: string;
  swatch_url: string;
  price_per_sq_m?: number;
}

interface CustomizablePart {
  part_id: string;
  part_name: string;
  default_material_id: string;
  material_channels: string[];
}

interface MaterialCustomizerProps {
  productId: string;
  templateId: string;
  onMaterialChange?: (part: string, material: Material) => void;
  onConfigurationChange?: (config: CustomizationConfig) => void;
  model3D?: THREE.Object3D;
}

interface CustomizationConfig {
  [partId: string]: {
    materialId: string;
    material: Material;
  };
}

/**
 * Main Material Customizer Component
 */
export function MaterialCustomizer({
  productId,
  templateId,
  onMaterialChange,
  onConfigurationChange,
  model3D
}: MaterialCustomizerProps) {
  const [template, setTemplate] = useState<any>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<CustomizationConfig>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'materials' | 'preview' | 'pricing'>('materials');
  const [totalPrice, setTotalPrice] = useState(0);

  // Fetch customization template and materials
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [templateRes, materialsRes] = await Promise.all([
          fetch(`/api/products/${productId}/customization-template/${templateId}`),
          fetch('/api/materials')
        ]);

        const templateData = await templateRes.json();
        const materialsData = await materialsRes.json();

        setTemplate(templateData);
        setMaterials(materialsData);

        // Initialize with defaults
        const defaults: CustomizationConfig = {};
        templateData.customizable_parts.forEach((part: CustomizablePart) => {
          const defaultMaterial = materialsData.find(
            (m: Material) => m.id === part.default_material_id
          );
          defaults[part.part_id] = {
            materialId: part.default_material_id,
            material: defaultMaterial
          };
        });

        setSelectedMaterials(defaults);
        calculateTotalPrice(defaults, templateData.base_price || 0);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching customization data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [productId, templateId]);

  /**
   * Apply material to 3D model
   */
  const applyMaterialTo3D = useCallback(
    (partId: string, material: Material) => {
      if (!model3D) return;

      model3D.traverse((child) => {
        if (child.isMesh && child.name.includes(partId)) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat: THREE.Material) => {
              applyMaterialProperties(mat, material);
            });
          } else {
            applyMaterialProperties(child.material as THREE.Material, material);
          }
          child.material.needsUpdate = true;
        }
      });
    },
    [model3D]
  );

  /**
   * Apply material properties to Three.js material
   */
  const applyMaterialProperties = (material: THREE.Material, customMaterial: Material) => {
    if (material instanceof THREE.MeshStandardMaterial) {
      // Update base color
      material.color.setHex(customMaterial.base_color_hex || '#ffffff');

      // Update physical properties
      material.roughness = customMaterial.roughness;
      material.metallic = customMaterial.metallic;

      // Load and apply textures if available
      if (customMaterial.albedo_map_url) {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(customMaterial.albedo_map_url, (texture) => {
          material.map = texture;
          material.needsUpdate = true;
        });
      }

      if (customMaterial.normal_map_url) {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(customMaterial.normal_map_url, (texture) => {
          (material as THREE.MeshStandardMaterial).normalMap = texture;
          material.needsUpdate = true;
        });
      }

      if (customMaterial.roughness_map_url) {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(customMaterial.roughness_map_url, (texture) => {
          (material as THREE.MeshStandardMaterial).roughnessMap = texture;
          material.needsUpdate = true;
        });
      }
    }
  };

  /**
   * Handle material selection
   */
  const handleSelectMaterial = (partId: string, materialId: string) => {
    const material = materials.find(m => m.id === materialId);
    if (!material) return;

    // Update selection
    const updated = {
      ...selectedMaterials,
      [partId]: { materialId, material }
    };
    setSelectedMaterials(updated);

    // Apply to 3D model
    applyMaterialTo3D(partId, material);

    // Call callbacks
    onMaterialChange?.(partId, material);
    onConfigurationChange?.(updated);

    // Recalculate price
    calculateTotalPrice(
      updated,
      template?.base_price || 0
    );
  };

  /**
   * Calculate total customization price
   */
  const calculateTotalPrice = (config: CustomizationConfig, basePrice: number) => {
    let total = basePrice;
    Object.values(config).forEach(({ material }) => {
      if (material?.price_per_sq_m) {
        total += material.price_per_sq_m;
      }
    });
    setTotalPrice(total);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-600">Loading customizer...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-black to-gray-900 text-white p-6">
        <h3 className="text-2xl font-bold">Customize Your Design</h3>
        <p className="text-gray-300 mt-1">
          Select materials and colors for each part of your product
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {(['materials', 'preview', 'pricing'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'bg-black text-white'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab === 'materials' && '🎨 Materials'}
            {tab === 'preview' && '👁️ Preview'}
            {tab === 'pricing' && '💰 Pricing'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'materials' && (
          <MaterialsTab
            parts={template?.customizable_parts || []}
            materials={materials}
            selectedMaterials={selectedMaterials}
            onSelectMaterial={handleSelectMaterial}
          />
        )}

        {activeTab === 'preview' && (
          <PreviewTab selectedMaterials={selectedMaterials} />
        )}

        {activeTab === 'pricing' && (
          <PricingTab
            basePrice={template?.base_price}
            selectedMaterials={selectedMaterials}
            totalPrice={totalPrice}
            materials={materials}
          />
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 p-6 flex justify-between items-center">
        <div>
          <p className="text-gray-600 text-sm">Total Price</p>
          <p className="text-3xl font-bold text-black">${totalPrice.toFixed(2)}</p>
        </div>
        <button className="px-8 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors">
          Add to Cart
        </button>
      </div>
    </div>
  );
}

/**
 * Materials Selection Tab
 */
interface MaterialsTabProps {
  parts: CustomizablePart[];
  materials: Material[];
  selectedMaterials: CustomizationConfig;
  onSelectMaterial: (partId: string, materialId: string) => void;
}

function MaterialsTab({
  parts,
  materials,
  selectedMaterials,
  onSelectMaterial
}: MaterialsTabProps) {
  return (
    <div className="space-y-6">
      {parts.map(part => (
        <div key={part.part_id} className="border rounded-lg p-4">
          <h4 className="font-semibold text-lg mb-4">{part.part_name}</h4>

          {/* Material Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {materials.map(material => {
              const isSelected =
                selectedMaterials[part.part_id]?.materialId === material.id;

              return (
                <button
                  key={material.id}
                  onClick={() => onSelectMaterial(part.part_id, material.id)}
                  className={`group relative rounded-lg overflow-hidden transition-all ${
                    isSelected ? 'ring-2 ring-black scale-105' : 'hover:scale-105'
                  }`}
                >
                  {/* Material Swatch */}
                  <div
                    className="aspect-square rounded-lg border-2 border-gray-200 group-hover:border-gray-400"
                    style={{
                      backgroundColor: material.base_color_hex,
                      backgroundImage: material.swatch_url
                        ? `url(${material.swatch_url})`
                        : 'none',
                      backgroundSize: 'cover'
                    }}
                  />

                  {/* Checkmark Overlay */}
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                        <span className="text-black font-bold">✓</span>
                      </div>
                    </div>
                  )}

                  {/* Hover Info */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end p-2 opacity-0 group-hover:opacity-100">
                    <div className="text-white text-xs">
                      <p className="font-medium">{material.name}</p>
                      {material.price_per_sq_m && (
                        <p>+${material.price_per_sq_m.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Material Details */}
          {selectedMaterials[part.part_id] && (
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <p className="text-sm">
                <span className="font-semibold">Selected:</span>{' '}
                {selectedMaterials[part.part_id].material.name}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Type: {selectedMaterials[part.part_id].material.material_type}
              </p>
              {selectedMaterials[part.part_id].material.price_per_sq_m && (
                <p className="text-sm font-medium mt-1">
                  +${selectedMaterials[part.part_id].material.price_per_sq_m.toFixed(2)}/m²
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Live Preview Tab
 */
interface PreviewTabProps {
  selectedMaterials: CustomizationConfig;
}

function PreviewTab({ selectedMaterials }: PreviewTabProps) {
  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-lg">Live Preview</h4>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(selectedMaterials).map(([partId, selection]) => {
          const material = selection.material;

          return (
            <div key={partId} className="text-center">
              {/* Preview Swatch */}
              <div
                className="aspect-square rounded-lg border-2 border-gray-200 mb-3"
                style={{
                  backgroundColor: material?.base_color_hex,
                  backgroundImage: material?.swatch_url
                    ? `url(${material.swatch_url})`
                    : 'none',
                  backgroundSize: 'cover'
                }}
              />

              {/* Details */}
              <p className="font-medium text-sm capitalize">{partId}</p>
              <p className="text-xs text-gray-600">{material?.name}</p>

              {/* Properties */}
              <div className="mt-2 text-xs text-gray-500 space-y-1">
                <p>Roughness: {(material?.roughness || 0).toFixed(2)}</p>
                <p>Metallic: {(material?.metallic || 0).toFixed(2)}</p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-sm text-gray-600 mt-4 p-3 bg-blue-50 rounded">
        💡 The 3D model above will update in real-time as you select materials
      </p>
    </div>
  );
}

/**
 * Pricing Tab
 */
interface PricingTabProps {
  basePrice?: number;
  selectedMaterials: CustomizationConfig;
  totalPrice: number;
  materials: Material[];
}

function PricingTab({
  basePrice = 0,
  selectedMaterials,
  totalPrice,
  materials
}: PricingTabProps) {
  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-lg">Price Breakdown</h4>

      <div className="space-y-2">
        {/* Base Price */}
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">Base Price</span>
          <span className="font-medium">${basePrice.toFixed(2)}</span>
        </div>

        {/* Material Additions */}
        {Object.entries(selectedMaterials).map(([partId, selection]) => {
          const material = selection.material;
          if (!material?.price_per_sq_m) return null;

          return (
            <div key={partId} className="flex justify-between py-2 border-b">
              <span className="text-gray-600">
                {partId} - {material.name}
              </span>
              <span className="font-medium">+${material.price_per_sq_m.toFixed(2)}</span>
            </div>
          );
        })}

        {/* Total */}
        <div className="flex justify-between py-3 bg-gray-50 px-3 rounded font-bold text-lg">
          <span>Total</span>
          <span className="text-black">${totalPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* Savings Info */}
      <div className="p-3 bg-green-50 rounded border border-green-200">
        <p className="text-sm text-green-700">
          ✓ Customization is included in your price. No hidden charges.
        </p>
      </div>
    </div>
  );
}

export default MaterialCustomizer;
