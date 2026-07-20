# 🏢 RentCan — Property Management Platform

> **Aapka ghar, aur hamari dekhbhal.**  
> Precision property management for India's evolving urban landscape. Serving landlords across **Chandigarh, Mohali (SAS Nagar), and Panchkula**.

---

## 🌐 Live Deployments & Repository Links

- 🚀 **Live Production Site**: [https://rentcan.in](https://rentcan.in)
- 📦 **GitHub Repository**: [github.com/hvndal/rentcanpropertyman](https://github.com/hvndal/rentcanpropertyman)
- ⚙️ **Deployment Platform**: Vercel (Auto-deploys from `main` branch)
- 👤 **Author & Maintainer**: **hvndal** (`hundalg968@gmail.com`)

---

## 📁 Repository Directory Structure

```
.
├── 📂 public/                        # Active Production Web App
│   ├── index.html                   # Homepage (Hero video, Showcase, Pricing, CTA)
│   ├── info.html                    # Comprehensive Services & Pricing Guide (Tabbed layout)
│   ├── login.html                   # Passwordless Auth (Google OAuth + MSG91 SMS OTP)
│   ├── dashboard.html               # Main Landlord Dashboard & Property Manager
│   ├── documents.html               # Property Document Storage Vault
│   ├── payments.html                # Payment Ledger & Rent Tracking
│   ├── reports.html                 # Analytics & PDF Reports Portal
│   ├── inspections.html             # Monthly Inspections & SOS Booking Portal
│   ├── hero-video.mp4               # High-definition background video
│   ├── logo.png                     # Official RentCan Logo
│   ├── styles.css                   # Custom CSS styling & Tailwind extensions
│   ├── 📂 js/
│   │   └── sound_manager.js         # Web Audio API Sound Effects Engine
│   └── 📂 assets/
│       ├── office_placeholder.jpg   # Commercial showcase asset
│       └── residential_placeholder.jpg # Residential showcase asset
│
├── 📂 database/                      # Supabase Database Schema & Policies
│   └── schema.sql                   # Full SQL schema (profiles, properties, documents, inspections, RLS)
│
├── 📂 misc/                          # Design Archives & Reference Material
│   ├── README.md                    # Detailed guide to archived design assets
│   ├── 📂 design_mocks/             # Initial UI design exports & Stitch prototypes
│   └── 📂 legacy_root_files/        # Single-file early development prototypes
│
├── 📄 server.js                      # Express API Server (MSG91 OTP endpoints & config)
├── ⚙️ vercel.json                    # Vercel Serverless Function & Clean URL rewrites
├── 🔒 .gitignore                     # Security hardened git ignore blocklist
└── 📦 package.json                   # Project dependencies & scripts
```

---

## 🔑 Authentication Architecture (Passwordless)

RentCan uses a **100% passwordless authentication architecture**. No passwords are requested, validated, or stored anywhere.

```
                  [ User Enters Site ]
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
    [ Continue with Google ]   [ Continue with Phone ]
             │                           │
             ▼                           ▼
    (Supabase OAuth)            (MSG91 SMS OTP)
             │                           │
             └─────────────┬─────────────┘
                           │
                           ▼
               [ Authenticated Session ]
                           │
              Is Profile Completed in DB?
             ┌─────────────┴─────────────┐
             YES                         NO
             ▼                           ▼
       [ Dashboard ]             [ Onboarding Screen ]
                                 (Name + Landlord/Tenant Role)
                                         │
                                         ▼
                                   [ Dashboard ]
```

---

## 💳 Pricing & Service Plans

| Plan | Base Rate | Additional Property | SOS Emergency Visits | Key Features |
| :--- | :--- | :--- | :--- | :--- |
| **🏠 Residential Core** | **₹1,499** / mo | **+₹799** / mo | **₹500** / visit | Complementary 15-Point Monthly Inspection (5th of every month), Digital Document Vault, Maintenance Coordination, Key Holding |
| **🏢 Commercial & Airbnb** | **₹1,999** / mo | **+₹799** / mo | **₹500** / visit | Everything in Residential, plus Offices, Retail Shops, Warehouses, Commercial Buildings, and **Airbnb Property Support** |

> 🏷️ **Hidden Pricing Tag**: Standardized metadata element embedded in DOM:
> `<div id="pricing-info-tag" style="display:none;" data-pricing-info="hidden" data-residential="1499" data-commercial="1999" data-additional-property="799" data-sos-visit="500" data-currency="INR"></div>`

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla JavaScript, TailwindCSS (v3 CDN), Web Audio API
- **Backend API**: Node.js, Express.js
- **Database & Storage**: Supabase (PostgreSQL, Row Level Security, Auth, Bucket Storage)
- **SMS Gateway**: MSG91 (V5 OTP API)
- **Deployment**: Vercel (Serverless Functions + Edge CDN)

---

## 🗄️ Database Setup (Supabase)

1. Open your project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Open **SQL Editor** -> **New Query**.
3. Paste the contents of `database/schema.sql` and click **Run**.
4. Enable **Google Provider** in Supabase -> Authentication -> Providers, and set redirect URL to `https://rentcan.in/login.html`.

---

## 💻 Local Development

```bash
# Clone the repository
git clone https://github.com/hvndal/rentcanpropertyman.git
cd rentcanpropertyman

# Install dependencies
npm install

# Start local dev server
npm start
# App runs at http://localhost:3000
```

---

## 📋 What is inside `misc/`?

The `misc/` folder houses design prototypes, Stitch code exports, and early mockups. Refer to [`misc/README.md`](misc/README.md) for full breakdown.

---

© 2025 RentCan. Developed by **hvndal** (`hundalg968@gmail.com`).
