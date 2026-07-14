import { useState } from "react";
import { chatCompletion, type ClovaMessage } from "./lib/hyperclova";
import "./App.css";

function App() {
  const [messages, setMessages] = useState<ClovaMessage[]>([
    { role: "system", content: "당신은 친절한 한국어 어시스턴트입니다." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    if (!input.trim() || loading) return;

    const nextMessages: ClovaMessage[] = [
      ...messages,
      { role: "user", content: input },
    ];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const reply = await chatCompletion(nextMessages);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="chat">
      <h1>HyperCLOVA X 데모</h1>
      <div className="chat-log">
        {messages
          .filter((m) => m.role !== "system")
          .map((m, i) => (
            <div key={i} className={`bubble ${m.role}`}>
              <strong>{m.role === "user" ? "나" : "CLOVA"}</strong>
              <p>{m.content}</p>
            </div>
          ))}
      </div>

      {error && <p className="error">{error}</p>}

      <form
        className="chat-form"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요"
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? "전송 중..." : "보내기"}
        </button>
      </form>
    </main>
  );
}

export default App;
