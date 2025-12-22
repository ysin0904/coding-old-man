const WORKER_URL = "https://gemini-proxy.ysin0904.workers.dev";
const MAX_TURNS = 8;
const MAX_OUTPUT_TOKENS = 1024;

function buildSystemInstruction() {
  return `당신은 노년층 사용자를 돕는 친절하고 따뜻한 한국어 AI 도우미 '돌봄이'입니다.
항상 공손한 존댓말을 사용하세요.
쉬운 단어와 짧은 문장으로 설명하세요.
마크다운 문법은 사용하지 마세요.`;
}

document.addEventListener("DOMContentLoaded", () => {
  const inputEl = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendButton");
  const chatContainer = document.getElementById("answerSection");
  const defaultMessage = document.getElementById("defaultMessage");

  const openBtn = document.getElementById("openBtn");
  const closeBtn = document.getElementById("closeBtn");
  const modalOverlay = document.getElementById("modalOverlay");

  const history = [];

  function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  async function sendMessage(rawText) {
    const text = (rawText || "").trim();
    if (!text) return;

    if (defaultMessage) defaultMessage.style.display = "none";
    sendBtn.disabled = true;

    appendMessage("user", text);
    scrollToBottom();

    history.push({ role: "user", text });
    inputEl.value = "";

    const loadingId = appendMessage(
      "ai",
      "답변을 생각하고 있어요. 잠시만 기다려 주세요."
    );
    scrollToBottom();

    try {
      const aiText = await requestAI(history);
      updateMessageText(loadingId, aiText);

      history.push({ role: "assistant", text: aiText });
      if (history.length > MAX_TURNS * 2) {
        history.splice(0, history.length - MAX_TURNS * 2);
      }
    } catch (err) {
      console.error(err);
      updateMessageText(
        loadingId,
        "죄송합니다. 서버와 연결하는 중 문제가 발생했습니다."
      );
    } finally {
      sendBtn.disabled = false;
      scrollToBottom();
    }
  }

  async function requestAI(messages) {
    const contents = messages.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.text }]
    }));

    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "system",
            parts: [{ text: buildSystemInstruction() }]
          },
          ...contents
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: MAX_OUTPUT_TOKENS
        }
      })
    });

    if (!response.ok) {
      throw new Error(`서버 오류 (${response.status})`);
    }

    const data = await response.json();
    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "답변을 불러오지 못했습니다."
    );
  }

  function appendMessage(role, text) {
    const id = `msg_${Date.now()}_${Math.random()}`;

    const wrapper = document.createElement("div");
    wrapper.className = role === "user" ? "my-question" : "AI-question";
    wrapper.id = id;

    const bubble = document.createElement("div");
    bubble.className = role === "user" ? "my-answer" : "AI-answer";
    bubble.textContent = text;

    wrapper.appendChild(bubble);
    chatContainer.appendChild(wrapper);
    return id;
  }

  function updateMessageText(id, newText) {
    const wrapper = document.getElementById(id);
    if (!wrapper) return;
    const bubble = wrapper.querySelector("div");
    if (bubble) bubble.textContent = newText;
  }

  sendBtn.addEventListener("click", () => sendMessage(inputEl.value));
  inputEl.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage(inputEl.value);
    }
  });

  // 🔹 모달 제어
  if (openBtn && modalOverlay) {
    openBtn.addEventListener("click", () => {
      modalOverlay.style.display = "flex";
    });
  }

  if (closeBtn && modalOverlay) {
    closeBtn.addEventListener("click", () => {
      modalOverlay.style.display = "none";
    });
  }

  if (modalOverlay) {
    modalOverlay.addEventListener("click", e => {
      if (e.target === modalOverlay) {
        modalOverlay.style.display = "none";
      }
    });
  }

  // 🔹 HTML onclick 대응 (중요)
  window.selectPrompt = function (text) {
    inputEl.value = text;
    sendMessage(text);
  };
});
