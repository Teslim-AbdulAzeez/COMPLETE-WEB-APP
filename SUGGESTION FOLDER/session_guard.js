// ============================================
// NEW, REAL SESSION GUARD
// (Paste this into all session_guard.js files)
// ============================================

function checkUserSession() {
  // 1. Look for the "VIP Pass" (the auth token) in localStorage
  const token = localStorage.getItem("authToken");

  // 2. If no token exists...
  if (!token) {
    console.log("No auth token found. Redirecting to login...");
    
    // 3. Send the user to the login page.
    // This path goes "up" one folder (../) and then "down"
    // into the SIGN IN FOLDER.
    window.location.href = "../SIGN IN FOLDER/login.html"; 
    return false;
  }

  // If a token IS found, let the user stay on the page
  return true;
}

// Run the check immediately when the script loads
checkUserSession();