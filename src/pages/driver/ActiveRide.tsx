import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRideSocket } from '@/hooks/useSocket';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MapWidget from '@/components/shared/MapWidget';
import { useToast } from '@/hooks/use-toast';
import { Phone, MessageCircle, Navigation, CheckCircle, User, Star, MapPin, Clock } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface ActiveRide {
  rideId: string;
  pickup: Location;
  dropoff: Location;
  fare: number;
  rider: {
    name: string;
    rating: number;
  };
  status: 'going-to-pickup' | 'arrived-at-pickup' | 'in-progress' | 'completed';
}

const ActiveRide = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const rideData: ActiveRide = location.state;
  
  const [rideStatus, setRideStatus] = useState(rideData?.status || 'going-to-pickup');
  const [eta, setEta] = useState(5);
  const [currentLocation, setCurrentLocation] = useState<Location>({
    lat: 37.7749,
    lng: -122.4194,
    address: 'Current Location'
  });
  
  const { connected, updateDriverLocation, on, off } = useRideSocket();
  const { toast } = useToast();

  useEffect(() => {
    if (!rideData) {
      navigate('/driver');
      return;
    }

    // Simulate location updates
    const locationTimer = setInterval(() => {
      updateDriverLocation(rideData.rideId, currentLocation);
    }, 5000);

    // Simulate ETA countdown
    const etaTimer = setInterval(() => {
      setEta(prev => Math.max(0, prev - 1));
    }, 60000);

    return () => {
      clearInterval(locationTimer);
      clearInterval(etaTimer);
    };
  }, [rideData, currentLocation, updateDriverLocation]);

  const handleContactRider = (method: 'call' | 'message') => {
    toast({
      title: method === 'call' ? "Calling rider..." : "Opening messages...",
      description: `Connecting you with ${rideData.rider.name}`,
    });
  };

  const handleStatusUpdate = () => {
    switch (rideStatus) {
      case 'going-to-pickup':
        setRideStatus('arrived-at-pickup');
        toast({
          title: "Arrived at pickup",
          description: "Let the rider know you're here",
        });
        break;
      case 'arrived-at-pickup':
        setRideStatus('in-progress');
        toast({
          title: "Trip started!",
          description: "Navigate to the destination",
        });
        break;
      case 'in-progress':
        setRideStatus('completed');
        toast({
          title: "Trip completed!",
          description: "Great job! Collecting payment...",
        });
        setTimeout(() => {
          navigate('/driver', {
            state: { completedRide: rideData }
          });
        }, 2000);
        break;
    }
  };

  const getStatusText = () => {
    switch (rideStatus) {
      case 'going-to-pickup':
        return 'Going to pickup';
      case 'arrived-at-pickup':
        return 'Arrived at pickup';
      case 'in-progress':
        return 'Trip in progress';
      case 'completed':
        return 'Trip completed';
      default:
        return 'Active ride';
    }
  };

  const getActionButtonText = () => {
    switch (rideStatus) {
      case 'going-to-pickup':
        return 'Arrived at Pickup';
      case 'arrived-at-pickup':
        return 'Start Trip';
      case 'in-progress':
        return 'End Trip';
      case 'completed':
        return 'Trip Completed';
      default:
        return 'Continue';
    }
  };

  if (!rideData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold">{getStatusText()}</h1>
            <p className="text-xs text-muted-foreground">
              Ride #{rideData.rideId.slice(-6)} • ${rideData.fare.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">
              {rideStatus === 'going-to-pickup' && `${eta} min away`}
              {rideStatus === 'arrived-at-pickup' && 'Waiting for rider'}
              {rideStatus === 'in-progress' && 'En route'}
              {rideStatus === 'completed' && 'Completed'}
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-73px)]">
        {/* Map Section */}
        <div className="flex-1 p-4">
          <MapWidget
            pickup={rideData.pickup}
            dropoff={rideData.dropoff}
            driverLocation={currentLocation}
            showRoute={true}
            height="100%"
          />
        </div>

        {/* Control Panel */}
        <div className="w-full lg:w-80 bg-card border-l p-4 space-y-4">
          {/* Rider Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rider</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{rideData.rider.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{rideData.rider.rating}</span>
                  </div>
                </div>
              </div>

              {/* Contact Buttons */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleContactRider('call')}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleContactRider('message')}
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
                  rideStatus === 'going-to-pickup' ? 'bg-primary/10' : 'bg-success/10'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    rideStatus === 'going-to-pickup' ? 'bg-primary' : 'bg-success'
                  }`}>
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Pickup</p>
                    <p className="text-xs text-muted-foreground">{rideData.pickup.address}</p>
                  </div>
                  {rideStatus === 'going-to-pickup' && (
                    <div className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                      {eta} min
                    </div>
                  )}
                  {rideStatus !== 'going-to-pickup' && (
                    <div className="text-success text-sm">✓</div>
                  )}
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-lg ${
                  rideStatus === 'in-progress' ? 'bg-primary/10' : 
                  rideStatus === 'completed' ? 'bg-success/10' : 'bg-muted/50'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    rideStatus === 'in-progress' ? 'bg-primary' :
                    rideStatus === 'completed' ? 'bg-success' : 'bg-muted'
                  }`}>
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">In Transit</p>
                    <p className="text-xs text-muted-foreground">
                      {rideStatus === 'in-progress' ? 'Driving to destination' : 
                       rideStatus === 'completed' ? 'Completed' : 'Waiting to start'}
                    </p>
                  </div>
                  {rideStatus === 'in-progress' && (
                    <div className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                      Active
                    </div>
                  )}
                  {rideStatus === 'completed' && (
                    <div className="text-success text-sm">✓</div>
                  )}
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-lg ${
                  rideStatus === 'completed' ? 'bg-success/10' : 'bg-muted/50'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    rideStatus === 'completed' ? 'bg-success' : 'bg-muted'
                  }`}>
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Destination</p>
                    <p className="text-xs text-muted-foreground">{rideData.dropoff.address}</p>
                  </div>
                  {rideStatus === 'completed' && (
                    <div className="text-success text-sm">✓</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <Button variant="outline" className="w-full">
            <Navigation className="w-4 h-4 mr-2" />
            Open Navigation
          </Button>

          {/* Primary Action */}
          <Button 
            variant={rideStatus === 'completed' ? 'success' : 'gradient'}
            size="lg"
            className="w-full"
            onClick={handleStatusUpdate}
            disabled={rideStatus === 'completed'}
          >
            {rideStatus === 'completed' && <CheckCircle className="w-4 h-4 mr-2" />}
            {getActionButtonText()}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ActiveRide;