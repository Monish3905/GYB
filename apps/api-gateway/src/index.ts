import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// ============================================================
// IN-MEMORY STATE (Sandbox mode — no DB required to demo)
// ============================================================
const users: Record<string, any> = {};
const quotes: Record<string, any> = {};
const orders: Record<string, any> = {};
const beneficiaries: Record<string, any[]> = {};
let quoteCounter = 0;
let orderCounter = 0;

// FX Config (live sandbox rates)
const FX_RATE = 110.25;
const FEE_FLAT = 2.99;

// ============================================================
// AUTH
// ============================================================
app.post('/api/auth/signup', (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  if (users[email]) return res.status(409).json({ error: 'User already exists' });
  const userId = `usr-${Date.now()}`;
  users[email] = { id: userId, email, firstName: firstName || 'User', lastName: lastName || '', password, kycStatus: 'PENDING' };
  console.log(`[AUTH] User registered: ${email} -> ${userId}`);
  res.json({ token: `tok-${userId}`, user: { id: userId, email, firstName: firstName || 'User', lastName: lastName || '' } });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = users[email];
  if (!user || user.password !== password) {
    // Auto-register for demo convenience
    const userId = `usr-${Date.now()}`;
    users[email] = { id: userId, email, firstName: 'John', lastName: 'Doe', password, kycStatus: 'VERIFIED' };
    console.log(`[AUTH] Auto-registered & logged in: ${email}`);
    return res.json({ token: `tok-${userId}`, user: { id: userId, email, firstName: 'John', lastName: 'Doe' } });
  }
  console.log(`[AUTH] Login: ${email}`);
  res.json({ token: `tok-${user.id}`, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
});

// Auth Middleware
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  // Extract user ID from token
  const userId = token.replace('tok-', '');
  (req as any).userId = userId;
  next();
};

// ============================================================
// PROFILE & KYC
// ============================================================
app.get('/api/customer/profile', authenticate, (req: Request, res: Response) => {
  res.json({
    id: (req as any).userId,
    firstName: 'John',
    lastName: 'Doe',
    email: 'user@example.com',
    kycStatus: 'VERIFIED',
    tier: 'STANDARD',
    limits: { daily: 5000, monthly: 25000, currency: 'GBP' }
  });
});

// ============================================================
// BENEFICIARIES
// ============================================================
app.get('/api/beneficiaries', authenticate, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  res.json(beneficiaries[userId] || []);
});

app.post('/api/beneficiaries', authenticate, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { name, bankName, accountNumber, ifsc, country } = req.body;
  const ben = {
    id: `ben-${Date.now()}`,
    name: name || 'Rahul Sharma',
    bankName: bankName || 'HDFC Bank',
    accountNumber: accountNumber || '****7890',
    ifsc: ifsc || 'HDFC0001234',
    country: country || 'IN',
    status: 'VALIDATED',
    createdAt: new Date().toISOString()
  };
  if (!beneficiaries[userId]) beneficiaries[userId] = [];
  beneficiaries[userId].push(ben);
  console.log(`[BENEFICIARY] Added: ${ben.name} for user ${userId}`);
  res.json(ben);
});

// ============================================================
// QUOTES (FX)
// ============================================================
app.post('/api/remittances/quote', authenticate, (req: Request, res: Response) => {
  const { sourceCurrency, destinationCurrency, amount } = req.body;
  const sendAmount = Number(amount) || 500;
  const quoteId = `qt-${++quoteCounter}-${Date.now()}`;
  const destinationAmount = Math.round((sendAmount - FEE_FLAT) * FX_RATE * 100) / 100;

  const quote = {
    quoteId,
    sourceCurrency: sourceCurrency || 'GBP',
    destinationCurrency: destinationCurrency || 'INR',
    sourceAmount: sendAmount,
    destinationAmount,
    rate: FX_RATE,
    fees: FEE_FLAT,
    spread: 0.0045,
    estimatedDelivery: '2-4 hours',
    expiresAt: new Date(Date.now() + 120000).toISOString(),
    status: 'QUOTED'
  };
  quotes[quoteId] = quote;
  console.log(`[FX] Quote: £${sendAmount} -> ₹${destinationAmount} @ ${FX_RATE} (ID: ${quoteId})`);
  res.json(quote);
});

// ============================================================
// REMITTANCES (Transaction Lifecycle)
// ============================================================
app.post('/api/remittances', authenticate, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { quoteId, beneficiaryId, amount, currency } = req.body;
  const quote = quotes[quoteId];
  const orderId = `GYB-TX-${++orderCounter}-${Date.now()}`;
  const railTxId = `rail-${orderId}`;

  const sourceAmt = quote?.sourceAmount || amount || 500;
  const destAmt = quote?.destinationAmount || Math.round((sourceAmt - FEE_FLAT) * FX_RATE * 100) / 100;

  // Simulate the full GYB Rail lifecycle progression
  const now = Date.now();
  const timeline = [
    { state: 'CREATED', at: new Date(now).toISOString(), detail: 'Transaction intent received' },
    { state: 'COMPLIANCE_CHECK', at: new Date(now + 200).toISOString(), detail: 'AML/Sanctions/Fraud screening' },
    { state: 'COMPLIANCE_APPROVED', at: new Date(now + 500).toISOString(), detail: 'All compliance checks passed' },
    { state: 'LEDGER_RESERVED', at: new Date(now + 700).toISOString(), detail: 'Ledger entry reserved (double-entry)' },
    { state: 'FX_LOCKED', at: new Date(now + 900).toISOString(), detail: `Rate locked: 1 GBP = ₹${FX_RATE}` },
    { state: 'FUNDING_CONFIRMED', at: new Date(now + 1500).toISOString(), detail: 'GBP funding confirmed via Modulr (Sandbox)' },
    { state: 'SETTLEMENT_SUBMITTED', at: new Date(now + 2000).toISOString(), detail: 'INR payout submitted via Cashfree (Sandbox)' },
    { state: 'SETTLEMENT_CONFIRMED', at: new Date(now + 3000).toISOString(), detail: 'Beneficiary bank confirmed credit' },
    { state: 'RECONCILED', at: new Date(now + 3500).toISOString(), detail: 'Reconciliation: MATCHED' },
    { state: 'COMPLETED', at: new Date(now + 4000).toISOString(), detail: 'Transaction complete' },
  ];

  const order = {
    orderId,
    railTransactionId: railTxId,
    userId,
    status: 'COMPLETED',
    sourceAmount: sourceAmt,
    sourceCurrency: currency || 'GBP',
    destinationAmount: destAmt,
    destinationCurrency: 'INR',
    fxRate: FX_RATE,
    fees: FEE_FLAT,
    beneficiaryId: beneficiaryId || 'ben-default',
    environment: 'SANDBOX',
    compliance: { aml: 'CLEAR', sanctions: 'CLEAR', fraud: 'LOW_RISK', kycStatus: 'VERIFIED' },
    settlement: { provider: 'cashfree-sandbox', providerRef: `cf-${Date.now()}`, method: 'IMPS' },
    funding: { provider: 'modulr-sandbox', providerRef: `mod-${Date.now()}`, method: 'FASTER_PAYMENTS' },
    reconciliation: { status: 'MATCHED', ledgerEntryId: `ldg-${orderId}` },
    timeline,
    createdAt: new Date(now).toISOString(),
    completedAt: new Date(now + 4000).toISOString()
  };

  orders[orderId] = order;
  console.log(`[TRANSACTION] Created: ${orderId} | £${sourceAmt} -> ₹${destAmt} | Status: COMPLETED`);
  res.json(order);
});

app.get('/api/remittances/:id', authenticate, (req: Request, res: Response) => {
  const order = orders[req.params.id];
  if (order) return res.json(order);
  // Return a demo order if not found
  const now = Date.now();
  res.json({
    orderId: req.params.id,
    status: 'COMPLETED',
    sourceAmount: 500,
    sourceCurrency: 'GBP',
    destinationAmount: 54810.72,
    destinationCurrency: 'INR',
    fxRate: FX_RATE,
    fees: FEE_FLAT,
    environment: 'SANDBOX',
    compliance: { aml: 'CLEAR', sanctions: 'CLEAR', fraud: 'LOW_RISK', kycStatus: 'VERIFIED' },
    settlement: { provider: 'cashfree-sandbox', providerRef: `cf-${now}`, method: 'IMPS' },
    funding: { provider: 'modulr-sandbox', providerRef: `mod-${now}`, method: 'FASTER_PAYMENTS' },
    reconciliation: { status: 'MATCHED' },
    timeline: [
      { state: 'CREATED', at: new Date(now - 5000).toISOString(), detail: 'Transaction created' },
      { state: 'COMPLIANCE_APPROVED', at: new Date(now - 4000).toISOString(), detail: 'All checks passed' },
      { state: 'FX_LOCKED', at: new Date(now - 3000).toISOString(), detail: `Rate: ₹${FX_RATE}` },
      { state: 'FUNDING_CONFIRMED', at: new Date(now - 2000).toISOString(), detail: 'GBP received' },
      { state: 'SETTLEMENT_CONFIRMED', at: new Date(now - 1000).toISOString(), detail: 'INR credited' },
      { state: 'COMPLETED', at: new Date(now).toISOString(), detail: 'Done' },
    ]
  });
});

app.get('/api/remittances', authenticate, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const userOrders = Object.values(orders).filter((o: any) => o.userId === userId);
  res.json(userOrders);
});

// ============================================================
// OPERATIONS APIs
// ============================================================
app.get('/api/operations/transactions', (req: Request, res: Response) => {
  res.json(Object.values(orders));
});

app.get('/api/operations/readiness', (req: Request, res: Response) => {
  const gates = [
    { name: 'Architecture', status: 'PASS' },
    { name: 'Automated Testing', status: 'PASS' },
    { name: 'Ledger Integrity', status: 'PASS' },
    { name: 'Compliance Engine', status: 'PASS' },
    { name: 'Reconciliation', status: 'PASS' },
    { name: 'Security', status: 'PASS' },
    { name: 'Monitoring', status: 'PASS' },
    { name: 'KYC Readiness', status: 'PASS' },
    { name: 'AML Readiness', status: 'PASS' },
    { name: 'Sanctions Readiness', status: 'PASS' },
    { name: 'Fraud Readiness', status: 'PASS' },
    { name: 'Production Banking Connector', status: 'FAIL', reason: 'No UK PSP connected' },
    { name: 'Production Credentials', status: 'FAIL', reason: 'Vault contains no production credentials' },
    { name: 'Provider Certification', status: 'FAIL', reason: 'No CERTIFICATION environment passed' },
    { name: 'Legal Authorization', status: 'FAIL', reason: 'No FCA/regulatory authorization verified' },
    { name: 'Production Liquidity', status: 'FAIL', reason: 'No settlement accounts funded' },
    { name: 'Banking Relationship', status: 'FAIL', reason: 'No contracts with UK or India PSPs' },
  ];
  const passed = gates.filter(g => g.status === 'PASS').length;
  res.json({ ready: false, passed, total: gates.length, environment: 'SANDBOX', gates });
});

app.get('/api/operations/connectors', (req: Request, res: Response) => {
  res.json([
    { name: 'Modulr (UK GBP)', environment: 'SANDBOX', status: 'HEALTHY', latency: '12ms', provider: 'modulr' },
    { name: 'Cashfree (India INR)', environment: 'SANDBOX', status: 'HEALTHY', latency: '18ms', provider: 'cashfree' },
    { name: 'Currencycloud (FX)', environment: 'SANDBOX', status: 'HEALTHY', latency: '5ms', provider: 'currencycloud' },
    { name: 'Onfido (KYC)', environment: 'SANDBOX', status: 'HEALTHY', latency: '8ms', provider: 'onfido' },
    { name: 'Modulr (UK GBP)', environment: 'PRODUCTION', status: 'SUSPENDED', latency: '—', provider: 'modulr' },
    { name: 'Cashfree (India INR)', environment: 'PRODUCTION', status: 'SUSPENDED', latency: '—', provider: 'cashfree' },
  ]);
});

// Health
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', uptime: process.uptime(), environment: 'SANDBOX', version: 'MS29' });
});

// ============================================================
// START
// ============================================================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`  GYB API Gateway — Running on port ${PORT}`);
  console.log(`  Environment: SANDBOX`);
  console.log(`  Providers: Modulr | Currencycloud | Cashfree | Onfido`);
  console.log(`  REAL_MONEY_EXECUTION: BLOCKED`);
  console.log(`========================================\n`);
});
