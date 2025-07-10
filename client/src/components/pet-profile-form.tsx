import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { insertPetSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const petFormSchema = insertPetSchema.omit({ ownerId: true });
type PetFormData = z.infer<typeof petFormSchema>;

interface PetProfileFormProps {
  onSuccess?: () => void;
}

export default function PetProfileForm({ onSuccess }: PetProfileFormProps) {
  const { toast } = useToast();

  const form = useForm<PetFormData>({
    resolver: zodResolver(petFormSchema),
    defaultValues: {
      name: "",
      breed: "",
      species: "dog",
      age: undefined,
      weight: undefined,
      gender: "",
      color: "",
      medicalNotes: "",
    },
  });

  const createPetMutation = useMutation({
    mutationFn: async (data: PetFormData) => {
      const res = await apiRequest("POST", "/api/pets", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pets"] });
      toast({
        title: "Pet added successfully",
        description: "Your pet profile has been created",
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create pet profile",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PetFormData) => {
    createPetMutation.mutate(data);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Add Your Pet</CardTitle>
        <CardDescription>Create a profile for your furry friend</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="Your pet's name"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="species">Species *</Label>
            <Select onValueChange={(value) => form.setValue("species", value)} defaultValue="dog">
              <SelectTrigger>
                <SelectValue placeholder="Select species" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dog">Dog</SelectItem>
                <SelectItem value="cat">Cat</SelectItem>
                <SelectItem value="bird">Bird</SelectItem>
                <SelectItem value="rabbit">Rabbit</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.species && (
              <p className="text-sm text-red-500">{form.formState.errors.species.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="breed">Breed *</Label>
            <Input
              id="breed"
              {...form.register("breed")}
              placeholder="e.g., Golden Retriever"
            />
            {form.formState.errors.breed && (
              <p className="text-sm text-red-500">{form.formState.errors.breed.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age (years)</Label>
              <Input
                id="age"
                type="number"
                {...form.register("age", { valueAsNumber: true })}
                placeholder="Age"
              />
              {form.formState.errors.age && (
                <p className="text-sm text-red-500">{form.formState.errors.age.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                {...form.register("weight", { valueAsNumber: true })}
                placeholder="Weight"
              />
              {form.formState.errors.weight && (
                <p className="text-sm text-red-500">{form.formState.errors.weight.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select onValueChange={(value) => form.setValue("gender", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                {...form.register("color")}
                placeholder="Pet's color"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicalNotes">Medical Notes</Label>
            <Textarea
              id="medicalNotes"
              {...form.register("medicalNotes")}
              placeholder="Any important medical information..."
              className="min-h-[80px]"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={createPetMutation.isPending}
          >
            {createPetMutation.isPending ? "Adding Pet..." : "Add Pet"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
