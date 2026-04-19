document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

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
      window.location.href = "index.html";
    });
  }
});