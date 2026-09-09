document.addEventListener("DOMContentLoaded", () => {


    const sidebar = document.getElementById("sidebar");
    const menuToggle = document.getElementById("menuToggle");

    /*
    ==========================================
    MOBILE SIDEBAR
    ==========================================
    */

    if (menuToggle && sidebar) {

        menuToggle.addEventListener("click", () => {
            sidebar.classList.toggle("open");
        });

    }


    /*
    ==========================================
    CLOSE SIDEBAR WHEN LINK IS CLICKED
    ON MOBILE
    ==========================================
    */

    const navLinks = document.querySelectorAll(".nav-item");

    navLinks.forEach(link => {

        link.addEventListener("click", () => {

            if (window.innerWidth <= 800) {
                sidebar.classList.remove("open");
            }

        });

    });


    /*
    ==========================================
    CLOSE SIDEBAR WHEN CLICKING OUTSIDE
    ==========================================
    */

    document.addEventListener("click", (event) => {

        if (
            window.innerWidth <= 800 &&
            sidebar.classList.contains("open") &&
            !sidebar.contains(event.target) &&
            !menuToggle.contains(event.target)
        ) {

            sidebar.classList.remove("open");

        }

    });


    /*
    ==========================================
    ACTIVE SIDEBAR LINK
    ==========================================
    */

    const currentPath = window.location.pathname;

    navLinks.forEach(link => {

        const href = link.getAttribute("href");

        if (
            href &&
            href !== "/logout" &&
            currentPath === href
        ) {

            navLinks.forEach(item => item.classList.remove("active"));

            link.classList.add("active");

        }

    });


    /*
    ==========================================
    PROFILE CLICK
    ==========================================
    */

    const profile = document.querySelector(".admin-profile");

    if (profile) {

        profile.addEventListener("click", () => {

            console.log("Admin profile clicked");

        });

    }


    /*
    ==========================================
    NOTIFICATION BUTTON
    ==========================================
    */

    const notificationButton =
        document.querySelector(".icon-button");

    if (notificationButton) {

        notificationButton.addEventListener("click", () => {

            alert("You have 3 new notifications.");

        });

    }


    /*
    ==========================================
    PERIOD SELECT
    ==========================================
    */

    const periodSelect =
        document.querySelector(".period-select");

    if (periodSelect) {

        periodSelect.addEventListener("change", () => {

            console.log(
                "Selected period:",
                periodSelect.value
            );

        });

    }


});