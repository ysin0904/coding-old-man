const GEMINI_API_KEY = "AIzaSyB4amRjGgCcXHGiU0ZhZDwDIFsQzF_yfKM";
const GEMINI_MODEL = "gemini-2.5-flash";
const USE_CHAT_HISTORY = true;
const MAX_TURNS = 8; 
const MAX_OUTPUT_TOKENS = 1024; 
const MAX_CONTINUATIONS = 1;
const MAX_BLOCK_RETRIES = 1;

const AppState = { initialized: false, queuedPrompts: [] };

function buildSystemInstruction() {
    return `
당신은 노년층 사용자를 돕는 친절하고 따뜻한 한국어 AI 도우미 '돌봄이'입니다.
항상 공손하고 따뜻한 존댓말(해요체/하십시오체)을 사용하세요.
쉬운 단어와 짧은 문장으로 설명하며, 내용은 친절하게 1, 2, 3 단계로 안내할 수 있습니다.

[중요] 형식 규칙:
1. 마크다운 문법을 사용하지 마세요. (예: **굵게**, *기울임*, # 제목, - 목록 등을 사용하지 않고 순수 텍스트만 사용합니다.)
2. 문장의 시작이나 끝에 특수 기호(예: *, #, -, 굵은 글씨를 대체하는 기호)를 넣지 마세요.
3. 답변 길이를 적절히 조절하여 한 번에 이해할 수 있도록 합니다.

[중요] 내용 규칙:
1. 뉴스나 검색 결과를 인용할 때 원문 문장을 그대로 옮기지 말고, 사용자에게 이해하기 쉬운 말로 '요약'해서 전달합니다.
2. 불확실한 정보는 단정하지 않습니다.
`.trim();
}
window.selectPrompt = (promptText) => {
    const text = (promptText || "").trim();
    if (!text) return;

    if (!AppState.initialized) {
        AppState.queuedPrompts.push(text);
        return;
    }
    if (window.__sendMessage) window.__sendMessage(text);
};

document.addEventListener("DOMContentLoaded", () => {
    const inputEl = document.getElementById("userInput");
    const sendBtn = document.getElementById("sendButton");
    const chatContainer = document.getElementById("answerSection");
    const defaultMessage = document.getElementById("defaultMessage");
    const openBtn = document.getElementById("openBtn");
    const closeBtn = document.getElementById("closeBtn");
    const modalOverlay = document.getElementById("modalOverlay");
    
    if (!inputEl || !sendBtn || !chatContainer || !defaultMessage) {
        console.error("필수 DOM 요소를 찾지 못했습니다. HTML ID를 확인해 주세요.");
        return;
    }

    const history = [];

    function scrollToBottom() {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    if (openBtn && modalOverlay) openBtn.addEventListener("click", openModal);
    if (closeBtn && modalOverlay) closeBtn.addEventListener("click", closeModal);

    if (modalOverlay) {
        modalOverlay.addEventListener("click", (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
    });

    function openModal() {
        modalOverlay.style.display = "flex"; 
        modalOverlay.setAttribute("aria-hidden", "false");
    }
    function closeModal() {
        modalOverlay.style.display = "none";
        modalOverlay.setAttribute("aria-hidden", "true");
    }

    sendBtn.addEventListener("click", () => sendMessage(inputEl.value));
    inputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage(inputEl.value);
        }
    });
    window.__sendMessage = (text) => sendMessage(text);

    AppState.initialized = true;
    if (AppState.queuedPrompts.length) {
        const queued = [...AppState.queuedPrompts];
        AppState.queuedPrompts.length = 0;
        sendMessage(queued[queued.length - 1]); 
    }

    async function sendMessage(rawText) {
        const text = (rawText || "").trim();
        if (!text) {
            inputEl.focus();
            return;
        }
        if (defaultMessage) {
            defaultMessage.style.display = "none";
        }

        sendBtn.disabled = true;

        appendMessage("user", text);
        scrollToBottom();

        if (USE_CHAT_HISTORY) {
            history.push({ role: "user", parts: [{ text }] });
            trimHistory(history);
        }

        inputEl.value = "";
        inputEl.focus();

        const loadingId = appendMessage("ai", "답변을 작성 중입니다. 잠시만 기다려 주세요...");
        scrollToBottom();

        try {
            const aiTextRaw = await getAIResponseRobust(history, text);
            const aiTextClean = stripFormatting(aiTextRaw);

            replaceMessageText(loadingId, aiTextClean);

            if (USE_CHAT_HISTORY) {
                history.push({ role: "model", parts: [{ text: aiTextClean }] });
                trimHistory(history);
            }
        } catch (err) {
            replaceMessageText(loadingId, humanizeError(err));
            console.error("AI 응답 중 오류 발생:", err);
        } finally {
            sendBtn.disabled = false;
            scrollToBottom();
        }
    }

    function trimHistory(arr) {
        const maxItems = MAX_TURNS * 2;
        if (arr.length > maxItems) arr.splice(0, arr.length - maxItems);
    }

    function humanizeError(err) {
        const msg = String(err?.message || err || "");
        if (msg.includes("Failed to fetch")) {
            return "죄송합니다. 인터넷 연결 문제로 답변을 가져오지 못했습니다. 연결 상태를 확인해 주세요.";
        }
        if (msg.includes("HTTP 429")) {
            return "죄송합니다. 요청이 많아 잠시 지연되고 있습니다. 잠깐 후 다시 시도해 주세요.";
        }
        if (msg.includes("API Key")) {
             return "API 키 설정 오류입니다. 개발자에게 문의해 주세요.";
        }
        if (msg.includes("blocked")) {
            return "죄송합니다. 안전 규칙에 따라 이 질문에 대한 답변을 제공할 수 없습니다. 다른 질문을 해 주시겠어요?";
        }
        return "죄송합니다. 답변을 만들지 못했습니다. 잠시 후 다시 시도해 주세요.";
    }

    function stripFormatting(text) {
        if (!text) return "";
        let t = String(text);
        t = t.replace(/(\*\*\*|###|\*|\*\*|__|_)/g, ""); 
        t = t.replace(/^\s*[-*•]\s+/gm, "• "); 
        return t.trim();
    }

    async function getAIResponseRobust(historyArr, userText) {
        const baseContents = USE_CHAT_HISTORY
            ? historyArr
            : [{ role: "user", parts: [{ text: userText }] }];

        let r = await generateWithRetry(baseContents, userText);

        let accumulated = (r.text || "").trim();
        let finishReason = r.finishReason || null;

        if (!accumulated && r.blockReason) {
            throw new Error(`Content blocked: ${r.blockReason}`);
        }
        if (!accumulated) {
            throw new Error("Empty response received from API.");
        }
        let attempts = 0;
        while (attempts < MAX_CONTINUATIONS && finishReason === "MAX_TOKENS") {
            attempts += 1;

            const continuationPrompt = "방금 답변이 길어서 중간에 끊긴 것 같습니다. 앞부분을 반복하지 말고, 이어서만 계속 말씀해 주세요. 문장 중간에서 끊겼다면 자연스럽게 이어서 마무리해 주세요.";

            const contContents = [
                ...baseContents,
                { role: "model", parts: [{ text: accumulated }] },
                { role: "user", parts: [{ text: continuationPrompt }] },
            ];

            const r2 = await generateOnce(contContents);
            const next = (r2.text || "").trim();
            finishReason = r2.finishReason || null;

            if (!next) break;
            accumulated = accumulated.replace(/\s+$/g, "") + "\n" + next;
        }

        return accumulated;
    }
    
    async function generateWithRetry(contents, userText) {
        let r = await generateOnce(contents);
        let tries = 0;
        
        while (tries < MAX_BLOCK_RETRIES && isBlockedOrEmpty(r)) {
            tries += 1;
            
            const isNews = userText.includes("뉴스") || userText.includes("오늘의 뉴스");
            const retryPrompt = isNews
                ? "실시간 뉴스 기사 원문 인용은 피하고, 최근 주요 이슈를 분야별로 '쉬운 말로 요약'만 해주세요."
                : "방금 요청은 원문 인용 없이 '요약' 형태로만 도와주세요. 쉬운 존댓말로 부탁드립니다.";
            
            const retryContents = [...contents, { role: "user", parts: [{ text: retryPrompt }] }];
            r = await generateOnce(retryContents);
        }
        return r;
    }

    function isBlockedOrEmpty(r) {
        const fr = String(r.finishReason || "").toUpperCase();
        if (r.blockReason) return true;
        if (!r.text || !String(r.text).trim()) return true;
        if (fr === "RECITATION" || fr === "SAFETY" || fr === "BLOCKED") return true;
        return false;
    }

    async function generateOnce(contents) {
        const GEMINI_API_KEY = "AIzaSyB4amRjGgCcXHGiU0ZhZDwDIFsQzF_yfKM";
        const GEMINI_MODEL = "gemini-2.5-flash";
        const payload = {
            contents,
            tools: [{ "google_search": {} }], 
            generationConfig: {
                temperature: 0.6,
                maxOutputTokens: MAX_OUTPUT_TOKENS,
            },
            systemInstruction: { parts: [{ text: buildSystemInstruction() }] },
        };
        
        let data;
        let response;
        let retries = 0;
        const maxRetries = 3;
        const initialDelay = 1000;

        while (retries < maxRetries) {
            try {
                response = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (response.status === 429) {
                    retries++;
                    const delay = initialDelay * Math.pow(2, retries - 1);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }

                data = await response.json();
                break; 
            } catch (error) {
                throw error;
            }
        }
        
        if (!data) {
            throw new Error("API call failed after multiple retries.");
        }

        const blockReason = data?.candidates?.[0]?.safetyRatings?.some(r => r.probability !== 'NEGLIGIBLE') 
            ? 'BLOCKED_SAFETY' 
            : data?.promptFeedback?.blockReason || data?.promptFeedback?.block_reason || null;

        const candidate = data?.candidates?.[0] || {};
        const finishReason = candidate?.finishReason || candidate?.finish_reason || null;

        const parts = candidate?.content?.parts;
        const text = Array.isArray(parts)
            ? parts.map((p) => (p && typeof p.text === "string" ? p.text : "")).join("")
            : "";

        return { text: text || "", finishReason, blockReason };
    }

    function appendMessage(role, text) {
        const id = `msg_${Date.now()}_${Math.random().toString(16).slice(2)}`;

        const wrapper = document.createElement("div");
        wrapper.className = role === "user" ? "my-question" : "AI-question";
        wrapper.dataset.msgId = id;

        const logo = document.createElement("div");
        logo.className = role === "user" ? "my-character-logo" : "AI-character-logo";

        const bubble = document.createElement("div");
        bubble.className = role === "user" ? "my-answer" : "AI-answer";
        bubble.textContent = text;

        wrapper.appendChild(logo);
        wrapper.appendChild(bubble);
        chatContainer.appendChild(wrapper);

        return id;
    }

    function replaceMessageText(msgId, newText) {
        const target = chatContainer.querySelector(`[data-msg-id="${msgId}"]`);
        if (!target) return;

        const bubble = target.querySelector(".my-answer, .AI-answer");
        if (!bubble) return;

        bubble.textContent = newText;
    }
});
