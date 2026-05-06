# cavalry-dev-tools

A SAML 2.0 demo application styled as an internal developer dashboard. Part of the Cavalry SSO demo suite — used alongside `cavalry-hr-portal` and `cavalry-finance` to demonstrate that a single Entra ID login grants access to multiple independent applications.

## Overview

| Property | Value |
|----------|-------|
| Port | 3002 |
| Protocol | SAML 2.0 |
| Identity Provider | Microsoft Entra ID (Cavalry tenant) |
| Entity ID | `https://Cavalry77.onmicrosoft.com/cavalry-dev-tools` |
| ACS URL | `http://localhost:3002/auth/saml/callback` |
| Theme | Dark terminal — CI/CD and developer tools |

## Prerequisites

- Node.js 18+
- An Entra ID user assigned to the `cavalry-dev-tools` Enterprise Application

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. The `.env` file is pre-configured. No changes needed for local development.

3. Assign your user in Entra ID:
   - Go to **Entra ID → Enterprise Applications → cavalry-dev-tools → Users and groups**
   - Click **Add user/group** and assign yourself

## Running

```bash
npm start
```

Then open `http://localhost:3002` in your browser.

## SSO Demo Instructions

Run all three apps in the suite simultaneously to demonstrate Single Sign-On:

```bash
# Terminal 1
cd ~/Desktop/cavalry-hr-portal && npm start

# Terminal 2
cd ~/Desktop/cavalry-dev-tools && npm start

# Terminal 3
cd ~/Desktop/cavalry-finance && npm start
```

**Demo sequence for students:**
1. Open `http://localhost:3001` — sign in with Entra ID (credentials + MFA)
2. Open `http://localhost:3002` — **automatically authenticated** without re-entering credentials
3. Open `http://localhost:3003` — same
4. Show students the raw JSON claims payload on this app's dashboard — it's the exact data Entra ID sent in the SAML assertion

## Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | Dev Tools landing page (dark theme) |
| `GET /auth/saml` | Initiates SAML login |
| `POST /auth/saml/callback` | ACS URL — receives SAML assertion |
| `GET /auth/saml/metadata` | SP metadata XML |
| `GET /dashboard` | Authenticated view with raw JSON claims payload |
| `GET /logout` | Destroys local session |

## Entra ID Registration

| Setting | Value |
|---------|-------|
| Enterprise App | `cavalry-dev-tools` |
| Service Principal ID | `fb2b6308-5e66-4e7c-9482-f8e247711019` |
| App Registration ID | `e5ffd956-8c52-44b2-9de0-e49d0f163c8f` |
| SSO Mode | SAML |
| Tenant | Cavalry (`61afc170-5fe3-4cd5-adaf-95fcfe0b6897`) |

## What This App Teaches

- **Raw SAML claims**: The dashboard renders the full claims payload as JSON — ideal for showing students exactly what data travels from Entra ID to each SP
- **Same IdP, different SP**: Even though this is a completely separate app from HR Portal and Finance, it receives the same identity claims from the same Entra ID session
- **Entity ID uniqueness**: Each app has a different entity ID — Entra ID uses this to identify which SP is requesting authentication and which token signing configuration to apply
- **SP metadata**: The `/auth/saml/metadata` endpoint exposes the SP's metadata XML — in production this is shared with the IdP during federation setup
