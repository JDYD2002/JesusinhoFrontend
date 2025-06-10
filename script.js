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
  if(remetente === "Você") div.classList.add("voce");
  else div.classList.add("jesusinho");
  div.textContent = `${remetente}: ${texto}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function substituirUltimaMensagem(remetente, texto) {
  const ultimo = chatBox.lastElementChild;
  if (ultimo) {
    ultimo.classList.remove("voce", "jesusinho");
    if(remetente === "Você") ultimo.classList.add("voce");
    else ultimo.classList.add("jesusinho");
    ultimo.textContent = `${remetente}: ${texto}`;
  } else {
    appendMensagem(remetente, texto);
  }
}

// Recebe opcionalmente o event e ignora para evitar problemas
async function enviarMensagem(_event) {
  if(esperandoResposta) return;
  const texto = inputText.value.trim();
  if (!texto) return;

  appendMensagem("Você", texto);
  inputText.value = "";
  appendMensagem("Jesusinho", "digitando...");
  esperandoResposta = true;

  try {
    const resposta = await fetch(`${baseURL}/responder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto })
    });
    const data = await resposta.json();
    substituirUltimaMensagem("Jesusinho", data.resposta);
  } catch (err) {
    substituirUltimaMensagem("Jesusinho", "Erro ao se conectar com o servidor.");
    console.error("Erro ao enviar mensagem:", err);
  } finally {
    esperandoResposta = false;
  }
}

async function pedirVersiculo() {
  if(esperandoResposta) return;
  appendMensagem("Jesusinho", "digitando...");
  esperandoResposta = true;

  try {
    const resposta = await fetch(`${baseURL}/responder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: "Me dê um versículo bíblico inspirador para hoje." })
    });
    const data = await resposta.json();
    substituirUltimaMensagem("Jesusinho", data.resposta);
  } catch (err) {
    substituirUltimaMensagem("Jesusinho", "Erro ao buscar versículo.");
    console.error("Erro ao pedir versículo:", err);
  } finally {
    esperandoResposta = false;
  }
}

async function pedirOracao() {
  if(esperandoResposta) return;
  appendMensagem("Jesusinho", "digitando...");
  esperandoResposta = true;

  try {
    const resposta = await fetch(`${baseURL}/responder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: "Escreva uma oração curta e edificante para o dia de hoje." })
    });
    const data = await resposta.json();
    substituirUltimaMensagem("Jesusinho", data.resposta);
  } catch (err) {
    substituirUltimaMensagem("Jesusinho", "Erro ao buscar oração.");
    console.error("Erro ao pedir oração:", err);
  } finally {
    esperandoResposta = false;
  }
}

// Reconhecimento de voz
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let reconhecendo = false;

function falar() {
  if(!SpeechRecognition) {
    alert("Reconhecimento de voz não suportado no seu navegador.");
    return;
  }

  if(reconhecendo) {
    appendMensagem("Jesusinho", "Já estou ouvindo sua voz, por favor fale.");
    return;
  }

  if(!recognition) {
    recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      reconhecendo = true;
      falarBtn.textContent = "🎙️ Ouvindo...";
      falarBtn.disabled = true;
      appendMensagem("Jesusinho", "Estou ouvindo você, fale agora.");
    };

    recognition.onresult = (event) => {
      const texto = event.results[0][0].transcript;
      inputText.value = texto;
      enviarMensagem();
    };

    recognition.onerror = (event) => {
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
    };
  }

  recognition.start();
}

// Eventos dos botões e campo de texto
sendBtn.addEventListener("click", enviarMensagem);
inputText.addEventListener("keydown", (e) => {
  if(e.key === "Enter") {
    e.preventDefault();
    enviarMensagem();
  }
});
versiculoBtn.addEventListener("click", pedirVersiculo);
oracaoBtn.addEventListener("click", pedirOracao);
falarBtn.addEventListener("click", falar);

// Mensagem inicial
appendMensagem("Jesusinho", "Olá! Eu sou Jesusinho, seu assistente espiritual. Como posso ajudar você hoje? 🙏");
