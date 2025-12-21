const WORKER_URL = "https://gemini-proxy.ysin0904.workers.dev";
const MAX_TURNS = 8;
const MAX_OUTPUT_TOKENS = 1024;

const AppState = {
  initialized: false,
  queuedPrompts: []
};

function buildSystemInstruction() {
  return `
당신은 노년층 사용자를 돕는 친절하고 따뜻한 한국어 AI 도우미 '돌봄이'입니다.
항상 공손한 존댓말을 사용하세요.
쉬운 단어와 짧은 문장으로 설명하세요.
마크다운 문법은 사용하지 마세요.
`.trim();
}

document.addEventListener("DOMContentLoaded", () => {
  const inputEl = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendButton");
  const chatContainer = document.getElementById("answerSection");
  const defaultMessage = document.getElementById("defaultMessage");

  if (!inputEl || !sendBtn || !chatContainer || !defaultMessage) {
    console.error("필수 DOM 요소를 찾지 못했습니다.");
    return;
  }

  const history = [];

  function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  sendBtn.addEventListener("click", () => sendMessage(inputEl.value));

  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage(inputEl.value);
    }
  });

  window.selectPrompt = (text) => {
    if (!AppState.initialized) {
      AppState.queuedPrompts.push(text);
      return;
    }
    sendMessage(text);
  };

  AppState.initialized = true;

  async function sendMessage(rawText) {
    const text = (rawText || "").trim();
    if (!text) return;

    // 초기 화면 메시지 숨기기
    if (defaultMessage) defaultMessage.style.display = "none";
    sendBtn.disabled = true;

    // 1. 사용자 메시지 추가
    appendMessage("user", text);
    scrollToBottom();

    history.push({ role: "user", text });
    trimHistory();

    inputEl.value = "";

    // 2. AI 로딩 메시지 추가
    const loadingId = appendMessage(
      "ai",
      "답변을 작성 중입니다. 잠시만 기다려 주세요..."
    );
    scrollToBottom();

    try {
      const aiText = await requestAI(history);
      
      // 3. 응답 결과에 따른 텍스트 교체
      if (!aiText || aiText.trim() === "") {
          replaceMessageText(loadingId, "죄송합니다. 답변을 생성하지 못했습니다.");
      } else {
          replaceMessageText(loadingId, aiText);
          history.push({ role: "assistant", text: aiText });
          trimHistory();
      }
    } catch (err) {
      console.error("Error 상세:", err);
      replaceMessageText(
        loadingId,
        "죄송합니다. 서버와 연결이 원활하지 않습니다."
      );
    } finally {
      sendBtn.disabled = false;
      scrollToBottom();
    }
  }

  function trimHistory() {
    if (history.length > MAX_TURNS * 2) {
      history.splice(0, history.length - MAX_TURNS * 2);
    }
  }

  async function requestAI(messages) {
    const contents = messages.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.text }]
    }));

    const payload = {
      contents,
      systemInstruction: {
        parts: [{ text: buildSystemInstruction() }]
      },
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: MAX_OUTPUT_TOKENS
      }
    };

    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(`API 오류: ${response.status} - ${errorMsg}`);
    }

    const data = await response.json();
    console.log("서버 응답 데이터 구조 확인:", data); // 디버깅용

    // 프록시 서버의 응답 구조에 맞춰 파싱 (일반적인 Gemini 구조)
    try {
        if (data.candidates && data.candidates[0].content) {
            const parts = data.candidates[0].content.parts || [];
            return parts.map(p => p.text || "").join("");
        } else if (data.text) {
            // 프록시에서 text 키로 바로 주는 경우 대응
            return data.text;
        }
    } catch (e) {
        console.error("데이터 파싱 실패:", e);
        return "데이터 처리 중 오류가 발생했습니다.";
    }
    
    return "답변을 찾을 수 없습니다.";
  }

  function appendMessage(role, text) {
    const id = `msg_${Date.now()}_${Math.random()}`;

    const wrapper = document.createElement("div");
    // 사용자일 경우 오른쪽, AI일 경우 왼쪽 정렬 클래스 확인 필요
    wrapper.className = role === "user" ? "my-question" : "AI-question";
    wrapper.dataset.msgId = id;

    const bubble = document.createElement("div");
    bubble.className = role === "user" ? "my-answer" : "AI-answer";
    bubble.textContent = text;

    wrapper.appendChild(bubble);
    chatContainer.appendChild(wrapper);

    return id;
  }

  function replaceMessageText(msgId, newText) {
    const target = chatContainer.querySelector(
      `[data-msg-id="${msgId}"]`
    );
    if (!target) return;
    
    // bubble 클래스(.my-answer 또는 .AI-answer)를 직접 찾아 수정
    const bubble = target.querySelector("div");
    if (bubble) {
        bubble.textContent = newText;
    }
  }
});

// 모달 관련 코드 (기존과 동일)
const openBtn = document.getElementById("openBtn");
const closeBtn = document.getElementById("closeBtn");
const modalOverlay = document.getElementById("modalOverlay");

if (openBtn && closeBtn && modalOverlay) {
    openBtn.addEventListener("click", () => {
        modalOverlay.style.display = "flex";
    });
    closeBtn.addEventListener("click", () => {
        modalOverlay.style.display = "none";
    });
    modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.style.display = "none";
        }
    });
}
