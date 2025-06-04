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
  div.classList.add(remetente === "Você" ? "voce" : "jesusinho");
  div.textContent = `${remetente}: ${texto}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function substituirUltimaMensagem(remetente, texto) {
  const ultimo = chatBox.lastElementChild;
  if (ultimo) {
    ultimo.className = "mensagem " + (remetente === "Você" ? "voce" : "jesusinho");
    ultimo.textContent = `${remetente}: ${texto}`;
  } else {
    appendMensagem(remetente, texto);
  }
}

function bloquearBotoes(bloquear) {
  sendBtn.disabled = bloquear;
  versiculoBtn.disabled = bloquear;
  oracaoBtn.disabled = bloquear;
  falarBtn.disabled = bloquear;
  inputText.disabled = bloquear;
}

async function fetchChat(mensagemTexto) {
  const res = await fetch(`${baseURL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texto: mensagemTexto }),
  });
  if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
  return res.json();
}

async function fetchTTS(texto) {
  const res = await fetch(`${baseURL}/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texto }),
  });
  if (!res.ok) throw new Error(`Erro HTTP TTS: ${res.status}`);
  return res.json();
}

async function enviarMensagem() {
  if (esperandoResposta) return;
  const texto = inputText.value.trim();
  if (!texto) return;

  appendMensagem("Você", texto);
  inputText.value = "";
  substituirUltimaMensagem("Jesusinho", "digitando...");
  esperandoResposta = true;
  bloquearBotoes(true);

  try {
    const resposta = await fetchChat(texto);
    substituirUltimaMensagem("Jesusinho", resposta.resposta);
    await falarTexto(resposta.resposta);
  } catch (err) {
    substituirUltimaMensagem("Jesusinho", "Erro ao se conectar com o servidor.");
    console.error("Erro ao enviar mensagem:", err);
  } finally {
    esperandoResposta = false;
    bloquearBotoes(false);
  }
}

async function pedirVersiculo() {
  if (esperandoResposta) return;
  substituirUltimaMensagem("Jesusinho", "digitando...");
  esperandoResposta = true;
  bloquearBotoes(true);

  try {
    // Aqui manda para /chat com prompt fixo, pode ajustar se criar endpoint dedicado
    const resposta = await fetchChat("Me dê um versículo bíblico inspirador para hoje.");
    substituirUltimaMensagem("Jesusinho", resposta.resposta);
    await falarTexto(resposta.resposta);
  } catch (err) {
    substituirUltimaMensagem("Jesusinho", "Erro ao buscar versículo.");
    console.error("Erro ao pedir versículo:", err);
  } finally {
    esperandoResposta = false;
    bloquearBotoes(false);
  }
}

async function pedirOracao() {
  if (esperandoResposta) return;
  substituirUltimaMensagem("Jesusinho", "digitando...");
  esperandoResposta = true;
  bloquearBotoes(true);

  try {
    const resposta = await fetchChat("Escreva uma oração curta e edificante para o dia de hoje.");
    substituirUltimaMensagem("Jesusinho", resposta.resposta);
    await falarTexto(resposta.resposta);
  } catch (err) {
    substituirUltimaMensagem("Jesusinho", "Erro ao buscar oração.");
    console.error("Erro ao pedir oração:", err);
  } finally {
    esperandoResposta = false;
    bloquearBotoes(false);
  }
}

async function falarTexto(texto) {
  try {
    const data = await fetchTTS(texto);
    if (data.audio_b64) {
      audioPlayer.src = "data:audio/mp3;base64," + data.audio_b64;
      audioPlayer.style.display = "block";
      await audioPlayer.play();
    } else {
      audioPlayer.style.display = "none";
    }
  } catch (err) {
    console.error("Erro ao converter texto em fala:", err);
    audioPlayer.style.display = "none";
  }
}

// Reconhecimento de voz ajustado com feedback no botão
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
      falarBtn.disabled = false;
      falarBtn.textContent = "🎤 Falar";
      falarBtn.classList.remove("bg-[#00994d]");
    };
  }

  recognition.start();
}

sendBtn.addEventListener("click", enviarMensagem);
inputText.addEventListener("keydown", (e) => {
  if (e.key === "Enter") enviarMensagem();
});
versiculoBtn.addEventListener("click", pedirVersiculo);
oracaoBtn.addEventListener("click", pedirOracao);
falarBtn.addEventListener("click", falar);

// Mensagem de boas-vindas ao carregar a página
window.addEventListener("load", () => {
  appendMensagem("Jesusinho", "Olá! Sou o Jesusinho Virtual. Como posso ajudar você hoje?");
});
