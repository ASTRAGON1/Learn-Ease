import React, { useState, useRef, useEffect } from 'react';
import './ChatAssistant.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ChatAssistant = ({ isOpen, onClose, userContext }) => {
    const [messages, setMessages] = useState([
        { role: 'assistant', text: `Hi ${userContext?.name || 'there'}! I'm your learning assistant. I can help you with your lessons or answer any questions.` }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [autoSpeak, setAutoSpeak] = useState(true); // Default to auto-speaking for accessibility
    const [speakingMessageIndex, setSpeakingMessageIndex] = useState(null);
    const messagesEndRef = useRef(null);
    const isSpeakingRef = useRef(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Speech Synthesis Helper
    const speakText = (text, index = null) => {
        if (!window.speechSynthesis) return;

        // Cancel any current speech
        window.speechSynthesis.cancel();
        setSpeakingMessageIndex(null);

        // Strip emojis for speech (so it doesn't say "sparkles smiling face")
        // This regex matches most common emoji ranges
        const textToSpeak = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}]/gu, '').trim();

        if (!textToSpeak) return;

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        // Try to select a friendly voice
        const voices = window.speechSynthesis.getVoices();
        const friendlyVoice = voices.find(v => v.name.includes('Google US English')) ||
            voices.find(v => v.name.includes('Zira')) ||
            voices.find(v => v.lang === 'en-US');

        if (friendlyVoice) utterance.voice = friendlyVoice;

        // Adjust for friendly tone
        utterance.pitch = 1.3; // Higher pitch = happier/friendlier
        utterance.rate = 1.0;  // Normal speed (previously 0.9 was maybe too slow/robotic)

        utterance.onstart = () => {
            isSpeakingRef.current = true;
            if (index !== null) setSpeakingMessageIndex(index);
        };
        utterance.onend = () => {
            isSpeakingRef.current = false;
            setSpeakingMessageIndex(null);
        };

        window.speechSynthesis.speak(utterance);
    };

    // Stop speaking when closed
    useEffect(() => {
        if (!isOpen) {
            window.speechSynthesis.cancel();
        }
    }, [isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setIsLoading(true);

        // Stop speaking user's own clear
        window.speechSynthesis.cancel();

        try {
            const response = await fetch(`${API_URL}/api/ai/chat`, { // Streaming endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.sessionStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    message: userMessage,
                    conversationHistory: messages.slice(-5), // Send last 5 context messages
                    userContext: userContext
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            // Handle streaming response
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiResponseText = '';

            setMessages(prev => [...prev, { role: 'assistant', text: '' }]); // Placeholder

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.content) {
                                aiResponseText += data.content;
                                setMessages(prev => {
                                    const newMsgs = [...prev];
                                    newMsgs[newMsgs.length - 1].text = aiResponseText;
                                    return newMsgs;
                                });
                            }
                        } catch (e) {
                            console.error("Error parsing stream chunk", e);
                        }
                    }
                }
            }

            // Auto-speak full response after streaming is done
            if (autoSpeak && aiResponseText) {
                // Calculate new index (messages.length - 1, since we removed placeholder and added real one... wait.
                // messages array in state is updated. The last message is the AI one.)
                // Actually, due to closure stale state, 'messages' here refers to initial state of handleSend?
                // No, we used setMessages with callback.
                // We should pass the text. Index tracking for auto-speak might be tricky without ref or correct index.
                // We can just pass a dummy index or handle it.
                // For now, let's just speak.
                speakText(aiResponseText);
            }

        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="chat-assistant-container">
            <div className="chat-header">
                <div className="chat-header-info">
                    <div className="chat-avatar">AI</div>
                    <div>
                        <h3>Learning Buddy</h3>
                        <span className="location-indicator">Online</span>
                    </div>
                </div>
                <div className="chat-header-controls">
                    <button
                        className={`chat-control-btn ${autoSpeak ? 'active' : ''}`}
                        onClick={() => setAutoSpeak(!autoSpeak)}
                        title={autoSpeak ? "Mute auto-speech" : "Enable auto-speech"}
                    >
                        {autoSpeak ? '🔊' : '🔇'}
                    </button>
                    <button className="chat-close-btn" onClick={onClose}>×</button>
                </div>
            </div>

            <div className="chat-messages">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`chat-message ${msg.role}`}>
                        {msg.role === 'assistant' && (
                            <button
                                className={`chat-speak-msg-btn ${speakingMessageIndex === idx ? 'speaking' : ''}`}
                                onClick={() => speakText(msg.text, idx)}
                                title="Listen"
                            >
                                {speakingMessageIndex === idx ? '🔊' : '🔈'}
                            </button>
                        )}
                        <div className="message-bubble">{msg.text}</div>
                    </div>
                ))}
                {isLoading && (
                    <div className="chat-message assistant">
                        <div className="message-bubble typing-indicator">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask me anything..."
                    rows="1"
                />
                <button
                    className="chat-send-btn"
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default ChatAssistant;
