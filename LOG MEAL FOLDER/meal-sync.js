// ============================================
// MEAL SYNC UTILITY - Shared across pages
// ============================================
// This utility enables real-time synchronization between logmeal and dashboard pages

const MEAL_SYNC = {
  recentlyLoggedMeals: [],

  broadcastMealLogged() {
    const lastMealTime = Date.now();
    sessionStorage.setItem("lastMealLoggedTime", lastMealTime.toString());
    window.dispatchEvent(
      new CustomEvent("mealLogged", { detail: { timestamp: lastMealTime } })
    );
    console.log("[MEAL_SYNC] Meal logged broadcasted at:", lastMealTime);
  },

  getMealLoggedTime() {
    const timeStr = sessionStorage.getItem("lastMealLoggedTime");
    return timeStr ? Number.parseInt(timeStr) : null;
  },

  clearMealLoggedTime() {
    sessionStorage.removeItem("lastMealLoggedTime");
  },
};
