import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Trophy, ShoppingBag, AlertTriangle, Info, X, Sparkles } from 'lucide-react';
import { triggerHaptic } from './haptics.ts';

export type ToastType = 'win' | 'purchase' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id'>) => string;
  dismissToast: (id: string) => void;
  toast: {
    win: (title: string, message?: string, duration?: number) => string;
    purchase: (title: string, message?: string, duration?: number) => string;
    error: (title: string, message?: string, duration?: number) => string;
    info: (title: string, message?: string, duration?: number) => string;
  };
}

const ToastContext = createContext<ToastContextType | null>(null);

interface ToastCardProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onDismiss }) => {
  const duration = toast.duration ?? 3500;
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(duration);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    startTimeRef.current = Date.now();
    remainingTimeRef.current = duration;

    const tick = () => {
      if (!isPaused) {
        const elapsed = Date.now() - startTimeRef.current;
        const currentProgress = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(currentProgress);

        if (elapsed >= duration) {
          onDismiss(toast.id);
          return;
        }
      }
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [toast.id, duration, isPaused, onDismiss]);

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    startTimeRef.current = Date.now() - (1 - progress / 100) * duration;
  };

  // Color & Border Configuration based on type
  const getTheme = () => {
    switch (toast.type) {
      case 'win':
        return {
          borderClass: 'border-l-4 border-l-[#a855f7]',
          glowShadow: 'shadow-[0_8px_30px_rgba(7,5,26,0.9),0_0_20px_rgba(168,85,247,0.45)]',
          iconBg: 'bg-purple-500/20 text-[#c084fc] border border-purple-400/40',
          barGradient: 'bg-gradient-to-r from-[#a855f7] via-[#c084fc] to-[#22d3ee]',
          icon: <Trophy size={18} className="drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]" />,
          accentText: 'text-purple-300'
        };
      case 'purchase':
        return {
          borderClass: 'border-l-4 border-l-[#22d3ee]',
          glowShadow: 'shadow-[0_8px_30px_rgba(7,5,26,0.9),0_0_20px_rgba(34,211,238,0.4)]',
          iconBg: 'bg-cyan-500/20 text-[#22d3ee] border border-cyan-400/40',
          barGradient: 'bg-gradient-to-r from-[#22d3ee] via-[#3b82f6] to-[#a855f7]',
          icon: <ShoppingBag size={18} className="drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />,
          accentText: 'text-cyan-300'
        };
      case 'error':
        return {
          borderClass: 'border-l-4 border-l-[#f43f5e]',
          glowShadow: 'shadow-[0_8px_30px_rgba(7,5,26,0.9),0_0_20px_rgba(244,63,94,0.4)]',
          iconBg: 'bg-rose-500/20 text-[#fb7185] border border-rose-400/40',
          barGradient: 'bg-gradient-to-r from-[#f43f5e] via-[#fb7185] to-[#f97316]',
          icon: <AlertTriangle size={18} className="drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]" />,
          accentText: 'text-rose-300'
        };
      case 'info':
      default:
        return {
          borderClass: 'border-l-4 border-l-[#3b82f6]',
          glowShadow: 'shadow-[0_8px_30px_rgba(7,5,26,0.9),0_0_20px_rgba(59,130,246,0.4)]',
          iconBg: 'bg-blue-500/20 text-[#60a5fa] border border-blue-400/40',
          barGradient: 'bg-gradient-to-r from-[#3b82f6] via-[#60a5fa] to-[#22d3ee]',
          icon: <Info size={18} className="drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />,
          accentText: 'text-blue-300'
        };
    }
  };

  const theme = getTheme();

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full max-w-md pointer-events-auto rounded-xl bg-[#0b0b2b]/95 border border-purple-500/30 overflow-hidden transition-all duration-200 transform translate-y-0 ${theme.borderClass} ${theme.glowShadow} animate-slide-down`}
      style={{
        willChange: 'transform, opacity'
      }}
    >
      <div className="flex items-start gap-3.5 p-3.5 pr-2">
        <div className={`p-2 rounded-xl flex-shrink-0 ${theme.iconBg}`}>
          {theme.icon}
        </div>
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-2">
            <h4 className="text-xs sm:text-sm font-heading font-black text-white uppercase tracking-wider truncate">
              {toast.title}
            </h4>
            {toast.type === 'win' && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-[#c084fc] border border-purple-400/30">
                VICTORY
              </span>
            )}
            {toast.type === 'purchase' && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-[#22d3ee] border border-cyan-400/30">
                ACQUIRED
              </span>
            )}
          </div>
          {toast.message && (
            <p className="text-[11px] sm:text-xs text-[#a5b4fc] font-medium leading-relaxed mt-0.5">
              {toast.message}
            </p>
          )}
        </div>
        <button
          onClick={() => onDismiss(toast.id)}
          className="p-1 rounded-lg text-purple-300/60 hover:text-white hover:bg-purple-900/40 transition-colors cursor-pointer"
          aria-label="Dismiss toast"
        >
          <X size={15} />
        </button>
      </div>

      {/* Thin auto-dismiss progress bar */}
      <div className="w-full h-[2.5px] bg-purple-950/60 overflow-hidden">
        <div
          className={`h-full ${theme.barGradient} transition-transform duration-75 origin-left`}
          style={{
            transform: `scaleX(${progress / 100})`,
            willChange: 'transform'
          }}
        />
      </div>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((params: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const newToast: ToastItem = { ...params, id };

    // Haptic feedback trigger for wins, purchases, errors
    if (params.type === 'win') {
      triggerHaptic('success');
    } else if (params.type === 'purchase') {
      triggerHaptic('success');
    } else if (params.type === 'error') {
      triggerHaptic('error');
    } else {
      triggerHaptic('light');
    }

    setToasts(prev => [newToast, ...prev].slice(0, 4)); // Keep maximum 4 concurrent toasts
    return id;
  }, []);

  const toastHelpers = {
    win: (title: string, message?: string, duration?: number) =>
      showToast({ type: 'win', title, message, duration }),
    purchase: (title: string, message?: string, duration?: number) =>
      showToast({ type: 'purchase', title, message, duration }),
    error: (title: string, message?: string, duration?: number) =>
      showToast({ type: 'error', title, message, duration }),
    info: (title: string, message?: string, duration?: number) =>
      showToast({ type: 'info', title, message, duration }),
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast, toast: toastHelpers }}>
      {children}
      {/* Top Floating Toast Notification Container */}
      <div 
        className="fixed top-4 sm:top-6 inset-x-0 z-[9999] pointer-events-none flex flex-col items-center gap-2.5 px-4"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)'
        }}
      >
        {toasts.map(t => (
          <ToastCard key={t.id} toast={t} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
