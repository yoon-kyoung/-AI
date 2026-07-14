export interface ClovaMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ClovaChatOptions {
  topP?: number;
  topK?: number;
  maxTokens?: number;
  temperature?: number;
}

const API_KEY = import.meta.env.VITE_CLOVA_API_KEY;
const MODEL = import.meta.env.VITE_CLOVA_MODEL ?? "HCX-005";
const HOST = import.meta.env.VITE_CLOVA_HOST ?? "https://clovastudio.stream.ntruss.com";

export class ClovaConfigError extends Error {}

export async function chatCompletion(
  messages: ClovaMessage[],
  options: ClovaChatOptions = {}
): Promise<string> {
  if (!API_KEY) {
    throw new ClovaConfigError(
      "VITE_CLOVA_API_KEY가 설정되지 않았습니다. .env 파일을 확인하세요."
    );
  }

  const response = await fetch(
    `${HOST}/testapp/v1/chat-completions/${MODEL}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
        topP: options.topP ?? 0.8,
        topK: options.topK ?? 0,
        maxTokens: options.maxTokens ?? 256,
        temperature: options.temperature ?? 0.5,
      }),
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`HyperCLOVA X 요청 실패 (${response.status}): ${body}`);
  }

  const data = await response.json();
  return data?.result?.message?.content ?? "";
}
