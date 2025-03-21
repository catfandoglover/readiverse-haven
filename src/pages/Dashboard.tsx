
import React, { useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useLocation } from "react-router-dom";

const Dashboard: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') as "become" | "profile" | null;

  useEffect(() => {
    document.title = "Your DNA Dashboard | Intellectual DNA";
  }, []);
  
  return <DashboardLayout initialTab={initialTab || undefined} />;
};

export default Dashboard;
