




document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const recentShipmentsBody =
        document.getElementById("recent-shipments-body");

    const totalShipments =
        document.getElementById("total-shipments");

    const pendingTasks =
        document.getElementById("pending-tasks");

    const completedDeliveries =
        document.getElementById("completed-deliveries");

    const inTransit =
        document.getElementById("in-transit");

    const actionRequiredList =
        document.getElementById("action-required-list");

    const updateStatusButton =
        document.getElementById("update-status-btn");

    const shipmentSelect =
        document.getElementById("shipment-select");

    const newStatusSelect =
        document.getElementById("new-status");

    const saveStatusButton =
        document.getElementById("save-status-btn");

    const updateStatusPanel =
        document.getElementById("update-status-panel");

    const closeUpdateStatusButton =
        document.getElementById("close-update-status-btn");
    const viewBillButton =
        document.getElementById("view-bill-btn");


    /* =====================================================
       SHIPMENTS DATA
    ===================================================== */

    let shipments = [];


    /* =====================================================
       OPEN / CLOSE UPDATE STATUS PANEL
    ===================================================== */

    if (updateStatusButton) {

        updateStatusButton.addEventListener("click", () => {


            updateStatusPanel.style.display = "flex";

        });

    }


    if (closeUpdateStatusButton) {

        closeUpdateStatusButton.addEventListener("click", () => {

            updateStatusPanel.style.display = "none";

        });

    }

    // view Bill Button //
    if (viewBillButton) {
        viewBillButton.addEventListener("click", function () {
            window.location.href = "reports.html#generated-panel";
        });
    }

    /* =====================================================
       FORMAT DATE
    ===================================================== */

    function formatDate(dateValue) {

        if (!dateValue) {
            return "-";
        }

        const date = new Date(dateValue);

        if (isNaN(date.getTime())) {
            return "-";
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

    }


    /* =====================================================
       LOAD SHIPMENTS FROM BACKEND
    ===================================================== */

    async function loadShipments() {

        try {

            const token = localStorage.getItem("token");

            const response = await fetch(
                "https://countrywide-logistics.onrender.com/api/shipments",
                {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {

                throw new Error(
                    data.message || "Failed to load shipments."
                );

            }

            shipments = Array.isArray(data.shipments)
                ? data.shipments
                : [];

            console.log("Shipments loaded from backend:", shipments);

            renderDashboard();

        } catch (error) {

            console.error(
                "Error loading shipments:",
                error
            );

            shipments = [];

            renderDashboard();

        }

    }


    /* =====================================================
       RENDER DASHBOARD
    ===================================================== */

    function renderDashboard() {

        /* =====================================================
           CHECK DASHBOARD ELEMENTS
        ===================================================== */

        if (!recentShipmentsBody) {
            console.error(
                "Missing element: recent-shipments-body"
            );
            return;
        }

        if (!actionRequiredList) {
            console.error(
                "Missing element: action-required-list"
            );
            return;
        }

        if (!shipmentSelect) {
            console.error(
                "Missing element: shipment-select"
            );
            return;
        }

        if (!totalShipments) {
            console.error(
                "Missing element: total-shipments"
            );
            return;
        }

        if (!pendingTasks) {
            console.error(
                "Missing element: pending-tasks"
            );
            return;
        }

        if (!completedDeliveries) {
            console.error(
                "Missing element: completed-deliveries"
            );
            return;
        }

        if (!inTransit) {
            console.error(
                "Missing element: in-transit"
            );
            return;
        }


        /* =====================================================
           CLEAR OLD CONTENT
        ===================================================== */

        recentShipmentsBody.innerHTML = "";

        actionRequiredList.innerHTML = "";

        shipmentSelect.innerHTML = `
        <option value="">
            Select a shipment
        </option>
    `;


        /* =====================================================
           RECENT SHIPMENTS
        ===================================================== */

        const recentShipments = shipments.slice(0, 5);


        recentShipments.forEach((shipment) => {

            let bookingDate = "-";

            if (shipment.bookingDate) {

                const date = new Date(
                    shipment.bookingDate
                );

                if (!isNaN(date.getTime())) {

                    bookingDate =
                        date.toLocaleDateString(
                            "en-IN",
                            {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                            }
                        );

                }

            }


            recentShipmentsBody.innerHTML += `
            <tr>

                <td>${shipment.trackingId}</td>

                <td>${shipment.from || shipment.bookingBranch || "-"}</td>

                <td>${shipment.to || shipment.destination || "-"}</td>

                <td>${shipment.expectedDelivery || "-"}</td>

                <td>${shipment.status || "-"}</td>  

            </tr>
        `;

        });


        /* =====================================================
           SHIPMENT DROPDOWN
        ===================================================== */

        shipments.forEach((shipment) => {

            shipmentSelect.innerHTML += `
            <option value="${shipment.trackingId}">
                ${shipment.trackingId}
                -
                ${shipment.companyName || "No Company"}
            </option>
        `;

        });


        /* =====================================================
           ACTION REQUIRED
        ===================================================== */
        const actionShipments = shipments
            .filter((shipment) => {
                return (
                    shipment.status === "Pending" ||
                    shipment.status === "In Transit"
                );
            })
            .slice(0, 4);

        actionRequiredList.innerHTML = "";

        actionShipments.forEach((shipment) => {

            if (shipment.status === "Pending") {

                actionRequiredList.innerHTML += `
            <div class="task">
                <p>Verify shipment ${shipment.trackingId}</p>
                <span class="status pending">Pending</span>
            </div>
        `;

            } else if (shipment.status === "In Transit") {

                actionRequiredList.innerHTML += `
            <div class="task">
                <p>Track shipment ${shipment.trackingId}</p>
                <span class="status in-transit">In Transit</span>
            </div>
        `;

            }

        });

        /* =====================================================
           DASHBOARD STATISTICS
        ===================================================== */

        const pendingCount =
            shipments.filter((shipment) => {

                return shipment.status === "Pending";

            }).length;


        const deliveredCount =
            shipments.filter((shipment) => {

                return shipment.status === "Delivered";

            }).length;


        const transitCount =
            shipments.filter((shipment) => {

                return shipment.status === "In Transit";

            }).length;


        /* =====================================================
           UPDATE STAT CARDS
        ===================================================== */

        totalShipments.textContent =
            shipments.length;

        pendingTasks.textContent =
            pendingCount;

        completedDeliveries.textContent =
            deliveredCount;

        inTransit.textContent =
            transitCount;

    }

    /* =================================================
       SHIPMENT DROPDOWN
    ================================================= */

    shipments.forEach((shipment) => {

        shipmentSelect.innerHTML += `
                <option value="${shipment.trackingId}">
                    ${shipment.trackingId}
                    -
                    ${shipment.bookingBranch || "-"}
                    to
                    ${shipment.destination || "-"}
                </option>
            `;

    });


    /* =================================================
       RECENT SHIPMENTS
    ================================================= */

    shipments.forEach((shipment) => {

        recentShipmentsBody.innerHTML += `
                <tr>

                    <td>
                        ${shipment.trackingId || "-"}
                    </td>

                    <td>
                        ${shipment.bookingBranch || "-"}
                    </td>

                    <td>
                        ${shipment.destination || "-"}
                    </td>

                    <td>
                        ${formatDate(shipment.bookingDate)}
                    </td>

                    <td>
                        ${shipment.status || "Pending"}
                    </td>

                </tr>
            `;


        /* =============================================
           ACTION REQUIRED
        ============================================= */

        if (shipment.status === "Pending") {

            actionRequiredList.innerHTML += `
                    <div class="task">

                        <p>
                            Verify shipment
                            ${shipment.trackingId}
                        </p>

                        <span class="status pending">
                            Pending
                        </span>

                    </div>
                `;

        }

        else if (shipment.status === "In Transit") {

            actionRequiredList.innerHTML += `
                    <div class="task">

                        <p>
                            Track shipment
                            ${shipment.trackingId}
                        </p>

                        <span class="status in-transit">
                            In Transit
                        </span>

                    </div>
                `;

        }

    });


    /* =================================================
       DASHBOARD STATISTICS
    ================================================= */

    const pendingCount =
        shipments.filter((shipment) => {

            return shipment.status === "Pending";

        }).length;


    const deliveredCount =
        shipments.filter((shipment) => {

            return shipment.status === "Delivered";

        }).length;


    const transitCount =
        shipments.filter((shipment) => {

            return shipment.status === "In Transit";

        }).length;


    totalShipments.textContent =
        shipments.length;

    pendingTasks.textContent =
        pendingCount;

    completedDeliveries.textContent =
        deliveredCount;

    inTransit.textContent =
        transitCount;




    /* =====================================================
       UPDATE DELIVERY STATUS
    ===================================================== */

    if (saveStatusButton) {

        saveStatusButton.addEventListener(
            "click",
            async () => {

                const selectedShipmentId =
                    shipmentSelect.value;

                const selectedStatus =
                    newStatusSelect.value;


                /* -----------------------------------------
                   VALIDATION
                ----------------------------------------- */

                if (
                    selectedShipmentId === "" ||
                    selectedStatus === ""
                ) {

                    alert(
                        "Please select a shipment and a new status."
                    );

                    return;

                }


                /* -----------------------------------------
                   DISABLE BUTTON
                ----------------------------------------- */

                saveStatusButton.disabled = true;


                try {

                    const response = await fetch(

                        `https://countrywide-logistics.onrender.com/api/shipments/${encodeURIComponent(selectedShipmentId)}/status`,

                        {
                            method: "PATCH",

                            headers: {
                                "Content-Type":
                                    "application/json",
                                "Authorization": `Bearer ${localStorage.getItem("token")}`
                            },

                            body: JSON.stringify({
                                status: selectedStatus
                            })
                        }

                    );


                    const data =
                        await response.json();


                    /* -------------------------------------
                       SERVER ERROR
                    ------------------------------------- */

                    if (!response.ok) {

                        alert(
                            data.message ||
                            "Could not update shipment status."
                        );

                        return;

                    }


                    /* -------------------------------------
                       UPDATE LOCAL DATA
                    ------------------------------------- */

                    const index =
                        shipments.findIndex(
                            (shipment) =>
                                shipment.trackingId ===
                                selectedShipmentId
                        );


                    if (index !== -1) {

                        shipments[index] =
                            data.shipment;

                    }


                    /* -------------------------------------
                       REFRESH DASHBOARD
                    ------------------------------------- */

                    renderDashboard();


                    /* -------------------------------------
                       CLOSE PANEL
                    ------------------------------------- */

                    updateStatusPanel.style.display =
                        "none";

                    shipmentSelect.value = "";
                    newStatusSelect.value = "";


                    console.log(
                        "Shipment status updated:",
                        data.shipment
                    );


                } catch (error) {

                    console.error(
                        "Status update error:",
                        error
                    );

                    alert(
                        "Could not connect to the backend server."
                    );

                } finally {

                    saveStatusButton.disabled =
                        false;

                }

            }
        );

    }


    // LOGOUT FUNCTION //

    const logoutButton = document.querySelector(".sidebar-logout");

    if (logoutButton) {
        logoutButton.addEventListener("click", function (event) {
            event.preventDefault();

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.replace("login.html");
        });
    }
    
    // ==========================================
    // EMPLOYEE DROPDOWN
    // ==========================================

    const employeeInfo = document.getElementById("employee-info");
    const employeeDropdown = document.getElementById("employee-dropdown");

    if (employeeInfo && employeeDropdown) {

        employeeInfo.addEventListener("click", function (event) {

            event.stopPropagation();

            employeeDropdown.classList.toggle("show");

        });

    }


    // Close employee dropdown when clicking elsewhere

    document.addEventListener("click", function () {

        if (employeeDropdown) {
            employeeDropdown.classList.remove("show");
        }

    });


    // ==========================================
    // SETTINGS BUTTON
    // ==========================================

    const settingsButton =
        document.getElementById("settings-btn");

    if (settingsButton) {

        settingsButton.addEventListener("click", function (event) {

            event.stopPropagation();

            window.location.href = "settings.html";

        });

    }

    // ===============================
    // NOTIFICATION / QUOTE SYSTEM
    // ===============================

    const notification = document.getElementById("notification");
    const notificationCount = document.getElementById("notification-count");
    const notificationNewCount = document.getElementById("notification-new-count");
    const notificationList = document.getElementById("notification-list");

    let dashboardQuotes = [];

    async function loadQuoteNotifications() {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch("https://countrywide-logistics.onrender.com/api/quotes", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to load quotes");
            }

            dashboardQuotes = Array.isArray(data.quotes)
                ? data.quotes
                : [];

            // Only NEW quotes count as notifications
            const newQuotes = dashboardQuotes.filter(
                quote => quote.status === "New"
            );

            // Update notification numbers
            if (notificationCount) {
                notificationCount.textContent = newQuotes.length;
            }

            if (notificationNewCount) {
                notificationNewCount.textContent = `${newQuotes.length} New`;
            }

            renderQuoteNotifications(newQuotes);

        } catch (error) {
            console.error("Quote notification error:", error);

            if (notificationCount) {
                notificationCount.textContent = "0";
            }

            if (notificationNewCount) {
                notificationNewCount.textContent = "0 New";
            }

            if (notificationList) {
                notificationList.innerHTML = `
                <div class="notification-item">
                    <i class="fa-solid fa-circle-exclamation"></i>
                    <div>
                        <strong>Unable to load notifications</strong>
                        <p>Please refresh the dashboard.</p>
                    </div>
                </div>
            `;
            }
        }
    }

    function renderQuoteNotifications(quotes) {

        if (!notificationList) return;

        notificationList.innerHTML = "";

        if (quotes.length === 0) {
            notificationList.innerHTML = `
            <div class="notification-item">
                <i class="fa-regular fa-bell"></i>
                <div>
                    <strong>No new quote enquiries</strong>
                    <p>You're all caught up.</p>
                </div>
            </div>
        `;
            return;
        }

        quotes.forEach((quote,) => {

            const item = document.createElement("div");

            item.className = "notification-item";
            item.dataset.quoteId = quote._id;

            item.innerHTML = `
            <i class="fa-solid fa-file-invoice"></i>

            <div class="notification-content">
                <strong>
                    New quote enquiry from
                    ${escapeNotificationText(
                quote.businessName || quote.name || "Customer"
            )}
                </strong>

                <p>
                    ${escapeNotificationText(
                quote.goodsType || "Goods not specified"
            )}
                    • ${quote.weight ?? 0} kg
                </p>
            </div>
        `;

            notificationList.appendChild(item);
        });
    }

    // ==========================================
    // OPEN FULL QUOTE DETAILS
    // ==========================================


    window.showQuoteNotificationDetails = function (quote) {

        // Remove existing modal if already open
        const existingModal = document.getElementById("quote-details-modal");

        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement("div");

        modal.id = "quote-details-modal";
        modal.className = "quote-details-modal";

        modal.innerHTML = `
        <div class="quote-details-overlay"></div>

        <div class="quote-details-box">

            <div class="quote-details-header">
                <div>
                    <h2>Quote Enquiry Details</h2>
                    <span>Customer enquiry</span>
                </div>

                <button type="button" class="quote-details-close" id="close-quote-details">
                    &times;
                </button>
            </div>

            <div class="quote-details-body">

                <div class="quote-detail-section">
                    <h3>Customer Information</h3>

                    <div class="quote-detail-grid">

                        <div class="quote-detail-field">
                            <label>Name</label>
                            <div>${escapeNotificationText(quote.name || "-")}</div>
                        </div>

                        <div class="quote-detail-field">
                            <label>Business Name</label>
                            <div>${escapeNotificationText(quote.businessName || "-")}</div>
                        </div>

                        <div class="quote-detail-field">
                            <label>Email</label>
                            <div>${escapeNotificationText(quote.email || "-")}</div>
                        </div>

                        <div class="quote-detail-field">
                            <label>Mobile</label>
                            <div>${escapeNotificationText(quote.mobile || "-")}</div>
                        </div>

                    </div>
                </div>


                <div class="quote-detail-section">
                    <h3>Shipment Information</h3>

                    <div class="quote-detail-grid">

                        <div class="quote-detail-field">
                            <label>Goods Type</label>
                            <div>${escapeNotificationText(quote.goodsType || "-")}</div>
                        </div>

                        <div class="quote-detail-field">
                            <label>Weight</label>
                            <div>${quote.weight ?? "-"} kg</div>
                        </div>

                    </div>
                </div>


                <div class="quote-detail-section">

                    <h3>Additional Information</h3>

                    <div class="quote-more-info">
                        ${escapeNotificationText(
            quote.moreInfo || "No additional information provided."
        )}
                    </div>

                </div>


                <div class="quote-detail-section">

                    <h3>Enquiry Status</h3>

                    <div class="quote-status-row">

                        <span class="quote-status-badge">
                            ${escapeNotificationText(quote.status || "New")}
                        </span>

                        <span class="quote-created-date">
                            Submitted:
                            ${quote.createdAt
                ? new Date(quote.createdAt).toLocaleString("en-IN")
                : "-"
            }
                        </span>

                    </div>

                </div>

            </div>

            <div class="quote-details-footer">

                <button
                    type="button"
                    class="quote-details-close-btn"
                    id="close-quote-details-bottom"
                >
                    Close
                </button>

            </div>

        </div>
    `;

        document.body.appendChild(modal);


        // Close buttons
        document
            .getElementById("close-quote-details")
            .addEventListener("click", () => {
                modal.remove();
            });

        document
            .getElementById("close-quote-details-bottom")
            .addEventListener("click", () => {
                modal.remove();
            });


        // Close when clicking dark overlay
        modal
            .querySelector(".quote-details-overlay")
            .addEventListener("click", () => {
                modal.remove();
            });


        // Close with ESC
        const escapeHandler = (event) => {

            if (event.key === "Escape") {
                modal.remove();
                document.removeEventListener("keydown", escapeHandler);
            }

        };

        document.addEventListener("keydown", escapeHandler);
    }


    function escapeNotificationText(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    // Open / close notification dropdown
    if (notification) {

        notification.addEventListener("click", (event) => {

            event.stopPropagation();

            const dropdown = document.getElementById(
                "notification-dropdown"
            );

            if (!dropdown) return;

            dropdown.classList.toggle("show");
        });
    }


    // Close notification dropdown when clicking elsewhere
    document.addEventListener("click", () => {

        const dropdown = document.getElementById(
            "notification-dropdown"
        );

        if (dropdown) {
            dropdown.classList.remove("show");
        }
    });


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    loadShipments();
    loadQuoteNotifications();

});