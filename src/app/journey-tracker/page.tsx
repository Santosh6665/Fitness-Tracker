
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  calculateJourney,
  CalculateJourneyOutput,
} from '@/ai/flows/calculate-journey';
import {
  Sparkles,
  Loader2,
  Map,
  Footprints,
  Plus,
  Rocket,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/components/auth/auth-provider';
import {
  getTodaysWorkoutLog,
  updateTodaysWorkoutLog,
} from '@/services/workoutService';
import { DailyWorkoutLog } from '@/lib/types';

const initialWorkoutData: DailyWorkoutLog = {
  sessions: 0,
  duration: 0,
  calories: 0,
  steps: 0,
};

export default function JourneyTrackerPage() {
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [journeyResult, setJourneyResult] =
    useState<CalculateJourneyOutput | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLogging, setIsLogging] = useState(false);

  const handleCalculate = async () => {
    if (!startLocation || !endLocation) {
      toast({
        variant: 'destructive',
        title: 'Missing Locations',
        description: 'Please enter both a start and end location.',
      });
      return;
    }
    setIsLoading(true);
    setJourneyResult(null);
    try {
      const result = await calculateJourney({ startLocation, endLocation });
      setJourneyResult(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description:
          'Failed to calculate the journey. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogSteps = async () => {
    if (!user || !journeyResult) return;
    setIsLogging(true);
    try {
      const currentLog =
        (await getTodaysWorkoutLog(user.uid)) || initialWorkoutData;
      const newWorkoutLog: DailyWorkoutLog = {
        ...currentLog,
        steps: (currentLog.steps || 0) + journeyResult.steps,
      };
      await updateTodaysWorkoutLog(user.uid, newWorkoutLog);
      toast({
        title: 'Steps Logged!',
        description: `${journeyResult.steps} steps have been added to your daily total.`,
      });
      setJourneyResult(null);
      setStartLocation('');
      setEndLocation('');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to Log Steps',
        description: 'Could not save your steps. Please try again.',
      });
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Rocket /> Manual Journey Tracker
          </CardTitle>
          <CardDescription>
            Plan a walk or run, and our AI will estimate the distance and steps.
            Log your journey to contribute to your daily goals!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-location">Start Location</Label>
              <Input
                id="start-location"
                placeholder="e.g., Central Park, NYC"
                value={startLocation}
                onChange={(e) => setStartLocation(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-location">End Location</Label>
              <Input
                id="end-location"
                placeholder="e.g., Times Square, NYC"
                value={endLocation}
                onChange={(e) => setEndLocation(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleCalculate}
            disabled={isLoading || !startLocation || !endLocation}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Sparkles className="mr-2" />
            )}
            Calculate Journey
          </Button>
        </CardFooter>
      </Card>

      {isLoading && (
        <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 min-h-[150px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4">Our AI is mapping out your journey...</p>
        </div>
      )}

      {journeyResult && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Sparkles /> Journey Estimate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTitle className="flex items-center gap-2">
                <Map /> Distance
              </AlertTitle>
              <AlertDescription className="text-xl font-bold font-headline">
                {journeyResult.distance.toFixed(2)} km
              </AlertDescription>
            </Alert>
            <Alert>
              <AlertTitle className="flex items-center gap-2">
                <Footprints /> Estimated Steps
              </AlertTitle>
              <AlertDescription className="text-xl font-bold font-headline">
                {journeyResult.steps.toLocaleString()} steps
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleLogSteps}
              disabled={isLogging}
              className="w-full"
            >
              {isLogging ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Plus className="mr-2" />
              )}
              Add to Daily Log
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
