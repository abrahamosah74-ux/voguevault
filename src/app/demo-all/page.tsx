'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import components to avoid SSR issues
const Product3DViewer = dynamic(() => import('@/components/3d/Product3DViewer'), {
  loading: () => <div className="bg-gray-800 h-96 flex items-center justify-center text-gray-400">Loading 3D Viewer...</div>,
  ssr: false
});

const MaterialCustomizer = dynamic(() => import('@/components/3d/MaterialCustomizer'), {
  loading: () => <div className="bg-gray-800 h-96 flex items-center justify-center text-gray-400">Loading Material Customizer...</div>,
  ssr: false
});

const AuroraInterface = dynamic(() => import('@/components/aurora/AuroraInterface'), {
  loading: () => <div className="bg-gray-800 h-96 flex items-center justify-center text-gray-400">Loading Aurora AI...</div>,
  ssr: false
});

const ARTryOn = dynamic(() => import('@/components/3d/ARTryOn'), {
  ssr: false
});

const Admin3DAssetManager = dynamic(() => import('@/components/admin/Admin3DAssetManager'), {
  loading: () => <div className="bg-gray-900 h-screen flex items-center justify-center text-gray-400">Loading Admin Dashboard...</div>,
  ssr: false
});

export default function ComprehensiveDemoPage() {
  const [activeView, setActiveView] = useState<
    '3d-viewer' | 'material-customizer' | 'aurora-ai' | 'ar-tryon' | 'admin-dashboard' | 'all'
  >('all');
  const [showARModal, setShowARModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  const DemoSection = ({
    title,
    description,
    children,
  }: {
    title: string;
    description: string;
    children: React.ReactNode;
  }) => (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-blue-100">{description}</p>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            VogueVault 3D + Aurora AI Showcase
          </h1>
          <p className="text-gray-400">Complete demo of all 3D visualization, customization, and AI styling components</p>

          {/* View Selector */}
          <div className="flex gap-2 mt-6 flex-wrap">
            {[
              { id: 'all', label: '🎨 All Components' },
              { id: '3d-viewer', label: '📦 3D Viewer' },
              { id: 'material-customizer', label: '🎨 Materials' },
              { id: 'aurora-ai', label: '✨ Aurora AI' },
              { id: 'ar-tryon', label: '📱 AR Try-On' },
              { id: 'admin-dashboard', label: '⚙️ Admin' }
            ].map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id as any)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  activeView === view.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* All Components View */}
        {activeView === 'all' && (
          <div className="space-y-8">
            {/* 1. 3D Viewer */}
            <DemoSection
              title="3D Product Viewer"
              description="Interactive 3D model viewer with orbit controls, zoom, and pan. Supports GLB/GLTF with automatic compression and LOD variants."
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700 h-96">
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <p className="text-4xl mb-2">📦</p>
                      <p>3D Model Preview</p>
                      <p className="text-sm text-gray-600 mt-2">
                        Place your GLB/GLTF model here
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Features</h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>✓ Orbit controls with mouse/touch</li>
                      <li>✓ Zoom and pan functionality</li>
                      <li>✓ Performance monitoring (FPS)</li>
                      <li>✓ Automatic LOD switching</li>
                      <li>✓ Material customization hooks</li>
                      <li>✓ Responsive sizing</li>
                      <li>✓ Error handling & fallbacks</li>
                      <li>✓ Shadow mapping enabled</li>
                    </ul>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <p className="text-sm text-gray-400">
                      <strong>Technology:</strong> Three.js + React Three Fiber + Drei
                    </p>
                  </div>
                </div>
              </div>
            </DemoSection>

            {/* 2. Material Customizer */}
            <DemoSection
              title="Material Customization System"
              description="Real-time material selection with live 3D preview, pricing, and sustainability metrics."
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Tab 1: Materials</h3>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { name: 'Silk', color: '#E8D5C4' },
                        { name: 'Leather', color: '#3E2723' },
                        { name: 'Cotton', color: '#F5F5F5' },
                        { name: 'Wool', color: '#8B7355' }
                      ].map((material) => (
                        <div key={material.name} className="text-center">
                          <div
                            className="w-full h-24 rounded-lg border-2 border-gray-600 mb-2 hover:border-blue-400 cursor-pointer transition"
                            style={{ backgroundColor: material.color }}
                          />
                          <p className="text-xs font-medium">{material.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Tab 2: Preview</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {['Color', 'Roughness', 'Metallic'].map((prop) => (
                        <div key={prop} className="bg-gray-600 rounded p-3 text-center text-sm">
                          {prop}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Tab 3: Pricing</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Base Price:</span>
                        <span className="font-semibold">$49.99</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Material Add-on:</span>
                        <span className="font-semibold">+$15.00</span>
                      </div>
                      <div className="border-t border-gray-600 pt-2 flex justify-between font-bold">
                        <span>Total:</span>
                        <span>$64.99</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4 h-fit">
                  <h3 className="font-semibold mb-3">Features</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>✓ Real-time 3D updates</li>
                    <li>✓ Material swatches</li>
                    <li>✓ Price calculations</li>
                    <li>✓ Sustainability data</li>
                    <li>✓ PBR properties</li>
                    <li>✓ Color hex codes</li>
                    <li>✓ Add to cart</li>
                    <li>✓ Save configuration</li>
                  </ul>
                </div>
              </div>
            </DemoSection>

            {/* 3. Aurora AI */}
            <DemoSection
              title="Aurora AI - Fashion Co-Pilot"
              description="Intelligent conversational styling assistant with context-aware outfit recommendations and emotional fit analysis."
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gray-700/30 rounded-lg p-4 h-96 overflow-y-auto">
                  <div className="space-y-4">
                    {/* Context Builder Message */}
                    <div className="flex justify-end">
                      <div className="bg-blue-600 rounded-lg p-3 max-w-xs text-sm">
                        <p>Hi Aurora! I have a business meeting today and it's cold outside</p>
                      </div>
                    </div>

                    {/* Aurora Response */}
                    <div className="flex justify-start">
                      <div className="bg-gray-600 rounded-lg p-3 max-w-xs text-sm">
                        <p className="mb-2">✨ Perfect! Based on your context, here are my top 3 recommendations:</p>
                        <div className="bg-gray-700 rounded p-2 text-xs">
                          <p className="font-semibold mb-1">Look 1: Professional Winter</p>
                          <p>Navy blazer + white shirt + wool trousers + leather boots</p>
                        </div>
                      </div>
                    </div>

                    {/* Quick Prompts */}
                    <div className="flex gap-2 justify-center flex-wrap mt-4">
                      {['Work Outfit', 'Beach Look', 'Party Ready'].map((prompt) => (
                        <button
                          key={prompt}
                          className="bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded text-sm transition"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Context Builder</h3>
                    <div className="space-y-2 text-sm">
                      <div className="bg-gray-600 rounded p-2">Occasion: Business</div>
                      <div className="bg-gray-600 rounded p-2">Weather: Cold</div>
                      <div className="bg-gray-600 rounded p-2">Time: Afternoon</div>
                    </div>
                  </div>

                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Features</h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>✓ Context-aware generation</li>
                      <li>✓ Emotional fit scoring</li>
                      <li>✓ Digital wardrobe</li>
                      <li>✓ Style evolution</li>
                      <li>✓ Fashion forecasting</li>
                      <li>✓ Collaborative rooms</li>
                      <li>✓ Material alchemy</li>
                      <li>✓ Natural language</li>
                    </ul>
                  </div>
                </div>
              </div>
            </DemoSection>

            {/* 4. AR Try-On */}
            <DemoSection
              title="AR Try-On Experience"
              description="Browser-based augmented reality with WebXR support and graceful fallbacks for all devices."
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="bg-black rounded-lg overflow-hidden border border-gray-700 h-96 flex flex-col">
                    <div className="flex-1 bg-gradient-to-b from-gray-800 to-black flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-6xl mb-4">📱</p>
                        <p className="text-gray-400 text-lg">AR Preview Area</p>
                        <p className="text-gray-600 text-sm mt-2">
                          Shows 3D model over camera feed
                        </p>
                      </div>
                    </div>
                    <div className="bg-black/90 border-t border-gray-700 px-4 py-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Product Name</h3>
                        <p className="text-sm text-gray-400">Move mouse to rotate</p>
                      </div>
                      <div className="flex gap-3">
                        <button className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-sm transition">
                          Basic Mode
                        </button>
                        <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold transition">
                          📸 Capture
                        </button>
                        <button className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-sm transition">
                          ✕ Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Device Support</h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>✓ iOS 16+ (WebXR)</li>
                      <li>✓ Android (WebXR)</li>
                      <li>✓ Desktop (3D)</li>
                      <li>✓ Legacy (2D)</li>
                    </ul>
                  </div>

                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Features</h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>✓ WebXR immersive AR</li>
                      <li>✓ Hit testing & placement</li>
                      <li>✓ 3D fallback mode</li>
                      <li>✓ Screenshot capture</li>
                      <li>✓ Mobile optimized</li>
                      <li>✓ Draco compression</li>
                      <li>✓ LOD variants</li>
                      <li>✓ Performance monitoring</li>
                    </ul>
                  </div>

                  <button
                    onClick={() => setShowARModal(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded font-semibold transition"
                  >
                    🚀 Launch AR Demo
                  </button>
                </div>
              </div>
            </DemoSection>

            {/* 5. Admin Dashboard */}
            <DemoSection
              title="Admin 3D Asset Management"
              description="Complete backend for uploading, processing, and managing 3D models and materials."
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-3 gap-4">
                    {/* Tab 1 */}
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <h3 className="font-semibold mb-3 text-center">📦 Uploads</h3>
                      <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center text-sm">
                        <p>Drop files here</p>
                        <p className="text-gray-600 mt-1">GLB, GLTF, FBX</p>
                        <p className="text-gray-600">Max 100MB</p>
                      </div>
                    </div>

                    {/* Tab 2 */}
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <h3 className="font-semibold mb-3 text-center">⚙️ Queue</h3>
                      <div className="space-y-2">
                        <div className="bg-gray-600 rounded p-2 text-xs">
                          <p className="font-semibold mb-1">Model 1</p>
                          <div className="w-full bg-gray-700 rounded h-2 overflow-hidden">
                            <div className="bg-green-500 h-full" style={{ width: '100%' }} />
                          </div>
                          <p className="text-gray-400 mt-1">Completed ✓</p>
                        </div>
                        <div className="bg-gray-600 rounded p-2 text-xs">
                          <p className="font-semibold mb-1">Model 2</p>
                          <div className="w-full bg-gray-700 rounded h-2 overflow-hidden">
                            <div className="bg-blue-500 h-full" style={{ width: '60%' }} />
                          </div>
                          <p className="text-gray-400 mt-1">Processing...</p>
                        </div>
                      </div>
                    </div>

                    {/* Tab 3 */}
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <h3 className="font-semibold mb-3 text-center">🎨 Materials</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { name: 'Silk', color: '#E8D5C4' },
                          { name: 'Leather', color: '#3E2723' }
                        ].map((mat) => (
                          <div key={mat.name} className="text-center text-xs">
                            <div
                              className="w-full h-16 rounded mb-1 border border-gray-600"
                              style={{ backgroundColor: mat.color }}
                            />
                            <p className="font-medium">{mat.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowAdminModal(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded font-semibold mt-6 transition"
                  >
                    ⚙️ Open Full Admin Panel
                  </button>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4 h-fit">
                  <h3 className="font-semibold mb-3">Features</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>✓ Drag-drop upload</li>
                    <li>✓ Batch processing</li>
                    <li>✓ Job queue monitoring</li>
                    <li>✓ Real-time progress</li>
                    <li>✓ Stats display</li>
                    <li>✓ Material CRUD</li>
                    <li>✓ Color picker</li>
                    <li>✓ PBR properties</li>
                    <li>✓ Sustainability scoring</li>
                    <li>✓ Error handling</li>
                  </ul>
                </div>
              </div>
            </DemoSection>

            {/* Tech Stack Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: 'Database',
                  items: ['PostgreSQL', '24 Tables', '200+ Indexes', 'Materialized Views']
                },
                {
                  title: 'Backend',
                  items: ['Node.js', 'Express', 'TypeScript', 'Services']
                },
                {
                  title: 'Frontend',
                  items: ['React', 'Next.js', 'Three.js', 'Tailwind CSS']
                },
                {
                  title: '3D/AR',
                  items: ['React Three Fiber', 'WebXR API', 'Draco', 'LOD System']
                }
              ].map((stack) => (
                <div key={stack.title} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h3 className="font-bold text-blue-400 mb-3">{stack.title}</h3>
                  <ul className="space-y-1 text-sm text-gray-300">
                    {stack.items.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Individual Component Views */}
        {activeView === '3d-viewer' && (
          <DemoSection
            title="3D Product Viewer"
            description="Interactive 3D model with full controls and performance monitoring"
          >
            <div className="h-96 bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-center">
              <div className="text-center">
                <p className="text-4xl mb-4">📦</p>
                <p className="text-gray-400">3D Viewer Component</p>
                <p className="text-gray-600 text-sm mt-2">Load your GLB/GLTF model</p>
              </div>
            </div>
          </DemoSection>
        )}

        {activeView === 'material-customizer' && (
          <DemoSection
            title="Material Customization"
            description="Real-time material selection with live preview and pricing"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-gray-700/50 rounded-lg p-6">
                  <h3 className="font-semibold mb-4">Select Material</h3>
                  <div className="grid grid-cols-4 gap-4">
                    {['Silk', 'Cotton', 'Leather', 'Wool', 'Linen', 'Polyester', 'Nylon', 'Spandex'].map(
                      (mat) => (
                        <div key={mat} className="text-center cursor-pointer">
                          <div className="bg-gradient-to-br from-blue-500 to-purple-500 w-full h-20 rounded-lg mb-2 hover:shadow-lg hover:shadow-blue-500/50 transition" />
                          <p className="text-sm font-medium">{mat}</p>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Color</h3>
                    <input type="color" className="w-full h-20 rounded cursor-pointer" defaultValue="#4F46E5" />
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Roughness</h3>
                    <input type="range" min="0" max="1" step="0.1" className="w-full" defaultValue="0.5" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-6 h-fit">
                <h3 className="font-semibold mb-4">Price Breakdown</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Base Price:</span>
                    <span className="font-semibold">$49.99</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Material:</span>
                    <span className="font-semibold">+$20.00</span>
                  </div>
                  <div className="border-t border-gray-600 pt-3 flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-green-400">$69.99</span>
                  </div>
                </div>
              </div>
            </div>
          </DemoSection>
        )}

        {activeView === 'aurora-ai' && (
          <DemoSection
            title="Aurora AI - Fashion Co-Pilot"
            description="Intelligent styling assistant with context awareness"
          >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Context Builder */}
              <div className="bg-gray-700/50 rounded-lg p-6">
                <h3 className="font-semibold mb-4">Context</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Occasion</label>
                    <select className="w-full bg-gray-600 rounded px-3 py-2 text-sm">
                      <option>Business</option>
                      <option>Casual</option>
                      <option>Formal</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Weather</label>
                    <select className="w-full bg-gray-600 rounded px-3 py-2 text-sm">
                      <option>Cold</option>
                      <option>Warm</option>
                      <option>Rainy</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Time</label>
                    <select className="w-full bg-gray-600 rounded px-3 py-2 text-sm">
                      <option>Morning</option>
                      <option>Afternoon</option>
                      <option>Evening</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Chat Area */}
              <div className="lg:col-span-3 bg-gray-700/50 rounded-lg p-6 h-96 overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <div className="bg-blue-600 rounded-lg p-3 max-w-sm">
                      <p className="text-sm">Hi Aurora! Help me find an outfit for a business meeting</p>
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="bg-gray-600 rounded-lg p-3 max-w-sm">
                      <p className="text-sm mb-3">
                        ✨ <strong>Perfect!</strong> I've analyzed your style profile and current wardrobe.
                      </p>
                      <div className="bg-gray-700 rounded p-2">
                        <p className="text-xs font-semibold mb-1">Recommended Look 1</p>
                        <p className="text-xs">Navy blazer + white shirt + black trousers</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-center flex-wrap">
                    {['Work Outfit', 'Beach Look', 'Party Ready', 'Casual Friday'].map((prompt) => (
                      <button
                        key={prompt}
                        className="bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded text-xs transition"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </DemoSection>
        )}

        {activeView === 'ar-tryon' && (
          <DemoSection
            title="AR Try-On"
            description="Immersive augmented reality experience"
          >
            <div className="bg-black rounded-lg overflow-hidden border border-gray-700 h-96 flex flex-col">
              <div className="flex-1 bg-gradient-to-b from-blue-900 to-black flex items-center justify-center">
                <div className="text-center">
                  <p className="text-6xl mb-4">🥽</p>
                  <p className="text-gray-300 text-lg">AR Preview</p>
                  <p className="text-gray-600 text-sm mt-2">Launch AR from mobile device</p>
                </div>
              </div>
              <div className="bg-black/90 border-t border-gray-700 px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Product Name</h3>
                  <p className="text-sm text-gray-400">AR Mode - Available on iOS 16+, Android</p>
                </div>
                <button
                  onClick={() => setShowARModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-semibold transition"
                >
                  🚀 Launch AR
                </button>
              </div>
            </div>
          </DemoSection>
        )}

        {activeView === 'admin-dashboard' && (
          <DemoSection
            title="Admin Dashboard"
            description="Full asset management system"
          >
            <button
              onClick={() => setShowAdminModal(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-4 rounded-lg font-semibold transition text-lg"
            >
              ⚙️ Open Admin Dashboard
            </button>
          </DemoSection>
        )}
      </div>

      {/* AR Modal */}
      {showARModal && (
        <div className="fixed inset-0 z-50">
          <ARTryOn
            modelUrl="https://threejs.org/examples/models/gltf/Duck/glTF/Duck.gltf"
            productId="demo-product"
            productName="Demo Product"
            onCapture={(imageData) => {
              console.log('Captured AR screenshot');
              alert('Screenshot saved!');
            }}
            onClose={() => setShowARModal(false)}
          />
        </div>
      )}

      {/* Admin Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="min-h-screen">
            <Admin3DAssetManager />
          </div>
          <button
            onClick={() => setShowAdminModal(false)}
            className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            Close Admin Panel
          </button>
        </div>
      )}
    </div>
  );
}
