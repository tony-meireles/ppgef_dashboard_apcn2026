(() => {
  const STORAGE_KEY = "ppgef-dashboard-static-access";
  const STATIC_PASSWORD = "apcn2026@";
  const DEFAULT_TARGET = "./dashboard/producao-cientifica.html";

  function normalizePath(path) {
    return path.replace(/\\/g, "/");
  }

  function getCurrentPath() {
    const path = normalizePath(window.location.pathname || "");
    return path.endsWith("/") ? `${path}index.html` : path;
  }

  function isAuthenticated() {
    return window.localStorage.getItem(STORAGE_KEY) === "granted";
  }

  function grantAccess() {
    window.localStorage.setItem(STORAGE_KEY, "granted");
  }

  function revokeAccess() {
    window.localStorage.removeItem(STORAGE_KEY);
  }

  function buildIndexUrl() {
    const currentPath = getCurrentPath();
    const inDashboard = currentPath.includes("/dashboard/");
    return inDashboard ? "../index.html" : "./index.html";
  }

  function buildDefaultTarget() {
    const currentPath = getCurrentPath();
    return currentPath.includes("/dashboard/") ? "./producao-cientifica.html" : DEFAULT_TARGET;
  }

  function resolveRequestedTarget() {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("target");
    if (!requested) {
      return buildDefaultTarget();
    }
    if (/^https?:\/\//i.test(requested) || requested.startsWith("//")) {
      return buildDefaultTarget();
    }
    const normalized = requested.replace(/^\.?\//, "");
    if (normalized.startsWith("dashboard/")) {
      return `./${normalized}`;
    }
    if (normalized.endsWith(".html")) {
      return `./dashboard/${normalized}`;
    }
    return buildDefaultTarget();
  }

  function redirectToIndex() {
    const currentPath = getCurrentPath();
    const currentName = currentPath.split("/").pop() || "index.html";
    const target = encodeURIComponent(currentName);
    window.location.replace(`${buildIndexUrl()}?target=${target}`);
  }

  function createLogoutButton() {
    if (document.querySelector("[data-static-auth-logout]")) {
      return;
    }
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Encerrar acesso";
    button.setAttribute("data-static-auth-logout", "true");
    Object.assign(button.style, {
      position: "fixed",
      right: "18px",
      bottom: "18px",
      zIndex: "9999",
      border: "none",
      borderRadius: "999px",
      padding: "10px 16px",
      background: "#262930",
      color: "#fff",
      fontSize: "14px",
      fontWeight: "700",
      cursor: "pointer",
      boxShadow: "0 10px 24px rgba(0, 0, 0, 0.18)",
    });
    button.addEventListener("click", () => {
      revokeAccess();
      window.location.replace(buildIndexUrl());
    });
    document.body.appendChild(button);
  }

  function protectPage() {
    if (!isAuthenticated()) {
      redirectToIndex();
      return false;
    }
    const attachLogout = () => createLogoutButton();
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", attachLogout, { once: true });
    } else {
      attachLogout();
    }
    return true;
  }

  function initLoginPage() {
    const root = document.querySelector("[data-login-root]");
    if (!root) {
      return;
    }

    const requestedTarget = resolveRequestedTarget();
    if (isAuthenticated()) {
      window.location.replace(requestedTarget);
      return;
    }

    root.innerHTML = `
      <section class="login-shell">
        <div class="login-card">
          <p class="eyebrow">Acesso restrito</p>
          <h1>Painel privado do PPGEF</h1>
          <p class="intro">
            Este ambiente concentra indicadores, documentos e consolidações do programa
            para acompanhamento interno. O acesso foi restringido para evitar consulta pública aberta.
          </p>
          <form class="login-form" data-login-form>
            <label for="static-password">Senha de acesso</label>
            <input id="static-password" name="password" type="password" autocomplete="current-password" required />
            <p class="error" data-login-error hidden>Senha incorreta. Tente novamente.</p>
            <button type="submit">Entrar no dashboard</button>
          </form>
        </div>
      </section>
    `;

    const form = root.querySelector("[data-login-form]");
    const input = root.querySelector("#static-password");
    const error = root.querySelector("[data-login-error]");

    input?.focus();

    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = String(input?.value || "");
      if (value !== STATIC_PASSWORD) {
        if (error) {
          error.hidden = false;
        }
        if (input) {
          input.value = "";
          input.focus();
        }
        return;
      }
      grantAccess();
      window.location.replace(requestedTarget);
    });
  }

  window.ppgefStaticAuth = {
    initLoginPage,
    protectPage,
    revokeAccess,
    isAuthenticated,
  };
})();
