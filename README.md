<div align="center">

  <img src="public/logo.png" alt="RentCan Mark" width="110" style="border-radius:20px; margin-bottom: 20px; box-shadow: 0 8px 30px rgba(0,0,0,0.12);">

  # RentCan — Global Asset Stewardship & Mobile Web Platform

  **Institutional-grade property governance and remote asset protection.**  
  *Engineered for mobile-first global property owners, international investors, and modern landlords worldwide.*

  [![Live Production](https://img.shields.io/badge/Global_Platform-https%3A%2F%2Frentcan.in-023826?style=for-the-badge&logo=vercel&logoColor=white)](https://rentcan.in)
  [![GitHub Repository](https://img.shields.io/badge/Repository-hvndal%2Frentcanpropertyman-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/hvndal/rentcanpropertyman)
  [![Supabase](https://img.shields.io/badge/Architecture-Supabase_PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
  [![Node.js](https://img.shields.io/badge/Runtime-Node.js_Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
  [![TailwindCSS](https://img.shields.io/badge/Design_System-TailwindCSS_v3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## 🌍 Global Product Philosophy

> **"Ownership without friction. Stewardship with proof."**

RentCan was conceived as a **global asset governance platform**. Rather than treating real estate management as an informal or fragmented task, RentCan provides international property owners (NRIs based in Canada, USA, UK, UAE, Australia, etc.) and local landlords with **institutional-grade transparency, remote control, and digital asset protection**.

### 🏛️ Core Principles

1. **Proof Over Promises**  
   Every physical property inspection produces a standardized 15-point diagnostic report backed by high-resolution imagery and immutable timestamps.
2. **Zero Password Friction**  
   Modern identity belongs to passwordless credentials. Direct OAuth 2.0 federated identities and instant SMS OTP ensure seamless global access.
3. **Institutional Asset Stewardship**  
   Eliminating informal verbal arrangements in favor of cloud-archived legal agreements, verified tenant identity records, and systematic key management.
4. **Mobile-First App Substitute (99% Mobile Browsing Optimization)**  
   Engineered to serve as a native app replacement on mobile devices. Features dedicated bottom navigation app bars, touch-optimized tap targets, and PWA capabilities.

---

## 📱 Mobile-First App Redesign (Native App Substitute)

Recognizing that **over 99% of users access the platform via mobile devices**, the entire web application is engineered to act as a **seamless native app substitute**:

- **Mobile Bottom Navigation App Bar**: Fixed iOS/Android-style bottom navigation bar on all mobile viewports for instant one-thumb access to Properties, Inspections, Vault, Ledger, and Reports.
- **PWA Meta Capabilities**: `theme-color="#023826"`, `apple-mobile-web-app-capable`, and `mobile-web-app-capable` support.
- **Touch-Optimized Interactions**: Touch manipulation parameters (`touch-action: manipulation`) and `-webkit-tap-highlight-color: transparent` across all interactive elements.

---

## 🎨 UI/UX Design System & Architectural Craftsmanship

> **Design & Engineering**: Entire UI/UX architecture, visual branding, typography, color palettes, micro-animations, and frontend components were **conceived, designed, and engineered by `hvndal`**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          GLOBAL DESIGN TOKENS                               │
│                                                                             │
│   🌲 Deep Emerald (#023826)      🌸 Rose Magenta (#854f5b)                   │
│   Institutional Authority         Priority Accents & Actions                │
│                                                                             │
│   🌿 Commercial Sage (#f2f8f5)   🌷 Residential Rose (#fff5f7)               │
│   Square-Curved Tint (14px)       Square-Curved Tint (14px)                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

- **Swiss Modernist Layout**: High-density, grid-aligned typography utilizing **Playfair Display** (editorial cursive display) and **Plus Jakarta Sans** (clean geometric sans).
- **Square-Curved Geometry**: Information tiles feature precision-engineered `14px` (`rounded-2xl`) corners with subtle color-tinted boundaries (`#fff5f7` for Residential, `#f2f8f5` for Commercial).
- **Sub-Frame Render Pipeline**: `RequestAnimationFrame` cascade engine ensuring zero Cumulative Layout Shift (CLS: 0) during page load transitions.

---

## ⚡ Technical Capabilities & Engineering Specs

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                               CLIENT FRONTEND                                │
│                                                                              │
│   ┌─────────────────────┐  ┌──────────────────────┐  ┌───────────────────┐   │
│   │ Single Page App (JS)│  │ Custom UI/UX Engine  │  │ Web Audio Engine  │   │
│   │ ES6+ / Responsive   │  │ Mobile Bottom Bar    │  │ Web Oscillators   │   │
│   └──────────┬──────────┘  └──────────┬───────────┘  └─────────┬─────────┘   │
└──────────────┼────────────────────────┼────────────────────────┼─────────────┘
               │                        │                        │
               ▼                        ▼                        ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                        EDGE & API LAYER (Serverless Vercel)                  │
│                                                                              │
│   ┌───────────────────────────────────────────────────────────────────────┐  │
│   │ Express.js Serverless Gateway (/api/config, /api/send-otp, etc.)     │  │
│   └───────────────────────────────────┬───────────────────────────────────┘  │
└───────────────────────────────────────┼──────────────────────────────────────┘
                                        │
             ┌──────────────────────────┴──────────────────────────┐
             ▼                                                     ▼
┌──────────────────────────────────────┐                ┌──────────────────────┐
│       SUPABASE DATABASE (BaaS)       │                │    MSG91 SMS ENGINE  │
│  - PostgreSQL Engine                 │                │  - V5 OTP Gateway    │
│  - Auth (Google OAuth 2.0 PKCE)      │                │  - Mobile Auth       │
│  - Row Level Security (RLS)          │                └──────────────────────┘
│  - Encrypted Storage Buckets         │
└──────────────────────────────────────┘
```

### 🔊 1. Zero-Latency Synthesized Web Audio Engine (`sound_manager.js`)
RentCan incorporates a **zero-asset Web Audio API synthesizer** generating real-time acoustic feedback directly via browser hardware oscillators:
- **Tactile Click Ticks**: Frequency-ramped sine wave (600Hz ➔ 100Hz over 50ms) for high-precision navigation response.
- **Success Harmonics**: Dual-frequency arpeggio (C5 ➔ E5) for critical action verification.
- **Zero HTTP Overhead**: **0 KB audio payload**, eliminating network latency completely.

### 🔐 2. Passwordless Zero-Trust Auth Architecture
- **Google OAuth 2.0 PKCE**: Federated authentication managed via Supabase Auth.
- **MSG91 V5 Mobile Verification**: Express API proxy handles mobile OTP dispatch and token validation with automatic development mock fallbacks.
- **PostgreSQL Row Level Security (RLS)**: Immutable database-level authorization (`auth.uid() = id`). Data remains completely isolated per user account.

### 📄 3. Cloud Document Vault & Inspection Engine
- **Cloud Document Storage**: Encrypted bucket storage for lease contracts, tenant identity verification, and property photographs.
- **Routine Inspection Engine**: Automated monthly 15-point diagnostic verification on the **5th of every month**.
- **On-Demand Emergency Response**: 4-hour SLA emergency inspection request system with auto-generated PDF report archiving.

---

## 📊 PostgreSQL Database Schema

```sql
-- 1. Identity & Profile Governance
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'landlord', -- 'landlord' or 'tenant'
    avatar_url TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Managed Property Assets
CREATE TABLE public.properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    property_type VARCHAR(50) NOT NULL, -- 'Residential', 'Commercial'
    expected_rent NUMERIC NOT NULL,
    tenant_name VARCHAR(255) DEFAULT 'Vacant',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Document Vault & Legal Archives
CREATE TABLE public.documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL, -- Lease, KYC, Police Verification
    file_name VARCHAR(255) NOT NULL,
    storage_path TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Verified',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Property Health & Inspection Logs
CREATE TABLE public.inspections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    inspection_type VARCHAR(50) NOT NULL, -- 'Monthly Routine', 'SOS Emergency'
    scheduled_date DATE NOT NULL,
    cost NUMERIC DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Scheduled',
    report_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

---

## 📡 API Endpoint Architecture

| Method | Endpoint | Description | Payload / Query |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status & ISO timestamp | None |
| `GET` | `/api/config` | Exposes public Supabase URL & anon key | None |
| `POST` | `/api/send-otp` | Mobile OTP dispatch gateway | `{ "phone": "+919876543210" }` |
| `POST` | `/api/verify-otp` | Verifies 6-digit OTP code against request ID | `{ "phone": "...", "otp": "123456", "request_id": "..." }` |

---

## 📁 Repository Sitemap & Code Structure

```
.
├── 📂 public/                        # Production Web Application (Edge CDN Served)
│   ├── index.html                   # Landing Experience (Hero Video, Showcase, Plans)
│   ├── info.html                    # Interactive Services & Platform Guide (Tabbed Layout)
│   ├── login.html                   # Passwordless Identity Gateway (Google OAuth + Mobile OTP)
│   ├── dashboard.html               # Primary Landlord Governance Control Center
│   ├── documents.html               # Cloud Document Vault Portal
│   ├── payments.html                # Payment Ledger & Asset Ledger
│   ├── reports.html                 # Diagnostic PDF Reports Portal
│   ├── inspections.html             # Routine & On-Demand Inspection Portal
│   ├── hero-video.mp4               # High-definition video background asset
│   ├── logo.png                     # Official RentCan Brand Mark
│   ├── styles.css                   # Tailwind Extensions & custom styling
│   ├── 📂 js/
│   │   └── sound_manager.js         # Web Audio API Synthesizer Engine
│   └── 📂 assets/
│       ├── office_placeholder.jpg   # Commercial asset showcase
│       └── residential_placeholder.jpg # Residential asset showcase
│
├── 📂 database/                      # Supabase Schemas & Migration Files
│   └── schema.sql                   # SQL Schema & Row Level Security Policies
│
├── 📂 misc/                          # Design Archives & Engineering Tokens
│   ├── README.md                    # Archive contents documentation
│   ├── 📂 design_mocks/             # Original UI mockups, screenshots & tokens
│   └── 📂 legacy_root_files/        # Early development prototypes
│
├── 📄 server.js                      # Express Serverless API Gateway Server
├── ⚙️ vercel.json                    # Vercel Configuration & Serverless Rewrites
├── 🔒 .gitignore                     # Hardened Security Blocklist
└── 📦 package.json                   # Project Dependencies & Manifest
```

---

## 💻 Local Setup & Development

```bash
# 1. Clone repository
git clone https://github.com/hvndal/rentcanpropertyman.git
cd rentcanpropertyman

# 2. Install dependencies
npm install

# 3. Configure environment variables (.env)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
MSG91_AUTH_KEY=your_msg91_auth_key
MSG91_TEMPLATE_ID=your_msg91_template_id

# 4. Launch local development instance
npm start
# Application active on http://localhost:3000
```

---

## 👤 Author & Lead Engineer

- **Lead Engineer & UI/UX Designer**: **hvndal**
- **Email**: `hundalg968@gmail.com`
- **GitHub**: [github.com/hvndal/rentcanpropertyman](https://github.com/hvndal/rentcanpropertyman)
- **Live Production Platform**: [https://rentcan.in](https://rentcan.in)

---

*© 2025 RentCan. Engineered for institutional property governance, mobile-first performance, and borderless real estate control.*
