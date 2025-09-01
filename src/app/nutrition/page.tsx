import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Flame, Beef, Wheat, Fish } from "lucide-react";

const nutritionData = {
  calories: {
    label: "Calories",
    current: 1850,
    target: 2500,
    unit: "kcal",
    icon: Flame,
    color: "bg-primary",
  },
  protein: {
    label: "Protein",
    current: 120,
    target: 150,
    unit: "g",
    icon: Beef,
    color: "bg-red-500",
  },
  carbs: {
    label: "Carbohydrates",
    current: 200,
    target: 300,
    unit: "g",
    icon: Wheat,
    color: "bg-yellow-500",
  },
  fats: {
    label: "Fats",
    current: 60,
    target: 70,
    unit: "g",
    icon: Fish,
    color: "bg-blue-500",
  },
};

export default function NutritionPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline">Daily Nutrition</CardTitle>
            <CardDescription>Your intake for today.</CardDescription>
          </div>
          <LogMealDialog />
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          {Object.values(nutritionData).map((item) => (
            <Card key={item.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {item.label}
                </CardTitle>
                <item.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-headline">
                  {item.current}
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}/ {item.target} {item.unit}
                  </span>
                </div>
                <Progress
                  value={(item.current / item.target) * 100}
                  className="mt-2 h-2"
                  aria-label={`${item.label} intake`}
                />
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function LogMealDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Log Meal</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Log a Meal</DialogTitle>
          <DialogDescription>
            Add your meal details here. This is a demo and won't save your data.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="meal" className="text-right">
              Meal
            </Label>
            <Input id="meal" placeholder="e.g., Chicken and Rice" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="calories" className="text-right">
              Calories
            </Label>
            <Input id="calories" type="number" placeholder="kcal" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="protein" className="text-right">
              Protein
            </Label>
            <Input id="protein" type="number" placeholder="g" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Log Meal</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
