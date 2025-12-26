'use client';

import { useState } from 'react';
import Link from 'next/link';

const DemoSection = ({ 
  title, 
  description, 
  children 
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

export default function DemoAllPage() {
  const [activeView, setActiveView] = useState('overview');

  const views = [
    { id: '3d-viewer', name: '3D Viewer', icon: '📦' },
    { id: 'material', name: 'Materials', icon: '✨' },
    { id: 'aurora', name: 'Aurora AI', icon: '🤖' },
    { id: 'ar', name: 'AR Try-On', icon: '📱' },
    { id: 'admin', name: 'Admin', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-4xl font-bold mb-2">VogueVault Demo</h1>
          <p className="text-gray-400">Explore all features and capabilities</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-gray-850 border-b border-gray-700 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex overflow-x-auto gap-2 py-4">
            <button
              onClick={() => setActiveView('overview')}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                activeView === 'overview'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Overview
            </button>
            {views.map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
                  activeView === view.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span>{view.icon}</span>
                {view.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {activeView === 'overview' && (
          <div className="space-y-8">
            <DemoSection
              title="VogueVault Feature Demo"
              description="Explore the cutting-edge features that power your personal AI fashion assistant"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-700 rounded-lg">
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <span>📦</span> 3D Product Viewer
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Interactive 3D model viewer with orbit controls, zoom, and pan capabilities.
                  </p>
                  <button
                    onClick={() => setActiveView('3d-viewer')}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                  >
                    View Demo →
                  </button>
                </div>

                <div className="p-6 bg-gray-700 rounded-lg">
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <span>✨</span> Material Customization
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Real-time material selection with live 3D preview and pricing.
                  </p>
                  <button
                    onClick={() => setActiveView('material')}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                  >
                    View Demo →
                  </button>
                </div>

                <div className="p-6 bg-gray-700 rounded-lg">
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <span>🤖</span> Aurora AI
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Intelligent conversational styling assistant with context-aware recommendations.
                  </p>
                  <button
                    onClick={() => setActiveView('aurora')}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                  >
                    View Demo →
                  </button>
                </div>

                <div className="p-6 bg-gray-700 rounded-lg">
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <span>📱</span> AR Try-On
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Browser-based augmented reality experience for virtual try-ons.
                  </p>
                  <button
                    onClick={() => setActiveView('ar')}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                  >
                    View Demo →
                  </button>
                </div>
              </div>
            </DemoSection>
          </div>
        )}

        {activeView === '3d-viewer' && (
          <DemoSection
            title="3D Product Viewer"
            description="Interactive 3D model viewer with full controls"
          >
            <div className="bg-gray-700 h-96 rounded flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl mb-4">📦</p>
                <p className="text-gray-300">3D Viewer Component</p>
                <p className="text-sm text-gray-400 mt-2">Loaded dynamically on demand</p>
              </div>
            </div>
          </DemoSection>
        )}

        {activeView === 'material' && (
          <DemoSection
            title="Material Customization"
            description="Real-time material selection with live preview and pricing"
          >
            <div className="bg-gray-700 h-96 rounded flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl mb-4">✨</p>
                <p className="text-gray-300">Material Customizer Component</p>
                <p className="text-sm text-gray-400 mt-2">Loaded dynamically on demand</p>
              </div>
            </div>
          </DemoSection>
        )}

        {activeView === 'aurora' && (
          <DemoSection
            title="Aurora AI - Fashion Co-Pilot"
            description="Intelligent styling assistant with context awareness"
          >
            <div className="bg-gray-700 h-96 rounded flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl mb-4">🤖</p>
                <p className="text-gray-300">Aurora AI Component</p>
                <p className="text-sm text-gray-400 mt-2">Loaded dynamically on demand</p>
              </div>
            </div>
          </DemoSection>
        )}

        {activeView === 'ar' && (
          <DemoSection
            title="AR Try-On Experience"
            description="Browser-based augmented reality with WebXR support"
          >
            <div className="bg-gray-700 h-96 rounded flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl mb-4">📱</p>
                <p className="text-gray-300">AR Try-On Component</p>
                <p className="text-sm text-gray-400 mt-2">Loaded dynamically on demand</p>
              </div>
            </div>
          </DemoSection>
        )}

        {activeView === 'admin' && (
          <DemoSection
            title="Admin Dashboard"
            description="Full asset management system for 3D models and materials"
          >
            <div className="bg-gray-700 h-96 rounded flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl mb-4">⚙️</p>
                <p className="text-gray-300">Admin Dashboard Component</p>
                <p className="text-sm text-gray-400 mt-2">Loaded dynamically on demand</p>
              </div>
            </div>
          </DemoSection>
        )}

        {/* Back Button */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
