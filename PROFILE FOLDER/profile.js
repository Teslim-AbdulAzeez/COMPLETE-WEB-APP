// ============================================
// REAL PROFILE.JS SCRIPT (v2 - Goal Fix)
// ============================================

// YOUR LIVE VERCEL BACKEND URL
const API_BASE_URL = "https://nutri-track-api.vercel.app/api";

// --- DOM ELEMENTS ---
const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const logoutBtn = document.getElementById("logoutBtn");

const displayMode = document.getElementById("displayMode");
const editMode = document.getElementById("editMode");

// Display fields
const displayName = document.getElementById("displayName");
const displayEmail = document.getElementById("displayEmail");
const displayGoal = document.getElementById("displayGoal");
const displayCalories = document.getElementById("displayCalories");
const memberSince = document.getElementById("memberSince");

// Edit fields
const nameInput = document.getElementById("nameInput");
const emailInput = document.getElementById("emailInput");
const goalInput = document.getElementById("goalInput");
const calorieInput = document.getElementById("calorieInput");

// --- FUNCTIONS ---

function getAuthToken() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    window.location.href = "../SIGN IN FOLDER/login.html";
  }
  return token;
}

/**
 * --- THIS FUNCTION IS NOW FIXED ---
 * Converts backend goal (e.g., "weight_loss") to
 * frontend display text (e.g., "Weight Loss")
 */
function formatGoalForDisplay(goal) {
  switch (goal) {
    case 'weight_loss': return 'Weight Loss';
    case 'weight_gain': return 'Muscle Gain'; // Updated to match HTML
    case 'maintain_weight': return 'Maintenance';
    // Add other goals if your backend supports them
    default: return 'Maintenance';
  }
}

/**
 * --- THIS FUNCTION IS NOW FIXED ---
 * Converts frontend display text (e.g., "Weight Loss")
 * to backend goal (e.g., "weight_loss")
 */
function formatGoalForBackend(goal) {
  switch (goal) {
    case 'Weight Loss': return 'weight_loss';
    case 'Muscle Gain': return 'weight_gain'; // <-- THE FIX
    case 'Endurance': return 'weight_gain';   // <-- THE FIX (maps to weight_gain)
    case 'Maintenance': return 'maintain_weight';
    default: return 'maintain_weight';
  }
}

/**
 * Fetches the user's profile from the REAL backend
 */
async function loadUserProfile() {
  const token = getAuthToken();
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Could not fetch user profile.');

    const user = await response.json(); 

    // Update the "Display Mode" fields
    displayName.innerText = user.name;
    displayEmail.innerText = user.email;
    displayGoal.innerText = formatGoalForDisplay(user.goal);
    
    // Hide fields our backend doesn't have
    displayCalories.parentElement.style.display = 'none';
    memberSince.parentElement.style.display = 'none';
    calorieInput.parentElement.style.display = 'none';

  } catch (error) {
    console.error('Error loading user profile:', error);
    localStorage.removeItem('authToken');
    window.location.href = '../SIGN IN FOLDER/login.html';
  }
}

/**
 * Switches the UI from "display" mode to "edit" mode
 */
function showEditMode() {
  nameInput.value = displayName.innerText.trim();
  emailInput.value = displayEmail.innerText.trim();
  goalInput.value = displayGoal.innerText.trim();
  displayMode.style.display = "none";
  editMode.style.display = "block";
}

/**
 * Switches the UI back to "display" mode
 */
function showDisplayMode() {
  displayMode.style.display = "block";
  editMode.style.display = "none";
}

/**
 * Saves the updated profile to the REAL backend
 */
async function saveProfile() {
  const token = getAuthToken();
  if (!token) return;

  const newName = nameInput.value;
  const newEmail = emailInput.value;
  const newGoal = formatGoalForBackend(goalInput.value); // This will now work for "Muscle Gain"

  try {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: newName,
        email: newEmail,
        goal: newGoal
      })
    });

    if (!response.ok) throw new Error('Failed to save profile.');
    const updatedUser = await response.json();

    // Update the "Display Mode" fields
    displayName.innerText = updatedUser.name;
    displayEmail.innerText = updatedUser.email;
    displayGoal.innerText = formatGoalForDisplay(updatedUser.goal);

    showDisplayMode();

  } catch (error) {
    console.error('Error saving profile:', error);
    alert('Could not save your profile. Please try again.');
  }
}

// --- INITIALIZE THE PAGE ---
document.addEventListener("DOMContentLoaded", () => {
  loadUserProfile();

  editBtn.onclick = showEditMode;
  saveBtn.onclick = saveProfile;
  cancelBtn.onclick = showDisplayMode;

  logoutBtn.onclick = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    window.location.href = "../SIGN IN FOLDER/login.html";
  };
});