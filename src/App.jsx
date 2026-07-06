import { useState, useEffect, useCallback } from 'react'
import './index.css'

// ══════════════════════════════════════════════════════════════
// KIMBOOCHERLY — Main Dashboard Application
// Modeled after Sovereign Nexus / jacobdev webapp architecture
// ══════════════════════════════════════════════════════════════

function App() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [apiKeysVisible, setApiKeysVisible] = useState({})
  const [firebaseStatus, setFirebaseStatus] = useState('connected')
  const [liveTime, setLiveTime] = useState(new Date())

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const toggleApiKeyVisibility = useCallback((key) => {
    setApiKeysVisible(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }

  // Mock data for dashboard
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

  // Armadillo attitude quotes
  const armadilloQuotes = [
    "Don't touch my fermentation tanks or you'll get the boot.",
    "Sad Cactus flavor is brewed with tears, pride, and zero sugar.",
    "This is Texas. Emo is a lifestyle, butch is an attitude, kombucha is the cure.",
    "Mess with the armadillo, you get the spikes. Back off my barrel.",
    "I put black eyeliner on my shell just to look at your broken configurations."
  ]
  const [currentQuote, setCurrentQuote] = useState(armadilloQuotes[0])

  const rotateQuote = () => {
    const nextIdx = (armadilloQuotes.indexOf(currentQuote) + 1) % armadilloQuotes.length
    setCurrentQuote(armadilloQuotes[nextIdx])
  }

  return (
    <div className="app-shell">
      {/* ── Header ──────────────────────────────────── */}
      <header className="titlebar">
        <div className="titlebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
            src="/logo.png" 
            alt="KimBoocherly Logo" 
            style={{ width: '40px', height: '40px', borderRadius: '8px', border: '1px solid var(--accent-cyan)' }} 
          />
          <span className="logo-text">KIMBOOCHERLY</span>
        </div>

        <nav className="nav-links">
          {['dashboard', 'api-keys', 'firebase', 'activity'].map(view => (
            <button
              key={view}
              className={`nav-link ${currentView === view ? 'active' : ''}`}
              onClick={() => setCurrentView(view)}
            >
              <i className={`fa-solid ${
                view === 'dashboard' ? 'fa-grid-2' :
                view === 'api-keys' ? 'fa-key' :
                view === 'firebase' ? 'fa-fire' : 'fa-timeline'
              }`} />
              {view.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </button>
          ))}
        </nav>

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
                style={{ width: '90px', height: '90px', borderRadius: '50%', border: '3px solid var(--accent-cyan)', boxShadow: '0 0 15px var(--accent-cyan)' }}
              />
              <span style={{ position: 'absolute', bottom: '-5px', right: '-5px', background: '#000', border: '1px solid var(--accent-cyan)', borderRadius: '4px', padding: '1px 6px', fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>TEXAS BUTCH</span>
            </div>
            <div style={{ flex: '1', minWidth: '250px' }}>
              <div style={{ position: 'relative', background: '#09090b', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', color: '#fff', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <div style={{ position: 'absolute', left: '-10px', top: '50%', transform: 'translateY(-50%) rotate(45deg)', width: '16px', height: '16px', background: '#09090b', borderLeft: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}></div>
                <p style={{ position: 'relative', zIndex: '1', fontStyle: 'italic', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>
                  " {currentQuote} "
                </p>
              </div>
              <button className="btn btn-sm btn-primary" onClick={rotateQuote}>
                <i className="fa-solid fa-sync" /> Pester Armadillo
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard View */}
        {currentView === 'dashboard' && (
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
              {/* API Status Card */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">API Health</span>
                  <div className="card-icon cyan"><i className="fa-solid fa-heartbeat" /></div>
                </div>
                <div className="card-value">98.5%</div>
                <div className="card-change positive">
                  <i className="fa-solid fa-arrow-up" /> 2.1% from yesterday
                </div>
              </div>

              {/* Firebase Usage */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Firebase Usage</span>
                  <div className="card-icon amber"><i className="fa-solid fa-fire" /></div>
                </div>
                <div className="card-value">67.3%</div>
                <div className="card-change negative">
                  <i className="fa-solid fa-arrow-up" /> 12.4% quota increase
                </div>
              </div>

              {/* Revenue */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Revenue (MTD)</span>
                  <div className="card-icon emerald"><i className="fa-solid fa-dollar-sign" /></div>
                </div>
                <div className="card-value">$4,218</div>
                <div className="card-change positive">
                  <i className="fa-solid fa-arrow-up" /> 15.7% vs last month
                </div>
              </div>
            </div>
          </div>
        )}

        {/* API Keys View */}
        {currentView === 'api-keys' && (
          <div className="animate-fade">
            <div className="api-panel">
              <div className="api-panel-header">
                <div className="api-panel-title">
                  <i className="fa-solid fa-key" />
                  API Key Management
                </div>
                <button className="btn btn-sm btn-primary">
                  <i className="fa-solid fa-plus" /> Add Key
                </button>
              </div>
              {apiKeys.map((key, i) => (
                <div className="api-key-row" key={i}>
                  <div className="api-key-info">
                    <div className={`api-key-icon card-icon ${key.color}`}>
                      <i className={`fa-solid ${key.icon}`} />
                    </div>
                    <div>
                      <div className="api-key-name">{key.name}</div>
                      <div className="api-key-hint">
                        {apiKeysVisible[key.name] ? 'sk-xxxxxxxxxxxxxxxxxxxx' : key.hint}
                      </div>
                    </div>
                  </div>
                  <div className="api-key-status">
                    <span className={`api-badge ${key.status}`}>{key.badge}</span>
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => toggleApiKeyVisibility(key.name)}
                    >
                      <i className={`fa-solid ${apiKeysVisible[key.name] ? 'fa-eye-slash' : 'fa-eye'}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Firebase View */}
        {currentView === 'firebase' && (
          <div className="animate-fade">
            <div className="firebase-panel">
              <div className="firebase-header">
                <i className="fa-solid fa-fire" />
                <h3>Firebase Services — kimboocherly-app</h3>
                <div className="status-indicator" style={{ marginLeft: 'auto' }}>
                  <div className="status-dot" />
                  Connected
                </div>
              </div>
              <div className="firebase-services stagger">
                {firebaseServices.map((svc, i) => (
                  <div className="firebase-service" key={i}>
                    <div className="firebase-service-name">
                      <i className={`fa-solid ${svc.icon}`} />
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

        {/* Activity View */}
        {currentView === 'activity' && (
          <div className="animate-fade">
            <div className="card">
              <div className="card-header">
                <span className="card-title">Live Activity Feed</span>
                <div className="card-icon violet"><i className="fa-solid fa-timeline" /></div>
              </div>
              <div className="activity-feed stagger">
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
