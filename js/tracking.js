document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const shipmentSearch =
        document.getElementById(
            "tracking-shipment-search"
        );

    const shipmentsBody =
        document.getElementById(
            "tracking-shipments-body"
        );

    const selectAll =
        document.getElementById(
            "select-all-tracking"
        );

    const selectedCount =
        document.getElementById(
            "tracking-selected-count"
        );

    const emptyState =
        document.getElementById(
            "tracking-empty-state"
        );

    const createDispatchBtn =
        document.getElementById(
            "create-dispatch-btn"
        );

    const dispatchSearch =
        document.getElementById(
            "dispatch-search"
        );

    const dispatchesBody =
        document.getElementById(
            "dispatches-body"
        );

    const dispatchEmptyState =
        document.getElementById(
            "dispatch-empty-state"
        );

    const refreshDispatchesBtn =
        document.getElementById(
            "load-dispatches-btn"
        );



    /* =====================================================
       DATA
    ===================================================== */

    let shipments = [];

    let dispatches = [];
    let activeDispatch = null;

    const selectedShipmentIds =
        new Set();



    /* =====================================================
       API
    ===================================================== */

    const API =
        "https://countrywide-logistics.onrender.com/api";



    /* =====================================================
       GET AUTH TOKEN
    ===================================================== */

    function getToken() {

        return localStorage.getItem(
            "token"
        );

    }



    /* =====================================================
       LOAD SHIPMENTS
    ===================================================== */

    async function loadShipments() {

        try {

            const token =
                getToken();


            const response =
                await fetch(
                    `${API}/shipments`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Could not load shipments."
                );

            }


            shipments =
                Array.isArray(
                    data.shipments
                )
                    ? data.shipments
                    : [];


            renderShipmentSelection();


        } catch (error) {

            console.error(
                "Load shipments error:",
                error
            );


            shipments = [];


            renderShipmentSelection();


            alert(
                "Could not load shipments from the backend."
            );

        }

    }



    /* =====================================================
       RENDER SHIPMENT SELECTION
    ===================================================== */

    function renderShipmentSelection() {

        const searchValue =
            shipmentSearch
                ? shipmentSearch.value
                    .trim()
                    .toLowerCase()
                : "";


        const filteredShipments =
            shipments.filter(
                shipment => {

                    const cNote =
                        String(
                            shipment.cNoteNo ||
                            shipment.trackingId ||
                            ""
                        )
                            .toLowerCase();

                    const consignor =
                        String(
                            shipment.consignor ||
                            ""
                        )
                            .toLowerCase();

                    const consignee =
                        String(
                            shipment.consignee ||
                            ""
                        )
                            .toLowerCase();

                    const origin =
                        String(
                            shipment.bookingFrom ||
                            shipment.bookingBranch ||
                            ""
                        )
                            .toLowerCase();

                    const destination =
                        String(
                            shipment.destination ||
                            ""
                        )
                            .toLowerCase();


                    return (

                        cNote.includes(
                            searchValue
                        )

                        ||

                        consignor.includes(
                            searchValue
                        )

                        ||

                        consignee.includes(
                            searchValue
                        )

                        ||

                        origin.includes(
                            searchValue
                        )

                        ||

                        destination.includes(
                            searchValue
                        )

                    );

                }
            );


        shipmentsBody.innerHTML =
            "";


        if (
            filteredShipments.length ===
            0
        ) {

            emptyState.style.display =
                "block";

            updateSelectedCount();

            return;

        }


        emptyState.style.display =
            "none";


        filteredShipments.forEach(
            shipment => {

                const row =
                    document.createElement(
                        "tr"
                    );


                const cNote =
                    shipment.cNoteNo ||
                    shipment.trackingId ||
                    "-";


                const origin =
                    shipment.bookingFrom ||
                    shipment.bookingBranch ||
                    "-";


                const weight =
                    shipment.chargeableWeight ??
                    shipment.actualWeight ??
                    0;


                row.innerHTML = `

                    <td>

                        <input
                            type="checkbox"
                            class="tracking-shipment-checkbox"
                            value="${shipment._id}"
                        >

                    </td>


                    <td>
                        ${escapeHtml(cNote)}
                    </td>


                    <td>
                        ${escapeHtml(
                    shipment.consignor ||
                    "-"
                )}
                    </td>


                    <td>
                        ${escapeHtml(
                    shipment.consignee ||
                    "-"
                )}
                    </td>


                    <td>
                        ${escapeHtml(origin)}
                    </td>


                    <td>
                        ${escapeHtml(
                    shipment.destination ||
                    "-"
                )}
                    </td>


                    <td>
                        ${shipment.packageCount || 0}
                    </td>


                    <td>
                        ${weight} kg
                    </td>

                `;


                const checkbox =
                    row.querySelector(
                        ".tracking-shipment-checkbox"
                    );


                checkbox.checked =
                    selectedShipmentIds.has(
                        shipment._id
                    );


                shipmentsBody.appendChild(
                    row
                );

            }
        );


        updateSelectAllState();

        updateSelectedCount();

    }



    /* =====================================================
       SHIPMENT SEARCH
    ===================================================== */

    if (shipmentSearch) {

        shipmentSearch.addEventListener(
            "input",
            () => {

                renderShipmentSelection();

            }
        );

    }



    /* =====================================================
       SHIPMENT CHECKBOX
    ===================================================== */

    shipmentsBody.addEventListener(
        "change",
        event => {

            if (
                !event.target.classList.contains(
                    "tracking-shipment-checkbox"
                )
            ) {

                return;

            }


            const shipmentId =
                event.target.value;


            if (
                event.target.checked
            ) {

                selectedShipmentIds.add(
                    shipmentId
                );

            } else {

                selectedShipmentIds.delete(
                    shipmentId
                );

            }


            updateSelectedCount();

            updateSelectAllState();

        }
    );



    /* =====================================================
       SELECT ALL
    ===================================================== */

    if (selectAll) {

        selectAll.addEventListener(
            "change",
            () => {

                const visibleCheckboxes =
                    document.querySelectorAll(
                        ".tracking-shipment-checkbox"
                    );


                visibleCheckboxes.forEach(
                    checkbox => {

                        checkbox.checked =
                            selectAll.checked;


                        if (
                            checkbox.checked
                        ) {

                            selectedShipmentIds.add(
                                checkbox.value
                            );

                        } else {

                            selectedShipmentIds.delete(
                                checkbox.value
                            );

                        }

                    }
                );


                updateSelectedCount();

                updateSelectAllState();

            }
        );

    }



    /* =====================================================
       UPDATE SELECTED COUNT
    ===================================================== */

    function updateSelectedCount() {

        if (!selectedCount) {
            return;
        }


        selectedCount.textContent =
            selectedShipmentIds.size;

    }



    /* =====================================================
       UPDATE SELECT ALL STATE
    ===================================================== */

    function updateSelectAllState() {

        if (!selectAll) {
            return;
        }


        const visibleCheckboxes =
            document.querySelectorAll(
                ".tracking-shipment-checkbox"
            );


        if (
            visibleCheckboxes.length ===
            0
        ) {

            selectAll.checked =
                false;

            selectAll.indeterminate =
                false;

            return;

        }


        const checkedCount =
            Array.from(
                visibleCheckboxes
            )
                .filter(
                    checkbox =>
                        checkbox.checked
                )
                .length;


        selectAll.checked =
            checkedCount ===
            visibleCheckboxes.length;


        selectAll.indeterminate =
            checkedCount > 0 &&
            checkedCount <
            visibleCheckboxes.length;

    }



    /* =====================================================
       CREATE VEHICLE DISPATCH
    ===================================================== */

    createDispatchBtn.addEventListener(
        "click",
        async () => {


            /* -----------------------------------------
               GET FORM VALUES
            ----------------------------------------- */

            const vehicleNumber =
                document
                    .getElementById(
                        "vehicle-number"
                    )
                    .value
                    .trim();


            const ownerName =
                document
                    .getElementById(
                        "owner-name"
                    )
                    .value
                    .trim();


            const ownerAadhaar =
                document
                    .getElementById(
                        "owner-aadhaar"
                    )
                    .value
                    .trim();


            const driverName =
                document
                    .getElementById(
                        "driver-name"
                    )
                    .value
                    .trim();


            const driverPhone =
                document
                    .getElementById(
                        "driver-phone"
                    )
                    .value
                    .trim();


            const driverDL =
                document
                    .getElementById(
                        "driver-dl"
                    )
                    .value
                    .trim();


            const origin =
                document
                    .getElementById(
                        "dispatch-origin"
                    )
                    .value
                    .trim();


            const destination =
                document
                    .getElementById(
                        "dispatch-destination"
                    )
                    .value
                    .trim();


            const dispatchDate =
                document
                    .getElementById(
                        "dispatch-date"
                    )
                    .value;



            /* -----------------------------------------
               VALIDATION
            ----------------------------------------- */

            if (
                !vehicleNumber ||
                !ownerName ||
                !ownerAadhaar ||
                !driverName ||
                !driverPhone ||
                !driverDL ||
                !origin ||
                !destination ||
                !dispatchDate
            ) {

                alert(
                    "Please fill all vehicle, driver and route details."
                );

                return;

            }


            if (
                selectedShipmentIds.size ===
                0
            ) {

                alert(
                    "Please select at least one consignment."
                );

                return;

            }



            /* -----------------------------------------
               CONFIRM
            ----------------------------------------- */

            const confirmed =
                confirm(
                    `Create dispatch for vehicle ${vehicleNumber} with ${selectedShipmentIds.size} consignment(s)?`
                );


            if (!confirmed) {
                return;
            }



            /* -----------------------------------------
               DISABLE BUTTON
            ----------------------------------------- */

            createDispatchBtn.disabled =
                true;



            try {

                const token =
                    getToken();


                const response =
                    await fetch(
                        `${API}/vehicle-dispatches`,
                        {
                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                Authorization:
                                    `Bearer ${token}`

                            },

                            body:
                                JSON.stringify({

                                    vehicleNumber,

                                    ownerName,

                                    ownerAadhaar,

                                    driverName,

                                    driverPhone,

                                    driverDL,

                                    origin,

                                    destination,

                                    dispatchDate,

                                    shipmentIds:
                                        [
                                            ...selectedShipmentIds
                                        ]

                                })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Could not create vehicle dispatch."
                    );

                    return;

                }


                alert(
                    "Vehicle dispatch created successfully."
                );


                /* ---------------------------------
                   CLEAR SELECTION
                --------------------------------- */

                selectedShipmentIds.clear();


                if (selectAll) {

                    selectAll.checked =
                        false;

                    selectAll.indeterminate =
                        false;

                }


                /* ---------------------------------
                   CLEAR FORM
                --------------------------------- */

                clearDispatchForm();


                /* ---------------------------------
                   RELOAD DATA
                --------------------------------- */

                await loadShipments();

                await loadDispatches();


            } catch (error) {

                console.error(
                    "Create dispatch error:",
                    error
                );


                alert(
                    "Could not connect to the backend server."
                );

            } finally {

                createDispatchBtn.disabled =
                    false;

            }

        }
    );



    /* =====================================================
       CLEAR FORM
    ===================================================== */

    function clearDispatchForm() {

        const fields = [

            "vehicle-number",

            "owner-name",

            "owner-aadhaar",

            "driver-name",

            "driver-phone",

            "driver-dl",

            "dispatch-origin",

            "dispatch-destination",

            "dispatch-date"

        ];


        fields.forEach(
            id => {

                const field =
                    document.getElementById(
                        id
                    );


                if (field) {

                    field.value =
                        "";

                }

            }
        );

    }



    /* =====================================================
       LOAD VEHICLE DISPATCHES
    ===================================================== */

    async function loadDispatches() {

        try {

            const token =
                getToken();


            const response =
                await fetch(
                    `${API}/vehicle-dispatches`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Could not load dispatches."
                );

            }


            dispatches =
                Array.isArray(
                    data.dispatches
                )
                    ? data.dispatches
                    : [];


            renderDispatches();


        } catch (error) {

            console.error(
                "Load dispatches error:",
                error
            );


            dispatches = [];

            renderDispatches();

        }

    }



    /* =====================================================
       RENDER DISPATCHES
    ===================================================== */

    function renderDispatches() {

        const searchValue =
            dispatchSearch
                ? dispatchSearch.value
                    .trim()
                    .toLowerCase()
                : "";


        const filteredDispatches =
            dispatches.filter(
                dispatch => {

                    const vehicle =
                        String(
                            dispatch.vehicleNumber ||
                            ""
                        )
                            .toLowerCase();

                    const driver =
                        String(
                            dispatch.driverName ||
                            ""
                        )
                            .toLowerCase();

                    const origin =
                        String(
                            dispatch.origin ||
                            ""
                        )
                            .toLowerCase();

                    const destination =
                        String(
                            dispatch.destination ||
                            ""
                        )
                            .toLowerCase();


                    return (

                        vehicle.includes(
                            searchValue
                        )

                        ||

                        driver.includes(
                            searchValue
                        )

                        ||

                        origin.includes(
                            searchValue
                        )

                        ||

                        destination.includes(
                            searchValue
                        )

                    );

                }
            );


        dispatchesBody.innerHTML =
            "";


        if (
            filteredDispatches.length ===
            0
        ) {

            dispatchEmptyState.style.display =
                "block";

            return;

        }


        dispatchEmptyState.style.display =
            "none";


        filteredDispatches.forEach(
            dispatch => {

                const row =
                    document.createElement(
                        "tr"
                    );


                const shipmentCount =
                    Array.isArray(
                        dispatch.shipments
                    )
                        ? dispatch.shipments.length
                        : Array.isArray(
                            dispatch.shipmentIds
                        )
                            ? dispatch.shipmentIds.length
                            : 0;


                row.innerHTML = `

                    <td>
                        ${escapeHtml(
                    dispatch.vehicleNumber ||
                    "-"
                )}
                    </td>

                    <td>
                        ${escapeHtml(
                    dispatch.driverName ||
                    "-"
                )}
                    </td>

                    <td>
                        ${escapeHtml(
                    dispatch.driverPhone ||
                    "-"
                )}
                    </td>

                    <td>
                        ${escapeHtml(
                    dispatch.origin ||
                    "-"
                )}
                    </td>

                    <td>
                        ${escapeHtml(
                    dispatch.destination ||
                    "-"
                )}
                    </td>

                    <td>
                        ${formatDate(
                    dispatch.dispatchDate
                )}
                    </td>

                    <td>
                        ${shipmentCount}
                    </td>

                    <td>

                        <button
                            type="button"
                            class="tracking-view-dispatch-btn"
                            data-id="${dispatch._id}"
                        >

                            <i class="fa-solid fa-eye"></i>

                            View

                        </button>

                    </td>

                `;


                dispatchesBody.appendChild(
                    row
                );

            }
        );

    }



    /* =====================================================
       DISPATCH SEARCH
    ===================================================== */

    if (dispatchSearch) {

        dispatchSearch.addEventListener(
            "input",
            () => {

                renderDispatches();

            }
        );

    }



    /* =====================================================
       REFRESH DISPATCHES
    ===================================================== */

    if (refreshDispatchesBtn) {

        refreshDispatchesBtn.addEventListener(
            "click",
            async () => {

                const icon =
                    refreshDispatchesBtn
                        .querySelector("i");


                icon?.classList.add(
                    "fa-spin"
                );


                await loadDispatches();


                setTimeout(
                    () => {

                        icon?.classList.remove(
                            "fa-spin"
                        );

                    },
                    500
                );

            }
        );

    }



    /* =====================================================
       VIEW DISPATCH
    ===================================================== */

    dispatchesBody.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".tracking-view-dispatch-btn"
                );


            if (!button) {
                return;
            }


            const dispatchId =
                button.dataset.id;


            const dispatch =
                dispatches.find(
                    item =>
                        String(
                            item._id
                        ) ===
                        String(
                            dispatchId
                        )
                );


            if (!dispatch) {
                return;
            }


            showDispatchDetails(
                dispatch
            );

        }
    );



    /* =====================================================
       VIEW DISPATCH DETAILS
    ===================================================== */

    function showDispatchDetails(dispatch) {

        activeDispatch = dispatch;
        const modal = document.getElementById("dispatch-details-modal");
        const content = document.getElementById("dispatch-details-content");
        const subtitle = document.getElementById("dispatch-modal-subtitle");

        if (!modal || !content) return;

        const shipments = Array.isArray(dispatch.shipmentIds)
            ? dispatch.shipmentIds
            : Array.isArray(dispatch.shipments)
                ? dispatch.shipments
                : [];

        subtitle.textContent =
            `${dispatch.vehicleNumber || "-"} • ${shipments.length} Consignment${shipments.length !== 1 ? "s" : ""}`;

        content.innerHTML = `
        <div class="dispatch-details-section">

            <h3>Vehicle Information</h3>

            <div class="dispatch-info-grid">

                <div class="dispatch-info-item">
                    <span>Vehicle Number</span>
                    <strong>${escapeHtml(dispatch.vehicleNumber || "-")}</strong>
                </div>

                <div class="dispatch-info-item">
                    <span>Owner Name</span>
                    <strong>${escapeHtml(dispatch.ownerName || "-")}</strong>
                </div>

                <div class="dispatch-info-item">
                    <span>Owner Aadhaar</span>
                    <strong>${escapeHtml(dispatch.ownerAadhaar || "-")}</strong>
                </div>

            </div>

        </div>


        <div class="dispatch-details-section">

            <h3>Driver Information</h3>

            <div class="dispatch-info-grid">

                <div class="dispatch-info-item">
                    <span>Driver Name</span>
                    <strong>${escapeHtml(dispatch.driverName || "-")}</strong>
                </div>

                <div class="dispatch-info-item">
                    <span>Phone Number</span>
                    <strong>${escapeHtml(dispatch.driverPhone || "-")}</strong>
                </div>

                <div class="dispatch-info-item">
                    <span>Driving Licence</span>
                    <strong>${escapeHtml(dispatch.driverDL || "-")}</strong>
                </div>

            </div>

        </div>


        <div class="dispatch-details-section">

            <h3>Route Information</h3>

            <div class="dispatch-route">

                <div class="dispatch-route-box">
                    <span>Origin</span>
                    <strong>${escapeHtml(dispatch.origin || "-")}</strong>
                </div>

                <div class="dispatch-route-arrow">
                    →
                </div>

                <div class="dispatch-route-box">
                    <span>Destination</span>
                    <strong>${escapeHtml(dispatch.destination || "-")}</strong>
                </div>

                <div class="dispatch-route-box">
                    <span>Dispatch Date</span>
                    <strong>${formatDate(dispatch.dispatchDate)}</strong>
                </div>

            </div>

        </div>


        <div class="dispatch-details-section">

            <h3>
                Consignments (${shipments.length})
            </h3>

            ${shipments.length === 0
                ? `
                        <p style="color:#6b7280;">
                            No consignments found.
                        </p>
                    `
                : `
                        <div style="overflow-x:auto;">

                            <table class="dispatch-consignment-table">

                                <thead>
                                    <tr>
                                        <th>C/Note No.</th>
                                        <th>Consignor</th>
                                        <th>Consignee</th>
                                        <th>Origin</th>
                                        <th>Destination</th>
                                        <th>Packages</th>
                                        <th>Weight</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    ${shipments.map(shipment => {

                    const cNote =
                        shipment.cNoteNo ||
                        shipment.trackingId ||
                        "-";

                    const origin =
                        shipment.bookingFrom ||
                        shipment.bookingBranch ||
                        "-";

                    const weight =
                        shipment.chargeableWeight ??
                        shipment.actualWeight ??
                        0;

                    return `
                                            <tr>

                                                <td>
                                                    <strong>
                                                        ${escapeHtml(cNote)}
                                                    </strong>
                                                </td>

                                                <td>
                                                    ${escapeHtml(
                        shipment.consignor || "-"
                    )}
                                                </td>

                                                <td>
                                                    ${escapeHtml(
                        shipment.consignee || "-"
                    )}
                                                </td>

                                                <td>
                                                    ${escapeHtml(origin)}
                                                </td>

                                                <td>
                                                    ${escapeHtml(
                        shipment.destination || "-"
                    )}
                                                </td>

                                                <td>
                                                    ${shipment.packageCount || 0}
                                                </td>

                                                <td>
                                                    ${weight} kg
                                                </td>

                                            </tr>
                                        `;

                }).join("")}

                                </tbody>

                            </table>

                        </div>
                    `
            }

        </div>
    `;

        modal.classList.add("show");
    }
    function printDispatchDetails() {

        if (!activeDispatch) {
            alert("No dispatch selected.");
            return;
        }

        const dispatch = activeDispatch;

        const shipments = Array.isArray(dispatch.shipmentIds)
            ? dispatch.shipmentIds
            : Array.isArray(dispatch.shipments)
                ? dispatch.shipments
                : [];

        const shipmentRows = shipments.map((shipment, index) => {

            const cNote =
                shipment.cNoteNo ||
                shipment.trackingId ||
                "-";

            const origin =
                shipment.bookingFrom ||
                shipment.bookingBranch ||
                dispatch.origin ||
                "-";

            const weight =
                shipment.chargeableWeight ??
                shipment.actualWeight ??
                0;

            return `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${escapeHtml(cNote)}</strong></td>
                <td>${escapeHtml(shipment.consignor || "-")}</td>
                <td>${escapeHtml(shipment.consignee || "-")}</td>
                <td>${escapeHtml(origin)}</td>
                <td>${escapeHtml(shipment.destination || dispatch.destination || "-")}</td>
                <td>${shipment.packageCount || 0}</td>
                <td>${weight} kg</td>
            </tr>
        `;

        }).join("");

        const printWindow = window.open(
            "",
            "_blank",
            "width=1100,height=800"
        );

        if (!printWindow) {
            alert("Please allow pop-ups to print the dispatch sheet.");
            return;
        }

        printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>

            <title>
                Vehicle Dispatch - ${escapeHtml(dispatch.vehicleNumber || "")}
            </title>

            <style>

                @page {
                    size: A4 portrait;
                    margin: 12mm;
                }

                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    font-family: Arial, Helvetica, sans-serif;
                    color: #111;
                    background: #fff;
                    font-size: 12px;
                }

                .sheet {
                    width: 100%;
                }

                .header {
                    text-align: center;
                    border-bottom: 2px solid #111;
                    padding-bottom: 12px;
                    margin-bottom: 15px;
                }

                .header h1 {
                    margin: 0;
                    font-size: 24px;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                }

                .header p {
                    margin: 5px 0 0;
                    font-size: 13px;
                    color: #444;
                }

                .document-title {
                    text-align: center;
                    font-size: 17px;
                    font-weight: bold;
                    margin: 12px 0 18px;
                    text-transform: uppercase;
                    letter-spacing: 0.7px;
                }

                .section {
                    margin-bottom: 16px;
                }

                .section-title {
                    background: #f0f0f0;
                    border: 1px solid #222;
                    padding: 7px 9px;
                    font-weight: bold;
                    text-transform: uppercase;
                    font-size: 11px;
                    letter-spacing: 0.5px;
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    border-left: 1px solid #222;
                    border-top: 1px solid #222;
                }

                .info-item {
                    min-height: 48px;
                    padding: 7px 9px;
                    border-right: 1px solid #222;
                    border-bottom: 1px solid #222;
                }

                .label {
                    display: block;
                    font-size: 9px;
                    color: #555;
                    text-transform: uppercase;
                    margin-bottom: 5px;
                }

                .value {
                    display: block;
                    font-size: 12px;
                    font-weight: bold;
                }

                .route-grid {
                    display: grid;
                    grid-template-columns: 1fr 50px 1fr;
                    border: 1px solid #222;
                    align-items: center;
                }

                .route-box {
                    padding: 12px;
                    text-align: center;
                }

                .route-box .label {
                    margin-bottom: 5px;
                }

                .route-value {
                    font-size: 16px;
                    font-weight: bold;
                }

                .arrow {
                    text-align: center;
                    font-size: 22px;
                    font-weight: bold;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 0;
                }

                th,
                td {
                    border: 1px solid #222;
                    padding: 7px 6px;
                    text-align: left;
                    vertical-align: middle;
                }

                th {
                    background: #f0f0f0;
                    font-size: 9px;
                    text-transform: uppercase;
                    text-align: center;
                }

                td {
                    font-size: 10px;
                }

                td:first-child,
                td:nth-child(1),
                td:nth-child(2),
                td:nth-child(7),
                td:nth-child(8) {
                    text-align: center;
                }

                .summary {
                    display: flex;
                    justify-content: flex-end;
                    margin-top: 10px;
                }

                .summary-box {
                    border: 1px solid #222;
                    padding: 9px 15px;
                    font-weight: bold;
                    font-size: 12px;
                }

                .signatures {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 30px;
                    margin-top: 55px;
                }

                .signature {
                    border-top: 1px solid #222;
                    padding-top: 7px;
                    text-align: center;
                    font-size: 10px;
                }

                .footer {
                    margin-top: 25px;
                    padding-top: 8px;
                    border-top: 1px solid #aaa;
                    text-align: center;
                    font-size: 9px;
                    color: #666;
                }

                @media print {

                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }

                    .no-print {
                        display: none;
                    }

                }

            </style>

        </head>

        <body>

            <div class="sheet">

                <div class="header">
                    <h1>Vehicle Dispatch Sheet</h1>
                    <p>Transport / Consignment Dispatch Record</p>
                </div>

                <div class="document-title">
                    Vehicle Dispatch Details
                </div>


                <!-- VEHICLE -->

                <div class="section">

                    <div class="section-title">
                        Vehicle Information
                    </div>

                    <div class="info-grid">

                        <div class="info-item">
                            <span class="label">Vehicle Number</span>
                            <span class="value">
                                ${escapeHtml(dispatch.vehicleNumber || "-")}
                            </span>
                        </div>

                        <div class="info-item">
                            <span class="label">Owner Name</span>
                            <span class="value">
                                ${escapeHtml(dispatch.ownerName || "-")}
                            </span>
                        </div>

                        <div class="info-item">
                            <span class="label">Owner Aadhaar</span>
                            <span class="value">
                                ${escapeHtml(dispatch.ownerAadhaar || "-")}
                            </span>
                        </div>

                    </div>

                </div>


                <!-- DRIVER -->

                <div class="section">

                    <div class="section-title">
                        Driver Information
                    </div>

                    <div class="info-grid">

                        <div class="info-item">
                            <span class="label">Driver Name</span>
                            <span class="value">
                                ${escapeHtml(dispatch.driverName || "-")}
                            </span>
                        </div>

                        <div class="info-item">
                            <span class="label">Phone Number</span>
                            <span class="value">
                                ${escapeHtml(dispatch.driverPhone || "-")}
                            </span>
                        </div>

                        <div class="info-item">
                            <span class="label">Driving Licence</span>
                            <span class="value">
                                ${escapeHtml(dispatch.driverDL || "-")}
                            </span>
                        </div>

                    </div>

                </div>


                <!-- ROUTE -->

                <div class="section">

                    <div class="section-title">
                        Route & Dispatch
                    </div>

                    <div class="route-grid">

                        <div class="route-box">
                            <span class="label">Origin</span>
                            <div class="route-value">
                                ${escapeHtml(dispatch.origin || "-")}
                            </div>
                        </div>

                        <div class="arrow">
                            →
                        </div>

                        <div class="route-box">
                            <span class="label">Destination</span>
                            <div class="route-value">
                                ${escapeHtml(dispatch.destination || "-")}
                            </div>
                        </div>

                    </div>

                    <div class="info-grid">

                        <div class="info-item">
                            <span class="label">Dispatch Date</span>
                            <span class="value">
                                ${formatDate(dispatch.dispatchDate)}
                            </span>
                        </div>

                        <div class="info-item">
                            <span class="label">Total Consignments</span>
                            <span class="value">
                                ${shipments.length}
                            </span>
                        </div>

                        <div class="info-item">
                            <span class="label">Dispatch Status</span>
                            <span class="value">
                                ${escapeHtml(dispatch.status || "Dispatched")}
                            </span>
                        </div>

                    </div>

                </div>


                <!-- CONSIGNMENTS -->

                <div class="section">

                    <div class="section-title">
                        Consignment Details
                    </div>

                    <table>

                        <thead>

                            <tr>
                                <th>#</th>
                                <th>C/Note No.</th>
                                <th>Consignor</th>
                                <th>Consignee</th>
                                <th>Origin</th>
                                <th>Destination</th>
                                <th>Packages</th>
                                <th>Weight</th>
                            </tr>

                        </thead>

                        <tbody>

                            ${shipmentRows ||
            `
                                    <tr>
                                        <td colspan="8" style="text-align:center;">
                                            No consignments found
                                        </td>
                                    </tr>
                                `
            }

                        </tbody>

                    </table>

                    <div class="summary">

                        <div class="summary-box">
                            Total Consignments: ${shipments.length}
                        </div>

                    </div>

                </div>


                <!-- SIGNATURES -->

                <div class="signatures">

                    <div class="signature">
                        Prepared By
                    </div>

                    <div class="signature">
                        Driver Signature
                    </div>

                    <div class="signature">
                        Authorized Signature
                    </div>

                </div>


                <div class="footer">
                    Vehicle Dispatch Record
                </div>

            </div>

            <script>

                window.onload = function() {

                    window.focus();

                    setTimeout(function() {
                        window.print();
                    }, 300);

                };

            <\/script>

        </body>
        </html>
    `);

        printWindow.document.close();
    }


    const dispatchDetailsModal =
        document.getElementById("dispatch-details-modal");

    const closeDispatchModal =
        document.getElementById("close-dispatch-modal");

    const closeDispatchModalBottom =
        document.getElementById("close-dispatch-modal-bottom");


    function closeDispatchDetailsModal() {
        if (dispatchDetailsModal) {
            dispatchDetailsModal.classList.remove("show");
        }
    }


    if (closeDispatchModal) {
        closeDispatchModal.addEventListener(
            "click",
            closeDispatchDetailsModal
        );
    }


    if (closeDispatchModalBottom) {
        closeDispatchModalBottom.addEventListener(
            "click",
            closeDispatchDetailsModal
        );
    }


    if (dispatchDetailsModal) {
        dispatchDetailsModal.addEventListener("click", event => {

            if (event.target === dispatchDetailsModal) {
                closeDispatchDetailsModal();
            }

        });
    }

    const printDispatchBtn =
        document.getElementById("print-dispatch-btn");

    if (printDispatchBtn) {
        printDispatchBtn.addEventListener(
            "click",
            printDispatchDetails
        );
    }

    /* =====================================================
       FORMAT DATE
    ===================================================== */

    function formatDate(
        value
    ) {

        if (!value) {
            return "-";
        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return value;

        }


        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );

    }



    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHtml(
        value
    ) {

        return String(
            value ?? ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }



    /* =====================================================
       DEFAULT DATE
    ===================================================== */

    const dispatchDate =
        document.getElementById(
            "dispatch-date"
        );


    if (dispatchDate) {

        const today =
            new Date();


        const localDate =
            new Date(
                today.getTime() -
                today.getTimezoneOffset() *
                60000
            )
                .toISOString()
                .split("T")[0];


        dispatchDate.value =
            localDate;

    }



    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    loadShipments();

    loadDispatches();

});