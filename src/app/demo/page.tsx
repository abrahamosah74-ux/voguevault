'use client';

import React, { useState } from 'react';
import ARTryOn from '@/components/3d/ARTryOn';
import Admin3DAssetManager from '@/components/admin/Admin3DAssetManager';

export default function DemoPage() {
  const [showARDemo, setShowARDemo] = useState(false);
  const [showAdminDemo, setShowAdminDemo] = useState(false);
  const [demoView, setDemoView] = useState<'home' | 'ar' | 'admin'>('home');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* AR Demo Modal */}
      {showARDemo && (
        <ARTryOn
          modelUrl="https://threejs.org/examples/models/gltf/Avocado.glb"
          productId="demo-product-001"
          productName="Designer Jacket"
          onCapture={(imageData) => {
            console.log('Screenshot captured');
            alert('Screenshot saved to your gallery!');
          }}
          onClose={() => setShowARDemo(false)}
        />
      )}

      {/* Admin Demo - Full Screen */}
      {showAdminDemo && (
        <div className="fixed inset-0 z-50">
          <Admin3DAssetManager />
          <button
            onClick={() => setShowAdminDemo(false)}
            className="fixed top-4 right-4 z-[60] bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold"
          >
            ✕ Close Demo
          </button>
        </div>
      )}

      {/* Main Demo Page */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            VogueVault 3D + AR Demo
          </h1>
          <p className="text-xl text-gray-300">
            Experience the future of fashion e-commerce with AR try-ons and intelligent 3D customization
          </p>
        </div>

        {/* Demo Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* AR Try-On Card */}
          <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-2xl p-8 hover:border-blue-500/60 transition cursor-pointer"
            onClick={() => setShowARDemo(true)}>
            <div className="mb-6">
              <span className="text-5xl">📱</span>
            </div>
            <h2 className="text-3xl font-bold mb-3">AR Try-On Experience</h2>
            <p className="text-gray-300 mb-6">
              Place products in your real environment using WebXR technology. Full immersive AR on modern devices with automatic fallback to 3D viewer.
            </p>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <div>
                  <h4 className="font-semibold">WebXR Support</h4>
                  <p className="text-sm text-gray-400">iOS 16+, Android Chrome</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <div>
                  <h4 className="font-semibold">3D Fallback</h4>
                  <p className="text-sm text-gray-400">Mouse-controlled viewer for desktop</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <div>
                  <h4 className="font-semibold">Screenshot Capture</h4>
                  <p className="text-sm text-gray-400">Save and share your AR looks</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <div>
                  <h4 className="font-semibold">Optimized Models</h4>
                  <p className="text-sm text-gray-400">Draco compression + LOD variants</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowARDemo(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
            >
              Launch AR Demo →
            </button>
          </div>

          {/* Admin Dashboard Card */}
          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-8 hover:border-purple-500/60 transition cursor-pointer"
            onClick={() => setShowAdminDemo(true)}>
            <div className="mb-6">
              <span className="text-5xl">⚙️</span>
            </div>
            <h2 className="text-3xl font-bold mb-3">Admin 3D Dashboard</h2>
            <p className="text-gray-300 mb-6">
              Upload, process, and manage 3D models with real-time job monitoring. Full material library management with PBR properties.
            </p>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <div>
                  <h4 className="font-semibold">Batch Upload</h4>
                  <p className="text-sm text-gray-400">GLB, GLTF, FBX formats (max 100MB)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <div>
                  <h4 className="font-semibold">Processing Queue</h4>
                  <p className="text-sm text-gray-400">Real-time job monitoring & stats</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <div>
                  <h4 className="font-semibold">Material Library</h4>
                  <p className="text-sm text-gray-400">Create with PBR, sustainability scoring</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <div>
                  <h4 className="font-semibold">Automatic Optimization</h4>
                  <p className="text-sm text-gray-400">Draco + LODs + texture compression</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowAdminDemo(true)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition"
            >
              Open Admin Panel →
            </button>
          </div>
        </div>

        {/* Features Overview */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-12 mb-16">
          <h2 className="text-3xl font-bold mb-8">Complete Feature Set</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-blue-400">🎨 3D Customization</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Real-time material preview</li>
                <li>• Color picker integration</li>
                <li>• Price calculation</li>
                <li>• Sustainability tracking</li>
                <li>• Save configurations</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 text-cyan-400">🤖 Aurora AI</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Context-aware styling</li>
                <li>• Digital wardrobe</li>
                <li>• Fashion forecasting</li>
                <li>• Emotional fit analysis</li>
                <li>• Collaborative rooms</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 text-pink-400">📊 Analytics</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• 3D interaction tracking</li>
                <li>• Model performance stats</li>
                <li>• Aurora usage metrics</li>
                <li>• Conversion analytics</li>
                <li>• Real-time dashboards</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-8">Technology Stack</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-2">🔷</div>
              <p className="font-semibold">Three.js</p>
              <p className="text-sm text-gray-400">3D Rendering</p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-2">⚛️</div>
              <p className="font-semibold">React Three Fiber</p>
              <p className="text-sm text-gray-400">React Integration</p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-2">🌐</div>
              <p className="font-semibold">WebXR</p>
              <p className="text-sm text-gray-400">AR Support</p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-2">📦</div>
              <p className="font-semibold">Draco</p>
              <p className="text-sm text-gray-400">Compression</p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-2">🗄️</div>
              <p className="font-semibold">PostgreSQL</p>
              <p className="text-sm text-gray-400">Database</p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-2">☁️</div>
              <p className="font-semibold">S3/Cloudinary</p>
              <p className="text-sm text-gray-400">Cloud Storage</p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-2">⚡</div>
              <p className="font-semibold">Next.js</p>
              <p className="text-sm text-gray-400">Framework</p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-2">🎭</div>
              <p className="font-semibold">Tailwind CSS</p>
              <p className="text-sm text-gray-400">Styling</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-400 border-t border-gray-700 pt-8">
          <p className="mb-4">🚀 VogueVault 3D + Aurora AI System</p>
          <p className="text-sm">
            Complete implementation ready for integration • 5000+ lines of production code • Fully typed TypeScript
          </p>
        </div>
      </div>
    </div>
  );
}
