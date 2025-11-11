const API_BASE_URL = "https://nutri-track-api.vercel.app/api";

// --- DOM ELEMENTS ---
const suggestionsGrid = document.getElementById("suggestions-grid");
const logoutBtn = document.getElementById("logoutBtn");

// --- FUNCTIONS ---

/**
 * Gets the "VIP Pass" (token) from localStorage.
 */
function getAuthToken() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    console.log("No auth token, redirecting...");
    window.location.href = "../SIGN IN FOLDER/login.html";
  }
  return token;
}

/**
 * Fetches the user's suggestions from the REAL backend
 * and builds the HTML for the food cards.
 */
async function loadSuggestions() {
  const token = getAuthToken();
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE_URL}/suggestions`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error("Could not fetch suggestions. Token might be expired.");
    }

    const suggestedFoods = await response.json(); // Gets the list of foods

    // Clear any old content
    suggestionsGrid.innerHTML = "";

    if (suggestedFoods.length === 0) {
      suggestionsGrid.innerHTML =
        '<p style="color: white; text-align: center; font-size: 1.8rem;">No suggestions found for your current goal. Try changing your goal on the Profile page!</p>';
      return;
    }

    // Loop through each food and create an HTML card for it
    suggestedFoods.forEach((food) => {
      const foodCard = document.createElement("div");
      foodCard.className = "column all"; // Use the existing CSS classes

      // We'll use a placeholder image for now
      // To fix this, you would add an "imageUrl" field to your backend Food model
      const placeholderImg = "../SUGGESTION FOLDER/Image Folder/Rice.jpg";

      foodCard.innerHTML = `
        <div class="inner-column">
          <img
            src="${placeholderImg}" 
            alt="image of ${food.name}"
            loading="auto"
          />
          <div class="caption">
            <p>${food.name}</p>
            <i class="ph ph-heart-straight icon"></i>
          </div>
        </div>
      `;
      suggestionsGrid.appendChild(foodCard);
    });
  } catch (error) {
    console.error("Error loading suggestions:", error);
    suggestionsGrid.innerHTML = `<p style="color: red; text-align: center;">${error.message}</p>`;
  }
}

// --- INITIALIZE THE PAGE ---
document.addEventListener("DOMContentLoaded", () => {
  // 1. Session guard already ran from the HTML

  // 2. Load the user's suggestions from the backend
  loadSuggestions();

  // 3. Set up logout
  logoutBtn.onclick = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    window.location.href = "../SIGN IN FOLDER/login.html";
  };
});

// ============================================
// SESSION CHECK
// ============================================
function checkUserSession() {
  const storedUser = localStorage.getItem("currentUser");
  if (!storedUser) {
    console.log("No user session found. Redirecting to login page.");
    window.location.href = "../SIGN IN FOLDER/sign_in.html";
  }
}
checkUserSession();
// ============================================
// FILTERING LOGIC
// ============================================
// Active category state
let activeCategory = "all";

// Function to update button visual states
function updateButtonStates(activeBtn) {
  const buttons = document.querySelectorAll(".header-food-filter button");
  buttons.forEach((btn) => {
    btn.classList.remove("active");
  });
  if (activeBtn) {
    activeBtn.classList.add("active");
  }
}

// Filter function that accepts a category
function filterByCategory(category) {
  activeCategory = category;
  const columns = document.querySelectorAll(".column");

  columns.forEach((column) => {
    if (category === "all") {
      column.classList.remove("hidden");
    } else if (column.classList.contains(category)) {
      column.classList.remove("hidden");
    } else {
      column.classList.add("hidden");
    }
  });
}

// Show all items
function showAll() {
  filterByCategory("all");
  updateButtonStates(document.querySelector(".all"));
}

// Show weight gain items
function showGain() {
  filterByCategory("gain");
  updateButtonStates(document.querySelector(".gain"));
}

// Show weight loss items
function showLoss() {
  filterByCategory("loss");
  updateButtonStates(document.querySelector(".loss"));
}

// Show cereal items
function showCereal() {
  filterByCategory("cereal");
  updateButtonStates(document.querySelector(".cereal"));
}

// Show dietary items
function showDiet() {
  filterByCategory("diet");
  updateButtonStates(document.querySelector(".diet"));
}

document.addEventListener("DOMContentLoaded", () => {
  // Add click handlers for filter buttons
  document.querySelector(".all").addEventListener("click", showAll);
  document.querySelector(".gain").addEventListener("click", showGain);
  document.querySelector(".loss").addEventListener("click", showLoss);
  document.querySelector(".cereal").addEventListener("click", showCereal);
  document.querySelector(".diet").addEventListener("click", showDiet);

  const hearts = document.querySelectorAll(".ph-heart-straight");
  hearts.forEach((heart) => {
    heart.style.cursor = "pointer";
    heart.addEventListener("click", function (e) {
      heart.style.color = "#ff0000";
      e.stopPropagation();
      this.classList.toggle("icon-filled");
    });
  });

  // Set initial active state to "all"
  updateButtonStates(document.querySelector(".all"));
});
// Initially show all items
filterByCategory("all");
showAll();
