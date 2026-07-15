"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

type Workout = {
  id: number;
  goal: string;
  level: string;
};

export default function Dashboard() {
  const router = useRouter();
  const pathname = usePathname();

  const [plans, setPlans] = useState<Workout[]>([]);

  const loadplans = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5000/myworkouts",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const data = await res.json();

      console.log("MY WORKOUT RESPONSE:", data);

      setPlans(Array.isArray(data) ? data : []);

    } catch (err) {
      console.log(err);
      setPlans([]);
    }
  };


  useEffect(() => {
    router.refresh();
    loadplans();
  }, []);


  return (
    <div style={{ maxWidth: 900, margin: "auto" }}>
      <h1>My Workout Plans</h1>

      {plans.map((workout) => (
        <div
          key={workout.id}
          style={{
            border: "1px solid #ccc",
            padding: 20,
            marginTop: 20,
            borderRadius: 10,
          }}
        >
          <h2>{workout.goal}</h2>

          <p>Level: {workout.level}</p>

          <button
            onClick={() =>
              router.push(`/workout/${workout.id}`)
            }
          >
            Start Workout
          </button>

        </div>
      ))}
    </div>
  );
}