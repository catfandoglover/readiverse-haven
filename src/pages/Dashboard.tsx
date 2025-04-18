
import React, { useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const Dashboard: React.FC = () => {
  useEffect(() => {
    document.title = "Your Dashboard | Intellectual DNA";
  }, []);
  
  return <DashboardLayout />;
};

export default Dashboard;
