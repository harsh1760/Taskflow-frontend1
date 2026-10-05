import { useRef, useState } from "react";
import { PageLayout } from "./Dashboard";
import api, { aiMessage } from "../services/api";
import VoiceTaskInput from "../components/VoiceTaskInput";

const starterMessages = [];

const quickActions = [
  ["＋", "Create a task", "Create a new task"],
];

function AIMessage({ role, text }) {
  const isUser = role === "user";

  return (
    <div className={`ai-message-row ${isUser ? "is-user" : ""}`}>
      {!isUser && <div className="ai-message-avatar">✦</div>}
      <div className="ai-message-content">
        <span className="ai-message-label">{isUser ? "You" : "AI Assistant"}</span>
        <div className={`ai-message-bubble ${isUser ? "user-bubble" : "assistant-bubble"}`}>
          {text}
        </div>
      </div>
    </div>
  );
}

export default function AIAssistant() {
  const [messages, setMessages] = useState(starterMessages);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [voiceError, setVoiceError] = useState("");
  const isSending = useRef(false);

  const sendMessage = async (message = input) => {
    if (isSending.current || typeof message !== "string") return false;

    const text = message.trim();
    if (!text) return false;

    isSending.current = true;

    setMessages((current) => [...current, { id: Date.now(), role: "user", text }]);
    setInput("");
    setIsThinking(true);
    setRequestError("");

    try {
      const response = await api.post("/ai/chat", { message: text });
      const result = response.data;
      setMessages((current) => [
        ...current,
        { id: Date.now() + 1, role: "assistant", text: result.message, tasks: result.tasks },
      ]);

      if (
        result.success &&
        ["task_created", "task_updated", "task_deleted"].includes(result.action)
      ) {
        window.dispatchEvent(new CustomEvent("taskflow:tasks-changed"));
      }
    } catch (error) {
      setRequestError(aiMessage(error));
      return false;
    } finally {
      isSending.current = false;
      setIsThinking(false);
    }
    return true;
  };

  const chooseQuickAction = (prompt) => setInput(prompt);

  return (
    <PageLayout>
      <div className="ai-page-heading">
        <div>
          <div className="eyebrow">Workspace assistant</div>
          <h1>AI Task Assistant</h1>
          <p>Manage your tasks using natural language.</p>
        </div>
        <div className="ai-status"><span>●</span> AI Assistant</div>
      </div>

      <div className="ai-layout">
        <main className="ai-conversation-panel">
          <div className="ai-conversation-topline">
            <div>
              <h2>Conversation</h2>
              <p>Create a new task using natural language.</p>
            </div>
            <span className="ai-demo-label">AI Assistant</span>
          </div>

          <div className="ai-conversation" aria-live="polite">
            {messages.length === 0 ? (
              <div className="ai-empty-state">
                <div className="ai-empty-icon">✦</div>
                <h2>How can I help with your tasks?</h2>
                <div className="ai-example-list">
                  <button onClick={() => chooseQuickAction("Create a task to learn React.")}>Create a task to learn React.</button>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id}>
                  <AIMessage {...message} />
                  {message.tasks?.length > 0 && (
                    <div className="ai-task-results">
                      {message.tasks.map((task) => (
                        <div className="ai-task-result" key={task._id}>
                          <strong>{task.title}</strong>
                          <span>Status: {task.status}</span>
                          <span>{task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : "No due date"}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
            {isThinking && (
              <div className="ai-message-row">
                <div className="ai-message-avatar">✦</div>
                <div className="ai-message-content">
                  <span className="ai-message-label">AI Assistant</span>
                  <div className="ai-message-bubble assistant-bubble ai-thinking">AI is thinking<span>.</span><span>.</span><span>.</span></div>
                </div>
              </div>
            )}
          </div>

          <div className="ai-composer-wrap">
            {(voiceError || requestError) && <div className="ai-input-error" role="alert"><strong>Something went wrong.</strong> {voiceError || requestError} Please try again.</div>}
            {input && <div className="ai-transcript"><span>You said:</span> “{input}”</div>}
            <div className="ai-composer">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask Taskflow anything..."
                aria-label="Message the AI Task Assistant"
                rows="2"
              />
              <div className="ai-composer-actions">
                <VoiceTaskInput
                  className="ai-voice-input"
                  buttonClassName="ai-mic-button"
                  onStartListening={() => {
                    setMessages([]);
                    setVoiceError("");
                    setRequestError("");
                  }}
                  onCommand={(text) => {
                    setVoiceError("");
                    return sendMessage(text);
                  }}
                  onError={() => setVoiceError("We could not hear that.")}
                />
                <button className="ai-send-button" onClick={() => sendMessage()} disabled={!input.trim() || isThinking} aria-label="Send message">Send <span>➜</span></button>
              </div>
            </div>
          </div>
        </main>

        <aside className="ai-tools-panel">
          <section className="ai-tool-section">
            <div className="ai-section-title"><div><span className="ai-kicker">Shortcuts</span><h2>Quick actions</h2></div><span className="ai-tool-count">{quickActions.length}</span></div>
            <div className="ai-quick-actions">
              {quickActions.map(([icon, label, prompt]) => (
                <button key={label} onClick={() => chooseQuickAction(prompt)}><span className="ai-quick-icon">{icon}</span><span>{label}</span><span className="ai-quick-arrow">→</span></button>
              ))}
            </div>
          </section>
          <div className="ai-later-note"><span>✦</span><p>Use the assistant to create a new task.</p></div>
        </aside>
      </div>
    </PageLayout>
  );
}
