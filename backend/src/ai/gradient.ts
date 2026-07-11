const GRADIENT_CHAT_URL = "https://inference.do-ai.run/v1/chat/completions";
const MODEL = "llama3.3-70b-instruct";

export class GradientError extends Error {}

interface ChatMessage {
  role: "system" | "user";
  content: string;
}

export async function chatCompletion(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.GRADIENT_MODEL_ACCESS_KEY;
  if (!apiKey) {
    throw new GradientError("GRADIENT_MODEL_ACCESS_KEY is not set");
  }

  const res = await fetch(GRADIENT_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new GradientError(`Gradient inference request failed: ${res.status} ${body}`);
  }

  const data = (await res.json()) as {
    choices: Array<{ message: { content: string } }>;
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new GradientError("Gradient inference returned no content");
  }

  return content;
}
