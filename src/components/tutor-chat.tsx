"use client";

import { useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import {
  BookOpen,
  CheckCircle2,
  MessageCircle,
  RefreshCw,
  Save,
  SendHorizontal,
  Sparkles,
  Wand2,
} from "lucide-react";
import { MessageResponse } from "@/components/ai-elements/message";
import { saveLearningMoment } from "@/lib/lesson-store";

const missions = [
  {
    id: "specific",
    title: "또렷하게 말하기",
    detail: "무엇을, 몇 개, 어떤 모양인지 넣어 봐요.",
    starter: "동물 이야기를 세 문장으로 써 줘. 쉬운 말로 말해 줘.",
  },
  {
    id: "role",
    title: "역할 정해주기",
    detail: "AI에게 선생님, 퀴즈 친구 같은 역할을 줘요.",
    starter: "너는 받아쓰기 선생님이야. 1학년 단어로 문제 3개를 내 줘.",
  },
  {
    id: "steps",
    title: "차례대로 부탁하기",
    detail: "먼저, 다음, 마지막을 넣어 부탁해요.",
    starter: "먼저 문제를 내고, 다음에 힌트를 주고, 마지막에 칭찬해 줘.",
  },
];

const commandParts = [
  {
    label: "대상",
    examples: ["고양이", "받아쓰기", "덧셈 문제"],
  },
  {
    label: "할 일",
    examples: ["이야기 써 줘", "문제 내 줘", "쉽게 설명해 줘"],
  },
  {
    label: "조건",
    examples: ["세 문장으로", "1학년 말로", "힌트 먼저"],
  },
  {
    label: "말투",
    examples: ["다정하게", "재미있게", "천천히"],
  },
];

const warmups = [
  "공룡이 나오는 짧은 이야기를 세 문장으로 써 줘.",
  "1학년 덧셈 문제를 쉬운 것부터 3개 내 줘.",
  "내가 쓴 부탁 문장을 더 좋게 고쳐 줘.",
];

type SaveState = "idle" | "saving" | "saved" | "off";

export function TutorChat() {
  const [input, setInput] = useState("");
  const [selectedMissionId, setSelectedMissionId] = useState(missions[0].id);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const selectedMission = useMemo(
    () => missions.find((mission) => mission.id === selectedMissionId) ?? missions[0],
    [selectedMissionId],
  );

  const { messages, sendMessage, status, stop, error, regenerate } = useChat();

  const isBusy = status === "submitted" || status === "streaming";

  async function submitPrompt(nextPrompt = input) {
    const trimmed = nextPrompt.trim();

    if (!trimmed || isBusy) {
      return;
    }

    const promptWithLesson = [
      `오늘 연습: ${selectedMission.title}`,
      `아이의 부탁 문장: ${trimmed}`,
      "이 부탁 문장을 칭찬하고, 더 좋아지는 방법을 하나만 알려 줘.",
    ].join("\n");

    setInput("");
    setSaveState("saving");
    sendMessage({ text: promptWithLesson });

    const result = await saveLearningMoment({
      missionId: selectedMission.id,
      missionTitle: selectedMission.title,
      prompt: trimmed,
    });

    setSaveState(result.ok ? "saved" : "off");
  }

  function addExample(text: string) {
    setInput((current) => {
      const next = current.trim() ? `${current.trim()} ${text}` : text;
      return next;
    });
  }

  return (
    <main className="learning-shell">
      <section className="lesson-panel" aria-label="명령하기 연습 도구">
        <div className="brand-row">
          <div className="mascot" aria-hidden="true">
            <span className="mascot-eye left" />
            <span className="mascot-eye right" />
            <span className="mascot-smile" />
          </div>
          <div>
            <p className="eyebrow">초1 AI 과외</p>
            <h1>말랑명령 연습장</h1>
          </div>
        </div>

        <div className="mission-box">
          <div className="section-title">
            <BookOpen size={18} aria-hidden="true" />
            <h2>오늘의 연습</h2>
          </div>
          <div className="mission-list" role="list">
            {missions.map((mission) => (
              <button
                className={mission.id === selectedMission.id ? "mission active" : "mission"}
                key={mission.id}
                onClick={() => {
                  setSelectedMissionId(mission.id);
                  setInput(mission.starter);
                }}
                type="button"
              >
                <span>{mission.title}</span>
                <small>{mission.detail}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="builder-box">
          <div className="section-title">
            <Wand2 size={18} aria-hidden="true" />
            <h2>부탁 문장 조립</h2>
          </div>
          <div className="part-grid">
            {commandParts.map((part) => (
              <div className="part" key={part.label}>
                <b>{part.label}</b>
                <div className="chip-row">
                  {part.examples.map((example) => (
                    <button key={example} onClick={() => addExample(example)} type="button">
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="chat-panel" aria-label="AI 과외 대화">
        <div className="chat-header">
          <div>
            <p className="eyebrow">AI 선생님</p>
            <h2>부탁을 더 똑똑하게 만드는 시간</h2>
          </div>
          <div className="save-pill" data-state={saveState}>
            {saveState === "saving" ? <RefreshCw size={15} aria-hidden="true" /> : <Save size={15} aria-hidden="true" />}
            <span>
              {saveState === "saved"
                ? "저장됨"
                : saveState === "off"
                  ? "Firebase 대기"
                  : saveState === "saving"
                    ? "저장 중"
                    : "연습 준비"}
            </span>
          </div>
        </div>

        <div className="conversation" aria-live="polite">
          {messages.length === 0 ? (
            <div className="empty-state">
              <Sparkles size={28} aria-hidden="true" />
              <h3>처음 부탁은 이렇게 해볼까요?</h3>
              <p>무엇을 원하는지, 몇 개가 필요한지, 어떤 말투면 좋은지 넣으면 AI가 훨씬 잘 도와줘요.</p>
              <div className="warmup-grid">
                {warmups.map((warmup) => (
                  <button key={warmup} onClick={() => setInput(warmup)} type="button">
                    {warmup}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <article className={`message ${message.role}`} key={message.id}>
                <div className="message-avatar" aria-hidden="true">
                  {message.role === "user" ? <MessageCircle size={18} /> : <Sparkles size={18} />}
                </div>
                <div className="message-bubble">
                  <strong>{message.role === "user" ? "나의 부탁" : "AI 선생님"}</strong>
                  {message.parts.map((part, index) =>
                    part.type === "text" ? <MessageResponse key={index}>{part.text}</MessageResponse> : null,
                  )}
                </div>
              </article>
            ))
          )}

          {isBusy ? (
            <div className="thinking">
              <span />
              <span />
              <span />
            </div>
          ) : null}
        </div>

        {error ? (
          <div className="error-row" role="alert">
            <span>답변을 가져오지 못했어요.</span>
            <button onClick={() => regenerate()} type="button">
              다시
            </button>
          </div>
        ) : null}

        <form
          className="prompt-form"
          onSubmit={(event) => {
            event.preventDefault();
            submitPrompt();
          }}
        >
          <label htmlFor="prompt">AI에게 부탁하기</label>
          <div className="input-row">
            <textarea
              id="prompt"
              onChange={(event) => setInput(event.target.value)}
              placeholder="예: 너는 친절한 선생님이야. 1학년 받아쓰기 문제를 3개 내 줘."
              rows={3}
              value={input}
            />
            <div className="action-stack">
              {isBusy ? (
                <button aria-label="답변 멈추기" className="icon-button ghost" onClick={stop} type="button">
                  <RefreshCw size={19} aria-hidden="true" />
                </button>
              ) : (
                <button aria-label="부탁 보내기" className="icon-button send" disabled={!input.trim()} type="submit">
                  <SendHorizontal size={20} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
          <div className="formula-row">
            <CheckCircle2 size={16} aria-hidden="true" />
            <span>대상 + 할 일 + 조건 + 말투를 넣으면 좋아요.</span>
          </div>
        </form>
      </section>
    </main>
  );
}
