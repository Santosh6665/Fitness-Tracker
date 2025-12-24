
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Play,
  Square,
  Timer,
  Footprints,
  Map,
  Loader2,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import {
  getTodaysWorkoutLog,
  updateTodaysWorkoutLog,
} from '@/services/workoutService';
import { DailyWorkoutLog } from '@/lib/types';
import { cn } from '@/lib/utils';

type TrackingStatus = 'idle' | 'tracking' | 'stopped';
type Position = {
  latitude: number;
  longitude: number;
};

const STEPS_PER_KM = 1400;
const initialWorkoutData: DailyWorkoutLog = {
  sessions: 0,
  duration: 0,
  calories: 0,
  steps: 0,
};

// Haversine distance formula
function getDistance(pos1: Position, pos2: Position): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((pos2.latitude - pos1.latitude) * Math.PI) / 180;
  const dLon = ((pos2.longitude - pos1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((pos1.latitude * Math.PI) / 180) *
      Math.cos((pos2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

export default function LiveTrackerPage() {
  const [status, setStatus] = useState<TrackingStatus>('idle');
  const [distance, setDistance] = useState(0); // in km
  const [duration, setDuration] = useState(0); // in seconds
  const [steps, setSteps] = useState(0);
  const [isLogging, setIsLogging] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const previousPositionRef = useRef<Position | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const timerIdRef = useRef<NodeJS.Timeout | null>(null);

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    return () => {
      // Cleanup on component unmount
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      if (timerIdRef.current) clearInterval(timerIdRef.current);
    };
  }, []);

  const resetState = () => {
    setStatus('idle');
    setDistance(0);
    setDuration(0);
    setSteps(0);
    previousPositionRef.current = null;
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    if (timerIdRef.current) clearInterval(timerIdRef.current);
  };

  const startTracking = () => {
    if (!('geolocation' in navigator)) {
      toast({
        variant: 'destructive',
        title: 'Geolocation Not Supported',
        description: 'Your browser does not support location tracking.',
      });
      return;
    }
    
    setIsStarting(true);
    resetState();

    navigator.geolocation.getCurrentPosition(
      (initialPosition) => {
        setIsStarting(false);
        setStatus('tracking');
        previousPositionRef.current = {
          latitude: initialPosition.coords.latitude,
          longitude: initialPosition.coords.longitude,
        };

        timerIdRef.current = setInterval(() => {
          setDuration((d) => d + 1);
        }, 1000);

        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            if (previousPositionRef.current) {
              const newPos = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              };
              const newDistance = getDistance(previousPositionRef.current, newPos);
              
              setDistance((d) => {
                  const totalDistance = d + newDistance;
                  setSteps(Math.floor(totalDistance * STEPS_PER_KM));
                  return totalDistance;
              });

              previousPositionRef.current = newPos;
            }
          },
          (error) => {
            console.error('Geolocation watch error:', error);
            toast({ variant: 'destructive', title: 'Location Error', description: error.message });
          },
          { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );
      },
      (error) => {
        setIsStarting(false);
        console.error('Geolocation error:', error);
        toast({
          variant: 'destructive',
          title: 'Location Access Denied',
          description:
            'Please grant location permissions to use this feature.',
        });
      }
    );
  };

  const stopTracking = () => {
    setStatus('stopped');
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    if (timerIdRef.current) clearInterval(timerIdRef.current);
  };

  const handleLogJourney = async () => {
    if (!user || status !== 'stopped') return;
    setIsLogging(true);
    try {
      const currentLog = (await getTodaysWorkoutLog(user.uid)) || initialWorkoutData;
      const newWorkoutLog: DailyWorkoutLog = {
        ...currentLog,
        duration: currentLog.duration + Math.round(duration / 60),
        steps: (currentLog.steps || 0) + steps,
        // For simplicity, we'll log this as a session. Calorie calculation could be more complex.
        sessions: currentLog.sessions + 1,
        calories: currentLog.calories + Math.round(steps * 0.04), // ~0.04 calories per step
      };
      await updateTodaysWorkoutLog(user.uid, newWorkoutLog);
      toast({
        title: 'Journey Logged!',
        description: 'Your live-tracked activity has been added to your daily totals.',
      });
      resetState();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to Log Journey',
        description: 'Could not save your activity. Please try again.',
      });
    } finally {
      setIsLogging(false);
    }
  };
  
  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const metrics = [
    { label: 'Duration', value: formatDuration(duration), icon: Timer },
    { label: 'Distance', value: `${distance.toFixed(2)} km`, icon: Map },
    { label: 'Estimated Steps', value: steps.toLocaleString(), icon: Footprints },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            Live Journey Tracker
          </CardTitle>
          <CardDescription>
            Start a session to track your walk or run in real-time. Keep this page open while you're active.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
            {status === 'idle' && (
                <Button size="lg" className="h-16 w-32" onClick={startTracking} disabled={isStarting}>
                    {isStarting ? <Loader2 className="animate-spin" /> : <><Play className="mr-2" /> Start</>}
                </Button>
            )}
            {status === 'tracking' && (
                <Button size="lg" className="h-16 w-32 bg-destructive hover:bg-destructive/90" onClick={stopTracking}>
                    <Square className="mr-2" /> Stop
                </Button>
            )}
             {status === 'stopped' && (
                <Button size="lg" className="h-16 w-32" onClick={() => resetState()}>
                    Start New
                </Button>
            )}
        </CardContent>
      </Card>
      
      {status !== 'idle' && (
        <Card>
            <CardHeader>
                <CardTitle className={cn("font-headline flex items-center gap-2", {
                    "text-green-500 animate-pulse": status === 'tracking'
                })}>
                  {status === 'tracking' ? 'Session in Progress...' : 'Session Summary'}
                </CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-3 gap-4">
                {metrics.map(metric => (
                    <div key={metric.label} className="flex flex-col items-center justify-center p-4 border rounded-lg bg-muted/50">
                        <metric.icon className="h-8 w-8 text-primary mb-2" />
                        <p className="text-sm text-muted-foreground">{metric.label}</p>
                        <p className="text-2xl font-bold font-headline">{metric.value}</p>
                    </div>
                ))}
            </CardContent>
            {status === 'stopped' && (
                <CardFooter>
                    <Button onClick={handleLogJourney} disabled={isLogging} className="w-full">
                        {isLogging ? <Loader2 className="animate-spin" /> : <><Plus className="mr-2" /> Add to Daily Log</>}
                    </Button>
                </CardFooter>
            )}
        </Card>
      )}

    </div>
  );
}
