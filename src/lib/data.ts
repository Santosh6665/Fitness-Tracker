
import { format, subDays } from 'date-fns';

export const goals = [
  { name: "Lose 5kg", current: 2, target: 5, unit: "kg" },
  { name: "Run 10k", current: 6, target: 10, unit: "km" },
  { name: "Workout 4x/week", current: 3, target: 4, unit: "workouts" },
];

const today = new Date();

export const recentWorkouts = [
  { date: format(today, 'yyyy-MM-dd'), type: "Full Body Strength", duration: "60 min" },
  { date: format(subDays(today, 2), 'yyyy-MM-dd'), type: "Cardio & Core", duration: "45 min" },
  { date: format(subDays(today, 4), 'yyyy-MM-dd'), type: "Upper Body Power", duration: "55 min" },
];

export const progressData = [
  { month: "Jan", weight: 75, squat: 80, calories: 2600, workouts: 3 },
  { month: "Feb", weight: 74, squat: 85, calories: 2500, workouts: 4 },
  { month: "Mar", weight: 74, squat: 90, calories: 2550, workouts: 4 },
  { month: "Apr", weight: 73, squat: 95, calories: 2450, workouts: 5 },
  { month: "May", weight: 72, squat: 100, calories: 2400, workouts: 4 },
  { month: "Jun", weight: 71, squat: 105, calories: 2350, workouts: 5 },
];

export const exercises = [
  {
    name: "Barbell Bench Press",
    muscleGroup: "Chest",
    equipment: "Barbell, Bench",
    instructions: "Lie on a flat bench with your feet firmly on the ground. Grip the barbell with hands slightly wider than shoulder-width apart. Lift the bar from the rack and hold it straight over your chest with arms locked. Lower the bar slowly until it touches your mid-chest, then push it back up to the starting position.",
    videoUrl: "https://www.youtube.com/embed/rT7DgCr-3pg",
    imageUrl: "https://picsum.photos/seed/bench-press/600/400",
    dataAiHint: "bench press"
  },
  {
    name: "Barbell Squat",
    muscleGroup: "Legs",
    equipment: "Barbell, Squat Rack",
    instructions: "Stand with your feet shoulder-width apart, with the barbell resting on your upper back. Keeping your chest up and back straight, lower your body as if sitting in a chair. Go as low as you can comfortably, ideally until your thighs are parallel to the floor. Push through your heels to return to the starting position.",
    videoUrl: "https://www.youtube.com/embed/U3mC6_oCl_s",
    imageUrl: "https://picsum.photos/seed/squat/600/400",
    dataAiHint: "man squatting"
  },
  {
    name: "Deadlift",
    muscleGroup: "Back",
    equipment: "Barbell",
    instructions: "Stand with your mid-foot under the barbell. Bend over and grab the bar with a shoulder-width grip. Bend your knees until your shins touch the bar. Lift your chest up and straighten your lower back. Stand up with the weight, keeping the bar close to your body.",
    videoUrl: "https://www.youtube.com/embed/ytGaGIn3SjE",
    imageUrl: "https://picsum.photos/seed/deadlift/600/400",
    dataAiHint: "deadlift workout"
  },
  {
    name: "Overhead Press",
    muscleGroup: "Shoulders",
    equipment: "Barbell",
    instructions: "Stand with the bar on your front shoulders, hands slightly wider than shoulder-width. Press the bar over your head until your arms are fully extended. Lower it back to your shoulders under control.",
    videoUrl: "https://www.youtube.com/embed/2yjwXTZQDDI",
    imageUrl: "https://picsum.photos/seed/overhead-press/600/400",
    dataAiHint: "weight lifting"
  },
  {
    name: "Pull-up",
    muscleGroup: "Back",
    equipment: "Pull-up Bar",
    instructions: "Grab the pull-up bar with your palms facing away from you and your hands shoulder-width apart. Hang with your arms fully extended. Pull your body up until your chin is over the bar. Lower yourself back down with control.",
    videoUrl: "https://www.youtube.com/embed/eGo4E9VtLpg",
    imageUrl: "https://picsum.photos/seed/pull-up/600/400",
    dataAiHint: "man pullup"
  },
  {
    name: "Dumbbell Lunges",
    muscleGroup: "Legs",
    equipment: "Dumbbells",
    instructions: "Stand with your feet together, holding a dumbbell in each hand. Step forward with one leg and lower your hips until both knees are bent at a 90-degree angle. Push back to the starting position and repeat with the other leg.",
    videoUrl: "https://www.youtube.com/embed/3yXU2fk3L0o",
    imageUrl: "https://picsum.photos/seed/lunges/600/400",
    dataAiHint: "lunge exercise"
  },
  {
    name: "Plank",
    muscleGroup: "Core",
    equipment: "None",
    instructions: "Lie face down and prop yourself up on your forearms and toes, keeping your body in a straight line from head to heels. Engage your core and hold the position.",
    videoUrl: "https://www.youtube.com/embed/ASdvN_XEl_c",
    imageUrl: "https://picsum.photos/seed/plank/600/400",
    dataAiHint: "woman planking"
  },
  {
    name: "Bicep Curl",
    muscleGroup: "Arms",
    equipment: "Dumbbells",
    instructions: "Stand or sit holding a dumbbell in each hand with an underhand grip. Curl the weights up towards your shoulders, keeping your elbows stationary. Squeeze your biceps at the top, then lower the weights back down slowly.",
    videoUrl: "https://www.youtube.com/embed/ykJmrZ5v0Oo",
    imageUrl: "https://picsum.photos/seed/bicep-curl/600/400",
    dataAiHint: "bicep curl"
  }
];

export type Exercise = (typeof exercises)[0];


export const weeklyActivity = [
  { day: "Mon", workouts: 1, duration: 60 },
  { day: "Tue", workouts: 0, duration: 0 },
  { day: "Wed", workouts: 1, duration: 45 },
  { day: "Thu", workouts: 0, duration: 0 },
  { day: "Fri", workouts: 1, duration: 55 },
  { day: "Sat", workouts: 1, duration: 70 },
  { day: "Sun", workouts: 0, duration: 0 },
];

export type WeeklyActivity = typeof weeklyActivity;
