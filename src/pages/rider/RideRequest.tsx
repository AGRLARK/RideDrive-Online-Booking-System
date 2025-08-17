import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRideSocket } from '@/hooks/useSocket';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MapWidget from '@/components/shared/MapWidget';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Clock, MapPin, User, Car, Star } from 'lucide-react';

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

const RideRequest = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { pickup, dropoff } = location.state || {};
  
  const [status, setStatus] = useState<'searching' | 'found' | 'accepted'>('searching');
  const [driver, setDriver] = useState<Driver | null>(null);
  const [searchTime, setSearchTime] = useState(0);
  const [rideId] = useState(`ride_${Date.now()}`);
  
  const { connected, on, off } = useRideSocket();
  const { toast } = useToast();

  useEffect(() => {
    if (!pickup || !dropoff) {
      navigate('/rider');
      return;
    }

    // Simulate driver search
    const searchTimer = setInterval(() => {
      setSearchTime(prev => prev + 1);
    }, 1000);

    // Simulate finding a driver after 3-8 seconds
    const findDriverTimeout = setTimeout(() => {
      const mockDriver: Driver = {
        id: 'driver_123',
        name: 'Alex Johnson',
        rating: 4.8,
        vehicle: 'Toyota Camry - ABC 123',
        eta: Math.floor(Math.random() * 8) + 3,
        location: { lat: pickup.lat + 0.002, lng: pickup.lng + 0.002, address: 'Nearby' }
      };
      
      setDriver(mockDriver);
      setStatus('found');
      
      toast({
        title: "Driver found!",
        description: `${mockDriver.name} is on the way`,
      });
      
      // Auto-accept after 2 seconds for demo
      setTimeout(() => {
        setStatus('accepted');
        toast({
          title: "Ride confirmed",
          description: "Your driver is on the way to pick you up",
        });
      }, 2000);
    }, Math.random() * 5000 + 3000);

    return () => {
      clearInterval(searchTimer);
      clearTimeout(findDriverTimeout);
    };
  }, [pickup, dropoff, navigate, toast]);

  useEffect(() => {
    if (status === 'accepted' && driver) {
      const timer = setTimeout(() => {
        navigate('/rider/in-progress', {
          state: { pickup, dropoff, driver, rideId }
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, driver, navigate, pickup, dropoff, rideId]);

  const handleCancel = () => {
    toast({
      title: "Ride cancelled",
      description: "Your ride request has been cancelled",
    });
    navigate('/rider');
  };

  if (!pickup || !dropoff) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/rider')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="font-semibold">
              {status === 'searching' && 'Finding your ride...'}
              {status === 'found' && 'Driver found!'}
              {status === 'accepted' && 'Ride confirmed'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {status === 'searching' && `Searching for ${searchTime}s`}
              {status === 'found' && 'Waiting for confirmation'}
              {status === 'accepted' && 'Preparing your trip'}
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
            driverLocation={driver?.location}
            showRoute={true}
            height="100%"
          />
        </div>

        {/* Status Section */}
        <div className="w-full lg:w-80 bg-card border-l p-4 space-y-4">
          {/* Status Card */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                {status === 'searching' && (
                  <>
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <Car className="w-8 h-8 text-primary animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Looking for nearby drivers</h3>
                      <p className="text-sm text-muted-foreground">
                        This usually takes less than a minute
                      </p>
                    </div>
                    <div className="flex justify-center">
                      <div className="flex space-x-1">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-2 h-2 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.1}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {status === 'found' && driver && (
                  <>
                    <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                      <User className="w-8 h-8 text-success" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Driver found!</h3>
                      <p className="text-sm text-muted-foreground">
                        Waiting for driver confirmation
                      </p>
                    </div>
                  </>
                )}

                {status === 'accepted' && driver && (
                  <>
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                      <Car className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Ride confirmed!</h3>
                      <p className="text-sm text-muted-foreground">
                        Your driver is on the way
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Driver Info */}
          {driver && (status === 'found' || status === 'accepted') && (
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

                <div className="bg-surface-secondary rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Arrives in</span>
                    </div>
                    <span className="font-medium">{driver.eta} min</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Trip Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trip Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-primary rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{pickup.address}</p>
                  <p className="text-xs text-muted-foreground">Pickup</p>
                </div>
              </div>
              <div className="flex items-center ml-6">
                <div className="w-px h-4 bg-border"></div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-success rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{dropoff.address}</p>
                  <p className="text-xs text-muted-foreground">Destination</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cancel Button */}
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleCancel}
            disabled={status === 'accepted'}
          >
            Cancel Ride
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RideRequest;