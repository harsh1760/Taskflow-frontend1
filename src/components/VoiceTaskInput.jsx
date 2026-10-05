import { useRef, useState } from "react";

const VoiceTaskInput = ({ onCommand, onError, onStartListening, className = "", buttonClassName = "" }) => {
    const [state, setState] = useState("idle");
    const [text, setText] = useState("");
    const lastSubmission = useRef({ text: "", timestamp: 0 });
    const commandSent = useRef(false);

    const startListening = () => {
        if (state !== "idle") return;
        commandSent.current = false;
        onStartListening?.();
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();

        recognition.lang = "en-US";
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setState("listening");
        };

        recognition.onresult = (event) => {
            if (commandSent.current || !event.results?.[0]?.[0]) return;

            const result = event.results[0];
            if (result.isFinal !== true) return;

            const transcript = event.results[0][0].transcript;
            if (!transcript.trim()) return;

            const now = Date.now();
            if (
                transcript.trim().toLowerCase() === lastSubmission.current.text &&
                now - lastSubmission.current.timestamp < 10000
            ) {
                setState("idle");
                return;
            }

            commandSent.current = true;
            setText(transcript);
            lastSubmission.current = {
                text: transcript.trim().toLowerCase(),
                timestamp: now,
            };
            setState("processing");
            Promise.resolve(onCommand?.(transcript))
                .then(() => setState("idle"))
                .catch(() => {
                    setState("error");
                    onError?.("The AI request could not be completed.");
                })
                .finally(() => setState("idle"));
        };

        recognition.onerror = (event) => {
            setState("error");
            onError?.(event.error);
            setState("idle");
        };

        recognition.onend = () => {
            setState((current) => current === "listening" ? "idle" : current);
        };

        recognition.start();
    };

    return (
        <div className={className}>
            <button className={`${buttonClassName} ${state === "listening" ? "is-listening" : ""}`.trim()} onClick={startListening} disabled={state === "listening" || state === "processing"}>
                {state === "listening" ? "🎤 Listening..." : state === "processing" ? "⌛ Processing..." : state === "success" ? "✓ Sent" : "🎤 Speak"}
            </button>

            {text && (
                <p>
                    You said: <strong>{text}</strong>
                </p>
            )}
        </div>
    );
};

export default VoiceTaskInput;