require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const { Strategy: SamlStrategy } = require("@node-saml/passport-saml");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 8 * 60 * 60 * 1000 },
}));
app.use(passport.initialize());
app.use(passport.session());

const samlStrategy = new SamlStrategy(
  {
    entryPoint: `https://login.microsoftonline.com/${process.env.TENANT_ID}/saml2`,
    idpIssuer: `https://sts.windows.net/${process.env.TENANT_ID}/`,
    idpCert: process.env.IDP_CERT,
    issuer: process.env.ENTITY_ID,
    callbackUrl: process.env.ACS_URL,
    wantAuthnResponseSigned: false,
    wantAssertionsSigned: false,
    signatureAlgorithm: "sha256",
    digestAlgorithm: "sha256",
  },
  (profile, done) => done(null, profile),
  (profile, done) => done(null, profile)
);

passport.use(samlStrategy);
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.get("/", (req, res) => {
  if (req.isAuthenticated()) return res.redirect("/dashboard");
  res.send(`<!DOCTYPE html><html><head><title>Dev Tools</title></head>
    <body style="font-family:monospace;background:#0d1117;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
      <div style="background:#161b22;padding:56px 48px;border-radius:12px;border:1px solid #30363d;text-align:center;max-width:420px;width:100%">
        <div style="font-size:56px;margin-bottom:8px">⚙️</div>
        <h1 style="color:#e94560;margin:12px 0 8px;font-size:28px">Dev Tools</h1>
        <p style="color:#8b949e;margin-bottom:36px">Internal developer dashboard &amp; CI/CD access</p>
        <a href="/auth/saml" style="display:inline-block;background:#e94560;color:white;padding:14px 36px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;letter-spacing:0.5px">
          $ saml-login --idp entra
        </a>
        <p style="color:#484f58;font-size:12px;margin-top:24px">Cavalry Tenant · Port 3002</p>
      </div>
    </body></html>`);
});

app.get("/auth/saml", passport.authenticate("saml", { failureRedirect: "/login-failed" }));

app.post("/auth/saml/callback",
  passport.authenticate("saml", { failureRedirect: "/login-failed" }),
  (req, res) => res.redirect("/dashboard")
);

app.get("/auth/saml/metadata", (req, res) => {
  res.type("application/xml");
  res.send(samlStrategy.generateServiceProviderMetadata(null, null));
});

app.get("/dashboard", requireAuth, (req, res) => {
  const name = req.user["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]
    || req.user.nameidentifier || "Developer";
  const email = req.user["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"]
    || req.user.email || "—";
  const signedInAt = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const claimsJson = JSON.stringify(
    Object.fromEntries(
      Object.entries(req.user)
        .filter(([k]) => !k.startsWith("__"))
        .map(([k, v]) => [k.split("/").pop(), v])
    ), null, 2
  );

  res.send(`<!DOCTYPE html><html><head><title>Dev Tools — Dashboard</title></head>
    <body style="font-family:monospace;background:#0d1117;color:#c9d1d9;margin:0;min-height:100vh">

      <!-- Navbar -->
      <nav style="background:#161b22;padding:0 32px;display:flex;justify-content:space-between;align-items:center;height:60px;border-bottom:1px solid #30363d">
        <span style="font-size:18px;font-weight:700;color:#e94560">⚙️ Dev Tools</span>
        <div style="display:flex;align-items:center;gap:20px">
          <span style="font-size:13px;color:#8b949e">${email}</span>
          <a href="/logout" style="background:#e94560;color:white;padding:8px 18px;border-radius:5px;text-decoration:none;font-size:13px;font-weight:700">
            Sign Out
          </a>
        </div>
      </nav>

      <!-- Success Banner -->
      <div style="background:#0f3460;border-bottom:3px solid #e94560;padding:28px 40px;text-align:center">
        <div style="font-size:40px;margin-bottom:6px">✅</div>
        <h2 style="margin:0 0 6px;font-size:22px;color:#e94560">Sign In Successful</h2>
        <p style="margin:0;color:#8b949e;font-size:14px">
          Session authenticated for <span style="color:#c9d1d9;font-weight:700">${name}</span> at ${signedInAt}
        </p>
        <p style="margin:6px 0 0;color:#484f58;font-size:12px">
          SAML assertion verified &nbsp;·&nbsp; Identity Provider: Microsoft Entra ID
        </p>
      </div>

      <!-- Content -->
      <div style="padding:40px;max-width:920px;margin:0 auto">

        <!-- Info cards -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:36px">
          ${[
            ["user", name],
            ["email", email],
            ["idp", "Microsoft Entra ID"],
          ].map(([label, val]) => `
            <div style="background:#161b22;padding:18px 20px;border-radius:8px;border:1px solid #30363d;border-top:2px solid #e94560">
              <div style="color:#484f58;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">// ${label}</div>
              <div style="color:#e94560;font-size:14px;font-weight:700;word-break:break-all">${val}</div>
            </div>`).join("")}
        </div>

        <!-- Claims JSON -->
        <div style="color:#8b949e;font-size:13px;margin-bottom:10px">// SAML claims payload</div>
        <div style="background:#161b22;border:1px solid #30363d;border-radius:8px;overflow:hidden">
          <div style="background:#21262d;padding:10px 16px;border-bottom:1px solid #30363d;font-size:12px;color:#484f58">
            saml_response.assertion.claims &nbsp;·&nbsp; JSON
          </div>
          <pre style="margin:0;padding:24px;overflow:auto;font-size:13px;line-height:1.7;color:#79c0ff">${claimsJson}</pre>
        </div>

        <!-- Footer -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:32px">
          <p style="color:#484f58;font-size:12px;margin:0">Dev Tools · Port 3002 · Entity ID: ${process.env.ENTITY_ID}</p>
          <a href="/logout" style="background:#e94560;color:white;padding:10px 24px;border-radius:5px;text-decoration:none;font-size:13px;font-weight:700">
            Sign Out
          </a>
        </div>
      </div>
    </body></html>`);
});

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => res.redirect("/"));
  });
});

app.get("/login-failed", (req, res) => {
  res.status(401).send(`<!DOCTYPE html><html><head><title>Dev Tools — Auth Failed</title></head>
    <body style="font-family:monospace;background:#0d1117;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
      <div style="background:#161b22;padding:48px;border-radius:12px;border:1px solid #30363d;text-align:center;max-width:400px">
        <div style="font-size:48px">❌</div>
        <h2 style="color:#e94560;margin:16px 0 8px">// auth failed</h2>
        <p style="color:#8b949e;margin-bottom:28px">Entra ID could not verify your identity.</p>
        <a href="/" style="background:#e94560;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:700">retry</a>
      </div>
    </body></html>`);
});

function requireAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/auth/saml");
}

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`cavalry-sso-saml-devtools  →  http://localhost:${PORT}`));
