document.addEventListener("DOMContentLoaded", function() {


    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");

    if (menuToggle && sidebar) {

        menuToggle.addEventListener("click", function() {
            sidebar.classList.toggle("open");
        });

    }

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