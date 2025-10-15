/**
 * Utility functions for handling profile data consistently across the application
 */

/**
 * Format a profile field, handling empty values consistently
 * @param value The value to format
 * @param defaultMessage Message to show when value is empty
 * @returns Formatted value or default message
 */
export function formatProfileField(value: string | null | undefined, defaultMessage = 'Not provided'): string {
  if (!value) return defaultMessage;
  return value;
}

/**
 * Format a date string to a localized date
 * @param dateString ISO date string
 * @param defaultMessage Message to show when date is invalid or empty
 * @returns Formatted date or default message
 */
export function formatProfileDate(dateString: string | null | undefined, defaultMessage = 'Not provided'): string {
  if (!dateString) return defaultMessage;
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return defaultMessage;
    return date.toLocaleDateString();
  } catch (error) {
    return defaultMessage;
  }
}

/**
 * Format an address object into a string representation
 * @param address Address object or components
 * @param defaultMessage Message to show when address is empty
 * @returns Formatted address or default message
 */
export function formatAddress(
  address: { 
    line1?: string | null; 
    line2?: string | null; 
    city?: string | null; 
    state?: string | null; 
    postal_code?: string | null; 
    country?: string | null;
  } | null | undefined,
  defaultMessage = 'Not provided'
): string {
  if (!address) return defaultMessage;
  
  const components = [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.postal_code,
    address.country
  ].filter(Boolean);
  
  return components.length > 0 ? components.join(', ') : defaultMessage;
}

/**
 * Ensures user profile data is formatted consistently 
 * and all required fields are present in user_metadata
 */
export function normalizeUserMetadata(user: any): Record<string, any> {
  const metadata = user.user_metadata || {};
  
  // Ensure we have all the fields we need
  return {
    ...metadata,
    // Ensure these fields exist in metadata, using values from top-level fields if needed
    name: metadata.name || user.name || null,
    address: metadata.address || user.address || null,
    dob: metadata.dob || user.dob || null,
    role: metadata.role || 'customer',
    status: metadata.status || 'active'
  };
}