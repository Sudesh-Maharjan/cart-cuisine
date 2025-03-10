
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Label } from '@/components/ui/label';
import { Edit, Trash, Plus, Search, RefreshCw, Tag, ArrowUpDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Addon = {
  id: string;
  name: string;
  price: number;
};

const Addons: React.FC = () => {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentAddon, setCurrentAddon] = useState<Addon | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const { toast } = useToast();

  // Fetch addons
  const fetchAddons = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('item_addons')
        .select('*')
        .order(sortField, { ascending: sortDirection === 'asc' });
        
      if (error) throw error;
      
      setAddons(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to fetch addons: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAddons();
    
    // Set up real-time subscription for addons
    const channel = supabase
      .channel('public:item_addons')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'item_addons' 
      }, () => {
        fetchAddons();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [sortField, sortDirection]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
    });
  };

  // Add addon
  const handleAddAddon = async () => {
    try {
      if (!formData.name || !formData.price) {
        toast({
          title: 'Error',
          description: 'Name and price are required',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase
        .from('item_addons')
        .insert([
          {
            name: formData.name,
            price: parseFloat(formData.price),
          },
        ])
        .select();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Addon added successfully',
      });

      setIsAddDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to add addon: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  // Edit addon
  const handleEditClick = (addon: Addon) => {
    setCurrentAddon(addon);
    setFormData({
      name: addon.name,
      price: addon.price.toString(),
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateAddon = async () => {
    try {
      if (!currentAddon || !formData.name || !formData.price) {
        toast({
          title: 'Error',
          description: 'Name and price are required',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('item_addons')
        .update({
          name: formData.name,
          price: parseFloat(formData.price),
        })
        .eq('id', currentAddon.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Addon updated successfully',
      });

      setIsEditDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to update addon: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  // Delete addon
  const handleDeleteClick = (addon: Addon) => {
    setCurrentAddon(addon);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteAddon = async () => {
    try {
      if (!currentAddon) return;

      const { error } = await supabase
        .from('item_addons')
        .delete()
        .eq('id', currentAddon.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Addon deleted successfully',
      });

      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to delete addon: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAddons();
  };

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter addons based on search term
  const filteredAddons = addons.filter(addon => 
    addon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="border-border/30 bg-black/10 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-2xl font-bold flex items-center">
              <Tag className="mr-2 h-5 w-5 text-primary" />
              Addons Manager
            </CardTitle>
            <Button onClick={() => setIsAddDialogOpen(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Addon
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search addons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50 w-full"
              />
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex-shrink-0"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Addons Table */}
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
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center">
                      Price
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      <div className="flex justify-center">
                        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                      </div>
                      <div className="mt-2 text-muted-foreground">Loading addons...</div>
                    </TableCell>
                  </TableRow>
                ) : filteredAddons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      {searchTerm ? (
                        <div className="text-muted-foreground">No addons found matching "{searchTerm}"</div>
                      ) : (
                        <div className="text-muted-foreground">No addons available. Add your first addon to get started.</div>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAddons.map((addon) => (
                    <TableRow key={addon.id} className="group">
                      <TableCell className="font-medium">{addon.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-primary/10 hover:bg-primary/20 border-primary/30">
                          {formatCurrency(addon.price)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(addon)}
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(addon)}
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
          
          <div className="mt-4 text-xs text-muted-foreground">
            Showing {filteredAddons.length} of {addons.length} addons
          </div>
        </CardContent>
      </Card>

      {/* Add Addon Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-md border-border/30 shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Plus className="mr-2 h-5 w-5 text-primary" />
              Add New Addon
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Addon name"
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAddon} className="bg-primary hover:bg-primary/90">Add Addon</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Addon Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-md border-border/30 shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Edit className="mr-2 h-5 w-5 text-primary" />
              Edit Addon
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Addon name"
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAddon} className="bg-primary hover:bg-primary/90">Update Addon</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-card/95 backdrop-blur-md border-border/30 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <Trash className="mr-2 h-5 w-5 text-destructive" />
              Delete Addon
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the addon "{currentAddon?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAddon}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Addons;
