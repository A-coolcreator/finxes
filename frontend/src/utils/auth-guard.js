(function () {
  const AUTH_KEY = "finexis_authed";
  const LOGIN_PATHS = new Set(["", "login.html", "index.html"]);

  const page = window.location.pathname.split("/").pop() || "";
  if (LOGIN_PATHS.has(page)) return;

  if (sessionStorage.getItem(AUTH_KEY) !== "1") {
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.replace(`/login.html?next=${next}`);
  }
})();
