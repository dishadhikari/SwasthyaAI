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
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string }>({ 
    correct: false, 
    message: "Awaiting camera input..." 
  });
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
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.iconWrapper}>
            <span style={styles.icon}>🏋️</span>
          </div>
          <div>
            <h1 style={styles.title}>Camera Guided Training</h1>
            <p style={styles.subtitle}>
              Complete 15 exercises with live posture feedback
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push(`/workout`)}
          style={styles.backButton}
        >
          ← Back to plans
        </button>
      </div>

      {/* Main Grid */}
      <div style={styles.grid}>
        {/* Left Column */}
        <div style={styles.leftColumn}>
          {/* Day Info */}
          <div style={styles.dayInfo}>
            <h2 style={styles.dayTitle}>{dayLabel}</h2>
            <p style={styles.daySubtitle}>
              Exercise {currentIndex + 1} of {exercises.length}
            </p>
          </div>

          {/* Exercise Info & Timer */}
          <div style={styles.exerciseGrid}>
            <div style={styles.exerciseInfo}>
              <h3 style={styles.exerciseName}>{currentExercise.name}</h3>
              <p style={styles.exerciseSubtitle}>{currentExercise.subtitle}</p>
              <p style={styles.exerciseInstructions}>{currentExercise.instructions}</p>
            </div>

            <div style={styles.timerContainer}>
              <p style={styles.timerLabel}>
                {phase === "exercise" ? "Exercise" : phase === "rest" ? "Rest" : "Ready"}
              </p>
              <p style={styles.timerValue}>{timeLeft}s</p>
              <p style={styles.timerNext}>
                {phase === "rest" 
                  ? `Next: ${exercises[currentIndex + 1]?.name ?? "Done"}` 
                  : "Keep moving"}
              </p>
            </div>
          </div>

          {/* Controls & Feedback */}
          <div style={styles.controlsGrid}>
            <button
              onClick={startWorkout}
              disabled={status === "running" || status === "loading"}
              style={{
                ...styles.startButton,
                ...(status === "running" && styles.startButtonRunning),
                ...(status === "loading" && styles.startButtonLoading),
              }}
              className="start-button"
            >
              {status === "loading" 
                ? "⏳ Starting camera..." 
                : status === "running" 
                  ? "⏱️ Workout in progress" 
                  : "▶️ Start Workout"}
            </button>

            <div style={styles.feedbackContainer}>
              <p style={styles.feedbackLabel}>Feedback</p>
              <p style={{
                ...styles.feedbackMessage,
                ...(feedback.correct ? styles.feedbackCorrect : styles.feedbackIncorrect),
              }}>
                {feedback.message}
              </p>
            </div>
          </div>

          {error && (
            <div style={styles.errorContainer}>
              <span style={styles.errorIcon}>⚠️</span>
              <p style={styles.errorText}>{error}</p>
            </div>
          )}

          {status === "done" && (
            <div style={styles.completeContainer}>
              <span style={styles.completeIcon}>🎉</span>
              <div>
                <h3 style={styles.completeTitle}>Workout Complete!</h3>
                <p style={styles.completeText}>Great job completing the session. Keep it up! 💪</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Camera */}
        <div style={styles.rightColumn}>
          <div style={styles.cameraContainer}>
            <div style={styles.videoWrapper}>
              <video 
                ref={videoRef} 
                style={styles.video} 
                playsInline 
                muted 
              />
              <canvas 
                ref={canvasRef} 
                style={styles.canvas} 
              />
              {status === "idle" && (
                <div style={styles.cameraPlaceholder}>
                  <span style={styles.cameraIcon}>📷</span>
                  <p style={styles.cameraText}>Click "Start Workout" to begin</p>
                </div>
              )}
            </div>
          </div>

          {/* Progress List */}
          <div style={styles.progressContainer}>
            <p style={styles.progressLabel}>Session Progress</p>
            <div style={styles.progressList}>
              {exercises.map((exercise, index) => (
                <div
                  key={exercise.name}
                  style={{
                    ...styles.progressItem,
                    ...(index === currentIndex && styles.progressItemActive),
                    ...(index < currentIndex && styles.progressItemDone),
                    animationDelay: `${index * 0.05}s`,
                  }}
                  className="progress-item"
                >
                  <span style={styles.progressName}>{exercise.name}</span>
                  <span style={styles.progressStatus}>
                    {index < currentIndex 
                      ? "✅" 
                      : index === currentIndex 
                        ? phase === "exercise" 
                          ? "▶️" 
                          : phase === "rest" 
                            ? "⏸️" 
                            : "⏳"
                        : "○"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

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
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(0,255,0,0.2); }
          50% { box-shadow: 0 0 40px rgba(0,255,0,0.4); }
        }

        .start-button {
          transition: all 0.3s ease;
        }

        .start-button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        }

        .start-button:active:not(:disabled) {
          transform: scale(0.97);
        }

        .progress-item {
          animation: fadeInUp 0.3s ease-out both;
          transition: all 0.3s ease;
        }

        .progress-item:hover {
          transform: translateX(5px);
        }

        .timer-value {
          animation: pulse 2s ease-in-out infinite;
        }

        .complete-container {
          animation: glow 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 1300,
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
  subtitle: {
    fontSize: "0.95rem",
    color: "#666",
    margin: "4px 0 0 0",
  },
  backButton: {
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
    gridTemplateColumns: "1.4fr 0.9fr",
    gap: 24,
  },
  leftColumn: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 16,
  },
  dayInfo: {
    padding: "20px 24px",
    border: "2px solid #000",
    borderRadius: 16,
    background: "#fff",
  },
  dayTitle: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#000",
    margin: 0,
  },
  daySubtitle: {
    fontSize: "0.9rem",
    color: "#666",
    margin: "4px 0 0 0",
  },
  exerciseGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 0.7fr",
    gap: 16,
  },
  exerciseInfo: {
    padding: "20px 24px",
    border: "2px solid #000",
    borderRadius: 16,
    background: "#fff",
  },
  exerciseName: {
    fontSize: "1.8rem",
    fontWeight: 700,
    color: "#000",
    margin: "0 0 8px 0",
  },
  exerciseSubtitle: {
    fontSize: "0.95rem",
    color: "#666",
    margin: 0,
  },
  exerciseInstructions: {
    fontSize: "0.9rem",
    color: "#444",
    margin: "12px 0 0 0",
    padding: "12px 16px",
    background: "#f5f5f5",
    borderRadius: 8,
    borderLeft: "4px solid #000",
  },
  timerContainer: {
    padding: "20px 24px",
    border: "2px solid #000",
    borderRadius: 16,
    background: "#fff",
    textAlign: "center" as const,
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
  },
  timerLabel: {
    fontSize: "0.85rem",
    color: "#666",
    margin: 0,
    fontWeight: 500,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  timerValue: {
    fontSize: "3.5rem",
    fontWeight: 700,
    color: "#000",
    margin: "4px 0",
  },
  timerNext: {
    fontSize: "0.85rem",
    color: "#888",
    margin: 0,
  },
  controlsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  startButton: {
    padding: "16px 24px",
    background: "#000",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  startButtonRunning: {
    opacity: 0.7,
    cursor: "not-allowed",
  },
  startButtonLoading: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  feedbackContainer: {
    padding: "16px 20px",
    border: "2px solid #000",
    borderRadius: 12,
    background: "#fff",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
  },
  feedbackLabel: {
    fontSize: "0.75rem",
    color: "#666",
    margin: "0 0 4px 0",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    fontWeight: 600,
  },
  feedbackMessage: {
    fontSize: "0.95rem",
    margin: 0,
    fontWeight: 500,
  },
  feedbackCorrect: {
    color: "#008000",
  },
  feedbackIncorrect: {
    color: "#cc0000",
  },
  errorContainer: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 20px",
    background: "#fff5f5",
    border: "1px solid #cc0000",
    borderRadius: 10,
  },
  errorIcon: {
    fontSize: "1.2rem",
  },
  errorText: {
    fontSize: "0.95rem",
    color: "#cc0000",
    margin: 0,
  },
  completeContainer: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "20px 24px",
    background: "#f0faf0",
    border: "2px solid #008000",
    borderRadius: 12,
  },
  completeIcon: {
    fontSize: "2rem",
  },
  completeTitle: {
    fontSize: "1.2rem",
    fontWeight: 700,
    color: "#008000",
    margin: 0,
  },
  completeText: {
    fontSize: "0.95rem",
    color: "#333",
    margin: "4px 0 0 0",
  },
  rightColumn: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 16,
  },
  cameraContainer: {
    border: "2px solid #000",
    borderRadius: 16,
    overflow: "hidden",
    background: "#000",
  },
  videoWrapper: {
    position: "relative" as const,
    paddingTop: "75%",
    background: "#111",
  },
  video: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
  },
  canvas: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  cameraPlaceholder: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    background: "#1a1a1a",
    gap: 16,
  },
  cameraIcon: {
    fontSize: "3rem",
    opacity: 0.5,
  },
  cameraText: {
    color: "#666",
    fontSize: "0.95rem",
    margin: 0,
  },
  progressContainer: {
    padding: "20px 24px",
    border: "2px solid #000",
    borderRadius: 16,
    background: "#fff",
    maxHeight: 300,
    overflowY: "auto" as const,
  },
  progressLabel: {
    fontSize: "0.85rem",
    color: "#666",
    margin: "0 0 16px 0",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  progressList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 8,
  },
  progressItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 14px",
    border: "1px solid #e0e0e0",
    borderRadius: 8,
    background: "#fff",
    transition: "all 0.3s ease",
  },
  progressItemActive: {
    borderColor: "#000",
    background: "#f5f5f5",
    borderWidth: 2,
  },
  progressItemDone: {
    opacity: 0.6,
  },
  progressName: {
    fontSize: "0.9rem",
    color: "#333",
    fontWeight: 500,
  },
  progressStatus: {
    fontSize: "0.9rem",
  },
} as const;