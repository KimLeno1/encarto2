/**
 * Encarto Cyber-Esports Haptic Feedback Utility
 * Wraps navigator.vibrate in safe feature checks for mobile touch micro-interactions.
 */

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export function triggerHaptic(type: HapticType = 'light'): boolean {
  if (typeof window === 'undefined') return false;
  if (!('navigator' in window) || typeof navigator.vibrate !== 'function') {
    return false;
  }

  // Respect user preference for reduced motion/sensory sensitivity
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return false;
  }

  try {
    switch (type) {
      case 'light':
        // Crisp touch feedback for tabs, chips, filter clicks
        return navigator.vibrate(12);
      case 'medium':
        // Selection feedback for modals, perks, settings
        return navigator.vibrate(25);
      case 'heavy':
        // High impact actions: match countdown, wagers
        return navigator.vibrate(45);
      case 'success':
        // Triumphant pattern for victory, store purchase, rewards
        return navigator.vibrate([20, 35, 25]);
      case 'warning':
        // Cautious pattern
        return navigator.vibrate([30, 25, 20]);
      case 'error':
        // Rejection pattern for insufficient funds, error toasts
        return navigator.vibrate([40, 30, 45]);
      default:
        return navigator.vibrate(15);
    }
  } catch {
    // Gracefully handle browser security restrictions on background vibration
    return false;
  }
}
