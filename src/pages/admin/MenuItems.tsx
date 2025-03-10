
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Edit, 
  Trash, 
  Plus, 
  Tag, 
  Eye, 
  Search, 
  RefreshCw,
  Filter,
  ArrowUpDown,
  Check
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { formatCurrency } from '@/lib/utils';
import VariationsManager from '@/components/admin/VariationsManager';

type MenuItem = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
};

type Category = {
  id: string;
  name: string;
};

const MenuItems: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isVariationsOpen, setIsVariationsOpen] = useState(false);
  const [currentMenuItem, setCurrentMenuItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
    is_available: true,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const { toast } = useToast();

  // Fetch menu items and categories
  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('menu_categories')
        .select('id, name')
        .order('name');
        
      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);
      
      // Fetch menu items
      const { data: menuItemsData, error: menuItemsError } = await supabase
        .from('menu_items')
        .select('*')
        .order(sortField, { ascending: sortDirection === 'asc' });
        
      if (menuItemsError) throw menuItemsError;
      setMenuItems(menuItemsData || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to fetch data: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Setup real-time updates
  useEffect(() => {
    fetchData();

    // Set up real-time subscription for menu items
    const channel = supabase
      .channel('menu-items-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'menu_items' 
        }, 
        async () => {
          console.log('Menu items change detected');
          fetchData();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [sortField, sortDirection]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_available: checked }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category_id: '',
      image_url: '',
      is_available: true,
    });
  };

  // Add menu item
  const handleAddMenuItem = async () => {
    try {
      if (!formData.name || !formData.price || !formData.category_id) {
        toast({
          title: 'Error',
          description: 'Name, price, and category are required',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase
        .from('menu_items')
        .insert([
          {
            name: formData.name,
            description: formData.description || null,
            price: parseFloat(formData.price),
            category_id: formData.category_id,
            image_url: formData.image_url || null,
            is_available: formData.is_available,
          },
        ])
        .select();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Menu item added successfully',
      });

      setIsAddDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to add menu item: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  // Edit menu item
  const handleEditClick = (item: MenuItem) => {
    setCurrentMenuItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category_id: item.category_id,
      image_url: item.image_url || '',
      is_available: item.is_available,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateMenuItem = async () => {
    try {
      if (!currentMenuItem || !formData.name || !formData.price || !formData.category_id) {
        toast({
          title: 'Error',
          description: 'Name, price, and category are required',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('menu_items')
        .update({
          name: formData.name,
          description: formData.description || null,
          price: parseFloat(formData.price),
          category_id: formData.category_id,
          image_url: formData.image_url || null,
          is_available: formData.is_available,
        })
        .eq('id', currentMenuItem.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Menu item updated successfully',
      });

      setIsEditDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to update menu item: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  // Delete menu item
  const handleDeleteClick = (item: MenuItem) => {
    setCurrentMenuItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteMenuItem = async () => {
    try {
      if (!currentMenuItem) return;

      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', currentMenuItem.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Menu item deleted successfully',
      });

      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to delete menu item: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  // Handle variations
  const handleVariationsClick = (item: MenuItem) => {
    setCurrentMenuItem(item);
    setIsVariationsOpen(true);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  // Filter and sort menu items
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <Card className="border-border/30 bg-black/10 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-2xl font-bold">Menu Items</CardTitle>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/30 w-full"
                />
              </div>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 bg-background/90 backdrop-blur-md border-border/30">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Filter by Category</h4>
                        <Select 
                          value={selectedCategory}
                          onValueChange={(value) => setSelectedCategory(value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="h-10 w-10 shrink-0"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </div>

          {/* Menu Items Table */}
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        Name
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('price')}
                    >
                      <div className="flex items-center">
                        Price
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead className="w-[180px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No menu items found. {searchTerm ? 'Try a different search term.' : 'Add your first menu item to get started.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => (
                      <TableRow key={item.id} className="group">
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{getCategoryName(item.category_id)}</TableCell>
                        <TableCell>{formatCurrency(item.price)}</TableCell>
                        <TableCell>
                          <div className={`px-2 py-1 rounded-full text-xs inline-block ${
                            item.is_available 
                              ? 'bg-green-500/20 text-green-500 border border-green-500/50' 
                              : 'bg-red-500/20 text-red-500 border border-red-500/50'
                          }`}>
                            {item.is_available ? 'Available' : 'Unavailable'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {}}
                              title="View Item"
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditClick(item)}
                              title="Edit Item"
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleVariationsClick(item)}
                              title="Manage Variations"
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                            >
                              <Tag className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(item)}
                              title="Delete Item"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          <div className="mt-4 text-xs text-muted-foreground">
            {filteredItems.length} items {filteredItems.length !== menuItems.length ? `(filtered from ${menuItems.length})` : ''}
          </div>
        </CardContent>
      </Card>

      {/* Add Menu Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[550px] bg-card/95 backdrop-blur-md border-border/30">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Plus className="mr-2 h-5 w-5 text-primary" />
              Add Menu Item
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Item name"
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="bg-background/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category_id} 
                onValueChange={(value) => handleSelectChange(value, 'category_id')}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Item description"
                rows={3}
                className="bg-background/50 min-h-20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                placeholder="Image URL"
                className="bg-background/50"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_available"
                checked={formData.is_available}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="is_available">Available for ordering</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMenuItem} className="bg-primary">Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Menu Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px] bg-card/95 backdrop-blur-md border-border/30">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Edit className="mr-2 h-5 w-5 text-primary" />
              Edit Menu Item
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Item name"
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price</Label>
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="bg-background/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select 
                value={formData.category_id} 
                onValueChange={(value) => handleSelectChange(value, 'category_id')}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Item description"
                rows={3}
                className="bg-background/50 min-h-20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-image_url">Image URL</Label>
              <Input
                id="edit-image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                placeholder="Image URL"
                className="bg-background/50"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is_available"
                checked={formData.is_available}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="edit-is_available">Available for ordering</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateMenuItem} className="bg-primary">Update Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-card/95 backdrop-blur-md border-border/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <Trash className="mr-2 h-5 w-5 text-destructive" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the menu item "{currentMenuItem?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteMenuItem}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Variations Manager Dialog */}
      <Dialog open={isVariationsOpen} onOpenChange={setIsVariationsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-card/95 backdrop-blur-md border-border/30">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Tag className="mr-2 h-5 w-5 text-primary" />
              Manage Variations for {currentMenuItem?.name}
            </DialogTitle>
          </DialogHeader>
          {currentMenuItem && (
            <VariationsManager 
              menuItemId={currentMenuItem.id} 
              menuItemName={currentMenuItem.name}
              onClose={() => setIsVariationsOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuItems;
