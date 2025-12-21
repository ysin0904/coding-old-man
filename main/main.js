const WORKER_URL = "https://gemini-proxy.ysin0904.workers.dev";
const MAX_TURNS = 8;
function buildSystemInstruction() {
  return `
당신은 노년층 사용자를 돕는 친절한 한국어 AI 도우미 '돌봄이'입니다.
항상 존댓말을 사용하세요.
쉬운 단어와 짧은 문장으로 설명하세요.
`.trim();
}

document.addEventListener("DOMContentLoaded", () => {
  // 채팅 관련
  const inputEl = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendButton");
  const chatContainer = document.getElementById("answerSection");
  const defaultMessage = document.getElementById("defaultMessage");

  // 모달 관련
  const openBtn = document.getElementById("openBtn");
  const closeBtn = document.getElementById("closeBtn");
  const modal = document.getElementById("modalOverlay");

  if (!inputEl || !sendBtn || !chatContainer) {
    console.error("필수 DOM 요소 누락");
    return;
  }

  const history = [];

  if (openBtn && closeBtn && modal) {
    openBtn.addEventListener("click", () => {
      modal.style.display = "flex";
    });

    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.style.display = "none";
    });
  }

  sendBtn.addEventListener("click", () => sendMessage(inputEl.value));

  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage(inputEl.value);
    }
  });

  window.selectPrompt = (text) => {
    sendMessage(text);
  };

  async function sendMessage(rawText) {
    const text = rawText.trim();
    if (!text) return;

    defaultMessage.style.display = "none";
    inputEl.value = "";
    sendBtn.disabled = true;

    appendMessage("user", text);
    history.push({ role: "user", text });
    trimHistory();

    const loadingId = appendMessage(
      "ai",
      "답변을 작성 중입니다. 잠시만 기다려 주세요..."
    );

    try {
      const aiText = await requestAI(history);
      replaceMessageText(loadingId, aiText);

      history.push({ role: "assistant", text: aiText });
      trimHistory();
    } catch (e) {
      console.error(e);
      replaceMessageText(
        loadingId,
        "죄송합니다. 서버 오류로 답변을 가져오지 못했습니다."
      );
    } finally {
      sendBtn.disabled = false;
      scrollToBottom();
    }
  }

  async function requestAI(messages) {
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.text }],
    }));

    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: buildSystemInstruction() }],
        },
      }),
    });

    if (!response.ok) {
      throw new Error("AI 서버 오류");
    }

    const data = await response.json();
    return (
      data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ||
      "답변을 생성하지 못했습니다."
    );
  }

  function appendMessage(role, text) {
    const id = "msg_" + Date.now();

    const wrapper = document.createElement("div");
    wrapper.className = role === "user" ? "my-question" : "AI-question";
    wrapper.dataset.msgId = id;

    const bubble = document.createElement("div");
    bubble.className = role === "user" ? "my-answer" : "AI-answer";
    bubble.textContent = text;

    wrapper.appendChild(bubble);
    chatContainer.appendChild(wrapper);
    scrollToBottom();

    return id;
  }

  function replaceMessageText(id, text) {
    const target = chatContainer.querySelector(`[data-msg-id="${id}"]`);
    if (!target) return;
    target.querySelector("div").textContent = text;
  }

  function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  function trimHistory() {
    if (history.length > MAX_TURNS * 2) {
      history.splice(0, history.length - MAX_TURNS * 2);
    }
  }
});
