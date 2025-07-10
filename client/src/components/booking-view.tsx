import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Footprints, Stethoscope, Scissors, GraduationCap, Star } from "lucide-react";
import { Appointment, User, Pet, Provider } from "@shared/schema";

type AppointmentWithDetails = Appointment & {
  provider: User;
  pet: Pet;
};

type ProviderWithUser = Provider & {
  user: User;
};

export default function BookingView() {
  const { data: appointments = [] } = useQuery<AppointmentWithDetails[]>({
    queryKey: ["/api/appointments"],
  });

  const { data: providers = [] } = useQuery<ProviderWithUser[]>({
    queryKey: ["/api/providers"],
  });

  const services = [
    {
      id: "walking",
      name: "Dog Footprints",
      description: "Professional walkers",
      icon: Footprints,
      color: "bg-secondary"
    },
    {
      id: "vet",
      name: "Veterinary",
      description: "Health checkups",
      icon: Stethoscope,
      color: "bg-accent"
    },
    {
      id: "grooming",
      name: "Grooming",
      description: "Professional grooming",
      icon: Scissors,
      color: "bg-primary"
    },
    {
      id: "training",
      name: "Training",
      description: "Behavioral training",
      icon: GraduationCap,
      color: "bg-yellow-500"
    }
  ];

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getServiceIcon = (serviceType: string) => {
    const service = services.find(s => s.id === serviceType);
    return service?.icon || Footprints;
  };

  const getServiceColor = (serviceType: string) => {
    const service = services.find(s => s.id === serviceType);
    return service?.color || "bg-secondary";
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold text-dark-slate">Book Services</h2>
      
      {/* Service Categories */}
      <div className="grid grid-cols-2 gap-4">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <Card key={service.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <div className={`w-16 h-16 ${service.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-dark-slate">{service.name}</h3>
                <p className="text-sm text-gray-600">{service.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Upcoming Appointments */}
      <div>
        <h3 className="text-lg font-semibold text-dark-slate mb-4">Upcoming Appointments</h3>
        
        {appointments.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">No upcoming appointments</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {appointments.slice(0, 3).map((appointment) => {
              const ServiceIcon = getServiceIcon(appointment.serviceType);
              const serviceColor = getServiceColor(appointment.serviceType);
              
              return (
                <Card key={appointment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 ${serviceColor} rounded-full flex items-center justify-center`}>
                          <ServiceIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-dark-slate">{appointment.title}</h4>
                          <p className="text-sm text-gray-600">{formatDateTime(appointment.startTime)}</p>
                          <p className="text-xs text-gray-500">
                            with {appointment.provider.firstName} {appointment.provider.lastName}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="text-accent">
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Available Providers */}
      <div>
        <h3 className="text-lg font-semibold text-dark-slate mb-4">Available Providers</h3>
        
        {providers.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">No providers available</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {providers.slice(0, 5).map((provider) => (
              <Card key={provider.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {provider.user.firstName[0]}{provider.user.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-dark-slate">
                          {provider.user.firstName} {provider.user.lastName}
                        </h4>
                        <p className="text-sm text-gray-600 capitalize">
                          {provider.user.role.replace('_', ' ')}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3 h-3 ${i < Math.floor(provider.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">
                            {provider.rating.toFixed(1)} ({provider.reviewCount} reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button className="bg-primary hover:bg-primary/90">
                      Book
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
