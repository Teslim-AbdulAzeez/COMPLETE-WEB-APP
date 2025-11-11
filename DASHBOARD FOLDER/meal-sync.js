// ============================================
// MEAL SYNC UTILITY - Cross-Page Communication
// ============================================

// This utility enables real-time syncing between the log meal page and dashboard
// using localStorage events and a shared meal cache

class MealSyncManager {
  constructor() {
    this.callbacks = [];
  }

  // Register a callback to run when meals are updated from another page
  onMealUpdate(callback) {
    this.callbacks.push(callback);
  }

  // Broadcast that meals have been updated
  broadcastUpdate(meals) {
    localStorage.setItem(
      "mealUpdate",
      JSON.stringify({
        timestamp: Date.now(),
        meals: meals,
      })
    );
    // Also trigger local callbacks
    this.callbacks.forEach((cb) => cb(meals));
  }

  // Listen for updates from other pages
  initializeListener() {
    window.addEventListener("storage", (event) => {
      if (event.key === "mealUpdate") {
        const data = JSON.parse(event.newValue);
        this.callbacks.forEach((cb) => cb(data.meals));
      }
    });
  }
}

const mealSync = new MealSyncManager();
