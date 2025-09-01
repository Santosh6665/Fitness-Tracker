import { Share2 } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { goals, recentWorkouts } from "@/lib/data";
import { ProgressChart } from "@/components/dashboard/progress-chart";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Welcome back, Fitness Warrior!</CardTitle>
          <CardDescription>
            Here's a snapshot of your fitness journey. Keep up the great work!
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild>
            <Link href="/onboarding">Personalize Your Plan (Onboarding Demo)</Link>
          </Button>
        </CardFooter>
      </Card>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">Progress Overview</CardTitle>
            <CardDescription>Your weight and squat progression over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressChart />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Your Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {goals.map((goal, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm font-medium mb-1">
                    <span>{goal.name}</span>
                    <span className="text-muted-foreground">{goal.current}{goal.unit} / {goal.target}{goal.unit}</span>
                  </div>
                  <Progress value={(goal.current / goal.target) * 100} aria-label={`${goal.name} progress`} />
                </div>
              ))}
            </CardContent>
            <CardFooter>
               <Button variant="outline" className="w-full">Set a New Goal</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-headline">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Workout</TableHead>
                    <TableHead className="text-right">Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentWorkouts.map((workout, index) => (
                    <TableRow key={index}>
                      <TableCell>{workout.date}</TableCell>
                      <TableCell className="font-medium">{workout.type}</TableCell>
                      <TableCell className="text-right">{workout.duration}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
              <CardHeader>
                  <CardTitle className="font-headline text-2xl text-center">Milestone Unlocked!</CardTitle>
                  <CardDescription className="text-center">You've hit a new Personal Best on Squats!</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center">
                  <div className="text-6xl font-bold text-primary font-headline">105kg</div>
                  <p className="text-muted-foreground mt-2">Awesome job!</p>
              </CardContent>
              <CardFooter>
                   <Button className="w-full">
                      <Share2 className="mr-2 h-4 w-4"/>
                      Share Achievement
                  </Button>
              </CardFooter>
          </Card>
      </div>
    </div>
  );
}
