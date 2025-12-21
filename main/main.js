const chat = document.getElementById("chat");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
function addUserBubble(text) {
  const bubble = document.createElement("div");
  bubble.className = "bubble user";
  bubble.innerText = text;
  chat.appendChild(bubble);
  chat.scrollTop = chat.scrollHeight;
}

function addAIBubble(text) {
  const bubble = document.createElement("div");
  bubble.className = "bubble ai";
  bubble.innerText = text;
  chat.appendChild(bubble);
  chat.scrollTop = chat.scrollHeight;
}

async function sendMessage(message) {
  if (!message.trim()) return;

  addUserBubble(message);
  input.value = "";

  const loadingBubble = document.createElement("div");
  loadingBubble.className = "bubble ai";
  loadingBubble.innerText = "생각 중...";
  chat.appendChild(loadingBubble);
  chat.scrollTop = chat.scrollHeight;

  try {
    const res = await fetch("https://gemini-proxy.ysin0904.workers.dev/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: message }]
          }
        ]
      })
    });

    const data = await res.json();
    console.log("AI 응답 원본:", data);

    const aiText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text
      ?? "답변을 생성하지 못했어요.";

    loadingBubble.innerText = aiText;

  } catch (error) {
    console.error(error);
    loadingBubble.innerText = "서버 오류가 발생했어요.";
  }
}

sendBtn.addEventListener("click", () => {
  sendMessage(input.value);
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage(input.value);
  }
});

