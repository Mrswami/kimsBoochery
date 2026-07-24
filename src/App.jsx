import { useState, useEffect, useCallback } from 'react'
import ApiService from './config/api'
import './index.css'

// ══════════════════════════════════════════════════════════════
// KIMBOOCHERLY — Sunday Market Quick-Pickup & Order App
// Modeled after Sovereign Nexus / jacobdev webapp architecture
// ══════════════════════════════════════════════════════════════

// Rich Flavors Menu with Ingredients & Tasting Notes
const flavors = [
  { 
    id: 'sad-cactus', 
    name: 'Sad Cactus', 
    desc: 'Prickly pear & aloe. Brewed with tears & attitude.', 
    price: '$5.00', 
    color: 'rose',
    ingredients: 'Organic Kombucha Culture, Wild Texas Prickly Pear Juice, Organic Aloe Vera Extract, Hibiscus Petals, Filtered Spring Water.',
    tastingNotes: 'Sharp, dry finish with a sweet cactus-fruit body. Light floral undertones.',
    bundlePrice: '$13.50',
    bundleDesc: '3-bottle starter bundle (Save 10%)'
  },
  { 
    id: 'lone-star', 
    name: 'Lone Star Blackout', 
    desc: 'Blackberry, charcoal, & oak. Dark & bold.', 
    price: '$5.50', 
    color: 'violet',
    ingredients: 'Organic Kombucha Culture, Wild Blackberries, Activated Charcoal (Coconut Source), Sweet Oak Wood Infusion, Filtered Spring Water.',
    tastingNotes: 'Rich, tannic, blackberry-forward with a smoky, earthy mouthfeel. Deep obsidian color.',
    bundlePrice: '$15.00',
    bundleDesc: '3-bottle cellar bundle (Save 9%)'
  },
  { 
    id: 'grapefruit', 
    name: 'Grapefruit Rustler', 
    desc: 'Grapefruit, rosemary, & hops. Sturdy & sharp.', 
    price: '$5.00', 
    color: 'cyan',
    ingredients: 'Organic Kombucha Culture, Cold-Pressed Pink Grapefruit Juice, Fresh Garden Rosemary, Cascade Hops, Filtered Spring Water.',
    tastingNotes: 'Crisp citrus bitterness balanced by herbaceous piney-rosemary notes. Highly carbonated.',
    bundlePrice: '$13.50',
    bundleDesc: '3-bottle garden pack (Save 10%)'
  },
]

function App() {
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [currentView, setCurrentView] = useState('shop') // 'shop' | 'qr-storage' | 'admin-dashboard' | 'api-keys' | 'firebase' | 'activity'
  const [stickyHandsMode, setStickyHandsMode] = useState(false)
  const [liveTime, setLiveTime] = useState(new Date())
  const [apiKeysVisible, setApiKeysVisible] = useState({})
  
  // Cart & Order State
  const [cart, setCart] = useState({})
  const [orderStatus, setOrderStatus] = useState(null) // null | 'ordered' | 'brewing' | 'pickup'
  const [isPaying, setIsPaying] = useState(false)

  // Storage booking states
  const [storageItems, setStorageItems] = useState([
    { id: 'tank-a', name: 'Fermentation Tank Excess Space', desc: 'Rent excess tank capacity (up to 15 Gallons) in our temperature-controlled facility.', price: 12, available: 45, unit: 'gallons', icon: 'fa-soap', color: 'violet' },
    { id: 'cold-room', name: 'Cold Room Keg/Box Storage', desc: 'Overnight refrigeration storage at Mueller Sunday Marketplace. Direct drop-off.', price: 8, available: 12, unit: 'kegs', icon: 'fa-snowflake', color: 'cyan' },
    { id: 'booth-locker', name: 'Mueller Vendor Secure Lockers', desc: 'Secure onsite lockboxes to store display material or extra inventory between market weekends.', price: 25, available: 5, unit: 'lockers', icon: 'fa-vault', color: 'emerald' },
  ])
  const [bookingQty, setBookingQty] = useState({ 'tank-a': 1, 'cold-room': 1, 'booth-locker': 1 })
  const [bookings, setBookings] = useState([])
  const [customQrText, setCustomQrText] = useState('')
  const [generatedQr, setGeneratedQr] = useState('https://kimboocherly-app.web.app/')

  // Mascot Chat State
  const [chatText, setChatText] = useState('')
  const [isAskingAI, setIsAskingAI] = useState(false)

  // URL Deep-linking for Dispenser QR Codes
  const [activeModalFlavor, setActiveModalFlavor] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const flavorId = params.get('flavor')
    if (flavorId) {
      const match = flavors.find(f => f.id === flavorId)
      if (match) {
        setActiveModalFlavor(match)
        setCurrentView('shop')
      }
    }
  }, [])

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Auto-advance order status for interactive Sunday morning demo
  useEffect(() => {
    if (orderStatus === 'ordered') {
      const timer1 = setTimeout(() => setOrderStatus('brewing'), 4000)
      return () => clearTimeout(timer1)
    } else if (orderStatus === 'brewing') {
      const timer2 = setTimeout(() => setOrderStatus('pickup'), 6000)
      return () => clearTimeout(timer2)
    }
  }, [orderStatus])

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }


  // Armadillo attitude quotes
  const armadilloQuotes = [
    "Don't touch my fermentation tanks or you'll get the boot.",
    "Tell your nasty kids to keep their sticky hands off my screen!",
    "Erands to run? Grab a bottle, hit the trail, and keep moving.",
    "Mueller Market Booth #12 is open. Bring your own cup or get lost.",
    "Eyeliner is smudged because of all these sticky fingers."
  ]
  const [currentQuote, setCurrentQuote] = useState(armadilloQuotes[0])

  const rotateQuote = () => {
    const nextIdx = (armadilloQuotes.indexOf(currentQuote) + 1) % armadilloQuotes.length
    setCurrentQuote(armadilloQuotes[nextIdx])
  }

  const addToCart = (flavorId) => {
    setCart(prev => ({
      ...prev,
      [flavorId]: (prev[flavorId] || 0) + 1
    }))
  }

  const clearCart = () => setCart({})

  const placeOrder = async () => {
    if (Object.keys(cart).length === 0) return
    setIsPaying(true)
    try {
      // Simulate payment processing at Sunday Market
      const totalAmount = Object.entries(cart).reduce((sum, [id, qty]) => {
        const item = flavors.find(f => f.id === id)
        const price = parseFloat(item ? item.price.replace('$', '') : '0')
        return sum + (price * qty)
      }, 0)
      
      await ApiService.createPaymentIntent(totalAmount * 100) // cents
      setOrderStatus('ordered')
    } catch (err) {
      console.error("Payment failed:", err)
      alert("Payment processor error. Check network and try again.")
    } finally {
      setIsPaying(false)
    }
  }

  const resetOrder = () => {
    setOrderStatus(null)
    setCart({})
  }

  // Hidden double tap trigger for Admin Dashboard
  let logoTapCount = 0
  const handleLogoClick = () => {
    logoTapCount += 1
    if (logoTapCount === 5) {
      setIsAdminMode(prev => !prev)
      setCurrentView(prev => prev === 'shop' ? 'admin-dashboard' : 'shop')
      logoTapCount = 0
    }
    setTimeout(() => { logoTapCount = 0 }, 2000)
  }

  // Backend Metric Data
  const metrics = [
    { label: 'API Calls', value: '12,847', icon: 'fa-bolt', color: 'cyan', sub: 'Last 24h' },
    { label: 'Active Users', value: '1,234', icon: 'fa-users', color: 'violet', sub: '+8.2% this week' },
    { label: 'Firestore Reads', value: '45.2K', icon: 'fa-database', color: 'amber', sub: '89% of quota' },
    { label: 'Uptime', value: '99.97%', icon: 'fa-shield-halved', color: 'emerald', sub: '30-day avg' },
  ]

  const apiKeys = [
    { name: 'Firebase', hint: 'AIza...x4Qm', icon: 'fa-fire', color: 'amber', status: 'active', badge: 'Active' },
    { name: 'OpenAI', hint: 'sk-...j9Kl', icon: 'fa-brain', color: 'violet', status: 'active', badge: 'Active' },
    { name: 'Stripe', hint: 'pk_live_...mN3p', icon: 'fa-credit-card', color: 'cyan', status: 'active', badge: 'Active' },
    { name: 'Google Maps', hint: 'AIza...yR7w', icon: 'fa-map-location-dot', color: 'emerald', status: 'warning', badge: 'Quota 89%' },
    { name: 'GitHub', hint: 'ghp_...zQ4v', icon: 'fa-code-branch', color: 'rose', status: 'inactive', badge: 'Not Set' },
    { name: 'Analytics', hint: 'G-...XK29', icon: 'fa-chart-line', color: 'cyan', status: 'active', badge: 'Active' },
  ]

  const firebaseServices = [
    { name: 'Authentication', icon: 'fa-lock', status: 'Online', metric: '1,234' },
    { name: 'Firestore', icon: 'fa-database', status: 'Online', metric: '45.2K' },
    { name: 'Storage', icon: 'fa-cloud', status: 'Online', metric: '2.1 GB' },
    { name: 'Hosting', icon: 'fa-globe', status: 'Deployed', metric: 'v1.0.0' },
    { name: 'Functions', icon: 'fa-code', status: 'Online', metric: '8 Active' },
    { name: 'Analytics', icon: 'fa-chart-pie', status: 'Tracking', metric: '3.2K' },
  ]

  const activityFeed = [
    { text: '<strong>Firebase Auth</strong> — New user registered via Google SSO', time: '2 min ago', color: 'var(--accent-emerald)' },
    { text: '<strong>API Gateway</strong> — Rate limit threshold at 85% capacity', time: '5 min ago', color: 'var(--accent-amber)' },
    { text: '<strong>Firestore</strong> — Collection "users" write batch completed', time: '12 min ago', color: 'var(--accent-cyan)' },
    { text: '<strong>Cloud Functions</strong> — onUserCreate trigger executed successfully', time: '18 min ago', color: 'var(--accent-violet)' },
    { text: '<strong>Hosting</strong> — Production deployment v1.0.0 live', time: '1 hr ago', color: 'var(--accent-emerald)' },
  ]

  return (
    <div className={`app-shell ${stickyHandsMode ? 'sticky-active' : ''}`}>
      {/* ── Header ──────────────────────────────────── */}
      <header className="titlebar">
        <div className="titlebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={handleLogoClick}>
          <img 
            src="/logo.png" 
            alt="KimBoocherly Logo" 
            style={{ width: '40px', height: '40px', borderRadius: '8px', border: '1px solid var(--accent-cyan)' }} 
          />
          <span className="logo-text">KIMBOOCHERLY</span>
        </div>

        {/* Consumer Options: Navigation & Sticky Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <nav className="nav-links" style={{ display: 'flex', gap: '8px' }}>
            <button
              className={`nav-link ${currentView === 'shop' ? 'active' : ''}`}
              onClick={() => setCurrentView('shop')}
            >
              <i className="fa-solid fa-store" style={{ marginRight: '5px' }} /> Shop
            </button>
            <button
              className={`nav-link ${currentView === 'qr-storage' ? 'active' : ''}`}
              onClick={() => setCurrentView('qr-storage')}
            >
              <i className="fa-solid fa-qrcode" style={{ marginRight: '5px' }} /> QR & Storage
            </button>
          </nav>

          <button 
            className={`btn btn-sm ${stickyHandsMode ? 'btn-primary' : 'btn-ghost'}`} 
            onClick={() => setStickyHandsMode(!stickyHandsMode)}
            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '20px' }}
          >
            <i className="fa-solid fa-hands-wash" /> {stickyHandsMode ? 'Sticky Hands Active' : 'Sticky Hands Mode'}
          </button>

          {isAdminMode && (
            <nav className="nav-links" style={{ display: 'flex', gap: '5px', borderLeft: '1px solid var(--border)', paddingLeft: '10px' }}>
              {['admin-dashboard', 'api-keys', 'firebase', 'activity'].map(view => (
                <button
                  key={view}
                  className={`nav-link ${currentView === view ? 'active' : ''}`}
                  onClick={() => setCurrentView(view)}
                  style={{ fontSize: '0.8rem' }}
                >
                  {view.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              ))}
            </nav>
          )}
        </div>

        <div className="header-actions">
          <div className="status-indicator">
            <div className="status-dot" />
            {formatTime(liveTime)}
          </div>
        </div>
      </header>

      {/* ── Main Content ────────────────────────────── */}
      <main className="main-content">

        {/* Emo Butch Comic Panel */}
        <div className="card animate-fade" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(88, 28, 36, 0.4) 0%, rgba(6, 182, 212, 0.1) 100%)', border: '1px solid var(--accent-cyan)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <img 
                src="/logo.png" 
                alt="Armadillo Mascot" 
                style={{ width: stickyHandsMode ? '120px' : '90px', height: stickyHandsMode ? '120px' : '90px', borderRadius: '50%', border: '3px solid var(--accent-cyan)', boxShadow: '0 0 15px var(--accent-cyan)' }}
              />
              <span style={{ position: 'absolute', bottom: '-5px', right: '-5px', background: '#000', border: '1px solid var(--accent-cyan)', borderRadius: '4px', padding: '1px 6px', fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>TEXAS BUTCH</span>
            </div>
            <div style={{ flex: '1', minWidth: '250px' }}>
              <div style={{ position: 'relative', background: '#09090b', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', color: '#fff', fontSize: stickyHandsMode ? '1.1rem' : '0.9rem', marginBottom: '0.5rem' }}>
                <div style={{ position: 'absolute', left: '-10px', top: '50%', transform: 'translateY(-50%) rotate(45deg)', width: '16px', height: '16px', background: '#09090b', borderLeft: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}></div>
                <p style={{ position: 'relative', zIndex: '1', fontStyle: 'italic', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>
                  " {currentQuote} "
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                <button className="btn btn-sm btn-ghost" onClick={rotateQuote} style={{ padding: stickyHandsMode ? '10px 20px' : '', fontSize: stickyHandsMode ? '1rem' : '' }}>
                  <i className="fa-solid fa-sync" /> Pester
                </button>
                
                <input 
                  type="text" 
                  value={chatText} 
                  onChange={(e) => setChatText(e.target.value)} 
                  placeholder={isAskingAI ? "Armadillo thinking..." : "Talk to Armadillo..."}
                  disabled={isAskingAI}
                  style={{ 
                    flex: '1', 
                    background: '#000', 
                    border: '1px solid var(--border)', 
                    borderRadius: '20px', 
                    padding: '0.5rem 1rem', 
                    color: '#fff', 
                    fontSize: '0.85rem' 
                  }}
                />
                
                <button 
                  className="btn btn-sm btn-primary" 
                  disabled={isAskingAI || !chatText.trim()}
                  style={{ padding: stickyHandsMode ? '10px 20px' : '', fontSize: stickyHandsMode ? '1rem' : '' }}
                  onClick={async () => {
                    setIsAskingAI(true)
                    try {
                      const aiReply = await ApiService.askArmadilloAI(chatText)
                      setCurrentQuote(aiReply)
                      setChatText('')
                    } catch (err) {
                      console.error("OpenAI failed:", err)
                      alert("Armadillo grunts: Add your VITE_OPENAI_API_KEY to the .env file to chat!")
                    } finally {
                      setIsAskingAI(false)
                    }
                  }}
                >
                  {isAskingAI ? "Typing..." : "Send"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Consumer View */}
        {currentView === 'shop' && (
          <div className="animate-fade">
            
            {/* Active Order Tracker */}
            {orderStatus && (
              <div className="card" style={{ marginBottom: '1.5rem', border: '1px solid var(--accent-emerald)', padding: '1.5rem' }}>
                <h3 style={{ fontSize: stickyHandsMode ? '1.4rem' : '1.1rem', color: 'var(--accent-emerald)', marginBottom: '1rem' }}>
                  <i className="fa-solid fa-truck-ramp-box" /> Mueller Market Pickup Tracker
                </h3>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1.5rem 0', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '10%', right: '10%', top: '50%', height: '2px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }}></div>
                  <div style={{ position: 'absolute', left: '10%', width: orderStatus === 'brewing' ? '40%' : orderStatus === 'pickup' ? '80%' : '0%', top: '50%', height: '2px', background: 'var(--accent-emerald)', zIndex: 0, transition: 'width 0.5s ease' }}></div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                    <div style={{ width: stickyHandsMode ? '40px' : '30px', height: stickyHandsMode ? '40px' : '30px', borderRadius: '50%', background: 'var(--accent-emerald)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>1</div>
                    <span style={{ fontSize: '0.75rem', marginTop: '5px', color: '#fff' }}>Ordered</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                    <div style={{ width: stickyHandsMode ? '40px' : '30px', height: stickyHandsMode ? '40px' : '30px', borderRadius: '50%', background: (orderStatus === 'brewing' || orderStatus === 'pickup') ? 'var(--accent-emerald)' : '#1e293b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>2</div>
                    <span style={{ fontSize: '0.75rem', marginTop: '5px', color: (orderStatus === 'brewing' || orderStatus === 'pickup') ? '#fff' : 'var(--text-muted)' }}>Preparing</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                    <div style={{ width: stickyHandsMode ? '40px' : '30px', height: stickyHandsMode ? '40px' : '30px', borderRadius: '50%', background: orderStatus === 'pickup' ? 'var(--accent-emerald)' : '#1e293b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>3</div>
                    <span style={{ fontSize: '0.75rem', marginTop: '5px', color: orderStatus === 'pickup' ? '#fff' : 'var(--text-muted)' }}>Ready!</span>
                  </div>
                </div>

                {orderStatus === 'pickup' ? (
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '8px', textAlign: 'center', marginBottom: '1rem' }}>
                    <p style={{ color: 'var(--accent-emerald)', fontWeight: 'bold', fontSize: stickyHandsMode ? '1.2rem' : '1rem' }}>
                      🎉 Ready for Pickup! Head to Mueller Market Booth #12
                    </p>
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Auto-updating progress... (no refresh needed)
                  </p>
                )}

                <button className="btn btn-ghost" style={{ width: '100%', padding: '0.75rem' }} onClick={resetOrder}>
                  Start New Order
                </button>
              </div>
            )}

            {/* Flavor Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.2rem' }}>
              {flavors.map(flavor => {
                const count = cart[flavor.id] || 0
                return (
                  <div key={flavor.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: stickyHandsMode ? '2rem' : '1.5rem', borderLeft: `4px solid var(--accent-${flavor.color})` }}>
                    <div style={{ flex: '1', paddingRight: '1rem' }}>
                      <h4 style={{ fontSize: stickyHandsMode ? '1.5rem' : '1.1rem', color: '#fff', marginBottom: '0.25rem' }}>{flavor.name}</h4>
                      <p style={{ fontSize: stickyHandsMode ? '1rem' : '0.85rem', color: 'var(--text-secondary)' }}>{flavor.desc}</p>
                      <span style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: stickyHandsMode ? '1.2rem' : '1rem', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{flavor.price}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {count > 0 && (
                        <span style={{ fontSize: stickyHandsMode ? '1.3rem' : '1.1rem', fontWeight: 'bold', color: 'var(--accent-cyan)', background: 'rgba(0, 210, 255, 0.1)', padding: '4px 12px', borderRadius: '20px' }}>
                          {count}
                        </span>
                      )}
                      <button 
                        className="btn btn-primary" 
                        onClick={() => addToCart(flavor.id)}
                        style={{ 
                          padding: stickyHandsMode ? '1.25rem 2rem' : '0.75rem 1.25rem', 
                          fontSize: stickyHandsMode ? '1.2rem' : '0.85rem', 
                          borderRadius: '30px' 
                        }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Checkout Area */}
            {Object.keys(cart).length > 0 && !orderStatus && (
              <div className="card animate-slide" style={{ marginTop: '2rem', border: '1px solid var(--accent-cyan)' }}>
                <h4 style={{ color: '#fff', marginBottom: '1rem', fontSize: stickyHandsMode ? '1.3rem' : '1.1rem' }}>Checkout & Pay</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span>Total Items:</span>
                  <span style={{ fontWeight: 'bold' }}>{Object.values(cart).reduce((a, b) => a + b, 0)}</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-ghost" onClick={clearCart} style={{ flex: '1', padding: stickyHandsMode ? '1rem' : '' }}>Clear</button>
                  <button className="btn btn-primary" onClick={placeOrder} style={{ flex: '2', padding: stickyHandsMode ? '1rem' : '' }}>Pay & Order</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* QR & Storage View */}
        {currentView === 'qr-storage' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Split layout for QR Generator and Excess Capacity Sales */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
              
              {/* QR Section */}
              <div className="card" style={{ border: '1px solid var(--accent-cyan)' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--accent-cyan)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fa-solid fa-qrcode" /> Sunday Market Quick QR Generator
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Generate custom check-in codes for pickup orders, table service, or booth check-ins at the marketplace.
                </p>

                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1', minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Preset Quick-Codes</label>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button 
                          className="btn btn-sm btn-ghost" 
                          onClick={() => {
                            setCustomQrText("KIMBOOCHERLY-BOOTH12-CHECKIN")
                            setGeneratedQr("KIMBOOCHERLY-BOOTH12-CHECKIN")
                          }}
                        >
                          Booth #12 Check-in
                        </button>
                        <button 
                          className="btn btn-sm btn-ghost"
                          onClick={() => {
                            setCustomQrText("KIMBOOCHERLY-MENU-ONLINE")
                            setGeneratedQr("https://kimboocherly-app.web.app/")
                          }}
                        >
                          Booch Menu Link
                        </button>
                        <button 
                          className="btn btn-sm btn-ghost"
                          onClick={() => {
                            setCustomQrText("EXCESS-STORAGE-PASS-4")
                            setGeneratedQr("EXCESS-STORAGE-PASS-4")
                          }}
                        >
                          Locker #4 Pass
                        </button>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Custom Text or URL</label>
                      <textarea
                        value={customQrText}
                        onChange={(e) => setCustomQrText(e.target.value)}
                        placeholder="Enter URL, order ID, or custom text..."
                        rows="3"
                        style={{
                          width: '100%',
                          background: '#000',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          padding: '0.75rem',
                          color: '#fff',
                          fontSize: '0.85rem',
                          fontFamily: 'var(--font-mono)'
                        }}
                      />
                    </div>

                    <button 
                      className="btn btn-primary"
                      onClick={() => setGeneratedQr(customQrText || 'https://kimboocherly-app.web.app/')}
                    >
                      Generate QR Code
                    </button>
                  </div>

                  <div style={{ width: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid var(--border)', padding: '1rem', margin: '0 auto' }}>
                    {generatedQr ? (
                      <>
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=06b6d4&bgcolor=09090b&data=${encodeURIComponent(generatedQr)}`}
                          alt="Generated QR Code"
                          style={{ width: '160px', height: '160px', borderRadius: '4px', border: '2px solid var(--accent-cyan)' }}
                        />
                        <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', wordBreak: 'break-all', textAlign: 'center', maxWidth: '160px' }}>
                          Value: <code>{generatedQr.length > 25 ? generatedQr.substring(0, 22) + '...' : generatedQr}</code>
                        </div>
                      </>
                    ) : (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                        Input data to generate live QR
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Excess Capacity / Storage Section */}
              <div className="card" style={{ border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--accent-violet)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fa-solid fa-boxes-packing" /> Excess Storage & Equipment Rentals
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Book excess cold storage, fermentation capacity, or secure vendor lockers. Rent capacity by the night or weekend.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  {storageItems.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '8px', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ flex: '1', minWidth: '200px' }}>
                        <h4 style={{ fontSize: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.25rem' }}>
                          <i className={`fa-solid ${item.icon}`} style={{ color: `var(--accent-${item.color})` }} />
                          {item.name}
                        </h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.desc}</p>
                        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '15px', fontSize: '0.8rem' }}>
                          <span style={{ color: 'var(--accent-cyan)' }}>Rate: <strong>${item.price}</strong></span>
                          <span style={{ color: 'var(--text-muted)' }}>Available: <strong>{item.available} {item.unit}</strong></span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#000', border: '1px solid var(--border)', borderRadius: '20px', padding: '2px 8px' }}>
                          <button 
                            className="btn btn-sm btn-ghost" 
                            style={{ padding: '0.25rem 0.5rem', minWidth: '24px' }}
                            onClick={() => setBookingQty(prev => ({ ...prev, [item.id]: Math.max(1, prev[item.id] - 1) }))}
                          >
                            -
                          </button>
                          <span style={{ width: '30px', textAlign: 'center', fontSize: '0.85rem' }}>{bookingQty[item.id]}</span>
                          <button 
                            className="btn btn-sm btn-ghost"
                            style={{ padding: '0.25rem 0.5rem', minWidth: '24px' }}
                            onClick={() => setBookingQty(prev => ({ ...prev, [item.id]: Math.min(item.available, prev[item.id] + 1) }))}
                          >
                            +
                          </button>
                        </div>

                        <button 
                          className="btn btn-primary"
                          onClick={() => {
                            const qty = bookingQty[item.id]
                            if (qty > item.available) return
                            
                            // Deduct from local availability
                            setStorageItems(prev => prev.map(s => s.id === item.id ? { ...s, available: s.available - qty } : s))
                            
                            // Add booking
                            const newBooking = {
                              id: `KB-SR-${Math.floor(1000 + Math.random() * 9000)}`,
                              itemName: item.name,
                              qty,
                              unit: item.unit,
                              totalPrice: qty * item.price,
                              timestamp: new Date().toLocaleString()
                            }
                            setBookings(prev => [newBooking, ...prev])
                            
                            // Automatically generate check-in QR for the new booking
                            setGeneratedQr(JSON.stringify({ bookingId: newBooking.id, item: newBooking.itemName, qty: newBooking.qty }))
                          }}
                        >
                          Reserve Space
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bookings Tracker */}
            {bookings.length > 0 && (
              <div className="card animate-slide" style={{ border: '1px solid var(--accent-emerald)' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-emerald)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-receipt" /> Active Excess Storage Bookings
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                  {bookings.map(b => (
                    <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '8px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: 'bold' }}>{b.id}</span>
                        <h4 style={{ fontSize: '0.95rem', margin: '2px 0' }}>{b.itemName}</h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Qty: {b.qty} {b.unit} | Reserved on: {b.timestamp}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontWeight: 'bold', color: '#fff' }}>${b.totalPrice}</span>
                        <button 
                          className="btn btn-sm btn-ghost"
                          onClick={() => setGeneratedQr(JSON.stringify({ bookingId: b.id, item: b.itemName, qty: b.qty }))}
                        >
                          <i className="fa-solid fa-qrcode" style={{ marginRight: '5px' }} /> View QR
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Back-end Admin Views (Hidden by default, unlocked by tapping logo 5x) */}
        {currentView === 'admin-dashboard' && (
          <div className="animate-fade">
            <div className="metric-row stagger">
              {metrics.map((m, i) => (
                <div className="metric-card" key={i}>
                  <div className="metric-label">
                    <i className={`fa-solid ${m.icon}`} style={{ color: `var(--accent-${m.color})` }} />
                    {m.label}
                  </div>
                  <div className="metric-value">{m.value}</div>
                  <div className="metric-sub">{m.sub}</div>
                </div>
              ))}
            </div>
            
            <div className="dashboard-grid stagger">
              <div className="card">
                <div className="card-header">
                  <span className="card-title">API Health</span>
                  <div className="card-icon cyan"><i className="fa-solid fa-heartbeat" /></div>
                </div>
                <div className="card-value">98.5%</div>
              </div>
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Firebase Status</span>
                  <div className="card-icon amber"><i className="fa-solid fa-fire" /></div>
                </div>
                <div className="card-value">Online</div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'api-keys' && (
          <div className="animate-fade">
            <div className="api-panel">
              <div className="api-panel-header">
                <div className="api-panel-title">
                  <i className="fa-solid fa-key" />
                  API Key Management
                </div>
              </div>
              {apiKeys.map((key, i) => (
                <div className="api-key-row" key={i}>
                  <div className="api-key-info">
                    <div className={`api-key-icon card-icon ${key.color}`}>
                      <i className={`fa-solid ${key.icon}`} />
                    </div>
                    <div>
                      <div className="api-key-name">{key.name}</div>
                      <div className="api-key-hint">{key.hint}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'firebase' && (
          <div className="animate-fade">
            <div className="firebase-panel">
              <div className="firebase-header">
                <i className="fa-solid fa-fire" />
                <h3>Firebase Services</h3>
              </div>
              <div className="firebase-services">
                {firebaseServices.map((svc, i) => (
                  <div className="firebase-service" key={i}>
                    <div className="firebase-service-name">{svc.name}</div>
                    <div className="firebase-service-status">{svc.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentView === 'activity' && (
          <div className="animate-fade">
            <div className="card">
              <div className="activity-feed">
                {activityFeed.map((item, i) => (
                  <div className="activity-item" key={i}>
                    <div className="activity-dot" style={{ background: item.color }} />
                    <div className="activity-text" dangerouslySetInnerHTML={{ __html: item.text }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ── Footer / Code Link ──────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '1rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <a 
          href="file:///c:/Users/freem/Documents/KimBoocherly/src/App.jsx" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 'bold' }}
        >
          <i className="fa-solid fa-code" style={{ marginRight: '5px' }} /> View App Source Code
        </a>
      </footer>

      {/* Dispenser QR Detail Modal */}
      {activeModalFlavor && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.5rem',
        }}>
          <div className="card animate-slide" style={{
            maxWidth: '500px',
            width: '100%',
            border: `2px solid var(--accent-${activeModalFlavor.color})`,
            boxShadow: `0 0 25px var(--accent-${activeModalFlavor.color})`,
            position: 'relative',
            padding: '2rem'
          }}>
            <button 
              onClick={() => setActiveModalFlavor(null)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              <i className="fa-solid fa-xmark" />
            </button>

            <span style={{
              background: `var(--accent-${activeModalFlavor.color})`,
              color: '#000',
              fontWeight: 'bold',
              fontSize: '0.75rem',
              padding: '4px 10px',
              borderRadius: '20px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Draft Dispenser Tap
            </span>

            <h2 style={{ fontSize: '2rem', color: '#fff', margin: '0.75rem 0 0.5rem 0' }}>
              {activeModalFlavor.name}
            </h2>
            
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
              "{activeModalFlavor.desc}"
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '0.8rem', color: `var(--accent-${activeModalFlavor.color})`, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  <i className="fa-solid fa-seedling" style={{ marginRight: '5px' }} /> Ingredients
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#fff', lineHeight: '1.4' }}>
                  {activeModalFlavor.ingredients}
                </p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '0.8rem', color: `var(--accent-${activeModalFlavor.color})`, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  <i className="fa-solid fa-comment-dots" style={{ marginRight: '5px' }} /> Tasting Notes
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#fff', lineHeight: '1.4' }}>
                  {activeModalFlavor.tastingNotes}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0, 210, 255, 0.05)', padding: '12px 15px', borderRadius: '8px', border: '1px solid var(--accent-cyan)' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 'bold' }}>Single Serving</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Perfect for drinking now</div>
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    addToCart(activeModalFlavor.id)
                    setActiveModalFlavor(null)
                  }}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  Add Cup ({activeModalFlavor.price})
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(139, 92, 246, 0.05)', padding: '12px 15px', borderRadius: '8px', border: '1px solid var(--accent-violet)' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 'bold' }}>Market Bundle Deal</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{activeModalFlavor.bundleDesc}</div>
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    // Add 3 to cart
                    setCart(prev => ({
                      ...prev,
                      [activeModalFlavor.id]: (prev[activeModalFlavor.id] || 0) + 3
                    }))
                    setActiveModalFlavor(null)
                  }}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', background: 'var(--accent-violet)', border: 'none' }}
                >
                  Add Bundle ({activeModalFlavor.bundlePrice})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
