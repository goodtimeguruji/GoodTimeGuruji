// ================= MENU =================

const menuBtn = document.getElementById("menuBtn");
const drawer = document.getElementById("drawer");
const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("closeBtn");

function openMenu() {
  if (!drawer || !overlay) return;
  drawer.classList.add("open");
  overlay.classList.add("show");
  drawer.setAttribute("aria-hidden", "false");
}

function closeMenu() {
  if (!drawer || !overlay) return;
  drawer.classList.remove("open");
  overlay.classList.remove("show");
  drawer.setAttribute("aria-hidden", "true");
}

if (menuBtn) menuBtn.addEventListener("click", openMenu);
if (closeBtn) closeBtn.addEventListener("click", closeMenu);
if (overlay) overlay.addEventListener("click", closeMenu);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});

document.querySelectorAll(".nav-mobile a").forEach(a => {
  a.addEventListener("click", closeMenu);
});


// ================= LOCATION SEARCH =================

let debounceTimer;

const locationInput = document.getElementById("location");
const suggestionBox = document.getElementById("locationSuggestions");

if (locationInput && suggestionBox) {
  locationInput.addEventListener("input", function () {
    clearTimeout(debounceTimer);
    const query = this.value.trim();

    if (!query) {
      suggestionBox.innerHTML = "";
      return;
    }

    debounceTimer = setTimeout(() => {
      fetchLocations(query);
    }, 400);
  });
}

async function fetchLocations(query) {
  if (!suggestionBox) return;

  suggestionBox.innerHTML = "<div class='af-suggestion-item'>Searching...</div>";

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&q=${encodeURIComponent(query)}`
    );

    const places = await res.json();

    if (!places.length) {
      suggestionBox.innerHTML = "<div class='af-suggestion-item'>No results found</div>";
      return;
    }

    window.locationResults = places;
    suggestionBox.innerHTML = "";

    places.forEach((place, index) => {
      const div = document.createElement("div");
      div.className = "af-suggestion-item";
      div.textContent = place.display_name;
      div.onclick = () => selectLocation(index);
      suggestionBox.appendChild(div);
    });

  } catch (err) {
    suggestionBox.innerHTML = "<div class='af-suggestion-item'>Error loading locations</div>";
  }
}

function selectLocation(index) {
  const place = window.locationResults[index];

  document.getElementById("location").value = place.display_name;
  document.getElementById("lat").value = place.lat;
  document.getElementById("lon").value = place.lon;
  document.getElementById("timezone").value = "5.5";

  suggestionBox.innerHTML = "";
}


// ================= LOGIN / SIGNUP =================

let authMode = "login";

function toggleAuth(mode) {
  authMode = mode;

  const nameField = document.getElementById("nameField");
  const confirmPasswordField = document.getElementById("confirmPasswordField");
  const submitBtn = document.getElementById("submitBtn");

  if (nameField) nameField.style.display = mode === "signup" ? "flex" : "none";
  if (confirmPasswordField) confirmPasswordField.style.display = mode === "signup" ? "flex" : "none";
  if (submitBtn) submitBtn.textContent = mode === "signup" ? "Sign Up" : "Login";
}

const authForm = document.getElementById("authForm");

if (authForm) {
  authForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const data = {
      name: document.getElementById("name")?.value,
      email: document.getElementById("email")?.value,
      password: document.getElementById("password")?.value
    };

    if (authMode === "signup") {
      const confirmPassword = document.getElementById("confirmPassword")?.value;
      if (data.password !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }
    }

    try {
      const res = await fetch(`http://localhost:3000/api/auth/${authMode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (result.token) {
        localStorage.setItem("token", result.token);
        window.location.href = "index.html";
      } else {
        alert(result.message || "Error");
      }

    } catch (err) {
      alert("Error: " + err.message);
    }
  });
}


// ================= GOOGLE LOGIN =================

function handleGoogleLogin(response) {
  const credential = response.credential;

  fetch("http://localhost:3000/api/auth/google", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ token: credential })
  })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.href = "index.html";
      } else {
        alert("Google login failed");
      }
    })
    .catch(err => {
      console.error(err);
      alert("Google login failed");
    });
}


// ================= DATE RANGE =================

document.addEventListener("DOMContentLoaded", function () {
  const fromDate = document.getElementById("fromDate");
  const toDate = document.getElementById("toDate");

  if (!fromDate || !toDate) return;

  function getToday() {
    return new Date().toISOString().split("T")[0];
  }

  function addDays(dateStr, days) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  }

  const today = getToday();
  fromDate.min = today;
  toDate.min = today;

  fromDate.addEventListener("change", function () {
    const selectedFrom = this.value;
    if (!selectedFrom) return;

    toDate.min = selectedFrom;
    toDate.max = addDays(selectedFrom, 90);
    toDate.value = selectedFrom;
  });
});


// ================= AUTH SYSTEM =================

document.addEventListener("DOMContentLoaded", async function () {
  const token = localStorage.getItem("token");

  const publicPages = ["index.html", "about-us.html", "contact-us.html", "login.html"];
  const currentPage = window.location.pathname.split("/").pop();

  // 🔐 Protect pages
  if (!publicPages.includes(currentPage)) {
    if (!token) {
      window.location.href = "login.html";
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/auth/get-user", {
        headers: {
          Authorization: "Bearer " + token
        }
      });

      const data = await res.json();

      if (!data.success) throw new Error();

      const usernameEl = document.getElementById("usernameDisplay");
      const dropdown = document.getElementById("userDropdown");
      const loginBtn = document.getElementById("loginBtn");

      if (usernameEl) usernameEl.innerText = data.username;
      if (dropdown) dropdown.style.display = "block";
      if (loginBtn) loginBtn.style.display = "none";

    } catch (err) {
      localStorage.removeItem("token");
      window.location.href = "login.html";
    }
  }

  // 🚪 Logout
  document.addEventListener("click", function (e) {
    if (e.target.id === "logoutBtn") {
      const token = localStorage.getItem("token");

      fetch("http://localhost:3000/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token
        }
      }).finally(() => {
        localStorage.removeItem("token");
        window.location.href = "index.html";
      });
    }
  });
});