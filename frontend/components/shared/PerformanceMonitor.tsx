'use client';

import React, { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  networkRequests: number;
  errorCount: number;
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkRequests: 0,
    errorCount: 0
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Measure page load time
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    
    // Measure memory usage if available
    const memoryUsage = (performance as any).memory ? 
      Math.round((performance as any).memory.usedJSHeapSize / 1048576) : 0;

    // Count network requests
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const networkEntries = entries.filter(entry => 
        entry.entryType === 'resource' || entry.entryType === 'navigation'
      );
      setMetrics(prev => ({
        ...prev,
        networkRequests: networkEntries.length
      }));
    });

    try {
      observer.observe({ entryTypes: ['resource', 'navigation'] });
    } catch (e) {
      console.warn('Performance observer not supported');
    }

    const t = window.setTimeout(() => {
      setMetrics({
        loadTime,
        renderTime: 0, // Would need to be measured differently
        memoryUsage,
        networkRequests: 0,
        errorCount: 0
      });
    }, 0);

    return () => {
      observer.disconnect();
      window.clearTimeout(t);
    };
  }, []);

  // Error tracking
  useEffect(() => {
    const handleError = () => {
      setMetrics(prev => ({
        ...prev,
        errorCount: prev.errorCount + 1
      }));
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Keyboard shortcut to toggle visibility (Ctrl+Shift+P)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!isVisible) {
    return (
      <div 
        className="fixed bottom-4 right-4 w-3 h-3 bg-green-500 rounded-full cursor-pointer opacity-50 hover:opacity-100"
        onClick={() => setIsVisible(true)}
        title="Press Ctrl+Shift+P to show performance metrics"
      />
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-gray-200 rounded-lg shadow-xl p-4 w-80 z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-black text-gray-900 text-sm">Performance Metrics</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600 font-bold">Load Time:</span>
          <span className="font-black text-gray-900">{metrics.loadTime}ms</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 font-bold">Memory Usage:</span>
          <span className="font-black text-gray-900">{metrics.memoryUsage}MB</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 font-bold">Network Requests:</span>
          <span className="font-black text-gray-900">{metrics.networkRequests}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 font-bold">Errors:</span>
          <span className={`font-black ${metrics.errorCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {metrics.errorCount}
          </span>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200">
        <button
          onClick={() => window.location.reload()}
          className="w-full px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}
