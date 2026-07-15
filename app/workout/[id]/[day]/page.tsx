"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const EXERCISE_DURATION = 60;
const REST_DURATION = 15;

type Exercise = {
  name: string;
  subtitle: string;
  instructions: string;
  check: (pose: any) => { correct: boolean; message: string };
};

type Point = {
  x: number;
  y: number;
  score: number;
  name: string;
  part?: string;
};

const exercises: Exercise[] = [
  {
    name: "Plank",
    subtitle: "Hold a straight line from head to heels",
    instructions: "Keep shoulders over wrists and hips level.",
    check: (pose) => {
      const leftShoulder = findPoint(pose, "left_shoulder");
      const rightShoulder = findPoint(pose, "right_shoulder");
      const leftHip = findPoint(pose, "left_hip");
      const rightHip = findPoint(pose, "right_hip");
      const leftAnkle = findPoint(pose, "left_ankle");
      const rightAnkle = findPoint(pose, "right_ankle");
      if (!leftShoulder || !rightShoulder || !leftHip || !rightHip || !leftAnkle || !rightAnkle) {
        return { correct: false, message: "Bring your full body into the camera view." };
      }
      const shoulderMid = midPoint(leftShoulder, rightShoulder);
      const hipMid = midPoint(leftHip, rightHip);
      const ankleMid = midPoint(leftAnkle, rightAnkle);
      const spineAngle = angle(shoulderMid, hipMid, ankleMid);
      if (spineAngle < 150) {
        return { correct: false, message: "Straighten your body so your hips do not sag." };
      }
      return { correct: true, message: "Good plank form. Keep your body straight." };
    },
  },
  {
    name: "Push-up",
    subtitle: "Body should stay straight while lowering and raising",
    instructions: "Keep elbows close to your body and core tight.",
    check: (pose) => {
      const leftShoulder = findPoint(pose, "left_shoulder");
      const leftElbow = findPoint(pose, "left_elbow");
      const leftWrist = findPoint(pose, "left_wrist");
      const leftHip = findPoint(pose, "left_hip");
      const leftAnkle = findPoint(pose, "left_ankle");
      if (!leftShoulder || !leftElbow || !leftWrist || !leftHip || !leftAnkle) {
        return { correct: false, message: "Position your left side clearly in the camera view." };
      }
      const elbowAngle = angle(leftShoulder, leftElbow, leftWrist);
      const spineAngle = angle(leftShoulder, leftHip, leftAnkle);
      if (spineAngle < 150) {
        return { correct: false, message: "Keep your body in a straight line from shoulders to ankles." };
      }
      if (elbowAngle > 160) {
        return { correct: true, message: "Great push-up position. Keep your form steady." };
      }
      return { correct: false, message: "Push back up so your arms are more extended." };
    },
  },
  {
    name: "Squat",
    subtitle: "Knees should track over toes with chest up",
    instructions: "Push your hips back and keep your spine tall.",
    check: (pose) => {
      const leftHip = findPoint(pose, "left_hip");
      const leftKnee = findPoint(pose, "left_knee");
      const leftAnkle = findPoint(pose, "left_ankle");
      const rightHip = findPoint(pose, "right_hip");
      const rightKnee = findPoint(pose, "right_knee");
      const rightAnkle = findPoint(pose, "right_ankle");
      if (!leftHip || !leftKnee || !leftAnkle || !rightHip || !rightKnee || !rightAnkle) {
        return { correct: false, message: "Show both legs clearly to check your squat." };
      }
      const leftKneeAngle = angle(leftHip, leftKnee, leftAnkle);
      const rightKneeAngle = angle(rightHip, rightKnee, rightAnkle);
      const hipKneeAngle = Math.min(leftKneeAngle, rightKneeAngle);
      if (hipKneeAngle < 100 && hipKneeAngle > 65) {
        return { correct: true, message: "Good squat depth. Keep your chest up." };
      }
      return { correct: false, message: "Go lower and keep your knees behind your toes." };
    },
  },
  {
    name: "Lunge",
    subtitle: "One leg forward and one leg back with a vertical torso",
    instructions: "Keep your front knee aligned with your toes.",
    check: (pose) => {
      const leftHip = findPoint(pose, "left_hip");
      const leftKnee = findPoint(pose, "left_knee");
      const leftAnkle = findPoint(pose, "left_ankle");
      const rightHip = findPoint(pose, "right_hip");
      const rightKnee = findPoint(pose, "right_knee");
      const rightAnkle = findPoint(pose, "right_ankle");
      if (!leftHip || !leftKnee || !leftAnkle || !rightHip || !rightKnee || !rightAnkle) {
        return { correct: false, message: "Make sure both legs are visible in the frame." };
      }
      const frontKneeAngle = angle(leftHip, leftKnee, leftAnkle);
      const backKneeAngle = angle(rightHip, rightKnee, rightAnkle);
      if (frontKneeAngle < 120 && frontKneeAngle > 70 && backKneeAngle > 140) {
        return { correct: true, message: "Great lunge form. Keep your torso upright." };
      }
      return { correct: false, message: "Step further and lower until the front knee is at a right angle." };
    },
  },
  {
    name: "Jumping Jacks",
    subtitle: "Arms overhead and legs wide apart",
    instructions: "Jump with arms reaching up and legs apart.",
    check: (pose) => {
      const leftWrist = findPoint(pose, "left_wrist");
      const rightWrist = findPoint(pose, "right_wrist");
      const leftAnkle = findPoint(pose, "left_ankle");
      const rightAnkle = findPoint(pose, "right_ankle");
      const leftShoulder = findPoint(pose, "left_shoulder");
      const rightShoulder = findPoint(pose, "right_shoulder");
      if (!leftWrist || !rightWrist || !leftAnkle || !rightAnkle || !leftShoulder || !rightShoulder) {
        return { correct: false, message: "Make sure your full body is visible in the camera." };
      }
      const handsUp = leftWrist.y < leftShoulder.y && rightWrist.y < rightShoulder.y;
      const wideLegs = Math.abs(leftAnkle.x - rightAnkle.x) > Math.abs(leftShoulder.x - rightShoulder.x) * 1.2;
      if (handsUp && wideLegs) {
        return { correct: true, message: "Nice jumping jack. Keep your arms fully extended." };
      }
      return { correct: false, message: "Raise your arms and open your legs wider." };
    },
  },
  {
    name: "High Knees",
    subtitle: "Drive knees toward your chest alternately",
    instructions: "Bring each knee up high and keep a quick pace.",
    check: (pose) => {
      const leftKnee = findPoint(pose, "left_knee");
      const rightKnee = findPoint(pose, "right_knee");
      const leftHip = findPoint(pose, "left_hip");
      const rightHip = findPoint(pose, "right_hip");
      if (!leftKnee || !rightKnee || !leftHip || !rightHip) {
        return { correct: false, message: "Keep your hips and knees visible in the frame." };
      }
      const hipHeight = Math.min(leftHip.y, rightHip.y);
      const kneeHigh = (leftKnee.y < hipHeight || rightKnee.y < hipHeight);
      if (kneeHigh) {
        return { correct: true, message: "Great! Lift those knees high." };
      }
      return { correct: false, message: "Raise your knees higher toward your chest." };
    },
  },
  {
    name: "Mountain Climbers",
    subtitle: "Run your knees toward your chest in plank position",
    instructions: "Keep your body straight and move your legs quickly.",
    check: (pose) => {
      const leftHip = findPoint(pose, "left_hip");
      const leftKnee = findPoint(pose, "left_knee");
      const leftAnkle = findPoint(pose, "left_ankle");
      const leftShoulder = findPoint(pose, "left_shoulder");
      if (!leftHip || !leftKnee || !leftAnkle || !leftShoulder) {
        return { correct: false, message: "Keep the left side of your body visible for a good check." };
      }
      const spineAngle = angle(leftShoulder, leftHip, leftAnkle);
      const kneeUp = leftKnee.y < leftHip.y;
      if (spineAngle > 150 && kneeUp) {
        return { correct: true, message: "Good mountain climber form. Keep your core tight." };
      }
      return { correct: false, message: "Stay in a straight plank and drive knees forward." };
    },
  },
  {
    name: "Standing Shoulder Press",
    subtitle: "Lift arms overhead with straight elbows",
    instructions: "Press your arms up while keeping your spine tall.",
    check: (pose) => {
      const leftWrist = findPoint(pose, "left_wrist");
      const rightWrist = findPoint(pose, "right_wrist");
      const leftShoulder = findPoint(pose, "left_shoulder");
      const rightShoulder = findPoint(pose, "right_shoulder");
      if (!leftWrist || !rightWrist || !leftShoulder || !rightShoulder) {
        return { correct: false, message: "Raise your arms so they are visible above your shoulders." };
      }
      const leftHandUp = leftWrist.y < leftShoulder.y;
      const rightHandUp = rightWrist.y < rightShoulder.y;
      if (leftHandUp && rightHandUp) {
        return { correct: true, message: "Perfect. Keep pressing your arms overhead." };
      }
      return { correct: false, message: "Raise both arms fully above your head." };
    },
  },
  {
    name: "Side Plank Left",
    subtitle: "Balance on your left side with hips lifted",
    instructions: "Keep your body in a straight line from head to feet.",
    check: (pose) => {
      const leftShoulder = findPoint(pose, "left_shoulder");
      const leftHip = findPoint(pose, "left_hip");
      const leftAnkle = findPoint(pose, "left_ankle");
      if (!leftShoulder || !leftHip || !leftAnkle) {
        return { correct: false, message: "Make sure your left side is fully seen by the camera." };
      }
      const angleLeft = angle(leftShoulder, leftHip, leftAnkle);
      if (angleLeft > 160) {
        return { correct: true, message: "Nice side plank. Keep your hips lifted." };
      }
      return { correct: false, message: "Lift your hips so your body is straight." };
    },
  },
  {
    name: "Side Plank Right",
    subtitle: "Balance on your right side with hips lifted",
    instructions: "Keep your body straight from head to feet.",
    check: (pose) => {
      const rightShoulder = findPoint(pose, "right_shoulder");
      const rightHip = findPoint(pose, "right_hip");
      const rightAnkle = findPoint(pose, "right_ankle");
      if (!rightShoulder || !rightHip || !rightAnkle) {
        return { correct: false, message: "Make sure your right side is visible in the frame." };
      }
      const angleRight = angle(rightShoulder, rightHip, rightAnkle);
      if (angleRight > 160) {
        return { correct: true, message: "Great side plank. Keep your hips high." };
      }
      return { correct: false, message: "Lift your hips and keep your body straight." };
    },
  },
  {
    name: "Standing Leg Raise",
    subtitle: "Lift one leg in front while keeping balance",
    instructions: "Keep your torso upright and lift the leg slowly.",
    check: (pose) => {
      const leftKnee = findPoint(pose, "left_knee");
      const leftHip = findPoint(pose, "left_hip");
      const rightHip = findPoint(pose, "right_hip");
      if (!leftKnee || !leftHip || !rightHip) {
        return { correct: false, message: "Keep your hips and raised leg visible." };
      }
      if (leftKnee.y < leftHip.y) {
        return { correct: true, message: "Good leg raise. Keep your torso steady." };
      }
      return { correct: false, message: "Lift your leg higher in front of you." };
    },
  },
  {
    name: "Calf Raise",
    subtitle: "Rise onto your toes with a stable stance",
    instructions: "Slowly lift and lower while keeping balance.",
    check: (pose) => {
      const leftHeel = findPoint(pose, "left_heel");
      const leftAnkle = findPoint(pose, "left_ankle");
      if (!leftHeel || !leftAnkle) {
        return { correct: false, message: "Make sure your feet are visible to check the calf raise." };
      }
      if (leftHeel.y < leftAnkle.y) {
        return { correct: true, message: "Nice calf raise. Keep your ankles stable." };
      }
      return { correct: false, message: "Lift your heels off the ground." };
    },
  },
  {
    name: "Hip Bridge",
    subtitle: "Raise hips while keeping your back straight",
    instructions: "Squeeze glutes and hold the top position.",
    check: (pose) => {
      const leftShoulder = findPoint(pose, "left_shoulder");
      const leftHip = findPoint(pose, "left_hip");
      const leftKnee = findPoint(pose, "left_knee");
      if (!leftShoulder || !leftHip || !leftKnee) {
        return { correct: false, message: "Show your side or top view so the hip bridge is visible." };
      }
      const angleHip = angle(leftShoulder, leftHip, leftKnee);
      if (angleHip > 150) {
        return { correct: true, message: "Good hip bridge. Keep your hips lifted." };
      }
      return { correct: false, message: "Lift your hips until your body forms a straight line." };
    },
  },
  {
    name: "Arm Circles",
    subtitle: "Rotate your arms in controlled circles",
    instructions: "Keep arms extended and move from the shoulders.",
    check: (pose) => {
      const leftWrist = findPoint(pose, "left_wrist");
      const leftElbow = findPoint(pose, "left_elbow");
      const leftShoulder = findPoint(pose, "left_shoulder");
      if (!leftWrist || !leftElbow || !leftShoulder) {
        return { correct: false, message: "Show your left arm clearly for arm circle tracking." };
      }
      const elbowAngle = angle(leftShoulder, leftElbow, leftWrist);
      if (elbowAngle > 150) {
        return { correct: true, message: "Great. Keep your arm extended and rotate from the shoulder." };
      }
      return { correct: false, message: "Straighten your arm and make the circle from your shoulder." };
    },
  },
  {
    name: "Standing Back Extension",
    subtitle: "Gently arch your upper back while standing",
    instructions: "Extend your spine without locking your knees.",
    check: (pose) => {
      const leftShoulder = findPoint(pose, "left_shoulder");
      const leftHip = findPoint(pose, "left_hip");
      const leftEar = findPoint(pose, "left_ear");
      if (!leftShoulder || !leftHip || !leftEar) {
        return { correct: false, message: "Keep your upper body visible while you extend back." };
      }
      if (leftEar.y < leftShoulder.y) {
        return { correct: true, message: "Good extension. Keep the movement controlled." };
      }
      return { correct: false, message: "Lift your chest and look slightly upward." };
    },
  },
  {
    name: "Wall Sit",
    subtitle: "Sit against an imaginary wall with thighs parallel to the ground",
    instructions: "Keep your knees over your ankles and back straight.",
    check: (pose) => {
      const leftHip = findPoint(pose, "left_hip");
      const leftKnee = findPoint(pose, "left_knee");
      const leftAnkle = findPoint(pose, "left_ankle");
      if (!leftHip || !leftKnee || !leftAnkle) {
        return { correct: false, message: "Make sure your legs are fully visible in the frame." };
      }
      const kneeAngle = angle(leftHip, leftKnee, leftAnkle);
      if (kneeAngle > 70 && kneeAngle < 100) {
        return { correct: true, message: "Good wall sit position. Keep your back straight." };
      }
      return { correct: false, message: "Lower into the squat so your thighs are parallel to the floor." };
    },
  },
];

function findPoint(pose: any, name: string): Point | null {
  if (!pose || !pose.keypoints) return null;
  const point = pose.keypoints.find((kp: any) => kp.name === name || kp.part === name);
  return point && point.score > 0.3 ? point : null;
}

function midPoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, score: (a.score + b.score) / 2, name: "mid" };
}

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function angle(a: Point, b: Point, c: Point) {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const magAB = Math.hypot(ab.x, ab.y);
  const magCB = Math.hypot(cb.x, cb.y);
  if (magAB === 0 || magCB === 0) return 0;
  const cos = Math.max(-1, Math.min(1, dot / (magAB * magCB)));
  return (Math.acos(cos) * 180) / Math.PI;
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("Cannot load scripts on the server."));
      return;
    }
    if (document.querySelector(`script[src=\"${src}\"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

async function loadPoseDetectionSdk() {
  if (typeof window === "undefined") {
    throw new Error("Pose detection must run in the browser.");
  }

  if (!(window as any).tf) {
    await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js");
  }

  if (!(window as any).tf?.setBackend) {
    throw new Error("TensorFlow failed to load.");
  }

  if (!(window as any).tf?.engine) {
    await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl@4.22.0/dist/tf-backend-webgl.js");
  }

  if (!(window as any).pose) {
    await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/pose.js");
  }

  if (!(window as any).poseDetection) {
    await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.1.3/dist/pose-detection.min.js");
  }

  const tf = (window as any).tf;
  await tf.setBackend("webgl");
  await tf.ready();

  const poseDetection = (window as any).poseDetection;
  if (!poseDetection) {
    throw new Error("Pose detection SDK is not available.");
  }

  return { tf, poseDetection };
}

function drawPose(canvas: HTMLCanvasElement, pose: any, correct: boolean) {
  const ctx = canvas.getContext("2d");
  if (!ctx || !pose) return;
  const video = canvas.previousElementSibling as HTMLVideoElement | null;
  if (!video) return;
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.scale(-1, 1);
  ctx.translate(-width, 0);
  ctx.strokeStyle = correct ? "rgba(0,255,0,0.7)" : "rgba(255,0,0,0.7)";
  ctx.fillStyle = correct ? "rgba(0,255,0,0.7)" : "rgba(255,0,0,0.7)";
  ctx.lineWidth = 4;

  const keypoints: Point[] = pose.keypoints?.filter((kp: any) => kp.score > 0.3) ?? [];
  const neighbors = [
    ["left_shoulder", "right_shoulder"],
    ["left_shoulder", "left_elbow"],
    ["left_elbow", "left_wrist"],
    ["right_shoulder", "right_elbow"],
    ["right_elbow", "right_wrist"],
    ["left_shoulder", "left_hip"],
    ["right_shoulder", "right_hip"],
    ["left_hip", "right_hip"],
    ["left_hip", "left_knee"],
    ["right_hip", "right_knee"],
    ["left_knee", "left_ankle"],
    ["right_knee", "right_ankle"],
  ];

  const getPoint = (name: string) => keypoints.find((kp) => kp.name === name || kp.part === name) as Point | undefined;

  for (const [a, b] of neighbors) {
    const p1 = getPoint(a);
    const p2 = getPoint(b);
    if (p1 && p2) {
      ctx.beginPath();
      ctx.moveTo(p1.x * width, p1.y * height);
      ctx.lineTo(p2.x * width, p2.y * height);
      ctx.stroke();
    }
  }

  keypoints.forEach((point) => {
    ctx.beginPath();
    ctx.arc(point.x * width, point.y * height, 6, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

export default function WorkoutSessionPage() {
  const { id, day } = useParams();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "running" | "done">("idle");
  const [phase, setPhase] = useState<"ready" | "exercise" | "rest" | "complete">("ready");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(EXERCISE_DURATION);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string }>({ correct: false, message: "Awaiting camera input..." });
  const [error, setError] = useState<string | null>(null);
  const [detector, setDetector] = useState<any>(null);
  const poseRef = useRef<any>(null);
  const intervalRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);

  const currentExercise = useMemo(() => exercises[currentIndex], [currentIndex]);
  const dayLabel = useMemo(() => {
    const index = Number(day);
    return Number.isNaN(index) ? "Workout" : `Day ${index + 1}`;
  }, [day]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      if (animationRef.current) window.cancelAnimationFrame(animationRef.current);
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (status !== "running") return;
    if (phase === "complete") return;
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (phase === "exercise") {
            if (currentIndex === exercises.length - 1) {
              setPhase("complete");
              setStatus("done");
              return 0;
            }
            setPhase("rest");
            return REST_DURATION;
          }
          if (phase === "rest") {
            setCurrentIndex((idx) => Math.min(exercises.length - 1, idx + 1));
            setPhase("exercise");
            return EXERCISE_DURATION;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [status, phase, currentIndex]);

  useEffect(() => {
    if (!detector || !videoRef.current || !canvasRef.current) return;
    let active = true;

    const estimate = async () => {
      if (!active || !detector || !videoRef.current || videoRef.current.readyState < 2) {
        animationRef.current = window.requestAnimationFrame(estimate);
        return;
      }
      try {
        const poses = await detector.estimatePoses(videoRef.current, { flipHorizontal: true });
        const pose = poses?.[0] ?? null;
        poseRef.current = pose;
        const result = currentExercise.check(pose);
        setFeedback(result);
        drawPose(canvasRef.current!, pose, result.correct);
      } catch (err) {
        setFeedback({ correct: false, message: "Unable to read pose. Keep your body visible." });
      }
      animationRef.current = window.requestAnimationFrame(estimate);
    };

    animationRef.current = window.requestAnimationFrame(estimate);
    return () => {
      active = false;
      if (animationRef.current) window.cancelAnimationFrame(animationRef.current);
    };
  }, [detector, currentExercise]);

  const initializeModel = async () => {
    const { poseDetection } = await loadPoseDetectionSdk();
    const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
    });
    setDetector(detector);
  };

  const startWorkout = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Camera access is not available in this browser.");
      return;
    }

    setError(null);
    setStatus("loading");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      await initializeModel();
      setPhase("exercise");
      setTimeLeft(EXERCISE_DURATION);
      setStatus("running");
    } catch (err: any) {
      setError(err?.message || "Unable to start the camera.");
      setStatus("idle");
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const resize = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.style.width = `${video.clientWidth}px`;
      canvas.style.height = `${video.clientHeight}px`;
    };

    video.addEventListener("loadeddata", resize);
    window.addEventListener("resize", resize);
    return () => {
      video.removeEventListener("loadeddata", resize);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <main className="p-6">
      <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-border bg-background p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Workout time</p>
            <h1 className="text-3xl font-semibold">Camera Guided Training</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Complete 15 exercises with live posture feedback, a countdown watch, and short rest intervals between each movement.
            </p>
          </div>
          <button
            onClick={() => router.push(`/workout`)}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm hover:bg-muted"
          >
            Back to plans
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-4">
            <div className="rounded-3xl border border-border bg-slate-950/5 p-4">
              <h2 className="text-xl font-semibold">{dayLabel}</h2>
              <p className="text-sm text-muted-foreground">Exercise {currentIndex + 1} of {exercises.length}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_0.7fr]">
              <div className="rounded-3xl border border-border bg-background p-4">
                <h3 className="text-2xl font-semibold">{currentExercise.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{currentExercise.subtitle}</p>
                <p className="mt-4 text-sm">{currentExercise.instructions}</p>
              </div>

              <div className="rounded-3xl border border-border bg-background p-4 text-center">
                <p className="text-sm text-muted-foreground">{phase === "exercise" ? "Exercise" : phase === "rest" ? "Rest" : "Ready"}</p>
                <p className="mt-2 text-5xl font-bold">{timeLeft}s</p>
                <p className="mt-2 text-sm">{phase === "rest" ? `Next: ${exercises[currentIndex + 1]?.name ?? "Done"}` : "Keep moving"}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
              <button
                onClick={startWorkout}
                disabled={status === "running" || status === "loading"}
                className="rounded-3xl bg-primary px-6 py-4 text-sm font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "loading" ? "Starting camera..." : status === "running" ? "Workout in progress" : "Start Workout"}
              </button>
              <div className="rounded-3xl border border-border bg-background p-4 text-left">
                <p className="text-sm font-semibold">Feedback</p>
                <p className={`mt-2 text-sm ${feedback.correct ? "text-emerald-600" : "text-destructive"}`}>{feedback.message}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="overflow-hidden rounded-3xl border border-border bg-black">
              <div className="relative h-[420px] w-full rounded-3xl bg-black">
                <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
                <canvas ref={canvasRef} className="absolute left-0 top-0 h-full w-full" />
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-background p-4">
              <p className="text-sm text-muted-foreground">Session progress</p>
              <div className="mt-4 space-y-3">
                {exercises.map((exercise, index) => (
                  <div key={exercise.name} className={`flex items-center justify-between rounded-3xl border px-4 py-3 ${index === currentIndex ? "border-primary/50 bg-primary/5" : "border-border bg-background"}`}>
                    <p className="text-sm font-medium">{exercise.name}</p>
                    <p className="text-xs text-muted-foreground">{index < currentIndex ? "Done" : index === currentIndex ? phase === "exercise" ? "Now" : phase === "rest" ? "Rest" : "Next" : "Upcoming"}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {error ? <div className="rounded-3xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">{error}</div> : null}
        {status === "done" ? (
          <div className="rounded-3xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-800">
            Workout complete! Great job completing the session.
          </div>
        ) : null}
      </div>
    </main>
  );
}
