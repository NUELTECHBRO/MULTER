document.addEventListener("DOMContentLoaded", function() {


    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");

    if (menuToggle && sidebar) {

        menuToggle.addEventListener("click", function() {
            sidebar.classList.toggle("open");
        });

    }


    const faqQuestions = document.querySelectorAll(".faq-question");

    faqQuestions.forEach(function(question) {

        question.addEventListener("click", function() {

            const faqItem = question.closest(".faq-item");
            const icon = question.querySelector("b");

            document.querySelectorAll(".faq-item").forEach(function(item) {

                if (item !== faqItem) {
                    item.classList.remove("open");

                    const otherIcon = item.querySelector(".faq-question b");

                    if (otherIcon) {
                        otherIcon.textContent = "+";
                    }
                }

            });


            faqItem.classList.toggle("open");

            if (faqItem.classList.contains("open")) {
                icon.textContent = "−";
            } else {
                icon.textContent = "+";
            }

        });

    });


    document.addEventListener("click", function(event) {

        if (!sidebar || !menuToggle) {
            return;
        }

        if (
            window.innerWidth <= 800 &&
            sidebar.classList.contains("open") &&
            !sidebar.contains(event.target) &&
            !menuToggle.contains(event.target)
        ) {
            sidebar.classList.remove("open");
        }

    });


    document.addEventListener("keydown", function(event) {

        if (event.key === "Escape") {

            if (sidebar) {
                sidebar.classList.remove("open");
            }

        }

    });


});