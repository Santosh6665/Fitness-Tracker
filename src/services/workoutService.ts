
import { db } from "@/firebase/client";
import { DailyWorkoutLog, dailyWorkoutLogSchema, WorkoutEntry } from "@/lib/types";
import { doc, setDoc, getDoc, collection, getDocs, query, limit } from "firebase/firestore";
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


export async function getWorkoutHistory(userId: string): Promise<WorkoutEntry[]> {
    try {
        const historyCollection = collection(db, "users", userId, "workouts");
        const q = query(historyCollection, limit(30));
        const querySnapshot = await getDocs(q);
        
        const history: WorkoutEntry[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            history.push({
                date: doc.id,
                sessions: data.sessions,
                duration: data.duration,
                calories: data.calories,
            });
        });

        history.sort((a, b) => b.date.localeCompare(a.date));
        
        return history.slice(0, 10);

    } catch (error) {
        console.error("Error getting workout history: ", error);
        throw new Error("Unable to retrieve workout history.");
    }
}

    