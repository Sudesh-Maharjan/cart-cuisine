
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
import { Edit, Trash, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

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
  
  const { toast } = useToast();

  // Fetch addons
  const fetchAddons = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('item_addons')
        .select('*')
        .order('name');
        
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
    }
  };

  useEffect(() => {
    fetchAddons();
  }, []);

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
      fetchAddons();
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
      fetchAddons();
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
      fetchAddons();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to delete addon: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Addons</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Addon
        </Button>
      </div>

      {/* Addons Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : addons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  No addons found.
                </TableCell>
              </TableRow>
            ) : (
              addons.map((addon) => (
                <TableRow key={addon.id}>
                  <TableCell className="font-medium">{addon.name}</TableCell>
                  <TableCell>{formatCurrency(addon.price)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditClick(addon)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteClick(addon)}
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

      {/* Add Addon Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Addon</DialogTitle>
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
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAddon}>Add Addon</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Addon Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Addon</DialogTitle>
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
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAddon}>Update Addon</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the addon "{currentAddon?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAddon}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Addons;
