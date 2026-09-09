document.addEventListener("DOMContentLoaded", function() {


    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");

    const video = document.getElementById("courseVideo");
    const fullscreenBtn = document.getElementById("fullscreenBtn");


    /* =========================
       MOBILE SIDEBAR
    ========================= */

    if (menuToggle && sidebar) {

        menuToggle.addEventListener("click", function() {

            sidebar.classList.toggle("open");

        });

    }


    /* =========================
       CLOSE SIDEBAR OUTSIDE
    ========================= */

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


    /* =========================
       CLOSE SIDEBAR AFTER LINK
    ========================= */

    const sidebarLinks =
        document.querySelectorAll(".sidebar-link, .logout-link");

    sidebarLinks.forEach(function(link) {

        link.addEventListener("click", function() {

            if (window.innerWidth <= 800 && sidebar) {

                sidebar.classList.remove("open");

            }

        });

    });


    /* =========================
       FULLSCREEN VIDEO
    ========================= */

    if (fullscreenBtn && video) {

        fullscreenBtn.addEventListener("click", function() {

            if (video.requestFullscreen) {

                video.requestFullscreen();

            } else if (video.webkitRequestFullscreen) {

                video.webkitRequestFullscreen();

            } else if (video.msRequestFullscreen) {

                video.msRequestFullscreen();

            }

        });

    }


    /* =========================
       UPDATE FULLSCREEN BUTTON
    ========================= */

    document.addEventListener(
        "fullscreenchange",
        function() {

            if (!fullscreenBtn) {
                return;
            }

            if (document.fullscreenElement) {

                fullscreenBtn.textContent =
                    "✕ Exit Fullscreen";

            } else {

                fullscreenBtn.textContent =
                    "⛶ Fullscreen";

            }

        }
    );


    /* =========================
       ESCAPE KEY
    ========================= */

    document.addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Escape") {

                if (sidebar) {

                    sidebar.classList.remove("open");

                }

            }

        }
    );


    /* =========================
       VIDEO ERROR HANDLING
    ========================= */

    if (video) {

        video.addEventListener("error", function() {

            console.log(
                "The course video could not be loaded."
            );

        });

    }


    /* =========================
       PREVENT HORIZONTAL
       OVERFLOW AFTER RESIZE
    ========================= */

    window.addEventListener("resize", function() {

        if (
            window.innerWidth > 800 &&
            sidebar
        ) {

            sidebar.classList.remove("open");

        }

    });


});