import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MapWidget from '@/components/shared/MapWidget';
import { useToast } from '@/hooks/use-toast';
import { User, MapPin, DollarSign, Clock, Car, X, Check, Star } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface RideRequest {
  rideId: string;
  pickup: Location;
  dropoff: Location;
  fare: number;
  distance: number;
  estimatedTime: number;
  rider: {
    name: string;
    rating: number;
  };
}

const IncomingRequest = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const rideRequest: RideRequest = location.state;
  
  const [timeLeft, setTimeLeft] = useState(15); // 15 seconds to respond
  const [isResponding, setIsResponding] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!rideRequest) {
      navigate('/driver');
      return;
    }

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleDecline();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [rideRequest, navigate]);

  const handleAccept = async () => {
    setIsResponding(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Ride accepted!",
      description: "Navigating to pickup location",
    });
    
    navigate('/driver/active', {
      state: { 
        ...rideRequest, 
        status: 'going-to-pickup',
        acceptedAt: new Date().toISOString()
      }
    });
  };

  const handleDecline = async () => {
    setIsResponding(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    toast({
      title: "Ride declined",
      description: "Looking for your next ride request",
    });
    
    navigate('/driver');
  };

  if (!rideRequest) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-lg">New Ride Request</h1>
            <p className="text-sm text-muted-foreground">
              Respond within {timeLeft} seconds
            </p>
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-lg font-bold text-primary">{timeLeft}</span>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-73px)]">
        {/* Map Section */}
        <div className="flex-1 p-4">
          <MapWidget
            pickup={rideRequest.pickup}
            dropoff={rideRequest.dropoff}
            showRoute={true}
            height="100%"
          />
        </div>

        {/* Request Details */}
        <div className="w-full lg:w-80 bg-card border-l p-4 space-y-4">
          {/* Ride Info */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Ride Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-2">
                <div className="text-3xl font-bold text-primary">
                  ${rideRequest.fare.toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground">Estimated fare</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold">{rideRequest.distance} mi</div>
                  <p className="text-xs text-muted-foreground">Distance</p>
                </div>
                <div>
                  <div className="text-lg font-semibold">{rideRequest.estimatedTime} min</div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rider Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rider</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{rideRequest.rider.name}</h4>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{rideRequest.rider.rating}</span>
                    <span>rating</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Route Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Route</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-primary rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{rideRequest.pickup.address}</p>
                  <p className="text-xs text-muted-foreground">Pickup location</p>
                </div>
              </div>
              
              <div className="flex items-center ml-6">
                <div className="w-px h-6 bg-border"></div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-success rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{rideRequest.dropoff.address}</p>
                  <p className="text-xs text-muted-foreground">Destination</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={handleDecline}
              disabled={isResponding}
            >
              <X className="w-4 h-4 mr-2" />
              Decline
            </Button>
            <Button
              variant="gradient"
              size="lg"
              className="flex-1"
              onClick={handleAccept}
              disabled={isResponding}
            >
              <Check className="w-4 h-4 mr-2" />
              Accept
            </Button>
          </div>

          {/* Time Warning */}
          {timeLeft <= 5 && (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 text-center">
              <p className="text-sm font-medium text-warning">
                Only {timeLeft} seconds left to respond!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncomingRequest;