const WORKER_URL = "https://-gemini-proxy.ysin0904.workers.dev";

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
    inputEl.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage(inputEl.value);
        }
    });

    AppState.initialized = true;

    async function sendMessage(rawText) {
        const text = (rawText || "").trim();
        if (!text) return;

        defaultMessage.style.display = "none";
        sendBtn.disabled = true;

        appendMessage("user", text);
        scrollToBottom();

        history.push({ role: "user", text });
        trimHistory();

        inputEl.value = "";

        const loadingId = appendMessage("ai", "답변을 작성 중입니다. 잠시만 기다려 주세요...");
        scrollToBottom();

        try {
            const aiText = await requestAI(history);
            replaceMessageText(loadingId, aiText);

            history.push({ role: "assistant", text: aiText });
            trimHistory();
        } catch (err) {
            replaceMessageText(loadingId, "죄송합니다. 답변을 가져오지 못했습니다.");
            console.error(err);
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
        const payload = {
            system: buildSystemInstruction(),
            messages
        };

        const response = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const data = await response.json();
        return data.text || "";
    }

    function appendMessage(role, text) {
        const id = `msg_${Date.now()}`;

        const wrapper = document.createElement("div");
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
        const target = chatContainer.querySelector(`[data-msg-id="${msgId}"]`);
        if (!target) return;
        target.querySelector("div").textContent = newText;
    }
});
