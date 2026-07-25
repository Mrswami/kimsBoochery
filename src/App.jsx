import { useState, useEffect } from 'react'
import ApiService from './config/api'
import menuData from './data/menu_and_inventory.json'
import './index.css'

// ══════════════════════════════════════════════════════════════
// KIM'S BOOCHERY — Sunday Market Quick-Pickup & Order App
// Clean, Mobile-First Kiosk Experience
// ══════════════════════════════════════════════════════════════

const flavors = menuData.flavors

function App() {
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [currentView, setCurrentView] = useState('shop') // 'shop' | 'qr-storage' | 'admin-dashboard' | 'api-keys' | 'firebase' | 'activity'
  const [stickyHandsMode, setStickyHandsMode] = useState(false)
  const [liveTime, setLiveTime] = useState(new Date())
  
  // Cart & Payment State
  const [cart, setCart] = useState({})
  const [orderStatus, setOrderStatus] = useState(null) // null | 'ordered' | 'brewing' | 'pickup'
  const [isPaying, setIsPaying] = useState(false)
  const [lastOrderDetails, setLastOrderDetails] = useState(null)
  const [paymentMode, setPaymentMode] = useState('apple-pay') // 'apple-pay' | 'gpay' | 'venmo' | 'card' | 'cash' | 'ebt'

  // Storage & Rental State
  const [storageItems, setStorageItems] = useState(menuData.storageItems)
  const [bookingQty, setBookingQty] = useState({ 'tank-a': 1, 'cold-room': 1, 'booth-locker': 1, 'trailer-slot': 1 })
  const [bookings, setBookings] = useState([])
  const [customQrText, setCustomQrText] = useState('')
  const [generatedQr, setGeneratedQr] = useState('https://mrswami.github.io/kimsBoochery/')

  // Mascot Quote State
  const [chatText, setChatText] = useState('')
  const [isAskingAI, setIsAskingAI] = useState(false)
  const [activeModalFlavor, setActiveModalFlavor] = useState(null)

  // Armadillo mascot quotes
  const armadilloQuotes = [
    "Don't touch my fermentation tanks or you'll get the boot.",
    "Tell your nasty kids to keep their sticky hands off my screen!",
    "Errands to run? Grab a bottle, hit the trail, and keep moving.",
    "Mueller Market Booth #12 is open. Bring your own cup or get lost.",
    "Eyeliner is smudged because of all these sticky fingers."
  ]
  const [currentQuote, setCurrentQuote] = useState(armadilloQuotes[0])

  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (orderStatus === 'ordered') {
      const timer1 = setTimeout(() => setOrderStatus('brewing'), 3500)
      return () => clearTimeout(timer1)
    } else if (orderStatus === 'brewing') {
      const timer2 = setTimeout(() => setOrderStatus('pickup'), 5000)
      return () => clearTimeout(timer2)
    }
  }, [orderStatus])

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  }

  const rotateQuote = () => {
    const nextIdx = (armadilloQuotes.indexOf(currentQuote) + 1) % armadilloQuotes.length
    setCurrentQuote(armadilloQuotes[nextIdx])
  }

  const addToCart = (flavorId, qty = 1) => {
    setCart(prev => ({ ...prev, [flavorId]: (prev[flavorId] || 0) + qty }))
  }

  const removeFromCart = (flavorId) => {
    setCart(prev => {
      const updated = { ...prev }
      if (updated[flavorId] > 1) { updated[flavorId] -= 1 } else { delete updated[flavorId] }
      return updated
    })
  }

  const clearCart = () => setCart({})

  const calculateCartTotal = () => {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const item = flavors.find(f => f.id === id)
      return sum + ((item ? item.rawPrice : 0) * qty)
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
      console.error("Order process fallback:", err)
      setOrderStatus('ordered')
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

  return (
    <div className={`app-shell ${stickyHandsMode ? 'sticky-active' : ''}`}>
      {/* ── Titlebar Header ──────────────────────────── */}
      <header className="titlebar">
        <div className="titlebar-logo" onClick={handleLogoClick}>
          <img 
            src="/logo.png" 
            alt="Kim's Boochery Logo" 
            style={{ width: '38px', height: '38px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} 
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="logo-text">Kim's Boochery</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Mueller Sunday Market • Booth #12</span>
          </div>
        </div>

        {/* Navigation & Sticky Mode Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <nav className="nav-links">
            <button
              className={`nav-link ${currentView === 'shop' ? 'active' : ''}`}
              onClick={() => setCurrentView('shop')}
            >
              <i className="fa-solid fa-store" /> Shop
            </button>
            <button
              className={`nav-link ${currentView === 'qr-storage' ? 'active' : ''}`}
              onClick={() => setCurrentView('qr-storage')}
            >
              <i className="fa-solid fa-qrcode" /> QR & Rental
            </button>
          </nav>

          <button 
            className={`btn btn-sm ${stickyHandsMode ? 'btn-primary' : 'btn-ghost'}`} 
            onClick={() => setStickyHandsMode(!stickyHandsMode)}
          >
            <i className="fa-solid fa-hands-wash" /> {stickyHandsMode ? 'Sticky Mode ON' : 'Sticky Mode'}
          </button>

          {isAdminMode && (
            <nav className="nav-links">
              {['admin-dashboard', 'api-keys', 'firebase'].map(view => (
                <button key={view} className={`nav-link ${currentView === view ? 'active' : ''}`} onClick={() => setCurrentView(view)}>
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

      {/* ── Main App Body ────────────────────────────── */}
      <main className="main-content">

        {/* Mascot Banner — Clean & Friendly */}
        <div className="card animate-fade" style={{ marginBottom: '1.25rem', background: 'rgba(30, 41, 59, 0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <img 
              src="/logo.png" 
              alt="Texas Butch" 
              style={{ width: stickyHandsMode ? '80px' : '65px', height: stickyHandsMode ? '80px' : '65px', borderRadius: '50%', border: '2px solid var(--accent-cyan)' }}
            />
            <div style={{ flex: '1', minWidth: '220px' }}>
              <div style={{ background: '#0f172a', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.85rem 1rem', color: '#fff', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <p style={{ fontStyle: 'italic', color: 'var(--accent-cyan)', fontWeight: '600' }}>
                  "{currentQuote}"
                </p>
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button className="btn btn-sm btn-ghost" onClick={rotateQuote}>
                  <i className="fa-solid fa-sync" /> Pester Butch
                </button>
                <button className="btn btn-sm btn-ghost" onClick={() => setCurrentQuote("Booth #12 is straight past the acoustic stage at Mueller Sunday Market!")}>
                  <i className="fa-solid fa-location-dot" /> Booth #12
                </button>
                <button className="btn btn-sm btn-ghost" onClick={() => setCurrentQuote("Organic live SCOBY cultures brewed right here in Central Texas.")}>
                  <i className="fa-solid fa-seedling" /> Ingredients
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Shop View */}
        {currentView === 'shop' && (
          <div className="animate-fade">
            
            {/* Pickup Progress Tracker */}
            {orderStatus && (
              <div className="card" style={{ marginBottom: '1.5rem', border: '1px solid var(--accent-emerald)', background: 'rgba(52, 211, 153, 0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-truck-ramp-box" /> Mueller Market Pickup Tracker
                  </h3>
                  {lastOrderDetails && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Ref: {lastOrderDetails.id}</span>}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', margin: '1.25rem 0', position: 'relative' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-emerald)', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>1</div>
                    <span style={{ fontSize: '0.75rem', marginTop: '4px', color: '#fff' }}>Ordered</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: (orderStatus === 'brewing' || orderStatus === 'pickup') ? 'var(--accent-emerald)' : '#1e293b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>2</div>
                    <span style={{ fontSize: '0.75rem', marginTop: '4px', color: (orderStatus === 'brewing' || orderStatus === 'pickup') ? '#fff' : 'var(--text-muted)' }}>Preparing</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: orderStatus === 'pickup' ? 'var(--accent-emerald)' : '#1e293b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>3</div>
                    <span style={{ fontSize: '0.75rem', marginTop: '4px', color: orderStatus === 'pickup' ? '#fff' : 'var(--text-muted)' }}>Ready!</span>
                  </div>
                </div>

                {orderStatus === 'pickup' ? (
                  <div style={{ background: 'rgba(52, 211, 153, 0.12)', padding: '0.85rem', borderRadius: '8px', textAlign: 'center', marginBottom: '0.75rem' }}>
                    <p style={{ color: 'var(--accent-emerald)', fontWeight: '700', fontSize: '0.95rem' }}>
                      🎉 Ready for Pickup! Head to Mueller Sunday Market Booth #12
                    </p>
                  </div>
                ) : null}

                <button className="btn btn-ghost" style={{ width: '100%' }} onClick={resetOrder}>Start New Order</button>
              </div>
            )}

            {/* Flavor Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              {flavors.map(flavor => {
                const count = cart[flavor.id] || 0
                return (
                  <div key={flavor.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', borderLeft: `3px solid var(--accent-${flavor.color})` }}>
                    <div style={{ flex: '1', paddingRight: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.2rem' }}>
                        <h4 style={{ fontSize: '1.05rem', color: '#fff' }}>{flavor.name}</h4>
                        <button className="btn btn-sm btn-ghost" onClick={() => setActiveModalFlavor(flavor)} style={{ padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}>
                          Info
                        </button>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{flavor.desc}</p>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '0.4rem' }}>
                        <span style={{ fontSize: '1rem', color: 'var(--accent-cyan)', fontWeight: '800' }}>{flavor.price} / cup</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-violet)' }}>{flavor.bundleDesc}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {count > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', background: '#090d16', border: '1px solid var(--border)', borderRadius: '20px', padding: '2px 6px' }}>
                          <button className="btn btn-sm btn-ghost" onClick={() => removeFromCart(flavor.id)} style={{ padding: '0.2rem 0.5rem' }}>-</button>
                          <span style={{ width: '24px', textAlign: 'center', fontWeight: '800', color: 'var(--accent-cyan)' }}>{count}</span>
                          <button className="btn btn-sm btn-ghost" onClick={() => addToCart(flavor.id)} style={{ padding: '0.2rem 0.5rem' }}>+</button>
                        </div>
                      )}
                      <button className="btn btn-primary" onClick={() => addToCart(flavor.id)}>
                        <i className="fa-solid fa-plus" /> Add
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Universal Checkout Drawer */}
            {Object.keys(cart).length > 0 && !orderStatus && (
              <div className="card animate-fade" style={{ marginTop: '1.5rem', border: '1px solid var(--accent-cyan)' }}>
                <h4 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.05rem' }}>
                  <i className="fa-solid fa-cart-shopping" style={{ marginRight: '6px', color: 'var(--accent-cyan)' }} />
                  Checkout & Payment
                </h4>

                {/* Universal Payment Selector */}
                <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '20px', border: '1px solid var(--border)', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                  <button className={`btn btn-sm ${paymentMode === 'apple-pay' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPaymentMode('apple-pay')}>
                    <i className="fa-brands fa-apple" /> Apple Pay
                  </button>
                  <button className={`btn btn-sm ${paymentMode === 'gpay' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPaymentMode('gpay')}>
                    <i className="fa-brands fa-google" /> GPay
                  </button>
                  <button className={`btn btn-sm ${paymentMode === 'venmo' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPaymentMode('venmo')}>
                    <i className="fa-solid fa-qrcode" /> Venmo / CashApp
                  </button>
                  <button className={`btn btn-sm ${paymentMode === 'card' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPaymentMode('card')}>
                    <i className="fa-solid fa-credit-card" /> Card
                  </button>
                  <button className={`btn btn-sm ${paymentMode === 'cash' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPaymentMode('cash')}>
                    <i className="fa-solid fa-money-bill-wave" /> Cash #12
                  </button>
                  <button className={`btn btn-sm ${paymentMode === 'ebt' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPaymentMode('ebt')}>
                    <i className="fa-solid fa-coins" /> EBT / Bucks
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '1.1rem', color: 'var(--accent-cyan)', marginBottom: '1.25rem' }}>
                  <span>Total Due:</span>
                  <span>${calculateCartTotal().toFixed(2)}</span>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-ghost" onClick={clearCart} style={{ flex: '1' }}>Clear</button>
                  <button className="btn btn-primary" onClick={placeOrder} disabled={isPaying} style={{ flex: '2' }}>
                    {isPaying ? "Processing..." : `Pay with ${paymentMode.replace('-', ' ').toUpperCase()} ($${calculateCartTotal().toFixed(2)})`}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* QR & Storage View */}
        {currentView === 'qr-storage' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card">
              <h3 style={{ fontSize: '1.15rem', color: 'var(--accent-cyan)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-qrcode" /> Quick QR Generator & Vendor Storage
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Generate pickup QR passes or reserve excess cold room storage capacity at Mueller Sunday Market.
              </p>
              
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <button className="btn btn-sm btn-ghost" onClick={() => setGeneratedQr("https://mrswami.github.io/kimsBoochery/")}>
                  Webapp Link QR
                </button>
                <button className="btn btn-sm btn-ghost" onClick={() => setGeneratedQr("KIMS-BOOCHERY-BOOTH12-CHECKIN")}>
                  Booth #12 Check-in QR
                </button>
              </div>

              <div style={{ textAlign: 'center', padding: '1rem', background: '#090d16', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=38bdf8&bgcolor=0f172a&data=${encodeURIComponent(generatedQr)}`}
                  alt="Generated QR Code"
                  style={{ width: '150px', height: '150px', borderRadius: '8px', border: '2px solid var(--accent-cyan)', margin: '0 auto' }}
                />
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Data: <code>{generatedQr}</code>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '1rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        Kim's Boochery &copy; {new Date().getFullYear()} — Mueller Sunday Market Kiosk
      </footer>

      {/* Flavor Detail Modal */}
      {activeModalFlavor && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(9, 13, 22, 0.85)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem'
        }}>
          <div className="card animate-fade" style={{ maxWidth: '480px', width: '100%', border: `1px solid var(--accent-${activeModalFlavor.color})` }}>
            <button onClick={() => setActiveModalFlavor(null)} style={{ float: 'right', background: 'none', border: 'none', color: '#fff', fontSize: '1.4rem', cursor: 'pointer' }}>×</button>
            <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '0.5rem' }}>{activeModalFlavor.name}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1rem' }}>"{activeModalFlavor.desc}"</p>
            <div style={{ background: '#0f172a', padding: '0.85rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--border)' }}>
              <strong style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>INGREDIENTS:</strong>
              <p style={{ fontSize: '0.85rem', color: '#fff', marginTop: '0.2rem' }}>{activeModalFlavor.ingredients}</p>
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { addToCart(activeModalFlavor.id, 1); setActiveModalFlavor(null); }}>
              Add Cup ({activeModalFlavor.price})
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
