"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Workout = {
  id: number;
  goal: string;
  level: string;
};

export default function Dashboard() {
  const router = useRouter();
  const [plans, setPlans] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  const loadplans = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/myworkouts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await res.json();
      console.log("MY WORKOUT RESPONSE:", data);
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadplans();
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading your workouts...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>💪 My Workout Plans</h1>
        <p style={styles.subtitle}>
          {plans.length > 0 
            ? `You have ${plans.length} workout plan${plans.length > 1 ? 's' : ''} ready` 
            : "No workout plans yet"}
        </p>
      </div>

      {plans.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No workout plans available</p>
          <button 
            style={styles.createButton}
            onClick={() => router.push("/create-workout")}
          >
            Create Your First Plan
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {plans.map((workout, index) => (
            <div
              key={workout.id}
              style={{
                ...styles.card,
                animationDelay: `${index * 0.1}s`,
              }}
              className="card"
            >
              <div style={styles.cardContent}>
                <div style={styles.goalSection}>
                  <span style={styles.goalIcon}>🎯</span>
                  <h2 style={styles.goalText}>{workout.goal}</h2>
                </div>
                
                <div style={styles.levelBadge}>
                  <span style={styles.levelDot}></span>
                  <p style={styles.levelText}>Level: {workout.level}</p>
                </div>

                <button
                  style={styles.startButton}
                  onClick={() => router.push(`/workout/${workout.id}`)}
                  className="start-button"
                >
                  <span>Start Workout</span>
                  <span style={styles.arrow}>→</span>
                </button>
              </div>
            </div>
          ))}
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

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .card {
          animation: fadeInUp 0.6s ease-out both;
          transition: all 0.3s ease;
        }

        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        .start-button {
          transition: all 0.3s ease;
        }

        .start-button:hover {
          transform: translateX(5px);
          background: #333;
        }

        .start-button:active {
          transform: scale(0.95);
        }

        @keyframes dotPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .loading-dot {
          animation: dotPulse 1.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "40px 20px",
    minHeight: "100vh",
    background: "#fafafa",
  },
  header: {
    marginBottom: 50,
    borderBottom: "2px solid #000",
    paddingBottom: 20,
  },
  title: {
    fontSize: "2.8rem",
    fontWeight: 700,
    color: "#000",
    margin: 0,
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#666",
    marginTop: 8,
    fontWeight: 400,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: 25,
  },
  card: {
    background: "#fff",
    border: "2px solid #000",
    borderRadius: 12,
    padding: 28,
    transition: "all 0.3s ease",
    cursor: "pointer",
  },
  cardContent: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 16,
  },
  goalSection: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  goalIcon: {
    fontSize: "1.8rem",
  },
  goalText: {
    fontSize: "1.3rem",
    fontWeight: 600,
    color: "#000",
    margin: 0,
    lineHeight: 1.3,
  },
  levelBadge: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 14px",
    background: "#f5f5f5",
    borderRadius: 20,
    width: "fit-content",
  },
  levelDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#000",
    display: "inline-block",
  },
  levelText: {
    fontSize: "0.9rem",
    color: "#333",
    margin: 0,
    fontWeight: 500,
  },
  startButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 20px",
    background: "#000",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: "1rem",
    fontWeight: 500,
    cursor: "pointer",
    marginTop: 8,
    transition: "all 0.3s ease",
    width: "100%",
  },
  arrow: {
    fontSize: "1.2rem",
    transition: "transform 0.3s ease",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    gap: 20,
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
    fontWeight: 400,
  },
  emptyState: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 20px",
    border: "2px dashed #ccc",
    borderRadius: 12,
    background: "#fff",
  },
  emptyText: {
    fontSize: "1.2rem",
    color: "#666",
    marginBottom: 24,
  },
  createButton: {
    padding: "14px 32px",
    background: "#000",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: "1rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
} as const;