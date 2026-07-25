import { useState, useEffect } from 'react'
import ApiService from './config/api'
import menuData from './data/menu_and_inventory.json'
import './index.css'

// ══════════════════════════════════════════════════════════════
// KIMBOOCHERLY — Sunday Market Quick-Pickup & Order App
// Modeled after Sovereign Nexus / jacobdev webapp architecture
// ══════════════════════════════════════════════════════════════

const flavors = menuData.flavors

function App() {
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [currentView, setCurrentView] = useState('shop') // 'shop' | 'qr-storage' | 'admin-dashboard' | 'api-keys' | 'firebase' | 'activity'
  const [stickyHandsMode, setStickyHandsMode] = useState(false)
  const [liveTime, setLiveTime] = useState(new Date())
  
  // Cart & Order State
  const [cart, setCart] = useState({})
  const [orderStatus, setOrderStatus] = useState(null) // null | 'ordered' | 'brewing' | 'pickup'
  const [isPaying, setIsPaying] = useState(false)
  const [lastOrderDetails, setLastOrderDetails] = useState(null)

  // Storage booking states
  const [storageItems, setStorageItems] = useState(menuData.storageItems)
  const [bookingQty, setBookingQty] = useState({ 'tank-a': 1, 'cold-room': 1, 'booth-locker': 1, 'trailer-slot': 1 })
  const [bookings, setBookings] = useState([])
  const [customQrText, setCustomQrText] = useState('')
  const [generatedQr, setGeneratedQr] = useState('https://kimboocherly-app.web.app/')

  // Mascot Chat State
  const [chatText, setChatText] = useState('')
  const [isAskingAI, setIsAskingAI] = useState(false)

  // Modal State for Tap Details
  const [activeModalFlavor, setActiveModalFlavor] = useState(null)

  // Deep-linking URL check
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

  // Order status progression simulation
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
    "Errands to run? Grab a bottle, hit the trail, and keep moving.",
    "Mueller Market Booth #12 is open. Bring your own cup or get lost.",
    "Eyeliner is smudged because of all these sticky fingers."
  ]
  const [currentQuote, setCurrentQuote] = useState(armadilloQuotes[0])

  const rotateQuote = () => {
    const nextIdx = (armadilloQuotes.indexOf(currentQuote) + 1) % armadilloQuotes.length
    setCurrentQuote(armadilloQuotes[nextIdx])
  }

  const addToCart = (flavorId, qty = 1) => {
    setCart(prev => ({
      ...prev,
      [flavorId]: (prev[flavorId] || 0) + qty
    }))
  }

  const removeFromCart = (flavorId) => {
    setCart(prev => {
      const updated = { ...prev }
      if (updated[flavorId] > 1) {
        updated[flavorId] -= 1
      } else {
        delete updated[flavorId]
      }
      return updated
    })
  }

  const clearCart = () => setCart({})

  const calculateCartTotal = () => {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const item = flavors.find(f => f.id === id)
      const price = item ? item.rawPrice : 0
      return sum + (price * qty)
    }, 0)
  }

  const placeOrder = async () => {
    if (Object.keys(cart).length === 0) return
    setIsPaying(true)
    try {
      const total = calculateCartTotal()
      await ApiService.createPaymentIntent(Math.round(total * 100))
      
      const orderId = `KB-${Math.floor(100000 + Math.random() * 900000)}`
      setLastOrderDetails({
        id: orderId,
        items: { ...cart },
        total: total.toFixed(2),
        timestamp: new Date().toLocaleTimeString()
      })
      setOrderStatus('ordered')
    } catch (err) {
      console.error("Payment failed:", err)
      alert("Payment processor simulation error. Check network and try again.")
    } finally {
      setIsPaying(false)
    }
  }

  const resetOrder = () => {
    setOrderStatus(null)
    setCart({})
    setLastOrderDetails(null)
  }

  // Hidden 5-tap trigger for Admin Mode
  let logoTapCount = 0
  const handleLogoClick = () => {
    logoTapCount += 1
    if (logoTapCount >= 5) {
      setIsAdminMode(prev => !prev)
      setCurrentView(prev => prev === 'shop' ? 'admin-dashboard' : 'shop')
      logoTapCount = 0
    }
    setTimeout(() => { logoTapCount = 0 }, 2000)
  }

  // Dashboard metric data
  const metrics = [
    { label: 'API Calls', value: '14,290', icon: 'fa-bolt', color: 'cyan', sub: 'Last 24h' },
    { label: 'Active Users', value: '1,482', icon: 'fa-users', color: 'violet', sub: '+12.4% this week' },
    { label: 'Firestore Reads', value: '48.9K', icon: 'fa-database', color: 'amber', sub: '78% of quota' },
    { label: 'Uptime', value: '99.98%', icon: 'fa-shield-halved', color: 'emerald', sub: '30-day avg' },
  ]

  const apiKeys = [
    { name: 'Firebase', hint: 'AIza...x4Qm', icon: 'fa-fire', color: 'amber', badge: 'Active' },
    { name: 'OpenAI', hint: 'sk-...j9Kl', icon: 'fa-brain', color: 'violet', badge: 'Active' },
    { name: 'Stripe', hint: 'pk_live_...mN3p', icon: 'fa-credit-card', color: 'cyan', badge: 'Active' },
    { name: 'Google Maps', hint: 'AIza...yR7w', icon: 'fa-map-location-dot', color: 'emerald', badge: 'Quota 89%' },
    { name: 'Analytics', hint: 'G-...XK29', icon: 'fa-chart-line', color: 'cyan', badge: 'Active' },
  ]

  const firebaseServices = [
    { name: 'Authentication', icon: 'fa-lock', status: 'Online', metric: '1,482 Users' },
    { name: 'Firestore', icon: 'fa-database', status: 'Online', metric: '48.9K Operations' },
    { name: 'Storage', icon: 'fa-cloud', status: 'Online', metric: '3.4 GB Storage' },
    { name: 'Hosting', icon: 'fa-globe', status: 'Deployed', metric: 'v1.2.0 Live' },
  ]

  const activityFeed = [
    { text: '<strong>Sunday Pickup Order</strong> — Order KB-892401 placed ($16.50)', time: '1 min ago', color: 'var(--accent-emerald)' },
    { text: '<strong>Firebase Auth</strong> — New user checked in at Booth #12', time: '4 min ago', color: 'var(--accent-cyan)' },
    { text: '<strong>Excess Storage</strong> — Vendor reserved 15 Gallons Fermentation Space', time: '10 min ago', color: 'var(--accent-violet)' },
    { text: '<strong>Armadillo Mascot AI</strong> — User asked about live booth location', time: '18 min ago', color: 'var(--accent-amber)' },
  ]

  return (
    <div className={`app-shell ${stickyHandsMode ? 'sticky-active' : ''}`}>
      {/* ── Titlebar Header ──────────────────────────── */}
      <header className="titlebar">
        <div className="titlebar-logo" onClick={handleLogoClick}>
          <img 
            src="/logo.png" 
            alt="KimBoocherly Mascot Logo" 
            style={{ width: '42px', height: '42px', borderRadius: '10px', border: '1px solid var(--accent-cyan)', boxShadow: '0 0 10px rgba(0, 210, 255, 0.3)' }} 
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="logo-text">KIMBOOCHERLY</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>MUELLER SUNDAY MARKET</span>
          </div>
        </div>

        {/* Navigation & Sticky Hands Mode Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <nav className="nav-links">
            <button
              className={`nav-link ${currentView === 'shop' ? 'active' : ''}`}
              onClick={() => setCurrentView('shop')}
            >
              <i className="fa-solid fa-store" /> Market Shop
            </button>
            <button
              className={`nav-link ${currentView === 'qr-storage' ? 'active' : ''}`}
              onClick={() => setCurrentView('qr-storage')}
            >
              <i className="fa-solid fa-qrcode" /> QR & Storage
            </button>
          </nav>

          <button 
            className={`btn btn-sm ${stickyHandsMode ? 'btn-primary' : 'btn-ghost'}`} 
            onClick={() => setStickyHandsMode(!stickyHandsMode)}
            title="Toggle large touch controls for messy market hands"
          >
            <i className="fa-solid fa-hands-wash" /> {stickyHandsMode ? 'Sticky Mode ON' : 'Sticky Mode'}
          </button>

          {isAdminMode && (
            <nav className="nav-links" style={{ borderLeft: '1px solid var(--border)', paddingLeft: '8px' }}>
              {['admin-dashboard', 'api-keys', 'firebase', 'activity'].map(view => (
                <button
                  key={view}
                  className={`nav-link ${currentView === view ? 'active' : ''}`}
                  onClick={() => setCurrentView(view)}
                  style={{ fontSize: '0.78rem' }}
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

      {/* ── Main Content Area ────────────────────────── */}
      <main className="main-content">

        {/* Armadillo Mascot Banner */}
        <div className="card animate-fade" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(88, 28, 36, 0.45) 0%, rgba(6, 182, 212, 0.15) 100%)', border: '1px solid var(--accent-cyan)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <img 
                src="/logo.png" 
                alt="Texas Butch Mascot" 
                style={{ 
                  width: stickyHandsMode ? '130px' : '95px', 
                  height: stickyHandsMode ? '130px' : '95px', 
                  borderRadius: '50%', 
                  border: '3px solid var(--accent-cyan)', 
                  boxShadow: '0 0 20px var(--accent-cyan)' 
                }}
              />
              <span style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: '#060a12', border: '1px solid var(--accent-cyan)', borderRadius: '6px', padding: '2px 8px', fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: '800' }}>
                TEXAS BUTCH
              </span>
            </div>
            <div style={{ flex: '1', minWidth: '260px' }}>
              <div style={{ position: 'relative', background: '#0a0f1a', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.1rem', color: '#fff', fontSize: stickyHandsMode ? '1.15rem' : '0.92rem', marginBottom: '0.6rem' }}>
                <p style={{ fontStyle: 'italic', color: 'var(--accent-cyan)', fontWeight: '700' }}>
                  "{currentQuote}"
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button className="btn btn-sm btn-ghost" onClick={rotateQuote}>
                  <i className="fa-solid fa-sync" /> Pester Armadillo
                </button>

                <div style={{ flex: '1', display: 'flex', gap: '8px', minWidth: '220px' }}>
                  <input 
                    type="text" 
                    value={chatText} 
                    onChange={(e) => setChatText(e.target.value)} 
                    placeholder={isAskingAI ? "Armadillo thinking..." : "Talk to Texas Butch..."}
                    disabled={isAskingAI}
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter' && chatText.trim() && !isAskingAI) {
                        setIsAskingAI(true)
                        try {
                          const reply = await ApiService.askArmadilloAI(chatText)
                          setCurrentQuote(reply)
                          setChatText('')
                        } catch {
                          setCurrentQuote("Armadillo grunts: Add your VITE_OPENAI_API_KEY to .env to enable live AI responses!")
                        } finally {
                          setIsAskingAI(false)
                        }
                      }
                    }}
                    style={{ 
                      flex: '1', 
                      background: '#060a12', 
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
                    onClick={async () => {
                      setIsAskingAI(true)
                      try {
                        const reply = await ApiService.askArmadilloAI(chatText)
                        setCurrentQuote(reply)
                        setChatText('')
                      } catch {
                        setCurrentQuote("Armadillo grunts: Add your VITE_OPENAI_API_KEY to .env to chat!")
                      } finally {
                        setIsAskingAI(false)
                      }
                    }}
                  >
                    {isAskingAI ? "..." : "Send"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Market Shop View */}
        {currentView === 'shop' && (
          <div className="animate-fade">
            
            {/* Live Order Tracker */}
            {orderStatus && (
              <div className="card" style={{ marginBottom: '1.75rem', border: '1px solid var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
                  <h3 style={{ fontSize: stickyHandsMode ? '1.4rem' : '1.15rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="fa-solid fa-truck-ramp-box" /> Mueller Market Pickup Tracker
                  </h3>
                  {lastOrderDetails && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      Order Ref: <strong style={{ color: '#fff' }}>{lastOrderDetails.id}</strong> (${lastOrderDetails.total})
                    </span>
                  )}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1.75rem 0', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '12%', right: '12%', top: '50%', height: '3px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }}></div>
                  <div style={{ position: 'absolute', left: '12%', width: orderStatus === 'brewing' ? '38%' : orderStatus === 'pickup' ? '76%' : '0%', top: '50%', height: '3px', background: 'var(--accent-emerald)', zIndex: 0, transition: 'width 0.6s ease' }}></div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                    <div style={{ width: stickyHandsMode ? '44px' : '34px', height: stickyHandsMode ? '44px' : '34px', borderRadius: '50%', background: 'var(--accent-emerald)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>1</div>
                    <span style={{ fontSize: '0.8rem', marginTop: '6px', color: '#fff', fontWeight: '600' }}>Ordered</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                    <div style={{ width: stickyHandsMode ? '44px' : '34px', height: stickyHandsMode ? '44px' : '34px', borderRadius: '50%', background: (orderStatus === 'brewing' || orderStatus === 'pickup') ? 'var(--accent-emerald)' : '#1e293b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>2</div>
                    <span style={{ fontSize: '0.8rem', marginTop: '6px', color: (orderStatus === 'brewing' || orderStatus === 'pickup') ? '#fff' : 'var(--text-muted)', fontWeight: '600' }}>Preparing</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                    <div style={{ width: stickyHandsMode ? '44px' : '34px', height: stickyHandsMode ? '44px' : '34px', borderRadius: '50%', background: orderStatus === 'pickup' ? 'var(--accent-emerald)' : '#1e293b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>3</div>
                    <span style={{ fontSize: '0.8rem', marginTop: '6px', color: orderStatus === 'pickup' ? '#fff' : 'var(--text-muted)', fontWeight: '600' }}>Ready!</span>
                  </div>
                </div>

                {orderStatus === 'pickup' ? (
                  <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1.2rem', borderRadius: '10px', textAlign: 'center', marginBottom: '1rem' }}>
                    <p style={{ color: 'var(--accent-emerald)', fontWeight: '800', fontSize: stickyHandsMode ? '1.25rem' : '1.05rem' }}>
                      🎉 Ready for Pickup! Head to Mueller Sunday Market Booth #12
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Show your name or order reference <strong>{lastOrderDetails?.id}</strong> at the counter.
                    </p>
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Auto-updating progress... Estimated prep time ~ 2-3 mins.
                  </p>
                )}

                <button className="btn btn-ghost" style={{ width: '100%', padding: '0.8rem' }} onClick={resetOrder}>
                  Start New Order
                </button>
              </div>
            )}

            {/* Flavor Cards List */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.2rem' }}>
              {flavors.map(flavor => {
                const count = cart[flavor.id] || 0
                return (
                  <div key={flavor.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: stickyHandsMode ? '2rem' : '1.5rem', borderLeft: `4px solid var(--accent-${flavor.color})` }}>
                    <div style={{ flex: '1', paddingRight: '1.2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.3rem' }}>
                        <h4 style={{ fontSize: stickyHandsMode ? '1.5rem' : '1.15rem', color: '#fff' }}>{flavor.name}</h4>
                        <button 
                          className="btn btn-sm btn-ghost"
                          onClick={() => setActiveModalFlavor(flavor)}
                          style={{ padding: '0.2rem 0.6rem', fontSize: '0.72rem', borderRadius: '12px' }}
                        >
                          <i className="fa-solid fa-circle-info" /> Details
                        </button>
                      </div>
                      <p style={{ fontSize: stickyHandsMode ? '1.05rem' : '0.88rem', color: 'var(--text-secondary)' }}>{flavor.desc}</p>
                      <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: stickyHandsMode ? '1.25rem' : '1.05rem', color: 'var(--accent-cyan)', fontWeight: '800' }}>{flavor.price} / cup</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--accent-violet)', fontStyle: 'italic' }}>{flavor.bundleDesc}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {count > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', background: '#060a12', border: '1px solid var(--border)', borderRadius: '20px', padding: '3px 8px' }}>
                          <button 
                            className="btn btn-sm btn-ghost" 
                            onClick={() => removeFromCart(flavor.id)}
                            style={{ padding: '0.2rem 0.6rem' }}
                          >
                            -
                          </button>
                          <span style={{ width: '28px', textAlign: 'center', fontWeight: '800', color: 'var(--accent-cyan)' }}>{count}</span>
                          <button 
                            className="btn btn-sm btn-ghost" 
                            onClick={() => addToCart(flavor.id)}
                            style={{ padding: '0.2rem 0.6rem' }}
                          >
                            +
                          </button>
                        </div>
                      )}
                      
                      <button 
                        className="btn btn-primary" 
                        onClick={() => addToCart(flavor.id)}
                      >
                        <i className="fa-solid fa-plus" /> Add to Order
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Checkout Area */}
            {Object.keys(cart).length > 0 && !orderStatus && (
              <div className="card animate-slide" style={{ marginTop: '2rem', border: '1px solid var(--accent-cyan)' }}>
                <h4 style={{ color: '#fff', marginBottom: '1rem', fontSize: stickyHandsMode ? '1.35rem' : '1.15rem' }}>
                  <i className="fa-solid fa-cart-shopping" style={{ marginRight: '8px', color: 'var(--accent-cyan)' }} />
                  Order Summary & Sunday Checkout
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  {Object.entries(cart).map(([id, qty]) => {
                    const flavor = flavors.find(f => f.id === id)
                    if (!flavor) return null
                    const itemTotal = (flavor.rawPrice * qty).toFixed(2)
                    return (
                      <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                        <span>{flavor.name} x {qty}</span>
                        <span style={{ fontWeight: '700', color: '#fff' }}>${itemTotal}</span>
                      </div>
                    )
                  })}
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '1.1rem', color: 'var(--accent-cyan)' }}>
                    <span>Estimated Total:</span>
                    <span>${calculateCartTotal().toFixed(2)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn btn-ghost" onClick={clearCart} style={{ flex: '1' }}>Clear</button>
                  <button className="btn btn-primary" onClick={placeOrder} disabled={isPaying} style={{ flex: '2' }}>
                    {isPaying ? "Processing Payment..." : "Pay & Send to Booth #12"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* QR & Excess Capacity Storage View */}
        {currentView === 'qr-storage' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.75rem' }}>
              
              {/* QR Code Generator */}
              <div className="card" style={{ border: '1px solid var(--accent-cyan)' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--accent-cyan)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fa-solid fa-qrcode" /> Sunday Market Kiosk QR Code Generator
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Generate custom quick-codes for Sunday market pickups, vendor storage passes, or menu links.
                </p>

                <div style={{ display: 'flex', gap: '1.75rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1', minWidth: '260px', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem', fontWeight: '700' }}>Preset Market Codes</label>
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
                            setCustomQrText("EXCESS-STORAGE-PASS-COLD-ROOM")
                            setGeneratedQr("EXCESS-STORAGE-PASS-COLD-ROOM")
                          }}
                        >
                          Cold Room Locker Pass
                        </button>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem', fontWeight: '700' }}>Custom URL or Text</label>
                      <textarea
                        value={customQrText}
                        onChange={(e) => setCustomQrText(e.target.value)}
                        placeholder="Enter URL, receipt ID, or custom text..."
                        rows="3"
                        style={{
                          width: '100%',
                          background: '#060a12',
                          border: '1px solid var(--border)',
                          borderRadius: '10px',
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
                      <i className="fa-solid fa-bolt" /> Render Live QR Code
                    </button>
                  </div>

                  <div style={{ width: '230px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', borderRadius: '14px', border: '1px solid var(--border)', padding: '1.25rem', margin: '0 auto' }}>
                    {generatedQr ? (
                      <>
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=170x170&color=00d2ff&bgcolor=0a0f1a&data=${encodeURIComponent(generatedQr)}`}
                          alt="Generated QR Code"
                          style={{ width: '170px', height: '170px', borderRadius: '8px', border: '2px solid var(--accent-cyan)' }}
                        />
                        <div style={{ marginTop: '0.85rem', fontSize: '0.72rem', color: 'var(--text-muted)', wordBreak: 'break-all', textAlign: 'center', maxWidth: '170px', fontFamily: 'var(--font-mono)' }}>
                          Data: <code>{generatedQr.length > 25 ? generatedQr.substring(0, 22) + '...' : generatedQr}</code>
                        </div>
                      </>
                    ) : (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                        Input text above to render live QR
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Excess Capacity Rental */}
              <div className="card" style={{ border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--accent-violet)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fa-solid fa-boxes-packing" /> Vendor Excess Capacity & Storage Rentals
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Book unused cold storage, fermentation capacity, or secure vendor lockers for Sunday Market weekend operations.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {storageItems.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ flex: '1', minWidth: '220px' }}>
                        <h4 style={{ fontSize: '1.05rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.3rem' }}>
                          <i className={`fa-solid ${item.icon}`} style={{ color: `var(--accent-${item.color})` }} />
                          {item.name}
                        </h4>
                        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>{item.desc}</p>
                        <div style={{ marginTop: '0.6rem', display: 'flex', gap: '18px', fontSize: '0.82rem' }}>
                          <span style={{ color: 'var(--accent-cyan)' }}>Rate: <strong>${item.price} / unit</strong></span>
                          <span style={{ color: 'var(--text-muted)' }}>Available: <strong>{item.available} {item.unit}</strong></span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#060a12', border: '1px solid var(--border)', borderRadius: '20px', padding: '3px 8px' }}>
                          <button 
                            className="btn btn-sm btn-ghost" 
                            style={{ padding: '0.25rem 0.6rem' }}
                            onClick={() => setBookingQty(prev => ({ ...prev, [item.id]: Math.max(1, (prev[item.id] || 1) - 1) }))}
                          >
                            -
                          </button>
                          <span style={{ width: '32px', textAlign: 'center', fontSize: '0.88rem', fontWeight: '700' }}>{bookingQty[item.id] || 1}</span>
                          <button 
                            className="btn btn-sm btn-ghost"
                            style={{ padding: '0.25rem 0.6rem' }}
                            onClick={() => setBookingQty(prev => ({ ...prev, [item.id]: Math.min(item.available, (prev[item.id] || 1) + 1) }))}
                          >
                            +
                          </button>
                        </div>

                        <button 
                          className="btn btn-primary"
                          onClick={() => {
                            const qty = bookingQty[item.id] || 1
                            if (qty > item.available) return
                            
                            setStorageItems(prev => prev.map(s => s.id === item.id ? { ...s, available: s.available - qty } : s))
                            
                            const newBooking = {
                              id: `KB-SR-${Math.floor(1000 + Math.random() * 9000)}`,
                              itemName: item.name,
                              qty,
                              unit: item.unit,
                              totalPrice: qty * item.price,
                              timestamp: new Date().toLocaleString()
                            }
                            setBookings(prev => [newBooking, ...prev])
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

            {/* Active Storage Receipts */}
            {bookings.length > 0 && (
              <div className="card animate-slide" style={{ border: '1px solid var(--accent-emerald)' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--accent-emerald)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fa-solid fa-receipt" /> Active Vendor Storage Receipts
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                  {bookings.map(b => (
                    <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '1rem 1.25rem', borderRadius: '10px', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: '800', fontFamily: 'var(--font-mono)' }}>{b.id}</span>
                        <h4 style={{ fontSize: '0.98rem', margin: '2px 0', color: '#fff' }}>{b.itemName}</h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Qty: {b.qty} {b.unit} | Reserved: {b.timestamp}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontWeight: '800', color: '#fff', fontSize: '1.05rem' }}>${b.totalPrice}</span>
                        <button 
                          className="btn btn-sm btn-ghost"
                          onClick={() => setGeneratedQr(JSON.stringify({ bookingId: b.id, item: b.itemName, qty: b.qty }))}
                        >
                          <i className="fa-solid fa-qrcode" /> QR Receipt
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Back-end Admin Dashboard Views */}
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
                <div className="card-value">99.2%</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>All endpoints operational</p>
              </div>
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Firebase Realtime</span>
                  <div className="card-icon amber"><i className="fa-solid fa-fire" /></div>
                </div>
                <div className="card-value">Online</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)' }}>Firestore sync active</p>
              </div>
            </div>
          </div>
        )}

        {currentView === 'api-keys' && (
          <div className="animate-fade">
            <div className="api-panel">
              <div className="api-panel-header">
                <div className="api-panel-title">
                  <i className="fa-solid fa-key" /> API Integration Keys
                </div>
              </div>
              {apiKeys.map((key, i) => (
                <div className="api-key-row" key={i}>
                  <div className="api-key-info">
                    <div className={`card-icon ${key.color}`}>
                      <i className={`fa-solid ${key.icon}`} />
                    </div>
                    <div>
                      <div className="api-key-name">{key.name}</div>
                      <div className="api-key-hint">{key.hint}</div>
                    </div>
                  </div>
                  <span className={`api-badge ${key.badge.includes('Active') ? 'active' : 'warning'}`}>
                    {key.badge}
                  </span>
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
                <h3>Firebase Infrastructure Status</h3>
              </div>
              <div className="firebase-services">
                {firebaseServices.map((svc, i) => (
                  <div className="firebase-service" key={i}>
                    <div className="firebase-service-name">
                      <i className={`fa-solid ${svc.icon}`} style={{ color: 'var(--accent-amber)' }} />
                      {svc.name}
                    </div>
                    <div className="firebase-service-status">{svc.status}</div>
                    <div className="firebase-service-metric">{svc.metric}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentView === 'activity' && (
          <div className="animate-fade">
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '1rem' }}>Live Activity Stream</h3>
              <div className="activity-feed">
                {activityFeed.map((item, i) => (
                  <div className="activity-item" key={i}>
                    <div className="activity-dot" style={{ background: item.color }} />
                    <div>
                      <div className="activity-text" dangerouslySetInnerHTML={{ __html: item.text }} />
                      <div className="activity-time">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '1.25rem', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
        KimBoocherly &copy; {new Date().getFullYear()} — Sunday Market Quick-Pickup WebApp Foundation
      </footer>

      {/* Flavor Detail Modal */}
      {activeModalFlavor && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.88)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.5rem',
        }}>
          <div className="card animate-slide" style={{
            maxWidth: '520px',
            width: '100%',
            border: `2px solid var(--accent-${activeModalFlavor.color})`,
            boxShadow: `0 0 30px var(--accent-${activeModalFlavor.color})`,
            position: 'relative',
            padding: '2rem'
          }}>
            <button 
              onClick={() => setActiveModalFlavor(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '1.6rem',
                cursor: 'pointer'
              }}
            >
              <i className="fa-solid fa-xmark" />
            </button>

            <span style={{
              background: `var(--accent-${activeModalFlavor.color})`,
              color: '#060a12',
              fontWeight: '800',
              fontSize: '0.75rem',
              padding: '4px 12px',
              borderRadius: '20px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Draft Dispenser Tap
            </span>

            <h2 style={{ fontSize: '2.1rem', color: '#fff', margin: '0.85rem 0 0.4rem 0' }}>
              {activeModalFlavor.name}
            </h2>
            
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
              "{activeModalFlavor.desc}"
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '0.8rem', color: `var(--accent-${activeModalFlavor.color})`, textTransform: 'uppercase', marginBottom: '0.3rem', fontWeight: '800' }}>
                  <i className="fa-solid fa-seedling" style={{ marginRight: '6px' }} /> Ingredients
                </h4>
                <p style={{ fontSize: '0.88rem', color: '#fff', lineHeight: '1.45' }}>
                  {activeModalFlavor.ingredients}
                </p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '0.8rem', color: `var(--accent-${activeModalFlavor.color})`, textTransform: 'uppercase', marginBottom: '0.3rem', fontWeight: '800' }}>
                  <i className="fa-solid fa-comment-dots" style={{ marginRight: '6px' }} /> Tasting Notes
                </h4>
                <p style={{ fontSize: '0.88rem', color: '#fff', lineHeight: '1.45' }}>
                  {activeModalFlavor.tastingNotes}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0, 210, 255, 0.06)', padding: '14px 18px', borderRadius: '10px', border: '1px solid var(--accent-cyan)' }}>
                <div>
                  <div style={{ fontSize: '0.95rem', color: '#fff', fontWeight: '800' }}>Single Cup Serving</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Ready for market drinking</div>
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    addToCart(activeModalFlavor.id, 1)
                    setActiveModalFlavor(null)
                  }}
                  style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem' }}
                >
                  Add Cup ({activeModalFlavor.price})
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(168, 85, 247, 0.06)', padding: '14px 18px', borderRadius: '10px', border: '1px solid var(--accent-violet)' }}>
                <div>
                  <div style={{ fontSize: '0.95rem', color: '#fff', fontWeight: '800' }}>Sunday Market 3-Pack</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{activeModalFlavor.bundleDesc}</div>
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    addToCart(activeModalFlavor.id, 3)
                    setActiveModalFlavor(null)
                  }}
                  style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem', background: 'var(--accent-violet)', border: 'none' }}
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
