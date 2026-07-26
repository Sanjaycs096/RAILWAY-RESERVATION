import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, BookOpen, Cpu, Database, Shield, Server, Terminal, Code2, CheckCircle } from 'lucide-react';

export const DocumentationModal: React.FC = () => {
  const { isDocsOpen, setIsDocsOpen } = useAuth();
  const [activeTab, setActiveTab] = useState<'arch' | 'apis' | 'db' | 'security'>('arch');

  if (!isDocsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-6 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Enterprise System Documentation</h2>
              <p className="text-xs text-slate-400">Railway Reservation & Live Tracking Platform (Version 1.0 Phase 1)</p>
            </div>
          </div>

          <button
            onClick={() => setIsDocsOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-2 border-b border-slate-200 dark:border-slate-800 text-xs font-bold gap-2">
          <button
            onClick={() => setActiveTab('arch')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'arch' ? 'bg-indigo-900 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Architecture & Layout
          </button>
          <button
            onClick={() => setActiveTab('apis')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'apis' ? 'bg-indigo-900 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            REST API Endpoints
          </button>
          <button
            onClick={() => setActiveTab('db')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'db' ? 'bg-indigo-900 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Neon PostgreSQL Schema & Indexes
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'security' ? 'bg-indigo-900 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Security & RBAC Policy
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex-1">
          {activeTab === 'arch' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-500" />
                <span>Clean Architecture Overview</span>
              </h3>
              <p>
                The platform is designed around strict separation of concerns, repository patterns, middleware isolation, and unified REST API responses.
              </p>

              <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl font-mono text-[11px] border border-slate-800 leading-normal">
                <pre>{`Railway-Reservation/
├── server.ts                 # Express Entry Point (Port 3000)
├── server/
│   ├── api/                  # Modular REST Routers
│   │   ├── auth.ts           # Auth & JWT Endpoints
│   │   ├── trains.ts         # Train Search & CRUD
│   │   ├── stations.ts       # Station Directory
│   │   ├── routes.ts         # Corridor Routes
│   │   ├── bookings.ts       # Passenger Bookings & PNR
│   │   ├── tracking.ts       # Live GPS Telemetry
│   │   └── admin.ts          # Admin Metrics & Roles
│   ├── database/
│   │   └── db.ts             # Neon PostgreSQL Database ORM & Repository Layer
│   └── middleware/
│       └── auth.ts           # JWT, RBAC & Rate Limiting
└── src/                      # React Frontend App
    ├── api/client.ts         # Unified Typed REST Client
    └── context/AuthContext.tsx`}</pre>
              </div>
            </div>
          )}

          {activeTab === 'apis' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-500" />
                <span>Unified API Standards</span>
              </h3>
              <p>
                All endpoints output unified JSON responses adhering to strict schema contracts:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl">
                  <h4 className="font-bold text-emerald-400 mb-2">Success Response (200 / 201)</h4>
                  <pre className="font-mono text-[10px] text-slate-300">{`{
  "success": true,
  "message": "Operation completed",
  "data": { ... }
}`}</pre>
                </div>

                <div className="p-4 bg-red-950/20 border border-red-500/30 rounded-2xl">
                  <h4 className="font-bold text-red-400 mb-2">Error Response (400 / 401 / 403 / 500)</h4>
                  <pre className="font-mono text-[10px] text-slate-300">{`{
  "success": false,
  "message": "Validation Error",
  "errors": ["Specific failure details"]
}`}</pre>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white">Core REST API Endpoints</h4>
                <ul className="space-y-1 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                  <li><strong className="text-emerald-500">POST</strong> /api/auth/register & /api/auth/login</li>
                  <li><strong className="text-blue-500">GET</strong> /api/trains?from=NDLS&to=MMCT&sortBy=departure</li>
                  <li><strong className="text-blue-500">GET</strong> /api/bookings/seats/:trainNumber/:classType (Seat Map)</li>
                  <li><strong className="text-indigo-500">POST</strong> /api/bookings/create (Multi-Passenger Reservation)</li>
                  <li><strong className="text-red-500">POST</strong> /api/bookings/cancel/:id (Instant Refund Engine)</li>
                  <li><strong className="text-emerald-500">POST</strong> /api/payments/coupon/validate (Promo Coupons)</li>
                  <li><strong className="text-purple-500">GET</strong> /api/notifications/my-notifications & <strong className="text-purple-500">POST</strong> /api/notifications/broadcast</li>
                  <li><strong className="text-blue-500">GET</strong> /api/tracking/live/:trainNumber (GPS Telemetry)</li>
                  <li><strong className="text-amber-500">POST</strong> /api/ai/chat (Groq / Gemini AI Intelligence Assistant)</li>
                  <li><strong className="text-indigo-500">GET</strong> /api/analytics/overview & /api/analytics/reports/download</li>
                  <li><strong className="text-purple-500">GET</strong> /api/admin/metrics & /api/admin/audit-logs</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'db' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-500" />
                <span>Neon PostgreSQL Schema, Indexes & Full-Text Search</span>
              </h3>
              <p>
                Every table uses UUID primary keys, GIN/B-Tree index optimization, foreign key constraints, automatic <code className="text-indigo-400">created_at</code> and <code className="text-indigo-400">updated_at</code> timestamps, soft delete support, and PostgreSQL <code className="text-indigo-400">tsvector</code> full-text search.
              </p>

              <div className="space-y-3">
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-slate-900 dark:text-white">1. users Table (UUID Primary Keys)</h4>
                  <p className="text-[11px] text-slate-500">Indexes: <code className="text-indigo-400">email (unique B-Tree)</code>, <code className="text-indigo-400">role</code>, <code className="text-indigo-400">status</code></p>
                </div>

                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-slate-900 dark:text-white">2. trains Table & Full-Text Search</h4>
                  <p className="text-[11px] text-slate-500">Indexes: <code className="text-indigo-400">train_number (unique)</code>, <code className="text-indigo-400">origin_code + destination_code</code>, <code className="text-indigo-400">GIN (tsvector)</code></p>
                </div>

                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-slate-900 dark:text-white">3. stations Table</h4>
                  <p className="text-[11px] text-slate-500">Indexes: <code className="text-indigo-400">code (unique)</code>, <code className="text-indigo-400">zone</code>, <code className="text-indigo-400">city</code></p>
                </div>

                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-slate-900 dark:text-white">4. bookings & refunds Tables</h4>
                  <p className="text-[11px] text-slate-500">Indexes: <code className="text-indigo-400">pnr (unique)</code>, <code className="text-indigo-400">user_id (FK)</code>, <code className="text-indigo-400">journey_date</code></p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-500" />
                <span>Security Architecture & Policy</span>
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>JWT Authentication:</strong> Signed HS256 tokens with 24-hour expiration for request authorization.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Bcrypt Hashing:</strong> Passwords salted with 10 rounds prior to database persistence.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>RBAC Segregation:</strong> Strict middleware guarding admin endpoints against passenger role escalation.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Audit Logging:</strong> All security events, logins, and administrative modifications recorded with timestamp and IP address.</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
