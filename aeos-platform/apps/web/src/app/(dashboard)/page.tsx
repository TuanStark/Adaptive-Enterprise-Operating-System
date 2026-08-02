import { DashboardOverview } from "@/features/dashboard/components/DashboardOverview";
import { getServerSession } from "@/features/auth/api/getServerSession";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession();
  
  // Double check protection (though middleware handles this)
  if (!session) {
    redirect("/login");
  }

  // Sometime in the future we'd fetch stats for this user
  // const stats = await getDashboardStats(session.id);
  
  return <DashboardOverview />;
}

