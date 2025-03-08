
import React from 'react';
import { Link } from 'react-router-dom';
import { MenuCategory } from '@/data/menu';
import { ChevronRight } from 'lucide-react';

interface MenuCategoryCardProps {
  category: MenuCategory;
}

const MenuCategoryCard: React.FC<MenuCategoryCardProps> = ({ category }) => {
  return (
    <div className="menu-card bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all">
      <div className="h-48 overflow-hidden">
        <img 
          src={category.image} 
          alt={category.name} 
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
        />
      </div>
      <div className="p-6">
        <h3 className="font-serif text-xl font-semibold mb-2">{category.name}</h3>
        <p className="text-gray-600 mb-4">{category.description}</p>
        <Link 
          to={`/menu/${category.id}`}
          className="flex items-center text-restaurant-primary font-medium hover:underline"
        >
          View Items <ChevronRight size={18} className="ml-1" />
        </Link>
      </div>
    </div>
  );
};

export default MenuCategoryCard;
