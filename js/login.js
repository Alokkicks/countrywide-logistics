const loginForm = document.querySelector(".login-form");
const errorMessage = document.querySelector(".login-error");

loginForm.addEventListener("submit", function(event) {
    event.preventDefault();

    // Clear any previous error first
    errorMessage.textContent = "";

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username === "admin" && password === "admin123") {
        window.location.href = "admin-dashboard.html";

    } else if (username === "employee" && password === "employee123") {
        window.location.href = "employee-dashboard.html";

    } else {
        errorMessage.textContent = "Invalid username or password";
    }
});

// Remove the error as soon as the user types
document.getElementById("username").addEventListener("input", function() {
    errorMessage.textContent = "";
});

document.getElementById("password").addEventListener("input", function() {
    errorMessage.textContent = "";
});