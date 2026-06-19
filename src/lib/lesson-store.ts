import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ensureAnonymousUser, getFirestoreClient } from "@/lib/firebase";

export type LearningMoment = {
  missionId: string;
  missionTitle: string;
  prompt: string;
};

export async function saveLearningMoment(moment: LearningMoment) {
  const db = getFirestoreClient();

  if (!db) {
    return { ok: false, reason: "Firebase 환경변수가 아직 설정되지 않았어요." };
  }

  const user = await ensureAnonymousUser();

  if (!user) {
    return { ok: false, reason: "익명 로그인을 시작하지 못했어요." };
  }

  await addDoc(collection(db, "practiceSessions"), {
    ...moment,
    userId: user.uid,
    app: "first-grade-command-tutor",
    createdAt: serverTimestamp(),
  });

  return { ok: true };
}
