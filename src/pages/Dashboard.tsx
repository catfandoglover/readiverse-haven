
import React, { useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    document.title = "Your DNA Dashboard | Intellectual DNA";
    
    // If the user is not authenticated and we're done loading, redirect to home
    if (!isLoading && !user) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);
  
  // Show the dashboard only if the user is authenticated
  return user ? <DashboardLayout /> : null;
};

export default Dashboard;
