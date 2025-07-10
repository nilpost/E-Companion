import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Weight, Heart, Activity, Flame, MapPin, Pill, Syringe, Utensils } from "lucide-react";
import { Pet, HealthRecord, Activity as ActivityType } from "@shared/schema";

export default function HealthView() {
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);

  const { data: pets = [] } = useQuery<Pet[]>({
    queryKey: ["/api/pets"],
  });

  const selectedPet = selectedPetId ? pets.find(p => p.id === selectedPetId) : pets[0];

  const { data: healthRecords = [] } = useQuery<HealthRecord[]>({
    queryKey: ["/api/pets", selectedPet?.id, "health"],
    enabled: !!selectedPet?.id,
  });

  const { data: activities = [] } = useQuery<ActivityType[]>({
    queryKey: ["/api/pets", selectedPet?.id, "activities"],
    enabled: !!selectedPet?.id,
  });

  // Mock real-time health data
  const mockHealthData = {
    weight: 28.5,
    heartRate: 72,
    stepsToday: 8432,
    caloriesBurned: 342,
    currentWalk: {
      distance: 1.2,
      duration: 18,
      speed: 4.2
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const recordDate = new Date(date);
    const diffInDays = Math.floor((now.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    return `${diffInDays} days ago`;
  };

  if (pets.length === 0) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold text-dark-slate mb-4">Health Dashboard</h2>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500 mb-4">No pets added yet</p>
            <Button>Add Your First Pet</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold text-dark-slate mb-4">Health Dashboard</h2>
      
      {/* Pet Selector */}
      {pets.length > 1 && (
        <div className="flex space-x-3 mb-6">
          {pets.map((pet) => (
            <Button
              key={pet.id}
              variant={selectedPet?.id === pet.id ? "default" : "outline"}
              onClick={() => setSelectedPetId(pet.id)}
              className="flex-1"
            >
              {pet.name}
            </Button>
          ))}
        </div>
      )}

      {selectedPet && (
        <>
          {/* Health Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                  <Weight className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-dark-slate">{mockHealthData.weight}</h3>
                <p className="text-sm text-gray-600">kg</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-dark-slate">{mockHealthData.heartRate}</h3>
                <p className="text-sm text-gray-600">bpm</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-dark-slate">{mockHealthData.stepsToday.toLocaleString()}</h3>
                <p className="text-sm text-gray-600">steps today</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Flame className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-dark-slate">{mockHealthData.caloriesBurned}</h3>
                <p className="text-sm text-gray-600">calories burned</p>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Tracking */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold text-dark-slate mb-4">Live Tracking</h3>
              
              {/* Mock GPS Map */}
              <div className="bg-gray-100 rounded-xl h-32 flex items-center justify-center mb-4">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Current walk route</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <h4 className="text-lg font-bold text-dark-slate">{mockHealthData.currentWalk.distance} km</h4>
                  <p className="text-xs text-gray-600">Distance</p>
                </div>
                <div className="text-center">
                  <h4 className="text-lg font-bold text-dark-slate">{mockHealthData.currentWalk.duration} min</h4>
                  <p className="text-xs text-gray-600">Duration</p>
                </div>
                <div className="text-center">
                  <h4 className="text-lg font-bold text-dark-slate">{mockHealthData.currentWalk.speed} km/h</h4>
                  <p className="text-xs text-gray-600">Speed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Health Records */}
          <div>
            <h3 className="text-lg font-semibold text-dark-slate mb-4">Recent Activities</h3>
            
            {healthRecords.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500">No health records yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {healthRecords.slice(0, 3).map((record) => {
                  const getIcon = () => {
                    if (record.recordType === 'medication') return Pill;
                    if (record.recordType === 'vaccination') return Syringe;
                    return Heart;
                  };
                  
                  const Icon = getIcon();
                  
                  return (
                    <Card key={record.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-dark-slate">{record.title}</h4>
                              <p className="text-sm text-gray-600">{record.description}</p>
                              <p className="text-xs text-gray-500">{formatTimeAgo(record.date)}</p>
                            </div>
                          </div>
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming Reminders */}
          <div>
            <h3 className="text-lg font-semibold text-dark-slate mb-4">Upcoming Reminders</h3>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Utensils className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-dark-slate">Feeding Time</h4>
                      <p className="text-sm text-gray-600">Evening meal</p>
                      <p className="text-xs text-gray-500">Today, 6:00 PM</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="text-accent">
                    Remind
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
