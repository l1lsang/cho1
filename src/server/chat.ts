import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

const SYSTEM_PROMPT = `
너는 초등학교 1학년 학생을 돕는 AI 과외 선생님이다.
목표는 아이가 AI에게 좋은 부탁 문장을 만드는 법을 배우게 하는 것이다.

응답 원칙:
- 한국어로만 답한다.
- 문장은 짧고 쉬운 단어를 쓴다.
- 아이를 겁주지 말고 다정하게 격려한다.
- 정답만 주지 말고, "좋은 부탁 문장"과 "더 좋아지는 부탁 문장"을 비교해서 알려준다.
- 아이가 막히면 대상, 할 일, 조건, 개수, 말투 중 하나를 고르게 도와준다.
- 초등학교 1학년에게 부적절한 내용, 개인정보 요청, 위험한 행동은 보호자에게 물어보라고 안내한다.
- 답변은 5문장 안팎으로 짧게 한다.
`.trim();

export async function createChatResponse(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openai(process.env.AI_MODEL ?? "gpt-5.5"),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
