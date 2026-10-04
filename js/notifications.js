console.log("NOTIFICATIONS.JS LOADED");

document.addEventListener("DOMContentLoaded", async function () {

    const notification = document.getElementById("notification");
    const notificationDropdown =
        document.getElementById("notification-dropdown");

    const notificationCount =
        document.getElementById("notification-count");

    const notificationNewCount =
        document.getElementById("notification-new-count");

    const notificationList =
        document.getElementById("notification-list");

    console.log("NOTIFICATIONS DOM LOADED");


    async function loadQuoteNotifications() {

        try {

            const token = localStorage.getItem("token");
            console.log("Notification token:", token);
            console.log("Authorization header:", `Bearer ${token}`);

            const response = await fetch(
                "https://countrywide-logistics.onrender.com/api/quotes",
                {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );


            console.log("Notification token exists:", !!token);
            console.log("Notification API status:", response.status);

            const data = await response.json();

            console.log("Notification API data:", data);

            if (!response.ok) {
                console.error("Failed to load quote notifications:", data);
                return;
            }

            const quotes = data.quotes || [];
            console.log("Quotes count:", quotes.length);
            console.log("Notification count element:", notificationCount);
            console.log("Notification new count element:", notificationNewCount);
            console.log("Notification list element:", notificationList);




            /* =========================================
               UPDATE COUNT
            ========================================= */

            if (notificationCount) {
                notificationCount.textContent = quotes.length;
            }


            /* =========================================
               UPDATE NEW COUNT
            ========================================= */

            if (notificationNewCount) {
                notificationNewCount.textContent =
                    `${quotes.length} New`;
            }


            /* =========================================
               UPDATE NOTIFICATION LIST
            ========================================= */

            if (!notificationList) {
                return;
            }

            notificationList.innerHTML = "";


            if (quotes.length === 0) {

                notificationList.innerHTML = `
                <div class="notification-item">

                    <i class="fa-solid fa-bell"></i>

                    <div>
                        <p>No new notifications</p>
                        <span>You're all caught up</span>
                    </div>

                </div>
            `;

                return;
            }


            /* =========================================
               CREATE QUOTE NOTIFICATIONS
            ========================================= */

            quotes.forEach((quote) => {

                const notificationItem =
                    document.createElement("div");

                notificationItem.className =
                    "notification-item";
                notificationItem.dataset.quoteId = quote._id;

                notificationItem.innerHTML = `

                <i class="fa-solid fa-file-circle-question"></i>

                <div>

                    <p>
                        New quote enquiry from
                        <strong>
                            ${quote.businessName || quote.name}
                        </strong>
                    </p>

                    <span>
                        ${quote.goodsType || "Quote enquiry"}
                        • ${quote.weight || ""} kg
                    </span>

                </div>

                `;
                notificationItem.addEventListener("click", () => {

                    if (
                        typeof window.showQuoteNotificationDetails ===
                        "function"
                    ) {
                        window.showQuoteNotificationDetails(quote);
                    } else {
                        console.error(
                            "showQuoteNotificationDetails is not available."
                        );
                    }

                });

                notificationList.appendChild(
                    notificationItem
                );

            });

        } catch (error) {

            console.error(
                "Quote notification error:",
                error
            );

        }



    }
    console.log("CALLING LOAD QUOTE NOTIFICATIONS");

    loadQuoteNotifications();


});

// ==========================================
// OPEN QUOTE DETAILS
// ==========================================

const notificationList =
    document.getElementById("notification-list");

if (notificationList) {

    notificationList.addEventListener("click", (event) => {

        const item =
            event.target.closest(".notification-item");

        if (!item) return;

        const quoteId = item.dataset.quoteId;

        if (!quoteId) {
            console.error("Notification has no quote ID.");
            return;
        }

        const quote =
            window.dashboardQuotes?.find(
                quote =>
                    String(quote._id) ===
                    String(quoteId)
            );

        if (!quote) {
            console.error(
                "Quote not found:",
                quoteId
            );
            return;
        }

        showQuoteNotificationDetails(quote);
    });
}
