import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRideSocket } from '@/hooks/useSocket';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MapWidget from '@/components/shared/MapWidget';
import { useToast } from '@/hooks/use-toast';
import { Phone, MessageCircle, MapPin, Clock, User, Star } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface Driver {
  id: string;
  name: string;
  rating: number;
  vehicle: string;
  eta: number;
  location: Location;
}

const RideInProgress = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { pickup, dropoff, driver, rideId } = location.state || {};
  
  const [rideStatus, setRideStatus] = useState<'pickup' | 'in-transit' | 'arrived'>('pickup');
  const [eta, setEta] = useState(driver?.eta || 5);
  const [driverLocation, setDriverLocation] = useState(driver?.location);
  
  const { connected, on, off } = useRideSocket();
  const { toast } = useToast();

  useEffect(() => {
    if (!pickup || !dropoff || !driver) {
      navigate('/rider');
      return;
    }

    // Simulate ride progression
    const statusTimer = setTimeout(() => {
      setRideStatus('in-transit');
      toast({
        title: "Trip started!",
        description: "You're on your way to your destination",
      });
      
      // Simulate arrival
      setTimeout(() => {
        setRideStatus('arrived');
        toast({
          title: "Arrived!",
          description: "You've reached your destination",
        });
        
        // Auto-navigate to completion page
        setTimeout(() => {
          navigate('/rider/complete', {
            state: { pickup, dropoff, driver, rideId, fare: 18.50 }
          });
        }, 2000);
      }, 8000);
    }, 5000);

    // Simulate ETA countdown
    const etaTimer = setInterval(() => {
      setEta(prev => Math.max(0, prev - 1));
    }, 10000);

    return () => {
      clearTimeout(statusTimer);
      clearInterval(etaTimer);
    };
  }, [pickup, dropoff, driver, navigate, toast, rideId]);

  const handleContactDriver = (method: 'call' | 'message') => {
    toast({
      title: method === 'call' ? "Calling driver..." : "Opening messages...",
      description: `Connecting you with ${driver.name}`,
    });
  };

  if (!pickup || !dropoff || !driver) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold">
              {rideStatus === 'pickup' && `${driver.name} is on the way`}
              {rideStatus === 'in-transit' && 'Trip in progress'}
              {rideStatus === 'arrived' && 'You have arrived!'}
            </h1>
            <p className="text-xs text-muted-foreground">
              Ride #{rideId.slice(-6)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">
              {rideStatus === 'pickup' && `${eta} min away`}
              {rideStatus === 'in-transit' && 'En route'}
              {rideStatus === 'arrived' && 'Arrived'}
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-73px)]">
        {/* Map Section */}
        <div className="flex-1 p-4">
          <MapWidget
            pickup={pickup}
            dropoff={dropoff}
            driverLocation={driverLocation}
            showRoute={true}
            height="100%"
          />
        </div>

        {/* Info Section */}
        <div className="w-full lg:w-80 bg-card border-l p-4 space-y-4">
          {/* Driver Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Driver</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{driver.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{driver.rating}</span>
                    <span>•</span>
                    <span>{driver.vehicle}</span>
                  </div>
                </div>
              </div>

              {/* Contact Buttons */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleContactDriver('call')}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleContactDriver('message')}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Trip Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trip Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className={`flex items-center gap-3 p-3 rounded-lg ${
                  rideStatus === 'pickup' ? 'bg-primary/10' : 'bg-success/10'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    rideStatus === 'pickup' ? 'bg-primary' : 'bg-success'
                  }`}>
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Pickup</p>
                    <p className="text-xs text-muted-foreground">{pickup.address}</p>
                  </div>
                  {rideStatus === 'pickup' && (
                    <div className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                      {eta} min
                    </div>
                  )}
                  {rideStatus !== 'pickup' && (
                    <div className="text-success text-sm">✓</div>
                  )}
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-lg ${
                  rideStatus === 'in-transit' ? 'bg-primary/10' : 
                  rideStatus === 'arrived' ? 'bg-success/10' : 'bg-muted/50'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    rideStatus === 'in-transit' ? 'bg-primary' :
                    rideStatus === 'arrived' ? 'bg-success' : 'bg-muted'
                  }`}>
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">In Transit</p>
                    <p className="text-xs text-muted-foreground">
                      {rideStatus === 'in-transit' ? 'On the way...' : 
                       rideStatus === 'arrived' ? 'Completed' : 'Waiting...'}
                    </p>
                  </div>
                  {rideStatus === 'in-transit' && (
                    <div className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                      Active
                    </div>
                  )}
                  {rideStatus === 'arrived' && (
                    <div className="text-success text-sm">✓</div>
                  )}
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-lg ${
                  rideStatus === 'arrived' ? 'bg-success/10' : 'bg-muted/50'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    rideStatus === 'arrived' ? 'bg-success' : 'bg-muted'
                  }`}>
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Destination</p>
                    <p className="text-xs text-muted-foreground">{dropoff.address}</p>
                  </div>
                  {rideStatus === 'arrived' && (
                    <div className="text-success text-sm">✓</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Button */}
          <Button variant="outline" className="w-full">
            <Phone className="w-4 h-4 mr-2" />
            Emergency Contact
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RideInProgress;