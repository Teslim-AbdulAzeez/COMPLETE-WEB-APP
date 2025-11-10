// This is the "real" login script with LOGS

// --- VALIDATION LOG 1 ---
console.log("login.js script has started!");

// YOUR LIVE VERCEL BACKEND URL
const API_BASE_URL = "https://nutri-track-api.vercel.app/api";

const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('loginError');

// --- VALIDATION LOG 2 ---
if (loginForm) {
  console.log("SUCCESS: Found the login form.");
} else {
  console.error("FAILURE: Could not find the <form> with id='loginForm'. Check your HTML!");
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault(); // Stop the form from submitting normally
  
  // --- VALIDATION LOG 3 ---
  console.log("SUCCESS: Login button clicked, submit event fired!");

  loginError.classList.remove('show'); // Hide old errors

  const email = emailInput.value;
  const password = passwordInput.value;

  console.log(`Attempting to log in with email: ${email}`);

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    // --- VALIDATION LOG 4 ---
    console.log("Received a response from the server. Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server responded with an error:", errorText);
      throw new Error(errorText || 'Login failed');
    }

    // If the login is successful!
    const data = await response.json(); // This gets your { token: "..." }
    console.log("SUCCESS: Login was successful, token received!");

    // Store the "VIP Pass" (token)
    localStorage.setItem('authToken', data.token);

    // Redirect to the main home screen
    console.log("Redirecting to home screen...");
    window.location.href = '../HOME SCREEN FOLDER/home.html';

  } catch (error) {
    // --- VALIDATION LOG 5 (THE CATCH BLOCK) ---
    console.error('--- !!! LOGIN CRASH REPORT !!! ---');
    console.error('This is the error that occurred:', error);
    
    // Check for CORS
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        loginError.textContent = 'Network Error. This might be a CORS issue on the server.';
    } else {
        loginError.textContent = 'Login failed. Check your email or password.';
    }
    loginError.classList.add('show');
  }
});