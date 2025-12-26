import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              VogueVault
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex gap-8">
            <Link
              href="/"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              href="/demo"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
            >
              Demo
            </Link>
            <Link
              href="/demo-all"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
            >
              All Features
            </Link>
          </div>

          {/* CTA Button */}
          <div className="flex items-center gap-4">
            <a
              href="https://voguevault-api.onrender.com/health"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium px-3 py-1 bg-zinc-100 dark:bg-zinc-900 rounded-full text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              API Status
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
