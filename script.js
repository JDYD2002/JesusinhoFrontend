const baseURL = "https://jesus-mb25.onrender.com";
const chatBox = document.getElementById("chat-box");
const inputText = document.getElementById("input-text");
const sendBtn = document.getElementById("send-btn");
const versiculoBtn = document.getElementById("versiculo-btn");
const oracaoBtn = document.getElementById("oracao-btn");
const falarBtn = document.getElementById("falar-btn");
const audioPlayer = document.getElementById("audio-player");

let esperandoResposta = false;

function appendMensagem(remetente, texto) {
  const div = document.createElement("div");
  div.classList.add("mensagem");
  if (remetente === "Você") div.classList.add("voce");
  else div.classList.add("jesusinho");
  div.textContent = `${remetente}: ${texto}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function substituirUltimaMensagem(remetente, texto) {
  const ultimo = chatBox.lastElementChild;
  if (ultimo) {
    ultimo.classList.remove("voce", "jesusinho");
    if (remetente === "Você") ultimo.classList.add("voce");
    else ultimo.classList.add("jesusinho");
    ultimo.textContent = `${remetente}: ${texto}`;
  } else {
    appendMensagem(remetente, texto);
  }
}

async function enviarMensagem() {
  if (esperandoResposta) return;
  const texto = inputText.value.trim();
  if (!texto) return;

  appendMensagem("Você", texto);
  inputText.value = "";
  appendMensagem("Jesusinho", "digitando...");
  esperandoResposta = true;

  try {
    const resposta = await fetch(`${baseURL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto })
    }).then(r => r.json());

    substituirUltimaMensagem("Jesusinho", resposta.resposta);
    falarTexto(resposta.resposta);
  } catch (err) {
    substituirUltimaMensagem("Jesusinho", "Erro ao se conectar com o servidor.");
    console.error("Erro ao enviar mensagem:", err);
  } finally {
    esperandoResposta = false;
  }
}

async function pedirVersiculo() {
  if (esperandoResposta) return;
  appendMensagem("Jesusinho", "digitando...");
  esperandoResposta = true;

  try {
    const resposta = await fetch(`${baseURL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: "Me dê um versículo bíblico inspirador para hoje." })
    }).then(r => r.json());

    substituirUltimaMensagem("Jesusinho", resposta.resposta);
    falarTexto(resposta.resposta);
  } catch (err) {
    substituirUltimaMensagem("Jesusinho", "Erro ao buscar versículo.");
    console.error("Erro ao pedir versículo:", err);
  } finally {
    esperandoResposta = false;
  }
}

async function pedirOracao() {
  if (esperandoResposta) return;
  appendMensagem("Jesusinho", "digitando...");
  esperandoResposta = true;

  try {
    const resposta = await fetch(`${baseURL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: "Escreva uma oração curta e edificante para o dia de hoje." })
    }).then(r => r.json());

    substituirUltimaMensagem("Jesusinho", resposta.resposta);
    falarTexto(resposta.resposta);
  } catch (err) {
    substituirUltimaMensagem("Jesusinho", "Erro ao buscar oração.");
    console.error("Erro ao pedir oração:", err);
  } finally {
    esperandoResposta = false;
  }
}

async function falarTexto(texto) {
  try {
    const res = await fetch(`${baseURL}/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto })
    });

    const data = await res.json();
    if (data.audio_b64) {
      audioPlayer.src = "data:audio/mp3;base64," + data.audio_b64;
      audioPlayer.style.display = "block";
      audioPlayer.play();
    } else {
      audioPlayer.style.display = "none";
    }
  } catch (err) {
    console.error("Erro ao converter texto em fala:", err);
  }
}

// Reconhecimento de voz
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

function falar() {
  if (!SpeechRecognition) {
    alert("Reconhecimento de voz não suportado no seu navegador.");
    return;
  }

  if (!recognition) {
    recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      falarBtn.disabled = true;
      falarBtn.textContent = "Gravando...";
      falarBtn.classList.add("bg-[#00994d]");
    };

    recognition.onend = () => {
      falarBtn.disabled = false;
      falarBtn.textContent = "🎤 Falar";
      falarBtn.classList.remove("bg-[#00994d]");
    };

    recognition.onresult = (event) => {
      const texto = event.results[0][0].transcript;
      inputText.value = texto;
      enviarMensagem();
    };

    recognition.onerror = (event) => {
      console.error("Erro no reconhecimento de voz:", event.error);
      alert("⚠️ Erro no reconhecimento de voz: " + event.error);
      falarBtn.disabled = false;
      falarBtn.textContent = "🎤 Falar";
      falarBtn.classList.remove("bg-[#00994d]");
    };
  }

  recognition.start();
}

// Verifica permissão antes de gravar
falarBtn.addEventListener("click", () => {
  if (!SpeechRecognition) {
    alert("Reconhecimento de voz não suportado no seu navegador.");
    return;
  }

  navigator.permissions.query({ name: "microphone" }).then(result => {
    if (result.state === "denied") {
      alert("⚠️ O acesso ao microfone está bloqueado.\nClique no cadeado 🔒 na barra de endereço e permita o uso do microfone.");
    } else {
      falar();
    }
  }).catch(() => {
    // Caso não consiga verificar a permissão, tenta gravar mesmo assim
    falar();
  });
});

sendBtn.addEventListener("click", enviarMensagem);
inputText.addEventListener("keydown", (e) => {
  if (e.key === "Enter") enviarMensagem();
});
versiculoBtn.addEventListener("click", pedirVersiculo);
oracaoBtn.addEventListener("click", pedirOracao);

// Mensagem de boas-vindas ao carregar a página
window.addEventListener("load", () => {
  appendMensagem("Jesusinho", "Olá! Sou o Jesusinho Virtual. Como posso ajudar você hoje?");
});
