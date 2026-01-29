import { Menu, Bell, Search, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            onClick={onMenuClick}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Search */}
          <div className="hidden sm:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                className="w-64 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Help */}
          <a
            href="https://carearena-mai-3svi.onrender.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            title="API Documentation"
          >
            <HelpCircle className="h-5 w-5" />
          </a>

          {/* Notifications */}
          <button
            type="button"
            className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User menu */}
          <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Admin</p>
              <p className="text-xs text-gray-500">Healthcare Provider</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
              <span className="text-sm font-medium text-white">AD</span>
            </div>
          </div>

          {/* Mobile: Create Campaign button */}
          <div className="sm:hidden">
            <Button size="sm" variant="primary">
              + New
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
