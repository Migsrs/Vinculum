// src/services/firestoreUsers.js
import { db } from "../firebase";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

const USERS_COLLECTION = "users";

export async function saveUserProfile(user = {}, extra = {}) {
  try {
    const uid = user.uid ?? extra.uid;
    const email = user.email ?? extra.email;

    if (!uid) {
      throw new Error("saveUserProfile: uid não informado.");
    }
    if (!email) {
      throw new Error("saveUserProfile: email não informado.");
    }

    const usersRef = collection(db, USERS_COLLECTION);
    const ref = doc(usersRef, uid);
    const now = serverTimestamp();

    const payload = {
      uid,
      email,
      name: user.displayName ?? extra.name ?? "",
      role: extra.role ?? "client",
      city: extra.city ?? "",
      birthDate: extra.birthDate ?? null,
      needs: extra.needs ?? "",
      mainCaregiver: extra.mainCaregiver ?? "",
      bio: extra.bio ?? "",
      createdAt: extra.createdAt ?? now,
      updatedAt: now,
    };

    await setDoc(ref, payload, { merge: true });
  } catch (err) {
    console.error("[Firestore] Erro ao salvar usuário:", err);
    throw err;
  }
}

export async function listAllUsers() {
  const usersRef = collection(db, USERS_COLLECTION);
  const snap = await getDocs(usersRef);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}
