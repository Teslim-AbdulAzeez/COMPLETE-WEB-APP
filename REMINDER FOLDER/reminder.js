const API_BASE_URL = "https://nutri-track-api.vercel.app/api";

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM ELEMENTS ---
  const reminderState = document.getElementById("reminder-state");
  const reminderSetup = document.getElementById("reminder-setup");
  const suggestionCard = document.getElementById("suggestion-card");
  const addReminderBtn = document.getElementById("add-reminder-btn");
  const cancelBtn = document.getElementById("cancel-btn");
  const logoutBtn = document.getElementById("logoutBtn");
  const reminderForm = document.getElementById("reminder-form");
  const reminderTypeInput = document.getElementById("reminder-type");
  const reminderTimeInput = document.getElementById("reminder-time");
  const reminderList = document.getElementById("reminder-list");

  // Quick Suggestion Buttons
  const suggestBreakfast = document.getElementById("suggest-breakfast");
  const suggestLunch = document.getElementById("suggest-lunch");
  const suggestDinner = document.getElementById("suggest-dinner");
  const suggestWorkoutAm = document.getElementById("suggest-workout-am");
  const suggestWorkoutPm = document.getElementById("suggest-workout-pm");

  // --- FUNCTIONS ---

  function getAuthToken() {
    const token = localStorage.getItem("authToken");
    if (!token) {
      window.location.href = "../SIGN IN FOLDER/login.html";
    }
    return token;
  }

  /**
   * Fetches all reminders from the backend and displays them
   */
  async function loadRemindersFromAPI() {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/reminders/me`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch reminders");

      const reminders = await response.json();

      reminderList.innerHTML = "<h2>My Reminders</h2>";

      if (reminders.length === 0) {
        const emptyMsg = document.createElement("p");
        emptyMsg.className = "empty-text";
        emptyMsg.textContent = "No Reminders Set";
        reminderList.appendChild(emptyMsg);
      } else {
        reminders.forEach((reminder) => {
          addReminderToDom(reminder.reminderType, reminder.time, reminder._id);
        });
      }
    } catch (error) {
      console.error("Error loading reminders:", error);
      reminderList.innerHTML =
        '<h2>My Reminders</h2><p class="empty-text" style="color: red;">Could not load reminders.</p>';
    }
  }

  /**
   * Adds a single reminder to the HTML list
   */
  function addReminderToDom(type, time, id) {
    const emptyText = reminderList.querySelector(".empty-text");
    if (emptyText) emptyText.remove();

    const reminderItem = document.createElement("div");
    reminderItem.className = "reminder-item";
    reminderItem.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div><strong>${type}</strong> at <strong>${time}</strong></div>
        <button type="button" class="delete-reminder-btn" data-id="${id}" style="background-color: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">Delete</button>
      </div>
      <hr>
    `;
    reminderList.appendChild(reminderItem);

    // Add delete button event listener
    const deleteBtn = reminderItem.querySelector(".delete-reminder-btn");

    // --- THIS IS THE FIX ---
    // Remove the alert and add a call to our new deleteReminder function
    deleteBtn.addEventListener("click", () => {
      // Ask the user to confirm first
      if (
        confirm(
          `Are you sure you want to delete the ${type} reminder at ${time}?`
        )
      ) {
        deleteReminder(id);
      }
    });
  }

  /**
   * --- NEW FUNCTION ---
   * Deletes a reminder from the backend
   */
  async function deleteReminder(id) {
    const token = getAuthToken();
    try {
      const response = await fetch(`${API_BASE_URL}/reminders/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete reminder");

      // If successful, just reload the list
      loadRemindersFromAPI();
    } catch (error) {
      console.error("Error deleting reminder:", error);
      alert("Could not delete the reminder.");
    }
  }

  function showForm() {
    reminderState.classList.add("hidden");
    suggestionCard.classList.add("hidden");
    reminderSetup.classList.remove("hidden");
  }

  function showMainState() {
    reminderState.classList.remove("hidden");
    suggestionCard.classList.remove("hidden");
    reminderSetup.classList.add("hidden");
  }

  /**
   * Saves a new reminder to the backend
   */
  async function saveNewReminder(event) {
    event.preventDefault();
    const token = getAuthToken();

    const reminder = {
      reminderType: reminderTypeInput.value,
      time: reminderTimeInput.value,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/reminders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reminder),
      });

      if (!response.ok) throw new Error("Failed to save reminder");

      // We don't need to call addReminderToDom, just reload the whole list
      loadRemindersFromAPI();
      showMainState();
    } catch (error) {
      console.error("Error saving reminder:", error);
      alert("Could not save your reminder. Please try again.");
    }
  }

  function prefillForm(type, time) {
    reminderTypeInput.value = type;
    reminderTimeInput.value = time;
    showForm();
  }

  // --- HOOK UP ALL EVENT LISTENERS ---
  addReminderBtn.addEventListener("click", showForm);
  cancelBtn.addEventListener("click", showMainState);
  reminderForm.addEventListener("submit", saveNewReminder);

  // Quick suggestions
  suggestBreakfast.addEventListener("click", () =>
    prefillForm("Meal", "08:00")
  );
  suggestLunch.addEventListener("click", () => prefillForm("Meal", "12:30"));
  suggestDinner.addEventListener("click", () => prefillForm("Meal", "19:00"));
  suggestWorkoutAm.addEventListener("click", () =>
    prefillForm("Workout", "06:30")
  );
  suggestWorkoutPm.addEventListener("click", () =>
    prefillForm("Workout", "17:30")
  );

  // Logout
  logoutBtn.onclick = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    window.location.href = "../SIGN IN FOLDER/login.html";
  };

  // Load all data from the API when the page starts
  loadRemindersFromAPI();
});
