function isTokenValid() {
  const token = localStorage.getItem("token");
  const expiry = localStorage.getItem("token_expiry");

  if (!token || !expiry) return false;

  return Date.now() < parseInt(expiry);
}



document.addEventListener("DOMContentLoaded", async () => {
  const token = isTokenValid() ? localStorage.getItem("token") : null;
    if (!token) {
    localStorage.removeItem("token");
    localStorage.removeItem("token_expiry");
    }

  const loginBtn = document.getElementById("loginBtn");
  const userDropdown = document.getElementById("userDropdown");
  const usernameDisplay = document.getElementById("usernameDisplay");
  const logoutBtn = document.getElementById("logoutBtn");

  if (token) {
    try {
      const res = await fetch(`${window.location.origin}/api/auth/get-user`, {
        headers: {
          Authorization: "Bearer " + token
        }
      });

      const data = await res.json();

      if (data.success) {
        if (loginBtn) loginBtn.style.display = "none";
        if (userDropdown) userDropdown.style.display = "block";
        if (usernameDisplay) usernameDisplay.textContent = data.username;
      } else {
        localStorage.removeItem("token");
      }

    } catch (err) {
      console.error("Auth error:", err);
    }
  }

  // logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await fetch(`${window.location.origin}/api/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token
        }
      });

    localStorage.removeItem("token");
    localStorage.removeItem("token_expiry");
    window.location.href = "index.html";
    });
  }
});