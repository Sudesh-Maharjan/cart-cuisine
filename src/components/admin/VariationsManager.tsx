
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Variation {
  id: string;
  name: string;
  price_adjustment: number;
  item_id: string;
}

interface VariationsManagerProps {
  menuItemId: string;
  menuItemName: string;
  onClose: () => void;
}

const VariationsManager: React.FC<VariationsManagerProps> = ({ menuItemId, menuItemName, onClose }) => {
  const [variations, setVariations] = useState<Variation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState<'add' | 'edit' | null>(null);
  const [currentVariation, setCurrentVariation] = useState<Variation>({
    id: '',
    name: '',
    price_adjustment: 0,
    item_id: menuItemId
  });
  const { toast } = useToast();

  useEffect(() => {
    if (menuItemId) {
      fetchVariations();
    }
  }, [menuItemId]);

  const fetchVariations = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('item_variations')
        .select('*')
        .eq('item_id', menuItemId);

      if (error) throw error;
      setVariations(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to load variations: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVariation = () => {
    setCurrentVariation({
      id: '',
      name: '',
      price_adjustment: 0,
      item_id: menuItemId
    });
    setEditMode('add');
  };

  const handleEditVariation = (variation: Variation) => {
    setCurrentVariation({ ...variation });
    setEditMode('edit');
  };

  const handleDeleteVariation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('item_variations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Variation deleted successfully',
      });
      
      // Update the local state
      setVariations(variations.filter(v => v.id !== id));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to delete variation: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const handleSaveVariation = async () => {
    try {
      // Validation
      if (!currentVariation.name) {
        toast({
          title: 'Error',
          description: 'Variation name is required',
          variant: 'destructive',
        });
        return;
      }

      if (editMode === 'add') {
        // Add new variation
        const { data, error } = await supabase
          .from('item_variations')
          .insert([
            {
              name: currentVariation.name,
              price_adjustment: currentVariation.price_adjustment,
              item_id: menuItemId
            }
          ])
          .select();

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Variation added successfully',
        });
        
        // Update the local state
        if (data) {
          setVariations([...variations, data[0]]);
        }
      } else if (editMode === 'edit') {
        // Update existing variation
        const { error } = await supabase
          .from('item_variations')
          .update({
            name: currentVariation.name,
            price_adjustment: currentVariation.price_adjustment
          })
          .eq('id', currentVariation.id);

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Variation updated successfully',
        });
        
        // Update the local state
        setVariations(variations.map(v => 
          v.id === currentVariation.id ? { ...v, name: currentVariation.name, price_adjustment: currentVariation.price_adjustment } : v
        ));
      }

      // Reset form
      setEditMode(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to save variation: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Variations for {menuItemName}</h2>
      
      {editMode ? (
        <Card className="dark:bg-gray-700 border-border">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="dark:text-white">Variation Name</Label>
              <Input
                id="name"
                value={currentVariation.name}
                onChange={(e) => setCurrentVariation({ ...currentVariation, name: e.target.value })}
                placeholder="e.g. Large, Spicy, etc."
                className="dark:bg-gray-900 dark:text-white dark:border-gray-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price_adjustment" className="dark:text-white">Price Adjustment</Label>
              <Input
                id="price_adjustment"
                type="number"
                step="0.01"
                value={currentVariation.price_adjustment}
                onChange={(e) => setCurrentVariation({ ...currentVariation, price_adjustment: parseFloat(e.target.value) })}
                placeholder="Additional price"
                className="dark:bg-gray-900 dark:text-white dark:border-gray-700"
              />
            </div>
            
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setEditMode(null)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSaveVariation}>
                Save Variation
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <Button onClick={handleAddVariation}>
              <Plus className="w-4 h-4 mr-2" />
              Add Variation
            </Button>
          </div>
          
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between p-3 border rounded">
                  <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
                  <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : variations.length > 0 ? (
            <div className="border rounded-md dark:border-gray-700 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/5 dark:bg-gray-900">
                  <TableRow className="hover:bg-muted/10 dark:hover:bg-gray-800 dark:border-gray-700">
                    <TableHead className="dark:text-gray-400">Name</TableHead>
                    <TableHead className="dark:text-gray-400">Price Adjustment</TableHead>
                    <TableHead className="text-right dark:text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variations.map((variation) => (
                    <TableRow key={variation.id} className="hover:bg-muted/10 dark:hover:bg-gray-800 dark:border-gray-700">
                      <TableCell className="font-medium dark:text-white">{variation.name}</TableCell>
                      <TableCell className="dark:text-white">
                        {variation.price_adjustment > 0 ? '+' : ''}
                        ${variation.price_adjustment.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditVariation(variation)}
                          className="mr-2"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteVariation(variation.id)}
                          className="text-destructive hover:text-destructive/90"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No variations found. Click "Add Variation" to create one.
            </div>
          )}
        </>
      )}
      
      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};

export default VariationsManager;
