const logoutButtons = document.querySelectorAll(".sidebar-logout");

logoutButtons.forEach(function (logoutButton) {

    logoutButton.addEventListener("click", function (event) {

        event.preventDefault();

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.replace("login.html");
    });

});