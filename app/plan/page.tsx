"use client";
import { useState, useEffect, useRef } from "react";
import { questions } from "../../lib/questions";
import { useRouter } from "next/navigation";

type Answers = Record<string, string>;

type Plan = {
  goal: string;
  level: string;
  weekPlan: {
    day: string;
    focus: string;
    exercises: {
      name: string;
      sets: number;
      reps: number;
      notes?: string;
    }[];
  }[];
};

export default function PlanPage() {
  const router = useRouter();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [messages, setMessages] = useState<
    { role: "bot" | "user"; content: string }[]
  >([
    {
      role: "bot",
      content: "Hi 👋 I am your AI fitness coach. Let's build your plan.",
    },
    {
      role: "bot",
      content: questions[0].question,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleAnswer = (option: string) => {
    const question = questions[step];

    const updatedAnswers = {
      ...answers,
      [question.id]: option,
    };

    setAnswers(updatedAnswers);
    setMessages((prev) => [...prev, { role: "user", content: option }]);

    const nextStep = step + 1;

    if (nextStep < questions.length) {
      setStep(nextStep);
      setIsTyping(true);
      
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: "bot", content: questions[nextStep].question },
        ]);
        setIsTyping(false);
      }, 600);
    } else {
      setIsTyping(true);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            content: "Generating your workout plan... 💪",
          },
        ]);
        setIsTyping(false);
        generatePlan(updatedAnswers);
      }, 600);
    }
  };

  const generatePlan = async (data: Answers) => {
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/generateplan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      setPlan(result);

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            content: "Your plan is ready! 🎉",
          },
        ]);
      }, 300);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: "Something went wrong while generating your plan.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <span style={styles.headerIcon}>🤖</span>
          <div>
            <h1 style={styles.title}>AI Fitness Coach</h1>
            <p style={styles.subtitle}>Build your personalized workout plan</p>
          </div>
        </div>
        {plan && (
          <button
            style={styles.backButton}
            onClick={() => router.push("/dashboard")}
          >
            ← Dashboard
          </button>
        )}
      </div>

      {/* Chat Container */}
      <div style={styles.chatWrapper}>
        <div
          ref={chatContainerRef}
          style={styles.chatContainer}
          className="chat-container"
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                ...styles.messageWrapper,
                justifyContent: msg.role === "bot" ? "flex-start" : "flex-end",
              }}
              className="message-slide"
            >
              <div
                style={{
                  ...styles.message,
                  ...(msg.role === "bot" ? styles.botMessage : styles.userMessage),
                }}
              >
                <div style={styles.messageHeader}>
                  <span style={styles.messageIcon}>
                    {msg.role === "bot" ? "🤖" : "👤"}
                  </span>
                  <strong style={styles.messageSender}>
                    {msg.role === "bot" ? "AI Coach" : "You"}
                  </strong>
                </div>
                <p style={styles.messageContent}>{msg.content}</p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div style={styles.typingWrapper}>
              <div style={styles.typingIndicator}>
                <span style={styles.typingDot}></span>
                <span style={styles.typingDot}></span>
                <span style={styles.typingDot}></span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Questions / Options */}
      {step < questions.length && !loading && !plan && (
        <div style={styles.optionsContainer} className="options-fade">
          <div style={styles.questionWrapper}>
            <span style={styles.questionIcon}>💡</span>
            <p style={styles.questionText}>{questions[step].question}</p>
          </div>
          <div style={styles.optionsGrid}>
            {questions[step].options.map((opt, index) => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                style={{
                  ...styles.optionButton,
                  animationDelay: `${index * 0.08}s`,
                }}
                className="option-button"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Generating your personalized plan...</p>
        </div>
      )}

      {/* Plan Output */}
      {plan && (
        <div style={styles.planContainer} className="plan-fade">
          <div style={styles.planHeader}>
            <div>
              <h2 style={styles.planTitle}>🏋️ Your Weekly Plan</h2>
              <div style={styles.planMeta}>
                <span style={styles.metaBadge}>
                  <strong>Goal:</strong> {plan.goal}
                </span>
                <span style={styles.metaBadge}>
                  <strong>Level:</strong> {plan.level}
                </span>
              </div>
            </div>
          </div>

          <div style={styles.weekGrid}>
            {plan?.weekPlan?.map((day, i) => (
              <div
                key={i}
                style={{
                  ...styles.dayCard,
                  animationDelay: `${i * 0.1}s`,
                }}
                className="day-card"
              >
                <div style={styles.dayHeader}>
                  <h3 style={styles.dayTitle}>{day.day}</h3>
                  <span style={styles.dayFocus}>{day.focus}</span>
                </div>

                <div style={styles.exercisesList}>
                  {(day.exercises ?? []).map((ex, j) => (
                    <div key={j} style={styles.exerciseItem}>
                      <div style={styles.exerciseInfo}>
                        <span style={styles.exerciseName}>{ex.name}</span>
                        <span style={styles.exerciseSets}>
                          {ex.sets} sets × {ex.reps} reps
                        </span>
                      </div>
                      {ex.notes && (
                        <p style={styles.exerciseNote}>💡 {ex.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Save Plan Button */}
          <button
            onClick={async () => {
              if (!plan) return;
              try {
                setSaveError(null);
                setLoading(true);

                const token = localStorage.getItem("token");
                if (!token) {
                  throw new Error("Please log in before saving a plan.");
                }

                const res = await fetch("http://localhost:5000/saveplan", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ plan }),
                });
                if (!res.ok) {
                  const errorResponse = await res.json().catch(() => null);
                  throw new Error(errorResponse?.error || "Unable to save plan");
                }
                await res.json();
                router.push("/dashboard");
              } catch (err: any) {
                console.error(err);
                setSaveError(err?.message || "Unable to save plan. Check backend and try again.");
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            style={{
              ...styles.saveButton,
              ...(loading && styles.saveButtonDisabled),
            }}
            className="save-button"
          >
            {loading ? (
              <>
                <span style={styles.buttonSpinner}></span>
                Saving plan...
              </>
            ) : (
              "💾 Use This Plan"
            )}
          </button>
          
          {saveError && (
            <div style={styles.errorContainer} className="slide-down">
              <span style={styles.errorIcon}>⚠️</span>
              <p style={styles.errorText}>{saveError}</p>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .message-slide {
          animation: slideIn 0.4s ease-out;
        }

        .options-fade {
          animation: fadeInUp 0.5s ease-out;
        }

        .option-button {
          animation: fadeInUp 0.4s ease-out both;
          transition: all 0.3s ease;
        }

        .option-button:hover {
          transform: translateY(-2px);
          background: #000;
          color: #fff;
        }

        .option-button:active {
          transform: scale(0.96);
        }

        .day-card {
          animation: fadeInUp 0.5s ease-out both;
          transition: all 0.3s ease;
        }

        .day-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.1);
        }

        .plan-fade {
          animation: fadeInUp 0.6s ease-out;
        }

        .save-button {
          transition: all 0.3s ease;
        }

        .save-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
        }

        .save-button:active {
          transform: scale(0.97);
        }

        .chat-container {
          scroll-behavior: smooth;
        }

        .typing-dot {
          animation: pulse 1.4s ease-in-out infinite;
        }

        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        .slide-down {
          animation: slideDown 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 900,
    margin: "0 auto",
    padding: "32px 24px",
    minHeight: "100vh",
    background: "#fafafa",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
    paddingBottom: 20,
    borderBottom: "3px solid #000",
    flexWrap: "wrap" as const,
    gap: 16,
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  headerIcon: {
    fontSize: "2.2rem",
  },
  title: {
    fontSize: "2rem",
    fontWeight: 700,
    color: "#000",
    margin: 0,
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: "0.95rem",
    color: "#666",
    margin: "2px 0 0 0",
  },
  backButton: {
    padding: "10px 20px",
    border: "2px solid #000",
    borderRadius: 8,
    background: "#fff",
    color: "#000",
    textDecoration: "none",
    fontSize: "0.95rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  chatWrapper: {
    border: "2px solid #000",
    borderRadius: 16,
    background: "#fff",
    marginBottom: 24,
    overflow: "hidden",
  },
  chatContainer: {
    padding: "20px",
    minHeight: "280px",
    maxHeight: "400px",
    overflowY: "auto" as const,
    background: "#fff",
  },
  messageWrapper: {
    display: "flex",
    marginBottom: 12,
  },
  message: {
    maxWidth: "80%",
    padding: "14px 18px",
    borderRadius: 12,
    border: "1px solid #e0e0e0",
  },
  botMessage: {
    background: "#f8f8f8",
    borderBottomLeftRadius: 4,
  },
  userMessage: {
    background: "#000",
    color: "#fff",
    borderBottomRightRadius: 4,
    borderColor: "#000",
  },
  messageHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  messageIcon: {
    fontSize: "0.9rem",
  },
  messageSender: {
    fontSize: "0.8rem",
    fontWeight: 600,
  },
  messageContent: {
    margin: 0,
    fontSize: "0.95rem",
    lineHeight: 1.5,
    color: "inherit",
  },
  typingWrapper: {
    display: "flex",
    justifyContent: "flex-start",
    padding: "8px 0",
  },
  typingIndicator: {
    display: "flex",
    gap: 6,
    padding: "12px 18px",
    background: "#f8f8f8",
    borderRadius: 12,
    borderBottomLeftRadius: 4,
    border: "1px solid #e0e0e0",
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#000",
    display: "inline-block",
  },
  optionsContainer: {
    padding: "24px",
    background: "#fff",
    border: "2px solid #000",
    borderRadius: 16,
    marginBottom: 24,
  },
  questionWrapper: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  questionIcon: {
    fontSize: "1.5rem",
  },
  questionText: {
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#000",
    margin: 0,
  },
  optionsGrid: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap" as const,
  },
  optionButton: {
    padding: "10px 20px",
    border: "2px solid #000",
    borderRadius: 8,
    background: "#fff",
    color: "#000",
    fontSize: "0.95rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 16,
    padding: "40px",
    background: "#fff",
    border: "2px solid #000",
    borderRadius: 16,
  },
  spinner: {
    width: 40,
    height: 40,
    border: "3px solid #e0e0e0",
    borderTop: "3px solid #000",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    fontSize: "1rem",
    color: "#666",
    margin: 0,
  },
  planContainer: {
    marginTop: 32,
    padding: "28px",
    background: "#fff",
    border: "2px solid #000",
    borderRadius: 16,
  },
  planHeader: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottom: "2px solid #e0e0e0",
  },
  planTitle: {
    fontSize: "1.8rem",
    color: "#000",
    margin: "0 0 12px 0",
  },
  planMeta: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap" as const,
  },
  metaBadge: {
    padding: "6px 14px",
    background: "#f5f5f5",
    border: "1px solid #e0e0e0",
    borderRadius: 20,
    fontSize: "0.9rem",
    color: "#333",
  },
  weekGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 20,
    marginBottom: 24,
  },
  dayCard: {
    padding: "20px",
    border: "1px solid #e0e0e0",
    borderRadius: 12,
    background: "#fafafa",
    transition: "all 0.3s ease",
  },
  dayHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 10,
    borderBottom: "1px solid #e0e0e0",
  },
  dayTitle: {
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#000",
    margin: 0,
  },
  dayFocus: {
    fontSize: "0.8rem",
    color: "#666",
    background: "#fff",
    padding: "4px 10px",
    borderRadius: 12,
    border: "1px solid #e0e0e0",
  },
  exercisesList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 10,
  },
  exerciseItem: {
    padding: "10px 0",
    borderBottom: "1px solid #f0f0f0",
  },
  exerciseInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exerciseName: {
    fontWeight: 600,
    color: "#000",
    fontSize: "0.95rem",
  },
  exerciseSets: {
    fontSize: "0.85rem",
    color: "#666",
    fontWeight: 500,
  },
  exerciseNote: {
    fontSize: "0.8rem",
    color: "#888",
    margin: "4px 0 0 0",
    fontStyle: "italic",
  },
  saveButton: {
    width: "100%",
    padding: "14px",
    background: "#000",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: "1.1rem",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    transition: "all 0.3s ease",
  },
  saveButtonDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
  },
  buttonSpinner: {
    width: 20,
    height: 20,
    border: "2px solid #fff",
    borderTop: "2px solid transparent",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    display: "inline-block",
  },
  errorContainer: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 20px",
    background: "#fff5f5",
    border: "1px solid #cc0000",
    borderRadius: 10,
    marginTop: 16,
  },
  errorIcon: {
    fontSize: "1.2rem",
  },
  errorText: {
    fontSize: "0.95rem",
    color: "#cc0000",
    margin: 0,
  },
} as const;