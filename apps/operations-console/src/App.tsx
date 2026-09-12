import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, ArrowLeftRight, ShieldCheck, Activity, AlertTriangle, Users, Settings } from 'lucide-react';
import './index.css';

const API_URL = 'http://localhost:4000/api';
axios.defaults.headers.common['Authorization'] = 'ops-admin-token';

function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <Settings size={24} /> GYB Operations
      </div>
      <div className="sidebar-nav">
        <Link to="/" className="nav-item"><LayoutDashboard size={18} /> Dashboard</Link>
        <Link to="/transactions" className="nav-item"><ArrowLeftRight size={18} /> Transactions</Link>
        <Link to="/connectors" className="nav-item"><Activity size={18} /> Connectors</Link>
        <Link to="/compliance" className="nav-item"><ShieldCheck size={18} /> Compliance</Link>
        <Link to="/readiness" className="nav-item"><AlertTriangle size={18} /> Production Readiness</Link>
        <Link to="/customers" className="nav-item"><Users size={18} /> Customers</Link>
      </div>
    </nav>
  );
}

function OpsDashboard() {
  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Operations Dashboard</h2>
      <div className="grid-3">
        <div className="card stat-card">
          <span style={{ color: 'var(--text-muted)' }}>Total Transactions</span>
          <span className="stat-value">1,247</span>
        </div>
        <div className="card stat-card">
          <span style={{ color: 'var(--text-muted)' }}>Pending Review</span>
          <span className="stat-value" style={{ color: 'var(--warning)' }}>3</span>
        </div>
        <div className="card stat-card">
          <span style={{ color: 'var(--text-muted)' }}>UNKNOWN States</span>
          <span className="stat-value" style={{ color: 'var(--danger)' }}>1</span>
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>Recent Activity</h3>
        <table>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Corridor</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><Link to="/transactions/tx-001" style={{ color: 'var(--primary)' }}>GYB-TX-001</Link></td>
              <td>John Doe</td>
              <td>£500.00 → ₹52,750.00</td>
              <td>UK → IN</td>
              <td><span className="status-badge status-success">COMPLETED</span></td>
              <td>2 min ago</td>
            </tr>
            <tr>
              <td><Link to="/transactions/tx-002" style={{ color: 'var(--primary)' }}>GYB-TX-002</Link></td>
              <td>Jane Smith</td>
              <td>£1,200.00 → ₹126,600.00</td>
              <td>UK → IN</td>
              <td><span className="status-badge status-warning">UNKNOWN</span></td>
              <td>15 min ago</td>
            </tr>
            <tr>
              <td><Link to="/transactions/tx-003" style={{ color: 'var(--primary)' }}>GYB-TX-003</Link></td>
              <td>Bob Wilson</td>
              <td>£250.00 → ₹26,375.00</td>
              <td>UK → IN</td>
              <td><span className="status-badge status-danger">FAILED</span></td>
              <td>1 hour ago</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TransactionDetail() {
  const { id } = useParams();
  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Transaction Detail: GYB-{id?.toUpperCase()}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>Customer & Order</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div><span style={{ color: 'var(--text-muted)' }}>Customer ID:</span> user-123</div>
            <div><span style={{ color: 'var(--text-muted)' }}>Order ID:</span> {id}</div>
            <div><span style={{ color: 'var(--text-muted)' }}>Rail Transaction:</span> rail-{id}</div>
            <div><span style={{ color: 'var(--text-muted)' }}>Ledger Tx:</span> ldg-{id}</div>
            <div><span style={{ color: 'var(--text-muted)' }}>Amount:</span> £500.00</div>
            <div><span style={{ color: 'var(--text-muted)' }}>FX Rate:</span> 1 GBP = ₹105.50</div>
            <div><span style={{ color: 'var(--text-muted)' }}>Destination:</span> ₹52,750.00</div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>Rail Lifecycle</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {['CREATED', 'COMPLIANCE_APPROVED', 'LEDGER_RESERVED', 'FX_LOCKED', 'FUNDING_CONFIRMED', 'SETTLEMENT_SUBMITTED', 'SETTLEMENT_CONFIRMED', 'RECONCILED', 'COMPLETED'].map((state, i) => (
              <div key={state} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: i < 7 ? 'var(--success)' : i === 7 ? 'var(--warning)' : 'var(--border)' }}></div>
                <span style={{ color: i < 7 ? 'var(--text-light)' : 'var(--text-muted)' }}>{state.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>Compliance Decision</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div><span style={{ color: 'var(--text-muted)' }}>KYC:</span> <span className="status-badge status-success">VERIFIED</span></div>
            <div><span style={{ color: 'var(--text-muted)' }}>AML:</span> <span className="status-badge status-success">CLEAR</span></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Sanctions:</span> <span className="status-badge status-success">CLEAR</span></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Fraud Score:</span> 0.02</div>
            <div><span style={{ color: 'var(--text-muted)' }}>Risk Level:</span> LOW</div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>External Settlement</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div><span style={{ color: 'var(--text-muted)' }}>Connector:</span> india-settlement-connector</div>
            <div><span style={{ color: 'var(--text-muted)' }}>Environment:</span> <span className="status-badge status-warning">SANDBOX</span></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Provider Ref:</span> in-stl-{Date.now()}</div>
            <div><span style={{ color: 'var(--text-muted)' }}>Settlement Status:</span> <span className="status-badge status-success">COMPLETED</span></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Reconciliation:</span> <span className="status-badge status-success">MATCHED</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConnectorsPage() {
  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Connector Health</h2>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Connector</th>
              <th>Environment</th>
              <th>Status</th>
              <th>Latency</th>
              <th>Last Success</th>
              <th>Credential Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>UK Settlement Connector</td>
              <td><span className="status-badge status-warning">SANDBOX</span></td>
              <td><span className="status-badge status-success">HEALTHY</span></td>
              <td>12ms</td>
              <td>Just now</td>
              <td>VAULT_REF</td>
            </tr>
            <tr>
              <td>India Settlement Connector</td>
              <td><span className="status-badge status-warning">SANDBOX</span></td>
              <td><span className="status-badge status-success">HEALTHY</span></td>
              <td>18ms</td>
              <td>Just now</td>
              <td>VAULT_REF</td>
            </tr>
            <tr>
              <td>FX Provider (Sandbox)</td>
              <td><span className="status-badge status-warning">SANDBOX</span></td>
              <td><span className="status-badge status-success">HEALTHY</span></td>
              <td>5ms</td>
              <td>Just now</td>
              <td>VAULT_REF</td>
            </tr>
            <tr>
              <td>UK Settlement Connector</td>
              <td><span className="status-badge status-danger">PRODUCTION</span></td>
              <td><span className="status-badge status-danger">SUSPENDED</span></td>
              <td>—</td>
              <td>Never</td>
              <td>NOT_CONFIGURED</td>
            </tr>
            <tr>
              <td>India Settlement Connector</td>
              <td><span className="status-badge status-danger">PRODUCTION</span></td>
              <td><span className="status-badge status-danger">SUSPENDED</span></td>
              <td>—</td>
              <td>Never</td>
              <td>NOT_CONFIGURED</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductionReadiness() {
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
  const total = gates.length;

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Production Readiness</h2>

      <div className="card" style={{ marginBottom: '24px', textAlign: 'center', padding: '32px' }}>
        <div style={{ fontSize: '64px', fontWeight: '700', color: 'var(--danger)' }}>{passed}/{total}</div>
        <div style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Gates Passed</div>
        <div style={{ marginTop: '16px' }}>
          <span className="status-badge status-danger" style={{ fontSize: '16px', padding: '8px 16px' }}>
            REAL_MONEY_EXECUTION = BLOCKED
          </span>
        </div>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Gate</th>
              <th>Status</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {gates.map(gate => (
              <tr key={gate.name}>
                <td>{gate.name}</td>
                <td>
                  <span className={`status-badge ${gate.status === 'PASS' ? 'status-success' : 'status-danger'}`}>
                    {gate.status}
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted)' }}>{gate.reason || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="dashboard-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<OpsDashboard />} />
            <Route path="/transactions" element={<OpsDashboard />} />
            <Route path="/transactions/:id" element={<TransactionDetail />} />
            <Route path="/connectors" element={<ConnectorsPage />} />
            <Route path="/readiness" element={<ProductionReadiness />} />
            <Route path="/compliance" element={<div className="card"><h3>Compliance Review Queue</h3><p style={{color:'var(--text-muted)',marginTop:'16px'}}>No pending reviews.</p></div>} />
            <Route path="/customers" element={<div className="card"><h3>Customer Management</h3><p style={{color:'var(--text-muted)',marginTop:'16px'}}>Customer list coming from API.</p></div>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
