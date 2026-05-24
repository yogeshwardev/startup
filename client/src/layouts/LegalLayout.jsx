import React from 'react';
import { Terminal, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const LegalLayout = ({ title, lastUpdated, children }) => {
  return (
    <div className="min-h-screen bg-surface text-gray-100 font-display">
      <nav className="fixed w-full z-50 top-0 border-b border-border/50 bg-surface/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Terminal className="w-8 h-8 text-brand-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-brand-400 to-emerald-300 bg-clip-text text-transparent">
              CampusArena
            </span>
          </Link>
          <Link to="/" className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto bg-surface-50 border border-border rounded-2xl p-8 md:p-12 shadow-card">
          <header className="mb-10 pb-8 border-b border-border/50">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h1>
            {lastUpdated && <p className="text-sm text-gray-400">Last Updated: {lastUpdated}</p>}
          </header>
          
          <div className="prose prose-invert prose-brand max-w-none text-gray-300 space-y-6">
            {children}
          </div>
        </div>
      </main>

      <footer className="border-t border-border/50 bg-surface py-8 px-4 text-center">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} CC Solutions. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default LegalLayout;
