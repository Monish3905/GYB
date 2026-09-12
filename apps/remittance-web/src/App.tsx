import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './index.css';

const API = 'http://localhost:4000/api';

// ============================================================
// AUTH CONTEXT
// ============================================================
interface AuthState {
  token: string | null;
  user: any;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({} as AuthState);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('gyb_token'));
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('gyb_user') || 'null'));

  useEffect(() => {
    if (token) axios.defaults.headers.common['Authorization'] = token;
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await axios.post(`${API}/auth/login`, { email, password });
    setToken(res.data.token);
    setUser(res.data.user);
    localStorage.setItem('gyb_token', res.data.token);
    localStorage.setItem('gyb_user', JSON.stringify(res.data.user));
    axios.defaults.headers.common['Authorization'] = res.data.token;
  };

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    const res = await axios.post(`${API}/auth/signup`, { email, password, firstName, lastName });
    setToken(res.data.token);
    setUser(res.data.user);
    localStorage.setItem('gyb_token', res.data.token);
    localStorage.setItem('gyb_user', JSON.stringify(res.data.user));
    axios.defaults.headers.common['Authorization'] = res.data.token;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('gyb_token');
    localStorage.removeItem('gyb_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return <AuthContext.Provider value={{ token, user, login, signup, logout }}>{children}</AuthContext.Provider>;
}

const useAuth = () => useContext(AuthContext);

// ============================================================
// LANDING PAGE
// ============================================================
function LandingPage() {
  return (
    <div className="page-container">
      <nav className="nav">
        <div className="logo">GYB</div>
        <div className="nav-links">
          <Link to="/login" className="nav-link">Sign In</Link>
          <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </nav>

      <section className="hero animate-in">
        <h1>
          Send Money to India<br />
          <span className="gradient-text">Instantly & Securely</span>
        </h1>
        <p>
          Real exchange rates. No hidden fees. Powered by GYB's proprietary payment rail with bank-grade compliance.
        </p>
        <Link to="/signup" className="btn btn-primary" style={{ padding: '16px 40px', fontSize: '16px' }}>
          Start Sending →
        </Link>
      </section>

      <div className="grid-3" style={{ marginTop: '60px', marginBottom: '80px' }}>
        <div className="card animate-in" style={{ animationDelay: '0.1s', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '16px' }}>⚡</div>
          <h3 style={{ marginBottom: '8px' }}>Lightning Fast</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Money arrives in 2-4 hours via IMPS direct to any Indian bank.</p>
        </div>
        <div className="card animate-in" style={{ animationDelay: '0.2s', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '16px' }}>🔒</div>
          <h3 style={{ marginBottom: '8px' }}>Enterprise Security</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Full AML, sanctions, and fraud screening on every transaction.</p>
        </div>
        <div className="card animate-in" style={{ animationDelay: '0.3s', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '16px' }}>💎</div>
          <h3 style={{ marginBottom: '8px' }}>Transparent Pricing</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Flat £2.99 fee. Real mid-market rate. No hidden margins.</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// LOGIN
// ============================================================
function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      setError('Login failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="page-narrow" style={{ paddingTop: '80px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <Link to="/" className="logo" style={{ fontSize: '28px', textDecoration: 'none' }}>GYB</Link>
      </div>
      <div className="card animate-in">
        <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>Welcome back</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '32px', fontSize: '14px' }}>
          Sign in to your account to continue
        </p>
        {error && <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-muted)', fontSize: '14px' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--primary)' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}

// ============================================================
// SIGNUP
// ============================================================
function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(form.email, form.password, form.firstName, form.lastName);
      navigate('/dashboard');
    } catch { }
    setLoading(false);
  };

  return (
    <div className="page-narrow" style={{ paddingTop: '60px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <Link to="/" className="logo" style={{ fontSize: '28px', textDecoration: 'none' }}>GYB</Link>
      </div>
      <div className="card animate-in">
        <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>Create your account</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '32px', fontSize: '14px' }}>
          Start sending money to India in minutes
        </p>
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input className="form-input" placeholder="John" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input className="form-input" placeholder="Doe" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Min 8 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-muted)', fontSize: '14px' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

// ============================================================
// DASHBOARD
// ============================================================
function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    axios.get(`${API}/remittances`).then(r => setTransactions(r.data)).catch(() => {});
  }, []);

  return (
    <div className="page-container">
      <nav className="nav">
        <div className="logo">GYB</div>
        <div className="nav-links">
          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Hi, {user?.firstName || 'User'}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => { logout(); navigate('/'); }}>Logout</button>
        </div>
      </nav>

      <div className="grid-2 animate-in" style={{ marginBottom: '32px' }}>
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/send')}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>🇬🇧 → 🇮🇳</div>
          <h3 style={{ marginBottom: '8px' }}>Send Money to India</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>Fast, secure transfers via GYB proprietary rail</p>
          <button className="btn btn-primary btn-full">Send Now →</button>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>Account Overview</h3>
          <div className="stat-row">
            <span className="stat-label">KYC Status</span>
            <span className="badge badge-success">Verified</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Account Tier</span>
            <span className="stat-value">Standard</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Daily Limit</span>
            <span className="stat-value">£5,000</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Environment</span>
            <span className="badge badge-warning">Sandbox</span>
          </div>
        </div>
      </div>

      <div className="card animate-in" style={{ animationDelay: '0.2s' }}>
        <h3 style={{ marginBottom: '20px' }}>Transaction History</h3>
        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>📭</p>
            <p>No transactions yet. Send your first transfer!</p>
          </div>
        ) : (
          <div>
            {transactions.map((tx: any) => (
              <div key={tx.orderId} className="stat-row" style={{ cursor: 'pointer' }} onClick={() => navigate(`/tx/${tx.orderId}`)}>
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>{tx.orderId}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(tx.createdAt).toLocaleString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '600' }}>£{tx.sourceAmount} → ₹{tx.destinationAmount?.toLocaleString()}</div>
                  <span className={`badge ${tx.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}`}>{tx.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// SEND MONEY
// ============================================================
function SendMoney() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('500');
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);

  const getQuote = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/remittances/quote`, { sourceCurrency: 'GBP', destinationCurrency: 'INR', amount: Number(amount) });
      setQuote(res.data);
      setStep(2);
    } catch { alert('Failed to get quote'); }
    setLoading(false);
  };

  const confirmSend = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/remittances`, { quoteId: quote.quoteId, beneficiaryId: 'ben-default', amount: quote.sourceAmount, currency: 'GBP' });
      setOrder(res.data);
      setStep(3);
    } catch { alert('Transfer failed'); }
    setLoading(false);
  };

  return (
    <div className="page-narrow" style={{ paddingTop: '40px' }}>
      <nav className="nav" style={{ marginBottom: '24px' }}>
        <Link to="/dashboard" className="nav-link" style={{ padding: 0 }}>← Back</Link>
        <div className="logo" style={{ fontSize: '18px' }}>Send Money</div>
        <div style={{ width: '60px' }}></div>
      </nav>

      {/* STEP INDICATOR */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{
            width: s === step ? '32px' : '8px', height: '8px',
            borderRadius: '4px', transition: 'all 0.3s',
            background: s <= step ? 'var(--primary)' : 'var(--border)'
          }} />
        ))}
      </div>

      {/* STEP 1: Amount */}
      {step === 1 && (
        <div className="card animate-in">
          <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>How much?</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '32px', fontSize: '14px' }}>
            Enter amount in GBP
          </p>
          <div style={{ position: 'relative', marginBottom: '24px' }}>
            <span style={{ position: 'absolute', left: '20px', top: '20px', fontSize: '28px', fontWeight: '700', color: 'var(--text-muted)' }}>£</span>
            <input
              className="form-input form-input-lg"
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              style={{ paddingLeft: '48px' }}
              min="10"
              max="5000"
            />
          </div>
          <div className="card-flat" style={{ marginBottom: '24px' }}>
            <div className="stat-row">
              <span className="stat-label">Estimated rate</span>
              <span className="stat-value" style={{ color: 'var(--primary)' }}>1 GBP ≈ ₹110.25</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Fee</span>
              <span className="stat-value">£2.99</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Recipient gets (est.)</span>
              <span className="stat-value-lg">₹{((Number(amount) - 2.99) * 110.25).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
          </div>
          <button className="btn btn-primary btn-full" onClick={getQuote} disabled={loading || Number(amount) < 10}>
            {loading ? 'Getting live rate...' : 'Get Quote →'}
          </button>
        </div>
      )}

      {/* STEP 2: Review */}
      {step === 2 && quote && (
        <div className="card animate-in">
          <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>Review Transfer</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '32px', fontSize: '14px' }}>
            Confirm the details below
          </p>

          <div className="card-flat" style={{ marginBottom: '24px' }}>
            <div className="stat-row">
              <span className="stat-label">You send</span>
              <span className="stat-value">£{quote.sourceAmount.toFixed(2)}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Fee</span>
              <span className="stat-value">£{quote.fees.toFixed(2)}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Exchange rate</span>
              <span className="stat-value" style={{ color: 'var(--primary)' }}>1 GBP = ₹{quote.rate.toFixed(2)}</span>
            </div>
            <hr className="divider" />
            <div className="stat-row">
              <span className="stat-label">Recipient gets</span>
              <span className="stat-value-lg" style={{ color: 'var(--success)' }}>₹{quote.destinationAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="card-flat" style={{ marginBottom: '24px' }}>
            <div className="stat-row">
              <span className="stat-label">Delivery method</span>
              <span className="stat-value">IMPS (Direct to Bank)</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Estimated arrival</span>
              <span className="stat-value">{quote.estimatedDelivery}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Quote expires</span>
              <span className="stat-value" style={{ color: 'var(--warning)' }}>2 minutes</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-primary" style={{ flex: 2 }} onClick={confirmSend} disabled={loading}>
              {loading ? 'Processing...' : 'Confirm & Send →'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Success */}
      {step === 3 && order && (
        <div className="card animate-in" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
          <h2 style={{ marginBottom: '8px' }}>Transfer Complete!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            Your money is on its way to India
          </p>
          <div className="card-flat" style={{ marginBottom: '24px', textAlign: 'left' }}>
            <div className="stat-row">
              <span className="stat-label">Transaction ID</span>
              <span className="stat-value" style={{ fontSize: '12px', fontFamily: 'monospace' }}>{order.orderId}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Amount sent</span>
              <span className="stat-value">£{order.sourceAmount}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Recipient gets</span>
              <span className="stat-value" style={{ color: 'var(--success)' }}>₹{order.destinationAmount?.toLocaleString()}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Status</span>
              <span className="badge badge-success">{order.status}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => navigate(`/tx/${order.orderId}`)}>
              Track Transfer
            </button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate('/dashboard')}>
              Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// TRANSACTION TRACKING
// ============================================================
function TransactionDetail() {
  const { id } = useParams();
  const [tx, setTx] = useState<any>(null);

  useEffect(() => {
    axios.get(`${API}/remittances/${id}`).then(r => setTx(r.data)).catch(() => {});
  }, [id]);

  if (!tx) return <div style={{ textAlign: 'center', paddingTop: '100px' }} className="loading-pulse">Loading...</div>;

  return (
    <div className="page-medium" style={{ paddingTop: '40px' }}>
      <nav className="nav" style={{ marginBottom: '24px' }}>
        <Link to="/dashboard" className="nav-link" style={{ padding: 0 }}>← Dashboard</Link>
        <div className="logo" style={{ fontSize: '18px' }}>Transaction</div>
        <div style={{ width: '60px' }}></div>
      </nav>

      <div className="card animate-in" style={{ textAlign: 'center', marginBottom: '24px' }}>
        <span className={`badge ${tx.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '14px', padding: '6px 16px' }}>
          {tx.status}
        </span>
        <h2 style={{ marginTop: '16px' }}>£{tx.sourceAmount} → ₹{tx.destinationAmount?.toLocaleString()}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'monospace', marginTop: '8px' }}>{tx.orderId || id}</p>
      </div>

      <div className="grid-2">
        <div className="card animate-in" style={{ animationDelay: '0.1s' }}>
          <h3 className="section-title">Rail Lifecycle</h3>
          <div className="timeline">
            {tx.timeline?.map((event: any, i: number) => (
              <div key={i} className="timeline-item">
                <div className="timeline-dot completed"></div>
                <div className="timeline-title">{event.state.replace(/_/g, ' ')}</div>
                <div className="timeline-detail">{event.detail}</div>
                <div className="timeline-time">{new Date(event.at).toLocaleTimeString()}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card animate-in" style={{ animationDelay: '0.2s' }}>
            <h3 className="section-title">Compliance</h3>
            <div className="stat-row">
              <span className="stat-label">AML</span>
              <span className="badge badge-success">{tx.compliance?.aml}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Sanctions</span>
              <span className="badge badge-success">{tx.compliance?.sanctions}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Fraud</span>
              <span className="badge badge-success">{tx.compliance?.fraud}</span>
            </div>
          </div>

          <div className="card animate-in" style={{ animationDelay: '0.3s' }}>
            <h3 className="section-title">Settlement</h3>
            <div className="stat-row">
              <span className="stat-label">Provider</span>
              <span className="stat-value">{tx.settlement?.provider}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Method</span>
              <span className="stat-value">{tx.settlement?.method}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Reconciliation</span>
              <span className="badge badge-success">{tx.reconciliation?.status}</span>
            </div>
          </div>

          <div className="card animate-in" style={{ animationDelay: '0.4s' }}>
            <h3 className="section-title">Environment</h3>
            <div className="stat-row">
              <span className="stat-label">Mode</span>
              <span className="badge badge-warning">{tx.environment}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">FX Rate</span>
              <span className="stat-value">₹{tx.fxRate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// APP
// ============================================================
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!token) navigate('/login'); }, [token]);
  return token ? <>{children}</> : null;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/send" element={<ProtectedRoute><SendMoney /></ProtectedRoute>} />
          <Route path="/tx/:id" element={<ProtectedRoute><TransactionDetail /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
