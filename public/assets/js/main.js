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

const locationInput = document.getElementById("locationInput");
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

  suggestionBox.innerHTML =
    "<div class='af-suggestion-item'>Searching...</div>";

  try {
    const apiKey = "28c4501555ee44698a1510d3b1a41dce";

    const res = await fetch(
      `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
        query
      )}&limit=10&format=json&apiKey=${apiKey}`
    );

    const data = await res.json();

    const places = data.results || [];

    if (!places.length) {
      suggestionBox.innerHTML =
        "<div class='af-suggestion-item'>No results found</div>";
      return;
    }

    window.locationResults = places;

    suggestionBox.innerHTML = "";

    places.forEach((place, index) => {
      const div = document.createElement("div");

      div.className = "af-suggestion-item";

      div.textContent =
        place.formatted ||
        place.city ||
        place.name;

      div.onclick = () => selectLocation(index);

      suggestionBox.appendChild(div);
    });

  } catch (err) {
    console.error(err);

    suggestionBox.innerHTML =
      "<div class='af-suggestion-item'>Error loading locations</div>";
  }
}

function selectLocation(index) {
  const place = window.locationResults[index];

  document.getElementById("locationInput").value =
    place.formatted;

  document.getElementById("lat").value =
    place.lat;

  document.getElementById("lon").value =
    place.lon;

  // Convert seconds to hours
  const timezoneOffset =
    (place.timezone?.offset_STD_seconds || 0) / 3600;

  document.getElementById("timezone").value =
    timezoneOffset;

  console.log("Selected Location:", {
    place: place.formatted,
    lat: place.lat,
    lon: place.lon,
    timezone: timezoneOffset
  });

  document.getElementById("locationSuggestions").innerHTML = "";
}


// ================= GOOGLE LOGIN =================

function handleGoogleLogin(response) {
  const credential = response.credential;

  fetch(`${window.location.origin}/api/auth/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ token: credential })
  })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        const expiry = Date.now() + (12 * 60 * 60 * 1000); // 12 hours
        localStorage.setItem("token", data.token);
        localStorage.setItem("token_expiry", expiry);
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




