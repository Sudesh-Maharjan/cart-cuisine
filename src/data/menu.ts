
import { MenuItem } from '@/contexts/CartContext';

export type MenuCategory = {
  id: string;
  name: string;
  description: string;
  image: string;
};

export const categories: MenuCategory[] = [
  {
    id: "appetizers",
    name: "Appetizers",
    description: "Start your meal with our delicious appetizers",
    image: "/appetizers.jpg"
  },
  {
    id: "main-courses",
    name: "Main Courses",
    description: "Exquisite main dishes crafted with care",
    image: "/main-courses.jpg"
  },
  {
    id: "desserts",
    name: "Desserts",
    description: "Sweet treats to end your meal on a high note",
    image: "/desserts.jpg"
  },
  {
    id: "drinks",
    name: "Drinks",
    description: "Refreshing beverages to complement your meal",
    image: "/drinks.jpg"
  }
];

export const menuItems: MenuItem[] = [
  // Appetizers
  {
    id: "a1",
    name: "Bruschetta",
    description: "Toasted bread topped with fresh tomatoes, basil, and garlic",
    price: 8.99,
    image: "/bruschetta.jpg",
    category: "appetizers"
  },
  {
    id: "a2",
    name: "Calamari Fritti",
    description: "Crispy fried calamari served with lemon aioli",
    price: 12.99,
    image: "/calamari.jpg",
    category: "appetizers"
  },
  {
    id: "a3",
    name: "Caprese Salad",
    description: "Fresh mozzarella, tomatoes, and basil with balsamic glaze",
    price: 9.99,
    image: "/caprese.jpg",
    category: "appetizers"
  },
  
  // Main Courses
  {
    id: "m1",
    name: "Filet Mignon",
    description: "8oz tenderloin steak with red wine reduction and truffle mashed potatoes",
    price: 34.99,
    image: "/filet-mignon.jpg",
    category: "main-courses"
  },
  {
    id: "m2",
    name: "Lobster Ravioli",
    description: "Handmade ravioli filled with lobster in a saffron cream sauce",
    price: 28.99,
    image: "/lobster-ravioli.jpg",
    category: "main-courses"
  },
  {
    id: "m3",
    name: "Grilled Salmon",
    description: "Wild-caught salmon with lemon butter sauce and seasonal vegetables",
    price: 26.99,
    image: "/salmon.jpg",
    category: "main-courses"
  },
  
  // Desserts
  {
    id: "d1",
    name: "Tiramisu",
    description: "Classic Italian dessert with layers of coffee-soaked ladyfingers and mascarpone",
    price: 8.99,
    image: "/tiramisu.jpg",
    category: "desserts"
  },
  {
    id: "d2",
    name: "Crème Brûlée",
    description: "Rich vanilla custard with caramelized sugar top",
    price: 9.99,
    image: "/creme-brulee.jpg",
    category: "desserts"
  },
  {
    id: "d3",
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with a molten center, served with vanilla ice cream",
    price: 10.99,
    image: "/lava-cake.jpg",
    category: "desserts"
  },
  
  // Drinks
  {
    id: "dr1",
    name: "Signature Martini",
    description: "Our house special martini with a twist of lemon",
    price: 12.99,
    image: "/martini.jpg",
    category: "drinks"
  },
  {
    id: "dr2",
    name: "Aged Red Wine",
    description: "Glass of our finest aged red wine",
    price: 14.99,
    image: "/red-wine.jpg",
    category: "drinks"
  },
  {
    id: "dr3",
    name: "Sparkling Water",
    description: "Bottle of premium sparkling water",
    price: 4.99,
    image: "/sparkling-water.jpg",
    category: "drinks"
  }
];

export function getMenuItemsByCategory(categoryId: string): MenuItem[] {
  return menuItems.filter(item => item.category === categoryId);
}

export function getMenuItemById(id: string): MenuItem | undefined {
  return menuItems.find(item => item.id === id);
}
