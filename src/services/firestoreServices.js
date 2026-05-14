// src/services/firestoreServices.js
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Cria um serviço no Firestore.
 *
 * @param {object} serviceData - título, descrição, preço etc.
 * @param {object} session - usuário logado (uid, email, name/role).
 * @returns {Promise<string>} id do documento criado.
 */
export async function createService(serviceData, session) {
  const servicesRef = collection(db, "services");

  const payload = {
    ...serviceData,
    ownerId: session.uid || session.id || null,
    ownerEmail: session.email || null,
    ownerName: session.name || session.displayName || session.email,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(servicesRef, payload);
  return docRef.id;
}

/**
 * Lista TODOS os serviços (para a tela pública).
 */
export async function listAllServices() {
  const servicesRef = collection(db, "services");
  const q = query(servicesRef, orderBy("createdAt", "desc"));

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

/**
 * Lista serviços de um prestador específico (para "Meus serviços").
 */
export async function listServicesByOwner(ownerId) {
  const servicesRef = collection(db, "services");
  const q = query(
    servicesRef,
    where("ownerId", "==", ownerId),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

/**
 * Atualiza um serviço existente.
 *
 * @param {string} serviceId
 * @param {object} data - campos a atualizar
 */
export async function updateService(serviceId, data) {
  const ref = doc(db, "services", serviceId);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Deleta um serviço.
 *
 * @param {string} serviceId
 */
export async function deleteService(serviceId) {
  const ref = doc(db, "services", serviceId);
  await deleteDoc(ref);
}
