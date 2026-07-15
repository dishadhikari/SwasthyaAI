# SwasthyaAI — Revolutionizing Fitness with Generative AI & Smart Automation 🚀

**SwasthyaAI** is an AI-powered personal fitness assistant that generates customized workout plans, helps users track their fitness journey, discovers nearby gyms, and provides real-time fitness updates.

Powered by **Generative AI**, **Large Language Models**, **Web APIs**, and **Automation**, SwasthyaAI transforms traditional workout planning into an intelligent, personalized, and accessible fitness experience.

Built by team **Teamers** for OSDHack 2026

💻 **GitHub Repository:** [[Add Repository Link](https://github.com/dishadhikari/SwasthyaA)]

---

# 🧭 Table of Contents

1. Overview  
2. Key Features  
3. Architecture  
4. Tech Stack  
5. System Modules  
6. Installation & Setup  
7. Environment Configuration  
8. Usage Guide  
9. Deployment  
10. Contributing  
11. Team & Credits  
12. Future Vision  
13. License  

---

# 🏋️ Overview

**SwasthyaAI** combines Artificial Intelligence and modern web technologies to provide users with personalized fitness guidance.

The platform understands user goals, fitness level, and preferences through an interactive AI coaching experience and generates structured weekly workout plans using Generative AI.

The system provides:

- 🤖 AI-generated personalized workout routines
- 💬 Conversational fitness coaching
- 🔐 Secure user authentication
- 📊 Workout plan management
- 🗺️ Nearby gym discovery
- 📰 Fitness news updates
- 💪 Structured exercise guidance

> ⚡ *Our mission is to make professional-level fitness coaching accessible to everyone through AI-powered personalization and automation.*

---

# 💡 Key Features

### 👁️ AI Computer Vision Workout Tracking
- Integrated real-time **pose detection and exercise form analysis** during workout sessions.
- When users click **"Start Workout"**, the AI activates the camera-based tracking system to monitor body movements.
- Analyzes key body landmarks and movement patterns to evaluate exercise execution.
- Provides real-time feedback and corrective remarks such as:
  - ✅ "Good posture"
  - ⚠️ "Keep your back straight"
  - ⚠️ "Lower your squat depth"
  - ⚠️ "Maintain proper arm alignment"
- Helps users perform exercises safely with improved form and reduced injury risk.
- Tracks workout performance and provides intelligent feedback throughout the session.
## 🤖 AI Fitness Coach

SwasthyaAI provides an interactive AI coaching experience that collects user fitness information and generates personalized workout routines.

Features:

- Conversational onboarding
- Goal-based workout generation
- Fitness-level assessment
- Personalized exercise recommendations
- Structured weekly workout plans

Powered by:

- **Groq API**
- **Llama 3.1 8B Instant Model**
- Custom prompt engineering

---


## 🏋️ Personalized Workout Generation

The AI engine creates safe and structured workout plans based on:

- Fitness goal
  - Fat loss
  - Muscle gain
  - Strength
  - General fitness

- Experience level
  - Beginner
  - Intermediate
  - Advanced

- User preferences

Generated plans include:

- Weekly schedule
- Daily workout focus
- Exercises
- Sets
- Repetitions
- Coaching notes


---

## 📅 Smart Workout Dashboard

Users can save and manage their AI-generated plans.

Features:

- View saved workout plans
- Access weekly schedules
- Start individual workout sessions
- Track workout structure

---

## 🔐 Secure Authentication

SwasthyaAI uses Google OAuth authentication with JWT-based session management.

Features:

- Google Sign-In
- User account creation
- JWT authentication
- Protected workout routes

---

## 🗺️ Nearby Gym Finder

Find fitness centers around your current location.

Implemented using:

- Browser Geolocation API
- Leaflet.js Maps
- OpenStreetMap
- Overpass API

Features:

- Detect user location
- Search nearby gyms
- Display gyms on interactive maps
- Calculate distance from user
- Show nearest fitness centers

---

## 📰 Fitness News Feed

Stay updated with fitness and health-related information.

Powered by:

- GNews API

Features:

- Latest fitness articles
- Article summaries
- External article access

---

---

# ⚙️ Tech Stack


| Layer | Technologies |
|-------|--------------|
| **Frontend** | Next.js, React, TypeScript, TailwindCSS |
| **Backend** | Node.js, Express.js |
| **AI Layer** | Groq API, Llama 3.1 8B Instant |
| **Database** | PostgreSQL |
| **Authentication** | Google OAuth 2.0, JWT |
| **Maps & Location** | Leaflet.js, OpenStreetMap, Overpass API |
| **News Integration** | GNews API |
| **Development Tools** | npm, Git |


---

# 🧩 System Modules


| Module | Description |
|---------|-------------|
| **Authentication Service** | Google OAuth login, JWT token generation and user management |
| **AI Workout Generator** | Generates personalized fitness plans using LLM-powered prompts |
| **Workout Management Service** | Stores and retrieves user workout plans |
| **Fitness Dashboard** | Displays saved workout routines and schedules |
| **Gym Locator Service** | Finds nearby gyms using geolocation and OpenStreetMap APIs |
| **Fitness News Service** | Provides latest fitness and health updates |


---

# 📊 SwasthyaAI Technical Report


## 🤖 Model and Runtime Details


### Generative AI Workout Planning

| Component | Details |
|-----------|---------|
| **Model Used** | Llama 3.1 8B Instant |
| **Runtime** | Groq Cloud Inference API |
| **Purpose** | Personalized workout plan generation |
| **Input** | User fitness profile, goals, experience level |
| **Output** | Structured JSON workout plan |
| **Optimization** | Prompt engineering + structured JSON output constraints |
| **Model Hosting** | Cloud-based inference |


The AI workout generation system uses a Large Language Model to generate adaptive workout plans based on user requirements.

The model is optimized through:

- Strict prompt templates.
- JSON schema-based output formatting.
- Reduced unnecessary generation using focused instructions.
- Temperature control for consistent results.


---

# 👁️ Computer Vision Model Details


### Exercise Tracking & Pose Analysis

| Component | Details |
|-----------|---------|
| **Model Type** | Pose Estimation Model |
| **Runtime** | Browser-based Computer Vision Runtime |
| **Purpose** | Real-time body landmark detection and exercise analysis |
| **Input** | Live camera frames |
| **Output** | Body keypoints, posture feedback, exercise corrections |
| **Optimization** | Frame-based processing and lightweight inference |


The computer vision pipeline:

1. Captures live camera frames.
2. Detects human body landmarks.
3. Tracks joint positions.
4. Evaluates exercise posture.
5. Generates corrective feedback.


---

# ⚡ Model Optimization Techniques


SwasthyaAI applies multiple optimization strategies:

- Lightweight model inference for real-time feedback.
- Reduced input resolution for faster processing.
- Frame skipping to maintain smooth performance.
- Efficient landmark-based analysis instead of full image processing.
- Structured AI prompts to reduce unnecessary token generation.


---

# 📦 Model Size


| Component | Approximate Size |
|-----------|------------------|
| Llama 3.1 8B | ~8 Billion parameters (cloud hosted) |
| Pose Detection Model | Lightweight browser inference model |
| Frontend Bundle | Optimized Next.js production build |
| Backend Runtime | Node.js Express Server |


---

# ⏱️ Inference Latency


## AI Workout Generation

| Operation | Latency |
|-----------|---------|
| Prompt Processing | Depends on network latency |
| LLM Generation | Few seconds average |
| JSON Processing | <100 ms |


## Computer Vision Tracking

| Operation | Latency |
|-----------|---------|
| Camera Frame Processing | Real-time |
| Pose Detection | Depends on device hardware |
| Feedback Generation | Near real-time |


Latency varies depending on:

- Device specifications.
- Internet connection.
- Browser performance.


---

# 💻 CPU / GPU / NPU Usage


## Local Computer Vision Processing

| Resource | Usage |
|----------|-------|
| CPU | Handles camera input and UI processing |
| GPU | Used where browser acceleration is available |
| NPU | Not required |


## Cloud AI Processing

| Resource | Usage |
|----------|-------|
| GPU Acceleration | Managed by Groq infrastructure |
| Local Device | Only sends requests and receives responses |


---

# 🧠 Peak Memory Usage


Approximate memory requirements:

| Component | Memory Usage |
|-----------|--------------|
| Next.js Application | Depends on browser environment |
| Backend Server | Low memory Node.js runtime |
| Pose Detection | Depends on browser model runtime |
| Database | Depends on stored user data |


Memory consumption is minimized by:

- Client-side streaming processing.
- Lightweight inference.
- No unnecessary image storage.


---

# 📱 Tested Device Specifications


## Development Testing Environment

| Component | Specification |
|-----------|---------------|
| Processor | Modern multi-core CPU |
| RAM | 8GB+ recommended |
| Browser | Chromium-based browsers |
| Operating System | Windows/Linux/macOS |
| Camera | Standard webcam |


## Mobile Compatibility

Designed to support:

- Modern Android devices.
- iOS devices with browser camera support.
- Devices with hardware acceleration.


---

# 📱 Local AI Verification


## Fully On-Device Components

The following operations run locally:

✅ Camera access  
✅ Video frame capture  
✅ User interface rendering  
✅ Basic pose tracking processing (depending on deployment configuration)


## Internet Required Components

The following require network access:

🌐 AI workout generation:
- Groq API
- Llama 3.1 8B inference

🌐 Authentication:
- Google OAuth

🌐 External data:
- GNews API
- OpenStreetMap / Overpass API


---

# 🔒 User Data Movement


## Data Remaining On Device

- Live camera frames are processed temporarily.
- Camera feed is not permanently stored.
- No continuous video upload is performed.


## Data Sent Externally

Only required information is transmitted:

- Fitness questionnaire responses → AI generation API.
- Authentication token → Backend authentication service.
- Location coordinates → Gym discovery APIs.


Users maintain control over:

- Camera permissions.
- Location permissions.
- Authentication access.


---

# 📈 Evaluation Report


## Evaluation Method


SwasthyaAI was evaluated using:

- Functional testing.
- Workout generation quality checks.
- Exercise feedback validation.
- API response testing.
- User interaction testing.


---

# 🏋️ AI Workout Generation Evaluation


### Quality Metrics

| Metric | Result |
|--------|--------|
| Personalization | High |
| Structured Output Accuracy | High |
| Workout Safety | Validated through prompt constraints |
| Response Consistency | Stable |


### Benchmark Comparison


| Approach | Result |
|----------|--------|
| Static Workout Templates | Limited personalization |
| Rule-Based Generator | Less adaptive |
| SwasthyaAI LLM Approach | Dynamic personalized plans |


---

# 👁️ Computer Vision Evaluation


Evaluation criteria:

- Pose detection accuracy.
- Correct exercise movement recognition.
- Feedback quality.
- Real-time responsiveness.


Known limitations:

- Poor lighting conditions may reduce accuracy.
- Incorrect camera angles affect pose detection.
- Complex movements may require improved models.
- Occlusion of body parts can reduce tracking reliability.


---

# 🛡️ Privacy and Safety


## Data Handling

SwasthyaAI follows privacy-focused practices:

- User data is stored securely.
- Authentication uses JWT tokens.
- Passwords are not stored directly.
- Camera access requires explicit permission.


---

## Permissions Required


| Permission | Purpose |
|------------|---------|
| Camera | Exercise tracking and pose analysis |
| Location | Nearby gym discovery |
| Google Account | Authentication |


---

## Storage Policy

Stored data:

- User profile information.
- Saved workout plans.
- Fitness preferences.


Not stored:

- Continuous camera recordings.
- Raw workout videos.


---

## Safety Limitations

SwasthyaAI provides fitness guidance but does not replace professional medical advice.

Potential risks:

- Incorrect exercise execution.
- AI-generated plans may require expert review.
- Computer vision feedback may fail in uncommon scenarios.


Users should consult professionals for injuries or medical conditions.


---

# 📚 Attribution


## Pretrained Models

| Resource | Usage |
|----------|-------|
| Llama 3.1 8B Instant | AI workout generation |
| Pose Estimation Models | Human movement tracking |


---

## APIs Used

| API | Purpose |
|-----|---------|
| Groq API | LLM inference |
| Google OAuth API | Authentication |
| GNews API | Fitness news |
| OpenStreetMap API | Gym location data |
| Overpass API | Nearby gym search |


---

## Libraries & Frameworks


| Technology | Usage |
|------------|-------|
| Next.js | Frontend framework |
| React | UI development |
| TypeScript | Type safety |
| Node.js | Backend runtime |
| Express.js | API server |
| PostgreSQL | Database |
| Leaflet.js | Maps integration |


---

## Open Source Contributions

SwasthyaAI is built using publicly available frameworks, APIs, and pretrained models while respecting their respective licenses and usage policies.
# 🛠️ Installation & Setup


## 1️⃣ Clone Repository

```bash
git clone <repository-url>
cd fitme-ai
```

---

## 2️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:3000
```

---

## 3️⃣ Backend Setup

```bash
cd backend
npm install
node server.js
```

Backend runs at:

```
http://localhost:5000
```

---

# 🔧 Environment Configuration


Create environment files in frontend and backend directories.


## Frontend

`.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<YOUR_GOOGLE_CLIENT_ID>
```


## Backend

`.env`

```env
GOOGLE_CLIENT_ID=<YOUR_GOOGLE_CLIENT_ID>
JWT_SECRET=<YOUR_JWT_SECRET>
DB_USER=<POSTGRES_USERNAME>
DB_HOST=localhost
DB_PASSWORD=<POSTGRES_PASSWORD>
DB_NAME=<DATABASE_NAME>
GROQ_API_KEY=<YOUR_GROQ_API_KEY>
GNEWS_API_KEY=<YOUR_GNEWS_API_KEY>
```

---

# 🧭 Usage Guide


1. Login using Google Authentication.
2. Enter your fitness details through the AI Fitness Coach.
3. Answer questions related to:
   - Fitness goals
   - Workout level
   - Preferences
4. AI generates a personalized workout plan using Groq LLM.
5. Save your generated workout plan.
6. Access your dashboard to view:
   - Saved plans
   - Weekly workout schedule
   - Exercises
   - Sets and repetitions
7. Start your workout sessions- Camera opens up, SwasthyaAI tracks your body movements as per the pose chosen and corrects it with appropriate remarks.
8. Find nearby gyms using:
   - Location services
   - Leaflet maps
   - OpenStreetMap
9. Explore fitness news and updates.

---

# 🚀 Deployment


## Frontend

Build:

```bash
npm run build
```

Run:

```bash
npm start
```


---

## Backend
Start server:

```bash
node server.js
```

---

# 🤝 Contributing


We welcome contributions from developers and fitness enthusiasts!


### Steps:

1. Fork the repository.

2. Create a new branch:

```bash
git checkout -b feature-name
```

3. Make your changes.

4. Commit changes:

```bash
git commit -m "Added new feature"
```

5. Push changes:

```bash
git push origin feature-name
```

6. Open a Pull Request.


---

# 👥 Team & Credits

Built by-
- **Disha Adhikari**
- **Akshat Porwal**
