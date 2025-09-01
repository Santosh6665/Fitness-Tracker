
import { db } from "@/firebase/client";
import { UserProfile, userProfileSchema } from "@/lib/types";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

/**
 * Creates or updates a user's profile in Firestore.
 * This function is typically called after a user signs up.
 */
export async function createUserProfile(
  userId: string,
  data: Omit<UserProfile, "id">
): Promise<void> {
  try {
    await setDoc(doc(db, "users", userId), {
      ...data,
      id: userId,
    });
  } catch (error) {
    console.error("Error creating user profile: ", error);
    throw new Error("Unable to create user profile.");
  }
}

/**
 * Retrieves a user's profile from Firestore.
 */
export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Validate data with Zod schema
      return userProfileSchema.parse({ ...data, id: userId });
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error getting user profile: ", error);
    throw new Error("Unable to retrieve user profile.");
  }
}

/**
 * Updates a user's profile in Firestore.
 */
export async function updateUserProfile(
  userId: string,
  data: Partial<Omit<UserProfile, "id">>
): Promise<void> {
  try {
    const docRef = doc(db, "users", userId);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error("Error updating user profile: ", error);
    throw new Error("Unable to update user profile.");
  }
}
