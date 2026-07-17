import { useState, useEffect, useCallback } from 'react'
import ApiService from './config/api'
import './index.css'

// ══════════════════════════════════════════════════════════════
// KIMBOOCHERLY — Sunday Market Quick-Pickup & Order App
// Modeled after Sovereign Nexus / jacobdev webapp architecture
// ══════════════════════════════════════════════════════════════

function App() {
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [currentView, setCurrentView] = useState('shop') // 'shop' | 'admin-dashboard' | 'api-keys' | 'firebase' | 'activity'
  const [stickyHandsMode, setStickyHandsMode] = useState(false)
  const [liveTime, setLiveTime] = useState(new Date())
  const [apiKeysVisible, setApiKeysVisible] = useState({})
  
  // Cart & Order State
  const [cart, setCart] = useState({})
  const [orderStatus, setOrderStatus] = useState(null) // null | 'ordered' | 'brewing' | 'pickup'
  const [isPaying, setIsPaying] = useState(false)

  // Mascot Chat State
  const [chatText, setChatText] = useState('')
  const [isAskingAI, setIsAskingAI] = useState(false)

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

  // Flavors Menu
  const flavors = [
    { id: 'sad-cactus', name: 'Sad Cactus', desc: 'Prickly pear & aloe. Brewed with tears & attitude.', price: '$5.00', color: 'rose' },
    { id: 'lone-star', name: 'Lone Star Blackout', desc: 'Blackberry, charcoal, & oak. Dark & bold.', price: '$5.50', color: 'violet' },
    { id: 'grapefruit', name: 'Grapefruit Rustler', desc: 'Grapefruit, rosemary, & hops. Sturdy & sharp.', price: '$5.00', color: 'cyan' },
  ]

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

        {/* Consumer Options: Sticky Mode Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            className={`btn btn-sm ${stickyHandsMode ? 'btn-primary' : 'btn-ghost'}`} 
            onClick={() => setStickyHandsMode(!stickyHandsMode)}
            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '20px' }}
          >
            <i className="fa-solid fa-hands-wash" /> {stickyHandsMode ? 'Sticky Hands Active' : 'Sticky Hands Mode'}
          </button>

          {isAdminMode && (
            <nav className="nav-links">
              {['shop', 'admin-dashboard', 'api-keys', 'firebase', 'activity'].map(view => (
                <button
                  key={view}
                  className={`nav-link ${currentView === view ? 'active' : ''}`}
                  onClick={() => setCurrentView(view)}
                >
                  {view === 'shop' ? 'Shop View' : view.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
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
    </div>
  )
}

export default App
