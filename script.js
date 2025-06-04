const baseURL = "https://jesus-mb25.onrender.com";

const chatBox = document.getElementById("chat-box");
const inputText = document.getElementById("input-text");
const sendBtn = document.getElementById("send-btn");
const versiculoBtn = document.getElementById("versiculo-btn");
const oracaoBtn = document.getElementById("oracao-btn");
// Removi falarBtn e audioPlayer

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

async function enviarMensagem() {
  if (esperandoResposta) return;
  const texto = inputText.value.trim();
  if (!texto) return;

  appendMensagem("Você", texto);  // Garante que sua mensagem apareça
  inputText.value = "";
  substituirUltimaMensagem("Jesusinho", "digitando...");
  esperandoResposta = true;
  bloquearBotoes(true);

  try {
    const resposta = await fetchChat(texto);
    substituirUltimaMensagem("Jesusinho", resposta.resposta);
    // Removido falarTexto aqui
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
    const resposta = await fetchChat("Me dê um versículo bíblico inspirador para hoje.");
    substituirUltimaMensagem("Jesusinho", resposta.resposta);
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
  } catch (err) {
    substituirUltimaMensagem("Jesusinho", "Erro ao buscar oração.");
    console.error("Erro ao pedir oração:", err);
  } finally {
    esperandoResposta = false;
    bloquearBotoes(false);
  }
}

// Removido falarTexto e reconhecimento de voz para simplificar

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
