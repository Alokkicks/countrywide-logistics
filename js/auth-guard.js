// AUTHENTICATION GUARD

function checkAuthentication() {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.replace("login.html");
    }
}

// Check when page loads
checkAuthentication();

// Check again when coming back using browser Back/Forward
window.addEventListener("pageshow", function () {
    checkAuthentication();
});