// src/services/firestoreReviews.js
import { db } from "../firebase";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

const SERVICES_COLLECTION = "services";

/**
 * Adiciona uma avaliação a um serviço.
 *
 * @param {object} params
 * @param {string} params.serviceId - ID do serviço avaliado
 * @param {object} params.user      - usuário logado (precisa ter uid e email)
 * @param {number} params.rating    - nota de 1 a 5
 * @param {string} [params.comment] - comentário opcional
 */
export async function addServiceReview({
  serviceId,
  user,
  rating,
  comment = "",
}) {
  if (!serviceId) throw new Error("addServiceReview: serviceId obrigatório");
  if (!user?.uid) throw new Error("addServiceReview: user.uid obrigatório");
  if (!rating) throw new Error("addServiceReview: rating obrigatório");

  // /services/{serviceId}
  const serviceRef = doc(db, SERVICES_COLLECTION, serviceId);
  // /services/{serviceId}/reviews
  const reviewsRef = collection(serviceRef, "reviews");

  const reviewPayload = {
    serviceId,
    userUid: user.uid,
    userName: user.displayName || user.name || user.email || "Usuário",
    rating: Number(rating),
    comment,
    createdAt: serverTimestamp(),
  };

  // cria um novo documento na subcoleção "reviews"
  const reviewDoc = await addDoc(reviewsRef, reviewPayload);

  // atualiza a média de avaliações do serviço
  await recomputeServiceRating(serviceId);

  return { id: reviewDoc.id, ...reviewPayload };
}

/**
 * Lista todas as avaliações de um serviço.
 */
export async function listServiceReviews(serviceId) {
  const serviceRef = doc(db, SERVICES_COLLECTION, serviceId);
  const reviewsRef = collection(serviceRef, "reviews");
  const snap = await getDocs(reviewsRef);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

/**
 * Recalcula a média de estrelas e salva no documento do serviço.
 */
export async function recomputeServiceRating(serviceId) {
  const serviceRef = doc(db, SERVICES_COLLECTION, serviceId);
  const reviewsRef = collection(serviceRef, "reviews");
  const snap = await getDocs(reviewsRef);

  if (snap.empty) {
    await updateDoc(serviceRef, {
      rating: null,
      ratingCount: 0,
    });
    return;
  }

  let sum = 0;
  snap.forEach((d) => {
    const data = d.data();
    sum += Number(data.rating || 0);
  });

  const ratingCount = snap.size;
  const ratingAverage = sum / ratingCount;

  await updateDoc(serviceRef, {
    rating: ratingAverage,
    ratingCount,
  });
}
