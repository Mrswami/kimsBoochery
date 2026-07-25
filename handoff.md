# Project Handoff: AI Flavor Recommender & Firebase Cloud Functions

This document summarizes the changes made to the **Kim's Boochery** project to integrate a secure AI-powered flavor recommender system.

## Overview
We integrated the **Google AI Studio (Gemini)** API into the application. To ensure API key security, we migrated the model interaction logic from the frontend React application into a backend **Firebase Cloud Function**. The frontend now safely requests flavor recommendations via a callable Cloud Function.

---

## 🛠️ System Architecture & Changes

### 1. Frontend Modifications (`src/App.jsx`)
- Added a **"Tell Butch What You're Craving"** input box above the flavor cards.
- Integrated the Firebase SDK to connect to Cloud Functions using `httpsCallable`.
- Replaced the direct Google AI Studio SDK call with a call to the remote Cloud Function `getFlavorRecommendation`.
- The UI dynamically re-sorts the kombucha flavors array according to the recommendation rank returned by the backend.

### 2. Backend Cloud Functions (`functions/`)
- Created a new Firebase Functions directory (`functions/`) configured for **Node.js 22**.
- Implemented `getFlavorRecommendation` in `functions/index.js` utilizing the `@google/generative-ai` SDK.
- The Cloud Function pulls your Google AI Studio API key securely from local environment variables or Firebase Secrets.
- Accepts the user's text craving and the list of flavor metadata, and asks Gemini to sort them in order of best relevance.

### 3. Environment Config (`.env` and `.env.example`)
- Added `VITE_GEMINI_API_KEY` to the project's root `.env.example`.
- Created `functions/.env` containing the `GEMINI_API_KEY` placeholder. 

---

## 🚀 Deployment Instructions

The project has been successfully deployed and is live:
* **Hosting URL:** https://kimboocherly.web.app
* **Firebase Console:** https://console.firebase.google.com/project/kimboocherly/overview

### Deployment Commands Used
If you need to deploy updates in the future, navigate to the root directory and run:
```powershell
# 1. Build the frontend
npm run build

# 2. Deploy updates to Hosting & Functions
& "C:\Users\freem\AppData\Roaming\npm\firebase.cmd" deploy --only hosting,functions --force
```

---

## 🔑 Security & Keys Note
- **Local Development**: Ensure `functions/.env` is set up with a valid `GEMINI_API_KEY`.
- **Production**: The function reads `GEMINI_API_KEY` from the functions environment config. For production hardening, this key can optionally be integrated with **Google Cloud Secret Manager** in the Firebase console.
