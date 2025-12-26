'use client';

import Link from 'next/link';

export default function About() {
  return (
    <div className="min-h-screen bg-white dark:bg-black py-20 sm:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-6">
            About VogueVault
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Your personal AI fashion consultant, powered by Aurora AI
          </p>
        </div>

        {/* Mission */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">Our Mission</h2>
          <p className="text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
            At VogueVault, we believe fashion should be personal, sustainable, and empowering. Our mission is to use advanced AI technology to help you discover your unique style and build a wardrobe that truly reflects who you are.
          </p>
          <p className="text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed">
            We combine cutting-edge machine learning with fashion expertise to provide intelligent outfit recommendations, style insights, and personalized suggestions that match your personality, lifestyle, and mood.
          </p>
        </section>

        {/* Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">Core Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">✨ Smart Recommendations</h3>
              <p className="text-zinc-700 dark:text-zinc-300">
                Aurora AI analyzes your style preferences and suggests outfits tailored to weather, occasion, and your personal aesthetic.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">🎯 Wardrobe Analysis</h3>
              <p className="text-zinc-700 dark:text-zinc-300">
                Get insights into your wardrobe, identify gaps, and discover new outfit combinations from pieces you already own.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">🛍️ Personalized Shopping</h3>
              <p className="text-zinc-700 dark:text-zinc-300">
                Discover new items that complement your style and match your existing wardrobe. Shop smarter, not more.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">📱 Mobile & Offline Ready</h3>
              <p className="text-zinc-700 dark:text-zinc-300">
                Access VogueVault anywhere, anytime. Works offline on your mobile device as a progressive web app.
              </p>
            </div>
          </div>
        </section>

        {/* Technology */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">Technology Stack</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">Frontend</h3>
              <ul className="space-y-3 text-zinc-700 dark:text-zinc-300">
                <li>• <strong>Next.js 16</strong> - React framework with Turbopack</li>
                <li>• <strong>React 19</strong> - Latest UI library</li>
                <li>• <strong>TypeScript</strong> - Type-safe development</li>
                <li>• <strong>Tailwind CSS</strong> - Responsive design</li>
                <li>• <strong>Three.js</strong> - 3D visualization</li>
                <li>• <strong>Zustand</strong> - State management</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">Backend</h3>
              <ul className="space-y-3 text-zinc-700 dark:text-zinc-300">
                <li>• <strong>Node.js</strong> - JavaScript runtime</li>
                <li>• <strong>Express.js</strong> - Web framework</li>
                <li>• <strong>PostgreSQL</strong> - Database</li>
                <li>• <strong>JWT</strong> - Authentication</li>
                <li>• <strong>REST API</strong> - Service architecture</li>
                <li>• <strong>Render</strong> - Cloud hosting</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Backend Status */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">System Status</h2>
          
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 rounded-lg p-8 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">Backend API</h3>
            </div>
            
            <div className="space-y-4 text-zinc-700 dark:text-zinc-300">
              <div>
                <p className="font-semibold text-sm text-zinc-600 dark:text-zinc-400 mb-1">API Endpoint</p>
                <code className="bg-white dark:bg-black px-3 py-2 rounded text-sm font-mono block">
                  https://voguevault-api.onrender.com
                </code>
              </div>

              <div>
                <p className="font-semibold text-sm text-zinc-600 dark:text-zinc-400 mb-1">Health Check</p>
                <code className="bg-white dark:bg-black px-3 py-2 rounded text-sm font-mono block">
                  GET /health
                </code>
              </div>

              <div>
                <p className="font-semibold text-sm text-zinc-600 dark:text-zinc-400 mb-2">Available Services</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Authentication Service
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    User Management
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Product Catalog
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Aurora AI Recommendations
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Order Management
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">Platform Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🤖</div>
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">Aurora AI</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Advanced ML recommendations powered by style analysis
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-3">📱</div>
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">Mobile Ready</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Progressive Web App works on iOS and Android
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-3">🔐</div>
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">Secure</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                End-to-end encrypted authentication and data
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">Fast</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Optimized performance with CDN and caching
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-3">🌍</div>
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">Global</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Available worldwide with low latency
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-3">♿</div>
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">Accessible</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                WCAG compliant interface for everyone
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">Ready to Discover Your Style?</h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are transforming their fashion with VogueVault.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth"
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg transition-shadow"
            >
              Get Started Free
            </Link>
            <Link
              href="/recommendations"
              className="px-8 py-3 rounded-lg border-2 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-semibold hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
            >
              Try Aurora AI
            </Link>
          </div>
        </section>

        {/* Footer Info */}
        <section className="mt-20 pt-16 border-t border-zinc-200 dark:border-zinc-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-zinc-600 dark:text-zinc-400">
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-white mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="/auth" className="hover:text-purple-600 dark:hover:text-purple-400">Sign Up</Link></li>
                <li><Link href="/recommendations" className="hover:text-purple-600 dark:hover:text-purple-400">Features</Link></li>
                <li><Link href="/products" className="hover:text-purple-600 dark:hover:text-purple-400">Catalog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="hover:text-purple-600 dark:hover:text-purple-400">About</Link></li>
                <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400">Privacy</a></li>
                <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400">Terms</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-white mb-4">Connect</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400">Twitter</a></li>
                <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400">Instagram</a></li>
                <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800 text-center text-sm text-zinc-600 dark:text-zinc-400">
            <p>&copy; 2025 VogueVault. All rights reserved. | Made with ❤️ for fashion lovers</p>
          </div>
        </section>
      </div>
    </div>
  );
}
