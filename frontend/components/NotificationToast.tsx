'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

const toastStore = {
  listeners: new Set<(toasts: Toast[]) => void>(),
  toasts: [] as Toast[],
  
  subscribe(listener: (toasts: Toast[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },
  
  notify(message: string, type: ToastType = 'info', duration = 3000) {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = { id, type, message, duration };
    this.toasts = [...this.toasts, toast];
    this.listeners.forEach(l => l(this.toasts));
    
    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
    return id;
  },
  
  remove(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.listeners.forEach(l => l(this.toasts));
  },
  
  success(message: string, duration?: number) {
    return this.notify(message, 'success', duration);
  },
  
  error(message: string, duration?: number) {
    return this.notify(message, 'error', duration);
  },
};

export function useToast() {
  return toastStore;
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribe = toastStore.subscribe(setToasts);
    return unsubscribe;
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 rounded-lg px-4 py-3 text-sm font-medium shadow-lg animate-in fade-in slide-in-from-bottom-2 ${
            toast.type === 'success'
              ? 'bg-emerald-500 text-white'
              : toast.type === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-blue-500 text-white'
          }`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {toast.type === 'success' && <CheckCircle2 size={18} />}
            {toast.type === 'error' && <AlertCircle size={18} />}
          </div>
          <p className="flex-1">{toast.message}</p>
          <button
            type="button"
            onClick={() => toastStore.remove(toast.id)}
            className="flex-shrink-0 hover:opacity-75"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

export default toastStore;
