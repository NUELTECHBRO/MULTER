document.addEventListener("DOMContentLoaded", function() {


    /* =========================================
       MOBILE MENU
    ========================================= */

    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const mobileMenu = document.getElementById("mobileMenu");

    if (mobileMenuBtn && mobileMenu) {

        mobileMenuBtn.addEventListener("click", function() {

            mobileMenu.classList.toggle("active");

            if (mobileMenu.classList.contains("active")) {
                mobileMenuBtn.textContent = "✕";
                mobileMenuBtn.setAttribute("aria-expanded", "true");
            } else {
                mobileMenuBtn.textContent = "☰";
                mobileMenuBtn.setAttribute("aria-expanded", "false");
            }

        });

        const mobileLinks = mobileMenu.querySelectorAll("a");

        mobileLinks.forEach(function(link) {

            link.addEventListener("click", function() {

                mobileMenu.classList.remove("active");
                mobileMenuBtn.textContent = "☰";
                mobileMenuBtn.setAttribute("aria-expanded", "false");

            });

        });

    }


    /* =========================================
       SEARCH INPUTS
    ========================================= */

    const navbarSearch = document.querySelector(
        ".navbar-search input"
    );

    const mobileSearch = document.querySelector(
        ".mobile-search input"
    );

    const mainSearch = document.querySelector(
        ".main-search input"
    );


    /* =========================================
       COURSE CARDS
    ========================================= */

    const courseCards = document.querySelectorAll(
        ".course-card"
    );


    /* =========================================
       CURRENT CATEGORY
    ========================================= */

    let currentCategory = "all";


    /* =========================================
       GET SEARCH TEXT
    ========================================= */

    function getSearchText() {

        if (
            mainSearch &&
            mainSearch.value.trim() !== ""
        ) {
            return mainSearch.value.toLowerCase().trim();
        }

        if (
            navbarSearch &&
            navbarSearch.value.trim() !== ""
        ) {
            return navbarSearch.value.toLowerCase().trim();
        }

        if (
            mobileSearch &&
            mobileSearch.value.trim() !== ""
        ) {
            return mobileSearch.value.toLowerCase().trim();
        }

        return "";

    }


    /* =========================================
       FILTER COURSES
    ========================================= */

    function filterCourses() {

        const searchText = getSearchText();

        let visibleCourses = 0;


        courseCards.forEach(function(card) {

            const titleElement = card.querySelector("h3");
            const descriptionElement =
                card.querySelector(".course-description");
            const categoryElement =
                card.querySelector(".course-category");
            const levelElement =
                card.querySelector(".course-level");


            let title = "";
            let description = "";
            let category = "";
            let level = "";


            if (titleElement) {
                title = titleElement.textContent
                    .toLowerCase()
                    .trim();
            }


            if (descriptionElement) {
                description = descriptionElement.textContent
                    .toLowerCase()
                    .trim();
            }


            if (categoryElement) {
                category = categoryElement.textContent
                    .toLowerCase()
                    .trim();
            }


            if (levelElement) {
                level = levelElement.textContent
                    .toLowerCase()
                    .trim();
            }


            /*
             * Search through:
             * title
             * description
             * category
             * level
             */

            const searchableText =
                title +
                " " +
                description +
                " " +
                category +
                " " +
                level;


            /*
             * SEARCH MATCH
             */

            let matchesSearch = true;

            if (searchText !== "") {

                matchesSearch =
                    searchableText.includes(searchText);

            }


            /*
             * CATEGORY MATCH
             */

            let matchesCategory = true;

            if (currentCategory !== "all") {

                matchesCategory =
                    category === currentCategory;

            }


            /*
             * SHOW OR HIDE
             */

            if (
                matchesSearch &&
                matchesCategory
            ) {

                card.style.display = "";

                visibleCourses++;

            } else {

                card.style.display = "none";

            }

        });


        updateNoResultsMessage(visibleCourses);

    }


    /* =========================================
       NO RESULTS MESSAGE
    ========================================= */

    function updateNoResultsMessage(numberOfCourses) {

        const courseGrid =
            document.querySelector(".course-grid");

        if (!courseGrid) {
            return;
        }


        let message =
            document.getElementById("studentNoResults");


        if (!message) {

            message =
                document.createElement("div");

            message.id = "studentNoResults";

            message.style.textAlign = "center";
            message.style.padding = "50px 20px";
            message.style.width = "100%";
            message.style.gridColumn = "1 / -1";

            const icon =
                document.createElement("div");

            icon.textContent = "🔎";
            icon.style.fontSize = "45px";
            icon.style.marginBottom = "15px";


            const heading =
                document.createElement("h3");

            heading.textContent =
                "No courses found";


            const paragraph =
                document.createElement("p");

            paragraph.textContent =
                "Try another search or choose a different category.";


            message.appendChild(icon);
            message.appendChild(heading);
            message.appendChild(paragraph);

            courseGrid.appendChild(message);

        }


        if (numberOfCourses === 0) {

            message.style.display = "block";

        } else {

            message.style.display = "none";

        }

    }


    /* =========================================
       CONNECT SEARCH BOX
    ========================================= */

    function connectSearch(input) {

        if (!input) {
            return;
        }


        input.addEventListener("input", function() {

            /*
             * Synchronize the other search boxes.
             */

            if (
                navbarSearch &&
                input !== navbarSearch
            ) {

                navbarSearch.value =
                    input.value;

            }


            if (
                mobileSearch &&
                input !== mobileSearch
            ) {

                mobileSearch.value =
                    input.value;

            }


            if (
                mainSearch &&
                input !== mainSearch
            ) {

                mainSearch.value =
                    input.value;

            }


            filterCourses();

        });


        /*
         * Prevent the form from
         * reloading the page.
         */

        const form = input.closest("form");

        if (form) {

            form.addEventListener(
                "submit",
                function(event) {

                    event.preventDefault();

                    filterCourses();

                    const coursesSection =
                        document.getElementById("courses");

                    if (coursesSection) {

                        coursesSection.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });

                    }

                }
            );

        }

    }


    connectSearch(navbarSearch);
    connectSearch(mobileSearch);
    connectSearch(mainSearch);


    /* =========================================
       CATEGORY LINKS
    ========================================= */

    const categoryLinks =
        document.querySelectorAll(
            'a[href*="category="]'
        );


    categoryLinks.forEach(function(link) {

        link.addEventListener(
            "click",
            function(event) {

                event.preventDefault();


                const href =
                    link.getAttribute("href");


                if (!href) {
                    return;
                }


                /*
                 * Find category after:
                 * category=
                 */

                const position =
                    href.indexOf("category=");


                if (position === -1) {
                    return;
                }


                let category =
                    href.substring(
                        position + 9
                    );


                /*
                 * Remove anything after &
                 */

                if (category.indexOf("&") !== -1) {

                    category =
                        category.split("&")[0];

                }


                category =
                    decodeURIComponent(category)
                    .toLowerCase()
                    .trim();


                if (!category) {
                    return;
                }


                currentCategory = category;


                /*
                 * Remove previous selected state.
                 */

                categoryLinks.forEach(
                    function(item) {

                        item.classList.remove(
                            "selected-category"
                        );

                    }
                );


                /*
                 * Highlight selected category.
                 */

                link.classList.add(
                    "selected-category"
                );


                /*
                 * Filter courses immediately.
                 */

                filterCourses();


                /*
                 * Scroll to course section.
                 */

                const coursesSection =
                    document.getElementById("courses");


                if (coursesSection) {

                    coursesSection.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }

            }
        );

    });


    /* =========================================
       RESET / EXPLORE COURSES
    ========================================= */

    const exploreLinks =
        document.querySelectorAll(
            'a[href="/courses"]'
        );


    exploreLinks.forEach(function(link) {

        link.addEventListener(
            "click",
            function(event) {

                /*
                 * Only intercept this on
                 * the homepage.
                 */

                if (
                    window.location.pathname !== "/"
                ) {
                    return;
                }


                event.preventDefault();


                currentCategory = "all";


                categoryLinks.forEach(
                    function(item) {

                        item.classList.remove(
                            "selected-category"
                        );

                    }
                );


                filterCourses();


                const coursesSection =
                    document.getElementById("courses");


                if (coursesSection) {

                    coursesSection.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }

            }
        );

    });


    /* =========================================
       CAREER CARD HOVER
    ========================================= */

    const careerCards =
        document.querySelectorAll(".career-card");


    careerCards.forEach(function(card) {

        card.addEventListener(
            "mouseenter",
            function() {

                card.classList.add(
                    "category-hover"
                );

            }
        );


        card.addEventListener(
            "mouseleave",
            function() {

                card.classList.remove(
                    "category-hover"
                );

            }
        );

    });


    /* =========================================
       LEARNING OPTION HOVER
    ========================================= */

    const learningOptions =
        document.querySelectorAll(
            ".learning-option"
        );


    learningOptions.forEach(function(option) {

        option.addEventListener(
            "mouseenter",
            function() {

                option.classList.add(
                    "learning-hover"
                );

            }
        );


        option.addEventListener(
            "mouseleave",
            function() {

                option.classList.remove(
                    "learning-hover"
                );

            }
        );

    });


    /* =========================================
       SMOOTH SCROLL
    ========================================= */

    const anchorLinks =
        document.querySelectorAll(
            'a[href^="#"]'
        );


    anchorLinks.forEach(function(link) {

        link.addEventListener(
            "click",
            function(event) {

                const targetId =
                    link.getAttribute("href");


                if (!targetId ||
                    targetId === "#"
                ) {
                    return;
                }


                const target =
                    document.querySelector(
                        targetId
                    );


                if (!target) {
                    return;
                }


                event.preventDefault();


                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }
        );

    });


    /* =========================================
       ESCAPE KEY
    ========================================= */

    document.addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Escape") {

                if (mobileMenu) {

                    mobileMenu.classList.remove(
                        "active"
                    );

                }


                if (mobileMenuBtn) {

                    mobileMenuBtn.textContent = "☰";

                    mobileMenuBtn.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }

            }

        }
    );


    /* =========================================
       INITIAL FILTER
    ========================================= */

    filterCourses();


    console.log(
        "XTP Student Dashboard JavaScript loaded successfully."
    );


});