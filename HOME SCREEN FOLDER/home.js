// ============================================
// REAL HOME PAGE SCRIPT
// ============================================

// YOUR LIVE VERCEL BACKEND URL
const API_BASE_URL = "https://nutri-track-api.vercel.app/api";

// --- DOM ELEMENTS (from your home.html) ---
const greetingHeading = document.querySelector(".greeting h2");
const greetingDate = document.querySelector(".greeting p");
const logoutBtn = document.getElementById("logoutBtn");
const logMealBtn = document.querySelector(".log-meal");
const takeSuggestionsBtn = document.querySelector(".take_suggestions-btn");

// --- FUNCTIONS ---

/**
 * Gets the "VIP Pass" (token) from localStorage.
 * If it doesn't exist, the session_guard.js script (which
 * should be loaded first) will have already redirected to login.
 */
function getAuthToken() {
  const token = localStorage.getItem("authToken");
  return token;
}

/**
 * Sets the current date on the dashboard.
 */
function getTodaysDate() {
  const today = new Date();
  const options = { day: "numeric", month: "long", year: "numeric" };
  return today.toLocaleDateString("en-US", options);
}

/**
 * Fetches the user's profile from the REAL backend
 * and updates the greeting.
 */
async function loadUserProfile() {
  const token = getAuthToken();
  if (!token) return; // Should be handled by session_guard

  try {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Could not fetch user profile. Token might be expired.');
    }

    const user = await response.json(); // Gets { _id, name, email, goal }

    // Update the greeting with the REAL user's name
    if (greetingHeading) {
      greetingHeading.textContent = `Hello, ${user.name}`;
    }
    
    // Save this real user data to localStorage
    // This will fix the "fake" user data in profile.js and other files!
    localStorage.setItem('currentUser', JSON.stringify(user));

  } catch (error) {
    console.error('Error loading user profile:', error);
    // If the token is bad, send them back to login
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    window.location.href = '../SIGN IN FOLDER/login.html';
  }
}

/**
 * Logs the user out by deleting the token.
 */
function setupLogoutButton() {
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();

      // Clear the "VIP Pass" and the user data
      localStorage.removeItem("authToken");
      localStorage.removeItem("currentUser");
      
      console.log("User logged out. Token cleared.");

      // Redirect to login page
      window.location.href = "../SIGN IN FOLDER/login.html";
    });
  }
}

// ============================================
// INITIALIZE THE PAGE
// ============================================

// This function runs as soon as the HTML page is loaded
document.addEventListener("DOMContentLoaded", () => {
  // 1. The session_guard.js script in your HTML already ran
  // and confirmed we are logged in.
  
  // 2. Set the date
  if (greetingDate) {
    greetingDate.textContent = getTodaysDate();
  }

  // 3. Load the user's profile from the backend
  loadUserProfile();

  // 4. Make the logout button work
  setupLogoutButton();

  // 5. Make the other page buttons work
  if (logMealBtn) {
    logMealBtn.addEventListener("click", () => {
      window.location.href = "../LOG MEAL FOLDER/logmeal.html";
    });
  }
  
  if (takeSuggestionsBtn) {
    takeSuggestionsBtn.addEventListener("click", () => {
      window.location.href = "../SUGGESTION FOLDER/suggestions.html";
    });
  }
});