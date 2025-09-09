
import { db } from "@/firebase/client";
import { DailyGoal, dailyGoalsLogSchema, DailyGoalsLog } from "@/lib/types";
import { doc, setDoc, getDoc, collection, getDocs, query } from "firebase/firestore";
import { format } from "date-fns";

function getTodaysDate() {
  return format(new Date(), "yyyy-MM-dd");
}

export async function getTodaysGoals(
  userId: string
): Promise<DailyGoal[] | null> {
  const dateId = getTodaysDate();
  try {
    const docRef = doc(db, "users", userId, "goals", dateId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const parsed = dailyGoalsLogSchema.safeParse(data);
      if (parsed.success) {
          return parsed.data.goals;
      }
      return null;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting today's goals log: ", error);
    throw new Error("Unable to retrieve goals log.");
  }
}

export async function updateTodaysGoals(
  userId: string,
  goals: DailyGoal[]
): Promise<void> {
  const dateId = getTodaysDate();
  try {
    const docRef = doc(db, "users", userId, "goals", dateId);
    const dataToSave = { goals };
    await setDoc(docRef, dataToSave, { merge: true });
  } catch (error) {
    console.error("Error updating goals log: ", error);
    throw new Error("Unable to update goals log.");
  }
}

export async function getGoalsHistory(userId: string): Promise<({date: string} & DailyGoalsLog)[]> {
    try {
        const historyCollection = collection(db, "users", userId, "goals");
        const q = query(historyCollection);
        const querySnapshot = await getDocs(q);
        
        const history: ({date: string} & DailyGoalsLog)[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const parsed = dailyGoalsLogSchema.safeParse(data);
            if (parsed.success) {
                history.push({
                    date: doc.id,
                    ...parsed.data,
                });
            }
        });

        return history;

    } catch (error) {
        console.error("Error getting goals history: ", error);
        throw new Error("Unable to retrieve goals history.");
    }
}
