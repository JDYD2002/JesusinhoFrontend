import React, { useState } from "react";

export default function JesusinhoChat() {
  const [input, setInput] = useState("");
  const [mensagens, setMensagens] = useState([
    { id: 0, texto: "Olá! Sou Jesusinho. Como posso ajudar você hoje?", tipo: "bot" }
  ]);
  const [digitando, setDigitando] = useState(false);

  async function enviarMensagem() {
    if (!input.trim()) return;

    // Adiciona a mensagem do usuário na conversa
    setMensagens((msgs) => [...msgs, { id: msgs.length, texto: input, tipo: "user" }]);
    setDigitando(true);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: input }),
      });
      const data = await res.json();

      setMensagens((msgs) => [
        ...msgs,
        { id: msgs.length, texto: data.resposta || "Jesusinho não respondeu.", tipo: "bot" },
      ]);
    } catch (err) {
      setMensagens((msgs) => [
        ...msgs,
        { id: msgs.length, texto: "Erro na conexão com o servidor.", tipo: "bot" },
      ]);
    } finally {
      setDigitando(false);
      setInput("");
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <div
        style={{
          minHeight: 300,
          border: "1px solid #ddd",
          padding: 10,
          overflowY: "auto",
          marginBottom: 10,
          borderRadius: 8,
          backgroundColor: "#fafafa",
        }}
      >
        {mensagens.map(({ id, texto, tipo }) => (
          <div
            key={id}
            style={{
              textAlign: tipo === "user" ? "right" : "left",
              margin: "10px 0",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: 10,
                borderRadius: 10,
                backgroundColor: tipo === "user" ? "#dcf8c6" : "#eee",
              }}
            >
              {texto}
            </div>
          </div>
        ))}
        {digitando && <div style={{ fontStyle: "italic", color: "#888" }}>Jesusinho está digitando...</div>}
      </div>

      <div>
        <input
          style={{ width: "80%", padding: 10, borderRadius: 4, border: "1px solid #ccc" }}
          type="text"
          placeholder="Digite sua mensagem"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") enviarMensagem(); }}
        />
        <button
          onClick={enviarMensagem}
          style={{ width: "18%", padding: 10, marginLeft: "2%", borderRadius: 4, cursor: "pointer" }}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
