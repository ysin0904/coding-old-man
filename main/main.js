const WORKER_URL = "https://gemini-proxy.ysin0904.workers.dev";

const MAX_TURNS = 8;
const history = [];

function buildSystemInstruction() {
    return `
당신은 노년층 사용자를 돕는 친절하고 따뜻한 한국어 AI 도우미 '돌봄이'입니다.
항상 공손한 존댓말을 사용하세요.
쉬운 단어와 짧은 문장으로 설명하세요.
마크다운 문법은 사용하지 마세요.
`.trim();
}

window.selectPrompt = function (text) {
    const inputEl = document.getElementById("userInput");
    const sendBtn = document.getElementById("sendButton");

    inputEl.value = text;
    sendBtn.click();
};

document.addEventListener("DOMContentLoaded", () => {
    const inputEl = document.getElementById("userInput");
    const sendBtn = document.getElementById("sendButton");
    const chatContainer = document.getElementById("answerSection");
    const defaultMessage = document.getElementById("defaultMessage");

    if (!inputEl || !sendBtn || !chatContainer || !defaultMessage) {
        console.error("필수 DOM 요소를 찾지 못했습니다.");
        return;
    }

    sendBtn.addEventListener("click", sendMessage);
    inputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }
    });

    async function sendMessage() {
        const text = inputEl.value.trim();
        if (!text) return;

        defaultMessage.style.display = "none";
        inputEl.value = "";
        sendBtn.disabled = true;

        appendMessage("user", text);

        history.push({ role: "user", text });
        trimHistory();

        const loadingId = appendMessage("ai", "답변을 작성 중입니다. 잠시만 기다려 주세요...");

        try {
            const aiText = await requestAI();
            replaceMessage(loadingId, aiText);

            history.push({ role: "model", text: aiText });
            trimHistory();
        } catch (e) {
            replaceMessage(loadingId, "서버 오류로 답변을 받지 못했습니다.");
            console.error(e);
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

    function scrollToBottom() {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    async function requestAI() {
        const payload = {
            contents: history.map(m => ({
                role: m.role === "model" ? "model" : "user",
                parts: [{ text: m.text }]
            })),
            systemInstruction: {
                parts: [{ text: buildSystemInstruction() }]
            }
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

        return (
            data?.candidates?.[0]?.content?.parts
                ?.map(p => p.text || "")
                .join("")
            || "답변을 생성하지 못했습니다."
        );
    }
    function appendMessage(role, text) {
        const id = "msg_" + Date.now();

        const wrapper = document.createElement("div");
        wrapper.className = role === "user" ? "my-question" : "AI-question";
        wrapper.dataset.id = id;

        const bubble = document.createElement("div");
        bubble.className = role === "user" ? "my-answer" : "AI-answer";
        bubble.textContent = text;

        wrapper.appendChild(bubble);
        chatContainer.appendChild(wrapper);
        scrollToBottom();

        return id;
    }

    function replaceMessage(id, text) {
        const el = chatContainer.querySelector(`[data-id="${id}"] .AI-answer`);
        if (el) el.textContent = text;
    }
});
