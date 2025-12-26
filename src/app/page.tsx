import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-zinc-50 to-white dark:from-black dark:via-zinc-950 dark:to-black">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="space-y-8">
            <div>
              <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                Your Personal AI Fashion Consultant
              </h1>
              <p className="mt-6 text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed">
                VogueVault uses advanced AI to understand your style, analyze your wardrobe, and create personalized outfit recommendations that match your mood, occasion, and personality.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/demo-all"
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg transition-shadow text-center"
              >
                Explore Features
              </Link>
              <a
                href="https://voguevault-api.onrender.com/health"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 rounded-lg border-2 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-semibold hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors text-center"
              >
                API Status
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div>
                <div className="text-3xl font-bold text-purple-600">100+</div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Style Vectors</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-pink-600">∞</div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Combinations</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-600">24/7</div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Available</p>
              </div>
            </div>
          </div>

          {/* Right: Feature Showcase */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
              <h3 className="font-semibold text-lg text-zinc-900 dark:text-white mb-2">
                ✨ Smart Recommendations
              </h3>
              <p className="text-zinc-700 dark:text-zinc-300">
                Get outfit suggestions tailored to weather, occasion, and your personal style.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-lg text-zinc-900 dark:text-white mb-2">
                👗 Digital Wardrobe
              </h3>
              <p className="text-zinc-700 dark:text-zinc-300">
                Organize and analyze your wardrobe with AI-powered compatibility scoring.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <h3 className="font-semibold text-lg text-zinc-900 dark:text-white mb-2">
                🎯 Style Evolution
              </h3>
              <p className="text-zinc-700 dark:text-zinc-300">
                Track your style journey and discover your fashion timeline over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-200 dark:border-zinc-800">
        <h2 className="text-4xl font-bold text-center mb-12 text-zinc-900 dark:text-white">
          Powered by Aurora AI
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Emotional Fit Analysis",
              desc: "Analyzes how an outfit makes you feel psychologically and emotionally.",
              icon: "💭",
            },
            {
              title: "Context Awareness",
              desc: "Understands occasion, weather, duration, and cultural context.",
              icon: "🌍",
            },
            {
              title: "Fashion Forecasting",
              desc: "Predicts upcoming wardrobe needs and trends based on your schedule.",
              icon: "🔮",
            },
            {
              title: "Material Alchemy",
              desc: "Generates custom fabric specifications and sustainability scores.",
              icon: "✨",
            },
            {
              title: "Collaborative Styling",
              desc: "Share outfits and get feedback in real-time styling rooms.",
              icon: "🤝",
            },
            {
              title: "Conversational AI",
              desc: "Chat naturally about fashion, trends, and styling advice.",
              icon: "💬",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="p-6 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-purple-400 dark:hover:border-purple-600 transition-colors"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold text-lg text-zinc-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Backend Info Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-200 dark:border-zinc-800">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-xl p-8 border border-purple-200 dark:border-purple-800">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
            🔗 Backend API
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300 mb-4">
            VogueVault backend is running on Render. Check the health status and explore API documentation:
          </p>
          <div className="space-y-2">
            <p className="text-sm font-mono text-zinc-600 dark:text-zinc-400">
              API URL: <span className="text-purple-600 dark:text-purple-400">https://voguevault-api.onrender.com</span>
            </p>
            <p className="text-sm font-mono text-zinc-600 dark:text-zinc-400">
              Health Check: <a href="https://voguevault-api.onrender.com/health" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">/health</a>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-zinc-600 dark:text-zinc-400">
            <p>&copy; 2025 VogueVault. Your personal fashion AI co-pilot.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
