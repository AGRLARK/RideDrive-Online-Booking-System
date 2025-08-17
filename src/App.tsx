import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Auth pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

// Rider pages
import RiderHome from "./pages/rider/RiderHome";
import RideRequest from "./pages/rider/RideRequest";
import RideInProgress from "./pages/rider/RideInProgress";
import RideComplete from "./pages/rider/RideComplete";

// Driver pages
import DriverHome from "./pages/driver/DriverHome";
import IncomingRequest from "./pages/driver/IncomingRequest";
import ActiveRide from "./pages/driver/ActiveRide";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Root redirect component
const RootRedirect = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user type
  return <Navigate to={user.userType === 'rider' ? '/rider' : '/driver'} replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Root redirect */}
            <Route path="/" element={<RootRedirect />} />
            
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Rider routes */}
            <Route 
              path="/rider" 
              element={
                <ProtectedRoute userType="rider">
                  <RiderHome />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/rider/request" 
              element={
                <ProtectedRoute userType="rider">
                  <RideRequest />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/rider/in-progress" 
              element={
                <ProtectedRoute userType="rider">
                  <RideInProgress />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/rider/complete" 
              element={
                <ProtectedRoute userType="rider">
                  <RideComplete />
                </ProtectedRoute>
              } 
            />
            
            {/* Driver routes */}
            <Route 
              path="/driver" 
              element={
                <ProtectedRoute userType="driver">
                  <DriverHome />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/driver/request" 
              element={
                <ProtectedRoute userType="driver">
                  <IncomingRequest />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/driver/active" 
              element={
                <ProtectedRoute userType="driver">
                  <ActiveRide />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
