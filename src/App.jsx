import { useState, useEffect, useRef } from 'react'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { RecaptchaVerifier, signInWithPhoneNumber, onAuthStateChanged } from 'firebase/auth'
import app, { auth, db } from './config/firebase'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import ApiService, { API_KEYS } from './config/api'
import menuData from './data/menu_and_inventory.json'
import './index.css'

// ══════════════════════════════════════════════════════════════
// KIM'S BOOCHERY — Sunday Market Quick-Pickup & Order App
// Upgraded Mobile-First Experience - Featuring Kimmy Mascot
// ══════════════════════════════════════════════════════════════

// Fallback flavors list mapping additional fields (stars, code, abv, inventory)
const baseFlavors = [
  {
    id: "citrus-surge",
    name: "Citrus Surge",
    desc: "Blood orange, fresh ginger, & raw turmeric. Zesty & spicy.",
    price: "$5.50",
    rawPrice: 5.50,
    color: "amber",
    ingredients: "Organic Kombucha Culture, Pressed Blood Orange, Organic Peruvian Ginger Root, Fresh Turmeric, Raw Texas Honey.",
    tastingNotes: "Tangy citrus bite with a warm ginger burn on the throat. Bright golden amber hue.",
    stars: 4.8,
    reviews: 29,
    abv: "0.8% ABV",
    inventory: 7,
    code: "HONEY04"
  },
  {
    id: "grapefruit",
    name: "Grapefruit Rustler",
    desc: "Grapefruit, rosemary, & hops. Sturdy & sharp.",
    price: "$5.00",
    rawPrice: 5.00,
    color: "cyan",
    ingredients: "Organic Kombucha Culture, Cold-Pressed Pink Grapefruit Juice, Fresh Garden Rosemary, Cascade Hops, Filtered Spring Water.",
    tastingNotes: "Crisp citrus bitterness balanced by herbaceous piney-rosemary notes. Highly carbonated.",
    stars: 4.7,
    reviews: 41,
    abv: "0.5% ABV",
    inventory: 18,
    code: "RUST03"
  },
  {
    id: "sad-cactus",
    name: "Sad Cactus",
    desc: "Prickly pear & aloe. Brewed with tears & attitude.",
    price: "$5.00",
    rawPrice: 5.00,
    color: "rose",
    ingredients: "Organic Kombucha Culture, Wild Texas Prickly Pear Juice, Organic Aloe Vera Extract, Hibiscus Petals, Filtered Spring Water.",
    tastingNotes: "Sharp, dry finish with a sweet cactus-fruit body. Light floral undertones.",
    stars: 4.8,
    reviews: 32,
    abv: "0.5% ABV",
    inventory: 14,
    code: "SAD01"
  },
  {
    id: "hill-country",
    name: "Hill Country Lavender",
    desc: "Texas lavender, wild blueberry, & lemon balm. Soothing & floral.",
    price: "$5.25",
    rawPrice: 5.25,
    color: "emerald",
    ingredients: "Organic Kombucha Culture, Culinary Lavender Buds, Hill Country Blueberries, Lemon Balm Tea, Spring Water.",
    tastingNotes: "Aromatic floral aroma with a subtle berry sweetness and soothing herbal finish.",
    stars: 4.9,
    reviews: 37,
    abv: "0.4% ABV",
    inventory: 15,
    code: "LAV05"
  },
  {
    id: "lone-star",
    name: "Lone Star Blackout",
    desc: "Blackberry, charcoal, & oak. Dark & bold.",
    price: "$5.50",
    rawPrice: 5.50,
    color: "violet",
    ingredients: "Organic Kombucha Culture, Wild Blackberries, Activated Charcoal (Coconut Source), Sweet Oak Wood Infusion, Filtered Spring Water.",
    tastingNotes: "Rich, tannic, blackberry-forward with a smoky, earthy mouthfeel. Deep obsidian color.",
    stars: 4.9,
    reviews: 58,
    abv: "1.2% ABV",
    inventory: 9,
    code: "LONE02"
  }
];

// Special Limited Releases for scanner
const limitedReleases = [
  {
    id: "dragon-breath",
    name: "Dragon Breath (Limited)",
    desc: "Dragon fruit, habanero, & lime. Spicy & explosive.",
    price: "$6.50",
    rawPrice: 6.50,
    color: "rose",
    ingredients: "Organic Kombucha Culture, Fresh Red Dragon Fruit, Red Habanero Infusion, Key Lime Juice, Filtered Water.",
    tastingNotes: "Fiery ginger-like habanero burn balanced by sweet tropical dragon fruit flavor. Intense carbonation.",
    stars: 5.0,
    reviews: 19,
    abv: "1.5% ABV",
    inventory: 8,
    code: "DRAGON11"
  },
  {
    id: "ginger-zing",
    name: "Ginger Zinger (Limited)",
    desc: "Double ginger, key lime, & mint. Super clean.",
    price: "$6.00",
    rawPrice: 6.00,
    color: "amber",
    ingredients: "Organic Kombucha Culture, Cold-Pressed Peruvian Ginger, Fresh Mint Leaves, Key Lime Zest, Filtered Spring Water.",
    tastingNotes: "Crisp ginger-forward punch with cooling spearmint undertones. Refreshing summer quencher.",
    stars: 4.9,
    reviews: 23,
    abv: "0.5% ABV",
    inventory: 12,
    code: "ZING12"
  }
];

// Initialize Firebase Functions
const functions = getFunctions(app);

// Amber Glass Bottle SVG Component
function AmberBottleSVG({ flavorColor = 'cyan', flavorName = 'Booch' }) {
  const getHexColor = (col) => {
    switch (col) {
      case 'rose': return '#f43f5e';
      case 'violet': return '#8b5cf6';
      case 'cyan': return '#06b6d4';
      case 'amber': return '#f59e0b';
      case 'emerald': return '#10b981';
      default: return '#06b6d4';
    }
  };

  return (
    <svg viewBox="0 0 100 220" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="205" rx="25" ry="6" fill="rgba(0,0,0,0.3)" />

      {/* Neck & Cap holder */}
      <path d="M 35 30 L 65 30 L 60 22 L 60 12 L 40 12 L 40 22 Z" fill="#1e120b" stroke="#3a2215" strokeWidth="1.5" />

      {/* Main Glass Body */}
      <path d="M 35 50 C 35 75, 20 80, 20 100 L 20 190 C 20 205, 80 205, 80 190 L 80 100 C 80 80, 65 75, 65 50 Z" fill="#5c3412" stroke="#2c1707" strokeWidth="2.5" />

      {/* Glass Highlight */}
      <path d="M 23 105 L 23 185 C 23 194, 27 197, 30 197 C 26 194, 26 105, 33 92 C 36 86, 45 81, 48 56 C 48 56, 37 76, 23 105" fill="rgba(255,255,255,0.15)" />

      {/* Label Shape */}
      <path d="M 22 108 L 78 108 L 78 168 L 22 168 Z" fill="#fcf9f2" stroke="#e6decb" strokeWidth="1" />
      <rect x="25" y="111" width="50" height="54" fill={getHexColor(flavorColor)} opacity="0.14" rx="2" />

      {/* Branding Text */}
      <text x="50" y="122" fontSize="5" fontWeight="900" fill="#2d1708" textAnchor="middle" letterSpacing="0.3" fontFamily="sans-serif">KIM'S BOOCHERY</text>
      <text x="50" y="128" fontSize="3.8" fontWeight="700" fill="#64748b" textAnchor="middle" letterSpacing="0.1" fontFamily="sans-serif">CRAFT KOMBUCHA</text>

      {/* Flavor Title */}
      <text x="50" y="146" fontSize="7.5" fontWeight="800" fill={getHexColor(flavorColor)} textAnchor="middle" fontFamily="sans-serif">{flavorName.toUpperCase()}</text>

      {/* Badge/Seal */}
      <circle cx="50" cy="157" r="4.5" fill="#f59e0b" />
      <polygon points="50,154 51.2,156.5 53.8,156.5 51.8,157.8 52.5,160.3 50,158.8 47.5,160.3 48.2,157.8 46.2,156.5 48.8,156.5" fill="#fff" />

      {/* Bottle Cap */}
      <rect x="38" y="6" width="24" height="6" fill="#171717" rx="1.2" />
      <line x1="41" y1="12" x2="41" y2="6" stroke="#2e2e2e" strokeWidth="0.8" />
      <line x1="44" y1="12" x2="44" y2="6" stroke="#2e2e2e" strokeWidth="0.8" />
      <line x1="47" y1="12" x2="47" y2="6" stroke="#2e2e2e" strokeWidth="0.8" />
      <line x1="50" y1="12" x2="50" y2="6" stroke="#2e2e2e" strokeWidth="0.8" />
      <line x1="53" y1="12" x2="53" y2="6" stroke="#2e2e2e" strokeWidth="0.8" />
      <line x1="56" y1="12" x2="56" y2="6" stroke="#2e2e2e" strokeWidth="0.8" />
      <line x1="59" y1="12" x2="59" y2="6" stroke="#2e2e2e" strokeWidth="0.8" />
    </svg>
  );
}

// Vector Merch T-Shirt SVG
function ShirtSVG() {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <path d="M 30 15 L 42 15 A 8 8 0 0 0 58 15 L 70 15 L 85 30 L 73 40 L 68 35 L 68 85 L 32 85 L 32 35 L 27 40 L 15 30 Z" fill="#1e293b" stroke="#475569" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="12" fill="#06b6d4" opacity="0.35" />
      <text x="50" y="53" fontSize="8" fontWeight="800" fill="#06b6d4" textAnchor="middle">KIMS</text>
    </svg>
  );
}

// Vector Trucker Hat SVG
function HatSVG() {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <path d="M 12 60 C 12 25, 68 25, 68 60 Z" fill="#1e293b" stroke="#475569" strokeWidth="2.5" />
      <path d="M 68 60 C 78 50, 95 65, 88 73 C 82 77, 65 72, 60 70" fill="#334155" stroke="#475569" strokeWidth="2" />
      <ellipse cx="40" cy="48" rx="8" ry="8" fill="#8b5cf6" opacity="0.35" />
      <path d="M 10 68 C 30 68, 60 75, 74 65 L 70 60 C 60 62, 30 60, 12 60 Z" fill="#0f172a" />
    </svg>
  );
}

// Vector Stickers SVG
function StickerSVG() {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <circle cx="35" cy="40" r="22" fill="#10b981" opacity="0.3" stroke="#10b981" strokeWidth="1.5" />
      <text x="35" y="43" fontSize="8" fontWeight="800" fill="#fff" textAnchor="middle">BOOCH</text>
      <rect x="42" y="38" width="38" height="38" rx="5" fill="#f43f5e" opacity="0.3" stroke="#f43f5e" strokeWidth="1.5" transform="rotate(15 61 57)" />
      <text x="61" y="60" fontSize="7" fontWeight="800" fill="#fff" textAnchor="middle" transform="rotate(15 61 57)">KIMMY</text>
    </svg>
  );
}

// Kimmy Armadillo Vector Poses SVG Component
function KimmySVG({ pose = 'welcome' }) {
  const defs = (
    <defs>
      {/* Premium Shading Gradients */}
      <linearGradient id="kimmyShellGrad" x1="10%" y1="0%" x2="90%" y2="100%">
        <stop offset="0%" stopColor="#e9d5ff" /> {/* Light purple */}
        <stop offset="50%" stopColor="#c084fc" /> {/* Medium purple */}
        <stop offset="100%" stopColor="#7c3aed" /> {/* Deep violet */}
      </linearGradient>
      <linearGradient id="kimmySkinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fed7aa" /> {/* Warm peach/apricot */}
        <stop offset="40%" stopColor="#f472b6" /> {/* Soft pink */}
        <stop offset="100%" stopColor="#db2777" /> {/* Deep rose */}
      </linearGradient>
      <linearGradient id="boochBottleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b" /> {/* Amber */}
        <stop offset="100%" stopColor="#78350f" /> {/* Dark brown glass */}
      </linearGradient>
      <linearGradient id="liquidGrad" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#10b981" /> {/* Green booch */}
        <stop offset="100%" stopColor="#a7f3d0" />
      </linearGradient>
      <radialGradient id="blushGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
      </radialGradient>
      {/* Drop shadow for 3D shell plate separation */}
      <filter id="plateShadow" x="-10%" y="-10%" width="125%" height="125%">
        <feDropShadow dx="-0.8" dy="0.8" stdDeviation="0.6" floodColor="#4c1d95" floodOpacity="0.4" />
      </filter>
      <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#090d16" floodOpacity="0.4" />
      </filter>
    </defs>
  );

  if (pose === 'sassy') {
    return (
      <svg viewBox="0 0 100 100" width="100" height="100" style={{ display: 'block', margin: '0 auto', filter: 'url(#softShadow)' }}>
        {defs}
        {/* Tail (Curled and grumpy up in the air) */}
        <path d="M 24 54 C 18 50, 10 38, 14 26 C 17 18, 25 22, 22 28 C 19 34, 23 44, 28 50" fill="none" stroke="url(#kimmySkinGrad)" strokeWidth="4.5" strokeLinecap="round" />
        
        {/* Layered Armadillo Shell (Plates overlaying for 3D feel) */}
        <path d="M 22 52 C 20 30, 68 28, 68 50 C 68 64, 22 64, 22 52 Z" fill="url(#kimmyShellGrad)" stroke="#6d28d9" strokeWidth="1.5" />
        {/* Shell plates/bands */}
        <path d="M 33 33 Q 48 31, 63 36" fill="none" stroke="#f3e8ff" strokeWidth="2" opacity="0.8" filter="url(#plateShadow)" />
        <path d="M 28 42 Q 46 39, 66 43" fill="none" stroke="#f3e8ff" strokeWidth="2.2" opacity="0.8" filter="url(#plateShadow)" />
        <path d="M 26 51 Q 45 48, 65 51" fill="none" stroke="#f3e8ff" strokeWidth="2.2" opacity="0.8" filter="url(#plateShadow)" />

        {/* Head (Tilt backward, nose up in the air) */}
        <path d="M 64 45 L 82 39 C 85 38, 86 42, 81 46 L 66 50 Z" fill="url(#kimmySkinGrad)" stroke="#be123c" strokeWidth="1" />
        {/* Long Grumpy Ears */}
        <path d="M 63 43 L 53 32 Q 50 28, 54 30 L 61 40 Z" fill="url(#kimmySkinGrad)" stroke="#be123c" strokeWidth="0.8" />
        <path d="M 63 43 L 57 28 Q 55 25, 59 27 L 65 39 Z" fill="url(#kimmySkinGrad)" stroke="#be123c" strokeWidth="0.8" />
        <path d="M 56 31 L 59 38" stroke="#f472b6" strokeWidth="1" />

        {/* Closed/Sassy Eye */}
        <path d="M 70 41 Q 74 38, 77 41" stroke="#1e293b" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <line x1="72" y1="40" x2="70" y2="38" stroke="#1e293b" strokeWidth="1.2" /> {/* Eyelash */}
        <line x1="76" y1="40" x2="78" y2="38" stroke="#1e293b" strokeWidth="1.2" /> {/* Eyelash */}
        <circle cx="74" cy="46" r="3.5" fill="url(#blushGrad)" />

        {/* Crossed Sassy Arms */}
        <path d="M 46 54 Q 60 58, 68 51" fill="none" stroke="url(#kimmySkinGrad)" strokeWidth="4.5" strokeLinecap="round" filter="url(#plateShadow)" />
        <path d="M 52 50 Q 40 55, 36 50" fill="none" stroke="url(#kimmySkinGrad)" strokeWidth="4.5" strokeLinecap="round" />

        {/* Claws on Crossed Arms */}
        <line x1="66" y1="52" x2="69" y2="50" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="36" y1="51" x2="33" y2="49" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />

        {/* Feet standing firmly */}
        <rect x="32" y="60" width="9" height="7" rx="2.5" fill="url(#kimmySkinGrad)" stroke="#be123c" strokeWidth="1" />
        <rect x="52" y="60" width="9" height="7" rx="2.5" fill="url(#kimmySkinGrad)" stroke="#be123c" strokeWidth="1" />
        {/* Tiny white toenails */}
        <circle cx="34" cy="65" r="1" fill="#fff" />
        <circle cx="37" cy="66" r="1" fill="#fff" />
        <circle cx="54" cy="65" r="1" fill="#fff" />
        <circle cx="57" cy="66" r="1" fill="#fff" />
      </svg>
    );
  }

  if (pose === 'sipping') {
    return (
      <svg viewBox="0 0 100 100" width="100" height="100" style={{ display: 'block', margin: '0 auto', filter: 'url(#softShadow)' }}>
        {defs}
        {/* Tail */}
        <path d="M 26 54 C 20 54, 12 50, 16 60 Q 18 64, 25 56" fill="none" stroke="url(#kimmySkinGrad)" strokeWidth="3" />

        {/* Shell */}
        <path d="M 25 52 C 25 28, 73 28, 73 50 C 73 64, 25 64, 25 52 Z" fill="url(#kimmyShellGrad)" stroke="#6d28d9" strokeWidth="1.5" />
        <path d="M 36 34 Q 49 32, 64 36" fill="none" stroke="#f3e8ff" strokeWidth="2" opacity="0.8" filter="url(#plateShadow)" />
        <path d="M 30 43 Q 48 40, 68 44" fill="none" stroke="#f3e8ff" strokeWidth="2" opacity="0.8" filter="url(#plateShadow)" />

        {/* Head tilted down towards the straw */}
        <path d="M 62 48 L 76 55 C 79 56, 78 60, 72 58 L 63 52 Z" fill="url(#kimmySkinGrad)" stroke="#be123c" strokeWidth="1" />
        <circle cx="68" cy="50" r="2.2" fill="#1e293b" />
        <circle cx="67.2" cy="49.2" r="0.7" fill="#fff" />
        
        {/* Ears laid back relaxed */}
        <path d="M 61 44 L 50 38 Q 48 36, 51 36 L 60 41 Z" fill="url(#kimmySkinGrad)" stroke="#be123c" strokeWidth="0.8" />
        
        {/* Puffed Cheek (Drinking satisfaction) */}
        <ellipse cx="65" cy="53" rx="5" ry="4.2" fill="url(#kimmySkinGrad)" stroke="#be123c" strokeWidth="0.5" />
        <circle cx="66" cy="54" r="3" fill="url(#blushGrad)" />

        {/* Amber Kombucha Bottle */}
        <rect x="78" y="65" width="12" height="20" rx="2" fill="url(#boochBottleGrad)" stroke="#451a03" strokeWidth="1" />
        <rect x="81" y="61" width="6" height="4" fill="#1e293b" />
        <rect x="79" y="70" width="10" height="11" fill="url(#liquidGrad)" opacity="0.85" rx="1" />
        <text x="84" y="77" fontSize="4.5" fill="#fff" fontWeight="900" textAnchor="middle" fontFamily="sans-serif" letterSpacing="0.05em">K</text>

        {/* Glowing Green Straw */}
        <path d="M 72 57 L 77 55 L 84 64 L 84 74" fill="none" stroke="#34d399" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

        {/* Slurp Bubbles */}
        <circle cx="88" cy="48" r="1.8" fill="#10b981" opacity="0.8" />
        <circle cx="93" cy="42" r="2.5" fill="#34d399" opacity="0.6" />
        <text x="91" y="55" fontSize="4" fill="#059669" fontWeight="900" fontFamily="monospace">slurp</text>

        {/* Arm holding the straw/bottle */}
        <path d="M 46 54 Q 65 60, 78 59" fill="none" stroke="url(#kimmySkinGrad)" strokeWidth="3.8" strokeLinecap="round" filter="url(#plateShadow)" />

        {/* Feet */}
        <rect x="34" y="60" width="8" height="6" rx="2" fill="url(#kimmySkinGrad)" stroke="#be123c" strokeWidth="0.8" />
        <rect x="55" y="60" width="8" height="6" rx="2" fill="url(#kimmySkinGrad)" stroke="#be123c" strokeWidth="0.8" />
      </svg>
    );
  }

  if (pose === 'rolled') {
    return (
      <svg viewBox="0 0 100 100" width="100" height="100" style={{ display: 'block', margin: '0 auto', filter: 'url(#softShadow)' }}>
        {defs}
        {/* Outer armored circular shell */}
        <circle cx="50" cy="50" r="32" fill="url(#kimmyShellGrad)" stroke="#6d28d9" strokeWidth="2" />
        
        {/* Concentric shell plates lines to give rolled-up armor plates look */}
        <circle cx="50" cy="50" r="26" fill="none" stroke="#f3e8ff" strokeWidth="2" strokeDasharray="16,8" opacity="0.85" filter="url(#plateShadow)" />
        <circle cx="50" cy="50" r="20" fill="none" stroke="#f3e8ff" strokeWidth="1.8" strokeDasharray="10,6" opacity="0.8" filter="url(#plateShadow)" />
        <circle cx="50" cy="50" r="13" fill="none" stroke="#f3e8ff" strokeWidth="1.5" strokeDasharray="6,4" opacity="0.75" />

        {/* Curled shell segment seams */}
        <path d="M 50 18 C 28 32, 28 68, 50 82" fill="none" stroke="#5b21b6" strokeWidth="1.5" />
        <path d="M 50 18 C 72 32, 72 68, 50 82" fill="none" stroke="#5b21b6" strokeWidth="1.5" />

        {/* Snoozing Zzz animation labels */}
        <text x="78" y="34" fontSize="10" fill="#a78bfa" fontWeight="900" fontFamily="sans-serif" opacity="0.9">Z</text>
        <text x="85" y="25" fontSize="7" fill="#c084fc" fontWeight="bold" fontFamily="sans-serif" opacity="0.7">z</text>
        <text x="91" y="18" fontSize="5" fill="#d8b4fe" fontFamily="sans-serif" opacity="0.5">z</text>

        {/* Little snout & tail tips poking out slightly in rolled defense */}
        <path d="M 48 82 Q 50 87, 52 82 Z" fill="url(#kimmySkinGrad)" />
      </svg>
    );
  }

  // Default: 'welcome'
  return (
    <svg viewBox="0 0 100 100" width="100" height="100" style={{ display: 'block', margin: '0 auto', filter: 'url(#softShadow)' }}>
      {defs}
      {/* Tail (Friendly wagging curve) */}
      <path d="M 26 53 Q 12 48, 16 58 Q 18 63, 25 55" fill="none" stroke="url(#kimmySkinGrad)" strokeWidth="3" strokeLinecap="round" />

      {/* Main Shell (Rich lavender/purple gradient) */}
      <path d="M 24 50 C 24 26, 74 26, 74 48 C 74 62, 24 62, 24 50 Z" fill="url(#kimmyShellGrad)" stroke="#6d28d9" strokeWidth="1.5" />
      
      {/* Shell Scales/Bands overlays */}
      <path d="M 35 32 Q 49 29, 64 33" fill="none" stroke="#f3e8ff" strokeWidth="2.2" opacity="0.85" filter="url(#plateShadow)" />
      <path d="M 29 41 Q 48 38, 68 41" fill="none" stroke="#f3e8ff" strokeWidth="2.2" opacity="0.85" filter="url(#plateShadow)" />
      <path d="M 26 50 Q 47 47, 67 49" fill="none" stroke="#f3e8ff" strokeWidth="2" opacity="0.8" filter="url(#plateShadow)" />

      {/* Head (Friendly pointing forward) */}
      <path d="M 66 44 L 83 46 C 87 47, 87 52, 82 54 L 68 52 Z" fill="url(#kimmySkinGrad)" stroke="#be123c" strokeWidth="1" />
      {/* Ears up & alert */}
      <path d="M 66 43 L 70 31 Q 72 28, 73 31 L 71 43 Z" fill="url(#kimmySkinGrad)" stroke="#be123c" strokeWidth="0.8" />
      <path d="M 63 44 L 64 32 Q 66 29, 67 32 L 67 44 Z" fill="url(#kimmySkinGrad)" stroke="#be123c" strokeWidth="0.8" />

      {/* Cute Big Sparkling Eye */}
      <circle cx="75" cy="47" r="2.8" fill="#1e293b" />
      <circle cx="76.2" cy="45.8" r="0.8" fill="#fff" />
      <circle cx="74.2" cy="48.2" r="0.4" fill="#fff" />
      
      {/* Rosy Blush Cheek */}
      <circle cx="73" cy="51" r="3.2" fill="url(#blushGrad)" />

      {/* Cute Smile */}
      <path d="M 78 51 Q 79 53, 77 54" fill="none" stroke="#be123c" strokeWidth="1.2" strokeLinecap="round" />

      {/* Waving Welcoming Arms */}
      <path d="M 45 53 Q 62 62, 72 58" fill="none" stroke="url(#kimmySkinGrad)" strokeWidth="4" strokeLinecap="round" filter="url(#plateShadow)" />
      <path d="M 35 53 Q 20 62, 10 56" fill="none" stroke="url(#kimmySkinGrad)" strokeWidth="4" strokeLinecap="round" />

      {/* White Claws on hands */}
      <line x1="71" y1="59" x2="74" y2="57" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="11" y1="57" x2="8" y2="55" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />

      {/* Feet */}
      <rect x="34" y="58" width="9" height="7" rx="2.5" fill="url(#kimmySkinGrad)" stroke="#be123c" strokeWidth="1" />
      <rect x="56" y="58" width="9" height="7" rx="2.5" fill="url(#kimmySkinGrad)" stroke="#be123c" strokeWidth="1" />
      <circle cx="36" cy="63" r="0.8" fill="#fff" />
      <circle cx="39" cy="64" r="0.8" fill="#fff" />
      <circle cx="58" cy="63" r="0.8" fill="#fff" />
      <circle cx="61" cy="64" r="0.8" fill="#fff" />
    </svg>
  );
}

function App() {
  // Navigation tabs state: 'menu' | 'checkout' | 'flavorscan' | 'armadillo'
  const [activeTab, setActiveTab] = useState('menu');

  // Role Access: 'customer' | 'vendor'
  const [role, setRole] = useState('customer');
  const [vendorView, setVendorView] = useState('dashboard'); // 'dashboard' | 'api-audit' | 'rentals'
  const [showRoleModal, setShowRoleModal] = useState(false);

  // Firebase Authentication States
  const [currentUser, setCurrentUser] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [authStatus, setAuthStatus] = useState('idle'); // 'idle' | 'sending' | 'code-sent' | 'verifying' | 'success'
  const [authError, setAuthError] = useState('');

  // Cart & Orders State
  const [cart, setCart] = useState({});
  const [paymentMode, setPaymentMode] = useState('apple-pay');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStatusText, setPaymentStatusText] = useState('');
  const [orderStatus, setOrderStatus] = useState(null); // null | 'processing' | 'ordered' | 'preparing' | 'ready'
  const [orderPassDetails, setOrderPassDetails] = useState(null);

  // Active product category filter: 'all' | 'cups' | 'bottles' | 'can4' | 'merch'
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Sticky Hands mode
  const [stickyHandsMode, setStickyHandsMode] = useState(false);
  const [liveTime, setLiveTime] = useState(new Date());

  // Mascot Panel & Chat (Kimmy)
  const [cravingInput, setCravingInput] = useState('');
  const [isRecommending, setIsRecommending] = useState(false);
  const [recommendedProduct, setRecommendedProduct] = useState(null);
  const [kimmyPose, setKimmyPose] = useState('welcome');
  const [kimmyChatInput, setKimmyChatInput] = useState('');
  const [kimmyChatLog, setKimmyChatLog] = useState([
    { sender: 'kimmy', text: "Hey! I'm Kimmy. Skip the lines and buy some cold booch. What's on your mind?" }
  ]);
  const [isKimmyThinking, setIsKimmyThinking] = useState(false);

  // Optical Code Scanner State
  const [scanCodeText, setScanCodeText] = useState('');
  const [scannerActive, setScannerActive] = useState(false);
  const [scannedProduct, setScannedProduct] = useState(null);
  const [isCameraGranted, setIsCameraGranted] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Expandable Tasting notes state
  const [expandedNotes, setExpandedNotes] = useState({});

  // Storage Rentals state (from original)
  const [storageQty, setStorageQty] = useState({ 'tank-a': 1, 'cold-room': 1, 'booth-locker': 1, 'trailer-slot': 1 });
  const [storageBookings, setStorageBookings] = useState([]);

  // Merchant POS states
  const [merchantQrData, setMerchantQrData] = useState(null);
  const [isStripeProcessing, setIsStripeProcessing] = useState(false);

  // Load URL Role & Cart & Stripe Redirect on Mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlRole = params.get('role');
    if (urlRole === 'vendor') {
      setRole('vendor');
    } else {
      setRole('customer');
    }

    const checkoutStatus = params.get('checkout_status');
    const redirectOrderId = params.get('order_id');
    const redirectPayMode = params.get('payment_mode');
    const cartParam = params.get('cart');

    if (checkoutStatus === 'success' && redirectOrderId && cartParam) {
      const parsedCart = {};
      cartParam.split(',').forEach(item => {
        const [id, qtyStr] = item.split(':');
        const qty = parseInt(qtyStr, 10);
        if (id && !isNaN(qty)) {
          parsedCart[id] = qty;
        }
      });

      // Calculate total using local lookup
      const totalAmount = Object.entries(parsedCart).reduce((sum, [id, qty]) => {
        const product = catalog.find(p => p.id === id);
        const price = product ? product.rawPrice : 0;
        return sum + (price * qty);
      }, 0).toFixed(2);

      // Log invoice as Stripe payment
      logInvoiceToFirestore(redirectOrderId, parsedCart, totalAmount, redirectPayMode || 'stripe');

      setOrderPassDetails({
        id: redirectOrderId,
        total: totalAmount,
        items: parsedCart,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        phone: 'Stripe Customer'
      });
      setOrderStatus('ready');
      setActiveTab('checkout');

      // Clear URL parameters
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
      return;
    }

    if (cartParam) {
      const parsedCart = {};
      cartParam.split(',').forEach(item => {
        const [id, qtyStr] = item.split(':');
        const qty = parseInt(qtyStr, 10);
        if (id && !isNaN(qty)) {
          parsedCart[id] = qty;
        }
      });
      setCart(parsedCart);
      
      // Auto-open checkout drawer/view
      setOrderStatus(null);
      
      // Clear URL parameters to prevent re-parsing on refresh
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
    }
  }, []);

  // Monitor Firebase Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        setAuthStatus('success');
      } else {
        setAuthStatus('idle');
      }
    });
    return () => unsubscribe();
  }, []);

  // Update Live Clock
  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Camera permissions and video stream for Scanner Tab
  useEffect(() => {
    if (activeTab === 'flavorscan' && scannerActive) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          setIsCameraGranted(true);
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.warn("Camera stream blocked or unavailable:", err);
          setIsCameraGranted(false);
        });
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [activeTab, scannerActive]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Firebase Phone Auth Handlers
  const setupRecaptcha = () => {
    if (window.recaptchaVerifier) return;
    try {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {
          // reCAPTCHA solved, trigger sign in
        }
      });
    } catch (err) {
      console.error("reCAPTCHA Setup Error:", err);
      setAuthError("Failed to initialize reCAPTCHA verifier.");
    }
  };

  const sendVerificationSms = async (e) => {
    if (e) e.preventDefault();
    if (!phoneNumber.trim()) {
      setAuthError("Please enter a valid phone number.");
      return;
    }
    setAuthStatus('sending');
    setAuthError('');
    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setAuthStatus('code-sent');
    } catch (err) {
      console.error("SMS Send Error:", err);
      setAuthError(err.message || "Failed to send verification SMS. Verify Firebase Config.");
      setAuthStatus('idle');
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    }
  };

  const confirmOtpCode = async (e) => {
    if (e) e.preventDefault();
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      setAuthError("Please enter a valid 6-digit verification code.");
      return;
    }
    setAuthStatus('verifying');
    setAuthError('');
    try {
      await confirmationResult.confirm(verificationCode);
      setAuthStatus('success');
      setConfirmationResult(null);
      setVerificationCode('');
    } catch (err) {
      console.error("OTP Verification Error:", err);
      setAuthError(err.message || "Invalid validation code. Try again.");
      setAuthStatus('code-sent');
    }
  };

  const signOutUser = async () => {
    try {
      await auth.signOut();
      setAuthStatus('idle');
      setPhoneNumber('');
    } catch (err) {
      console.error("Sign Out Error:", err);
    }
  };

  // Generate Catalog Array mapping categories dynamically
  const generateCatalog = () => {
    const catalog = [];

    // Add fresh tap cups
    baseFlavors.forEach(f => {
      catalog.push({
        id: `${f.id}-cup`,
        baseId: f.id,
        name: `${f.name} (Fresh Cup)`,
        desc: `Freshly poured tap cup of our signature recipe. Poured cold.`,
        price: f.price,
        rawPrice: f.rawPrice,
        color: f.color,
        category: 'cups',
        stars: f.stars,
        reviews: f.reviews,
        abv: f.abv,
        code: `${f.code}C`,
        ingredients: f.ingredients,
        tastingNotes: f.tastingNotes
      });
    });

    // Add bottles
    baseFlavors.forEach(f => {
      catalog.push({
        id: `${f.id}-bottle`,
        baseId: f.id,
        name: `${f.name} (Glass Bottle)`,
        desc: `Sticker-style amber glass bottle (16oz). Label styling: KIMSBOOCHERY.`,
        price: `$${(f.rawPrice + 1.50).toFixed(2)}`,
        rawPrice: f.rawPrice + 1.50,
        color: f.color,
        category: 'bottles',
        stars: f.stars,
        reviews: f.reviews,
        abv: f.abv,
        code: `${f.code}`,
        ingredients: f.ingredients,
        tastingNotes: f.tastingNotes
      });
    });

    // Add Can 4-Packs
    baseFlavors.forEach(f => {
      catalog.push({
        id: `${f.id}-can4`,
        baseId: f.id,
        name: `${f.name} (Can 4-Pack)`,
        desc: `Convenient 4-pack of sleek cold cans. Recyclable & ready for the trail.`,
        price: `$18.00`,
        rawPrice: 18.00,
        color: f.color,
        category: 'can4',
        stars: (f.stars + 0.1).toFixed(1),
        reviews: Math.round(f.reviews / 3),
        abv: f.abv,
        code: `${f.code}4P`,
        ingredients: f.ingredients,
        tastingNotes: f.tastingNotes
      });
    });

    // Add Merch items
    catalog.push(
      {
        id: 'merch-tee',
        name: "Kim's Boochery Classic Tee",
        desc: "Vintage wash heavy cotton tee. Soft screen-printed mascot seal in Austin.",
        price: "$25.00",
        rawPrice: 25.00,
        color: "violet",
        category: 'merch',
        stars: 5.0,
        reviews: 14,
        code: "TEE01",
        ingredients: "100% Organic Texas Cotton. Dyed with natural indigo extracts.",
        tastingNotes: "Extremely breathable. Heavy boxy fit styling."
      },
      {
        id: 'merch-hat',
        name: "Texas Kimmy Trucker Hat",
        desc: "Structured mesh-back hat with custom embroidered armadillo seal.",
        price: "$20.00",
        rawPrice: 20.00,
        color: "amber",
        category: 'merch',
        stars: 4.8,
        reviews: 21,
        code: "HAT02",
        ingredients: "Polyester mesh back, organic cotton front panels.",
        tastingNotes: "Adjustable snapback closure. Sassy shade generator."
      },
      {
        id: 'merch-sticker',
        name: "Market Sticker Pack",
        desc: "Sticker collage pack featuring Kimmy, Sad Cactus, and tap logos.",
        price: "$3.00",
        rawPrice: 3.00,
        color: "emerald",
        category: 'merch',
        stars: 4.9,
        reviews: 45,
        code: "STK03",
        ingredients: "UV-protected waterproof gloss vinyl stickers.",
        tastingNotes: "Stick on coolers, laptops, or car bumpers."
      }
    );

    return catalog;
  };

  const catalog = generateCatalog();

  // Cart operations
  const addToCart = (itemId, qty = 1) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + qty
    }));
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const updated = { ...prev };
      if (updated[itemId] > 1) {
        updated[itemId] -= 1;
      } else {
        delete updated[itemId];
      }
      return updated;
    });
  };

  const totalCartCount = () => {
    return Object.values(cart).reduce((sum, val) => sum + val, 0);
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const product = catalog.find(p => p.id === id);
      const price = product ? product.rawPrice : 0;
      return sum + (price * qty);
    }, 0);
  };

  const logInvoiceToFirestore = async (orderId, cartData, totalAmount, customPayMode = null, customPhone = null) => {
    try {
      const invoiceRef = doc(db, 'invoices', orderId);
      const itemsList = Object.entries(cartData).map(([id, qty]) => {
        const product = catalog.find(p => p.id === id);
        return {
          id,
          name: product ? product.name : id,
          price: product ? product.rawPrice : 0,
          quantity: qty
        };
      });

      await setDoc(invoiceRef, {
        invoiceId: orderId,
        timestamp: serverTimestamp(),
        items: itemsList,
        total: parseFloat(totalAmount),
        paymentMode: customPayMode || paymentMode,
        customerPhone: customPhone || (currentUser ? currentUser.phoneNumber : 'Guest Customer')
      });
      console.log("Invoice successfully logged to Firestore:", orderId);
    } catch (e) {
      console.error("Error writing invoice to Firestore:", e);
    }
  };

  const handleCheckout = () => {
    if (totalCartCount() === 0) return;
    setIsProcessingPayment(true);
    setOrderStatus('processing');

    const steps = [
      "Contacting secure Stripe processing gateway...",
      `Authorizing transaction via ${paymentMode.toUpperCase()} token...`,
      "Verifying inventory levels at Mueller Booth #12...",
      "Generating digital line-skipping pickup pass..."
    ];

    let currentStep = 0;
    setPaymentStatusText(steps[0]);

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setPaymentStatusText(steps[currentStep]);
      } else {
        clearInterval(timer);
        setIsProcessingPayment(false);
        const orderId = `KB-${Math.floor(100000 + Math.random() * 900000)}`;
        const totalVal = getCartTotal().toFixed(2);
        
        logInvoiceToFirestore(orderId, cart, totalVal);

        setOrderPassDetails({
          id: orderId,
          total: totalVal,
          items: { ...cart },
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          phone: currentUser ? currentUser.phoneNumber : 'Guest Customer'
        });
        setOrderStatus('ready');
      }
    }, 1000);
  };

  const handleMerchantCheckout = async (method) => {
    const orderId = `KB-${Math.floor(100000 + Math.random() * 900000)}`;
    const totalVal = getCartTotal().toFixed(2);

    if (method === 'cash' || method === 'ebt') {
      logInvoiceToFirestore(orderId, cart, totalVal, method, 'POS Walk-up Customer');
      setOrderPassDetails({
        id: orderId,
        total: totalVal,
        items: { ...cart },
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        phone: `POS - ${method.toUpperCase()}`
      });
      setOrderStatus('ready');
    } else if (method === 'venmo') {
      setMerchantQrData({
        type: 'venmo',
        orderId,
        total: totalVal,
        url: `https://venmo.com/kimsboochery?amount=${totalVal}&note=Order%20${orderId}`
      });
    } else if (method === 'qr') {
      const cartQuery = Object.entries(cart).map(([id, qty]) => `${id}:${qty}`).join(',');
      const checkoutUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?cart=${cartQuery}`;
      setMerchantQrData({
        type: 'customer_checkout',
        orderId,
        total: totalVal,
        url: checkoutUrl
      });
    } else if (method === 'stripe') {
      setIsStripeProcessing(true);
      try {
        const createSession = httpsCallable(functions, 'createStripeCheckoutSession');
        const cartQuery = Object.entries(cart).map(([id, qty]) => `${id}:${qty}`).join(',');
        
        const response = await createSession({
          items: Object.entries(cart).map(([itemId, qty]) => {
            const product = catalog.find(p => p.id === itemId);
            return {
              name: product ? product.name : itemId,
              price: product ? product.rawPrice : 0,
              quantity: qty
            };
          }),
          successUrl: `${window.location.protocol}//${window.location.host}${window.location.pathname}?checkout_status=success&order_id=${orderId}&payment_mode=stripe&cart=${cartQuery}`,
          cancelUrl: window.location.href
        });

        if (response.data && response.data.url) {
          window.location.href = response.data.url;
        } else {
          alert("Failed to initiate Stripe Checkout Session.");
        }
      } catch (err) {
        console.error("Stripe POS Error:", err);
        alert(`Stripe Error: ${err.message || err}`);
      } finally {
        setIsStripeProcessing(false);
      }
    }
  };

  const resetOrder = () => {
    setCart({});
    setOrderStatus(null);
    setOrderPassDetails(null);
  };

  // Expandable tasting notes
  const toggleNotes = (id) => {
    setExpandedNotes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Optical cap scan codes lookup
  const triggerCodeScan = (code) => {
    // Check in standard catalog + limited releases
    const cleanedCode = code.trim().toUpperCase();

    // Find matching flavor or limited release
    let matchingProduct = catalog.find(p => p.code === cleanedCode);

    if (!matchingProduct) {
      // Check limited release array
      const matchingLimited = limitedReleases.find(l => l.code === cleanedCode);
      if (matchingLimited) {
        matchingProduct = {
          id: `${matchingLimited.id}-bottle`,
          name: `${matchingLimited.name} (Sticker Bottle)`,
          desc: matchingLimited.desc,
          price: matchingLimited.price,
          rawPrice: matchingLimited.rawPrice,
          color: matchingLimited.color,
          category: 'bottles',
          stars: matchingLimited.stars,
          reviews: matchingLimited.reviews,
          abv: matchingLimited.abv,
          code: matchingLimited.code,
          ingredients: matchingLimited.ingredients,
          tastingNotes: matchingLimited.tastingNotes,
          isLimited: true
        };
      }
    }

    if (matchingProduct) {
      setScannedProduct(matchingProduct);
    } else {
      alert(`Invalid Cap/Tap code: ${code}. Try SAD01, LONE02, RUST03, HONEY04, DRAGON11, or ZING12.`);
    }
  };

  // AI-powered sorting trigger
  const runAISorting = async () => {
    if (!cravingInput.trim()) return;
    setIsRecommending(true);
    setRecommendedProduct(null);
    try {
      const getFlavorRecommendation = httpsCallable(functions, 'getFlavorRecommendation');
      const payload = {
        cravingInput,
        flavors: baseFlavors.map(f => ({ id: f.id, name: f.name, desc: f.desc, ingredients: f.ingredients }))
      };

      const result = await getFlavorRecommendation(payload);
      const sortedIds = result.data.sortedIds;

      if (Array.isArray(sortedIds) && sortedIds.length > 0) {
        // Recommend the top matching product in Cups format
        const topFlavorId = sortedIds[0];
        const rec = catalog.find(p => p.baseId === topFlavorId && p.category === 'cups');
        if (rec) {
          setRecommendedProduct(rec);
        }
      }
    } catch (err) {
      console.error("AI Sort fallback:", err);
      // Local heuristic fallback sorting
      const lowerInput = cravingInput.toLowerCase();
      let topIndex = 0;
      if (lowerInput.includes('sweet') || lowerInput.includes('fruit') || lowerInput.includes('cactus')) {
        topIndex = 0; // Sad Cactus
      } else if (lowerInput.includes('dark') || lowerInput.includes('berry') || lowerInput.includes('smoky')) {
        topIndex = 1; // Lone Star Blackout
      } else if (lowerInput.includes('sour') || lowerInput.includes('grapefruit') || lowerInput.includes('rose')) {
        topIndex = 2; // Grapefruit Rustler
      } else if (lowerInput.includes('ginger') || lowerInput.includes('spicy') || lowerInput.includes('orange')) {
        topIndex = 3; // Citrus Surge
      } else {
        topIndex = 4; // Hill Country Lavender
      }
      const matchedFlavor = baseFlavors[topIndex];
      const rec = catalog.find(p => p.baseId === matchedFlavor.id && p.category === 'cups');
      setRecommendedProduct(rec);
    } finally {
      setIsRecommending(false);
    }
  };

  // Armadillo chatbot logic (Kimmy)
  const handleKimmyChat = async (e) => {
    e.preventDefault();
    if (!kimmyChatInput.trim()) return;

    const userText = kimmyChatInput;
    setKimmyChatLog(prev => [...prev, { sender: 'user', text: userText }]);
    setKimmyChatInput('');
    setIsKimmyThinking(true);

    try {
      const armadilloReply = await ApiService.askKimmyAI(userText);
      setKimmyChatLog(prev => [...prev, { sender: 'kimmy', text: armadilloReply }]);
    } catch (err) {
      // Local fallback sassy armadillo chat generator
      setTimeout(() => {
        const responses = [
          "Hmph. Sounds like sticky hands talk. Go wash 'em and buy a bottle.",
          "I'm brewing, not chatting. Booth #12 is straight past the folk stage. Go order.",
          "Cravings? Order a Citrus Surge and feel the burn. Don't crowd the counter.",
          "Texas summers are brutal. Get a Cactus pour and get moving. Shoo!",
          "My armor is scratch-proof. Your credit card is not. Pay up.",
          "Is this a joke? Grab a Lone Star Blackout and go sit on the curb."
        ];
        const randomReply = responses[Math.floor(Math.random() * responses.length)];
        setKimmyChatLog(prev => [...prev, { sender: 'kimmy', text: randomReply }]);
      }, 700);
    } finally {
      setIsKimmyThinking(false);
    }
  };

  // Get active quote based on Kimmy's pose
  const getKimmyPoseQuote = () => {
    switch (kimmyPose) {
      case 'sassy':
        return "Yeah, my shell is purple, my eyeliner is smudge-proof, and no, you can't have a discount. Buy or keep moving!";
      case 'sipping':
        return "*sluuuuurp* Ah, this Sad Cactus batch is extra crisp today. The aloe really smooths out my attitude. 10/10.";
      case 'rolled':
        return "*armadillo snoring* ...zzzz... keep your sticky fingers off my fermentation tanks... zzz... Booth #12... zzz...";
      case 'welcome':
      default:
        return "Hey there! Welcome to Mueller Farmers Market. I'm Kimmy. Skip the check-out lines and order some cold booch!";
    }
  };

  // Storage items booking handlers (vendor dashboard)
  const addStorageBooking = (itemId) => {
    const qty = storageQty[itemId];
    const sItem = menuData.storageItems.find(s => s.id === itemId);
    if (!sItem) return;
    const newBooking = {
      id: `SR-${Math.floor(1000 + Math.random() * 9000)}`,
      name: sItem.name,
      qty,
      totalCost: sItem.price * qty,
      date: new Date().toLocaleDateString()
    };
    setStorageBookings(prev => [newBooking, ...prev]);
  };

  // Toggle role via query URL or badge helper
  const handleRoleChange = (targetRole) => {
    setRole(targetRole);
    setShowRoleModal(false);

    // Smoothly update URL query param so developers can refresh without losing mode
    const url = new URL(window.location);
    if (targetRole === 'vendor') {
      url.searchParams.set('role', 'vendor');
    } else {
      url.searchParams.delete('role');
    }
    window.history.pushState({}, '', url);
  };

  // Filtered Catalog for Shop
  const filteredCatalog = catalog.filter(p => {
    if (categoryFilter === 'all') return true;
    return p.category === categoryFilter;
  });

  return (
    <div className={`app-shell ${stickyHandsMode ? 'sticky-active' : ''}`}>
      {/* Invisible reCAPTCHA Anchor */}
      <div id="recaptcha-container"></div>

      {/* ── Titlebar Header ──────────────────────────── */}
      <header className="titlebar">
        <div className="titlebar-logo" onClick={() => handleRoleChange(role === 'customer' ? 'vendor' : 'customer')}>
          <img
            src="/logo.png"
            alt="Kim's Boochery Logo"
            style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1.5px solid var(--accent-cyan)' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="logo-text">Kim's Boochery</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Mueller Sunday Market • Booth #12</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {currentUser && (
            <div className="user-profile-badge" style={{ padding: '3px 7px', fontSize: '0.68rem' }}>
              <i className="fa-solid fa-user-check" />
              <span>{currentUser.phoneNumber.substring(currentUser.phoneNumber.length - 4)}</span>
            </div>
          )}

          {/* Active Role toggle indicator */}
          <div
            className={`role-badge ${role === 'vendor' ? 'vendor' : ''}`}
            onClick={() => setShowRoleModal(true)}
          >
            <i className={`fa-solid ${role === 'vendor' ? 'fa-user-gear' : 'fa-user-astronaut'}`} />
            {role === 'vendor' ? 'Vendor Mode' : 'Customer View'}
          </div>

          <button
            className={`btn btn-sm btn-ghost`}
            onClick={() => setStickyHandsMode(!stickyHandsMode)}
            style={{ padding: '4px 8px', borderRadius: '15px' }}
          >
            <i className="fa-solid fa-hands-wash" />
            <span style={{ display: 'none' }}>Sticky Mode</span>
          </button>
        </div>
      </header>

      {/* ── Vendor Dashboard Overlay Navigation ───────── */}
      {role === 'vendor' && (
        <div style={{
          background: 'rgba(20, 24, 48, 0.9)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '6px 12px',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          zIndex: 900
        }}>
          <button
            className={`btn btn-sm ${vendorView === 'dashboard' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: '6px', padding: '3px 8px' }}
            onClick={() => setVendorView('dashboard')}
          >
            <i className="fa-solid fa-chart-line" /> Dashboard
          </button>
          <button
            className={`btn btn-sm ${vendorView === 'api-audit' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: '6px', padding: '3px 8px' }}
            onClick={() => setVendorView('api-audit')}
          >
            <i className="fa-solid fa-key" /> API Keys Audit
          </button>
          <button
            className={`btn btn-sm ${vendorView === 'rentals' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: '6px', padding: '3px 8px' }}
            onClick={() => setVendorView('rentals')}
          >
            <i className="fa-solid fa-snowflake" /> Rentals & Tanks
          </button>
        </div>
      )}

      {/* ── Main App Body ────────────────────────────── */}
      <main className="main-content">

        {/* Render Vendor View if selected */}
        {role === 'vendor' && vendorView === 'dashboard' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div className="card" style={{ borderLeft: '4px solid var(--accent-violet)' }}>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--text-bright)', marginBottom: '0.5rem' }}>
                <i className="fa-solid fa-store" /> Vendor Back-Office Dashboard
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Managing market stats, inventory levels, and mobile pairing settings for Booth #12.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '1rem' }}>
                <div style={{ background: '#090d19', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Daily Gross Sales</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--accent-emerald)', marginTop: '2px' }}>$348.50</div>
                </div>
                <div style={{ background: '#090d19', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Cups Poured Today</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--accent-cyan)', marginTop: '2px' }}>48 / 100</div>
                </div>
                <div style={{ background: '#090d19', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Rentals Used</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--accent-amber)', marginTop: '2px' }}>3 Slots</div>
                </div>
              </div>
            </div>

            {/* Smartphone pairing QA QR Codes */}
            <div className="card" style={{ textAlign: 'center' }}>
              <h4 style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '0.4rem' }}>
                <i className="fa-solid fa-mobile-screen-button" /> Test & Pair Kiosk Devices
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Scan these QR codes to launch the main webapp or load the dedicated customer payment view.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                {/* Webapp Link QR */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    background: '#fff',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '3px solid var(--accent-cyan)',
                    boxShadow: '0 8px 24px rgba(6, 182, 212, 0.15)'
                  }}>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=0f172a&bgcolor=ffffff&data=${encodeURIComponent('https://kimboocherly.web.app/')}`}
                      alt="Webapp Launch QR"
                      style={{ width: '130px', height: '130px', display: 'block' }}
                    />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#fff', fontWeight: '800' }}>1. Main Webapp Launch</span>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>https://kimboocherly.web.app/</span>
                </div>

                {/* Customer Role QR */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    background: '#fff',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '3px solid var(--accent-violet)',
                    boxShadow: '0 8px 24px rgba(139, 92, 246, 0.15)'
                  }}>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=0f172a&bgcolor=ffffff&data=${encodeURIComponent('https://kimboocherly.web.app/?role=customer')}`}
                      alt="Customer Pay QR"
                      style={{ width: '130px', height: '130px', display: 'block' }}
                    />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#fff', fontWeight: '800' }}>2. Customer Payment View</span>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>https://kimboocherly.web.app/?role=customer</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {role === 'vendor' && vendorView === 'api-audit' && (
          <div className="card animate-fade" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '0.75rem' }}>
              <i className="fa-solid fa-key" style={{ marginRight: '6px' }} /> API Keys Configuration Guide
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Verify status of local configurations declared in your environment file.
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '8px 4px' }}>ENV VARIABLE</th>
                  <th style={{ padding: '8px 4px' }}>KEY SERVICE</th>
                  <th style={{ padding: '8px 4px', textAlign: 'right' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '8px 4px', fontFamily: 'var(--font-mono)' }}>VITE_FIREBASE_API_KEY</td>
                  <td style={{ padding: '8px 4px', color: 'var(--text-secondary)' }}>Firebase SDK Initializer</td>
                  <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                    <span className={`api-badge ${API_KEYS.FIREBASE_API_KEY ? 'active' : ''}`}>{API_KEYS.FIREBASE_API_KEY ? 'ACTIVE' : 'MISSING'}</span>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '8px 4px', fontFamily: 'var(--font-mono)' }}>VITE_STRIPE_PUBLIC_KEY</td>
                  <td style={{ padding: '8px 4px', color: 'var(--text-secondary)' }}>Stripe Apple/GPay Integrator</td>
                  <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                    <span className={`api-badge ${API_KEYS.STRIPE_PUBLIC_KEY ? 'active' : ''}`}>{API_KEYS.STRIPE_PUBLIC_KEY ? 'ACTIVE' : 'MISSING'}</span>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '8px 4px', fontFamily: 'var(--font-mono)' }}>VITE_GOOGLE_MAPS_KEY</td>
                  <td style={{ padding: '8px 4px', color: 'var(--text-secondary)' }}>Booth #12 Maps Locator</td>
                  <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                    <span className={`api-badge ${API_KEYS.GOOGLE_MAPS_KEY ? 'active' : ''}`}>{API_KEYS.GOOGLE_MAPS_KEY ? 'ACTIVE' : 'MISSING'}</span>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '8px 4px', fontFamily: 'var(--font-mono)' }}>VITE_OPENAI_API_KEY</td>
                  <td style={{ padding: '8px 4px', color: 'var(--text-secondary)' }}>Sassy Kimmy Mascot Intelligence</td>
                  <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                    <span className={`api-badge ${API_KEYS.OPENAI_API_KEY ? 'active' : ''}`}>{API_KEYS.OPENAI_API_KEY ? 'ACTIVE' : 'MISSING'}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {role === 'vendor' && vendorView === 'rentals' && (
          <div className="card animate-fade" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '0.5rem' }}>
              <i className="fa-solid fa-snowflake" /> Excess Storage capacity & Rentals
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Vendor capacity management console. Reserve cooling locker storage.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {menuData.storageItems.map(item => (
                <div key={item.id} style={{
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--border)',
                  padding: '10px',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff' }}>{item.name}</span>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>${item.price} per {item.unit} • {item.available} left</p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div className="counter-box">
                      <button className="counter-btn" onClick={() => setStorageQty(prev => ({ ...prev, [item.id]: Math.max(1, prev[item.id] - 1) }))}>-</button>
                      <span className="counter-val">{storageQty[item.id]}</span>
                      <button className="counter-btn" onClick={() => setStorageQty(prev => ({ ...prev, [item.id]: Math.min(item.available, prev[item.id] + 1) }))}>+</button>
                    </div>

                    <button className="btn btn-sm btn-primary" style={{ padding: '6px 10px' }} onClick={() => addStorageBooking(item.id)}>
                      Rent
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {storageBookings.length > 0 && (
              <div style={{ marginTop: '1.25rem' }}>
                <h4 style={{ fontSize: '0.82rem', color: '#fff', marginBottom: '6px' }}>Active Storage Leases</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {storageBookings.map(b => (
                    <div key={b.id} style={{ background: 'rgba(52,211,153,0.04)', border: '1px solid rgba(52,211,153,0.15)', padding: '8px', borderRadius: '6px', fontSize: '0.72rem', display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <strong>{b.name}</strong> x{b.qty} ({b.date})
                      </div>
                      <span style={{ color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>${b.totalCost.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Tab View 1: Tap Menu ────────────────────────── */}
        {activeTab === 'menu' && (
          <div className="animate-fade">

            {/* Filters Bar - FIRST thing customer sees */}
            <div className="category-filter" style={{ marginTop: '0.2rem' }}>
              {[
                { id: 'all', label: 'All Tap Menu' },
                { id: 'cups', label: 'Cups (Tap)' },
                { id: 'bottles', label: 'Amber Bottles' },
                { id: 'can4', label: 'Can 4-Packs' },
                { id: 'merch', label: 'Merchandise' }
              ].map(cat => (
                <button
                  key={cat.id}
                  className={`category-tab ${categoryFilter === cat.id ? 'active' : ''}`}
                  onClick={() => setCategoryFilter(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Catalog Grid */}
            <div className="product-grid">
              {filteredCatalog.map(product => {
                const cartQty = cart[product.id] || 0;
                return (
                  <div key={product.id} className="product-card animate-fade">

                    {/* Bottle or Merchandise Visual */}
                    <div className="bottle-visual-wrapper">
                      {product.category === 'merch' ? (
                        product.id === 'merch-tee' ? <ShirtSVG /> :
                          product.id === 'merch-hat' ? <HatSVG /> : <StickerSVG />
                      ) : (
                        <AmberBottleSVG flavorColor={product.color} flavorName={product.baseId} />
                      )}
                    </div>

                    <div className="product-details">
                      <div className="product-title-row">
                        <h4 className="product-title">{product.name}</h4>
                      </div>

                      {/* Ratings stars */}
                      <div className="stars-row">
                        <span>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <i key={i} className={`fa-solid fa-star`} style={{ opacity: i < Math.floor(product.stars) ? 1 : 0.2 }} />
                          ))}
                        </span>
                        <span className="star-rating-val">{product.stars} ({product.reviews})</span>
                        {product.abv && <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>• {product.abv}</span>}
                      </div>

                      <p className="flavor-desc">{product.desc}</p>

                      <div className="price-row">
                        <div>
                          <span className="price-text">{product.price}</span>
                          <span className="price-unit"> / {product.category === 'cups' ? 'cup' : product.category === 'bottles' ? 'bottle' : product.category === 'can4' ? 'pack' : 'item'}</span>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {cartQty > 0 ? (
                            <div className="counter-box">
                              <button className="counter-btn" onClick={() => removeFromCart(product.id)}>-</button>
                              <span className="counter-val">{cartQty}</span>
                              <button className="counter-btn" onClick={() => addToCart(product.id)}>+</button>
                            </div>
                          ) : (
                            <button className="btn btn-sm btn-primary" onClick={() => addToCart(product.id)}>
                              <i className="fa-solid fa-plus" /> Quick Add
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expandable tasting notes */}
                      <div className="flavor-expander">
                        <div className="expander-header" onClick={() => toggleNotes(product.id)}>
                          <span>Tasting notes & ingredients</span>
                          <i className={`fa-solid ${expandedNotes[product.id] ? 'fa-chevron-up' : 'fa-chevron-down'}`} />
                        </div>
                        {expandedNotes[product.id] && (
                          <div className="expander-content animate-fade">
                            <div style={{ marginBottom: '4px' }}>
                              <strong style={{ color: 'var(--accent-cyan)', fontSize: '0.68rem' }}>TASTING NOTES:</strong>
                              <p style={{ marginTop: '2px', color: '#fff' }}>{product.tastingNotes || "Standard refreshingly crisp kombucha finish."}</p>
                            </div>
                            <div>
                              <circle cx="0" cy="0" r="0" />
                              <strong style={{ color: 'var(--accent-violet)', fontSize: '0.68rem' }}>ORGANIC INGREDIENTS:</strong>
                              <p style={{ marginTop: '2px', color: 'var(--text-secondary)' }}>{product.ingredients || "Organic Kombucha Culture, Filtered Spring Water, Natural Organic Extracts."}</p>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* Separator and Kimmy's Corner at the bottom as an afterthought */}
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '2.5rem 0 1.5rem' }} />

            <div className="card animate-fade" style={{ borderLeft: '4px solid var(--accent-violet)', background: 'rgba(25, 15, 45, 0.4)' }}>
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ width: '80px', height: '80px', flexShrink: 0 }}>
                  <KimmySVG pose={kimmyPose} />
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--accent-violet)', letterSpacing: '0.05em' }}>KIMMY THE ARMADILLO</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Mascot Pose Controller</span>
                  </div>

                  <div style={{
                    background: '#090d16',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '0.78rem',
                    color: '#fff',
                    fontStyle: 'italic',
                    marginBottom: '10px',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    "{getKimmyPoseQuote()}"
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {[
                      { id: 'welcome', label: 'Welcome 🌸' },
                      { id: 'sassy', label: 'Sassy 💅' },
                      { id: 'sipping', label: 'Sipping 🥤' },
                      { id: 'rolled', label: 'Sleepy 😴' }
                    ].map(p => (
                      <button
                        key={p.id}
                        className={`btn btn-sm ${kimmyPose === p.id ? 'btn-primary' : 'btn-ghost'}`}
                        style={{ padding: '3px 8px', fontSize: '0.65rem', borderRadius: '15px' }}
                        onClick={() => setKimmyPose(p.id)}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ── Tab View 2: Basket & Checkout ──────────────── */}
        {activeTab === 'checkout' && (
          <div className="animate-fade">

            {orderStatus === null && (
              <div className="card">
                <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-basket-shopping" style={{ color: 'var(--accent-cyan)' }} /> Review Basket Items
                </h3>

                {totalCartCount() === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                    <i className="fa-solid fa-basket-shopping" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem', opacity: 0.3 }} />
                    <p>Your shopping basket is currently empty.</p>
                    <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setActiveTab('menu')}>
                      Go to Tap Menu
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* SMS Verification Card if guest */}
                    {!currentUser ? (
                      <div className="auth-card animate-fade">
                        <div className="auth-title">
                          <i className="fa-solid fa-phone" /> Verify Phone for Line-Skipping
                        </div>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                          Authenticate using SMS to link this order pass directly to your phone number. Skip the checkout lines!
                        </p>

                        {authStatus === 'idle' || authStatus === 'sending' ? (
                          <form onSubmit={sendVerificationSms} className="auth-input-group">
                            <input
                              type="tel"
                              className="auth-input"
                              placeholder="+1 (512) 555-0199"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              disabled={authStatus === 'sending'}
                            />
                            <button type="submit" className="btn btn-sm btn-accent" disabled={authStatus === 'sending'}>
                              {authStatus === 'sending' ? "Sending..." : "Send OTP"}
                            </button>
                          </form>
                        ) : (
                          <form onSubmit={confirmOtpCode} className="auth-input-group">
                            <input
                              type="text"
                              className="auth-input"
                              placeholder="Enter 6-digit SMS code"
                              value={verificationCode}
                              onChange={(e) => setVerificationCode(e.target.value)}
                              disabled={authStatus === 'verifying'}
                            />
                            <button type="submit" className="btn btn-sm btn-primary" disabled={authStatus === 'verifying'}>
                              {authStatus === 'verifying' ? "Verify Code" : "Verify Code"}
                            </button>
                          </form>
                        )}

                        {authError && (
                          <div className="auth-status-msg error animate-fade">
                            {authError}
                          </div>
                        )}

                        {authStatus === 'code-sent' && (
                          <div className="auth-status-msg info animate-fade">
                            SMS passcode dispatched. Dev/test QA number bypass supports mock entries.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="auth-card animate-fade" style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div className="user-profile-badge">
                            <i className="fa-solid fa-circle-check" /> Verified: {currentUser.phoneNumber}
                          </div>
                          <button className="btn btn-sm btn-ghost" style={{ padding: '3px 8px', borderRadius: '6px' }} onClick={signOutUser}>
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="checkout-list" style={{ marginTop: '1rem' }}>
                      {Object.entries(cart).map(([itemId, qty]) => {
                        const product = catalog.find(p => p.id === itemId);
                        if (!product) return null;
                        return (
                          <div key={itemId} className="checkout-item animate-fade">
                            <div style={{ minWidth: 0, flex: 1, marginRight: '8px' }}>
                              <span style={{ fontWeight: '700', color: '#fff', fontSize: '0.85rem' }}>{product.name}</span>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                ${product.rawPrice.toFixed(2)} each
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div className="counter-box">
                                <button className="counter-btn" onClick={() => removeFromCart(itemId)}>-</button>
                                <span className="counter-val">{qty}</span>
                                <button className="counter-btn" onClick={() => addToCart(itemId)}>+</button>
                              </div>
                              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--accent-cyan)', width: '55px', textAlign: 'right' }}>
                                ${(product.rawPrice * qty).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', padding: '12px 0', display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '1.15rem', color: 'var(--accent-cyan)', marginBottom: '1.25rem' }}>
                      <span>Subtotal Amount:</span>
                      <span>${getCartTotal().toFixed(2)}</span>
                    </div>

                    {/* Payment selector */}
                    {role === 'vendor' ? (
                      <div className="animate-fade">
                        <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', marginBottom: '0.75rem', fontWeight: '800' }}>
                          <i className="fa-solid fa-cash-register" /> MERCHANT POS CHECKOUT PANEL
                        </h4>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '1rem' }}>
                          <button className="btn btn-primary" style={{ background: '#10b981', color: '#050814', border: 'none', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => handleMerchantCheckout('cash')}>
                            <i className="fa-solid fa-money-bill-wave" /> Register Cash
                          </button>
                          <button className="btn btn-primary" style={{ background: '#f59e0b', color: '#050814', border: 'none', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => handleMerchantCheckout('ebt')}>
                            <i className="fa-solid fa-coins" /> Register EBT
                          </button>
                          <button className="btn btn-primary" style={{ background: '#3b82f6', color: '#fff', border: 'none', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => handleMerchantCheckout('venmo')}>
                            <i className="fa-solid fa-mobile-screen-button" /> Venmo QR
                          </button>
                          <button className="btn btn-primary" style={{ background: 'var(--accent-violet)', color: '#fff', border: 'none', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => handleMerchantCheckout('qr')}>
                            <i className="fa-solid fa-qrcode" /> Cart QR
                          </button>
                        </div>

                        <button 
                          className="btn btn-primary" 
                          style={{ width: '100%', padding: '12px', background: '#e11d48', color: '#fff', border: 'none', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} 
                          onClick={() => handleMerchantCheckout('stripe')}
                          disabled={isStripeProcessing}
                        >
                          {isStripeProcessing ? (
                            <>
                              <i className="fa-solid fa-spinner fa-spin" /> Redirecting to Stripe...
                            </>
                          ) : (
                            <>
                              <i className="fa-solid fa-credit-card" /> Stripe Tap-to-Pay (Admin Phone)
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <>
                        <h4 style={{ fontSize: '0.85rem', color: '#fff', marginBottom: '0.5rem' }}>Select Payment Method</h4>

                        <div className="payment-method-grid">
                          <div className={`payment-method-card ${paymentMode === 'apple-pay' ? 'active' : ''}`} onClick={() => setPaymentMode('apple-pay')}>
                            <i className="fa-brands fa-apple" />
                            <span>Apple Pay</span>
                          </div>
                          <div className={`payment-method-card ${paymentMode === 'gpay' ? 'active' : ''}`} onClick={() => setPaymentMode('gpay')}>
                            <i className="fa-brands fa-google" />
                            <span>Google Pay</span>
                          </div>
                          <div className={`payment-method-card ${paymentMode === 'card' ? 'active' : ''}`} onClick={() => setPaymentMode('card')}>
                            <i className="fa-solid fa-credit-card" />
                            <span>Credit/Debit Card</span>
                          </div>
                          <div className={`payment-method-card ${paymentMode === 'cash' ? 'active' : ''}`} onClick={() => setPaymentMode('cash')}>
                            <i className="fa-solid fa-money-bill-wave" />
                            <span>Cash at Booth #12</span>
                          </div>
                        </div>

                        <button className="btn btn-primary" style={{ width: '100%', padding: '12px' }} onClick={handleCheckout}>
                          Pay ${getCartTotal().toFixed(2)} with {paymentMode.replace('-', ' ').toUpperCase()}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {orderStatus === 'processing' && (
              <div className="card text-center animate-fade" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: 'var(--accent-cyan)', marginBottom: '1.25rem' }} />
                <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.5rem' }}>Processing Payment</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{paymentStatusText}</p>
              </div>
            )}

            {orderStatus === 'ready' && orderPassDetails && (
              <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="pickup-pass">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
                    <span>KIM'S BOOCHERY</span>
                    <span>PASS REF: {orderPassDetails.id}</span>
                  </div>

                  <h3 style={{ color: 'var(--accent-emerald)', fontSize: '1.35rem', margin: '0.5rem 0 0.25rem' }}>
                    <i className="fa-solid fa-circle-check" /> Order Confirmed!
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Show this pickup pass code at Booth #12 (Mueller Sunday Market) to skip the checkout line.
                  </p>

                  {/* Digital pass barcode simulation */}
                  <div className="pass-barcode">
                    <div style={{ background: '#000', height: '55px', width: '100%', padding: '5px 20px', display: 'flex', gap: '2px', alignItems: 'stretch' }}>
                      {/* Barcode lines */}
                      {Array.from({ length: 45 }).map((_, i) => (
                        <div key={i} style={{
                          flex: 1,
                          background: (i % 2 === 0 || i % 7 === 0 || i === 15 || i === 25 || i === 35) ? '#fff' : '#000',
                          opacity: 0.95
                        }} />
                      ))}
                    </div>
                    <div style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: '#000', marginTop: '4px', letterSpacing: '0.12em', fontWeight: '800' }}>
                      {orderPassDetails.id}
                    </div>
                  </div>

                  <div style={{ background: '#090d16', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '10px', fontSize: '0.75rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Authorized Time:</span>
                      <span style={{ color: '#fff', fontWeight: '600' }}>{orderPassDetails.time}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Customer Phone:</span>
                      <span style={{ color: '#fff', fontWeight: '600', fontFamily: 'var(--font-mono)' }}>{orderPassDetails.phone}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Total Amount Paid:</span>
                      <span style={{ color: 'var(--accent-cyan)', fontWeight: '800' }}>${orderPassDetails.total}</span>
                    </div>
                  </div>

                  <button 
                    className="btn btn-primary animate-fade" 
                    style={{ width: '100%', marginTop: '10px', background: 'var(--accent-cyan)', color: '#050814', fontWeight: '800', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} 
                    onClick={() => window.print()}
                  >
                    <i className="fa-solid fa-print" /> Print Invoice / Receipt
                  </button>
                </div>

                {/* Hidden printable receipt wrapper */}
                <div id="printable-receipt-modal">
                  <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '10px', marginBottom: '10px' }}>
                    <h2 style={{ margin: '0 0 5px 0' }}>KIM'S BOOCHERY</h2>
                    <p style={{ margin: '0 0 5px 0' }}>Mueller Farmers Market, Booth #12</p>
                    <p style={{ margin: '0', fontWeight: 'bold' }}>INVOICE / SALES RECEIPT</p>
                  </div>
                  <div style={{ marginBottom: '10px', fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div><strong>Invoice ID:</strong> {orderPassDetails.id}</div>
                    <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
                    <div><strong>Time:</strong> {orderPassDetails.time}</div>
                    <div><strong>Payment Method:</strong> {paymentMode.replace('-', ' ').toUpperCase()}</div>
                    <div><strong>Customer Ref:</strong> {orderPassDetails.phone}</div>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', borderBottom: '1px dashed #000', paddingBottom: '5px', marginBottom: '10px', fontSize: '10px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #000' }}>
                        <th style={{ textAlign: 'left', paddingBottom: '4px' }}>Item</th>
                        <th style={{ textAlign: 'center', paddingBottom: '4px' }}>Qty</th>
                        <th style={{ textAlign: 'right', paddingBottom: '4px' }}>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(orderPassDetails.items).map(([itemId, qty]) => {
                        const product = catalog.find(p => p.id === itemId);
                        return (
                          <tr key={itemId}>
                            <td style={{ padding: '3px 0' }}>{product ? product.name : itemId}</td>
                            <td style={{ textAlign: 'center', padding: '3px 0' }}>{qty}</td>
                            <td style={{ textAlign: 'right', padding: '3px 0' }}>${((product ? product.rawPrice : 0) * qty).toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '12px' }}>
                    <span>TOTAL:</span>
                    <span>${orderPassDetails.total}</span>
                  </div>
                  <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '9px', fontStyle: 'italic', borderTop: '1px dashed #000', paddingTop: '10px' }}>
                    Thank you for supporting local kombucha!<br />See you at Mueller Sunday Market Booth #12!
                  </div>
                </div>

                <div className="card text-center" style={{ textAlign: 'center' }}>
                  <h4 style={{ fontSize: '0.85rem', color: '#fff', marginBottom: '0.25rem' }}>Mueller Market Pickup Booth #12</h4>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                    Straight past the acoustic stage. Look for the large cartoonish armadillo sign.
                  </p>

                  <button className="btn btn-ghost" style={{ width: '100%' }} onClick={resetOrder}>
                    Start New Order
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ── Tab View 3: Flavor Scan ─────────────────────── */}
        {activeTab === 'flavorscan' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            <div className="card">
              <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-camera" style={{ color: 'var(--accent-cyan)' }} /> Camera cap & Tap scan
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Scan a bottle cap code or tap bar tag (e.g. <code>SAD01</code>, <code>LONE02</code>, <code>RUST03</code>, <code>DRAGON11</code>) to pull up the product detail card instantly.
              </p>

              {/* Viewfinder simulation */}
              <div className="scanner-container">
                {isCameraGranted && scannerActive ? (
                  <video
                    ref={videoRef}
                    id="viewfinder-stream"
                    autoPlay
                    playsInline
                    muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle, #0e172e 0%, #03050c 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    textAlign: 'center',
                    padding: '1rem'
                  }}>
                    <i className="fa-solid fa-camera" style={{ fontSize: '2.5rem', color: 'var(--text-muted)', opacity: 0.15, marginBottom: '8px' }} />
                    {scannerActive ? "Initializing camera stream..." : "Camera Stream Inactive"}
                  </div>
                )}

                <div className="scanner-viewfinder">
                  <div className="scanner-corner corner-tl" />
                  <div className="scanner-corner corner-tr" />
                  <div className="scanner-corner corner-bl" />
                  <div className="scanner-corner corner-br" />
                  <div className="scanner-laser" style={{ display: scannerActive ? 'block' : 'none' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
                <button
                  className={`btn ${scannerActive ? 'btn-ghost' : 'btn-primary'}`}
                  style={{ flex: 1 }}
                  onClick={() => setScannerActive(!scannerActive)}
                >
                  <i className={`fa-solid ${scannerActive ? 'fa-video-slash' : 'fa-video'}`} />
                  {scannerActive ? "Stop Camera" : "Start Live Camera"}
                </button>
              </div>
            </div>

            {/* Mock test keys */}
            <div className="card">
              <h4 style={{ fontSize: '0.85rem', color: '#fff', marginBottom: '0.5rem' }}>Simulate Cap QR/Tag Tap</h4>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Select a tag code to simulate scan detection and pull up the product detail drawer.
              </p>

              <div className="scan-btn-grid">
                {[
                  { code: 'SAD01', name: 'Sad Cactus' },
                  { code: 'LONE02', name: 'Lone Star' },
                  { code: 'RUST03', name: 'Grapefruit' },
                  { code: 'HONEY04', name: 'Citrus' },
                  { code: 'DRAGON11', name: 'Dragon (Ltd)' },
                  { code: 'ZING12', name: 'Ginger (Ltd)' }
                ].map(item => (
                  <button
                    key={item.code}
                    className="btn btn-sm btn-ghost"
                    style={{ fontSize: '0.65rem', padding: '6px 4px', borderRadius: '6px' }}
                    onClick={() => triggerCodeScan(item.code)}
                  >
                    <code>{item.code}</code> ({item.name})
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <input
                  type="text"
                  placeholder="Enter manual cap code (e.g. SAD01)"
                  value={scanCodeText}
                  onChange={(e) => setScanCodeText(e.target.value)}
                  style={{
                    flex: 1,
                    background: '#040712',
                    border: '1px solid var(--border)',
                    borderRadius: '20px',
                    padding: '6px 14px',
                    fontSize: '0.8rem',
                    color: '#fff',
                    outline: 'none'
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && triggerCodeScan(scanCodeText)}
                />
                <button className="btn btn-sm btn-primary" onClick={() => triggerCodeScan(scanCodeText)}>
                  Scan code
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ── Tab View 4: Kimmy Mascot ─────────────── */}
        {activeTab === 'armadillo' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Mascot advice */}
            <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div className="mascot-avatar">
                <KimmySVG pose={kimmyPose} />
              </div>

              <div className="chat-bubble">
                <div style={{ fontSize: '0.62rem', fontWeight: '800', color: 'var(--accent-violet)', letterSpacing: '0.05em', marginBottom: '2px' }}>KIMMY THE ARMADILLO</div>
                <p style={{ fontSize: '0.82rem', color: '#fff', lineHeight: '1.4' }}>
                  {kimmyChatLog[kimmyChatLog.length - 1].sender === 'kimmy'
                    ? kimmyChatLog[kimmyChatLog.length - 1].text
                    : "Grunt... I'm thinking..."}
                </p>
              </div>
            </div>

            {/* Poses selector in tab view */}
            <div className="card">
              <h4 style={{ fontSize: '0.85rem', color: '#fff', marginBottom: '0.5rem' }}>Kimmy's Dynamic Poses</h4>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Toggle Kimmy's active pose to see her expressions and get custom quotes.
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { id: 'welcome', label: 'Welcome 🌸' },
                  { id: 'sassy', label: 'Sassy 💅' },
                  { id: 'sipping', label: 'Sipping 🥤' },
                  { id: 'rolled', label: 'Sleepy 😴' }
                ].map(p => (
                  <button
                    key={p.id}
                    className={`btn btn-sm ${kimmyPose === p.id ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setKimmyPose(p.id)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chatbot conversation list */}
            <div className="card">
              <h4 style={{ fontSize: '0.85rem', color: '#fff', marginBottom: '0.5rem' }}>Ask Kimmy Anything</h4>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Ask her about ingredients, fermentation, or how to reach Booth #12. Keep it short, she gets grumpy!
              </p>

              <div style={{
                background: '#040712',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                height: '180px',
                overflowY: 'auto',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginBottom: '1rem',
                scrollbarWidth: 'none'
              }}>
                {kimmyChatLog.map((chat, idx) => (
                  <div key={idx} style={{
                    alignSelf: chat.sender === 'user' ? 'flex-end' : 'flex-start',
                    background: chat.sender === 'user' ? 'rgba(6,182,212,0.1)' : 'rgba(255,255,255,0.03)',
                    border: chat.sender === 'user' ? '1px solid rgba(6,182,212,0.2)' : '1px solid var(--border)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    maxWidth: '85%',
                    fontSize: '0.75rem',
                    color: chat.sender === 'user' ? 'var(--accent-cyan)' : '#f1f5f9'
                  }}>
                    {chat.text}
                  </div>
                ))}
                {isKimmyThinking && (
                  <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <i className="fa-solid fa-spinner fa-spin" /> Kimmy is grunting...
                  </div>
                )}
              </div>

              <form onSubmit={handleKimmyChat} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={kimmyChatInput}
                  onChange={(e) => setKimmyChatInput(e.target.value)}
                  placeholder="Ask Kimmy (e.g. Do you have gluten free?)"
                  style={{
                    flex: 1,
                    background: '#040712',
                    border: '1px solid var(--border)',
                    borderRadius: '20px',
                    padding: '8px 14px',
                    fontSize: '0.8rem',
                    color: '#fff',
                    outline: 'none'
                  }}
                />
                <button type="submit" className="btn btn-sm btn-accent" disabled={isKimmyThinking}>
                  Ask
                </button>
              </form>
            </div>

            {/* Sassy recommendations */}
            <div className="card">
              <h4 style={{ fontSize: '0.85rem', color: '#fff', marginBottom: '0.5rem' }}>Kimmy's Top Tap Recommendations</h4>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                These are flyin' off the keg taps today. Order one now.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { id: 'lone-star-cup', name: 'Lone Star Blackout (Tap Cup)', price: '$5.50', baseId: 'lone-star' },
                  { id: 'sad-cactus-bottle', name: 'Sad Cactus (Sticker Bottle)', price: '$6.50', baseId: 'sad-cactus' }
                ].map(item => (
                  <div key={item.id} style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border)',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#fff' }}>{item.name}</span>
                      <span style={{ color: 'var(--accent-amber)', fontSize: '0.65rem', marginLeft: '8px' }}>🔥 Top Seller</span>
                    </div>

                    <button className="btn btn-sm btn-primary" onClick={() => addToCart(item.id)}>
                      Quick Add ({item.price})
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ── Strict 4-Tab Mobile Navigation Bar ────────── */}
      <nav className="bottom-nav">
        <button
          className={`bottom-tab ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu')}
        >
          <i className="fa-solid fa-wine-glass-empty" />
          <span>Taps</span>
        </button>

        <button
          className={`bottom-tab ${activeTab === 'checkout' ? 'active' : ''}`}
          onClick={() => setActiveTab('checkout')}
        >
          <i className="fa-solid fa-basket-shopping" />
          <span>Basket</span>
          {totalCartCount() > 0 && (
            <span className="nav-badge">{totalCartCount()}</span>
          )}
        </button>

        <button
          className={`bottom-tab ${activeTab === 'flavorscan' ? 'active' : ''}`}
          onClick={() => setActiveTab('flavorscan')}
        >
          <i className="fa-solid fa-qrcode" />
          <span>Flavor Scan</span>
        </button>

        <button
          className={`bottom-tab ${activeTab === 'armadillo' ? 'active' : ''}`}
          onClick={() => setActiveTab('armadillo')}
        >
          <i className="fa-solid fa-shield-halved" />
          <span>Kimmy</span>
        </button>
      </nav>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '1.25rem 1rem calc(95px + env(safe-area-inset-bottom))', textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        Kim's Boochery &copy; {new Date().getFullYear()} — Mueller Sunday Market Kiosk • Booth #12
      </footer>

      {/* ── Scanned Product Drawer (Pull-up sheet) ────────── */}
      {scannedProduct && (
        <div className="bottom-drawer-backdrop" onClick={() => setScannedProduct(null)}>
          <div className="bottom-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-notch" onClick={() => setScannedProduct(null)} />

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ width: '60px', height: '110px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', overflow: 'hidden' }}>
                <AmberBottleSVG flavorColor={scannedProduct.color} flavorName={scannedProduct.baseId || 'Ltd'} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                {scannedProduct.isLimited && (
                  <span style={{ fontSize: '0.62rem', fontWeight: '800', background: 'var(--accent-amber)', color: '#000', padding: '1px 5px', borderRadius: '4px', display: 'inline-block', marginBottom: '2px' }}>LIMITED RELEASE CAP</span>
                )}
                <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>{scannedProduct.name}</h3>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: '700', marginTop: '2px' }}>
                  <span>{scannedProduct.price}</span>
                  <span style={{ color: 'var(--text-muted)' }}>•</span>
                  <span>{scannedProduct.abv}</span>
                  <span style={{ color: 'var(--text-muted)' }}>•</span>
                  <span style={{ color: 'var(--accent-rose)' }}>Only {scannedProduct.inventory} left!</span>
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1rem', lineHeight: '1.45' }}>
              "{scannedProduct.desc}"
            </p>

            <div style={{ background: '#090d16', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', marginBottom: '1.25rem', fontSize: '0.75rem' }}>
              <div style={{ marginBottom: '6px' }}>
                <strong style={{ color: 'var(--accent-cyan)', fontSize: '0.65rem' }}>TASTING NOTES:</strong>
                <p style={{ marginTop: '2px', color: '#fff' }}>{scannedProduct.tastingNotes}</p>
              </div>
              <div>
                <strong style={{ color: 'var(--accent-violet)', fontSize: '0.65rem' }}>ORGANIC INGREDIENTS:</strong>
                <p style={{ marginTop: '2px', color: 'var(--text-secondary)' }}>{scannedProduct.ingredients}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setScannedProduct(null)}>
                Close
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 2 }}
                onClick={() => {
                  addToCart(scannedProduct.id);
                  setScannedProduct(null);
                  setActiveTab('checkout');
                }}
              >
                Quick Add & Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Merchant POS QR Modal ──────────────────────── */}
      {merchantQrData && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5, 8, 20, 0.95)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '1.5rem'
        }} className="animate-fade">
          <div className="card text-center" style={{ maxWidth: '440px', width: '100%', border: '1px solid var(--accent-cyan)' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.75rem' }}>
              {merchantQrData.type === 'venmo' ? '💸 Pay with Venmo' : '📱 Customer Scan-to-Pay'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              {merchantQrData.type === 'venmo' 
                ? `Show this QR to the customer to scan and pay $${merchantQrData.total} via Venmo.` 
                : `Customer scans this QR code to load the cart and check out on their own phone.`}
            </p>

            <div style={{ padding: '1rem', background: '#000', borderRadius: '12px', display: 'inline-block', marginBottom: '1.25rem' }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=${merchantQrData.type === 'venmo' ? '3b82f6' : '06b6d4'}&bgcolor=000000&data=${encodeURIComponent(merchantQrData.url)}`}
                alt="Checkout QR"
                style={{ width: '200px', height: '200px', borderRadius: '8px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setMerchantQrData(null)}>Cancel</button>
              {merchantQrData.type === 'venmo' ? (
                <button className="btn btn-primary" style={{ flex: 2, background: '#3b82f6', color: '#fff', border: 'none' }} onClick={() => {
                  logInvoiceToFirestore(merchantQrData.orderId, cart, merchantQrData.total, 'venmo', 'POS Venmo Customer');
                  setOrderPassDetails({
                    id: merchantQrData.orderId,
                    total: merchantQrData.total,
                    items: { ...cart },
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    phone: 'POS - VENMO'
                  });
                  setOrderStatus('ready');
                  setMerchantQrData(null);
                }}>
                  Verify & Complete
                </button>
              ) : (
                <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => {
                  resetOrder();
                  setMerchantQrData(null);
                }}>
                  Done (Cart Shared)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── User Role Selector Modal ──────────────────── */}
      {showRoleModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5, 8, 20, 0.8)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem'
        }} onClick={() => setShowRoleModal(false)}>
          <div className="card animate-fade" style={{ maxWidth: '340px', width: '100%', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.5rem' }}>Select Application View</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Choose your access role. This toggle simulates different devices scanning the Booth #12 QR code.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className={`btn ${role === 'customer' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => handleRoleChange('customer')}
                style={{ justifyContent: 'center' }}
              >
                <i className="fa-solid fa-user" /> Customer Storefront View
              </button>
              <button
                className={`btn ${role === 'vendor' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => handleRoleChange('vendor')}
                style={{ justifyContent: 'center' }}
              >
                <i className="fa-solid fa-user-gear" /> Vendor Back-Office Mode
              </button>
            </div>

            <button
              className="btn btn-ghost btn-sm"
              style={{ marginTop: '1.25rem', width: '100%' }}
              onClick={() => setShowRoleModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
