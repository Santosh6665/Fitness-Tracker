
"use client";

import { useState } from "react";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Bot, Sparkles, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
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
import { processOnboarding, type ProcessOnboardingOutput } from "@/ai/flows/process-onboarding";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { updateUserProfile } from "@/services/userService";

const personalDetailsSchema = z.object({
  age: z.coerce.number().min(16, "Must be at least 16").max(100),
  gender: z.enum(["male", "female", "other"]),
  weight: z.coerce.number().min(30, "Invalid weight").max(300),
  height: z.coerce.number().min(100, "Invalid height").max(250),
});

const fitnessLevelSchema = z.object({
  fitnessLevel: z.enum(["beginner", "intermediate", "advanced"]),
});

const goalsSchema = z.object({
  goals: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one goal.",
  }),
});

const formSchema = personalDetailsSchema.merge(fitnessLevelSchema).merge(goalsSchema);

type OnboardingFormValues = z.infer<typeof formSchema>;

const goalItems = [
  { id: "weight_loss", label: "Weight Loss" },
  { id: "muscle_gain", label: "Muscle Gain" },
  { id: "endurance", label: "Improve Endurance" },
  { id: "general_fitness", label: "General Fitness" },
  { id: "flexibility", label: "Improve Flexibility" },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<ProcessOnboardingOutput | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const methods = useForm<OnboardingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      gender: undefined,
      weight: undefined,
      height: undefined,
      fitnessLevel: undefined,
      goals: [],
    },
  });

  const { trigger, getValues } = methods;

  const nextStep = async () => {
    let isValid = false;
    if (step === 1) isValid = await trigger(["age", "gender", "weight", "height"]);
    if (step === 2) isValid = await trigger(["fitnessLevel"]);
    if (step === 3) isValid = await trigger(["goals"]);

    if (isValid || step === 0) {
      setStep((s) => s + 1);
    }
  };

  const prevStep = () => setStep((s) => s - 1);

  const onSubmit = async (data: OnboardingFormValues) => {
    setIsLoading(true);
    setAiResult(null);
    try {
      if (user) {
        await updateUserProfile(user.uid, data);
      }
      const result = await processOnboarding(data);
      setAiResult(result);
      setStep(s => s + 1);
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: "There was a problem processing your information. Please try again.",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const steps = [
    <WelcomeStep key="welcome" nextStep={nextStep} />,
    <PersonalDetailsStep key="details" />,
    <FitnessLevelStep key="level" />,
    <GoalsStep key="goals" />,
    <SummaryStep key="summary" values={getValues()} />,
  ];

  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-2xl">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="font-headline">
                {step < 5 ? `Welcome to AI Powered Fitness Tracker` : `Your AI Summary`}
              </CardTitle>
              <CardDescription>
                {step < 5 ? `Let's personalize your fitness journey. (${step} / 4)` : `Here's what our AI thinks!`}
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-[350px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  {step === 5 ? <AIResultDisplay result={aiResult} isLoading={isLoading} /> : steps[step]}
                </motion.div>
              </AnimatePresence>
            </CardContent>
            {step < 5 && (
              <CardFooter className="flex justify-between">
                {step > 0 && step < 5 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    <ArrowLeft className="mr-2" /> Previous
                  </Button>
                )}
                { step === 0 && <div /> }
                {step < 4 && (
                   <Button type="button" onClick={nextStep}>
                    Next <ArrowRight className="ml-2" />
                  </Button>
                )}
                {step === 4 && (
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? <><Loader2 className="animate-spin mr-2"/> Analyzing...</> : <>Get AI Plan <Sparkles className="ml-2" /></>}
                  </Button>
                )}
              </CardFooter>
            )}
          </form>
        </FormProvider>
      </Card>
    </div>
  );
}

function WelcomeStep({ nextStep }: { nextStep: () => void }) {
  return (
    <div className="text-center flex flex-col items-center justify-center h-full space-y-6 p-4 md:p-8">
        <Bot size={64} className="text-primary"/>
        <h2 className="text-2xl font-bold font-headline">Let's Build Your Perfect Plan</h2>
        <p className="text-muted-foreground max-w-md">
            This short questionnaire will help our AI understand your needs, goals, and current fitness level to create a truly personalized experience for you.
        </p>
    </div>
  );
}

function PersonalDetailsStep() {
  const { control } = useFormContext();
  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="age"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Age</FormLabel>
            <FormControl><Input type="number" placeholder="e.g., 25" {...field} value={field.value ?? ''} /></FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="gender"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Gender</FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col sm:flex-row gap-4">
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
          control={control}
          name="weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weight (kg)</FormLabel>
              <FormControl><Input type="number" placeholder="e.g., 70" {...field} value={field.value ?? ''} /></FormControl>
               <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={control}
          name="height"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Height (cm)</FormLabel>
              <FormControl><Input type="number" placeholder="e.g., 175" {...field} value={field.value ?? ''} /></FormControl>
               <FormMessage />
            </FormItem>
          )}
        />
       </div>
    </div>
  );
}

function FitnessLevelStep() {
    const { control } = useFormContext();
    return (
        <div className="space-y-4">
             <FormField
                control={control}
                name="fitnessLevel"
                render={({ field }) => (
                <FormItem className="space-y-3">
                    <FormLabel>What is your current fitness level?</FormLabel>
                    <FormControl>
                    <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2"
                    >
                        <FormItem className="flex items-center space-x-3 space-y-0 p-2 rounded-md hover:bg-muted/50 transition-colors">
                            <FormControl><RadioGroupItem value="beginner" /></FormControl>
                            <FormLabel className="font-normal cursor-pointer flex-1">
                                <strong>Beginner:</strong> Just starting out, little to no experience.
                            </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 p-2 rounded-md hover:bg-muted/50 transition-colors">
                            <FormControl><RadioGroupItem value="intermediate" /></FormControl>
                            <FormLabel className="font-normal cursor-pointer flex-1">
                                <strong>Intermediate:</strong> Consistent with exercise for 6+ months.
                            </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 p-2 rounded-md hover:bg-muted/50 transition-colors">
                            <FormControl><RadioGroupItem value="advanced" /></FormControl>
                            <FormLabel className="font-normal cursor-pointer flex-1">
                                <strong>Advanced:</strong> Multiple years of structured training.
                            </FormLabel>
                        </FormItem>
                    </RadioGroup>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
    );
}

function GoalsStep() {
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name="goals"
      render={() => (
        <FormItem>
          <div className="mb-4">
            <FormLabel className="text-base">What are your main fitness goals?</FormLabel>
            <FormDescription>Select all that apply.</FormDescription>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {goalItems.map((item) => (
              <FormField
                key={item.id}
                control={control}
                name="goals"
                render={({ field }) => {
                  return (
                    <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-muted/50 transition-colors">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(item.id)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...(field.value || []), item.id])
                              : field.onChange(field.value?.filter((value) => value !== item.id));
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer flex-1">{item.label}</FormLabel>
                    </FormItem>
                  );
                }}
              />
            ))}
          </div>
          <FormMessage className="pt-2" />
        </FormItem>
      )}
    />
  );
}

function SummaryStep({ values }: { values: OnboardingFormValues }) {
  return (
    <div className="space-y-4">
        <h3 className="text-lg font-bold font-headline">Please review your information</h3>
        <Card>
            <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div><span className="font-semibold text-muted-foreground">Age:</span> {values.age}</div>
                <div><span className="font-semibold text-muted-foreground">Gender:</span> <span className="capitalize">{values.gender}</span></div>
                <div><span className="font-semibold text-muted-foreground">Weight:</span> {values.weight} kg</div>
                <div><span className="font-semibold text-muted-foreground">Height:</span> {values.height} cm</div>
                <div className="col-span-1 sm:col-span-2"><span className="font-semibold text-muted-foreground">Fitness Level:</span> <span className="capitalize">{values.fitnessLevel}</span></div>
                <div className="col-span-1 sm:col-span-2"><span className="font-semibold text-muted-foreground">Goals:</span> {values.goals.map(g => goalItems.find(i => i.id === g)?.label).join(', ')}</div>
            </CardContent>
        </Card>
        <p className="text-sm text-muted-foreground">
            Click "Get AI Plan" to submit your information and receive your personalized fitness recommendations.
        </p>
    </div>
  )
}

function AIResultDisplay({ result, isLoading }: { result: ProcessOnboardingOutput | null, isLoading: boolean }) {
    const router = useRouter();

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4 text-center p-8">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <h2 className="text-xl font-semibold">Analyzing your profile...</h2>
                <p className="text-muted-foreground">Our AI is crunching the numbers to build your personalized plan.</p>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="text-center p-8">
                <p>Something went wrong. Please try again.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 text-center">
            <h3 className="text-xl font-bold font-headline">{result.welcomeMessage}</h3>
            <p className="text-muted-foreground">{result.initialSummary}</p>
            <div className="flex justify-center pt-4">
                 <Button onClick={() => router.push('/')}>Start Your First Workout</Button>
            </div>
        </div>
    )
}
