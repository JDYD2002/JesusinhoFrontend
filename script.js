const baseURL = "https://jesus-mb25.onrender.com";
const chatBox = document.getElementById("chat-box");
const inputText = document.getElementById("input-text");
const sendBtn = document.getElementById("send-btn");
const versiculoBtn = document.getElementById("versiculo-btn");
const oracaoBtn = document.getElementById("oracao-btn");
const falarBtn = document.getElementById("falar-btn");
const audioPlayer = document.getElementById("audio-player");

function appendMensagem(remetente, texto) {
  const div = document.createElement("div");
  div.classList.add("mensagem");
  div.textContent = `${remetente}: ${texto}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function substituirUltimaMensagem(remetente, texto) {
  const ultimo = chatBox.lastChild;
  if (ultimo) ultimo.textContent = `${remetente}: ${texto}`;
}

async function enviarMensagem() {
  const texto = inputText.value.trim();
  if (!texto) return;

  appendMensagem("Você", texto);
  inputText.value = "";
  appendMensagem("Jesusinho", "digitando...");

  try {
    const resposta = await fetch(`${baseURL}/responder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto })
    }).then(r => r.json());

    substituirUltimaMensagem("Jesusinho", resposta.resposta);
    // falarTexto(resposta.resposta); // desativado
  } catch (err) {
    substituirUltimaMensagem("Jesusinho", "Erro ao se conectar com o servidor.");
    console.error("Erro ao enviar mensagem:", err);
  }
}

async function pedirVersiculo() {
  appendMensagem("Jesusinho", "digitando...");
  try {
    const resposta = await fetch(`${baseURL}/responder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: "Me dê um versículo bíblico inspirador para hoje." })
    }).then(r => r.json());

    substituirUltimaMensagem("Jesusinho", resposta.resposta);
    // falarTexto(resposta.resposta); // desativado
  } catch (err) {
    substituirUltimaMensagem("Jesusinho", "Erro ao buscar versículo.");
    console.error("Erro ao pedir versículo:", err);
  }
}

async function pedirOracao() {
  appendMensagem("Jesusinho", "digitando...");
  try {
    const resposta = await fetch(`${baseURL}/responder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: "Escreva uma oração curta e edificante para o dia de hoje." })
    }).then(r => r.json());

    substituirUltimaMensagem("Jesusinho", resposta.resposta);
    // falarTexto(resposta.resposta); // desativado
  } catch (err) {
    substituirUltimaMensagem("Jesusinho", "Erro ao buscar oração.");
    console.error("Erro ao pedir oração:", err);
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
      // audioPlayer.src = "data:audio/mp3;base64," + data.audio_b64;
      // audioPlayer.style.display = "block";
      // audioPlayer.play();
    } else {
      // audioPlayer.style.display = "none";
    }
  } catch (err) {
    console.error("Erro ao converter texto em fala:", err);
  }
}

// Reconhecimento de voz atualizado com logs e mensagens amigáveis
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let reconhecendo = false;

function falar() {
  if (!SpeechRecognition) {
    alert("Reconhecimento de voz não suportado no seu navegador.");
    return;
  }

  if (reconhecendo) {
    appendMensagem("Jesusinho", "Já estou ouvindo sua voz, por favor fale.");
    return;
  }

  if (!recognition) {
    recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      reconhecendo = true;
      falarBtn.textContent = "🎙️ Ouvindo...";
      falarBtn.disabled = true;
      console.log("Reconhecimento de voz iniciado.");
      appendMensagem("Jesusinho", "Estou ouvindo você, fale agora.");
    };

    recognition.onresult = (event) => {
      const texto = event.results[0][0].transcript;
      console.log("Texto reconhecido:", texto);
      inputText.value = texto;
      enviarMensagem();
    };

    recognition.onerror = (event) => {
      console.error("Erro no reconhecimento de voz:", event.error);
      if(event.error === 'not-allowed' || event.error === 'permission-denied') {
        appendMensagem("Jesusinho", "Permissão para usar o microfone negada. Por favor, permita o acesso e tente novamente.");
      } else if(event.error === 'no-speech') {
        appendMensagem("Jesusinho", "Não ouvi nada. Por favor, tente falar novamente.");
      } else {
        appendMensagem("Jesusinho", `Erro no reconhecimento de voz: ${event.error}`);
      }
      falarBtn.textContent = "🎤 Falar";
      falarBtn.disabled = false;
      reconhecendo = false;
    };

    recognition.onend = () => {
      reconhecendo = false;
      falarBtn.textContent = "🎤 Falar";
      falarBtn.disabled = false;
      console.log("Reconhecimento de voz finalizado.");
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

// Mensagem inicial de boas-vindas
appendMensagem("Jesusinho", "Olá! Eu sou Jesusinho, seu assistente espiritual. Como posso ajudar você hoje? 🙏");
