
import React from 'react';
import { Link } from 'react-router-dom';
import { MenuCategory } from '@/data/menu';
import { ChevronRight } from 'lucide-react';

interface MenuCategoryCardProps {
  category: MenuCategory;
}

const MenuCategoryCard: React.FC<MenuCategoryCardProps> = ({ category }) => {
  return (
    <div className="food-card bg-card rounded-lg overflow-hidden shadow-card hover:shadow-xl transition-all">
      <div className="h-52 overflow-hidden">
        <img 
          src={category.image} 
          alt={category.name} 
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
        />
      </div>
      <div className="p-6">
        <h3 className="font-serif text-xl font-semibold mb-2 text-secondary">{category.name}</h3>
        <p className="text-muted-foreground mb-4">{category.description}</p>
        <Link 
          to={`/menu/${category.id}`}
          className="flex items-center text-primary font-medium hover:underline group"
        >
          View Items <ChevronRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default MenuCategoryCard;
