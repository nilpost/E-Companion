import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Heart, Users } from "lucide-react";
import { Pet, Activity } from "@shared/schema";

export default function DashboardView() {
  const { user } = useAuth();

  const { data: pets = [] } = useQuery<Pet[]>({
    queryKey: ["/api/pets"],
  });

  const { data: recentActivities = [] } = useQuery<(Activity & { pet: Pet })[]>({
    queryKey: ["/api/activities/recent"],
  });

  const { data: userBadges = [] } = useQuery({
    queryKey: ["/api/user/badges"],
  });

  const currentXP = user?.xpPoints || 0;
  const currentLevel = user?.level || 1;
  const nextLevelXP = currentLevel * 1000;
  const progressToNext = ((currentXP % 1000) / 1000) * 100;

  return (
    <div className="space-y-6 p-4">
      {/* User Stats Card */}
      <Card className="bg-gradient-to-r from-primary to-warm-orange text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Welcome back, {user?.firstName}!</h3>
              <p className="text-orange-100 text-sm">Level {currentLevel} Pet Parent</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{currentXP.toLocaleString()}</div>
              <div className="text-orange-100 text-sm">XP Points</div>
            </div>
          </div>
          <div className="space-y-2">
            <Progress value={progressToNext} className="h-3 bg-white/20" />
            <p className="text-orange-100 text-xs">
              {1000 - (currentXP % 1000)} XP to next level
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pet Profiles Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-dark-slate">Your Pets</h2>
          <Button variant="ghost" size="sm" className="text-primary font-medium">
            + Add Pet
          </Button>
        </div>
        
        {pets.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500 mb-4">No pets added yet</p>
              <Button>Add Your First Pet</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {pets.map((pet) => (
              <Card key={pet.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="aspect-square bg-gray-100 rounded-xl mb-3 flex items-center justify-center">
                    {pet.avatar ? (
                      <img src={pet.avatar} alt={pet.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <div className="text-4xl">{pet.species === 'dog' ? '🐕' : '🐱'}</div>
                    )}
                  </div>
                  <h3 className="font-semibold text-dark-slate">{pet.name}</h3>
                  <p className="text-sm text-gray-600">{pet.breed}</p>
                  <div className="flex items-center mt-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Heart className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-xs text-gray-500 ml-2">Healthy</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Today's Activities */}
      <div>
        <h2 className="text-xl font-bold text-dark-slate mb-4">Recent Activities</h2>
        
        {recentActivities.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">No recent activities</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentActivities.slice(0, 3).map((activity) => (
              <Card key={activity.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                        <div className="text-white text-xl">
                          {activity.activityType === 'walk' && '🚶'}
                          {activity.activityType === 'feeding' && '🍽️'}
                          {activity.activityType === 'grooming' && '✂️'}
                          {activity.activityType === 'training' && '🎓'}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-dark-slate">{activity.title}</h3>
                        <p className="text-sm text-gray-600">
                          {activity.pet.name}
                          {activity.duration && ` • ${activity.duration} min`}
                          {activity.distance && ` • ${activity.distance} km`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-secondary">+{activity.xpEarned} XP</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Achievements Section */}
      <div>
        <h2 className="text-xl font-bold text-dark-slate mb-4">Recent Achievements</h2>
        
        {userBadges.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">No badges earned yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex space-x-3 overflow-x-auto pb-4">
            {userBadges.slice(0, 3).map((userBadge) => (
              <Card key={userBadge.id} className="flex-shrink-0 min-w-[120px]">
                <CardContent className="p-4 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-dark-slate text-sm">{userBadge.badge?.name}</h3>
                  <p className="text-xs text-gray-600">{userBadge.badge?.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
