
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMenuItemsByCategory, categories } from '@/data/menu';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MenuItemCard from '@/components/MenuItemCard';

const MenuCategory: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const menuItems = getMenuItemsByCategory(categoryId || '');
  const category = categories.find(c => c.id === categoryId);
  
  if (!category) {
    return (
      <>
        <Navbar />
        <div className="pt-32 pb-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
          <Link to="/menu" className="text-restaurant-primary hover:underline">
            Return to Menu
          </Link>
        </div>
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <Navbar />
      
      {/* Category Header */}
      <section 
        className="pt-32 pb-16 bg-restaurant-accent/30 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7)), url(${category.image})`
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-restaurant-dark">
            {category.name}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            {category.description}
          </p>
          <div className="flex justify-center space-x-2 text-sm">
            <Link to="/" className="text-gray-600 hover:text-restaurant-primary">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <Link to="/menu" className="text-gray-600 hover:text-restaurant-primary">
              Menu
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-restaurant-primary font-medium">{category.name}</span>
          </div>
        </div>
      </section>
      
      {/* Menu Items */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {menuItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {menuItems.map(item => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No items available in this category.</p>
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link 
              to="/menu" 
              className="text-restaurant-primary font-medium hover:underline"
            >
              ← Back to All Categories
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </>
  );
};

export default MenuCategory;
