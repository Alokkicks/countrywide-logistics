document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const challanNumber =
        document.getElementById("challan-number");

    const manifestDate =
        document.getElementById("manifest-date");

    const manifestFrom =
        document.getElementById("manifest-from");

    const manifestTo =
        document.getElementById("manifest-to");

    const manifestBranch =
        document.getElementById("manifest-branch");

    const trainName =
        document.getElementById("train-name");

    const loadShipmentsBtn =
        document.getElementById("load-shipments-btn");

    const shipmentSearch =
        document.getElementById("manifest-shipment-search");

    const shipmentsBody =
        document.getElementById("manifest-shipments-body");

    const selectAll =
        document.getElementById("select-all-shipments");

    const selectedCount =
        document.getElementById("selected-count");

    const emptyState =
        document.getElementById("manifest-empty-state");

    const createManifestBtn =
        document.getElementById("create-manifest-btn");

    const findChallan =
        document.getElementById("find-challan-number");

    const findManifestBtn =
        document.getElementById("find-manifest-btn");

    const manifestResult =
        document.getElementById("manifest-result");


    /* =====================================================
       DATA
    ===================================================== */

    let shipments = [];


    /* =====================================================
       DEFAULT DATE
    ===================================================== */

    const today =
        new Date().toISOString().split("T")[0];

    if (manifestDate) {
        manifestDate.value = today;
    }


    /* =====================================================
       LOAD AVAILABLE SHIPMENTS
    ===================================================== */

    async function loadShipments() {

        try {

            const token = localStorage.getItem("token");

            const response =
                await fetch(
                    "https://countrywide-logistics.onrender.com/api/shipments",
                    {
                        headers: {
                            "Authorization": `Bearer ${token}`
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


            /*
             * Only shipments that have not already
             * been assigned to a manifest are shown.
             */




            shipments =
                (data.shipments || []).filter(
                    shipment =>
                        !shipment.challanNumber ||
                        shipment.challanNumber.trim() === ""
                );


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
            shipmentSearch.value
                .trim()
                .toLowerCase();


        const filteredShipments =
            shipments.filter(shipment => {

                return (

                    shipment.trackingId
                        ?.toLowerCase()
                        .includes(searchValue)

                    ||

                    shipment.companyName
                        ?.toLowerCase()
                        .includes(searchValue)

                    ||

                    shipment.destination
                        ?.toLowerCase()
                        .includes(searchValue)

                    ||

                    shipment.goods
                        ?.toLowerCase()
                        .includes(searchValue)

                );

            });


        shipmentsBody.innerHTML = "";


        if (filteredShipments.length === 0) {

            emptyState.style.display = "block";

            updateSelectedCount();

            return;

        }


        emptyState.style.display = "none";


        filteredShipments.forEach(shipment => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    <input
                        type="checkbox"
                        class="shipment-checkbox"
                        value="${shipment._id}"
                    >
                </td>

                <td>
                    <strong>
                        ${shipment.trackingId || "-"}
                    </strong>
                </td>

               <td>
                    ${shipment.consignor || "-"}
                </td>

                <td>
                    ${shipment.destination || "-"}
                </td>

                <td>
                    ${shipment.chargeableWeight || shipment.actualWeight || 0}
                    kg
                </td>

                <td>
                    ${shipment.packageCount || 0}
                </td>

                <td>
                    ₹ ${Number(
                shipment.totalAmount || 0
            ).toFixed(2)}
                </td>

            `;


            shipmentsBody.appendChild(row);

        });


        applyPreviouslySelected();

        updateSelectedCount();

    }


    /* =====================================================
       REMEMBER SELECTED SHIPMENTS
    ===================================================== */

    let selectedShipmentIds = new Set();
    let selectedPaymentTypes = new Map();


    function applyPreviouslySelected() {

        const checkboxes =
            document.querySelectorAll(
                ".shipment-checkbox"
            );


        checkboxes.forEach(checkbox => {

            checkbox.checked =
                selectedShipmentIds.has(
                    checkbox.value
                );

        });

        updateSelectAllState();

    }


    /* =====================================================
       UPDATE SELECTED COUNT
    ===================================================== */

    function updateSelectedCount() {

        const count =
            selectedShipmentIds.size;


        selectedCount.textContent =
            `${count} shipment${count === 1 ? "" : "s"} selected`;

        updateSelectAllState();

    }


    /* =====================================================
       SELECT ALL STATE
    ===================================================== */

    function updateSelectAllState() {

        const visibleCheckboxes =
            document.querySelectorAll(
                ".shipment-checkbox"
            );


        if (
            visibleCheckboxes.length === 0
        ) {

            selectAll.checked = false;

            selectAll.indeterminate = false;

            return;

        }


        const checkedCount =
            [...visibleCheckboxes]
                .filter(
                    checkbox => checkbox.checked
                )
                .length;


        selectAll.checked =
            checkedCount ===
            visibleCheckboxes.length;


        selectAll.indeterminate =
            checkedCount > 0 &&
            checkedCount < visibleCheckboxes.length;

    }


    /* =====================================================
       SHIPMENT CHECKBOX CLICK
    ===================================================== */

    shipmentsBody.addEventListener(
        "change",
        event => {

            if (
                !event.target.classList
                    .contains("shipment-checkbox")
            ) {
                return;
            }


            if (event.target.checked) {

                selectedShipmentIds.add(
                    event.target.value
                );

            } else {

                selectedShipmentIds.delete(
                    event.target.value
                );

            }


            updateSelectedCount();

        }
    );


    /* =====================================================
       SELECT ALL
    ===================================================== */

    selectAll.addEventListener(
        "change",
        () => {

            const visibleCheckboxes =
                document.querySelectorAll(
                    ".shipment-checkbox"
                );


            visibleCheckboxes.forEach(
                checkbox => {

                    checkbox.checked =
                        selectAll.checked;


                    if (checkbox.checked) {

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

        }
    );


    /* =====================================================
       SEARCH
    ===================================================== */

    shipmentSearch.addEventListener(
        "input",
        () => {

            renderShipmentSelection();

        }
    );


    /* =====================================================
       LOAD / REFRESH BUTTON
    ===================================================== */

    loadShipmentsBtn.addEventListener(
        "click",
        async () => {

            const icon =
                loadShipmentsBtn.querySelector("i");


            icon?.classList.add("fa-spin");


            await loadShipments();


            setTimeout(() => {

                icon?.classList.remove("fa-spin");

            }, 500);

        }
    );


    /* =====================================================
       CREATE MANIFEST
    ===================================================== */

    createManifestBtn.addEventListener(
        "click",
        async () => {

            const challan =
                challanNumber.value.trim();

            const date =
                manifestDate.value;

            const from =
                manifestFrom.value.trim();

            const to =
                manifestTo.value.trim();

            const branch =
                manifestBranch.value.trim();

            const vehicle =
                trainName.value.trim();


            /* -----------------------------------------
               VALIDATION
            ----------------------------------------- */

            if (
                !challan ||
                !date ||
                !from ||
                !to ||
                !branch
            ) {

                alert(
                    "Please fill all required manifest details."
                );

                return;

            }


            if (
                selectedShipmentIds.size === 0
            ) {

                alert(
                    "Please assign at least one shipment."
                );

                return;

            }


            /* -----------------------------------------
               DISABLE BUTTON
            ----------------------------------------- */

            createManifestBtn.disabled = true;


            try {

                const response =
                    await fetch(
                        "https://countrywide-logistics.onrender.com/api/manifests",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",
                                "Authorization": `Bearer ${localStorage.getItem("token")}`
                            },

                            body: JSON.stringify({

                                challanNumber:
                                    challan,

                                manifestDate:
                                    date,

                                manifestFrom:
                                    from,

                                manifestTo:
                                    to,

                                branch:
                                    branch,

                                trainName:
                                    vehicle,

                                shipmentIds:
                                    [...selectedShipmentIds]

                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Could not create manifest."
                    );

                    return;

                }


                alert(
                    "Manifest created successfully!"
                );


                /* -------------------------------------
                   CLEAR SELECTED SHIPMENTS
                ------------------------------------- */

                selectedShipmentIds.clear();

                selectAll.checked = false;


                /* -------------------------------------
                   LOAD AVAILABLE SHIPMENTS AGAIN
                ------------------------------------- */

                await loadShipments();


                /* -------------------------------------
                   SHOW CREATED MANIFEST
                ------------------------------------- */

                renderManifestResult(
                    data.manifest
                );


                /* -------------------------------------
                   PUT CHALLAN INTO FIND BOX
                ------------------------------------- */

                findChallan.value =
                    challan;


            } catch (error) {

                console.error(
                    "Create manifest error:",
                    error
                );

                alert(
                    "Could not connect to the backend server."
                );

            } finally {

                createManifestBtn.disabled =
                    false;

            }

        }
    );


    /* =====================================================
       FIND MANIFEST
    ===================================================== */

    findManifestBtn.addEventListener(
        "click",
        async () => {

            const challan =
                findChallan.value.trim();


            if (!challan) {

                alert(
                    "Please enter a Challan / VPH number."
                );

                return;

            }


            findManifestBtn.disabled = true;


            try {

                const response =
                    await fetch(
                        `https://countrywide-logistics.onrender.com/api/manifests/${encodeURIComponent(challan)}`,
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem("token")}`
                            }
                        }
                    );
                const data =
                    await response.json();


                if (!response.ok) {

                    manifestResult.classList.remove(
                        "show"
                    );

                    alert(
                        data.message ||
                        "Manifest not found."
                    );

                    return;

                }


                renderManifestResult(
                    data.manifest
                );


            } catch (error) {

                console.error(
                    "Find manifest error:",
                    error
                );

                alert(
                    "Could not connect to the backend server."
                );

            } finally {

                findManifestBtn.disabled =
                    false;

            }

        }
    );


    /* =====================================================
   RENDER MANIFEST RESULT
===================================================== */

    function renderManifestResult(manifest) {

        if (!manifestResult) {
            return;
        }


        /* ==========================================
           NORMAL SCREEN TABLE
        =========================================== */
        function getCNoteTypeLabel(value) {

            const type = String(value || "").toLowerCase().trim();

            if (type === "to-pay" || type === "t") {
                return "T";
            }

            if (type === "paid" || type === "p") {
                return "P";
            }

            if (type === "to-bill" || type === "tb") {
                return "TB";
            }

            return value || "-";
        }


        const shipmentRows =
            (manifest.shipments || [])
                .map((shipment, index) => {

                    return `

                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            <strong>
                                ${shipment.trackingId || "-"}
                            </strong>
                        </td>

                       <td>
                            ${shipment.consignor || "-"}
                        </td>

                        <td>
                            ${shipment.destination || "-"}
                        </td>

                        <td>
                            ${shipment.goods || "-"}
                        </td>

                        <td>
                            ${shipment.packageCount || 0}
                        </td>

                        <td>
                            ${shipment.chargeableWeight ||
                        shipment.actualWeight ||
                        0
                        } kg
                        </td>

                        <td>
                            ₹ ${Number(
                            shipment.totalAmount || 0
                        ).toFixed(2)} 
                        ${getCNoteTypeLabel(shipment.cNoteType)}
                        
                        </td>
                        
                        
                        
                        
                        

                    </tr>

                `;

                })
                .join("");


        /* ==========================================
           TOTALS
        =========================================== */

        const totalWeight =
            (manifest.shipments || [])
                .reduce(
                    (total, shipment) => {

                        return total +
                            Number(
                                shipment.chargeableWeight ||
                                shipment.actualWeight ||
                                0
                            );

                    },
                    0
                );


        const totalPackages =
            (manifest.shipments || [])
                .reduce(
                    (total, shipment) => {

                        return total +
                            Number(
                                shipment.packageCount || 0
                            );

                    },
                    0
                );


        const totalAmount =
            (manifest.shipments || [])
                .reduce(
                    (total, shipment) => {

                        return total +
                            Number(
                                shipment.totalAmount || 0
                            );

                    },
                    0
                );


        /* ==========================================
           PRINT TABLE ROWS
        =========================================== */

        const printShipmentRows =
            (manifest.shipments || [])
                .map((shipment, index) => {

                    return `

                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${shipment.trackingId || "-"}
                        </td>

                        <td>
                            ${shipment.packageCount || 0}
                        </td>

                        <td>
                            ${Number(
                        shipment.chargeableWeight ||
                        shipment.actualWeight ||
                        0
                    ).toFixed(2)
                        }
                        </td>

                        <td>
                            ${shipment.goods || "-"}
                        </td>

                        <td>
                            ${Number(
                            shipment.totalAmount || 0
                        ).toFixed(2)}
                        ${getCNoteTypeLabel(shipment.cNoteType)}

                       
                        </td>

                        <td>
                            ${shipment.consignor || "-"}
                        </td>

                        <td>
                            ${shipment.consignee || "-"}
                        </td>

                    </tr>

                `;

                })
                .join("");


        /* ==========================================
           SCREEN + PRINT HTML
        =========================================== */

        manifestResult.innerHTML = `

        <!-- ==========================================
             SCREEN VERSION
        =========================================== -->

        <div class="result-header">

            <div>

                <h3>
                    Manifest ${manifest.challanNumber}
                </h3>

                <p>
                    ${manifest.shipments?.length || 0}
                    shipment${manifest.shipments?.length === 1 ? "" : "s"}
                    assigned
                </p>

            </div>


            <button
                type="button"
                class="print-manifest-btn"
                onclick="window.print()"
            >

                <i class="fa-solid fa-print"></i>

                Print Manifest

            </button>

        </div>


        <div class="result-details">

            <div class="result-detail">

                <span>
                    Challan / VPH No.
                </span>

                <strong>
                    ${manifest.challanNumber || "-"}
                </strong>

            </div>


            <div class="result-detail">

                <span>
                    Date
                </span>

                <strong>
                    ${formatDate(manifest.manifestDate)}
                </strong>

            </div>


            <div class="result-detail">

                <span>
                    From
                </span>

                <strong>
                    ${manifest.manifestFrom || "-"}
                </strong>

            </div>


            <div class="result-detail">

                <span>
                    To
                </span>

                <strong>
                    ${manifest.manifestTo || "-"}
                </strong>

            </div>


            <div class="result-detail">

                <span>
                    Branch
                </span>

                <strong>
                    ${manifest.branch || "-"}
                </strong>

            </div>


            <div class="result-detail">

                <span>
                    Train / Vehicle
                </span>

                <strong>
                    ${manifest.trainName || "-"}
                </strong>

            </div>

        </div>


        <div class="result-table-wrapper">

            <table class="result-table">

                <thead>

                    <tr>

                        <th>#</th>

                        <th>
                            Consignment
                        </th>

                        <th>
                            Consignor
                        </th>

                        <th>
                            Destination
                        </th>

                        <th>
                            Contents
                        </th>

                        <th>
                            Packages
                        </th>

                        <th>
                            Weight
                        </th>

                        <th>
                            Amount
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${shipmentRows || `
                        <tr>
                            <td colspan="8">
                                No shipments assigned.
                            </td>
                        </tr>
                    `}

                </tbody>

            </table>

        </div>


        <div class="result-total">

            <div class="result-total-box">

                <div class="result-total-row">

                    <span>
                        Total Packages
                    </span>

                    <strong>
                        ${totalPackages}
                    </strong>

                </div>


                <div class="result-total-row">

                    <span>
                        Total Weight
                    </span>

                    <strong>
                        ${totalWeight.toFixed(2)} kg
                    </strong>

                </div>


                <div class="result-total-row">

                    <span>
                        Total Amount
                    </span>

                    <strong>
                        ₹ ${totalAmount.toFixed(2)}
                    </strong>

                </div>

            </div>

        </div>


        <!-- ==========================================
             PRINT VERSION
        =========================================== -->

        <div class="manifest-print-sheet">

            <!-- COMPANY -->

            <div class="manifest-print-company">

                <h1>
                    COUNTRYWIDE LOGISTICS
                </h1>

                <p>
                   131 CR AVENUE 3RD FLOOR KOLKATA-700073.
                </p>
                <p>
                  PHONE NO. 8697548765 
                </p>

            </div>


            <!-- TITLE -->

            <div class="manifest-print-title">
                MANIFEST
            </div>


            <!-- META INFORMATION -->

            <div class="manifest-print-meta">


                <!-- LEFT -->

                <div class="manifest-print-meta-column">

                    <div class="manifest-print-meta-row">

                        <span class="manifest-print-meta-label">
                            Challan No.
                        </span>

                        <span>
                            ${manifest.challanNumber || "-"}
                        </span>

                    </div>


                    <div class="manifest-print-meta-row">

                        <span class="manifest-print-meta-label">
                            From
                        </span>

                        <span>
                            ${manifest.manifestFrom || "-"}
                        </span>

                    </div>


                    <div class="manifest-print-meta-row">

                        <span class="manifest-print-meta-label">
                            Destination
                        </span>

                        <span>
                            ${manifest.manifestTo || "-"}
                        </span>

                    </div>

                </div>


                <!-- RIGHT -->

                <div class="manifest-print-meta-column">

                    <div class="manifest-print-meta-row">

                        <span class="manifest-print-meta-label">
                            Date
                        </span>

                        <span>
                            ${formatDate(manifest.manifestDate)}
                        </span>

                    </div>


                    <div class="manifest-print-meta-row">

                        <span class="manifest-print-meta-label">
                            Veh. No.
                        </span>

                        <span>
                            ${manifest.trainName || "-"}
                        </span>

                    </div>


                    <div class="manifest-print-meta-row">

                        <span class="manifest-print-meta-label">
                            Loaded By
                        </span>

                        <span>
                            -
                        </span>

                    </div>

                </div>

            </div>


            <!-- ==========================================
                 PRINT TABLE
            =========================================== -->

            <table class="manifest-print-table">

                <colgroup>

                    <col style="width: 5%;">

                    <col style="width: 12%;">

                    <col style="width: 6%;">

                    <col style="width: 9%;">

                    <col style="width: 14%;">

                    <col style="width: 11%;">

                    <col style="width: 21.5%;">

                    <col style="width: 21.5%;">

                </colgroup>


                <thead>

                    <tr>

                        <th>
                            S. No.
                        </th>

                        <th>
                            Cnmt. No.
                        </th>

                        <th>
                            Pkgs
                        </th>

                        <th>
                            Weight
                        </th>

                        <th>
                            Contents
                        </th>

                        <th>
                            Freight
                        </th>

                        <th>
                            Consignor
                        </th>

                        <th>
                            Consignee
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${printShipmentRows ||
            `
                        <tr>
                            <td colspan="8">
                                No shipments assigned.
                            </td>
                        </tr>
                        `
            }


                    <!-- TOTAL -->

                    <tr class="manifest-print-total">

                        <td colspan="2">
                            TOTAL
                        </td>

                        <td>
                            ${totalPackages}
                        </td>

                        <td>
                            ${totalWeight.toFixed(2)}
                        </td>

                        <td>
                        </td>

                        <td>
                            ${totalAmount.toFixed(2)}
                        </td>

                        <td>
                        </td>

                        <td>
                        </td>

                    </tr>

                </tbody>

            </table>


            <!-- ==========================================
                 FOOTER
            =========================================== -->

            <div class="manifest-print-footer">

                <div class="manifest-print-note">

                    Branch:
                    <strong>
                        ${manifest.branch || "-"}
                    </strong>

                </div>


                <div class="manifest-print-signature">

                    AUTHORISED SIGNATORY

                </div>

            </div>

        </div>

    `;


        manifestResult.classList.add("show");

    }


    /* =====================================================
       FORMAT DATE
    ===================================================== */

    function formatDate(dateValue) {

        if (!dateValue) {
            return "-";
        }


        const date =
            new Date(dateValue);


        if (isNaN(date.getTime())) {
            return "-";
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
       INITIAL LOAD
    ===================================================== */

    loadShipments();

});