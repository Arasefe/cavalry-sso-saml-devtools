# cavalry-sso-saml-devtools

A Microsoft Entra ID SAML 2.0 demo app themed around an internal developer dashboard. Part of the Cavalry SSO demo suite.

**Port:** `3002` · **Protocol:** SAML 2.0 · **Library:** `@node-saml/passport-saml`

---

## Teaching Focus

This app teaches **raw SAML assertion inspection** and **Entity ID uniqueness**.

Students will see:
- The full SAML claims payload rendered as JSON — exactly what Entra ID sends in the assertion
- That the same Entra ID session serves this completely separate SP with the same identity claims
- That each app has a different Entity ID — Entra ID uses this to identify which SP is requesting authentication
- The SP metadata endpoint — in production this XML is shared with the IdP during federation setup

---

## Prerequisites

- Node.js 18+
- A Microsoft Entra ID tenant
- An Entra ID user assigned to the `cavalry-sso-saml-devtools` Enterprise Application

---

## Overview

| Property | Value |
|---|---|
| Port | `3002` |
| Protocol | SAML 2.0 |
| Identity Provider | Microsoft Entra ID (Cavalry tenant) |
| Entity ID | `https://Cavalry77.onmicrosoft.com/cavalry-dev-tools` |
| ACS URL | `http://localhost:3002/auth/saml/callback` |
| Theme | Dark terminal — CI/CD and developer tools |

---

## Setup

```bash
npm install
cp .env.example .env
```

Assign your user in Entra ID:
- Go to **Entra ID → Enterprise Applications → cavalry-sso-saml-devtools → Users and groups**
- Click **Add user/group** and assign yourself

---

## Run

```bash
npm start
```

Navigate to `http://localhost:3002` and click **Sign in with Microsoft Entra ID**.

---

## Endpoints

| Endpoint | Description |
|---|---|
| `GET /` | Dev Tools landing page |
| `GET /auth/saml` | Initiates SAML login — redirects to Entra ID |
| `POST /auth/saml/callback` | ACS URL — receives signed SAML assertion |
| `GET /auth/saml/metadata` | SP metadata XML |
| `GET /dashboard` | Authenticated view — raw JSON SAML claims payload |
| `GET /logout` | Destroys local session |

---

## SSO Demo Sequence

```bash
# Terminal 1
cd ~/Desktop/cavalry-sso-saml-hr && npm start

# Terminal 2
cd ~/Desktop/cavalry-sso-saml-devtools && npm start

# Terminal 3
cd ~/Desktop/cavalry-sso-saml-finance && npm start
```

**Demo sequence:**
1. Open `http://localhost:3001` — sign in with Entra ID (credentials + MFA)
2. Open `http://localhost:3002` — **automatically authenticated** — show the raw claims JSON on this dashboard
3. Open `http://localhost:3003` — same
4. Point out that all three apps received the same `nameID`, `email`, and `objectidentifier` claims from the same Entra ID session

---

## Entra ID Registration

| Setting | Value |
|---|---|
| Enterprise App | `cavalry-sso-saml-devtools` |
| Service Principal ID | `fb2b6308-5e66-4e7c-9482-f8e247711019` |
| App Registration ID | `e5ffd956-8c52-44b2-9de0-e49d0f163c8f` |
| SSO Mode | SAML |
| Tenant | Cavalry (`61afc170-5fe3-4cd5-adaf-95fcfe0b6897`) |

---

## Part of the Cavalry Demo Suite

| App | Port | Protocol | Focus |
|---|---|---|---|
| `cavalry-sso-saml-hr` | 3001 | SAML | SAML claims table |
| `cavalry-sso-saml-devtools` | 3002 | SAML | Raw SAML assertion payload |
| `cavalry-sso-saml-finance` | 3003 | SAML | User assignment access control |
| `cavalry-sso-saml-portal` | 3004 | SAML | SP-initiated SAML flow walkthrough |
| `cavalry-sso-saml-operations` | 3005 | SAML | Session metadata & continuity |
| `cavalry-sso-oidc-finance` | 4001 | OIDC | ID Token claims & JWT structure |
| `cavalry-sso-oidc-hr` | 4002 | OIDC | SSO session reuse & `sid` claim |
| `cavalry-sso-oidc-marketing` | 4003 | OIDC | Scopes, access token vs ID token |
