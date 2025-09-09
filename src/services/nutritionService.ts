
import { db } from "@/firebase/client";
import { DailyNutritionLog, dailyNutritionLogSchema } from "@/lib/types";
import { doc, setDoc, getDoc, updateDoc, collection, getDocs, query } from "firebase/firestore";
import { format } from "date-fns";

function getTodaysDate() {
  return format(new Date(), "yyyy-MM-dd");
}

export async function getTodaysNutrition(
  userId: string
): Promise<DailyNutritionLog | null> {
  const dateId = getTodaysDate();
  try {
    const docRef = doc(db, "users", userId, "nutrition", dateId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return dailyNutritionLogSchema.parse(data);
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting today's nutrition log: ", error);
    throw new Error("Unable to retrieve nutrition log.");
  }
}

export async function updateTodaysNutrition(
  userId: string,
  data: DailyNutritionLog
): Promise<void> {
  const dateId = getTodaysDate();
  try {
    const docRef = doc(db, "users", userId, "nutrition", dateId);
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    console.error("Error updating nutrition log: ", error);
    throw new Error("Unable to update nutrition log.");
  }
}


export async function getNutritionHistory(userId: string): Promise<DailyNutritionLog[]> {
    try {
        const historyCollection = collection(db, "users", userId, "nutrition");
        const q = query(historyCollection);
        const querySnapshot = await getDocs(q);
        
        const history: any[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            history.push({
                date: doc.id,
                ...data,
            });
        });

        return history;

    } catch (error) {
        console.error("Error getting nutrition history: ", error);
        throw new Error("Unable to retrieve nutrition history.");
    }
}
    
