"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { exercises, type Exercise } from "@/lib/data";

const muscleGroups = [
  "All",
  ...Array.from(new Set(exercises.map((e) => e.muscleGroup))),
];

export default function ExercisesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("All");

  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      const matchesSearch = exercise.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesMuscleGroup =
        selectedMuscleGroup === "All" ||
        exercise.muscleGroup === selectedMuscleGroup;
      return matchesSearch && matchesMuscleGroup;
    });
  }, [searchTerm, selectedMuscleGroup]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for an exercise..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search exercises"
              />
            </div>
            <Select
              value={selectedMuscleGroup}
              onValueChange={setSelectedMuscleGroup}
            >
              <SelectTrigger className="w-full md:w-[180px]" aria-label="Filter by muscle group">
                <SelectValue placeholder="Filter by muscle" />
              </SelectTrigger>
              <SelectContent>
                {muscleGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredExercises.map((exercise) => (
          <ExerciseCard key={exercise.name} exercise={exercise} />
        ))}
        {filteredExercises.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground">
            <p>No exercises found. Try adjusting your search or filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ExerciseCard({ exercise }: { exercise: Exercise }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col">
          <CardHeader>
            <div className="relative aspect-video mb-4">
              <Image
                src={exercise.imageUrl}
                alt={exercise.name}
                data-ai-hint={exercise.dataAiHint}
                fill
                className="rounded-md object-cover"
              />
            </div>
            <CardTitle className="font-headline">{exercise.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{exercise.muscleGroup}</Badge>
              <Badge variant="outline">{exercise.equipment}</Badge>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="link" className="p-0">View Details</Button>
          </CardFooter>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">{exercise.name}</DialogTitle>
          <DialogDescription>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary">{exercise.muscleGroup}</Badge>
              <Badge variant="outline">{exercise.equipment}</Badge>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="relative aspect-video">
            <iframe
              width="100%"
              height="100%"
              src={exercise.videoUrl}
              title={`YouTube video player: ${exercise.name}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="rounded-lg"
            ></iframe>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Instructions</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {exercise.instructions}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
