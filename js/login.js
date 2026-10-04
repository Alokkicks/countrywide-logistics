const loginForm = document.querySelector(".login-form");
const errorMessage = document.querySelector(".login-error");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    // Clear previous error
    errorMessage.textContent = "";

    const email = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    // Check empty fields
    if (!email || !password) {
        errorMessage.textContent = "Email and password are required";
        return;
    }

    try {
        // Send login request to backend
        const response = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        // Login failed
        if (!response.ok) {
            errorMessage.textContent =
                data.message || "Invalid email or password";
            return;
        }

        // Login successful
        console.log("Login successful");
        console.log("User:", data.user);

        // Save JWT token
        localStorage.setItem("token", data.token);

        // Save user information
        localStorage.setItem("user", JSON.stringify(data.user));

        /*
         * For now we don't have a separate admin dashboard.
         * Both admin and employee will enter the employee dashboard.
         */
        window.location.replace( "employee-dashboard.html");

    } catch (error) {
        console.error("Login error:", error);
        errorMessage.textContent =
            "Unable to connect to server. Please try again.";
    }
});


// Remove error when user starts typing
document.getElementById("username").addEventListener("input", function () {
    errorMessage.textContent = "";
});

document.getElementById("password").addEventListener("input", function () {
    errorMessage.textContent = "";
});