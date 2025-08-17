import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MapWidget from '@/components/shared/MapWidget';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Clock, DollarSign, User, LogOut } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

const RiderHome = () => {
  const [pickup, setPickup] = useState<Location | null>(null);
  const [dropoff, setDropoff] = useState<Location | null>(null);
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLocationSelect = (location: Location, type: 'pickup' | 'dropoff') => {
    if (type === 'pickup') {
      setPickup(location);
      setPickupAddress(location.address);
    } else {
      setDropoff(location);
      setDropoffAddress(location.address);
    }
  };

  const handleRequestRide = () => {
    if (!pickup || !dropoff) {
      toast({
        title: "Missing locations",
        description: "Please select both pickup and dropoff locations.",
        variant: "destructive",
      });
      return;
    }

    // Navigate to ride request page with locations
    navigate('/rider/request', { 
      state: { pickup, dropoff } 
    });
  };

  const estimatedFare = pickup && dropoff ? Math.floor(Math.random() * 20) + 8 : 0;
  const estimatedTime = pickup && dropoff ? Math.floor(Math.random() * 15) + 5 : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold">Hi, {user?.name}!</h1>
              <p className="text-xs text-muted-foreground">Where are you going?</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={logout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-73px)]">
        {/* Map Section */}
        <div className="flex-1 p-4">
          <MapWidget
            pickup={pickup}
            dropoff={dropoff}
            onLocationSelect={handleLocationSelect}
            showRoute={!!(pickup && dropoff)}
            height="100%"
          />
        </div>

        {/* Controls Section */}
        <div className="w-full lg:w-80 bg-card border-l p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Plan Your Trip</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <label className="text-sm font-medium">Pickup Location</label>
                </div>
                <Input
                  placeholder="Enter pickup address"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                  <label className="text-sm font-medium">Dropoff Location</label>
                </div>
                <Input
                  placeholder="Where are you going?"
                  value={dropoffAddress}
                  onChange={(e) => setDropoffAddress(e.target.value)}
                />
              </div>

              {pickup && dropoff && (
                <div className="bg-surface-secondary rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>Estimated time</span>
                    </div>
                    <span className="font-medium">{estimatedTime} min</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span>Estimated fare</span>
                    </div>
                    <span className="font-medium">${estimatedFare}</span>
                  </div>
                </div>
              )}

              <Button 
                className="w-full" 
                size="lg"
                variant="gradient"
                onClick={handleRequestRide}
                disabled={!pickup || !dropoff}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Request Ride
              </Button>
            </CardContent>
          </Card>

          {/* Recent Trips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Trips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2].map((trip) => (
                  <div key={trip} className="flex items-center gap-3 p-2 hover:bg-accent rounded-lg cursor-pointer">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">Downtown Office</p>
                      <p className="text-xs text-muted-foreground">Yesterday, 2:30 PM</p>
                    </div>
                    <span className="text-xs text-muted-foreground">$12</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RiderHome;