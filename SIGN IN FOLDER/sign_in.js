const form = document.getElementById('signupForm');
const usernameInput = document.getElementById('Username');
const emailInput = document.getElementById('Email or Phone Number');
const passwordInput = document.getElementById('pwd1');
const confirmPasswordInput = document.getElementById('pwd2');
const goalSelect = document.getElementById('goal');

// Error Message Spans
const usernameError = document.getElementById('usernameError');
const emailError = document.getElementById('emailError');
const pwd1Error = document.getElementById('pwd1Error');
const pwd2Error = document.getElementById('pwd2Error');
const goalError = document.getElementById('goalError');
const successMessage = document.getElementById('successMessage');

// YOUR LIVE BACKEND API URL
const API_BASE_URL = "https://nutri-track-api.vercel.app/api";

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  // Clear old errors
  usernameError.classList.remove('show');
  emailError.classList.remove('show');
  pwd1Error.classList.remove('show');
  pwd2Error.classList.remove('show');
  goalError.classList.remove('show');
  successMessage.classList.remove('show');

  // 1. Get values from the form
  const name = usernameInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;
  const goal = goalSelect.value;

  // 2. Client-side validation
  if (password !== confirmPasswordInput.value) {
    pwd2Error.textContent = 'Passwords do not match.';
    pwd2Error.classList.add('show');
    return;
  }
  if (goal === "Options") {
     goalError.textContent = 'Please select a goal.';
     goalError.classList.add('show');
     return;
  }

  // 3. Send data to your backend API
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password, goal })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Registration failed');
    }

    // Success!
    successMessage.textContent = 'Account created! Redirecting to login...';
    successMessage.classList.add('show');

    // Redirect to the new login page after 2 seconds
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);

  } catch (error) {
    console.error('Registration Error:', error);
    emailError.textContent = 'Registration failed. This email may already be in use.';
    emailError.classList.add('show');
  }
});