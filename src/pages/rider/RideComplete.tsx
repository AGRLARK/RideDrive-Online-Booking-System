import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Star, MapPin, Clock, DollarSign, User, Home } from 'lucide-react';

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
}

const RideComplete = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { pickup, dropoff, driver, rideId, fare } = location.state || {};
  
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();

  const handleRatingSelect = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleSubmitFeedback = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Thank you!",
      description: "Your feedback has been submitted successfully.",
    });
    
    setIsSubmitting(false);
    navigate('/rider');
  };

  const handleBookAnotherRide = () => {
    navigate('/rider');
  };

  if (!pickup || !dropoff || !driver) {
    navigate('/rider');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Success Card */}
        <Card className="text-center shadow-elevated">
          <CardContent className="p-6">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Trip Completed!</h1>
            <p className="text-muted-foreground mb-4">
              Hope you had a great ride with {driver.name}
            </p>
            <div className="text-3xl font-bold text-primary">
              ${fare.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">Total fare</p>
          </CardContent>
        </Card>

        {/* Trip Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trip Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{driver.name}</span>
              <span className="text-muted-foreground">•</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{driver.rating}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-primary rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{pickup.address}</p>
                  <p className="text-xs text-muted-foreground">Pickup location</p>
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
            </div>

            <div className="flex items-center justify-between text-sm pt-2 border-t">
              <span className="text-muted-foreground">Ride #{rideId.slice(-6)}</span>
              <span className="text-muted-foreground">
                {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Rating & Feedback */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rate Your Trip</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                How was your ride with {driver.name}?
              </p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRatingSelect(star)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Share your feedback (optional)
              </label>
              <Textarea
                placeholder="Tell us about your experience..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={handleSubmitFeedback}
              disabled={rating === 0 || isSubmitting}
              className="w-full"
              variant="gradient"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate('/rider')}
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
          <Button
            variant="default"
            className="flex-1"
            onClick={handleBookAnotherRide}
          >
            Book Another Ride
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RideComplete;