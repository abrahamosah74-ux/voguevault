/**
 * Product 3D Viewer Component
 * Main component for displaying 3D models with interactive controls
 */

import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Environment,
  OrbitControls,
  PerspectiveCamera,
  useGLTF,
  useTexture,
  useAnimations,
  Html
} from '@react-three/drei';
import * as THREE from 'three';

interface Product3DViewerProps {
  modelUrl: string;
  productId: string;
  variantId?: string;
  onLoaded?: (model: THREE.Object3D) => void;
  onError?: (error: Error) => void;
  interactive?: boolean;
  autoRotate?: boolean;
  scale?: [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  environmentPreset?: 'studio' | 'city' | 'sunset' | 'dawn' | 'night' | 'warehouse' | 'forest' | 'apartment';
  onMaterialChange?: (part: string, material: any) => void;
  onInteraction?: (data: InteractionData) => void;
}

interface InteractionData {
  type: 'rotate' | 'zoom' | 'pan' | 'idle';
  duration: number;
  cameraPosition: [number, number, number];
  cameraRotation: [number, number, number];
}

/**
 * Main 3D Product Viewer Component
 */
export function Product3DViewer({
  modelUrl,
  productId,
  variantId,
  onLoaded,
  onError,
  interactive = true,
  autoRotate = false,
  scale = [1, 1, 1],
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  environmentPreset = 'studio',
  onMaterialChange,
  onInteraction
}: Product3DViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<THREE.Object3D | null>(null);
  const [fps, setFps] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleLoaded = (loadedModel: THREE.Object3D) => {
    setModel(loadedModel);
    setLoading(false);
    onLoaded?.(loadedModel);

    // Track view interaction
    onInteraction?.({
      type: 'idle',
      duration: 0,
      cameraPosition: [0, 0, 5],
      cameraRotation: [0, 0, 0]
    });
  };

  const handleError = (err: Error) => {
    setError(err.message);
    setLoading(false);
    onError?.(err);
  };

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-[600px] bg-gradient-to-b from-gray-900 to-black rounded-xl overflow-hidden"
    >
      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/70 font-medium">Loading 3D model...</p>
            <p className="text-white/50 text-sm mt-2">This may take a few seconds</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="text-center p-8 bg-red-900/80 rounded-lg max-w-md backdrop-blur-sm">
            <p className="text-white font-semibold mb-2">Failed to Load 3D Model</p>
            <p className="text-white/70 text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [5, 2, 5], fov: 50 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          precision: 'highp'
        }}
        className={`w-full h-full ${loading || error ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
      >
        <Suspense fallback={<LoadingFallback />}>
          {/* Lighting Setup */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
            shadow-camera-near={0.5}
            shadow-camera-far={50}
          />
          <pointLight position={[-10, -10, -10]} intensity={0.3} />

          {/* Product Model */}
          <ProductModel
            url={modelUrl}
            scale={scale}
            position={position}
            rotation={rotation}
            onLoad={handleLoaded}
            onError={handleError}
            onMaterialChange={onMaterialChange}
          />

          {/* Environment */}
          <Environment
            preset={environmentPreset}
            background={false}
            intensity={1.2}
          />

          {/* Floor with Shadow */}
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -1, 0]}
            receiveShadow
          >
            <planeGeometry args={[20, 20]} />
            <shadowMaterial transparent opacity={0.2} />
          </mesh>

          {/* Interaction Controls */}
          {interactive && (
            <>
              <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={1}
                maxDistance={15}
                autoRotate={autoRotate}
                autoRotateSpeed={4}
                dampingFactor={0.05}
                rotateSpeed={1}
              />
              <CameraRig autoRotate={autoRotate} />
              <InteractionTracker onInteraction={onInteraction} />
            </>
          )}

          {/* Post-processing Effects */}
          <EffectsComposer />
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      {!loading && !error && (
        <ViewerControls
          model={model}
          productId={productId}
          variantId={variantId}
          interactive={interactive}
          fps={fps}
        />
      )}

      {/* FPS Monitor (Development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-2 rounded text-xs font-mono">
          FPS: {fps.toFixed(0)}
        </div>
      )}
    </div>
  );
}

/**
 * Product Model Component - Loads and configures 3D model
 */
interface ProductModelProps {
  url: string;
  scale: [number, number, number];
  position: [number, number, number];
  rotation: [number, number, number];
  onLoad: (model: THREE.Object3D) => void;
  onError: (error: Error) => void;
  onMaterialChange?: (part: string, material: any) => void;
}

function ProductModel({
  url,
  scale,
  position,
  rotation,
  onLoad,
  onError,
  onMaterialChange
}: ProductModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [loadError, setLoadError] = useState<Error | null>(null);

  const { scene, animations } = useGLTF(url, true);
  const { actions } = useAnimations(animations, groupRef);

  useEffect(() => {
    try {
      // Clone scene to avoid mutations
      const clonedScene = scene.clone();

      // Configure model
      clonedScene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          // Store original material for customization
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.userData.originalMaterials = child.material.map(m => m.clone());
            } else {
              child.userData.originalMaterial = child.material.clone();
            }
            child.userData.materialId = `${child.name}-material`;
          }

          // Enable material customization
          child.userData.customizable = true;
        }
      });

      // Center and scale model
      const box = new THREE.Box3().setFromObject(clonedScene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z);
      const scaleValue = 2 / maxDim;

      clonedScene.position.multiplyScalar(-1);
      clonedScene.position.y -= center.y * scaleValue;
      clonedScene.scale.setScalar(scaleValue);

      // Apply custom scale and position
      clonedScene.scale.multiply(new THREE.Vector3(...scale));
      clonedScene.position.set(...position);
      clonedScene.rotation.order = 'YXZ';
      clonedScene.rotation.set(...rotation);

      onLoad(clonedScene);

      // Auto-play idle animation if available
      if (actions['idle']) {
        actions['idle'].play();
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error loading model');
      setLoadError(err);
      onError(err);
    }
  }, [scene, animations, actions, onLoad, onError, scale, position, rotation]);

  if (loadError) {
    throw loadError;
  }

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

/**
 * Camera Rig for smooth following motion
 */
interface CameraRigProps {
  autoRotate: boolean;
}

function CameraRig({ autoRotate }: CameraRigProps) {
  const { camera, mouse } = useThree();
  const targetPosition = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!autoRotate) {
      // Smooth camera follow on mouse movement
      targetPosition.current.x = mouse.x * 3;
      targetPosition.current.y = -mouse.y * 2;
      targetPosition.current.z = 5;

      camera.position.lerp(targetPosition.current, 0.05);
      camera.lookAt(0, 0, 0);
    }
  });

  return null;
}

/**
 * Track interactions and measure performance
 */
interface InteractionTrackerProps {
  onInteraction?: (data: InteractionData) => void;
}

function InteractionTracker({ onInteraction }: InteractionTrackerProps) {
  const { camera } = useThree();
  const interactionTimeRef = useRef(0);
  const lastEventTimeRef = useRef(Date.now());

  useFrame(() => {
    const now = Date.now();
    const timeSinceLastEvent = now - lastEventTimeRef.current;

    // Every 5 seconds, report interaction
    if (timeSinceLastEvent > 5000) {
      interactionTimeRef.current += timeSinceLastEvent;

      onInteraction?.({
        type: 'idle',
        duration: interactionTimeRef.current / 1000,
        cameraPosition: camera.position.toArray() as [number, number, number],
        cameraRotation: camera.rotation.toArray().slice(0, 3) as [number, number, number]
      });

      lastEventTimeRef.current = now;
    }
  });

  return null;
}

/**
 * Post-processing Effects (Bloom, etc.)
 */
function EffectsComposer() {
  // In production, use EffectComposer with various passes
  // For now, simple approach using built-in Three.js features
  return null;
}

/**
 * Loading Fallback
 */
function LoadingFallback() {
  return (
    <Html center>
      <div className="text-center">
        <div className="w-12 h-12 border-3 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    </Html>
  );
}

/**
 * Viewer Controls UI Overlay
 */
interface ViewerControlsProps {
  model: THREE.Object3D | null;
  productId: string;
  variantId?: string;
  interactive: boolean;
  fps: number;
}

function ViewerControls({
  model,
  productId,
  variantId,
  interactive,
  fps
}: ViewerControlsProps) {
  const [showInfo, setShowInfo] = useState(false);
  const [selectedView, setSelectedView] = useState<'front' | 'back' | 'side' | 'top'>('front');

  return (
    <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-4 px-4">
      {/* View Selector */}
      <div className="flex space-x-2 bg-black/50 backdrop-blur-sm rounded-full p-2">
        {(['front', 'back', 'side', 'top'] as const).map(view => (
          <button
            key={view}
            onClick={() => setSelectedView(view)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors capitalize ${
              selectedView === view
                ? 'bg-white text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {view}
          </button>
        ))}
      </div>

      {/* Info Toggle */}
      <button
        onClick={() => setShowInfo(!showInfo)}
        className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full font-medium shadow-lg hover:bg-white transition-colors"
      >
        ℹ️ Info
      </button>

      {/* Download Button */}
      <button
        onClick={() => alert('Download feature coming soon')}
        className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full font-medium shadow-lg hover:bg-white transition-colors"
      >
        ⬇️ Download
      </button>
    </div>
  );
}

export default Product3DViewer;
