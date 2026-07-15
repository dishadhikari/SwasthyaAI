# FitMeAI Architecture — AI Powered Fitness Ecosystem 

# 🏛️ System Architecture Diagram


```
                         USER
                          │
                          ▼
              ┌───────────────────────┐
              │     Frontend Layer    │
              │                       │
              │ Next.js + React       │
              │ TypeScript            │
              │ TailwindCSS           │
              │ Camera Interface      │
              └───────────┬───────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │     Backend Layer     │
              │                       │
              │ Node.js               │
              │ Express.js            │
              │ REST APIs             │
              │ Authentication        │
              │ Workout Management    │
              └───────────┬───────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌────────────────┐  ┌────────────────┐
│ Generative AI│  │ Computer Vision│  │ External APIs  │
│ Engine       │  │ Engine         │  │                │
│              │  │                │  │                │
│ Groq API     │  │ Pose Detection │  │ GNews API      │
│ Llama 3.1    │  │ Exercise       │  │ OpenStreetMap  │
│              │  │ Analysis       │  │ Overpass API   │
└──────┬───────┘  └───────┬────────┘  └────────────────┘
       │                  │
       └──────────┬───────┘
                  ▼
        ┌──────────────────────┐
        │ PostgreSQL Database  │
        │                      │
        │ Users                │
        │ Workout Plans        │
        │ Fitness Data         │
        │ Authentication       │
        └──────────────────────┘
```

---

# 🧠 AI Workout Generation Pipeline


```
User Fitness Information
          │
          ▼
Fitness Questionnaire
          │
          ▼
Prompt Builder
          │
          ▼
Groq API
(Llama 3.1 8B Instant)
          │
          ▼
AI Fitness Coach
          │
          ▼
Structured JSON Workout Plan
          │
          ▼
Database Storage
          │
          ▼
Workout Dashboard
```
### Pipeline Explanation

1. User provides fitness details:
   - Fitness goal
   - Workout level
   - Preferences
2. Backend converts responses into an optimized AI prompt.
3. Groq LLM generates a personalized workout plan.
4. AI response is structured into JSON format.
5. The workout plan is stored in PostgreSQL.
6. Users access their personalized workout dashboard.
---

# 👁️ Computer Vision Workout Tracking Pipeline


```
User Starts Workout
        │
        ▼
Camera Access
        │
        ▼
Live Video Frames
        │
        ▼
Pose Detection Model
        │
        ▼
Body Landmark Extraction
        │
        ▼
Exercise Movement Analysis
        │
        ▼
Form Evaluation
        │
        ▼
AI Feedback Generation
        │
        ▼
Corrective Remarks
```


### Workout Tracking Flow

When the user clicks **"Start Workout"**, FitMeAI activates real-time AI workout monitoring.

The system:

- Captures live camera frames.
- Detects body joints and movement patterns.
- Evaluates exercise execution.
- Compares movements with correct workout form.
- Generates real-time corrective feedback.


Examples:

✅ Perfect Form
⚠️ Keep your back straight
⚠️ Correct your knee alignment
⚠️ Maintain proper posture


This allows users to perform exercises correctly and safely with AI-powered coaching.


---

# 🔄 Complete Data Flow
User->
Next.js Frontend->
Express Backend
 │
 ├── Authentication Service
 ├── AI Workout Generation
 ├── Workout Management
 ├── Computer Vision Tracking
 └── External API Services

PostgreSQL Database->
Personalized Workout Dashboard->
Live Workout Session->
AI Pose Feedback
---

# ☁️ Local & Cloud Components


## 🖥️ Local Components

| Component | Technology |
|-----------|------------|
| Frontend | Next.js, React, TypeScript |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Environment Management | dotenv |
| Development Tools | npm, Git |


## ☁️ Cloud Components

| Component | Technology |
|-----------|------------|
| AI Generation | Groq API |
| Authentication | Google OAuth 2.0 |
| Fitness News | GNews API |
| Maps | OpenStreetMap + Overpass API |
| Frontend Hosting | Vercel |
| Backend Hosting | Render / AWS |
| Database Hosting | Supabase / Neon |
---

# 🔐 Key Design Decisions

## 1. Generative AI Workout Planning

**Decision:**

Use LLM-based workout generation instead of static workout templates.

**Reason:**

- Personalized workout recommendations.
- Adaptive fitness plans.
- Natural AI coaching experience.


---

## 2. Real-Time Computer Vision Tracking

**Decision:**

Integrate pose detection during workout execution.

**Reason:**

- Detects incorrect exercise form.
- Provides instant posture corrections.
- Improves workout safety.


---

## 3. Modular Backend Architecture

**Decision:**

Separate authentication, AI services, workout management, and external integrations.

**Reason:**

- Easier maintenance.
- Better scalability.
- Independent service upgrades.


---

## 4. Structured AI Output

**Decision:**

Use predefined JSON structures for AI responses.

**Reason:**

- Reliable frontend rendering.
- Consistent workout format.
- Easy database storage.


---

## 5. PostgreSQL Database

**Decision:**

Use PostgreSQL for user and workout data management.

**Reason:**

- Structured relational storage.
- Secure user handling.
- Efficient workout retrieval.


---

# 🚀 Scalability Architecture


Frontend->
API Gateway->
Microservices
- Authentication Service
- AI Workout Service
- Computer Vision Service
- Analytics Service
- Notification Service

