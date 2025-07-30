"use client";

import Dashboard from "@/components/Dashboard/Dashboard";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const handleNavigate = (view: string) => {
    router.push(`/${view}`);
  };

  return <Dashboard onNavigate={handleNavigate} />;
}
