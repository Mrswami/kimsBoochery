# Project Handoff: AI Flavor Recommender, Cloud Functions, & Firestore Invoices

This document summarizes the architecture and features implemented for the **Kim's Boochery** Farmers Market Kiosk.

## 🌟 Implemented Features

### 1. AI Flavor Recommender (Google AI Studio & Cloud Functions)
- **Frontend Input**: Added a "Tell Butch What You're Craving" search box where users can type anything.
- **Backend Function (`getFlavorRecommendation`)**: Exposes a secure callable Cloud Function. It keeps your Google AI Studio Gemini API key private.
- **Dynamic Sorting**: The function returns ordered product IDs based on relevance, sorting the shop menu layout on the fly.

### 2. Live Sales Logging (Firestore)
- **Database Logging**: After successful checkout processing, the transaction details are instantly logged into a root `/invoices` Firestore collection.
- **Invoice Structure**: Tracks unique invoice ID, timestamp, breakdown of items, price/quantities, payment method, and customer context.
- **Firestore Rules**: Updated in `firestore.rules` to allow public document creations during checkout, and public reads for receipt rendering.

### 3. Offline Resilience (Farmers Market Mode)
- **Persistent Local Cache**: Initialized Firestore with `persistentLocalCache` to handle spotty Farmers Market Wi-Fi.
- **Queued Operations**: Sales transactions are safely saved locally on the device if internet drops and auto-synced to the cloud database the moment connectivity returns.

### 4. Printable Receipts
- **Print Action**: Added a "Print Invoice / Receipt" button to the post-checkout screen.
- **Media Print CSS**: Embedded `@media print` rules in `index.css` that hide the general website UI and display a clean, ink-saving, black-and-white print receipt layout.

### 5. Merchant POS Panel (RBAC) & Stripe Checkout
- **Role Detection**: Toggles into a merchant POS screen when in "Vendor" view.
- **POS Actions**: Enables Cash Register, EBT/SNAP, Venmo QR display, Cart dynamic QR code sharing (customer scans, load cart, pays on their phone), and direct Stripe Checkout redirects for Tap-to-Pay.
- **Success Redirect Handler**: Parses Stripe query returns to automatically record invoices, clear carts, and pop up print-friendly customer receipts.

---

## 🚀 Deployment Instructions

The project is live and fully updated:
* **Hosting URL:** https://kimboocherly.web.app
* **Firebase Console:** https://console.firebase.google.com/project/kimboocherly/overview

To redeploy updates:
```powershell
# Build frontend static assets
npm run build

# Deploy updates to Hosting, Firestore, and Functions
& "C:\Users\freem\AppData\Roaming\npm\firebase.cmd" deploy --only hosting,firestore,functions --force
```

---

## 🔑 Environment Secrets Reference
- **Frontend `.env`**: Needs `VITE_FIREBASE_*` credentials.
- **Backend `functions/.env`**:
  - `GEMINI_API_KEY`: API Key for AI recommendations.
  - `VITE_STRIPE_SECRET_KEY`: Secret Key for Stripe Checkout sessions.
