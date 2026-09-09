document.addEventListener("DOMContentLoaded", function() {



    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");

    const backToTop = document.getElementById("backToTop");

    const tocLinks = document.querySelectorAll(".toc-link");
    const sections = document.querySelectorAll(".terms-section");

    const topSearchForm = document.getElementById("topSearchForm");
    const topSearch = document.getElementById("topSearch");


    /* =========================
       MOBILE SIDEBAR
    ========================= */

    if (menuToggle && sidebar) {

        menuToggle.addEventListener("click", function() {
            sidebar.classList.toggle("open");
        });

    }


    /* Close sidebar when clicking outside */

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

    const sidebarLinks = document.querySelectorAll(".sidebar-link, .logout-link");

    sidebarLinks.forEach(function(link) {

        link.addEventListener("click", function() {

            if (window.innerWidth <= 800 && sidebar) {
                sidebar.classList.remove("open");
            }

        });

    });


    /* =========================
       ACTIVE TERMS SECTION
    ========================= */

    function updateActiveSection() {

        let currentSection = "";

        sections.forEach(function(section) {

            const sectionTop = section.getBoundingClientRect().top;

            if (sectionTop <= 160) {
                currentSection = section.id;
            }

        });


        if (currentSection) {

            tocLinks.forEach(function(link) {

                link.classList.remove("active");

                const href = link.getAttribute("href");

                if (href === "#" + currentSection) {
                    link.classList.add("active");
                }

            });

        }

    }


    window.addEventListener("scroll", updateActiveSection);


    /* =========================
       TOC SMOOTH SCROLL
    ========================= */

    tocLinks.forEach(function(link) {

        link.addEventListener("click", function(event) {

            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") {
                return;
            }

            const target = document.querySelector(targetId);

            if (!target) {
                return;
            }

            event.preventDefault();

            const offset = 100;

            const targetPosition =
                target.getBoundingClientRect().top +
                window.scrollY -
                offset;

            window.scrollTo({
                top: targetPosition,
                behavior: "smooth"
            });

            tocLinks.forEach(function(item) {
                item.classList.remove("active");
            });

            link.classList.add("active");

        });

    });


    /* =========================
       BACK TO TOP
    ========================= */

    function updateBackToTop() {

        if (!backToTop) {
            return;
        }

        if (window.scrollY > 500) {
            backToTop.classList.add("show");
        } else {
            backToTop.classList.remove("show");
        }

    }


    window.addEventListener("scroll", updateBackToTop);


    if (backToTop) {

        backToTop.addEventListener("click", function() {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        });

    }


    /* =========================
       TOP SEARCH
    ========================= */

    if (topSearchForm && topSearch) {

        topSearchForm.addEventListener("submit", function(event) {

            const value = topSearch.value.trim();

            if (!value) {
                event.preventDefault();
                topSearch.focus();
            }

        });

    }


    /* =========================
       ESCAPE KEY
    ========================= */

    document.addEventListener("keydown", function(event) {

        if (event.key === "Escape") {

            if (sidebar) {
                sidebar.classList.remove("open");
            }

        }

    });


    /* =========================
       INITIALIZE
    ========================= */

    updateActiveSection();
    updateBackToTop();



});