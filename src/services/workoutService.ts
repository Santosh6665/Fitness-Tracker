
import { db } from "@/firebase/client";
import { DailyWorkoutLog, dailyWorkoutLogSchema } from "@/lib/types";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { format } from "date-fns";

function getTodaysDate() {
  return format(new Date(), "yyyy-MM-dd");
}

export async function getTodaysWorkoutLog(
  userId: string
): Promise<DailyWorkoutLog | null> {
  const dateId = getTodaysDate();
  try {
    const docRef = doc(db, "users", userId, "workouts", dateId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return dailyWorkoutLogSchema.parse(data);
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting today's workout log: ", error);
    throw new Error("Unable to retrieve workout log.");
  }
}

export async function updateTodaysWorkoutLog(
  userId: string,
  data: DailyWorkoutLog
): Promise<void> {
  const dateId = getTodaysDate();
  try {
    const docRef = doc(db, "users", userId, "workouts", dateId);
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    console.error("Error updating workout log: ", error);
    throw new Error("Unable to update workout log.");
  }
}
