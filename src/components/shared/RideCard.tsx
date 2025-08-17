import React from 'react';
import { Clock, MapPin, User, DollarSign, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Location {
  address: string;
  lat?: number;
  lng?: number;
}

interface RideCardProps {
  rideId: string;
  pickup: Location;
  dropoff: Location;
  status: 'requested' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  fare?: number;
  estimatedTime?: number;
  driverName?: string;
  driverRating?: number;
  vehicleInfo?: string;
  onAccept?: () => void;
  onDecline?: () => void;
  onCancel?: () => void;
  onStart?: () => void;
  onEnd?: () => void;
  className?: string;
  userType?: 'rider' | 'driver';
}

const RideCard: React.FC<RideCardProps> = ({
  rideId,
  pickup,
  dropoff,
  status,
  fare,
  estimatedTime,
  driverName,
  driverRating,
  vehicleInfo,
  onAccept,
  onDecline,
  onCancel,
  onStart,
  onEnd,
  className = "",
  userType = 'rider'
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'requested': return 'text-warning';
      case 'accepted': return 'text-primary';
      case 'in-progress': return 'text-success';
      case 'completed': return 'text-success';
      case 'cancelled': return 'text-danger';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'requested': return 'Looking for driver...';
      case 'accepted': return 'Driver on the way';
      case 'in-progress': return 'Ride in progress';
      case 'completed': return 'Ride completed';
      case 'cancelled': return 'Ride cancelled';
      default: return status;
    }
  };

  const renderActions = () => {
    if (userType === 'driver') {
      if (status === 'requested') {
        return (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onDecline}>
              Decline
            </Button>
            <Button size="sm" onClick={onAccept}>
              Accept
            </Button>
          </div>
        );
      }
      if (status === 'accepted') {
        return (
          <Button size="sm" onClick={onStart}>
            Start Ride
          </Button>
        );
      }
      if (status === 'in-progress') {
        return (
          <Button variant="outline" size="sm" onClick={onEnd}>
            End Ride
          </Button>
        );
      }
    } else {
      // Rider actions
      if (status === 'requested' || status === 'accepted') {
        return (
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel Ride
          </Button>
        );
      }
    }
    return null;
  };

  return (
    <div className={`ride-card ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">Ride #{rideId.slice(-6)}</span>
        </div>
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      {/* Route */}
      <div className="space-y-2 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-3 h-3 bg-primary rounded-full mt-1 flex-shrink-0"></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{pickup.address}</p>
            <p className="text-xs text-muted-foreground">Pickup location</p>
          </div>
        </div>
        
        <div className="flex items-center ml-6">
          <div className="w-px h-6 bg-border"></div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="w-3 h-3 bg-success rounded-full mt-1 flex-shrink-0"></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{dropoff.address}</p>
            <p className="text-xs text-muted-foreground">Destination</p>
          </div>
        </div>
      </div>

      {/* Ride Details */}
      <div className="flex items-center justify-between mb-4 text-sm">
        {estimatedTime && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{estimatedTime} min</span>
          </div>
        )}
        
        {fare && (
          <div className="flex items-center gap-1 font-medium">
            <DollarSign className="w-4 h-4" />
            <span>${fare.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Driver Info (for riders) */}
      {userType === 'rider' && driverName && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-surface-secondary rounded-lg">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">{driverName}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {driverRating && <span>⭐ {driverRating}</span>}
              {vehicleInfo && <span>{vehicleInfo}</span>}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {renderActions()}
    </div>
  );
};

export default RideCard;