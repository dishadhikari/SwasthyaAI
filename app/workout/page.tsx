"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Exercise = {
  name: string;
  sets: number;
  reps: number;
  notes?: string;
};

type DayPlan = {
  day: string;
  focus: string;
  exercises: Exercise[];
};

type Plan = {
  id: number;
  goal: string;
  level: string;
  weekPlan: DayPlan[];
};

export default function PlanPage() {
  const { id } = useParams();
  const router = useRouter();

  const [plan, setPlan] = useState<Plan | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await fetch(`http://localhost:5000/getplan/${id}`);
        if (!res.ok) {
          throw new Error("Failed to load plan");
        }
        const data = await res.json();
        setPlan(data.plan);
      } catch (err: any) {
        setError(err?.message || "Unable to load plan");
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [id]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading your workout plan...</p>
        <div style={styles.loadingDots}>
          <span style={styles.dot}></span>
          <span style={styles.dot}></span>
          <span style={styles.dot}></span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <span style={styles.errorIcon}>⚠️</span>
        <h2 style={styles.errorTitle}>Something went wrong</h2>
        <p style={styles.errorText}>{error}</p>
        <button 
          style={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!plan) {
    return (
      <div style={styles.emptyContainer}>
        <span style={styles.emptyIcon}>📋</span>
        <h2 style={styles.emptyTitle}>No Plan Found</h2>
        <p style={styles.emptyText}>This workout plan doesn't exist or has been removed.</p>
        <button 
          style={styles.backButton}
          onClick={() => router.push("/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.iconWrapper}>
            <span style={styles.icon}>🏋️</span>
          </div>
          <div>
            <h1 style={styles.title}>Your Workout Plan</h1>
            <div style={styles.metaContainer}>
              <span style={styles.metaBadge}>
                <span style={styles.metaLabel}>Goal:</span> {plan.goal}
              </span>
              <span style={styles.metaBadge}>
                <span style={styles.metaLabel}>Level:</span> {plan.level}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          style={styles.dashboardButton}
          className="dashboard-button"
        >
          ← Dashboard
        </button>
      </div>

      {/* Day Grid */}
      <div style={styles.grid}>
        {plan.weekPlan.map((day, index) => (
          <div
            key={index}
            onClick={() => setSelectedDay(index)}
            style={{
              ...styles.dayCard,
              ...(selectedDay === index && styles.dayCardSelected),
              animationDelay: `${index * 0.08}s`,
            }}
            className="day-card"
          >
            <div style={styles.dayHeader}>
              <span style={styles.dayIcon}>
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index % 7]}
              </span>
              <span style={styles.dayNumber}>Day {index + 1}</span>
            </div>
            <h3 style={styles.dayTitle}>{day.day}</h3>
            <p style={styles.dayFocus}>{day.focus}</p>
            <div style={styles.dayMeta}>
              <span style={styles.dayExercises}>
                🏋️ {day.exercises.length} exercises
              </span>
              {selectedDay === index && (
                <span style={styles.selectedIndicator}>●</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Day Details */}
      {selectedDay !== null && (
        <div style={styles.detailsContainer} className="details-slide">
          <div style={styles.detailsHeader}>
            <div>
              <h2 style={styles.detailsTitle}>
                {plan.weekPlan[selectedDay].day} Workout
              </h2>
              <p style={styles.detailsFocus}>
                Focus: {plan.weekPlan[selectedDay].focus}
              </p>
            </div>
            <button
              onClick={() =>
                router.push(`/workout/${id}/${selectedDay}`)
              }
              style={styles.startButton}
              className="start-button"
            >
              <span>Start Workout</span>
              <span style={styles.arrow}>→</span>
            </button>
          </div>

          <div style={styles.exercisesList}>
            {plan.weekPlan[selectedDay].exercises.map((ex, i) => (
              <div
                key={i}
                style={{
                  ...styles.exerciseItem,
                  animationDelay: `${i * 0.06}s`,
                }}
                className="exercise-item"
              >
                <div style={styles.exerciseHeader}>
                  <span style={styles.exerciseNumber}>{i + 1}</span>
                  <h4 style={styles.exerciseName}>{ex.name}</h4>
                </div>
                <div style={styles.exerciseDetails}>
                  <span style={styles.exerciseSets}>
                    {ex.sets} sets × {ex.reps} reps
                  </span>
                  {ex.notes && (
                    <span style={styles.exerciseNote}>
                      💡 {ex.notes}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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

        .day-card {
          animation: fadeInUp 0.5s ease-out both;
          transition: all 0.3s ease;
        }

        .day-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.08);
        }

        .day-card:active {
          transform: scale(0.97);
        }

        .exercise-item {
          animation: fadeInUp 0.3s ease-out both;
          transition: all 0.2s ease;
        }

        .exercise-item:hover {
          background: #f5f5f5;
          transform: translateX(6px);
        }

        .start-button {
          transition: all 0.3s ease;
        }

        .start-button:hover {
          transform: translateX(6px);
          background: #333;
        }

        .start-button:active {
          transform: scale(0.96);
        }

        .details-slide {
          animation: slideDown 0.4s ease-out;
        }

        .dashboard-button {
          transition: all 0.3s ease;
        }

        .dashboard-button:hover {
          background: #333;
          color: #fff;
        }

        .dot {
          animation: pulse 1.4s ease-in-out infinite;
        }

        .dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .dot:nth-child(3) {
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 1100,
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
    paddingBottom: 24,
    borderBottom: "3px solid #000",
    flexWrap: "wrap" as const,
    gap: 16,
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  iconWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "#000",
  },
  icon: {
    fontSize: "1.8rem",
    color: "#fff",
  },
  title: {
    fontSize: "2rem",
    fontWeight: 700,
    color: "#000",
    margin: 0,
    letterSpacing: "-0.02em",
  },
  metaContainer: {
    display: "flex",
    gap: 12,
    marginTop: 8,
    flexWrap: "wrap" as const,
  },
  metaBadge: {
    padding: "4px 14px",
    background: "#f5f5f5",
    border: "1px solid #e0e0e0",
    borderRadius: 20,
    fontSize: "0.9rem",
    color: "#333",
  },
  metaLabel: {
    fontWeight: 600,
    color: "#000",
  },
  dashboardButton: {
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 16,
    marginBottom: 32,
  },
  dayCard: {
    padding: "20px",
    border: "2px solid #e0e0e0",
    borderRadius: 12,
    background: "#fff",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  dayCardSelected: {
    borderColor: "#000",
    background: "#f5f5f5",
    borderWidth: 3,
  },
  dayHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dayIcon: {
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#000",
  },
  dayNumber: {
    fontSize: "0.75rem",
    color: "#999",
    fontWeight: 600,
    padding: "2px 10px",
    border: "1px solid #e0e0e0",
    borderRadius: 12,
  },
  dayTitle: {
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#000",
    margin: 0,
  },
  dayFocus: {
    fontSize: "0.9rem",
    color: "#666",
    margin: "4px 0 8px 0",
  },
  dayMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  dayExercises: {
    fontSize: "0.85rem",
    color: "#888",
  },
  selectedIndicator: {
    color: "#000",
    fontSize: "0.6rem",
  },
  detailsContainer: {
    padding: "28px",
    border: "3px solid #000",
    borderRadius: 16,
    background: "#fff",
  },
  detailsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottom: "2px solid #e0e0e0",
    flexWrap: "wrap" as const,
    gap: 16,
  },
  detailsTitle: {
    fontSize: "1.6rem",
    fontWeight: 700,
    color: "#000",
    margin: 0,
  },
  detailsFocus: {
    fontSize: "0.95rem",
    color: "#666",
    margin: "4px 0 0 0",
  },
  startButton: {
    padding: "12px 24px",
    background: "#000",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 10,
    transition: "all 0.3s ease",
  },
  arrow: {
    fontSize: "1.2rem",
    transition: "transform 0.3s ease",
  },
  exercisesList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
  },
  exerciseItem: {
    padding: "16px 20px",
    border: "1px solid #e0e0e0",
    borderRadius: 10,
    background: "#fafafa",
    transition: "all 0.3s ease",
  },
  exerciseHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 6,
  },
  exerciseNumber: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "#000",
    color: "#fff",
    fontSize: "0.75rem",
    fontWeight: 700,
    flexShrink: 0,
  },
  exerciseName: {
    fontSize: "1.05rem",
    fontWeight: 600,
    color: "#000",
    margin: 0,
  },
  exerciseDetails: {
    display: "flex",
    gap: 16,
    alignItems: "center",
    paddingLeft: 40,
    flexWrap: "wrap" as const,
  },
  exerciseSets: {
    fontSize: "0.9rem",
    color: "#555",
    fontWeight: 500,
  },
  exerciseNote: {
    fontSize: "0.85rem",
    color: "#888",
    fontStyle: "italic",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    gap: 20,
    background: "#fafafa",
  },
  spinner: {
    width: 50,
    height: 50,
    border: "3px solid #e0e0e0",
    borderTop: "3px solid #000",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    fontSize: "1.1rem",
    color: "#666",
    fontWeight: 500,
    margin: 0,
  },
  loadingDots: {
    display: "flex",
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#000",
    display: "inline-block",
  },
  errorContainer: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#fafafa",
    padding: 20,
    gap: 16,
  },
  errorIcon: {
    fontSize: "3rem",
  },
  errorTitle: {
    fontSize: "1.5rem",
    color: "#000",
    margin: 0,
  },
  errorText: {
    fontSize: "1rem",
    color: "#666",
    margin: 0,
  },
  retryButton: {
    padding: "12px 32px",
    background: "#000",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  emptyContainer: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#fafafa",
    padding: 20,
    gap: 16,
  },
  emptyIcon: {
    fontSize: "3rem",
  },
  emptyTitle: {
    fontSize: "1.5rem",
    color: "#000",
    margin: 0,
  },
  emptyText: {
    fontSize: "1rem",
    color: "#666",
    margin: 0,
  },
  backButton: {
    padding: "12px 32px",
    background: "#000",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
} as const;