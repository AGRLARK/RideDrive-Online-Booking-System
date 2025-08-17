import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDriverSocket } from '@/hooks/useSocket';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import MapWidget from '@/components/shared/MapWidget';
import { useToast } from '@/hooks/use-toast';
import { User, LogOut, DollarSign, Clock, Car, MapPin } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

const DriverHome = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location>({
    lat: 37.7749,
    lng: -122.4194,
    address: 'San Francisco, CA'
  });
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [totalTrips, setTotalTrips] = useState(0);
  const [onlineTime, setOnlineTime] = useState(0);
  
  const { user, logout } = useAuth();
  const { connected, goOnline, goOffline, updateLocation, on, off } = useDriverSocket();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Listen for incoming ride requests
    const handleRideRequest = (rideData: any) => {
      if (isOnline) {
        navigate('/driver/request', { state: rideData });
      }
    };

    on('ride-request', handleRideRequest);
    return () => off('ride-request', handleRideRequest);
  }, [isOnline, navigate, on, off]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOnline) {
      timer = setInterval(() => {
        setOnlineTime(prev => prev + 1);
        // Simulate location updates
        updateLocation(currentLocation);
      }, 30000);
    }
    return () => clearInterval(timer);
  }, [isOnline, currentLocation, updateLocation]);

  const handleToggleOnline = async () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);

    if (newStatus) {
      goOnline(currentLocation);
      toast({
        title: "You're online!",
        description: "You'll start receiving ride requests",
      });
    } else {
      goOffline();
      toast({
        title: "You're offline",
        description: "You won't receive any ride requests",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Simulate ride request for demo
  const simulateRideRequest = () => {
    if (!isOnline) {
      toast({
        title: "Go online first",
        description: "You need to be online to receive ride requests",
        variant: "destructive",
      });
      return;
    }

    const mockRideRequest = {
      rideId: `ride_${Date.now()}`,
      pickup: { lat: 37.7849, lng: -122.4094, address: "Mission District, SF" },
      dropoff: { lat: 37.7949, lng: -122.3994, address: "Castro District, SF" },
      fare: 15.50,
      distance: 2.3,
      estimatedTime: 8,
      rider: { name: "Sarah Johnson", rating: 4.9 }
    };

    navigate('/driver/request', { state: mockRideRequest });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold">Hi, {user?.name}!</h1>
              <p className="text-xs text-muted-foreground">
                {isOnline ? 'You are online and ready to drive' : 'You are offline'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm">
                {isOnline ? 'Online' : 'Offline'}
              </span>
              <Switch
                checked={isOnline}
                onCheckedChange={handleToggleOnline}
              />
            </div>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-73px)]">
        {/* Map Section */}
        <div className="flex-1 p-4">
          <div className="relative h-full">
            <MapWidget
              driverLocation={currentLocation}
              height="100%"
            />
            {isOnline && (
              <div className="absolute top-4 left-4 bg-success text-success-foreground px-3 py-1 rounded-full text-sm font-medium">
                Online • Available
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Section */}
        <div className="w-full lg:w-80 bg-card border-l p-4 space-y-4">
          {/* Earnings Today */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Earnings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  ${todayEarnings.toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground">Total earned</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xl font-semibold">{totalTrips}</div>
                  <p className="text-xs text-muted-foreground">Trips</p>
                </div>
                <div>
                  <div className="text-xl font-semibold">{formatTime(onlineTime)}</div>
                  <p className="text-xs text-muted-foreground">Online</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Driver Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`p-4 rounded-lg text-center ${
                isOnline ? 'bg-success/10' : 'bg-muted/50'
              }`}>
                <Car className={`w-8 h-8 mx-auto mb-2 ${
                  isOnline ? 'text-success' : 'text-muted-foreground'
                }`} />
                <h3 className="font-medium">
                  {isOnline ? 'Ready for rides' : 'Offline'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isOnline 
                    ? 'Waiting for ride requests...' 
                    : 'Go online to start earning'
                  }
                </p>
              </div>

              {!isOnline && (
                <Button 
                  className="w-full"
                  variant="gradient"
                  size="lg"
                  onClick={handleToggleOnline}
                >
                  Go Online
                </Button>
              )}

              {/* Demo Button */}
              {isOnline && (
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={simulateRideRequest}
                >
                  Simulate Ride Request
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Location Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                <div>
                  <p className="font-medium text-sm">{currentLocation.address}</p>
                  <p className="text-xs text-muted-foreground">
                    {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">This Week</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span>Total earnings</span>
                </div>
                <span className="font-medium">$234.50</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-muted-foreground" />
                  <span>Completed trips</span>
                </div>
                <span className="font-medium">18</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>Online hours</span>
                </div>
                <span className="font-medium">32h 15m</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DriverHome;