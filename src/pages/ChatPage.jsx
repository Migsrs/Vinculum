// src/pages/ChatPage.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, PhoneOff } from "lucide-react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { getContracts, closeContract } from "../utils/storage";
import { sanitizeText } from "../utils/security";

export default function ChatPage({ session }) {
  const { chatId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState(getContracts);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Busca contrato correspondente ao chatId
  const contract = contracts.find((c) => c.chatId === chatId);
  const isClosed = contract?.status === "closed";

  // Verifica acesso — só participantes do contrato podem entrar
  useEffect(() => {
    if (
      !contract ||
      (session?.email !== contract.clientEmail &&
        session?.email !== contract.providerEmail)
    ) {
      navigate("/account", { replace: true });
    }
  }, [contract, session, navigate]);

  // Nome e inicial do outro participante
  const otherName =
    session?.email === contract?.clientEmail
      ? contract?.providerName
      : contract?.clientName;

  // Listener em tempo real das mensagens (Firestore)
  useEffect(() => {
    if (!chatId) return;

    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId]);

  // Rola para o fim ao receber novas mensagens
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const trimmed = sanitizeText(text, 1000);
    if (!trimmed || !session) return;

    setText("");
    inputRef.current?.focus();

    const messagesRef = collection(db, "chats", chatId, "messages");
    await addDoc(messagesRef, {
      senderEmail: session.email,
      senderName: session.name || session.email,
      text: trimmed,
      createdAt: serverTimestamp(),
    });

    // Atualiza metadados do chat (última mensagem)
    await setDoc(
      doc(db, "chats", chatId),
      {
        clientEmail: contract.clientEmail,
        providerEmail: contract.providerEmail,
        serviceTitle: contract.serviceTitle,
        lastMessage: trimmed,
        lastMessageAt: serverTimestamp(),
      },
      { merge: true }
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClose = () => {
    if (!confirm("Deseja encerrar este atendimento? O chat ficará somente leitura.")) return;
    closeContract(contract.id);
    setContracts(getContracts());
  };

  if (!contract) return null;

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 120px)" }}>
      {/* ── Cabeçalho ── */}
      <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
        <button
          type="button"
          onClick={() => navigate("/account")}
          className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">
          {otherName?.[0]?.toUpperCase() ?? "?"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold text-gray-900">{otherName}</div>
          <div className="flex items-center gap-2">
            <span className="truncate text-xs text-gray-500">{contract.serviceTitle}</span>
            {isClosed && (
              <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                Encerrado
              </span>
            )}
          </div>
        </div>

        {!isClosed && (
          <button
            type="button"
            onClick={handleClose}
            title="Encerrar atendimento"
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
          >
            <PhoneOff className="h-3.5 w-3.5" />
            Encerrar
          </button>
        )}
      </div>

      {/* ── Mensagens ── */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-4">
        {loading ? (
          <p className="text-center text-sm text-gray-400">Carregando mensagens…</p>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
            <p className="text-sm">Nenhuma mensagem ainda.</p>
            <p className="text-xs">Inicie a conversa!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((msg) => {
              const isMe = msg.senderEmail === session?.email;
              const time = msg.createdAt?.toDate?.()?.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                      isMe
                        ? "rounded-br-sm bg-amber-600 text-white"
                        : "rounded-bl-sm border border-gray-200 bg-white text-gray-800"
                    }`}
                  >
                    {!isMe && (
                      <p className="mb-0.5 text-xs font-semibold text-amber-700">
                        {msg.senderName}
                      </p>
                    )}
                    <p className="leading-relaxed break-words">{msg.text}</p>
                    {time && (
                      <p
                        className={`mt-1 text-right text-[10px] ${
                          isMe ? "text-amber-200" : "text-gray-400"
                        }`}
                      >
                        {time}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Input de mensagem ── */}
      {isClosed ? (
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-4 text-center text-sm text-gray-400">
          Este atendimento foi encerrado. O histórico está disponível acima.
        </div>
      ) : (
        <form
          onSubmit={handleSend}
          className="flex items-end gap-2 border-t border-gray-200 bg-white px-4 py-3"
        >
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite uma mensagem… (Enter para enviar)"
            maxLength={1000}
            rows={1}
            className="flex-1 resize-none rounded-2xl border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            style={{ maxHeight: "120px", overflowY: "auto" }}
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-600 text-white shadow transition hover:bg-amber-700 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      )}
    </div>
  );
}
