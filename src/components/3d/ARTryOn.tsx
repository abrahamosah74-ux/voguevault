'use client';

import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';

interface ARTryOnProps {
  modelUrl: string;
  productId: string;
  productName: string;
  onCapture?: (imageData: string) => void;
  onClose?: () => void;
  fallbackWidth?: number;
  fallbackHeight?: number;
}

interface ARSession {
  id: string;
  startTime: Date;
  userAgent: string;
  measurements: { height: number; width: number };
}

/**
 * AR Try-On Component
 * Provides browser-based augmented reality experience using WebXR API
 * Falls back to 2D preview on devices without AR support
 */
export const ARTryOn: React.FC<ARTryOnProps> = ({
  modelUrl,
  productId,
  productName,
  onCapture,
  onClose,
  fallbackWidth = 640,
  fallbackHeight = 480
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<ARSession | null>(null);

  const [isARSupported, setIsARSupported] = useState(false);
  const [arMode, setARMode] = useState<'2d' | '3d' | 'webxr'>('2d');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [measurements, setMeasurements] = useState({ width: 0, height: 0 });
  const [captureReady, setCaptureReady] = useState(false);

  // Three.js references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  // Initialize AR capability detection
  useEffect(() => {
    const checkARSupport = async () => {
      try {
        // Check for WebXR support
        if (navigator.xr && navigator.xr.isSessionSupported) {
          const immersiveARSupported = await navigator.xr.isSessionSupported(
            'immersive-ar'
          );
          if (immersiveARSupported) {
            setIsARSupported(true);
            setARMode('webxr');
          } else {
            setARMode('3d');
          }
        } else {
          // Fallback to 3D or 2D
          setARMode('3d');
        }
      } catch (err) {
        console.warn('AR not fully supported, using 3D mode:', err);
        setARMode('3d');
      }
      setIsLoading(false);
    };

    checkARSupport();
  }, []);

  // Initialize camera and video stream for 2D/3D modes
  useEffect(() => {
    if ((arMode === '2d' || arMode === '3d') && !cameraActive) {
      initializeCamera();
    }

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [arMode, cameraActive]);

  // Initialize Three.js scene for 3D mode
  useEffect(() => {
    if ((arMode === '3d' || arMode === 'webxr') && containerRef.current && !rendererRef.current) {
      initialize3DScene();
    }

    return () => {
      cleanup3DScene();
    };
  }, [arMode]);

  /**
   * Initialize camera stream from user's device
   */
  const initializeCamera = async () => {
    try {
      setIsLoading(true);

      // Request camera access with environment mode for AR
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: fallbackWidth },
          height: { ideal: fallbackHeight }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          const width = videoRef.current!.videoWidth;
          const height = videoRef.current!.videoHeight;
          setMeasurements({ width, height });

          // Create AR session record
          sessionRef.current = {
            id: `ar-session-${Date.now()}`,
            startTime: new Date(),
            userAgent: navigator.userAgent,
            measurements: { width, height }
          };

          setCameraActive(true);
          setIsLoading(false);
          setCaptureReady(true);
        };

        videoRef.current.play().catch((err) => {
          setError('Failed to start camera: ' + err.message);
          setIsLoading(false);
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Camera access denied';
      setError(`Camera access failed: ${message}`);
      setIsLoading(false);
      // Fallback to 2D if 3D fails
      if (arMode === '3d') {
        setARMode('2d');
      }
    }
  };

  /**
   * Initialize Three.js 3D scene
   */
  const initialize3DScene = () => {
    if (!containerRef.current) return;

    try {
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      // Scene setup
      const scene = new THREE.Scene();
      scene.background = null; // Transparent for video background
      sceneRef.current = scene;

      // Camera setup
      const camera = new THREE.PerspectiveCamera(
        75,
        width / height,
        0.1,
        1000
      );
      camera.position.set(0, 0, 3);
      cameraRef.current = camera;

      // Renderer setup
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.shadowMap.enabled = true;
      containerRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 5, 5);
      directionalLight.castShadow = true;
      directionalLight.shadow.camera.far = 20;
      directionalLight.shadow.mapSize.width = 1024;
      directionalLight.shadow.mapSize.height = 1024;
      scene.add(directionalLight);

      // Floor plane for shadow
      const planeGeometry = new THREE.PlaneGeometry(10, 10);
      const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
      const plane = new THREE.Mesh(planeGeometry, planeMaterial);
      plane.rotation.x = -Math.PI / 2;
      plane.receiveShadow = true;
      scene.add(plane);

      // Load model
      loadModel(scene);

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);

        // Rotate model slightly for better visualization
        if (modelRef.current) {
          modelRef.current.rotation.y += 0.005;
        }

        renderer.render(scene, camera);
      };

      animate();

      // Handle window resize
      const handleResize = () => {
        if (containerRef.current && rendererRef.current && cameraRef.current) {
          const newWidth = containerRef.current.clientWidth;
          const newHeight = containerRef.current.clientHeight;

          (cameraRef.current as THREE.PerspectiveCamera).aspect = newWidth / newHeight;
          (cameraRef.current as THREE.PerspectiveCamera).updateProjectionMatrix();
          rendererRef.current.setSize(newWidth, newHeight);
        }
      };

      window.addEventListener('resize', handleResize);
      setIsLoading(false);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    } catch (err) {
      setError(`3D initialization failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  /**
   * Load GLTF/GLB model using GLTFLoader
   */
  const loadModel = async (scene: THREE.Scene) => {
    try {
      // Dynamic import to avoid SSR issues
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      const loader = new GLTFLoader();

      loader.load(
        modelUrl,
        (gltf) => {
          const model = gltf.scene;
          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
            }
          });

          // Center and scale model
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 2 / maxDim;
          model.scale.multiplyScalar(scale);

          const center = box.getCenter(new THREE.Vector3());
          model.position.sub(center);

          scene.add(model);
          modelRef.current = model;
          setModelLoaded(true);
        },
        (progress) => {
          // Loading progress
          const percentComplete = (progress.loaded / progress.total) * 100;
          console.log(`Model loading: ${percentComplete.toFixed(2)}%`);
        },
        (err) => {
          setError(`Failed to load model: ${err.message}`);
        }
      );
    } catch (err) {
      setError(`Model loader initialization failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  /**
   * Capture current frame to image
   */
  const captureFrame = () => {
    if (canvasRef.current && videoRef.current && cameraActive) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        canvasRef.current.width = measurements.width;
        canvasRef.current.height = measurements.height;

        ctx.drawImage(videoRef.current, 0, 0);

        // If 3D mode, overlay the Three.js canvas
        if (arMode === '3d' && rendererRef.current) {
          const renderer3DCanvas = rendererRef.current.domElement as HTMLCanvasElement;
          ctx.drawImage(renderer3DCanvas, 0, 0);
        }

        const imageData = canvasRef.current.toDataURL('image/jpeg', 0.9);

        // Save to database via callback
        if (onCapture) {
          onCapture(imageData);
        }

        // Show success feedback
        alert('Photo saved! You can now share your look.');
      }
    }
  };

  /**
   * Start WebXR session (for supported devices)
   */
  const startWebXRSession = async () => {
    if (!navigator.xr) {
      setError('WebXR not available on this device');
      return;
    }

    try {
      setIsLoading(true);

      const session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test', 'dom-overlay-for-handheld'],
        domOverlay: { root: document.body }
      });

      // Session started
      setARMode('webxr');
      setIsLoading(false);
      setCaptureReady(true);

      // Handle session end
      session.addEventListener('end', () => {
        setARMode('3d');
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'WebXR session failed';
      setError(`AR session error: ${message}`);
      setARMode('3d');
      setIsLoading(false);
    }
  };

  /**
   * Clean up Three.js resources
   */
  const cleanup3DScene = () => {
    if (rendererRef.current && containerRef.current) {
      containerRef.current.removeChild(rendererRef.current.domElement);
      rendererRef.current.dispose();
      rendererRef.current = null;
    }
    sceneRef.current = null;
    cameraRef.current = null;
    modelRef.current = null;
  };

  /**
   * Handle mouse movement for model rotation (3D mode)
   */
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (arMode === '3d' && containerRef.current && modelRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - rect.left) / rect.width * 2 - 1;
      mouseRef.current.y = -(e.clientY - rect.top) / rect.height * 2 + 1;

      // Rotate model based on mouse
      modelRef.current.rotation.x = mouseRef.current.y * 0.5;
      modelRef.current.rotation.y = mouseRef.current.x * 0.5;
    }
  };

  // Render based on AR mode
  const renderContent = () => {
    switch (arMode) {
      case 'webxr':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white bg-black/50 p-6 rounded-lg">
              <div className="mb-4">
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
              <p className="text-lg font-semibold mb-2">AR Mode Active</p>
              <p className="text-sm">Position the device and tap to place the product</p>
            </div>
          </div>
        );

      case '3d':
        return (
          <>
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              playsInline
            />
            <div
              ref={containerRef}
              className="absolute inset-0"
              onMouseMove={handleMouseMove}
              style={{
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0))'
              }}
            />
            {!modelLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="text-center text-white">
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p>Loading 3D model...</p>
                </div>
              </div>
            )}
          </>
        );

      case '2d':
      default:
        return (
          <div className="relative w-full h-full bg-gray-900">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
            />
            {!cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center text-white">
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
                  <p>Requesting camera access...</p>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* AR View */}
      <div
        className="flex-1 relative overflow-hidden"
        onMouseMove={handleMouseMove}
      >
        {renderContent()}

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
            <div className="text-center text-white">
              <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
              <p className="text-lg font-semibold">Initializing AR...</p>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="absolute top-4 left-4 right-4 bg-red-500/90 text-white p-4 rounded-lg z-10">
            <p className="font-semibold mb-2">Error</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Control Bar */}
      <div className="bg-black/90 border-t border-gray-700 px-4 py-4 flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-white font-semibold">{productName}</h3>
          <p className="text-gray-400 text-sm">
            {arMode === 'webxr' && 'AR Mode - Move phone to view'}
            {arMode === '3d' && 'Move mouse to rotate'}
            {arMode === '2d' && 'Camera view'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode selector */}
          {!isARSupported && arMode !== '2d' && (
            <button
              onClick={() => setARMode('2d')}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm transition"
            >
              Basic Mode
            </button>
          )}

          {isARSupported && arMode !== 'webxr' && (
            <button
              onClick={startWebXRSession}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-2 rounded text-sm transition"
            >
              {isLoading ? 'Starting...' : 'Start AR'}
            </button>
          )}

          {/* Capture button */}
          <button
            onClick={captureFrame}
            disabled={!captureReady}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded font-semibold transition flex items-center gap-2"
          >
            <span>📸</span>
            {isLoading ? 'Loading...' : 'Capture'}
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm transition"
          >
            ✕ Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ARTryOn;
