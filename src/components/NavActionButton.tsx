import React from 'react';
import { LucideIcon } from 'lucide-react';

interface NavActionButtonProps {
  label: string;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  className?: string;
}

export function NavActionButton({
  label,
  icon: Icon,
  variant = 'secondary',
  onClick,
  className = '',
}: NavActionButtonProps) {
  if (variant === 'primary') {
    return (
      <button
        onClick={onClick}
        className={`group relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 ${className}`}
      >
        {/* Continuous Shimmer Effect */}
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden rounded-xl">
          <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer" />
        </div>

        {/* Hover Fill Effect (Darker/More Intense) */}
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-700 to-violet-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></span>

        {/* Content */}
        <span className="relative z-10 flex items-center tracking-wide">
          {label}
          {Icon && (
            <Icon className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          )}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`group inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 transition-all shadow-sm hover:shadow ${className}`}
    >
      {Icon && <Icon className="w-4 h-4 mr-2 text-gray-500 group-hover:text-gray-700 transition-colors" />}
      {label}
    </button>
  );
}
