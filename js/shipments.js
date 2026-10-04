document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const tableBody =
        document.getElementById("shipments-table-body");

    const emptyState =
        document.getElementById("empty-state");

    const shipmentCount =
        document.getElementById("shipment-count");

    const searchInput =
        document.getElementById("shipment-search");

    const statusFilter =
        document.getElementById("status-filter");

    const refreshButton =
        document.getElementById("refresh-shipments");


    /* =====================================================
       SHIPMENTS DATA
    ===================================================== */

    let shipments = [];


    /* =====================================================
       LOAD SHIPMENTS FROM BACKEND
    ===================================================== */

    async function loadShipments() {

        try {

            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:5000/api/shipments",
                {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load shipments."
                );
            }

            shipments = data.shipments || [];

            renderShipments();

        } catch (error) {

            console.error(
                "Error loading shipments:",
                error
            );

            shipments = [];

            tableBody.innerHTML = "";

            emptyState.style.display = "block";

            shipmentCount.textContent =
                "Unable to load shipments";

            alert(
                "Could not load shipments from the backend."
            );
        }
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
            return dateValue;
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    }


    /* =====================================================
       FORMAT STATUS
    ===================================================== */

    function formatStatus(status) {

        if (!status) {
            return "Pending";
        }

        if (status.toLowerCase() === "in transit") {
            return "In Transit";
        }

        if (status.toLowerCase() === "delivered") {
            return "Delivered";
        }

        return "Pending";
    }


    /* =====================================================
       STATUS CSS CLASS
    ===================================================== */

    function getStatusClass(status) {

        const formattedStatus =
            formatStatus(status);

        if (formattedStatus === "In Transit") {
            return "status-in-transit";
        }

        if (formattedStatus === "Delivered") {
            return "status-delivered";
        }

        return "status-pending";
    }


    /* =====================================================
       DISPLAY SHIPMENTS
    ===================================================== */

    function renderShipments() {

        const searchValue =
            searchInput
                ? searchInput.value.trim().toLowerCase()
                : "";

        const selectedStatus =
            statusFilter
                ? statusFilter.value
                : "all";


        /* -----------------------------------------------
           FILTER
        ------------------------------------------------ */

        const filteredShipments =
            shipments.filter(shipment => {

                const status =
                    formatStatus(shipment.status);

                const matchesSearch =
                    shipment.cNoteNo
                        ?.toLowerCase()
                        .includes(searchValue) ||

                    shipment.consignor
                        ?.toLowerCase()
                        .includes(searchValue) ||

                    shipment.consignee
                        ?.toLowerCase()
                        .includes(searchValue) ||

                    shipment.invoiceNo
                        ?.toLowerCase()
                        .includes(searchValue) ||

                    shipment.destination
                        ?.toLowerCase()
                        .includes(searchValue);

                const matchesStatus =
                    selectedStatus === "all" ||

                    (
                        selectedStatus === "pending" &&
                        status === "Pending"
                    ) ||

                    (
                        selectedStatus === "in-transit" &&
                        status === "In Transit"
                    ) ||

                    (
                        selectedStatus === "delivered" &&
                        status === "Delivered"
                    );


                return matchesSearch &&
                    matchesStatus;

            });


        /* -----------------------------------------------
           CLEAR TABLE
        ------------------------------------------------ */

        tableBody.innerHTML = "";


        /* -----------------------------------------------
           EMPTY STATE
        ------------------------------------------------ */

        if (filteredShipments.length === 0) {

            emptyState.style.display = "block";

            shipmentCount.textContent =
                "0 shipments";

            return;

        }


        emptyState.style.display = "none";


        /* -----------------------------------------------
           COUNT
        ------------------------------------------------ */

        shipmentCount.textContent =
            `${filteredShipments.length} shipment${filteredShipments.length === 1 ? "" : "s"}`;


        /* -----------------------------------------------
           CREATE TABLE ROWS
        ------------------------------------------------ */

        filteredShipments.forEach(shipment => {

            const row =
                document.createElement("tr");


            const status =
                formatStatus(shipment.status);

            const statusClass =
                getStatusClass(status);


            row.innerHTML = `
            
                <td>
                    <span class="shipment-id">
                         ${shipment.cNoteNo || shipment.trackingId || "-"}
                    </span>
                </td>
                <td>
                    ${shipment.consignor || "-"}
                </td>
                <td>
                    ${shipment.consignee || "-"}
                </td>

                <td>
                    ${shipment.destination || "-"}
                </td>

                <td>
                    ${formatDate(shipment.bookingDate)}
                </td>

                <td>
                    ${shipment.chargeableWeight || shipment.actualWeight || 0} kg
                </td>

                <td>
                    ${shipment.packageCount || 0}
                </td>

                <td>
                    ${shipment.invoiceNo || "-"}
                </td>

                <td>
                    <span class="status-badge ${statusClass}">
                        ${status}
                    </span>
                </td>

                <td>
                    <span class="shipment-amount">
                        ₹ ${Number(
                shipment.totalAmount || 0
            ).toFixed(2)}
                    </span>
                </td>

                <td>
                    <button
                        type="button"
                        class="table-action view-shipment-btn"
                        title="View shipment"
                        data-shipment-id="${shipment._id}"
                    >
                        <i class="fa-solid fa-eye"></i>
                    </button>
                </td>

            `;



            tableBody.appendChild(row);

        });

    }


    /* =====================================================
       SEARCH
    ===================================================== */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            () => {
                renderShipments();
            }
        );

    }


    /* =====================================================
       STATUS FILTER
    ===================================================== */

    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            () => {
                renderShipments();
            }
        );

    }


    /* =====================================================
       REFRESH
    ===================================================== */

    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            async () => {

                const icon =
                    refreshButton.querySelector("i");

                icon?.classList.add("fa-spin");

                await loadShipments();

                setTimeout(() => {

                    icon?.classList.remove("fa-spin");

                }, 500);

            }
        );

    }



    /* =====================================================
   VIEW SHIPMENT MODAL
===================================================== */

    const shipmentModal =
        document.getElementById("shipment-view-modal");

    const closeShipmentModal =
        document.getElementById("close-shipment-modal");


    function setModalValue(id, value) {

        const element =
            document.getElementById(id);

        if (element) {
            element.textContent =
                value === null ||
                    value === undefined ||
                    value === ""
                    ? "-"
                    : value;
        }

    }


    function formatMoney(value) {

        return `₹ ${Number(value || 0).toFixed(2)} `;

    }

    function openShipmentModal(shipment) {

        if (!shipmentModal) {
            return;
        }

        /* =====================================================
           CUSTOMER / CONSIGNOR / CONSIGNEE
        ===================================================== */

        setModalValue(
            "modal-consignor",
            shipment.consignor
        );

        setModalValue(
            "modal-consignee",
            shipment.consignee
        );

        setModalValue(
            "modal-consignor-gstin",
            shipment.consignorGSTIN
        );

        setModalValue(
            "modal-consignee-gstin",
            shipment.consigneeGSTIN
        );

        setModalValue(
            "modal-cnote-type",
            shipment.cNoteType
        );

        setModalValue(
            "modal-billing-party",
            shipment.billingParty
        );


        /* =====================================================
           SHIPMENT INFORMATION
        ===================================================== */
        const cNoteNo =
            shipment.cNoteNo || shipment.trackingId || "-";


        setModalValue(
            "modal-tracking-id",
            shipment.cNoteNo || shipment.trackingId
        );
        setModalValue(
            "modal-cnote-no",
            cNoteNo
        );

        setModalValue(
            "modal-invoice-no",
            shipment.invoiceNo
        );

        setModalValue(
            "modal-status",
            formatStatus(shipment.status)
        );

        setModalValue(
            "modal-booking-date",
            formatDate(shipment.bookingDate)
        );

        setModalValue(
            "modal-booking-branch",
            shipment.bookingBranch
        );

        setModalValue(
            "modal-booking-from",
            shipment.bookingFrom
        );

        setModalValue(
            "modal-destination",
            shipment.destination
        );


        /* =====================================================
           GOODS & PACKAGE
        ===================================================== */

        setModalValue(
            "modal-goods",
            shipment.goods
        );

        setModalValue(
            "modal-goods-description",
            shipment.goodsDescription
        );

        setModalValue(
            "modal-actual-weight",
            `${shipment.actualWeight || 0} kg`
        );

        setModalValue(
            "modal-chargeable-weight",
            `${shipment.chargeableWeight || 0} kg`
        );

        setModalValue(
            "modal-package-count",
            shipment.packageCount
        );

        setModalValue(
            "modal-package-type",
            shipment.packageType
        );

        setModalValue(
            "modal-package-mode",
            shipment.packageMode
        );


        /* =====================================================
           BILLING
        ===================================================== */

        setModalValue(
            "modal-freight-rate",
            formatMoney(shipment.freightRate)
        );

        setModalValue(
            "modal-freight",
            formatMoney(
                Number(shipment.actualWeight || 0) *
                Number(shipment.freightRate || 0)
            )
        );

        setModalValue(
            "modal-st-charge",
            formatMoney(shipment.stCharge)
        );

        setModalValue(
            "modal-delivery-charge",
            formatMoney(shipment.deliveryCharge)
        );

        setModalValue(
            "modal-labour-charge",
            formatMoney(shipment.labourCharge)
        );

        setModalValue(
            "modal-other-charges",
            formatMoney(shipment.otherCharges)
        );

        setModalValue(
            "modal-adjustment",
            formatMoney(shipment.adjustment)
        );

        setModalValue(
            "modal-total-amount",
            formatMoney(shipment.totalAmount)
        );


        /* =====================================================
           MANIFEST
        ===================================================== */

        setModalValue(
            "modal-challan-number",
            shipment.challanNumber
        );

        setModalValue(
            "modal-manifest-date",
            formatDate(shipment.manifestDate)
        );

        setModalValue(
            "modal-manifest-from",
            shipment.manifestFrom
        );

        setModalValue(
            "modal-manifest-to",
            shipment.manifestTo
        );


        /* =====================================================
           SHOW MODAL
        ===================================================== */

        shipmentModal.classList.add("show");

    }

    /* CLICK ON EYE BUTTON */

    tableBody.addEventListener("click", (event) => {

        const button =
            event.target.closest(".view-shipment-btn");

        if (!button) {
            return;
        }


        const shipmentId =
            button.dataset.shipmentId;


        const shipment =
            shipments.find(
                item => item._id === shipmentId
            );


        if (!shipment) {

            console.error(
                "Shipment not found:",
                shipmentId
            );

            return;
        }


        openShipmentModal(shipment);

    });


    /* CLOSE BUTTON */

    if (closeShipmentModal) {

        closeShipmentModal.addEventListener(
            "click",
            () => {

                shipmentModal.classList.remove("show");

            }
        );

    }


    /* CLOSE WHEN CLICKING OUTSIDE */

    if (shipmentModal) {

        shipmentModal.addEventListener(
            "click",
            (event) => {

                if (event.target === shipmentModal) {

                    shipmentModal.classList.remove("show");

                }

            }
        );

    }


    /* CLOSE WITH ESC */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape" &&
                shipmentModal?.classList.contains("show")
            ) {

                shipmentModal.classList.remove("show");

            }

        }
    );


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    loadShipments();

});