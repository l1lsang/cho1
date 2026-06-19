import { FirebaseError } from "firebase/app";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ensureAnonymousUser, getFirestoreClient } from "@/lib/firebase";

export type LearningMoment = {
  missionId: string;
  missionTitle: string;
  prompt: string;
};

export async function saveLearningMoment(moment: LearningMoment) {
  try {
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
  } catch (error) {
    if (
      error instanceof FirebaseError &&
      error.code === "auth/admin-restricted-operation"
    ) {
      console.warn("[firebase] Firebase Console에서 익명 로그인을 활성화해 주세요.");
      return { ok: false, reason: "Firebase 익명 로그인이 비활성화되어 있어요." };
    }

    console.error("[firebase] 학습 기록 저장에 실패했습니다.", error);
    return { ok: false, reason: "학습 기록을 저장하지 못했어요." };
  }
}
