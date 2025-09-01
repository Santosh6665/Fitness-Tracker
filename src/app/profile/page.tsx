
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/components/auth/auth-provider";
import { getUserProfile, updateUserProfile } from "@/services/userService";
import { UserProfile } from "@/lib/types";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const profileFormSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters long."),
  age: z.coerce.number().min(16, "Must be at least 16").max(100),
  gender: z.enum(["male", "female", "other"]),
  weight: z.coerce.number().min(30, "Invalid weight").max(300),
  height: z.coerce.number().min(100, "Invalid height").max(250),
  fitnessLevel: z.enum(["beginner", "intermediate", "advanced"]),
  goals: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one goal.",
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const goalItems = [
  { id: "weight_loss", label: "Weight Loss" },
  { id: "muscle_gain", label: "Muscle Gain" },
  { id: "endurance", label: "Improve Endurance" },
  { id: "general_fitness", label: "General Fitness" },
  { id: "flexibility", label: "Improve Flexibility" },
];

export default function ProfilePage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
        displayName: "",
        age: undefined,
        weight: undefined,
        height: undefined,
        goals: [],
    },
  });

  useEffect(() => {
    async function fetchProfile() {
      if (user) {
        setIsFetching(true);
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            form.reset({
              displayName: profile.displayName || user.displayName || "",
              age: profile.age,
              gender: profile.gender,
              weight: profile.weight,
              height: profile.height,
              fitnessLevel: profile.fitnessLevel,
              goals: profile.goals || [],
            });
          }
        } catch (error) {
          console.error(error);
          toast({ variant: "destructive", title: "Failed to load profile." });
        } finally {
          setIsFetching(false);
        }
      } else if (!isAuthLoading) {
        // If auth is done loading and there's no user, stop fetching.
        setIsFetching(false);
      }
    }
    fetchProfile();
  }, [user, isAuthLoading, form, toast]);


  async function onSubmit(data: ProfileFormValues) {
    if (!user) return;
    setIsLoading(true);
    try {
      await updateUserProfile(user.uid, data);
      toast({
        title: "Profile Updated",
        description: "Your information has been saved successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not save your profile. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching || isAuthLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                    <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 25" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl><RadioGroupItem value="male" /></FormControl>
                        <FormLabel className="font-normal">Male</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl><RadioGroupItem value="female" /></FormControl>
                        <FormLabel className="font-normal">Female</FormLabel>
                      </FormItem>
                       <FormItem className="flex items-center space-x-2">
                        <FormControl><RadioGroupItem value="other" /></FormControl>
                        <FormLabel className="font-normal">Other</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 70" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 175" {...field} value={field.value ?? ''}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fitness Profile</CardTitle>
            <CardDescription>
              Tell us about your fitness level and goals.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="fitnessLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fitness Level</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3">
                        <FormControl><RadioGroupItem value="beginner" /></FormControl>
                        <FormLabel className="font-normal">Beginner</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3">
                        <FormControl><RadioGroupItem value="intermediate" /></FormControl>
                        <FormLabel className="font-normal">Intermediate</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3">
                        <FormControl><RadioGroupItem value="advanced" /></FormControl>
                        <FormLabel className="font-normal">Advanced</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="goals"
              render={() => (
                <FormItem>
                  <FormLabel>Goals</FormLabel>
                   <FormDescription>Select all that apply.</FormDescription>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {goalItems.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name="goals"
                      render={({ field }) => (
                        <FormItem
                          key={item.id}
                          className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), item.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== item.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {item.label}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}

function ProfileSkeleton() {
    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
            </div>
             <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-24 w-full" />
            </div>
             <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end">
            <Skeleton className="h-10 w-36" />
        </div>
      </div>
    );
  }

    

    