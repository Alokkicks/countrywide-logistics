const token = localStorage.getItem("token");

if (!token) {
    window.location.replace("login.html");
}

window.addEventListener("pageshow", function () {
    if (!localStorage.getItem("token")) {
        window.location.replace("login.html");
    }
});






document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const form = document.getElementById("new-shipment-form");

    const goodsSearch = document.getElementById("goods-search");
    const goodsSearchResults = document.getElementById("goods-search-results");

    const createShipmentBtn = document.getElementById("create-shipment-btn");

    let isSubmitting = false;
    const consignorInput =
        document.getElementById("consignor");

    const consigneeInput =
        document.getElementById("consignee");

    /* =====================================================
   CURRENT DATE & TIME
===================================================== */

    const currentDate = document.getElementById("current-date");
    const currentTime = document.getElementById("current-time");

    function updateDateTime() {

        const now = new Date();

        const dateOptions = {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric"
        };

        const date = now.toLocaleDateString("en-IN", dateOptions);

        const time = now.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });

        currentDate.textContent = date;
        currentTime.textContent = time;
    }

    updateDateTime();

    /* Update the time every minute */
    setInterval(updateDateTime, 60000);



    /* =====================================================
        GOODS SEARCH FROM MONGODB
    ===================================================== */

    if (goodsSearch && goodsSearchResults) {

        async function showGoodsResults(searchText = "") {

            const searchValue =
                searchText.trim();

            goodsSearchResults.innerHTML = "";


            try {

                const response = await fetch(
                    `https://countrywide-logistics.onrender.com/api/master-data?type=goods&search=${encodeURIComponent(searchValue)}`
                );

                const data = await response.json();


                if (!data.success) {
                    return;
                }


                if (data.data.length === 0) {

                    const noResult =
                        document.createElement("div");

                    noResult.className =
                        "goods-search-result no-results";

                    noResult.textContent =
                        "No goods found";

                    goodsSearchResults.appendChild(
                        noResult
                    );

                } else {

                    data.data.forEach((item) => {

                        const result =
                            document.createElement("div");

                        result.className =
                            "goods-search-result";

                        result.textContent =
                            item.name;


                        result.addEventListener("click", () => {

                            goodsSearch.value =
                                item.name;

                            clearFieldError(goodsSearch);

                            goodsSearchResults.classList.remove(
                                "show"
                            );

                        });


                        goodsSearchResults.appendChild(
                            result
                        );

                    });

                }


                goodsSearchResults.classList.add("show");


            } catch (error) {

                console.error(
                    "Goods search error:",
                    error
                );

            }

        }


        goodsSearch.addEventListener("focus", () => {

            showGoodsResults(goodsSearch.value);

        });


        goodsSearch.addEventListener("input", () => {

            clearFieldError(goodsSearch);

            showGoodsResults(goodsSearch.value);

        });


        document.addEventListener("click", (event) => {

            if (!event.target.closest(".goods-search-wrapper")) {

                goodsSearchResults.classList.remove(
                    "show"
                );

            }

        });

    }

    /* =====================================================
     CONSIGNOR AUTOCOMPLETE
    ===================================================== */

    if (consignorInput) {

        let consignorResultsBox =
            document.getElementById("consignor-search-results");


        /* Create suggestion box if it doesn't exist */

        if (!consignorResultsBox) {

            consignorResultsBox =
                document.createElement("div");

            consignorResultsBox.id =
                "consignor-search-results";

            consignorResultsBox.className =
                "master-search-results";

            consignorInput.parentElement.appendChild(
                consignorResultsBox
            );
        }


        /* Search MongoDB */

        consignorInput.addEventListener("input", async () => {

            const searchValue =
                consignorInput.value.trim();


            consignorResultsBox.innerHTML = "";


            /* Don't search for empty text */

            if (searchValue === "") {
                return;
            }


            try {

                const response = await fetch(
                    `https://countrywide-logistics.onrender.com/api/master-data?type=consignor&search=${encodeURIComponent(searchValue)}`
                );


                const data = await response.json();


                if (!data.success) {
                    return;
                }


                data.data.forEach((item) => {

                    const suggestion =
                        document.createElement("div");

                    suggestion.className =
                        "master-search-result";

                    suggestion.textContent =
                        item.name;


                    suggestion.addEventListener("click", () => {

                        consignorInput.value =
                            item.name;

                        consignorResultsBox.innerHTML = "";

                    });


                    consignorResultsBox.appendChild(
                        suggestion
                    );

                });

            } catch (error) {

                console.error(
                    "Consignor search error:",
                    error
                );

            }

        });


        /* Hide suggestions when clicking elsewhere */

        document.addEventListener("click", (event) => {

            if (
                !consignorInput.contains(event.target) &&
                !consignorResultsBox.contains(event.target)
            ) {

                consignorResultsBox.innerHTML = "";

            }

        });

    }

    /* =====================================================
        CONSIGNEE AUTOCOMPLETE
    ===================================================== */

    if (consigneeInput) {

        let consigneeResultsBox =
            document.getElementById("consignee-search-results");


        /* Create suggestion box if it doesn't exist */

        if (!consigneeResultsBox) {

            consigneeResultsBox =
                document.createElement("div");

            consigneeResultsBox.id =
                "consignee-search-results";

            consigneeResultsBox.className =
                "master-search-results";

            consigneeInput.parentElement.appendChild(
                consigneeResultsBox
            );
        }


        /* Search MongoDB */

        consigneeInput.addEventListener("input", async () => {

            const searchValue =
                consigneeInput.value.trim();


            consigneeResultsBox.innerHTML = "";


            /* Don't search for empty text */

            if (searchValue === "") {
                return;
            }


            try {

                const response = await fetch(
                    `https://countrywide-logistics.onrender.com/api/master-data?type=consignee&search=${encodeURIComponent(searchValue)}`
                );


                const data = await response.json();


                if (!data.success) {
                    return;
                }


                data.data.forEach((item) => {

                    const suggestion =
                        document.createElement("div");

                    suggestion.className =
                        "master-search-result";

                    suggestion.textContent =
                        item.name;


                    suggestion.addEventListener("click", () => {

                        consigneeInput.value =
                            item.name;

                        consigneeResultsBox.innerHTML = "";

                    });


                    consigneeResultsBox.appendChild(
                        suggestion
                    );

                });

            } catch (error) {

                console.error(
                    "Consignee search error:",
                    error
                );

            }

        });


        /* Hide suggestions when clicking elsewhere */

        document.addEventListener("click", (event) => {

            if (
                !consigneeInput.contains(event.target) &&
                !consigneeResultsBox.contains(event.target)
            ) {

                consigneeResultsBox.innerHTML = "";

            }

        });

    }


    /* =====================================================
       VALIDATION
    ===================================================== */

    function showFieldError(field) {

        field.classList.add("error");
    }


    function clearFieldError(field) {

        field.classList.remove("error");
    }


    function validateField(id) {

        const field = document.getElementById(id);

        if (!field) {
            return true;
        }

        const value = field.value.trim();

        if (value === "") {

            showFieldError(field);

            return false;
        }

        clearFieldError(field);

        return true;
    }


    /* =====================================================
       CLEAR ERROR WHEN EMPLOYEE STARTS TYPING
    ===================================================== */

    const fieldsToWatch = [
        "c-note-no",
        "invoice-sequence",
        "consignor",
        "consignee",
        "consignor-gstin",
        "consignee-gstin",
        "cnote-type",
        "billing-party",
        "booking-date",
        "booking-branch",
        "booking-from",
        "destination",
        "goods-search",
        "actual-weight",
        "package-count",
        "package-type",
        "freight-rate"

    ];

    fieldsToWatch.forEach(id => {

        const field = document.getElementById(id);

        if (!field) {
            return;
        }

        field.addEventListener("input", () => {
            clearFieldError(field);
        });

        field.addEventListener("change", () => {
            clearFieldError(field);
        });

    });
    /* =====================================================
       CREATE SHIPMENT BUTTON
    ===================================================== */

    if (createShipmentBtn) {

        createShipmentBtn.addEventListener("click", async () => {

            form.requestSubmit();

        });

    }


    /* =====================================================
   WEIGHT & FREIGHT CALCULATION
===================================================== */

    const actualWeight = document.getElementById("actual-weight");
    const chargeableWeight = document.getElementById("chargeable-weight");

    const freightRate = document.getElementById("freight-rate");
    const freightAmountDisplay = document.getElementById("freight-amount-display");

    const summaryFreight = document.getElementById("summary-freight");


    function calculateFreight() {

        const weight = Number(actualWeight.value) || 0;
        const rate = Number(freightRate.value) || 0;

        /* Chargeable weight = actual weight for now */
        chargeableWeight.value = weight > 0
            ? weight.toFixed(2)
            : "";

        /* Freight = weight × rate */
        const freightAmount = weight * rate;


        /* Show freight amount below the charge fields */

        if (freightAmountDisplay) {
            freightAmountDisplay.textContent =
                `₹ ${freightAmount.toFixed(2)}`;
        }


        /* Update Bill Summary */

        if (summaryFreight) {
            summaryFreight.textContent =
                `₹ ${freightAmount.toFixed(2)}`;
        }
    }


    /* Recalculate when weight changes */

    if (actualWeight) {
        actualWeight.addEventListener("input", calculateFreight);
    }


    /* Recalculate when freight rate changes */

    if (freightRate) {
        freightRate.addEventListener("input", calculateFreight);
    }


    /* Calculate once when page loads */

    calculateFreight();


    /* =====================================================
    BILL SUMMARY CALCULATION
 ===================================================== */



    const stCharge = document.getElementById("st-charge");
    const deliveryCharge = document.getElementById("delivery-charge");
    const labourCharge = document.getElementById("labour-charge");
    const otherCharges = document.getElementById("other-charges");
    const adjustment = document.getElementById("adjustment");


    const summaryST = document.getElementById("summary-st");
    const summaryDelivery = document.getElementById("summary-delivery");
    const summaryLabour = document.getElementById("summary-labour");
    const summaryOther = document.getElementById("summary-other");
    const summaryAdjustment = document.getElementById("summary-adjustment");

    const totalAmount = document.getElementById("total-amount");


    function getAmount(field) {
        return field ? Number(field.value) || 0 : 0;
    }


    function calculateBill() {

        /* Freight = Weight × Rate */

        const weight = getAmount(actualWeight);
        const rate = getAmount(freightRate);

        const freight = weight * rate;


        /* Other charges */

        const st = getAmount(stCharge);
        const delivery = getAmount(deliveryCharge);
        const labour = getAmount(labourCharge);
        const other = getAmount(otherCharges);
        const adjustmentValue = getAmount(adjustment);


        /* Final total */

        const total =
            freight +
            st +
            delivery +
            labour +
            other +
            adjustmentValue;


        /* Update summary */

        if (summaryFreight) {
            summaryFreight.textContent = `₹ ${freight.toFixed(2)}`;
        }

        if (summaryST) {
            summaryST.textContent = `₹ ${st.toFixed(2)}`;
        }

        if (summaryDelivery) {
            summaryDelivery.textContent = `₹ ${delivery.toFixed(2)}`;
        }

        if (summaryLabour) {
            summaryLabour.textContent = `₹ ${labour.toFixed(2)}`;
        }

        if (summaryOther) {
            summaryOther.textContent = `₹ ${other.toFixed(2)}`;
        }

        if (summaryAdjustment) {
            summaryAdjustment.textContent =
                `₹ ${adjustmentValue.toFixed(2)}`;
        }

        /* Update TOTAL */

        if (totalAmount) {
            totalAmount.textContent = `₹ ${total.toFixed(2)}`;
        }
    }


    /* =====================================================
       RECALCULATE WHEN CHARGES CHANGE
    ===================================================== */

    const billFields = [
        actualWeight,
        freightRate,
        stCharge,
        deliveryCharge,
        labourCharge,
        otherCharges,
        adjustment
    ];

    billFields.forEach(field => {

        if (!field) {
            return;
        }

        field.addEventListener("input", calculateBill);
        field.addEventListener("change", calculateBill);

    });


    /* Initial calculation */

    calculateBill();

    /* =====================================================
   CREATE SHIPMENT
===================================================== */

    if (form) {

        form.addEventListener("submit", async (event) => {

            event.preventDefault();

            /* Prevent duplicate submissions */

            if (isSubmitting) {
                return;
            }

            isSubmitting = true;


            /* Disable Create Shipment button */

            if (createShipmentBtn) {

                createShipmentBtn.disabled = true;

                createShipmentBtn.style.opacity = "0.7";

                createShipmentBtn.style.cursor = "not-allowed";

            }

            /* -----------------------------
               VALIDATE FORM
            ----------------------------- */

            let formIsValid = true;
            const requiredFields = [
                "c-note-no",
                "invoice-no",
                "consignor",
                "consignee",
                "consignor-gstin",
                "consignee-gstin",
                "cnote-type",
                "billing-party",
                "booking-date",
                "booking-branch",
                "booking-from",
                "destination",
                "goods-search",
                "actual-weight",
                "package-count",
                "package-type",
                "freight-rate"
            ];

            requiredFields.forEach(id => {

                const field = document.getElementById(id);

                if (!field || field.value.trim() === "") {

                    if (field) {
                        field.classList.add("error");
                    }

                    formIsValid = false;
                }
                else {

                    field.classList.remove("error");

                }

            });


            /* Stop if validation fails */
            if (!formIsValid) {

                alert("Please fill all required fields.");

                isSubmitting = false;

                if (createShipmentBtn) {

                    createShipmentBtn.disabled = false;

                    createShipmentBtn.style.opacity = "1";

                    createShipmentBtn.style.cursor = "pointer";

                }

                return;
            }


            /* -----------------------------
               GET FORM VALUES
            ----------------------------- */
            const cNoteNo =
                document.getElementById("c-note-no").value.trim();



            const shipment = {

                /* ==============================
                   C NOTE / TRACKING
                ============================== */

                cNoteNo: cNoteNo,

                /*
                   Temporary compatibility:
                   existing tracking/payment/status
                   systems still use trackingId.
                */

                trackingId: cNoteNo,


                /* ==============================
                   BASIC INFORMATION
                ============================== */

                bookingFrom:
                    document.getElementById("booking-from").value.trim(),

                bookingDate:
                    document.getElementById("booking-date").value,

                bookingBranch:
                    document.getElementById("booking-branch").value,

                destination:
                    document.getElementById("destination").value,


                /* ==============================
                   CUSTOMER INFORMATION
                ============================== */

                consignor:
                    document.getElementById("consignor").value.trim(),

                consignorGSTIN:
                    document
                        .getElementById("consignor-gstin")
                        .value
                        .trim(),

                consignee:
                    document.getElementById("consignee").value.trim(),

                consigneeGSTIN:
                    document
                        .getElementById("consignee-gstin")
                        .value
                        .trim(),

                cNoteType:
                    document.getElementById("cnote-type").value,

                billingParty:
                    document.getElementById("billing-party").value.trim(),


                /* ==============================
                   INVOICE
                ============================== */

                invoiceNo:
                    document
                        .getElementById("invoice-no")
                        .value
                        .trim(),


                /* ==============================
                   GOODS
                ============================== */

                goods:
                    document
                        .getElementById("goods-search")
                        .value
                        .trim(),

                goodsDescription:
                    document
                        .getElementById("goods-description")
                        .value
                        .trim(),


                /* ==============================
                   WEIGHTS
                ============================== */

                actualWeight:
                    Number(
                        document
                            .getElementById("actual-weight")
                            .value
                    ),

                chargeableWeight:
                    Number(
                        document
                            .getElementById("chargeable-weight")
                            .value
                    ) || 0,


                /* ==============================
                   PACKAGES
                ============================== */

                packageCount:
                    Number(
                        document
                            .getElementById("package-count")
                            .value
                    ),

                packageType:
                    document
                        .getElementById("package-type")
                        .value,

                packageMode:
                    document
                        .getElementById("package-mode")
                        .value,


                /* ==============================
                   BILLING / CHARGES
                ============================== */

                freightRate:
                    Number(
                        document
                            .getElementById("freight-rate")
                            .value
                    ),

                stCharge:
                    Number(
                        document
                            .getElementById("st-charge")
                            .value
                    ) || 0,

                deliveryCharge:
                    Number(
                        document
                            .getElementById("delivery-charge")
                            .value
                    ) || 0,

                labourCharge:
                    Number(
                        document
                            .getElementById("labour-charge")
                            .value
                    ) || 0,

                otherCharges:
                    Number(
                        document
                            .getElementById("other-charges")
                            .value
                    ) || 0,

                adjustment:
                    Number(
                        document
                            .getElementById("adjustment")
                            .value
                    ) || 0,


                /* ==============================
                   TOTAL
                ============================== */

                totalAmount:
                    Number(
                        document
                            .getElementById("total-amount")
                            .textContent
                            .replace(/[₹,\s]/g, "")
                    ) || 0

            };

            /* -----------------------------
               TEST OUTPUT
            ----------------------------- */

            console.log("Shipment Created:");
            console.log(shipment);






            /* =====================================================
             SEND SHIPMENT TO BACKEND
            ===================================================== */

            try {

                const response = await fetch(
                    "https://countrywide-logistics.onrender.com/api/shipments",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${localStorage.getItem("token")}`
                        },

                        body: JSON.stringify(shipment)
                    }
                );


                const data = await response.json();


                /* Backend returned an error */

                if (!response.ok) {

                    console.error("Server error:", data);

                    alert(
                        data.message ||
                        "Could not create shipment."
                    );

                    return;
                }


                /* Shipment successfully saved */

                console.log("Shipment saved to MongoDB:");
                console.log(data);


                /* =====================================================
                   SAVE CONSIGNOR / CONSIGNEE / GOODS TO MASTER DATA
                ===================================================== */

                const masterDataItems = [
                    {
                        type: "consignor",
                        name: shipment.consignor
                    },
                    {
                        type: "consignee",
                        name: shipment.consignee
                    },
                    {
                        type: "goods",
                        name: shipment.goods
                    }
                ];


                for (const item of masterDataItems) {

                    if (!item.name || !item.name.trim()) {
                        continue;
                    }


                    try {

                        const masterResponse = await fetch(
                            "https://countrywide-logistics.onrender.com/api/master-data",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type": "application/json"
                                },

                                body: JSON.stringify({
                                    type: item.type,
                                    name: item.name.trim()
                                })
                            }
                        );


                        const masterResult =
                            await masterResponse.json();


                        console.log(
                            "Master data result:",
                            masterResult
                        );


                    } catch (masterError) {

                        console.error(
                            `Could not save ${item.type}:`,
                            masterError
                        );

                    }

                }


                alert("Shipment created successfully!");
            } catch (error) {

                console.error("Backend connection error:", error);

                alert(
                    "Could not connect to the backend server."
                );

            }

        });

    }

});