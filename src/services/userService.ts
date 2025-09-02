
import { db } from "@/firebase/client";
import { UserProfile, userProfileSchema } from "@/lib/types";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

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

export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  try {
    console.log("Trying to get profile!")
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    console.log("Document Snap Found")

    if (docSnap.exists()) {
      console.log("Document Exists")
      const data = docSnap.data();
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
