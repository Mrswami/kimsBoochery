# KimBoocherly

> Premium Dashboard & API Integration Platform  
> Modeled after the Sovereign Nexus / jacobdev webapp architecture

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## 🔑 API Configuration

1. Copy `.env.example` to `.env`
2. Fill in your actual API keys
3. Never commit `.env` to version control

## 🔥 Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication, Firestore, Storage, and Hosting
3. Copy your Firebase config into `.env`
4. Deploy: `firebase deploy`

## 📁 Project Structure

```
KimBoocherly/
├── src/
│   ├── config/
│   │   ├── firebase.js    # Firebase initialization
│   │   └── api.js         # API client & endpoints
│   ├── App.jsx            # Main dashboard component
│   ├── main.jsx           # Entry point
│   └── index.css          # Design system
├── firebase.json          # Firebase config
├── firestore.rules        # Firestore security rules
├── storage.rules          # Storage security rules
├── .env.example           # Environment template
└── package.json           # Dependencies
```

## 🏗️ Architecture

- **Vite + React** — Fast build tooling with HMR
- **Firebase** — Auth, Firestore, Storage, Hosting, Functions
- **Axios** — HTTP client with interceptors
- **Premium Dark UI** — Glassmorphism, gradients, micro-animations

## 📜 License

Private — All rights reserved.
