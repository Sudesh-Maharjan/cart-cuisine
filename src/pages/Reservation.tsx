
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, UsersIcon, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Reservation: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [guests, setGuests] = useState('2');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  // Available time slots
  const timeSlots = [
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', 
    '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM',
    '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM',
    '9:00 PM'
  ];
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!name || !email || !phone || !date || !time) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, we would send this to the server
    console.log({
      name,
      email,
      phone,
      guests,
      date,
      time,
      specialRequests
    });
    
    toast({
      title: "Reservation Confirmed!",
      description: `Your table for ${guests} has been reserved for ${format(date as Date, 'MMMM d, yyyy')} at ${time}.`,
    });
    
    // Reset form
    setName('');
    setEmail('');
    setPhone('');
    setGuests('2');
    setDate(undefined);
    setTime('');
    setSpecialRequests('');
    
    // Navigate to home page after success
    setTimeout(() => navigate('/'), 2000);
  };
  
  return (
    <>
      <Navbar />
      
      <section className="pt-32 pb-16 min-h-screen bg-gradient-to-b from-background to-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-card rounded-lg border border-border shadow-xl overflow-hidden">
            <div className="p-6 sm:p-10">
              <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-2 text-gradient animate-fade-in">
                Reserve Your Table
              </h1>
              <p className="text-muted-foreground mb-8 animate-fade-in opacity-90">
                Complete the form below to book your dining experience at Savoria.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 animate-fade-in stagger-1">
                    <label htmlFor="name" className="block text-sm font-medium">
                      Full Name <span className="text-primary">*</span>
                    </label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2 animate-fade-in stagger-2">
                    <label htmlFor="email" className="block text-sm font-medium">
                      Email <span className="text-primary">*</span>
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email"
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2 animate-fade-in stagger-3">
                    <label htmlFor="phone" className="block text-sm font-medium">
                      Phone Number <span className="text-primary">*</span>
                    </label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Your phone number"
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2 animate-fade-in stagger-4">
                    <label htmlFor="guests" className="block text-sm font-medium">
                      Number of Guests <span className="text-primary">*</span>
                    </label>
                    <Select
                      value={guests}
                      onValueChange={setGuests}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select number of guests" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? 'Person' : 'People'}
                          </SelectItem>
                        ))}
                        <SelectItem value="large">
                          Large Party (13+)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 animate-fade-in stagger-1">
                    <label className="block text-sm font-medium">
                      Date <span className="text-primary">*</span>
                    </label>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, 'PPP') : <span>Select date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(newDate) => {
                            setDate(newDate);
                            setCalendarOpen(false);
                          }}
                          initialFocus
                          disabled={{ before: new Date() }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2 animate-fade-in stagger-2">
                    <label className="block text-sm font-medium">
                      Time <span className="text-primary">*</span>
                    </label>
                    <Select
                      value={time}
                      onValueChange={setTime}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="grid grid-cols-2 gap-2 px-1 py-2">
                          {timeSlots.map((slot) => (
                            <SelectItem 
                              key={slot} 
                              value={slot}
                              className="flex items-center p-2 rounded-md cursor-pointer"
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              {slot}
                            </SelectItem>
                          ))}
                        </div>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2 animate-fade-in stagger-3">
                  <label htmlFor="specialRequests" className="block text-sm font-medium">
                    Special Requests
                  </label>
                  <Textarea
                    id="specialRequests"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Allergies, dietary restrictions, special occasions, or seating preferences"
                    rows={4}
                    className="w-full"
                  />
                </div>
                
                <div className="pt-4 animate-fade-in stagger-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <UsersIcon className="mr-2 h-4 w-4" />
                    Reserve Table
                  </Button>
                </div>
              </form>
            </div>
            
            <div className="bg-muted/50 px-6 sm:px-10 py-6 border-t border-border">
              <h2 className="font-serif text-lg font-semibold mb-4">Reservation Policies</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  Reservations can be made up to 30 days in advance.
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  For parties of 8 or more, please call us directly at +1 (555) 123-4567.
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  We hold reservations for 15 minutes past the scheduled time.
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  To cancel, please do so at least 24 hours before your reservation.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </>
  );
};

export default Reservation;
