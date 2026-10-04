document.addEventListener("DOMContentLoaded", () => {

    const quoteForm = document.querySelector(".contact-form");

    if (!quoteForm) {
        return;
    }

    quoteForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const fullName =
            document.getElementById("name").value.trim();

        const businessName =
            document.getElementById("business-name").value.trim();

        const email =
            document.getElementById("Email").value.trim();

        const mobile =
            document.getElementById("mobile-no.").value.trim();

        const goodsType =
            document.getElementById("goods-type").value.trim();

        const weight =
            Number(document.getElementById("weight").value);

        const moreInfo =
            document.getElementById("more-info").value.trim();

        if (
            !fullName ||
            !email ||
            !mobile ||
            !goodsType ||
            !weight
        ) {
            alert("Please fill all required fields.");
            return;
        }

        try {

            const response = await fetch(
                "http://https://countrywide-logistics.onrender.com/api/quotes/api/quotes",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name:fullName,
                        businessName,
                        email,
                        mobile,
                        goodsType,
                        weight,
                        moreInfo
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to submit quote."
                );
            }

            alert(
                "Quote enquiry submitted successfully. Our team will contact you shortly."
            );

            quoteForm.reset();

        } catch (error) {

            console.error("Quote submission error:", error);

            alert(
                "Unable to submit your enquiry. Please try again."
            );
        }

    });

});