'use client';

import React from 'react';

interface LoadingProps {
  /** Loading message to display */
  message?: string;
  /** Size variant of the loading spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show as fullscreen overlay */
  fullscreen?: boolean;
  /** Whether to show as inline spinner (no background) */
  inline?: boolean;
  /** Custom className for additional styling */
  className?: string;
}

export default function Loading({ 
  message = 'Loading...', 
  size = 'md', 
  fullscreen = false,
  inline = false,
  className = ''
}: LoadingProps) {
  const sizeClasses = {
    sm: 'loading-spinner-sm',
    md: 'loading-spinner-md', 
    lg: 'loading-spinner-lg'
  };

  const containerClasses = [
    'loading-container',
    fullscreen && 'loading-fullscreen',
    inline && 'loading-inline',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <div className="loading-content">
        <div className={`loading-spinner ${sizeClasses[size]}`}>
          <div className="spinner-ring">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
        {message && (
          <p className="loading-message">{message}</p>
        )}
      </div>
    </div>
  );
}

// Named exports for specific use cases
export const FullscreenLoading = (props: Omit<LoadingProps, 'fullscreen'>) => (
  <Loading {...props} fullscreen={true} />
);

export const InlineLoading = (props: Omit<LoadingProps, 'inline'>) => (
  <Loading {...props} inline={true} />
);

export const PageLoading = (props: LoadingProps) => (
  <Loading {...props} fullscreen={true} size="lg" message="Loading page..." />
);

export const ButtonLoading = (props: Omit<LoadingProps, 'size' | 'inline'>) => (
  <Loading {...props} size="sm" inline={true} message="" />
);