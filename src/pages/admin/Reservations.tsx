
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Loader2, RefreshCw, User, Users } from 'lucide-react';
import { format } from 'date-fns';
import { useRestaurantSettings } from '@/hooks/use-restaurant-settings';

type Reservation = {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  status: string;
  notes?: string;
  created_at: string;
};

type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

const statusColors: Record<ReservationStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800'
};

const Reservations: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const { settings } = useRestaurantSettings();
  
  const fetchReservations = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('date', { ascending: true })
        .order('time', { ascending: true });
        
      if (error) throw error;
      
      setReservations(data as Reservation[]);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to load reservations: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchReservations();
    
    // Set up real-time listener for reservation changes
    const channel = supabase
      .channel('reservation-changes')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'reservations' 
        },
        (payload) => {
          console.log('New reservation:', payload);
          const newReservation = payload.new as Reservation;
          
          // Add the new reservation to state
          setReservations(prev => [newReservation, ...prev]);
          
          // Show notification
          toast({
            title: 'New Reservation!',
            description: `${newReservation.name} has made a reservation for ${format(new Date(newReservation.date), 'MMM dd, yyyy')} at ${newReservation.time}.`,
          });
          
          // Play notification sound if available
          const audio = new Audio('/notification.mp3');
          audio.play().catch(err => console.log('Audio play error:', err));
        }
      )
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'reservations' 
        },
        (payload) => {
          console.log('Updated reservation:', payload);
          const updatedReservation = payload.new as Reservation;
          
          // Update the reservation in state
          setReservations(prev => 
            prev.map(res => res.id === updatedReservation.id ? updatedReservation : res)
          );
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);
  
  const sendConfirmationEmail = async (reservation: Reservation) => {
    try {
      setIsSending(prev => ({ ...prev, [reservation.id]: true }));
      
      // Send email notification
      const { error } = await supabase.functions.invoke('send-reservation-email', {
        body: {
          name: reservation.name,
          email: reservation.email,
          date: reservation.date,
          time: reservation.time,
          guests: reservation.guests,
          status: reservation.status
        }
      });
      
      if (error) throw error;
      
      toast({
        title: 'Email Sent',
        description: `Confirmation email sent to ${reservation.email}`,
      });
    } catch (error: any) {
      console.error('Failed to send email:', error);
      toast({
        title: 'Email Error',
        description: `Failed to send email: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsSending(prev => ({ ...prev, [reservation.id]: false }));
    }
  };
  
  const updateReservationStatus = async (id: string, newStatus: string) => {
    try {
      const reservationToUpdate = reservations.find(r => r.id === id);
      if (!reservationToUpdate) {
        throw new Error("Reservation not found");
      }
      
      const { error } = await supabase
        .from('reservations')
        .update({ status: newStatus })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      const updatedReservation = { ...reservationToUpdate, status: newStatus };
      setReservations(prevReservations => 
        prevReservations.map(reservation => 
          reservation.id === id ? updatedReservation : reservation
        )
      );
      
      toast({
        title: 'Status Updated',
        description: `Reservation for ${reservationToUpdate.name} is now ${newStatus}`,
      });
      
      // Send confirmation email for status changes
      if (reservationToUpdate && reservationToUpdate.status !== newStatus) {
        await sendConfirmationEmail({
          ...reservationToUpdate,
          status: newStatus
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to update reservation status: ${error.message}`,
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reservations</h1>
        <Button 
          variant="outline" 
          onClick={fetchReservations}
          className="flex items-center"
        >
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Reservations</CardTitle>
          <CardDescription>Manage table reservations and update their status</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : reservations.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Party Size</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations.map(reservation => (
                    <TableRow key={reservation.id}>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-2 text-muted-foreground" />
                          {format(new Date(reservation.date), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock size={14} className="mr-2 text-muted-foreground" />
                          {reservation.time.slice(0, 5)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User size={14} className="mr-2 text-muted-foreground" />
                          {reservation.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{reservation.email}</div>
                          <div className="text-muted-foreground">{reservation.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users size={14} className="mr-2 text-muted-foreground" />
                          {reservation.guests} {reservation.guests === 1 ? 'person' : 'people'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          defaultValue={reservation.status}
                          onValueChange={(value) => updateReservationStatus(reservation.id, value)}
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue>
                              <Badge className={statusColors[reservation.status as ReservationStatus]}>
                                {reservation.status}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {reservation.notes || '-'}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={isSending[reservation.id]}
                          onClick={() => sendConfirmationEmail(reservation)}
                        >
                          {isSending[reservation.id] ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Send Email
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No reservations found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reservations;
