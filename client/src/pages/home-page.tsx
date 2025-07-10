import { useState } from "react";
import NavigationHeader from "@/components/navigation-header";
import TabNavigation from "@/components/tab-navigation";
import DashboardView from "@/components/dashboard-view";
import SocialFeedView from "@/components/social-feed-view";
import BookingView from "@/components/booking-view";
import HealthView from "@/components/health-view";
import ChatView from "@/components/chat-view";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView />;
      case "social":
        return <SocialFeedView />;
      case "booking":
        return <BookingView />;
      case "health":
        return <HealthView />;
      case "chat":
        return <ChatView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl relative">
      <NavigationHeader />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="pb-20">
        {renderActiveView()}
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4 z-40">
        <Button
          size="lg"
          className="w-14 h-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
