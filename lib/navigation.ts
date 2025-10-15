"use client";

/**
 * Simple utility to detect if we're in development mode
 * This is useful for adding additional debugging only in dev environments
 */
export function isDev() {
  return process.env.NODE_ENV === 'development';
}

/**
 * Safe navigation function that tries multiple approaches
 * to navigate to a new URL, with fallbacks for different environments
 */
export function safeNavigate(url: string) {
  console.log(`Attempting to navigate to: ${url}`);
  
  try {
    // Try standard approach first
    window.location.href = url;
    return true;
  } catch (e) {
    console.error('Navigation error with location.href:', e);
    
    try {
      // Try alternative approach
      window.location.assign(url);
      return true;
    } catch (e2) {
      console.error('Navigation error with location.assign:', e2);
      
      try {
        // Another alternative
        document.location.href = url;
        return true;
      } catch (e3) {
        console.error('All navigation methods failed:', e3);
        return false;
      }
    }
  }
}
