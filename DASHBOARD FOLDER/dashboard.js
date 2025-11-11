// ============================================
// ENHANCED DASHBOARD.JS SCRIPT
// ============================================

const API_BASE_URL = "https://nutri-track-api.vercel.app/api";

// --- DOM ELEMENTS ---
const logoutBtn = document.getElementById("logoutBtn");
const addMealForm = document.getElementById("addMealForm");
const mealList = document.getElementById("mealList");
const totalCaloriesEl = document.getElementById("totalCalories");
const totalMealsEl = document.getElementById("totalMeals");
const calorieProgressEl = document.getElementById("calorieProgress");
const weeklyChartEl = document.getElementById("weeklyChart");
const currentDateEl = document.getElementById("currentDate");
const dashboardHeader = document.querySelector("h1");
const goalTextEl = document.querySelector(".goal-text");

// --- STATE ---
const foodMap = new Map();
let dailyGoal = 2000;

let currentUser = null;

// --- FUNCTIONS ---

function getAuthToken() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    console.log("No auth token, redirecting...");
    window.location.href = "../SIGN IN FOLDER/login.html";
  }
  return token;
}

/**
 * Sets the current date on the dashboard
 */
function updateCurrentDate() {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const today = new Date().toLocaleDateString("en-US", options);
  currentDateEl.textContent = today;
}

/**
 * Fetches ALL food data from the backend to create a "lookup map"
 */
async function loadFoodMap(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/foods`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to fetch food map");
    const foods = await response.json();
    foodMap.clear();
    foods.forEach((food) => foodMap.set(food._id, food));
    console.log("Food Map successfully loaded.");
  } catch (error) {
    console.error("Error loading food map:", error);
  }
}

/**
 * Enhanced user profile fetch with user info display
 * Fetches the user's profile to get their name and calorie goal
 */
async function loadUserProfile(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Could not fetch user profile.");

    currentUser = await response.json();
    dashboardHeader.textContent = `Welcome, ${currentUser.name}!`;

    const dailyGoalFromProfile = currentUser.calorieGoal || 2000;
    goalTextEl.textContent = `Daily Goal: ${dailyGoalFromProfile} cal`;
    return dailyGoalFromProfile;
  } catch (error) {
    console.error("Error loading user profile:", error);
    dashboardHeader.textContent = `Welcome!`;
    return 2000;
  }
}

/**
 * Enhanced dashboard load with real-time sync listener
 * Fetches all of the user's logged meals and renders the dashboard
 */
async function loadDashboard() {
  const token = getAuthToken();
  if (!token) return;

  try {
    await loadFoodMap(token);
    dailyGoal = await loadUserProfile(token);

    const response = await fetch(`${API_BASE_URL}/meals/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Could not fetch meals");

    const allMeals = await response.json();
    const today = new Date().toDateString();
    const todaysMeals = allMeals.filter(
      (meal) => new Date(meal.date).toDateString() === today
    );

    renderMealsList(todaysMeals);
    calculateCalorieStats(todaysMeals, dailyGoal);
  } catch (error) {
    console.error("Error loading dashboard:", error);
    mealList.innerHTML =
      '<p class="empty-message">Could not load your meals. Please try logging in again.</p>';
  }
}

/**
 * Separate function to refresh meals without reloading user profile
 * This is called when the log meal page broadcasts updates
 */
async function refreshMeals() {
  const token = getAuthToken();
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE_URL}/meals/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Could not fetch meals");

    const allMeals = await response.json();
    const today = new Date().toDateString();
    const todaysMeals = allMeals.filter(
      (meal) => new Date(meal.date).toDateString() === today
    );

    renderMealsList(todaysMeals);
    calculateCalorieStats(todaysMeals, dailyGoal);
  } catch (error) {
    console.error("Error refreshing meals:", error);
  }
}

/**
 * Renders the list of meals in the HTML
 */
function renderMealsList(meals) {
  if (meals.length === 0) {
    mealList.innerHTML =
      '<p class="empty-message">No meals added yet. Go to "Log Meal"!</p>';
    return;
  }

  const mealsHTML = meals
    .map((meal) => {
      const food = foodMap.get(meal.food);
      const mealName = food ? food.name : meal.customName || "Unknown Food";
      const calories = food
        ? (food.calories * meal.servingSize).toFixed(0)
        : (meal.calories || 0).toFixed(0);

      return `
      <div class="meal-item">
        <div class="meal-info">
          <h4>${mealName}</h4>
          <p class="meal-time">${new Date(meal.date).toLocaleTimeString(
            "en-US",
            { hour: "2-digit", minute: "2-digit" }
          )}</p>
        </div>
        <div class="meal-actions">
          <span class="meal-calories">${calories} cal</span>
          <button class="btn-delete" data-id="${meal._id}">Delete</button>
        </div>
      </div>
    `;
    })
    .join("");
  mealList.innerHTML = mealsHTML;
}

/**
 * Calculates and renders the stats (Total Cals, Total Meals, Progress Bar)
 */
function calculateCalorieStats(meals, goal) {
  let totalCalories = 0;

  meals.forEach((meal) => {
    const food = foodMap.get(meal.food);
    if (food) {
      totalCalories += food.calories * meal.servingSize;
    } else if (meal.calories) {
      // Handle custom meals that don't have a food reference
      totalCalories += meal.calories;
    }
  });

  totalCaloriesEl.textContent = totalCalories.toFixed(0);
  totalMealsEl.textContent = meals.length;

  const progressPercentage = Math.min((totalCalories / goal) * 100, 100);
  calorieProgressEl.style.width = `${progressPercentage}%`;
  calorieProgressEl.textContent = `${Math.round(progressPercentage)}%`;
}

/**
 * Deletes a meal when the "Delete" button is clicked
 */
async function deleteMeal(mealId) {
  const token = getAuthToken();
  if (!mealId) return;

  try {
    const response = await fetch(`${API_BASE_URL}/meals/${mealId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Failed to delete");

    refreshMeals();
  } catch (error) {
    console.error("Error deleting meal:", error);
    alert("Could not delete meal.");
  }
}

// --- INITIALIZE THE PAGE ---
document.addEventListener("DOMContentLoaded", () => {
  console.log("Dashboard initialized");

  updateCurrentDate();
  loadDashboard();

  const mealSync = window.mealSync; // Declare mealSync variable
  mealSync.initializeListener();
  mealSync.onMealUpdate(() => {
    refreshMeals();
  });

  if (addMealForm) {
    const button = addMealForm.querySelector('button[type="submit"]');
    addMealForm
      .querySelectorAll("input, select")
      .forEach((el) => (el.disabled = true));
    button.textContent = "Go to Log Meal Page";
    addMealForm.addEventListener("submit", (e) => {
      e.preventDefault();
      window.location.href = "../LOG MEAL FOLDER/logmeal.html";
    });
  }

  logoutBtn.onclick = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    window.location.href = "../SIGN IN FOLDER/login.html";
  };

  mealList.addEventListener("click", (event) => {
    if (event.target.classList.contains("btn-delete")) {
      const mealId = event.target.dataset.id;
      deleteMeal(mealId);
    }
  });
});
