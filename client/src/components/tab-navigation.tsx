import { Home, Users, Calendar, Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "dashboard", labelKey: "nav.home", icon: Home },
  { id: "social", labelKey: "nav.community", icon: Users },
  { id: "booking", labelKey: "nav.booking", icon: Calendar },
  { id: "health", labelKey: "nav.health", icon: Heart },
  { id: "chat", labelKey: "nav.chat", icon: MessageCircle },
];

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const { t } = useTranslation();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <Button
              key={tab.id}
              variant="ghost"
              className={`flex-1 py-3 px-4 flex flex-col items-center space-y-1 border-b-2 transition-colors ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{t(tab.labelKey)}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
