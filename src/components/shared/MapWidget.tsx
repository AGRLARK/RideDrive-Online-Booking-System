import React, { useEffect, useRef, useState } from 'react';

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface MapWidgetProps {
  pickup?: Location;
  dropoff?: Location;
  driverLocation?: Location;
  height?: string;
  onLocationSelect?: (location: Location, type: 'pickup' | 'dropoff') => void;
  showRoute?: boolean;
  className?: string;
}

const DUMMY_LOCATIONS = {
  pickup: { lat: 37.7749, lng: -122.4194, address: "San Francisco, CA" },
  dropoff: { lat: 37.7849, lng: -122.4094, address: "Mission District, SF" },
  driver: { lat: 37.7779, lng: -122.4174, address: "Current Location" },
};

const MapWidget: React.FC<MapWidgetProps> = ({
  pickup,
  dropoff,
  driverLocation,
  height = "400px",
  onLocationSelect,
  showRoute = false,
  className = "",
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [selectedLocation, setSelectedLocation] = useState<'pickup' | 'dropoff' | null>(null);

  // Simulate map interactions for demo
  const handleMapClick = (event: React.MouseEvent) => {
    if (!onLocationSelect || !selectedLocation) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Simulate converting click position to lat/lng
    const simulatedLocation = {
      lat: DUMMY_LOCATIONS.pickup.lat + (y - rect.height / 2) * 0.001,
      lng: DUMMY_LOCATIONS.pickup.lng + (x - rect.width / 2) * 0.001,
      address: selectedLocation === 'pickup' ? 'Selected Pickup Location' : 'Selected Dropoff Location'
    };
    
    onLocationSelect(simulatedLocation, selectedLocation);
    setSelectedLocation(null);
  };

  return (
    <div className={`map-container ${className}`} style={{ height }}>
      <div
        ref={mapContainer}
        className="w-full h-full bg-gradient-to-br from-blue-50 to-green-50 relative cursor-pointer rounded-xl overflow-hidden"
        onClick={handleMapClick}
      >
        {/* Map Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Location Markers */}
        {pickup && (
          <div 
            className="absolute w-6 h-6 bg-primary rounded-full shadow-lg border-2 border-white transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={{ left: '25%', top: '70%' }}
          >
            <div className="w-full h-full bg-primary rounded-full animate-ping absolute"></div>
          </div>
        )}

        {dropoff && (
          <div 
            className="absolute w-6 h-6 bg-success rounded-full shadow-lg border-2 border-white transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={{ left: '75%', top: '30%' }}
          >
            <div className="w-full h-full bg-success rounded-full animate-ping absolute"></div>
          </div>
        )}

        {driverLocation && (
          <div 
            className="absolute w-8 h-8 bg-warning rounded-full shadow-lg border-2 border-white transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={{ left: '50%', top: '50%' }}
          >
            <div className="w-full h-full bg-warning rounded-full animate-pulse absolute"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
          </div>
        )}

        {/* Route Line */}
        {showRoute && pickup && dropoff && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-5">
            <path
              d="M 25% 70% Q 50% 40% 75% 30%"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              strokeDasharray="5,5"
              fill="none"
              className="animate-pulse"
            />
          </svg>
        )}

        {/* Location Selection Overlay */}
        {selectedLocation && (
          <div className="absolute inset-0 bg-primary/10 flex items-center justify-center z-20">
            <div className="bg-card rounded-lg p-4 shadow-lg">
              <p className="text-sm font-medium">
                Tap on the map to select {selectedLocation} location
              </p>
            </div>
          </div>
        )}

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          {onLocationSelect && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedLocation('pickup');
                }}
                className="bg-primary text-primary-foreground p-2 rounded-lg shadow-lg text-xs font-medium hover:bg-primary-hover transition-colors"
              >
                Set Pickup
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedLocation('dropoff');
                }}
                className="bg-success text-success-foreground p-2 rounded-lg shadow-lg text-xs font-medium hover:bg-success/90 transition-colors"
              >
                Set Dropoff
              </button>
            </>
          )}
        </div>

        {/* Demo Notice */}
        <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-2 text-xs text-muted-foreground">
          Demo Map - Click controls to simulate location selection
        </div>
      </div>
    </div>
  );
};

export default MapWidget;