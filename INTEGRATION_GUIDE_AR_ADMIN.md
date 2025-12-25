# Integration Guide - AR & Admin Components

## Overview

This guide walks you through integrating the newly created AR try-on system and admin 3D asset management dashboard into your VogueVault application.

## Files Created

### Frontend Components
- **ARTryOn.tsx** - Full-screen AR experience component with WebXR support
- **Admin3DAssetManager.tsx** - Admin dashboard for managing 3D models and materials

### Backend API Routes
- **3d-models.routes.ts** - REST endpoints for 3D operations

## Part 1: AR Try-On Integration

### 1.1 Import the Component

```typescript
import { ARTryOn } from '@/components/3d/ARTryOn';
```

### 1.2 Add to Product Page

In your `ProductPage.tsx` or equivalent:

```typescript
'use client';

import React, { useState } from 'react';
import { ARTryOn } from '@/components/3d/ARTryOn';

export default function ProductPage({ params }: { params: { productId: string } }) {
  const [showARMode, setShowARMode] = useState(false);

  return (
    <div>
      {/* Existing product content */}
      
      {/* 3D Viewer Section */}
      <div className="my-8">
        <h2 className="text-2xl font-bold mb-4">Try In Augmented Reality</h2>
        
        <button
          onClick={() => setShowARMode(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          📱 Start AR Try-On
        </button>
      </div>

      {/* AR Modal */}
      {showARMode && (
        <ARTryOn
          modelUrl="/api/products/[productId]/3d-models/primary"
          productId={params.productId}
          productName="Product Name"
          onCapture={(imageData) => {
            // Save screenshot to user account or social share
            console.log('AR screenshot captured:', imageData);
          }}
          onClose={() => setShowARMode(false)}
        />
      )}
    </div>
  );
}
```

### 1.3 API Prerequisites

Ensure your backend has these endpoints:

```
GET  /api/products/:productId/3d-models
GET  /api/products/:productId/3d-models/primary
POST /api/admin/products/:productId/3d-models  (admin only)
```

See `3d-models.routes.ts` for implementation.

### 1.4 Features

The AR Try-On component provides:

- **WebXR Support**: Full immersive AR on supported devices (iOS 16+, Android with WebXR)
- **Fallback 3D Mode**: Three.js 3D viewer with mouse controls on unsupported devices
- **Fallback 2D Mode**: Camera video with basic AR overlay
- **Screenshot Capture**: Save AR session to database
- **Performance Optimized**: Draco compressed models, LOD variants
- **Mobile Responsive**: Full-screen mobile-optimized experience

### 1.5 Browser Support

| Device | Support | Experience |
|--------|---------|------------|
| iOS 16+ | ✅ Full WebXR | Immersive AR with hit-testing |
| Android (Chrome) | ✅ Full WebXR | Immersive AR with placement |
| Desktop | ⚠️ Limited | 3D viewer with mouse controls |
| Older Mobile | ⚠️ Fallback | 2D camera preview |

## Part 2: Admin 3D Asset Management

### 2.1 Import the Component

```typescript
import Admin3DAssetManager from '@/components/admin/Admin3DAssetManager';
```

### 2.2 Add to Admin Dashboard

In your admin panel layout:

```typescript
'use client';

import React from 'react';
import Admin3DAssetManager from '@/components/admin/Admin3DAssetManager';

export default function Admin3DPage() {
  return <Admin3DAssetManager />;
}
```

### 2.3 Router Setup

Add to your `next.config.ts` or routing:

```typescript
// pages/api/admin/3d-assets or app/admin/3d-assets

export default function AdminPage() {
  return <Admin3DAssetManager />;
}
```

### 2.4 Features

The admin dashboard includes three tabs:

#### **Tab 1: Model Uploads**
- Drag-and-drop file upload interface
- Batch upload support
- Product ID selection
- File validation (GLB, GLTF, FBX, max 100MB)
- Real-time upload progress
- Upload statistics

#### **Tab 2: Processing Queue**
- Real-time job status monitoring
- Processing progress bars
- Job filtering (all, pending, processing, completed, failed)
- Model compression statistics display
  - Vertex/triangle counts
  - Compression ratios
  - Processing time
- Delete completed models
- Error messages for failed jobs

#### **Tab 3: Material Library**
- Create new materials with:
  - Name, type (fabric, leather, metal, plastic, wood)
  - Base color picker
  - PBR properties (roughness, metallic)
  - Price per m²
  - Sustainability scoring (0-100)
- Browse existing materials
- Delete materials
- Real-time material list updates

### 2.5 API Prerequisites

Required endpoints:

```
POST   /api/admin/products/:productId/3d-models
DELETE /api/admin/3d-models/:modelId
POST   /api/admin/materials
GET    /api/materials
DELETE /api/admin/materials/:materialId
```

### 2.6 Authentication

Wrap the component with admin middleware:

```typescript
import { adminMiddleware } from '@/middleware/auth';

export const metadata = {
  title: '3D Asset Management'
};

export default function AdminPage() {
  // Authentication checked at route level via middleware
  return <Admin3DAssetManager />;
}
```

## Part 3: Database Schema Setup

### 3.1 Run Migration

Execute the database migration to create all necessary tables:

```bash
psql -U your_user -d your_database -f backend/database/migrations/003_add_3d_and_aurora_tables.sql
```

### 3.2 Verify Tables

Confirm these tables were created:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%3d%' OR table_name LIKE '%aurora%';
```

Expected tables:
- `product_3d_models`
- `material_library`
- `customization_templates`
- `customization_options`
- `user_custom_configurations`
- `aurora_user_profiles`
- `aurora_style_timelines`
- `aurora_digital_wardrobe`
- `aurora_recommendations`
- `aurora_generated_fabrics`
- `aurora_styling_rooms`
- `aurora_fashion_forecasts`
- Plus analytics and support tables

## Part 4: Backend Service Setup

### 4.1 Install Model Processor Service

The `ModelProcessorService` is already implemented. Register it in your dependency container:

```typescript
// services/service-locator.ts or DI container

import ModelProcessorService from '@/services/model-processor.service';

const services = {
  modelProcessor: new ModelProcessorService(cloudStorageClient),
};

export default services;
```

### 4.2 Cloud Storage Configuration

The `ModelProcessorService` needs cloud storage access:

```typescript
// Environment variables
CLOUD_STORAGE_PROVIDER=s3  // or cloudinary
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=voguevault-3d-models
S3_REGION=us-east-1
```

Or for Cloudinary:

```typescript
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### 4.3 API Routes

Copy the 3D models API routes to your backend:

```
backend/services/order-service/src/routes/3d-models.routes.ts
```

Register in your Express app:

```typescript
import threeDAuroraRoutes from './routes/3d-models.routes';

app.use('/api', threeDAuroraRoutes);
```

## Part 5: Material Customization Integration

The `MaterialCustomizer` component is ready to use:

```typescript
import { MaterialCustomizer } from '@/components/3d/MaterialCustomizer';

export default function ProductPage() {
  return (
    <div className="grid grid-cols-3 gap-6">
      <Product3DViewer
        modelUrl="/models/product.glb"
        productId="prod-123"
        onMaterialChange={(part, material) => {
          // Handle material change
        }}
      />
      
      <MaterialCustomizer
        productId="prod-123"
        templateId="template-456"
        onMaterialChange={(part, material) => {
          // Update 3D viewer
        }}
        onConfigurationChange={(config) => {
          // Save to cart/quote
        }}
      />
    </div>
  );
}
```

## Part 6: Testing Checklist

### AR Component Testing

- [ ] Test on iOS 16+ device (WebXR)
- [ ] Test on Android Chrome (WebXR)
- [ ] Test on desktop (3D fallback)
- [ ] Test camera permission flows
- [ ] Test screenshot capture
- [ ] Test model loading with Draco compression
- [ ] Test LOD switching on slow networks
- [ ] Verify touch controls on mobile

### Admin Component Testing

- [ ] Test file upload (drag-drop and click)
- [ ] Test batch upload (multiple files)
- [ ] Verify file validation (size, format)
- [ ] Test product ID selection
- [ ] Monitor processing queue in real-time
- [ ] Test job filtering
- [ ] Create and delete materials
- [ ] Verify statistics display
- [ ] Test error handling

### Database Testing

- [ ] Verify all tables created
- [ ] Test foreign key constraints
- [ ] Verify indexes created
- [ ] Test materialized views
- [ ] Test data insertion flow
- [ ] Check cascading deletes

## Part 7: Performance Optimization

### Model Optimization

1. **Compression**: Models are automatically Draco-compressed (10:1 typical)
2. **LOD System**: Three variants generated (high, medium, low)
3. **Texture Optimization**: Converted to WebP with resolution targeting
4. **CDN Delivery**: Serve from CloudFront/CloudFlare for global performance

### Frontend Optimization

```typescript
// Use lazy loading for AR component
const ARTryOn = dynamic(() => import('@/components/3d/ARTryOn'), {
  loading: () => <div>Loading AR...</div>,
  ssr: false // AR requires browser APIs
});
```

### Database Optimization

- All 3D model queries use composite indexes
- Analytics table includes materialized views for reporting
- Batch operations for bulk model imports

## Part 8: Monitoring & Analytics

### Track 3D Interactions

The system automatically logs:
- Model views and engagement duration
- Material customization usage
- AR session starts and completions
- Screenshot captures
- Performance metrics (FPS, load times)

Access analytics via:

```sql
SELECT * FROM analytics_3d_interactions 
WHERE product_id = 'your-product-id'
ORDER BY created_at DESC;
```

## Part 9: Troubleshooting

### Issue: "AR not available on this device"

**Solution**: Component automatically falls back to 3D mode. This is expected on:
- Older iOS (pre-16)
- Older Android devices
- Desktop browsers
- Devices without WebXR API

### Issue: "Model fails to load"

**Check**:
1. Model URL is accessible (CORS enabled)
2. File format is GLB/GLTF (not FBX from admin)
3. File size < 100MB
4. Cloud storage credentials configured

### Issue: "Processing job hangs"

**Solution**:
1. Check cloud storage connection
2. Monitor server disk space
3. Review processing timeout settings
4. Check logs for specific errors

### Issue: "Material customization not updating 3D model"

**Solution**:
1. Verify `onMaterialChange` callback is passed to MaterialCustomizer
2. Ensure Product3DViewer has direct reference to Three.js model
3. Check material exists in database
4. Verify material texture URLs are accessible

## Part 10: Deployment Checklist

- [ ] Run database migration on production
- [ ] Configure cloud storage credentials
- [ ] Set admin role permissions in auth system
- [ ] Update environment variables
- [ ] Test AR on staging environment
- [ ] Verify all API endpoints accessible
- [ ] Enable CORS for model domain
- [ ] Test file upload limits
- [ ] Configure CDN for model delivery
- [ ] Set up monitoring/alerting for job queue
- [ ] Document AR device compatibility
- [ ] Train admin staff on dashboard usage

## Support & Resources

- **Three.js Documentation**: https://threejs.org/docs/
- **React Three Fiber**: https://docs.pmnd.rs/react-three-fiber/
- **WebXR Specification**: https://immersive-web.github.io/
- **Draco Compression**: https://github.com/google/draco

## Next Steps

1. ✅ AR Try-On system implemented
2. ✅ Admin dashboard created
3. ⏭️ Run database migration
4. ⏭️ Deploy to staging
5. ⏭️ Test on real devices
6. ⏭️ Train admin staff
7. ⏭️ Monitor production usage
8. ⏭️ Implement 3D analytics dashboard (optional)
