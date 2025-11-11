// ============================================
// ENHANCED LOGMEAL.JS SCRIPT
// ============================================

const API_BASE_URL = "https://nutri-track-api.vercel.app/api";

// --- DOM ELEMENTS ---
const manualForm = document.querySelector(".meal-form");
const loggedMealContainer = document.querySelector(".logged-meal-stat");
const mealCountParagraph = document.querySelector(".logged-paragraph");
const logoutBtn = document.getElementById("logoutBtn");

// Manual Form Inputs
const mealNameInput = document.getElementById("meal-name");
const mealTypeInput = document.getElementById("meal-type");
const caloriesInput = document.getElementById("calories");
const proteinInput = document.getElementById("protein");
const carbsInput = document.getElementById("carbs");
const fatsInput = document.getElementById("fats");

// Quick-add elements
const quickAddContainer = document.querySelector(".food-suggestions");
const noMealsMessage = document.querySelector(".logged-meals");

let currentMeals = [];

// Declare mealSync variable
const mealSync = {
  initializeListener: () => {
    // Placeholder for initialization logic
  },
  broadcastUpdate: (meals) => {
    // Placeholder for broadcast logic
  },
};

// --- FUNCTIONS ---

function getAuthToken() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    window.location.href = "../SIGN IN FOLDER/login.html";
  }
  return token;
}

/**
 * Fetches all foods from backend and builds the "Quick Add" list
 */
async function loadQuickAddFoods() {
  const token = getAuthToken();
  if (!token) return;
  try {
    const response = await fetch(`${API_BASE_URL}/foods`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to fetch foods");
    const foods = await response.json();

    quickAddContainer.innerHTML = `
      <div class="text-group">
        <h2 class="suggestion-heading">Nigerian Foods</h2>
        <p class="suggestion-paragraph">Quickly add popular meals</p>
      </div>
    `;
    foods.forEach((food) => {
      const foodElement = document.createElement("div");
      foodElement.className = "suggested-food";
      foodElement.dataset.foodId = food._id;
      foodElement.innerHTML = `
        <p class="food-suggested">${food.name}</p>
        <p class="suggested-nutrient paragraph">${food.calories} cal</p>
      `;
      foodElement.addEventListener("click", () => {
        logQuickMeal(food._id);
      });
      quickAddContainer.appendChild(foodElement);
    });
  } catch (error) {
    console.error("Error loading quick-add foods:", error);
  }
}

/**
 * Fetches all of the user's logged meals for *today*
 * Now broadcasts updates to dashboard via mealSync
 */
async function loadTodaysMeals() {
  const token = getAuthToken();
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE_URL}/meals/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to fetch meals");

    const allMeals = await response.json();

    const today = new Date().toDateString();
    currentMeals = allMeals.filter(
      (meal) => new Date(meal.date).toDateString() === today
    );

    loggedMealContainer.innerHTML = "";

    if (currentMeals.length === 0) {
      loggedMealContainer.innerHTML =
        '<p class="logged-meals paragraph">No Meals Logged Yet</p>';
    } else {
      currentMeals.forEach((meal) => {
        addMealToDOM(meal);
      });
    }
    updateMealCount();

    mealSync.broadcastUpdate(currentMeals);
  } catch (error) {
    console.error("Error loading today's meals:", error);
  }
}

/**
 * Logs a meal when a "Quick Add" item is clicked
 */
async function logQuickMeal(foodId) {
  const token = getAuthToken();
  try {
    const response = await fetch(`${API_BASE_URL}/meals/log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        foodId: foodId,
        servingSize: 1,
        mealType: "Snack",
      }),
    });
    if (!response.ok) throw new Error("Failed to log meal");
    loadTodaysMeals();
  } catch (error) {
    console.error("Error logging quick meal:", error);
    alert("There was an error logging your meal.");
  }
}

/**
 * Logs a meal from the MANUAL "Add New Meal" form
 */
async function logManualMeal(event) {
  event.preventDefault();
  const token = getAuthToken();

  const meal = {
    customName: mealNameInput.value,
    mealType: mealTypeInput.value,
    calories: caloriesInput.value,
    protein_g: proteinInput.value || 0,
    carbs_g: carbsInput.value || 0,
    fats_g: fatsInput.value || 0,
  };

  if (!meal.customName || !meal.calories || !meal.mealType) {
    alert("Please fill in at least Meal Name, Meal Type, and Calories.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/meals/log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(meal),
    });

    if (!response.ok) throw new Error("Failed to log custom meal");

    loadTodaysMeals();
    manualForm.reset();
  } catch (error) {
    console.error("Error logging manual meal:", error);
    alert("There was an error logging your custom meal.");
  }
}

/**
 * Adds a meal to the "Today's Meals" list in the HTML
 */
function addMealToDOM(meal) {
  const mealCard = document.createElement("div");
  mealCard.classList.add("logged-meal-card");
  mealCard.setAttribute("data-meal-id", meal._id);

  mealCard.style =
    "display: flex; justify-content: space-between; align-items: center; background-color: rgb(245, 245, 245); padding: 1.5rem; border-radius: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); font-size: 1rem;";

  const mealName = meal.food ? meal.food.name : meal.customName;
  const calories = (meal.calories || 0).toFixed(0);

  const textDiv = document.createElement("div");
  textDiv.style = "flex: 1; text-align: left;";
  textDiv.innerHTML = `
    <h4 style="margin: 0; font-size: 1.5rem; color: #333;">${mealName}</h4>
    <p style="font-size: 1rem; color: #555; text-transform: capitalize; margin: 0.5rem 0;">${meal.mealType}</p>
    <p style="font-size: 0.9rem; color: #333; margin: 0;">
        ${calories} cal
    </p>
  `;

  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-btn");
  deleteButton.textContent = "Delete";
  deleteButton.style =
    "padding: 8px 12px; background-color: #ff4d4d; color: white; border: none; border-radius: 15px; cursor: pointer; margin-left: 15px;";
  deleteButton.dataset.id = meal._id;

  mealCard.appendChild(textDiv);
  mealCard.appendChild(deleteButton);
  loggedMealContainer.appendChild(mealCard);
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
    if (!response.ok) throw new Error("Failed to delete meal");
    loadTodaysMeals();
  } catch (error) {
    console.error("Error deleting meal:", error);
    alert("Could not delete meal.");
  }
}

/**
 * Updates the meal count text
 */
function updateMealCount() {
  const mealCount =
    loggedMealContainer.querySelectorAll(".logged-meal-card").length;
  if (mealCount === 0) {
    mealCountParagraph.textContent = "0 meals logged";
  } else {
    mealCountParagraph.textContent = `${mealCount} meal${
      mealCount > 1 ? "s" : ""
    } logged`;
  }
}

// --- INITIALIZE THE PAGE ---
document.addEventListener("DOMContentLoaded", () => {
  mealSync.initializeListener();

  manualForm.addEventListener("submit", logManualMeal);
  loadQuickAddFoods();
  loadTodaysMeals();

  logoutBtn.onclick = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    window.location.href = "../SIGN IN FOLDER/login.html";
  };

  loggedMealContainer.addEventListener("click", (event) => {
    if (event.target.classList.contains("delete-btn")) {
      const mealId = event.target.dataset.id;
      if (mealId) {
        deleteMeal(mealId);
      }
    }
  });
});
