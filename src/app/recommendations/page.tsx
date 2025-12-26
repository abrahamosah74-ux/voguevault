'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { auroraApi } from '@/lib/api-client';
import Link from 'next/link';

interface OutfitRecommendation {
  id: string;
  items: string[];
  occasion?: string;
  seasonality?: string;
  mood?: string;
}

export default function RecommendationsPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [recommendations, setRecommendations] = useState<OutfitRecommendation[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [occasion, setOccasion] = useState('casual');
  const [mood, setMood] = useState('neutral');
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleGenerateOutfit = async () => {
    setIsLoadingRecs(true);
    setError(null);
    try {
      const response = await auroraApi.generateOutfit({
        occasion,
        mood,
        preferences: {}
      });
      if (response.success && response.data) {
        setRecommendations([response.data]);
      } else {
        setError('Failed to generate outfit recommendation');
      }
    } catch (err) {
      console.error('Error generating outfit:', err);
      setError('Error generating outfit recommendation');
    } finally {
      setIsLoadingRecs(false);
    }
  };

  const handleAnalyzeWardrobe = async () => {
    setIsLoadingRecs(true);
    setError(null);
    try {
      const response = await auroraApi.analyzeWardrobe({
        wardrobeItems: []
      });
      if (response.success && response.data) {
        setRecommendations(Array.isArray(response.data) ? response.data : [response.data]);
      } else {
        setError('Failed to analyze wardrobe');
      }
    } catch (err) {
      console.error('Error analyzing wardrobe:', err);
      setError('Error analyzing wardrobe');
    } finally {
      setIsLoadingRecs(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-zinc-50 dark:from-black dark:to-zinc-950">
        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50 dark:from-black dark:to-zinc-950">
      <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            VogueVault
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
              Dashboard
            </Link>
            <Link href="/products" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
              Products
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <span className="text-2xl">✨</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">Aurora AI</h1>
              <p className="text-zinc-600 dark:text-zinc-400">Your fashion co-pilot powered by AI</p>
            </div>
          </div>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Get personalized outfit recommendations based on your mood, occasion, and style preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls Panel */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 border border-zinc-200 dark:border-zinc-800 h-fit lg:sticky lg:top-6">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
              Generate Recommendations
            </h2>

            <div className="space-y-6">
              <div>
                <label htmlFor="occasion" className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                  Occasion
                </label>
                <select
                  id="occasion"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="casual">Casual</option>
                  <option value="professional">Professional</option>
                  <option value="formal">Formal</option>
                  <option value="party">Party</option>
                  <option value="weekend">Weekend</option>
                </select>
              </div>

              <div>
                <label htmlFor="mood" className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                  Current Mood
                </label>
                <select
                  id="mood"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="neutral">Neutral</option>
                  <option value="confident">Confident</option>
                  <option value="creative">Creative</option>
                  <option value="comfortable">Comfortable</option>
                  <option value="adventurous">Adventurous</option>
                </select>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
                </div>
              )}

              <button
                onClick={handleGenerateOutfit}
                disabled={isLoadingRecs}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50"
              >
                {isLoadingRecs ? 'Generating...' : 'Generate Outfit'}
              </button>

              <button
                onClick={handleAnalyzeWardrobe}
                disabled={isLoadingRecs}
                className="w-full py-3 px-4 border border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400 font-semibold rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950 transition-colors disabled:opacity-50"
              >
                {isLoadingRecs ? 'Analyzing...' : 'Analyze My Wardrobe'}
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-3">How it works</h3>
              <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
                <li>✨ Select your mood and occasion</li>
                <li>🎨 Aurora AI generates personalized fits</li>
                <li>👗 Save favorite combinations</li>
                <li>🛍️ Shop recommended items</li>
              </ul>
            </div>
          </div>

          {/* Recommendations Display */}
          <div className="lg:col-span-2">
            {recommendations.length > 0 ? (
              <div className="space-y-6">
                {recommendations.map((rec, idx) => (
                  <div
                    key={rec.id || idx}
                    className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 border border-zinc-200 dark:border-zinc-800"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                          Outfit #{idx + 1}
                        </h3>
                        {rec.occasion && (
                          <p className="text-zinc-600 dark:text-zinc-400">
                            Occasion: <span className="capitalize">{rec.occasion}</span>
                          </p>
                        )}
                      </div>
                      {rec.mood && (
                        <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900 rounded-full">
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300 capitalize">
                            {rec.mood}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mb-6">
                      <h4 className="font-semibold text-zinc-900 dark:text-white mb-4">Items</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {rec.items && rec.items.length > 0 ? (
                          rec.items.map((item, i) => (
                            <div
                              key={i}
                              className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700"
                            >
                              <p className="text-sm text-zinc-900 dark:text-white">{item}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-zinc-600 dark:text-zinc-400">No items in this outfit</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow">
                        Save Outfit
                      </button>
                      <button className="flex-1 py-2 px-4 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-semibold rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        Shop Items
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-12 border border-zinc-200 dark:border-zinc-800 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <span className="text-3xl">✨</span>
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                  No Recommendations Yet
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                  Select your mood and occasion, then click "Generate Outfit" to get started!
                </p>
                <button
                  onClick={handleGenerateOutfit}
                  disabled={isLoadingRecs}
                  className="inline-flex py-2 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
                >
                  Generate Your First Outfit
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
