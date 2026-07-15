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

  useEffect(() => {
    const fetchPlan = async () => {
      const res = await fetch(`http://localhost:5000/getplan/${id}`);
      const data = await res.json();

      setPlan(data.plan); // because we stored JSONB in DB
    };

    fetchPlan();
  }, [id]);

  if (!plan) {
    return <p style={{ padding: 20 }}>Loading plan...</p>;
  }

  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: 20 }}>
      <h1>🏋️ Your Workout Plan</h1>

      <p>
        <b>Goal:</b> {plan.goal} | <b>Level:</b> {plan.level}
      </p>

      {/* DAYS GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginTop: 20,
        }}
      >
        {plan.weekPlan.map((day, index) => (
          <div
            key={index}
            onClick={() => setSelectedDay(index)}
            style={{
              border: "1px solid #ddd",
              padding: 15,
              borderRadius: 10,
              cursor: "pointer",
              background: selectedDay === index ? "#f0f8ff" : "white",
            }}
          >
            <h3>
              {day.day} — {day.focus}
            </h3>
            <p>{day.exercises.length} exercises</p>
          </div>
        ))}
      </div>

      {/* DAY DETAILS */}
      {selectedDay !== null && (
        <div
          style={{
            marginTop: 30,
            padding: 20,
            border: "2px solid black",
            borderRadius: 10,
          }}
        >
          <h2>
            {plan.weekPlan[selectedDay].day} Workout —{" "}
            {plan.weekPlan[selectedDay].focus}
          </h2>

          {plan.weekPlan[selectedDay].exercises.map((ex, i) => (
            <div
              key={i}
              style={{
                padding: 10,
                borderBottom: "1px solid #ddd",
              }}
            >
              <b>{ex.name}</b>
              <p>
                {ex.sets} sets × {ex.reps} reps
              </p>
              {ex.notes && <small>💡 {ex.notes}</small>}
            </div>
          ))}

          <button
            onClick={() =>
              router.push(`/workout/${id}/${selectedDay}`)
            }
            style={{
              marginTop: 15,
              padding: "10px 15px",
              background: "black",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Start Workout ▶
          </button>
        </div>
      )}
    </div>
  );
}