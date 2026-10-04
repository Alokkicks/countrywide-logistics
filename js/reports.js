/* =========================================================
   REPORTS MODULE
   COUNTRYWIDE LOGISTICS
========================================================= */

let allShipments = [];
let currentShipment = null;


/* =========================================================
   START
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeTabs();
    initializeForms();
    initializePartySuggestions();
    loadShipments();

});


/* =========================================================
   LOAD SHIPMENTS
========================================================= */

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

        if (!response.ok) {
            throw new Error("Unable to fetch shipments.");
        }

        const data = await response.json();

        allShipments =
            data.success &&
                Array.isArray(data.shipments)
                ? data.shipments
                : [];

    } catch (error) {

        console.error(
            "Reports shipment loading error:",
            error
        );

        allShipments = [];
    }
}


/* =========================================================
   TABS
========================================================= */

function initializeTabs() {

    const tabs =
        document.querySelectorAll(".report-tab");

    const slider =
        document.querySelector(".tab-slider");

    const panels =
        document.querySelectorAll(".report-panel");


    tabs.forEach((tab, index) => {

        tab.addEventListener("click", () => {

            tabs.forEach(item => {
                item.classList.remove("active");
            });

            tab.classList.add("active");

            slider.style.left =
                `${index * 25}%`;


            panels.forEach(panel => {
                panel.classList.remove("active");
            });


            const panel =
                document.getElementById(
                    `${tab.dataset.tab}-panel`
                );


            if (panel) {
                panel.classList.add("active");
            }

        });

    });
}


/* =========================================================
   FORMS
========================================================= */

function initializeForms() {

    document
        .getElementById("freight-form")
        .addEventListener("submit", event => {

            event.preventDefault();

            findFreightBill();

        });


    /* =========================================
    PAYMENT UPDATE FORM
    ========================================= */

    document
        .getElementById("payment-form")
        .addEventListener("submit", event => {

            event.preventDefault();

            findPaymentShipment();

        });
    document
        .getElementById("outstanding-form")
        .addEventListener("submit", event => {

            event.preventDefault();

            generateOutstandingReport();

        });


    document
        .getElementById("tracker-form")
        .addEventListener("submit", event => {

            event.preventDefault();

            generateBillTracker();

        });


    document
        .getElementById("generated-form")
        .addEventListener("submit", event => {

            event.preventDefault();

            findGeneratedBill();

        });
}


/* =========================================================
   FIND SHIPMENT
========================================================= */

async function findShipment(trackingId) {

    const cleanId =
        String(trackingId || "").trim();


    if (!cleanId) {
        return null;
    }


    try {

        const response = await fetch(
            `http://localhost:5000/api/shipments/tracking/${encodeURIComponent(cleanId)}`
        );


        if (response.ok) {

            const data =
                await response.json();


            if (
                data.success &&
                data.shipment
            ) {

                return data.shipment;

            }
        }

    } catch (error) {

        console.warn(
            "Tracking endpoint unavailable. Searching loaded shipments.",
            error
        );

    }


    return allShipments.find(
        shipment => {

            const cnote =
                String(
                    shipment.cNoteNo ||
                    shipment.trackingId ||
                    ""
                )
                    .trim()
                    .toLowerCase();

            return cnote ===
                cleanId.toLowerCase();
        }
    ) || null;
}


/* =========================================================
   FREIGHT BILL
========================================================= */

async function findFreightBill() {

    const input =
        document.getElementById(
            "freight-cnote"
        );

    const result =
        document.getElementById(
            "freight-result"
        );


    const trackingId =
        input.value.trim();


    if (!trackingId) {

        showError(
            result,
            "Please enter a C-Note number."
        );

        return;
    }


    result.innerHTML = `
        <div class="info-message">
            Finding shipment...
        </div>
    `;


    const shipment =
        await findShipment(trackingId);


    if (!shipment) {

        showError(
            result,
            "No shipment was found with this C-Note number."
        );

        return;
    }


    currentShipment = shipment;


    const bill =
        calculateBill(shipment);


    renderFreightBill(
        result,
        shipment,
        bill
    );
}


/* =========================================
   FIND SHIPMENT FOR PAYMENT
========================================= */

async function findPaymentShipment() {

    const input =
        document.getElementById("payment-cnote");

    const result =
        document.getElementById(
            "payment-shipment-result"
        );

    const trackingId =
        input.value.trim();


    if (!trackingId) {

        showError(
            result,
            "Please enter a C-Note number."
        );

        return;
    }


    result.innerHTML = `
        <div class="info-message">
            Finding shipment...
        </div>
    `;


    const shipment =
        await findShipment(trackingId);


    if (!shipment) {

        showError(
            result,
            "No shipment was found with this C-Note number."
        );

        return;
    }


    renderPaymentUpdate(
        result,
        shipment
    );
}


/* =========================================
   PAYMENT UPDATE UI
========================================= */

function renderPaymentUpdate(
    result,
    shipment
) {

    const billAmount =
        Number(shipment.totalAmount || 0);

    const received =
        Number(shipment.amountReceived || 0);

    const outstanding =
        Math.max(
            billAmount - received,
            0
        );


    let status =
        shipment.paymentStatus ||
        "Outstanding";


    if (outstanding === 0 && billAmount > 0) {
        status = "Paid";
    } else if (received > 0) {
        status = "Partial";
    } else {
        status = "Outstanding";
    }


    result.innerHTML = `

        <div class="payment-update-card">

            <div class="payment-update-header">

                <div>

                    <h3>
                        Payment Details
                    </h3>

                    <p>
                        C-Note:
                        <strong>
                            ${escapeHtml(
        shipment.trackingId || "-"
    )}
                        </strong>
                    </p>

                </div>

                <span class="status-badge ${status === "Paid"
            ? "paid"
            : ""
        }">
                    ${status.toUpperCase()}
                </span>

            </div>


            <div class="payment-summary">

                <div class="payment-box">

                    <span>
                        Bill Amount
                    </span>

                    <strong>
                        ${money(billAmount)}
                    </strong>

                </div>


                <div class="payment-box">

                    <span>
                        Already Received
                    </span>

                    <strong>
                        ${money(received)}
                    </strong>

                </div>


                <div class="payment-box">

                    <span>
                        Outstanding
                    </span>

                    <strong>
                        ${money(outstanding)}
                    </strong>

                </div>

            </div>


            ${outstanding > 0
            ? `

                <div class="payment-entry">

                    <div class="input-group">

                        <label for="payment-amount">
                            Payment Received Now
                        </label>

                        <input
                            id="payment-amount"
                            type="number"
                            min="0.01"
                            step="0.01"
                            max="${outstanding}"
                            placeholder="Enter amount received"
                        >

                    </div>


                    <button
                        type="button"
                        class="primary-btn"
                        id="update-payment-btn"
                    >

                        <i class="fa-solid fa-check"></i>

                        Update Payment

                    </button>

                </div>

                `
            : `

                <div class="info-message">
                    This bill is already fully paid.
                </div>

                `
        }

        </div>

    `;


    const updateButton =
        document.getElementById(
            "update-payment-btn"
        );


    if (updateButton) {

        updateButton.addEventListener(
            "click",
            () => updatePayment(shipment)
        );

    }
}


/* =========================================
   UPDATE PAYMENT
========================================= */

async function updatePayment(shipment) {

    const paymentInput =
        document.getElementById(
            "payment-amount"
        );

    const updateButton =
        document.getElementById(
            "update-payment-btn"
        );

    const amount =
        Number(paymentInput.value);


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        alert(
            "Please enter a valid payment amount."
        );

        return;
    }


    const billAmount =
        Number(shipment.totalAmount || 0);

    const alreadyReceived =
        Number(shipment.amountReceived || 0);

    const outstanding =
        Math.max(
            billAmount - alreadyReceived,
            0
        );


    if (amount > outstanding) {

        alert(
            `Payment cannot exceed the outstanding amount of ${money(outstanding)}`
        );

        return;
    }


    updateButton.disabled = true;

    updateButton.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Updating...
    `;


    try {

        const response =
            await fetch(
                "http://localhost:5000/api/shipments/payment",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    },

                    body: JSON.stringify({
                        trackingId:
                            shipment.trackingId,

                        paymentAmount:
                            amount
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Payment update failed."
            );

        }


        alert(
            "Payment updated successfully."
        );


        /*
         * Refresh the shipment from MongoDB
         * so the UI shows the newly saved values.
         */

        const updatedShipment =
            await findShipment(
                shipment.trackingId
            );

        if (updatedShipment) {

            // Update the shipment inside allShipments
            const index = allShipments.findIndex(
                item =>
                    String(item.trackingId).trim().toLowerCase() ===
                    String(updatedShipment.trackingId).trim().toLowerCase()
            );

            if (index !== -1) {
                allShipments[index] = updatedShipment;
            }

            // Refresh the payment information on screen
            renderPaymentUpdate(
                document.getElementById(
                    "payment-shipment-result"
                ),
                updatedShipment
            );

        }

    } catch (error) {

        console.error(
            "Payment update error:",
            error
        );

        alert(
            error.message ||
            "Could not update payment."
        );

    } finally {

        if (updateButton) {

            updateButton.disabled = false;

        }

    }
}


/* =========================================================
   BILL CALCULATION
========================================================= */

function calculateBill(shipment) {

    const weight =
        Number(
            shipment.chargeableWeight ??
            shipment.actualWeight ??
            0
        );


    const rate =
        Number(
            shipment.freightRate || 0
        );


    const freight =
        weight * rate;


    const labour =
        Number(
            shipment.labourCharge || 0
        );


    const delivery =
        Number(
            shipment.deliveryCharge || 0
        );


    const other =
        Number(
            shipment.otherCharges || 0
        );


    const adjustment =
        Number(
            shipment.adjustment || 0
        );


    /*
       ST CHARGE IS COMPULSORY.

       If MongoDB contains a valid ST charge,
       use it.

       Otherwise use ₹100.
    */

    const storedST =
        Number(shipment.stCharge);


    const stCharge =
        Number.isFinite(storedST) &&
            storedST > 0
            ? storedST
            : 100;


    const total =
        freight +
        labour +
        delivery +
        other +
        adjustment +
        stCharge;


    return {

        weight,
        rate,
        freight,
        labour,
        delivery,
        other,
        adjustment,
        stCharge,
        total

    };
}


/* =========================================================
   FREIGHT BILL RESULT
   BASIC DETAILS ONLY
========================================================= */

function renderFreightBill(
    result,
    shipment,
    bill
) {

    const received =
        Number(
            shipment.amountReceived || 0
        );


    const outstanding =
        Math.max(
            bill.total - received,
            0
        );


    const paid =
        String(
            shipment.paymentStatus || ""
        ).toLowerCase() === "paid" ||
        outstanding === 0;


    result.innerHTML = `

        <div class="freight-result-shell">

            <div class="freight-result-topbar">

                <div>

                    <h3>
                        Freight Bill Details
                    </h3>

                    <p>
                        C-Note:
                        <strong>
                            ${escapeHtml(
        shipment.trackingId || "-"
    )}
                        </strong>
                    </p>

                </div>


                <span class="status-badge ${paid ? "paid" : ""}">
                    ${paid ? "PAID" : "OUTSTANDING"}
                </span>

            </div>


            <!-- BASIC SHIPMENT DETAILS -->

            <div class="freight-details-grid">

                ${freightDetail(
        "C-Note / Bill No.",
        shipment.trackingId
    )}

                ${freightDetail(
        "Date",
        formatDate(
            getShipmentDate(shipment)
        )
    )}

                ${freightDetail(
        "Billed To",
        shipment.companyName
    )}

                ${freightDetail(
        "Consignor",
        shipment.consignor
    )}

                ${freightDetail(
        "Consignee",
        shipment.consignee
    )}

                ${freightDetail(
        "Goods",
        shipment.goods ||
        shipment.goodsDescription
    )}

                ${freightDetail(
        "From",
        shipment.bookingBranch
    )}

                ${freightDetail(
        "To",
        shipment.destination
    )}

                ${freightDetail(
        "Packages",
        shipment.packageCount
    )}

                ${freightDetail(
        "Weight",
        getWeight(shipment)
    )}

                ${freightDetail(
        "Freight Rate",
        money(bill.rate)
    )}

                ${freightDetail(
        "Freight Amount",
        money(bill.freight)
    )}

            </div>


            <!-- CHARGES -->

            <div class="freight-charges">

                <div class="freight-charges-header">
                    BILL CHARGES
                </div>


                ${freightCharge(
        "Freight",
        bill.freight
    )}


                ${freightCharge(
        "Labour Charge",
        bill.labour
    )}


                ${freightCharge(
        "Delivery Charge",
        bill.delivery
    )}


                ${freightCharge(
        "Other Charges",
        bill.other
    )}


                ${freightCharge(
        "Adjustment",
        bill.adjustment
    )}


                <!-- ST ALWAYS EXISTS -->

                ${freightCharge(
        "ST Charge",
        bill.stCharge
    )}


                <div class="freight-charge-row freight-total-row">

                    <span>
                        TOTAL AMOUNT
                    </span>

                    <strong>
                        ${money(
        bill.total
    )}
                    </strong>

                </div>

            </div>


            <!-- PAYMENT SUMMARY -->

            <div class="payment-summary">

                <div class="payment-box">

                    <span>
                        BILL AMOUNT
                    </span>

                    <strong>
                        ${money(
        bill.total
    )}
                    </strong>

                </div>


                <div class="payment-box">

                    <span>
                        AMOUNT RECEIVED
                    </span>

                    <strong>
                        ${money(
        received
    )}
                    </strong>

                </div>


                <div class="payment-box">

                    <span>
                        OUTSTANDING
                    </span>

                    <strong>
                        ${money(
        outstanding
    )}
                    </strong>

                </div>

            </div>


            <!-- ONLY PRINT BUTTON -->

            <div class="result-actions">

                <button
                    type="button"
                    class="print-btn"
                    id="print-freight-bill"
                >

                    <i class="fa-solid fa-print"></i>

                    Print Bill

                </button>

            </div>

        </div>

    `;


    document
        .getElementById(
            "print-freight-bill"
        )
        .addEventListener(
            "click",
            () => {

                printFreightBill(
                    shipment,
                    bill
                );

            }
        );
}


/* =========================================================
   OUTSTANDING BILL
   KEPT AS EXISTING
========================================================= */

function generateOutstandingReport() {

    const from =
        document.getElementById(
            "outstanding-from"
        ).value;


    const to =
        document.getElementById(
            "outstanding-to"
        ).value;


    const result =
        document.getElementById(
            "outstanding-result"
        );


    if (!validateDates(from, to)) {

        showError(
            result,
            "Please select a valid date range."
        );

        return;
    }


    const shipments =
        allShipments.filter(shipment => {

            const date =
                getShipmentDate(shipment);


            return (
                date &&
                date >= from &&
                date <= to
            );

        });


    const outstandingShipments =
        shipments.filter(shipment => {

            const bill =
                calculateBill(
                    shipment
                );


            const received =
                Number(
                    shipment.amountReceived ||
                    0
                );


            const outstanding =
                Math.max(
                    bill.total - received,
                    0
                );

            const status =
                String(
                    shipment.paymentStatus ||
                    ""
                ).toLowerCase();


            return (
                outstanding > 0 &&
                status !== "paid"
            );

        });


    renderOutstandingReport(
        result,
        outstandingShipments,
        from,
        to
    );
}


/* =========================================================
   GROUP BY PARTY
========================================================= */

function groupByParty(
    shipments
) {

    const groups = {};


    shipments.forEach(
        shipment => {

            const party =
                String(
                    shipment.companyName ||
                    "Unknown Party"
                ).trim();


            if (!groups[party]) {
                groups[party] = [];
            }


            groups[party].push(
                shipment
            );

        }
    );


    return groups;
}


function renderOutstandingReport(
    result,
    shipments,
    from,
    to
) {

    if (!shipments.length) {

        result.innerHTML = `
            <div class="info-message">
                No outstanding consignments were found
                in the selected date range.
            </div>
        `;

        return;
    }


    const groups =
        groupByParty(
            shipments
        );


    let html = "";


    Object.entries(groups).forEach(
        ([party, partyShipments]) => {

            let totalBill = 0;
            let totalReceived = 0;
            let totalOutstanding = 0;

            let rows = "";


            partyShipments.forEach(
                shipment => {

                    const bill =
                        calculateBill(
                            shipment
                        );


                    const received =
                        Number(
                            shipment.amountReceived ||
                            0
                        );


                    const outstanding =
                        Math.max(
                            bill.total - received,
                            0
                        );


                    totalBill +=
                        bill.total;

                    totalReceived +=
                        received;

                    totalOutstanding +=
                        outstanding;


                    rows += `

                        <tr>

                            <td>
                                ${escapeHtml(
                        shipment.trackingId ||
                        "-"
                    )}
                            </td>

                            <td>
                                ${formatDate(
                        getShipmentDate(
                            shipment
                        )
                    )}
                            </td>

                            <td>
                                ${escapeHtml(
                        shipment.goods ||
                        "-"
                    )}
                            </td>

                            <td>
                                ${escapeHtml(
                        getWeight(
                            shipment
                        )
                    )}
                            </td>

                            <td>
                                ${money(
                        bill.total
                    )}
                            </td>

                            <td>
                                ${money(
                        received
                    )}
                            </td>

                            <td>
                                <strong>
                                    ${money(
                        outstanding
                    )}
                                </strong>
                            </td>

                        </tr>

                    `;
                }
            );


            html += `

                <div class="party-group">

                    <div class="party-group-header">

                        <h3>
                            ${escapeHtml(
                party
            )}
                        </h3>

                        <span>
                            ${partyShipments.length}
                            outstanding bill(s)
                        </span>

                    </div>


                    <div class="table-wrapper">

                        <table class="report-table">

                            <thead>

                                <tr>

                                    <th>
                                        C-Note No.
                                    </th>

                                    <th>
                                        Date
                                    </th>

                                    <th>
                                        Goods
                                    </th>

                                    <th>
                                        Weight
                                    </th>

                                    <th>
                                        Amount
                                    </th>

                                    <th>
                                        Received
                                    </th>

                                    <th>
                                        Outstanding
                                    </th>

                                </tr>

                            </thead>


                            <tbody>
                                ${rows}
                            </tbody>

                        </table>

                    </div>


                    <div class="party-total">

                        ${partyTotal(
                "Bill Amount",
                totalBill
            )}

                        ${partyTotal(
                "Received",
                totalReceived
            )}

                        ${partyTotal(
                "Balance",
                totalOutstanding
            )}

                    </div>

                </div>

            `;

        }
    );


    result.innerHTML = `

        <div>

            <div class="bill-result-heading">

                <div>

                    <h3>
                        Outstanding Bill Register
                    </h3>

                    <p>
                        ${formatDate(from)}
                        to
                        ${formatDate(to)}
                    </p>

                </div>


                <!-- ONLY NEW ADDITION -->

                <button
                    type="button"
                    class="print-outstanding-btn"
                    id="print-outstanding-btn"
                >

                    <i class="fa-solid fa-print"></i>

                    Print Outstanding Bill

                </button>

            </div>


            ${html}

        </div>

    `;


    /* ============================================
       PRINT BUTTON
    ============================================ */

    document
        .getElementById(
            "print-outstanding-btn"
        )
        .addEventListener(
            "click",
            () => {

                printOutstandingBill(
                    shipments,
                    from,
                    to
                );

            }
        );
}


/* =========================================================
   PRINT OUTSTANDING BILL
========================================================= */

function printOutstandingBill(
    shipments,
    from,
    to
) {

    const groups =
        groupByParty(
            shipments
        );


    let grandBill = 0;
    let grandReceived = 0;
    let grandOutstanding = 0;


    let partySections = "";


    Object.entries(groups).forEach(
        ([party, partyShipments]) => {

            let partyBill = 0;
            let partyReceived = 0;
            let partyOutstanding = 0;


            let rows = "";


            partyShipments.forEach(
                shipment => {

                    const bill =
                        calculateBill(
                            shipment
                        );


                    const received =
                        Number(
                            shipment.amountReceived ||
                            0
                        );


                    const outstanding =
                        shipment.outstandingAmount !== undefined
                            ? Number(
                                shipment.outstandingAmount
                            )
                            : Math.max(
                                bill.total -
                                received,
                                0
                            );


                    partyBill +=
                        bill.total;

                    partyReceived +=
                        received;

                    partyOutstanding +=
                        outstanding;


                    grandBill +=
                        bill.total;

                    grandReceived +=
                        received;

                    grandOutstanding +=
                        outstanding;


                    rows += `

                        <tr>

                            <td>
                                ${escapeHtml(
                        shipment.trackingId ||
                        "-"
                    )}
                            </td>


                            <td>
                                ${formatDate(
                        getShipmentDate(
                            shipment
                        )
                    )}
                            </td>


                            <td>
                                ${escapeHtml(
                        shipment.goods ||
                        "-"
                    )}
                            </td>


                            <td>
                                ${escapeHtml(
                        getWeight(
                            shipment
                        )
                    )}
                            </td>


                            <td class="amount">
                                ${money(
                        bill.total
                    )}
                            </td>


                            <td class="amount">
                                ${money(
                        received
                    )}
                            </td>


                            <td class="amount">
                                ${money(
                        outstanding
                    )}
                            </td>

                        </tr>

                    `;
                }
            );


            partySections += `

                <div class="print-party">

                    <div class="print-party-title">

                        ${escapeHtml(
                party
            )}

                    </div>


                    <table>

                        <thead>

                            <tr>

                                <th>
                                    Bill No.
                                </th>

                                <th>
                                    Date
                                </th>

                                <th>
                                    Goods
                                </th>

                                <th>
                                    Weight
                                </th>

                                <th>
                                    Bill Amount
                                </th>

                                <th>
                                    Recd Amount
                                </th>

                                <th>
                                    O/S Amount
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            ${rows}

                        </tbody>


                        <tfoot>

                            <tr>

                                <td
                                    colspan="4"
                                    class="party-total-label"
                                >
                                    PARTY TOTAL
                                </td>

                                <td class="amount">
                                    ${money(
                partyBill
            )}
                                </td>

                                <td class="amount">
                                    ${money(
                partyReceived
            )}
                                </td>

                                <td class="amount">
                                    ${money(
                partyOutstanding
            )}
                                </td>

                            </tr>

                        </tfoot>

                    </table>

                </div>

            `;

        }
    );


    const printWindow =
        window.open(
            "",
            "_blank",
            "width=1100,height=850"
        );


    if (!printWindow) {

        alert(
            "Please allow pop-ups to print the Outstanding Bill."
        );

        return;
    }


    printWindow.document.open();


    printWindow.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <meta charset="UTF-8">

            <title>
                Outstanding Bill Register
            </title>


            <style>

                * {
                    box-sizing: border-box;
                }


                @page {
                    size: A4 portrait;
                    margin: 12mm  16mm ;
                }


                body {

                    margin: 0;

                    font-family:
                        Arial,
                        Helvetica,
                        sans-serif;

                    color: #000;

                    font-size: 10px;

                }


                .print-container {

                    width: 100%;

                }


                .company-header {

                    text-align: center;

                    margin-bottom: 15px;

                }


                .company-header h1 {

                    margin: 0;

                    font-size: 21px;

                    font-weight: 900;

                }


                .company-header p {

                    margin: 3px 0;

                    font-size: 9px;

                }


                .report-title {

                    text-align: center;

                    margin: 10px 0 15px;

                    font-size: 15px;

                    font-weight: 900;

                }


                .date-range {

                    text-align: center;

                    margin-bottom: 18px;

                    font-size: 10px;

                    font-weight: 700;

                }


                .print-party {

                    margin-bottom: 18px;

                    page-break-inside: avoid;

                }


                .print-party-title {

                    padding: 6px 8px;

                    border: 1px solid #000;

                    border-bottom: none;

                    font-size: 11px;

                    font-weight: 900;

                    text-transform: uppercase;

                }


                table {

                    width: 100%;

                    border-collapse: collapse;

                    table-layout: fixed;

                }


                th,
                td {

                    border: 1px solid #000;

                    padding: 6px 5px;

                    vertical-align: middle;

                }


                th {

                    text-align: center;

                    font-size: 8px;

                    font-weight: 900;

                }


                td {

                    font-size: 8.5px;

                }


                td.amount {

                    text-align: right;

                    white-space: nowrap;

                }


                th:nth-child(1) {
                    width: 13%;
                }


                th:nth-child(2) {
                    width: 11%;
                }


                th:nth-child(3) {
                    width: 23%;
                }


                th:nth-child(4) {
                    width: 12%;
                }


                th:nth-child(5) {
                    width: 14%;
                }


                th:nth-child(6) {
                    width: 13%;
                }


                th:nth-child(7) {
                    width: 14%;
                }


                tfoot td {

                    font-weight: 900;

                }


                .party-total-label {

                    text-align: left;

                }


                .grand-total {

                    margin-top: 20px;

                    border: 2px solid #000;

                    padding: 10px;

                    page-break-inside: avoid;

                }


                .grand-total-title {

                    margin-bottom: 8px;

                    font-size: 12px;

                    font-weight: 900;

                }


                .grand-total-row {

                    display: flex;

                    justify-content: space-between;

                    padding: 4px 0;

                    font-size: 10px;

                    font-weight: 700;

                }


                .grand-total-row:last-child {

                    border-top: 1px solid #000;

                    margin-top: 4px;

                    padding-top: 7px;

                    font-size: 11px;

                    font-weight: 900;

                }


                .footer {

                    margin-top: 30px;

                    display: flex;

                    justify-content: space-between;

                    font-size: 9px;

                    font-weight: 700;

                }


                @media print {

                    body {

                        -webkit-print-color-adjust:
                            exact;

                        print-color-adjust:
                            exact;

                    }

                }

            </style>

        </head>


        <body>

            <div class="print-container">


                <div class="company-header">

                    <h1>
                        COUNTRYWIDE LOGISTICS
                    </h1>

                    <p>
                        131 C.R. Avenue, Kolkata - 700073
                    </p>

                    <p>
                        Email:
                        newcountrywidelogistics@gmail.com
                    </p>

                </div>


                <div class="report-title">

                    FREIGHT BILL REGISTER
                    (OUTSTANDING)

                </div>


                <div class="date-range">

                    From:
                    ${formatDate(from)}

                    &nbsp;&nbsp;&nbsp;

                    To:
                    ${formatDate(to)}

                </div>


                ${partySections}


                <div class="grand-total">

                    <div class="grand-total-title">

                        GRAND TOTAL

                    </div>


                    <div class="grand-total-row">

                        <span>
                            BILL AMOUNT
                        </span>

                        <span>
                            ${money(
        grandBill
    )}
                        </span>

                    </div>


                    <div class="grand-total-row">

                        <span>
                            RECD AMOUNT
                        </span>

                        <span>
                            ${money(
        grandReceived
    )}
                        </span>

                    </div>


                    <div class="grand-total-row">

                        <span>
                            BALANCE
                        </span>

                        <span>
                            ${money(
        grandOutstanding
    )}
                        </span>

                    </div>

                </div>


                <div class="footer">

                    <span>
                        For COUNTRYWIDE LOGISTICS
                    </span>

                    <span>
                        Authorised Signatory
                    </span>

                </div>


            </div>

        </body>

        </html>

    `);


    printWindow.document.close();


    printWindow.onload = () => {

        setTimeout(
            () => {

                printWindow.focus();

                printWindow.print();

            },
            500
        );

    };
}


/* =========================================================
   BILL TRACKER
========================================================= */

function generateBillTracker() {

    const party =
        document.getElementById(
            "tracker-party"
        ).value.trim();


    const from =
        document.getElementById(
            "tracker-from"
        ).value;


    const to =
        document.getElementById(
            "tracker-to"
        ).value;


    const result =
        document.getElementById(
            "tracker-result"
        );


    if (!party) {

        showError(
            result,
            "Please enter a party name."
        );

        return;
    }


    if (!validateDates(from, to)) {

        showError(
            result,
            "Please select a valid date range."
        );

        return;
    }


    const searchParty =
        party.toLowerCase();


    const shipments =
        allShipments.filter(
            shipment => {

                const consignor =
                    String(
                        shipment.consignor || ""
                    )
                        .trim()
                        .toLowerCase();

                const consignee =
                    String(
                        shipment.consignee || ""
                    )
                        .trim()
                        .toLowerCase();


                const date =
                    getShipmentDate(
                        shipment
                    );


                return (
                    (
                        consignor.includes(searchParty) ||
                        consignee.includes(searchParty)
                    ) &&
                    date >= from &&
                    date <= to
                );

            }
        );


    renderBillTracker(
        result,
        party,
        shipments,
        from,
        to
    );
}


/* =========================================================
   RENDER BILL TRACKER
========================================================= */

function renderBillTracker(
    result,
    party,
    shipments,
    from,
    to
) {

    if (!shipments.length) {

        result.innerHTML = `
            <div class="info-message">
                No bills were found for
                ${escapeHtml(party)}
                in the selected date range.
            </div>
        `;

        return;
    }


    let total = 0;
    let totalReceived = 0;
    let totalOutstanding = 0;


    const rows =
        shipments
            .map(
                shipment => {

                    const bill =
                        calculateBill(
                            shipment
                        );


                    const received =
                        Number(
                            shipment.amountReceived ||
                            0
                        );


                    const outstanding =
                        shipment.outstandingAmount !== undefined
                            ? Number(
                                shipment.outstandingAmount
                            )
                            : Math.max(
                                bill.total -
                                received,
                                0
                            );


                    total +=
                        bill.total;

                    totalReceived +=
                        received;

                    totalOutstanding +=
                        outstanding;


                    const paid =
                        outstanding === 0 ||
                        String(
                            shipment.paymentStatus ||
                            ""
                        ).toLowerCase() ===
                        "paid";


                    return `

                        <tr>

                            <td>
                                ${escapeHtml(
                        shipment.trackingId ||
                        "-"
                    )}
                            </td>

                            <td>
                                ${formatDate(
                        getShipmentDate(
                            shipment
                        )
                    )}
                            </td>

                            <td>
                                ${escapeHtml(
                        shipment.goods ||
                        "-"
                    )}
                            </td>

                            <td>
                                ${escapeHtml(
                        getWeight(
                            shipment
                        )
                    )}
                            </td>

                            <td>
                                ${money(
                        bill.total
                    )}
                            </td>

                            <td>
                                ${money(
                        received
                    )}
                            </td>

                            <td>
                                ${money(
                        outstanding
                    )}
                            </td>

                            <td>

                                <span class="status-badge ${paid ? "paid" : ""}">

                                    ${paid
                            ? "PAID"
                            : "OUTSTANDING"}

                                </span>

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


    result.innerHTML = `

        <div>

            <div class="bill-result-heading">

                <div>

                    <h3>
                        Bill Tracker
                    </h3>

                    <p>
                        ${escapeHtml(party)}
                        |
                        ${formatDate(from)}
                        -
                        ${formatDate(to)}
                    </p>

                </div>

            </div>


            <div class="table-wrapper">

                <table class="report-table">

                    <thead>

                        <tr>

                            <th>
                                C-Note No.
                            </th>

                            <th>
                                Date
                            </th>

                            <th>
                                Goods
                            </th>

                            <th>
                                Weight
                            </th>

                            <th>
                                Bill Amount
                            </th>

                            <th>
                                Received
                            </th>

                            <th>
                                Outstanding
                            </th>

                            <th>
                                Status
                            </th>

                        </tr>

                    </thead>


                    <tbody>
                        ${rows}
                    </tbody>


                    <tfoot>

                        <tr>

                            <td colspan="4">
                                TOTAL
                            </td>

                            <td>
                                ${money(total)}
                            </td>

                            <td>
                                ${money(
        totalReceived
    )}
                            </td>

                            <td>
                                ${money(
        totalOutstanding
    )}
                            </td>

                            <td>
                                -
                            </td>

                        </tr>

                    </tfoot>

                </table>

            </div>

        </div>

    `;
}


/* =========================================================
   GENERATED BILLS
========================================================= */

async function findGeneratedBill() {

    const searchInput =
        document.getElementById("generated-search");

    const result =
        document.getElementById("generated-result");

    const search =
        searchInput.value.trim().toLowerCase();


    if (!search) {

        showError(
            result,
            "Please enter a party name or C-Note number."
        );

        return;
    }


    result.innerHTML =
        `<div class="info-message">
            Searching generated bills...
        </div>`;


    /*
     * Find all shipments matching:
     * 1. Party / company name
     * 2. C-Note number
     *
     * Only shipments having a C-Note
     * are considered generated bills.
     */

    const matchedShipments =
        allShipments.filter(shipment => {

            const cnote =
                String(
                    shipment.cNoteNo ||
                    shipment.trackingId ||
                    ""
                )
                    .trim()
                    .toLowerCase();

            const consignor =
                String(
                    shipment.consignor || ""
                )
                    .trim()
                    .toLowerCase();

            const consignee =
                String(
                    shipment.consignee || ""
                )
                    .trim()
                    .toLowerCase();

            const invoiceNo =
                String(
                    shipment.invoiceNo || ""
                )
                    .trim()
                    .toLowerCase();

            return (
                cnote.includes(search) ||
                consignor.includes(search) ||
                consignee.includes(search) ||
                invoiceNo.includes(search)
            );
        });


    if (!matchedShipments.length) {

        showError(
            result,
            "No generated bills were found."
        );

        return;
    }


    const rows =
        matchedShipments.map(shipment => {

            const bill =
                calculateBill(shipment);

            return `
                <tr>

                    <td>
                        ${escapeHtml(
                shipment.trackingId || "-"
            )}
                    </td>

                    <td>
                        ${escapeHtml(
                `${shipment.consignor || "-"} / ${shipment.consignee || "-"}`
            )}
                    </td>

                    <td>
                        ${formatDate(
                getShipmentDate(shipment)
            )}
                    </td>

                    <td>
                        ${money(bill.total)}
                    </td>

                    <td>

                        <button
                            type="button"
                            class="secondary-btn generated-view-action"
                            data-cnote="${escapeHtml(
                shipment.trackingId || ""
            )}"
                        >
                            <i class="fa-solid fa-eye"></i>
                            View
                        </button>

                        <button
                            type="button"
                            class="print-btn generated-print-action"
                            data-cnote="${escapeHtml(
                shipment.trackingId || ""
            )}"
                        >
                            <i class="fa-solid fa-download"></i>
                            Download
                        </button>

                    </td>

                </tr>
            `;
        }).join("");


    result.innerHTML = `

        <div class="bill-result">

            <div class="bill-result-heading">

                <div>

                    <h3>
                        Generated Bills
                    </h3>

                    <p>
                        ${matchedShipments.length}
                        bill${matchedShipments.length === 1 ? "" : "s"}
                        found
                    </p>

                </div>

            </div>


            <div class="table-wrapper">

                <table class="report-table">

                    <thead>

                        <tr>

                            <th>C-Note No.</th>

                            <th>Party</th>

                            <th>Date</th>

                            <th>Bill Amount</th>

                            <th>Actions</th>

                        </tr>

                    </thead>


                    <tbody>

                        ${rows}

                    </tbody>

                </table>

            </div>

        </div>
    `;


    /*
     * VIEW BUTTONS
     */

    document
        .querySelectorAll(".generated-view-action")
        .forEach(button => {

            button.addEventListener(
                "click",
                async function () {

                    const cnote =
                        this.dataset.cnote;

                    // Open the window immediately
                    // while it is still a direct user click
                    const win = window.open(
                        "",
                        "_blank",
                        "width=1000,height=900"
                    );

                    if (!win) {
                        alert(
                            "Please allow pop-ups to view the full bill."
                        );
                        return;
                    }

                    win.document.write(`
                    <html>
                    <body style="
                        font-family: Arial;
                        padding: 40px;
                        text-align: center;
                    ">
                        Loading bill...
                    </body>
                    </html>
                `);

                    const shipment =
                        await findShipment(cnote);

                    if (!shipment) {

                        win.document.body.innerHTML = `
                        <h2>Bill not found</h2>
                        <p>Unable to find this shipment.</p>
                    `;

                        return;
                    }

                    const bill =
                        calculateBill(shipment);

                    const received =
                        Number(
                            shipment.amountReceived || 0
                        );

                    const outstanding =
                        Math.max(
                            bill.total - received,
                            0
                        );

                    win.document.open();

                    win.document.write(
                        buildBillDocument(
                            shipment,
                            bill,
                            received,
                            outstanding
                        )
                    );

                    win.document.close();

                }
            );

        });


    /*
     * DOWNLOAD BUTTONS
     *
     * Opens the existing bill in
     * print mode so the employee
     * can choose "Save as PDF".
     */

    document
        .querySelectorAll(".generated-print-action")
        .forEach(button => {

            button.addEventListener(
                "click",
                async function () {

                    const cnote =
                        this.dataset.cnote;

                    const shipment =
                        await findShipment(cnote);

                    if (!shipment) {
                        alert(
                            "Unable to find this shipment."
                        );
                        return;
                    }

                    const bill =
                        calculateBill(shipment);

                    printFreightBill(
                        shipment,
                        bill
                    );
                }
            );

        });
}


/* =========================================================
   PRINT FREIGHT BILL
========================================================= */

function printFreightBill(
    shipment,
    bill
) {

    const win =
        window.open(
            "",
            "_blank",
            "width=1000,height=900"
        );


    if (!win) {

        alert(
            "Please allow pop-ups to print the bill."
        );

        return;
    }


    win.document.open();


    win.document.write(
        buildBillDocument(
            shipment,
            bill
        )
    );


    win.document.close();


    win.onload = () => {

        setTimeout(() => {

            win.focus();

            win.print();

        }, 500);

    };
}


/* =========================================================
   BUILD PRINT DOCUMENT
========================================================= */

function buildBillDocument(
    shipment,
    bill
) {

    return `

<!DOCTYPE html>

<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>
        Countrywide Logistics - Freight Bill
    </title>


    <style>

        ${getPrintBillCSS()}

    </style>

</head>


<body>

    <div class="print-bill-page">

        ${buildPrintBillMarkup(
        shipment,
        bill
    )}

    </div>

</body>

</html>

    `;
}


/* =========================================================
   PRINT BILL CSS
   BASED ON THE PHYSICAL BILL STRUCTURE
========================================================= */
function getPrintBillCSS() {

    return `

        * {
            box-sizing: border-box;
        }

        @page {
            size: A4 portrait;
            margin: 7mm;
        }

        html,
        body {
            margin: 0;
            padding: 0;
            width: 100%;
            background: #fff;
        }

        body {
            font-family: Arial, Helvetica, sans-serif;
            color: #000;
            font-size: 8px;
        }

        .print-bill-page {
            width: 100%;
            margin: 0 auto;
            padding: 1mm;
            background: #fff;
        }

        /* =========================
           HEADER
        ========================= */

        .invoice {
            text-align: center;
            margin-bottom: 2mm;
            font-size: 20px;
            font-weight: 900;
        }

        .bill-type {
            font-size: 20px;
            font-weight: 900;
        }

        .print-company {
            text-align: center;
            margin-bottom: 3mm;
        }

        .print-company-name {
            margin: 0;
            font-size: 20px;
            line-height: 1.1;
            font-weight: 900;
        }

        .print-company-line {
            margin-top: 1mm;
            font-size: 10px;
            font-weight: 700;
        }

        .print-company-contact {
            margin-top: .5mm;
            font-size: 9px;
            font-weight: 700;
        }

        .print-company-gstin,
        .print-company-pan {
            margin-top: .5mm;
            font-size: 9px;
            font-weight: 900;
        }

        /* =========================
           INVOICE / DATE
        ========================= */

        .print-bill-heading {
            display: grid;
            grid-template-columns: 1fr 45mm;
            min-height: 13mm;

            border: 2px solid #000;
            border-radius: 8px;

            margin-bottom: 1.5mm;
        }

        .print-bill-left,
        .print-bill-right {
            padding: 2.5mm;
        }

        .print-bill-right {
            border-left: 1px solid #000;
        }

        .print-meta-line {
            font-size: 9px;
            line-height: 1.3;
        }

        .print-meta-label {
            font-weight: 900;
        }

        /* =========================
           BILLED TO
        ========================= */

        .print-customer-section {
            display: grid;

            grid-template-columns:
                1fr
                55mm;

            border: 2px solid #000;
            border-radius: 8px;

            min-height: 25mm;

            margin-bottom: 0;
        }

        .print-customer-left {
            padding: 2mm 2.5mm;
        }

        .print-customer-right {
            padding: 2mm 2.5mm;
            border-left: 1px solid #000;
        }

        .print-customer-label {
            margin-bottom: 1mm;
            font-size: 15px;
            font-weight: 900;
            text-transform: uppercase;
        }

        .print-customer-name {
            margin-bottom: 1mm;
            font-size: 9px;
            font-weight: 900;
        }

        .print-customer-row {
            display: grid;

            grid-template-columns:
                30mm
                1fr;

            margin-bottom: .8mm;

            font-size: 9px;
            line-height: 1.15;
        }

        .print-customer-row strong {
            font-weight: 900;
        }

        /* =========================
           DESCRIPTION
        ========================= */

        .print-description {
            width: 100%;

            padding: 2mm;

            border-left: 1px solid #000;
            border-right: 1px solid #000;
            border-bottom: 1px solid #000;

            text-align: center;

            font-size: 10px;
            font-weight: 900;
        }

        /* =========================
           MAIN TABLE
        ========================= */

        .print-main-table {
            width: 100%;

            border-collapse: collapse;

            table-layout: fixed;
        }

        .print-main-table th,
        .print-main-table td {
            border: 1px solid #000;
        }

        .print-main-table th {
            height: 10mm;

            padding: 1mm;

            text-align: center;
            vertical-align: middle;

            font-size: 7.2px;
            font-weight: 900;
            line-height: 1.1;
        }

        .print-main-table td {
            padding: 1.5mm;

            vertical-align: top;

            font-size: 8px;
            font-weight: 600;
        }

        /* MAIN BODY */

        .print-main-data-row {
            height: 105mm;
        }

        .print-main-data-row td {
            height: 105mm;
        }

        .print-party-content {
            line-height: 1.45;
            font-weight: 700;
        }

        .print-goods-content {
            margin-top: 7mm;

            padding-top: 3mm;

            border-top: 1px solid #000;

            line-height: 1.4;
        }

        /* =========================
           AMOUNT COLUMN
        ========================= */

        .print-amount-cell {
            padding: 0 !important;
            vertical-align: top !important;
        }

        .print-charge {
            display: flex;

            justify-content: space-between;
            align-items: center;

            width: 100%;

            min-height: 7mm;

            padding: 1.5mm 1.2mm;

            border-bottom: 1px solid #000;

            font-size: 7.5px;
            font-weight: 700;
        }

        .print-charge-name {
            text-align: left;
        }

        .print-charge-value {
            text-align: right;
            white-space: nowrap;
        }

        .print-charge.freight,
        .print-charge.st-charge {
            font-weight: 900;
        }

        /* =========================
           TOTAL
        ========================= */

        .print-total-row {
            height: 8mm;
        }

        .print-total-row td {
            height: 8mm;

            vertical-align: middle;

            font-weight: 900;
        }

        .print-total-label {
            text-align: left;

            padding-left: 2mm !important;
        }

        .print-total-number {
            text-align: center;
        }

        .print-total-amount {
            text-align: right;

            padding-right: 2mm !important;

            font-size: 8px !important;
        }

        /* =========================
           WORDS + TAX
        ========================= */

        .print-summary {
            display: grid;

            grid-template-columns:
                1fr
                53mm;

            border-left: 1px solid #000;
            border-right: 1px solid #000;
            border-bottom: 1px solid #000;

            min-height: 20mm;
        }

        .print-words {
            padding: 2.5mm;

            font-size: 7px;
            font-weight: 900;

            text-transform: uppercase;
        }

        .print-tax {
            border-left: 1px solid #000;
        }

        .print-tax-row {
            display: grid;

            grid-template-columns:
                1fr
                19mm;

            min-height: 4.8mm;

            border-bottom: 1px solid #000;

            font-size: 6.5px;
            font-weight: 700;
        }

        .print-tax-row:last-child {
            border-bottom: none;
        }

        .print-tax-row span {
            padding: 1mm;
        }

        .print-tax-row span:last-child {
            text-align: right;
            border-left: 1px solid #000;
        }

        /* =========================
           BOTTOM
        ========================= */

        .print-bottom {
            display: grid;

            grid-template-columns:
                1fr
                40mm
                1fr;

            min-height: 30mm;

            border-left: 1px solid #000;
            border-right: 1px solid #000;
            border-bottom: 1px solid #000;

            page-break-inside: avoid;
            break-inside: avoid;
        }

        .print-bank {
            padding: 2.5mm;

            font-size: 7px;
            line-height: 1.5;
        }

        .print-bank-title {
            margin-bottom: 1.5mm;

            font-size: 7.5px;
            font-weight: 900;
        }

        .qr-box {
            border-left: 1px solid #333;
            border-right: 1px solid #333;

            display: flex;

            flex-direction: column;

            align-items: center;
            justify-content: center;

            gap: 1mm;

            text-align: center;

            font-weight: 700;
        }

        .qr-box img {
            width: 22mm;
            height: 22mm;

            display: block;
        }

        .qr-title {
            font-size: 6.5px;
            line-height: 1;
            font-weight: 800;
        }

        .print-signatory {
            position: relative;

            padding: 2.5mm;

            font-size: 7px;
            font-weight: 700;
        }

        .print-signature {
            position: absolute;

            left: 0;
            right: 0;
            bottom: 3mm;

            text-align: center;

            font-size: 7px;
            font-weight: 700;
        }

        /* =========================
           NOTE
        ========================= */

        .print-note {
            padding: 1.5mm 2.5mm;

            border-left: 1px solid #000;
            border-right: 1px solid #000;
            border-bottom: 1px solid #000;

            font-size: 7px;
            font-weight: 700;

            page-break-inside: avoid;
            break-inside: avoid;
        }

        @media print {

            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }

        }

    `;
}


function buildPrintBillMarkup(
    shipment,
    bill
) {

    const invoiceNo =
        shipment.invoiceNo || "-";

    const cNoteNo =
        shipment.cNoteNo ||
        shipment.trackingId ||
        "-";

    const bookingDate =
        formatDate(
            getShipmentDate(shipment)
        );

    const consignor =
        shipment.consignor || "-";

    const consignee =
        shipment.consignee || "-";

    const consignorGSTIN =
        shipment.consignorGSTIN || "-";

    const consigneeGSTIN =
        shipment.consigneeGSTIN || "-";

    const goods =
        shipment.goods ||
        shipment.goodsDescription ||
        "-";

    const from =
        shipment.bookingBranch ||
        shipment.bookingFrom ||
        "-";

    const to =
        shipment.destination ||
        "-";

    const packageCount =
        Number(
            shipment.packageCount || 0
        );

    const packageType =
        shipment.packageType || "";

    const packageDisplay =
        packageType
            ? `${packageCount}`
            : String(packageCount);

    const weight =
        Number(
            shipment.chargeableWeight ??
            shipment.actualWeight ??
            0
        );

    const rate =
        Number(
            shipment.freightRate || 0
        );

    return `

        <!-- =========================
             HEADER
        ========================== -->

        <div class="invoice">
            INVOICE
        </div>

        <div class="print-company">

            <div class="print-company-name">
                COUNTRYWIDE LOGISTICS
            </div>

            <div class="print-company-line">
                131 C.R. Avenue, Kolkata - 700073
            </div>

            <div class="print-company-contact">
                Email:
                newcountrywidelogistics@gmail.com
            </div>

            <div class="print-company-contact">
                Phone:
                8697548765 / 7980984185
            </div>

            <div class="print-company-gstin">
                GSTIN: 19BPXPM4083A1Z1
            </div>

            <div class="print-company-pan">
                UDHMI NO:UDYAM-WB-10-0080150
            </div>

        </div>


        <!-- =========================
             INVOICE NUMBER / DATE
        ========================== -->

        <div class="print-bill-heading">

            <div class="print-bill-left">

                <div class="print-meta-line">

                    <span class="print-meta-label">
                        Invoice No:
                    </span>

                    ${escapeHtml(invoiceNo)}

                </div>

            </div>


            <div class="print-bill-right">

                <div class="print-meta-line">

                    <span class="print-meta-label">
                        Date:
                    </span>

                    ${escapeHtml(bookingDate)}

                </div>

            </div>

        </div>


        <!-- =========================
             CUSTOMER INFORMATION
        ========================== -->

        <div class="print-customer-section">

            <!-- LEFT SIDE -->

            <div class="print-customer-left">

                <div class="print-customer-label">
                    Billed To:
                </div>


                <div class="print-customer-row">

                    <strong>
                        Consignor
                    </strong>

                    <span>
                        ${escapeHtml(consignor)}
                    </span>

                </div>


                <div class="print-customer-row">

                    <strong>
                        Consignee
                    </strong>

                    <span>
                        ${escapeHtml(consignee)}
                    </span>

                </div>


                <div class="print-customer-row">

                    <strong>
                        Consignor GSTIN
                    </strong>

                    <span>
                        ${escapeHtml(consignorGSTIN)}
                    </span>

                </div>


                <div class="print-customer-row">

                    <strong>
                        Consignee GSTIN
                    </strong>

                    <span>
                        ${escapeHtml(consigneeGSTIN)}
                    </span>

                </div>

            </div>


            <!-- RIGHT SIDE -->

            <div class="print-customer-right">

                <div class="print-customer-row">

                    <strong>
                        State
                    </strong>

                    <span>
                        WEST BENGAL
                    </span>

                </div>


                <div class="print-customer-row">

                    <strong>
                        State Code
                    </strong>

                    <span>
                        19
                    </span>

                </div>


                <div class="print-customer-row">

                    <strong>
                        HSN Code
                    </strong>

                    <span>
                        ${escapeHtml(
        shipment.hsnCode ||
        shipment.hsnSacCode ||
        shipment.hsn ||
        "-"
    )}
                    </span>

                </div>

            </div>

        </div>


        <!-- =========================
             DESCRIPTION
        ========================== -->

        <div class="print-description">

            Being Transportation charges for carrying
            your materials as per details given below

        </div>


        <!-- =========================
             MAIN BILL TABLE
        ========================== -->

        <table class="print-main-table">

            <colgroup>

                <col style="width: 5%;">
                <col style="width: 9%;">
                <col style="width: 9%;">
                <col style="width: 8%;">
                <col style="width: 8%;">
                <col style="width: 25%;">
                <col style="width: 7%;">
                <col style="width: 8%;">
                <col style="width: 8%;">
                <col style="width: 13%;">

            </colgroup>


            <thead>

                <tr>

                    <th>
                        SI.
                    </th>

                    <th>
                        C.N NO.
                    </th>

                    <th>
                        DATE
                    </th>

                    <th>
                        FROM
                    </th>

                    <th>
                        TO
                    </th>

                    <th>
                        CONSIGNOR / CONSIGNEE
                        <br>
                        NAME
                    </th>

                    <th>
                        PKG.
                    </th>

                    <th>
                        WEIGHT
                    </th>

                    <th>
                        RATE
                    </th>

                    <th>
                        AMOUNT
                        <br>
                        ₹
                    </th>

                </tr>

            </thead>


            <tbody>

                <tr class="print-main-data-row">

                    <td>
                        1
                    </td>


                    <td>
                        ${escapeHtml(cNoteNo)}
                    </td>


                    <td>
                        ${escapeHtml(bookingDate)}
                    </td>


                    <td>
                        ${escapeHtml(from)}
                    </td>


                    <td>
                        ${escapeHtml(to)}
                    </td>


                    <td>

                        <div class="print-party-content">

                            <div>
                                ${escapeHtml(consignor)}
                            </div>

                            <div class="print-goods-content">

                                ${escapeHtml(consignee)}

                                <br><br>

                                ${escapeHtml(goods)}

                            </div>

                        </div>

                    </td>


                    <td>
                        ${escapeHtml(packageDisplay)}
                    </td>


                    <td>
                        ${weight.toFixed(2)}
                    </td>


                    <td>
                        ${money(rate)}
                    </td>


                    <td class="print-amount-cell">

                        ${printCharge(
        "",
        bill.freight,
        "freight"
    )}

                        ${printCharge(
        "ST CHARGE",
        bill.stCharge,
        "st-charge"
    )}

                        ${bill.labour > 0
            ? printCharge(
                "LABOUR",
                bill.labour
            )
            : ""
        }

                        ${bill.delivery > 0
            ? printCharge(
                "DELIVERY",
                bill.delivery
            )
            : ""
        }

                    </td>

                </tr>


                <!-- TOTAL -->

                <tr class="print-total-row">

                    <td
                        colspan="6"
                        class="print-total-label"
                    >
                        TOTAL =&gt;
                    </td>


                    <td class="print-total-number">
                        ${packageCount}
                    </td>


                    <td class="print-total-number">
                        ${weight.toFixed(2)}
                    </td>


                    <td>
                    </td>


                    <td class="print-total-amount">
                        ${money(bill.total)}
                    </td>

                </tr>

            </tbody>

        </table>


        <!-- =========================
             AMOUNT IN WORDS / TAX
        ========================== -->

        <div class="print-summary">

            <div class="print-words">

                RUPEES
                ${escapeHtml(
            numberToWords(bill.total)
        )}
                ONLY

            </div>


            <div class="print-tax">

                <div class="print-tax-row">

                    <span>
                        CGST @ 0.00
                    </span>

                    <span>
                        0.00
                    </span>

                </div>


                <div class="print-tax-row">

                    <span>
                        SGST @ 0.00
                    </span>

                    <span>
                        0.00
                    </span>

                </div>


                <div class="print-tax-row">

                    <span>
                        IGST @ 0.00
                    </span>

                    <span>
                        0.00
                    </span>

                </div>


                <div class="print-tax-row">

                    <span>
                        AMOUNT
                    </span>

                    <span>
                        ${money(bill.total)}
                    </span>

                </div>

            </div>

        </div>


        <!-- =========================
             BANK / QR / SIGNATORY
        ========================== -->

        <div class="print-bottom">

            <div class="print-bank">

                <div class="print-bank-title">
                    BANK DETAILS:-
                </div>

                <div>
                    A/C NO. :- 83530200001638
                </div>

                <div>
                    IFSC CODE :-BARB0VJCHAV
                </div>

                <div>
                    BANK NAME :-Bank of Baroda
                </div>

                <div>
                    BRANCH :- C.R Avenue
                </div>

                <div>
                    GST IS PAYABLE AT REVERSE
                    CHARGE MECHANISM
                </div>

            </div>


            <div class="qr-box">

                <img

                >

                <div class="qr-title">
                    SCAN &amp; PAY
                </div>

            </div>


            <div class="print-signatory">

                For
                <strong>
                    COUNTRYWIDE LOGISTICS
                </strong>

                <div class="print-signature">
                    Authorised Signatory
                </div>

            </div>

        </div>


        <!-- =========================
             NOTE
        ========================== -->

        <div class="print-note">

            Note :- Please Make Payment
            Cash/Bank/UPI Only.

        </div>

    `;
}


/* =========================================================
   PRINT CHARGE
========================================================= */

function printCharge(
    label,
    amount,
    className = ""
) {

    return `

        <div
            class="print-charge ${className}"
        >

            <span class="print-charge-name">

                ${escapeHtml(
        label
    )}

            </span>


            <span class="print-charge-value">

                ${money(
        amount
    )}

            </span>

        </div>

    `;
}


/* =========================================================
   PARTY AUTOCOMPLETE
========================================================= */

function initializePartySuggestions() {

    const input =
        document.getElementById(
            "tracker-party"
        );


    const suggestions =
        document.getElementById(
            "tracker-suggestions"
        );


    input.addEventListener(
        "input",
        () => {

            const value =
                input.value
                    .trim()
                    .toLowerCase();


            suggestions.innerHTML =
                "";


            if (!value) {

                suggestions.classList.remove(
                    "show"
                );

                return;
            }

            const parties =
                [
                    ...new Set(
                        allShipments
                            .flatMap(
                                shipment => [
                                    String(
                                        shipment.consignor ||
                                        ""
                                    ).trim(),

                                    String(
                                        shipment.consignee ||
                                        ""
                                    ).trim()
                                ]
                            )
                            .filter(Boolean)
                    )
                ]
                    .filter(
                        party =>
                            party
                                .toLowerCase()
                                .includes(value)
                    )
                    .slice(
                        0,
                        8
                    );


            if (!parties.length) {

                suggestions.classList.remove(
                    "show"
                );

                return;
            }


            parties.forEach(
                party => {

                    const button =
                        document.createElement(
                            "button"
                        );


                    button.type =
                        "button";


                    button.className =
                        "suggestion-item";


                    button.textContent =
                        party;


                    button.addEventListener(
                        "click",
                        () => {

                            input.value =
                                party;


                            suggestions.classList.remove(
                                "show"
                            );

                        }
                    );


                    suggestions.appendChild(
                        button
                    );

                }
            );


            suggestions.classList.add(
                "show"
            );

        }
    );


    document.addEventListener(
        "click",
        event => {

            if (
                !input.contains(
                    event.target
                ) &&
                !suggestions.contains(
                    event.target
                )
            ) {

                suggestions.classList.remove(
                    "show"
                );

            }

        }
    );
}


/* =========================================================
   FREIGHT DETAIL
========================================================= */

function freightDetail(
    label,
    value
) {

    return `

        <div class="freight-detail-item">

            <span class="freight-detail-label">

                ${escapeHtml(
        label
    )}

            </span>


            <span class="freight-detail-value">

                ${escapeHtml(
        value ?? "-"
    )}

            </span>

        </div>

    `;
}


/* =========================================================
   FREIGHT CHARGE
========================================================= */

function freightCharge(
    label,
    amount
) {

    return `

        <div class="freight-charge-row">

            <span>

                ${escapeHtml(
        label
    )}

            </span>


            <strong>

                ${money(
        amount
    )}

            </strong>

        </div>

    `;
}


/* =========================================================
   DETAIL
========================================================= */

function detail(
    label,
    value
) {

    return `

        <div class="detail-item">

            <span class="detail-label">

                ${escapeHtml(
        label
    )}

            </span>


            <span class="detail-value">

                ${escapeHtml(
        value ?? "-"
    )}

            </span>

        </div>

    `;
}


/* =========================================================
   PARTY TOTAL
========================================================= */

function partyTotal(
    label,
    amount
) {

    return `

        <div class="party-total-item">

            <span>

                ${escapeHtml(
        label
    )}

            </span>


            <strong>

                ${money(
        amount
    )}

            </strong>

        </div>

    `;
}


/* =========================================================
   WEIGHT
========================================================= */

function getWeight(
    shipment
) {

    const weight =
        shipment.chargeableWeight ??
        shipment.actualWeight ??
        0;


    return `${Number(
        weight
    ).toFixed(2)} KG`;
}


/* =========================================================
   SHIPMENT DATE
========================================================= */

function getShipmentDate(
    shipment
) {

    const value =
        shipment.bookingDate ||
        shipment.createdAt ||
        "";


    if (!value) {
        return "";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    return [

        date.getFullYear(),

        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        ),

        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        )

    ].join("-");
}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(
    value
) {

    if (!value) {
        return "-";
    }


    const parts =
        String(value).split("-");


    if (
        parts.length === 3
    ) {

        return `${parts[2]}/${parts[1]}/${parts[0]}`;

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);

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


/* =========================================================
   MONEY
========================================================= */

function money(
    value
) {

    return `₹ ${Number(
        value || 0
    ).toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    )}`;
}


/* =========================================================
   NUMBER TO WORDS
========================================================= */

function numberToWords(
    amount
) {

    amount =
        Math.round(
            Number(
                amount || 0
            )
        );


    if (amount === 0) {

        return "ZERO RUPEES";

    }


    const ones = [

        "",

        "ONE",

        "TWO",

        "THREE",

        "FOUR",

        "FIVE",

        "SIX",

        "SEVEN",

        "EIGHT",

        "NINE",

        "TEN",

        "ELEVEN",

        "TWELVE",

        "THIRTEEN",

        "FOURTEEN",

        "FIFTEEN",

        "SIXTEEN",

        "SEVENTEEN",

        "EIGHTEEN",

        "NINETEEN"

    ];


    const tens = [

        "",

        "",

        "TWENTY",

        "THIRTY",

        "FORTY",

        "FIFTY",

        "SIXTY",

        "SEVENTY",

        "EIGHTY",

        "NINETY"

    ];


    function twoDigits(
        number
    ) {

        if (
            number < 20
        ) {

            return ones[
                number
            ];

        }


        return (

            tens[
            Math.floor(
                number / 10
            )
            ]

            +

            (
                number % 10

                    ? " " +
                    ones[
                    number % 10
                    ]

                    : ""
            )

        );

    }


    function convert(
        number
    ) {

        let words = "";


        if (
            number >= 10000000
        ) {

            words +=

                convert(
                    Math.floor(
                        number /
                        10000000
                    )
                )

                +

                " CRORE ";

            number %=
                10000000;

        }


        if (
            number >= 100000
        ) {

            words +=

                convert(
                    Math.floor(
                        number /
                        100000
                    )
                )

                +

                " LAKH ";

            number %=
                100000;

        }


        if (
            number >= 1000
        ) {

            words +=

                convert(
                    Math.floor(
                        number /
                        1000
                    )
                )

                +

                " THOUSAND ";

            number %=
                1000;

        }


        if (
            number >= 100
        ) {

            words +=

                convert(
                    Math.floor(
                        number /
                        100
                    )
                )

                +

                " HUNDRED ";

            number %=
                100;

        }


        if (
            number > 0
        ) {

            words +=
                twoDigits(
                    number
                );

        }


        return words.trim();

    }


    return (
        convert(amount) +
        " RUPEES"
    );
}


/* =========================================================
   DATE VALIDATION
========================================================= */

function validateDates(
    from,
    to
) {

    if (
        !from ||
        !to
    ) {

        return false;

    }


    return from <= to;
}


/* =========================================================
   ERROR
========================================================= */

function showError(
    element,
    message
) {

    element.innerHTML = `

        <div class="error-message">

            ${escapeHtml(
        message
    )}

        </div>

    `;
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );
}