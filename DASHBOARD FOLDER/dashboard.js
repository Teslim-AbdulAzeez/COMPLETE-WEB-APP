// ============================================
// REAL DASHBOARD.JS SCRIPT
// ============================================

// YOUR LIVE VERCEL BACKEND URL
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

// --- STATE (to hold our data) ---
let foodMap = new Map(); // To store foodId -> foodDetails

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
 * Sets the current date on the dashboard.
 */
function updateCurrentDate() {
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  const today = new Date().toLocaleDateString("en-US", options);
  currentDateEl.textContent = today;
}

/**
 * Fetches ALL food data from the backend to create a "lookup map".
 * This is so we can show food names and calories from just a foodId.
 */
async function loadFoodMap(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/foods`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch food map');
    const foods = await response.json();
    foodMap.clear();
    foods.forEach(food => foodMap.set(food._id, food));
    console.log('Food Map successfully loaded.');
  } catch (error) {
    console.error('Error loading food map:', error);
  }
}

/**
 * Fetches the user's profile to get their name and calorie goal
 */
async function loadUserProfile(token) {
   try {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Could not fetch user profile.');
    
    const user = await response.json();
    dashboardHeader.textContent = `Welcome, ${user.name}!`;
    
    // We'll set a default goal for now, since it's not in the model
    // In a v2, you'd add "calorieGoal" to your user model
    const dailyGoal = 2000; 
    goalTextEl.textContent = `Daily Goal: ${dailyGoal} cal`;
    return dailyGoal; // Return the goal for calculations
    
  } catch (error) {
    console.error('Error loading user profile:', error);
    dashboardHeader.textContent = `Welcome!`;
    return 2000; // Return a default goal
  }
}

/**
 * Fetches all of the user's logged meals and renders the dashboard
 */
async function loadDashboard() {
  const token = getAuthToken();
  if (!token) return;

  try {
    // We need to wait for the foodMap AND user profile to load first
    await loadFoodMap(token);
    const dailyGoal = await loadUserProfile(token);

    // Now, get the meal logs
    const response = await fetch(`${API_BASE_URL}/meals/me`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Could not fetch meals');
    
    const allMeals = await response.json();
    
    // Filter for today's meals only
    const today = new Date().toDateString();
    const todaysMeals = allMeals.filter(meal => new Date(meal.date).toDateString() === today);

    renderMealsList(todaysMeals);
    calculateCalorieStats(todaysMeals, dailyGoal);
    // We'll skip the weekly chart for now, it's complex
    // renderWeeklyChart(allMeals); 

  } catch (error) {
    console.error('Error loading dashboard:', error);
    mealList.innerHTML = '<p class="empty-message">Could not load your meals. Please try logging in again.</p>';
  }
}

/**
 * Renders the list of meals in the HTML
 */
function renderMealsList(meals) {
  if (meals.length === 0) {
    mealList.innerHTML = '<p class="empty-message">No meals added yet. Go to "Log Meal"!</p>';
    return;
  }
  
  const mealsHTML = meals.map(meal => {
    const food = foodMap.get(meal.food); // Get food details using the ID
    const mealName = food ? food.name : 'Unknown Food';
    const calories = food ? (food.calories * meal.servingSize).toFixed(0) : 0;
    
    return `
      <div class="meal-item">
        <div class="meal-info">
          <h4>${mealName}</h4>
          <p class="meal-time">${new Date(meal.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</p>
        </div>
        <div class="meal-actions">
          <span class="meal-calories">${calories} cal</span>
          <button class="btn-delete" data-id="${meal._id}">Delete</button>
        </div>
      </div>
    `;
  }).join("");
  mealList.innerHTML = mealsHTML;
}

/**
 * Calculates and renders the stats (Total Cals, Total Meals, Progress Bar)
 */
function calculateCalorieStats(meals, dailyGoal) {
  let totalCalories = 0;
  
  meals.forEach(meal => {
    const food = foodMap.get(meal.food);
    if (food) {
      totalCalories += (food.calories * meal.servingSize);
    }
  });

  totalCaloriesEl.textContent = totalCalories.toFixed(0);
  totalMealsEl.textContent = meals.length;

  const progressPercentage = Math.min((totalCalories / dailyGoal) * 100, 100);
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
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Failed to delete');
    
    // Success! Reload the dashboard to show the change
    loadDashboard(); 

  } catch (error) {
    console.error('Error deleting meal:', error);
    alert('Could not delete meal.');
  }
}

// --- INITIALIZE THE PAGE ---
document.addEventListener("DOMContentLoaded", () => {
  console.log("Dashboard initialized");
  
  // 1. The session_guard.js script in your HTML already ran
  
  // 2. Set the date
  updateCurrentDate();
  
  // 3. Load all REAL data from the backend
  loadDashboard();

  // 4. Disable the "Add Meal" form and make it a link
  if (addMealForm) {
    const button = addMealForm.querySelector('button[type="submit"]');
    // Disable all inputs in the form
    addMealForm.querySelectorAll('input, select').forEach(el => el.disabled = true);
    // Change button text and function
    button.textContent = 'Go to Log Meal Page';
    addMealForm.addEventListener('submit', (e) => {
      e.preventDefault();
      window.location.href = '../LOG MEAL FOLDER/logmeal.html';
    });
  }

  // 5. Set up logout
  logoutBtn.onclick = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    window.location.href = "../SIGN IN FOLDER/login.html";
  };
  
  // 6. Add a single event listener for all delete buttons
  mealList.addEventListener("click", (event) => {
    if (event.target.classList.contains("btn-delete")) {
      const mealId = event.target.dataset.id;
      deleteMeal(mealId);
    }
  });
});
