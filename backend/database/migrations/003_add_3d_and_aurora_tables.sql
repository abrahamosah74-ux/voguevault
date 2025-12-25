-- ============================================================
-- VOGUEVAULT 3D PRODUCT DESIGN & AURORA AI SYSTEM
-- Database Schema Migrations
-- ============================================================

-- ============================================================
-- 3D MODEL MANAGEMENT TABLES
-- ============================================================

-- 3D Product Models Table
CREATE TABLE IF NOT EXISTS product_3d_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  
  -- Model Files
  model_url VARCHAR(500) NOT NULL,
  compressed_model_url VARCHAR(500),
  textures JSONB NOT NULL DEFAULT '{}',
  
  -- Model Metadata
  model_format VARCHAR(20) DEFAULT 'glb',
  file_size_mb DECIMAL(6,2),
  vertex_count INTEGER,
  triangle_count INTEGER,
  material_count INTEGER,
  
  -- Model Properties
  bounding_box JSONB,
  center_point JSONB,
  scale_factor DECIMAL(5,3) DEFAULT 1.0,
  
  -- Model States & Features
  model_states JSONB DEFAULT '{}',
  animations JSONB DEFAULT '[]',
  hotspots JSONB DEFAULT '[]',
  lod_urls JSONB DEFAULT '{}',
  texture_resolutions JSONB DEFAULT '{}',
  
  -- AR Configuration
  ar_scale VARCHAR(50) DEFAULT 'real',
  ar_placement VARCHAR(50) DEFAULT 'floor',
  ar_shadows BOOLEAN DEFAULT TRUE,
  
  -- Statistics
  view_count INTEGER DEFAULT 0,
  load_time_ms INTEGER,
  thumbnail_url VARCHAR(500),
  
  -- Metadata
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_3d_models_product_id (product_id),
  INDEX idx_3d_models_variant_id (variant_id),
  INDEX idx_3d_models_created_at (created_at)
);

-- Material Library Table
CREATE TABLE IF NOT EXISTS material_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  material_type VARCHAR(50) NOT NULL,
  
  -- Physical Properties
  base_color_hex CHAR(7),
  roughness DECIMAL(3,2) CHECK (roughness BETWEEN 0 AND 1),
  metallic DECIMAL(3,2) CHECK (metallic BETWEEN 0 AND 1),
  ior DECIMAL(3,2) DEFAULT 1.5,
  transparency DECIMAL(3,2) DEFAULT 0,
  
  -- Textures
  albedo_map_url VARCHAR(500),
  normal_map_url VARCHAR(500),
  roughness_map_url VARCHAR(500),
  metallic_map_url VARCHAR(500),
  ao_map_url VARCHAR(500),
  
  -- Visual Assets
  thumbnail_url VARCHAR(500),
  swatch_url VARCHAR(500),
  
  -- Metadata
  brand_id UUID REFERENCES brands(id),
  material_code VARCHAR(100),
  price_per_sq_m DECIMAL(10,2),
  sustainability_score INTEGER CHECK (sustainability_score BETWEEN 0 AND 100),
  tags TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_material_type (material_type),
  INDEX idx_material_brand_id (brand_id)
);

-- Customization Templates Table
CREATE TABLE IF NOT EXISTS customization_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Template Configuration
  name VARCHAR(200) NOT NULL,
  template_type VARCHAR(50) NOT NULL,
  description TEXT,
  
  -- Customizable Parts
  customizable_parts JSONB NOT NULL DEFAULT '[]',
  
  -- Constraints
  min_selections INTEGER DEFAULT 1,
  max_selections INTEGER DEFAULT 1,
  allow_multiple_types BOOLEAN DEFAULT FALSE,
  
  -- Preview Configuration
  preview_angles JSONB DEFAULT '["front", "back", "side"]',
  lighting_preset VARCHAR(50) DEFAULT 'studio',
  
  -- Pricing
  base_price DECIMAL(10,2),
  customization_price DECIMAL(10,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_customization_templates_product_id (product_id)
);

-- Customization Options Table
CREATE TABLE IF NOT EXISTS customization_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES customization_templates(id) ON DELETE CASCADE,
  part_id VARCHAR(100) NOT NULL,
  
  -- Option Details
  name VARCHAR(200) NOT NULL,
  description TEXT,
  
  -- Visual Properties
  material_id UUID REFERENCES material_library(id),
  color_hex CHAR(7),
  pattern_url VARCHAR(500),
  preview_url VARCHAR(500),
  
  -- 3D Properties
  texture_overrides JSONB DEFAULT '{}',
  shader_parameters JSONB DEFAULT '{}',
  
  -- Pricing
  price_adjustment DECIMAL(10,2) DEFAULT 0,
  is_premium BOOLEAN DEFAULT FALSE,
  
  -- Availability
  is_available BOOLEAN DEFAULT TRUE,
  stock_quantity INTEGER,
  
  -- Engagement
  sort_order INTEGER DEFAULT 0,
  popularity_score INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_customization_options_template_id (template_id),
  INDEX idx_customization_options_part_id (part_id)
);

-- Model Animations Table
CREATE TABLE IF NOT EXISTS model_animations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES product_3d_models(id) ON DELETE CASCADE,
  
  -- Animation Data
  name VARCHAR(200) NOT NULL,
  animation_type VARCHAR(50) NOT NULL,
  animation_data JSONB NOT NULL,
  duration_seconds DECIMAL(5,2),
  loop BOOLEAN DEFAULT TRUE,
  
  -- Triggers
  trigger_type VARCHAR(50) DEFAULT 'auto',
  trigger_target VARCHAR(100),
  
  -- Preview
  thumbnail_url VARCHAR(500),
  preview_video_url VARCHAR(500),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_model_animations_model_id (model_id)
);

-- AR Try-On Sessions Table
CREATE TABLE IF NOT EXISTS ar_tryon_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(100) NOT NULL,
  
  -- Session Data
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  
  -- AR Configuration
  ar_mode VARCHAR(50) NOT NULL,
  ar_environment VARCHAR(50),
  
  -- User Data
  user_measurements JSONB,
  user_photo_urls TEXT[],
  user_video_url VARCHAR(500),
  
  -- Session Stats
  duration_seconds INTEGER,
  screenshot_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  
  -- Conversion Tracking
  added_to_cart BOOLEAN DEFAULT FALSE,
  purchased BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  device_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_ar_sessions_user_id (user_id),
  INDEX idx_ar_sessions_product_id (product_id),
  INDEX idx_ar_sessions_created_at (created_at)
);

-- User Custom Configurations (Saved Customizations)
CREATE TABLE IF NOT EXISTS user_custom_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  template_id UUID REFERENCES customization_templates(id),
  
  -- Configuration Data
  name VARCHAR(200),
  configuration JSONB NOT NULL,
  preview_image_url VARCHAR(500),
  
  -- Engagement
  is_saved BOOLEAN DEFAULT TRUE,
  is_favorite BOOLEAN DEFAULT FALSE,
  
  -- Conversion
  added_to_cart BOOLEAN DEFAULT FALSE,
  purchased BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_custom_configs_user_id (user_id),
  INDEX idx_custom_configs_product_id (product_id)
);

-- ============================================================
-- AURORA AI SYSTEM TABLES
-- ============================================================

-- Aurora AI Fashion Context Profiles
CREATE TABLE IF NOT EXISTS aurora_user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Style Preferences
  personal_style_vector DECIMAL[] NOT NULL,
  comfort_level INTEGER CHECK (comfort_level BETWEEN 1 AND 10),
  boldness_score INTEGER CHECK (boldness_score BETWEEN 1 AND 10),
  color_palette TEXT[],
  body_preferences TEXT[],
  
  -- Measurements (Optional)
  height_cm DECIMAL(5,2),
  weight_kg DECIMAL(5,2),
  shoulder_cm DECIMAL(5,2),
  bust_cm DECIMAL(5,2),
  waist_cm DECIMAL(5,2),
  hip_cm DECIMAL(5,2),
  inseam_cm DECIMAL(5,2),
  
  -- Lifestyle Data
  lifestyle_tags TEXT[],
  occasion_preferences JSONB,
  weather_preferences JSONB,
  
  -- Aurora Interaction Data
  interaction_history JSONB DEFAULT '[]',
  preference_learning_data JSONB DEFAULT '{}',
  
  -- Privacy
  data_sharing_consent BOOLEAN DEFAULT FALSE,
  location_sharing BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_aurora_profiles_user_id (user_id)
);

-- Aurora AI Style Timeline (Evolution Tracking)
CREATE TABLE IF NOT EXISTS aurora_style_timelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Era Information
  era_name VARCHAR(200),
  start_date DATE,
  end_date DATE,
  
  -- Style Characteristics
  dominant_style VARCHAR(100),
  key_pieces UUID[],
  color_palette TEXT[],
  trends_adopted TEXT[],
  inspiration_sources TEXT[],
  
  -- Analysis
  confidence_score DECIMAL(3,2),
  defining_purchases UUID[],
  defining_outfits UUID[],
  
  -- Predictions
  predicted_next_style VARCHAR(100),
  predicted_next_date DATE,
  prediction_confidence DECIMAL(3,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_style_timelines_user_id (user_id),
  INDEX idx_style_timelines_dates (start_date, end_date)
);

-- Aurora Digital Twin Wardrobe
CREATE TABLE IF NOT EXISTS aurora_digital_wardrobe (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Garment Information
  garment_name VARCHAR(200),
  garment_type VARCHAR(100),
  color_hex CHAR(7),
  material_id UUID REFERENCES material_library(id),
  
  -- Digital Representation
  photos_url TEXT[],
  digital_model_3d_url VARCHAR(500),
  scanned_from_photos BOOLEAN DEFAULT FALSE,
  
  -- Garment Properties
  fit_data JSONB,
  care_instructions TEXT,
  material_properties JSONB,
  estimated_cost DECIMAL(10,2),
  
  -- Engagement
  last_worn_date DATE,
  wear_count INTEGER DEFAULT 0,
  compatibility_score DECIMAL(3,2),
  
  -- Sustainability
  sustainability_score INTEGER CHECK (sustainability_score BETWEEN 0 AND 100),
  environmental_impact JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_digital_wardrobe_user_id (user_id),
  INDEX idx_digital_wardrobe_last_worn (last_worn_date)
);

-- Aurora Outfit Recommendations
CREATE TABLE IF NOT EXISTS aurora_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Context
  occasion VARCHAR(100),
  context_data JSONB,
  weather_conditions JSONB,
  location_data JSONB,
  
  -- Recommendation
  outfit_items UUID[],
  recommendation_type VARCHAR(50),
  confidence_score DECIMAL(3,2),
  
  -- Emotional Analysis
  emotional_fit_analysis JSONB,
  predicted_mood_impact JSONB,
  
  -- Engagement
  was_viewed BOOLEAN DEFAULT FALSE,
  was_worn BOOLEAN DEFAULT FALSE,
  user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
  feedback JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  viewed_at TIMESTAMP WITH TIME ZONE,
  
  INDEX idx_aurora_recommendations_user_id (user_id),
  INDEX idx_aurora_recommendations_created_at (created_at)
);

-- Aurora AI Generated Fabrics
CREATE TABLE IF NOT EXISTS aurora_generated_fabrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_user_id UUID REFERENCES users(id),
  
  -- Fabric Details
  name VARCHAR(200) NOT NULL,
  description TEXT,
  base_material VARCHAR(100),
  
  -- AI Generation Parameters
  generation_params JSONB NOT NULL,
  inspiration_sources TEXT[],
  
  -- Visual Properties
  pattern_image_url VARCHAR(500),
  texture_preview_url VARCHAR(500),
  color_palette TEXT[],
  
  -- Material Properties
  pbr_material_data JSONB,
  physics_simulation JSONB,
  
  -- Production
  manufacturing_spec JSONB,
  estimated_cost DECIMAL(10,2),
  sustainability_score INTEGER CHECK (sustainability_score BETWEEN 0 AND 100),
  
  -- Engagement
  preview_on_garments JSONB DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_generated_fabrics_creator (creator_user_id),
  INDEX idx_generated_fabrics_created_at (created_at)
);

-- Aurora Collaborative Styling Rooms
CREATE TABLE IF NOT EXISTS aurora_styling_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_user_id UUID NOT NULL REFERENCES users(id),
  
  -- Room Configuration
  name VARCHAR(200),
  description TEXT,
  purpose VARCHAR(50),
  virtual_environment VARCHAR(50),
  
  -- Participants
  participants UUID[],
  max_participants INTEGER DEFAULT 10,
  is_public BOOLEAN DEFAULT FALSE,
  
  -- Content
  shared_outfits JSONB DEFAULT '[]',
  style_board JSONB DEFAULT '{}',
  final_looks JSONB DEFAULT '[]',
  
  -- Aurora AI
  aurora_ai_enabled BOOLEAN DEFAULT TRUE,
  aurora_ai_personality JSONB,
  ai_suggestions JSONB DEFAULT '[]',
  
  -- Shopping
  shopping_list_items UUID[],
  collaborative_cart JSONB DEFAULT '{}',
  
  -- Timeline
  session_start_at TIMESTAMP WITH TIME ZONE,
  session_end_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_styling_rooms_creator (creator_user_id),
  INDEX idx_styling_rooms_purpose (purpose),
  INDEX idx_styling_rooms_created_at (created_at)
);

-- Aurora Fashion Forecasts
CREATE TABLE IF NOT EXISTS aurora_fashion_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Predictions
  predicted_items JSONB NOT NULL,
  predicted_timeline JSONB,
  confidence_scores JSONB,
  trigger_events TEXT[],
  
  -- Analysis Data
  wardrobe_gap_analysis JSONB,
  wear_pattern_analysis JSONB,
  calendar_analysis JSONB,
  trend_adoption_analysis JSONB,
  weather_pattern_analysis JSONB,
  
  -- Preemptive Suggestions
  preemptive_suggestions UUID[],
  suggested_purchase_order JSONB,
  
  -- Engagement
  was_accepted BOOLEAN DEFAULT FALSE,
  items_purchased UUID[],
  forecast_accuracy_score DECIMAL(3,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  forecast_for_date DATE,
  
  INDEX idx_forecasts_user_id (user_id),
  INDEX idx_forecasts_date (forecast_for_date)
);

-- Aurora Emotional Fit Analysis
CREATE TABLE IF NOT EXISTS aurora_emotional_fit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  outfit_id UUID,
  
  -- Psychological Analysis
  confidence_boost INTEGER CHECK (confidence_boost BETWEEN 0 AND 100),
  authenticity_score INTEGER CHECK (authenticity_score BETWEEN 0 AND 100),
  mood_impact JSONB,
  memory_associations TEXT[],
  
  -- Social Perception
  perceived_personality TEXT[],
  appropriateness_score DECIMAL(3,2),
  attention_score DECIMAL(3,2),
  
  -- Body Image Impact
  perceived_body_changes JSONB,
  comfort_zones TEXT[],
  sensitive_areas TEXT[],
  
  -- AI Insights
  aurora_insights TEXT,
  recommended_adjustments JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_emotional_fit_user_id (user_id)
);

-- ============================================================
-- 3D ANALYTICS TABLES
-- ============================================================

-- 3D Interaction Analytics
CREATE TABLE IF NOT EXISTS analytics_3d_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(100) NOT NULL,
  user_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  model_id UUID REFERENCES product_3d_models(id),
  
  -- Interaction Types
  interaction_type VARCHAR(50) NOT NULL,
  interaction_data JSONB,
  
  -- Duration & Engagement
  duration_seconds INTEGER,
  view_count INTEGER DEFAULT 1,
  
  -- Device & Performance
  device_info JSONB,
  load_time_ms INTEGER,
  fps_average DECIMAL(5,2),
  memory_usage_mb DECIMAL(6,2),
  
  -- Conversion
  added_to_cart BOOLEAN DEFAULT FALSE,
  purchased BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_3d_analytics_product_id (product_id),
  INDEX idx_3d_analytics_created_at (created_at),
  INDEX idx_3d_analytics_interaction_type (interaction_type)
);

-- 3D Model Performance Analytics
CREATE TABLE IF NOT EXISTS analytics_3d_model_performance (
  model_id UUID PRIMARY KEY REFERENCES product_3d_models(id),
  analytics_date DATE NOT NULL,
  
  -- Engagement
  total_views INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,
  avg_view_duration_seconds DECIMAL(6,2),
  rotation_completion_rate DECIMAL(5,2),
  
  -- Customization
  customization_starts INTEGER DEFAULT 0,
  customization_completions INTEGER DEFAULT 0,
  most_popular_material_id UUID,
  
  -- AR
  ar_launches INTEGER DEFAULT 0,
  ar_screenshots INTEGER DEFAULT 0,
  ar_conversion_rate DECIMAL(5,2),
  
  -- Performance
  avg_load_time_ms INTEGER,
  error_rate DECIMAL(5,2),
  
  PRIMARY KEY (model_id, analytics_date)
);

-- Aurora AI Interaction Analytics
CREATE TABLE IF NOT EXISTS analytics_aurora_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(100),
  
  -- Interaction Type
  interaction_type VARCHAR(50),
  feature_used VARCHAR(100),
  
  -- Data
  query TEXT,
  response_quality DECIMAL(3,2),
  user_satisfaction INTEGER CHECK (user_satisfaction BETWEEN 1 AND 5),
  
  -- Outcome
  recommendation_followed BOOLEAN,
  purchase_result BOOLEAN,
  feedback JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_aurora_analytics_user_id (user_id),
  INDEX idx_aurora_analytics_created_at (created_at)
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX idx_product_3d_models_composite ON product_3d_models(product_id, variant_id, is_primary);
CREATE INDEX idx_customization_options_composite ON customization_options(template_id, part_id, is_available);
CREATE INDEX idx_aurora_recommendations_composite ON aurora_recommendations(user_id, created_at, was_viewed);
CREATE INDEX idx_ar_sessions_conversion ON ar_tryon_sessions(user_id, purchased, created_at);
CREATE INDEX idx_material_library_search ON material_library(material_type, sustainability_score);
CREATE INDEX idx_aurora_styling_rooms_active ON aurora_styling_rooms(is_public, session_start_at, session_end_at);

-- ============================================================
-- MATERIALIZED VIEWS FOR ANALYTICS
-- ============================================================

CREATE MATERIALIZED VIEW mv_3d_model_stats AS
SELECT 
  m.id,
  m.product_id,
  COUNT(DISTINCT a.session_id) as total_sessions,
  COUNT(DISTINCT a.user_id) as unique_users,
  AVG(a.duration_seconds) as avg_duration,
  SUM(CASE WHEN a.added_to_cart THEN 1 ELSE 0 END) as cart_additions,
  SUM(CASE WHEN a.purchased THEN 1 ELSE 0 END) as purchases,
  (SUM(CASE WHEN a.purchased THEN 1 ELSE 0 END)::DECIMAL / 
   NULLIF(COUNT(DISTINCT a.session_id), 0)) * 100 as conversion_rate
FROM product_3d_models m
LEFT JOIN analytics_3d_interactions a ON m.id = a.model_id
GROUP BY m.id, m.product_id;

CREATE INDEX idx_mv_3d_stats_product ON mv_3d_model_stats(product_id);

CREATE MATERIALIZED VIEW mv_aurora_user_insights AS
SELECT 
  u.id as user_id,
  COUNT(DISTINCT CASE WHEN r.was_worn THEN r.id END) as recommendations_followed,
  AVG(r.user_rating) as avg_recommendation_rating,
  COUNT(DISTINCT f.id) as total_forecasts,
  COUNT(DISTINCT CASE WHEN f.was_accepted THEN f.id END) as forecasts_accepted,
  COUNT(DISTINCT dw.id) as digital_wardrobe_items,
  AVG(dw.wear_count) as avg_wear_count
FROM users u
LEFT JOIN aurora_recommendations r ON u.id = r.user_id
LEFT JOIN aurora_fashion_forecasts f ON u.id = f.user_id
LEFT JOIN aurora_digital_wardrobe dw ON u.id = dw.user_id
GROUP BY u.id;

-- ============================================================
-- GRANTS & PERMISSIONS
-- ============================================================

GRANT SELECT, INSERT, UPDATE ON product_3d_models TO voguevault_app_role;
GRANT SELECT, INSERT, UPDATE ON material_library TO voguevault_app_role;
GRANT SELECT, INSERT, UPDATE ON customization_templates TO voguevault_app_role;
GRANT SELECT, INSERT, UPDATE ON customization_options TO voguevault_app_role;
GRANT SELECT, INSERT, UPDATE ON aurora_user_profiles TO voguevault_app_role;
GRANT SELECT, INSERT, UPDATE ON aurora_recommendations TO voguevault_app_role;
GRANT SELECT, INSERT, UPDATE ON analytics_3d_interactions TO voguevault_app_role;
GRANT SELECT, INSERT, UPDATE ON analytics_aurora_interactions TO voguevault_app_role;

-- End of Migration
