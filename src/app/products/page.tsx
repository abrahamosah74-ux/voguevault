'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { productsApi } from '@/lib/api-client';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description?: string;
  category?: string;
  price?: number;
  imageUrl?: string;
}

export default function ProductsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth');
      return;
    }

    if (isAuthenticated) {
      loadProducts();
    }
  }, [isAuthenticated, isLoading, router]);

  const loadProducts = async () => {
    setIsLoadingProducts(true);
    setError(null);
    try {
      const response = await productsApi.list();
      if (response.success && response.data) {
        setProducts(response.data);
      } else {
        setError('Failed to load products');
      }
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Error loading products');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadProducts();
      return;
    }

    setIsLoadingProducts(true);
    setError(null);
    try {
      const response = await productsApi.search(searchQuery);
      if (response.success && response.data) {
        setProducts(response.data);
      } else {
        setError('Search failed');
      }
    } catch (err) {
      console.error('Error searching products:', err);
      setError('Error searching products');
    } finally {
      setIsLoadingProducts(false);
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
            <Link href="/recommendations" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
              Aurora AI
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">Products</h1>
          <p className="text-zinc-600 dark:text-zinc-400">Browse and search our fashion collection</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search products..."
            className="flex-1 px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <button
            onClick={handleSearch}
            disabled={isLoadingProducts}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50"
          >
            Search
          </button>
          <button
            onClick={loadProducts}
            disabled={isLoadingProducts}
            className="px-6 py-3 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors disabled:opacity-50"
          >
            Reset
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg mb-8">
            <p className="text-red-600 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Products Grid */}
        {isLoadingProducts ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400">Loading products...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-xl transition-shadow"
              >
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                    {product.name}
                  </h3>
                  {product.category && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                      {product.category}
                    </p>
                  )}
                  {product.description && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                      {product.description.substring(0, 100)}...
                    </p>
                  )}
                  {product.price && (
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400 mb-4">
                      ${product.price.toFixed(2)}
                    </p>
                  )}
                  <button className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">No products found</p>
            <button
              onClick={loadProducts}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg"
            >
              Refresh Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
