
import { MenuItem } from '@/contexts/CartContext';

export type MenuCategory = {
  id: string;
  name: string;
  description: string;
  image: string;
};

// Export the MenuItem type from CartContext 
export type { MenuItem };

// Mock categories array for backward compatibility with the Index page
export const categories: MenuCategory[] = [];

// These functions will fetch data from Supabase instead of using static arrays
export const getMenuItemsByCategory = async (categoryId: string): Promise<MenuItem[]> => {
  // This function is kept for backward compatibility
  // The actual implementation now uses Supabase directly in the component
  return [];
};

export const getMenuItemById = async (id: string): Promise<MenuItem | undefined> => {
  // This function is kept for backward compatibility
  // The actual implementation now uses Supabase directly in the component
  return undefined;
};
