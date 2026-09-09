document.addEventListener("DOMContentLoaded", function() {


    /* ================================
       MOBILE MENU
    ================================= */

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

        mobileMenu.querySelectorAll("a").forEach(function(link) {

            link.addEventListener("click", function() {

                mobileMenu.classList.remove("active");

                mobileMenuBtn.textContent = "☰";
                mobileMenuBtn.setAttribute("aria-expanded", "false");

            });

        });

    }


    /* ================================
       COURSE CARDS
    ================================= */

    const courseCards =
        document.querySelectorAll(".course-card");


    /* ================================
       SEARCH INPUTS
    ================================= */

    const navbarSearch =
        document.querySelector(".navbar-search input");

    const mobileSearch =
        document.querySelector(".mobile-search input");

    const mainSearch =
        document.querySelector(".main-search input");


    /* ================================
       CURRENT FILTER
    ================================= */

    let currentCategory = "all";


    /* ================================
       FILTER COURSES
    ================================= */

    function filterCourses() {

        let searchValue = "";

        if (mainSearch && mainSearch.value.trim() !== "") {

            searchValue = mainSearch.value.toLowerCase().trim();

        } else if (
            navbarSearch &&
            navbarSearch.value.trim() !== ""
        ) {

            searchValue =
                navbarSearch.value.toLowerCase().trim();

        } else if (
            mobileSearch &&
            mobileSearch.value.trim() !== ""
        ) {

            searchValue =
                mobileSearch.value.toLowerCase().trim();

        }


        let foundCourses = 0;


        courseCards.forEach(function(card) {

            const title =
                card.querySelector("h3") ?
                card.querySelector("h3")
                .textContent
                .toLowerCase() :
                "";


            const description =
                card.querySelector(".course-description") ?
                card.querySelector(".course-description")
                .textContent
                .toLowerCase() :
                "";


            const category =
                card.querySelector(".course-category") ?
                card.querySelector(".course-category")
                .textContent
                .toLowerCase()
                .trim() :
                "";


            const level =
                card.querySelector(".course-level") ?
                card.querySelector(".course-level")
                .textContent
                .toLowerCase()
                .trim() :
                "";


            /*
             * Everything inside the course
             * that can be searched.
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
             * SEARCH
             */

            const matchesSearch =
                searchValue === "" ||
                searchableText.includes(searchValue);


            /*
             * CATEGORY
             */

            let matchesCategory = true;


            if (currentCategory !== "all") {

                matchesCategory =
                    category === currentCategory;

            }


            /*
             * SHOW / HIDE
             */

            if (matchesSearch && matchesCategory) {

                card.style.display = "";

                foundCourses++;

            } else {

                card.style.display = "none";

            }

        });


        /*
         * No results message
         */

        let noResults =
            document.getElementById("jsNoCourses");


        if (!noResults) {

            noResults =
                document.createElement("div");

            noResults.id = "jsNoCourses";

            noResults.innerHTML = <
                div style = "
            text - align: center;
            padding: 60 px 20 px;
            width: 100 % ;
            grid - column: 1 / -1;
            ">

            <
            div style = "
            font - size: 50 px;
            margin - bottom: 15 px;
            ">🔎 <
            /div>

            <
            h3 >
                No courses found <
                /h3>

            <
            p >
                Try another search or category. <
                /p>

            <
            /div>;

            noResults.style.display = "none";

            const grid =
                document.querySelector(".course-grid");

            if (grid) {

                grid.appendChild(noResults);

            }

        }


        if (noResults) {

            noResults.style.display =
                foundCourses === 0 ?
                "block" :
                "none";

        }

    }


    /* ================================
       SEARCH
    ================================= */

    function setupSearch(input) {

        if (!input) {
            return;
        }


        input.addEventListener("input", function() {

            /*
             * Synchronize all search boxes.
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


            /*
             * Filter immediately.
             */

            filterCourses();

        });


        /*
         * Prevent page reload when
         * pressing Search.
         */

        const form = input.closest("form");

        if (form) {

            form.addEventListener("submit", function(event) {

                event.preventDefault();

                filterCourses();

                const coursesSection =
                    document.getElementById("courses");

                if (coursesSection) {

                    coursesSection.scrollIntoView({
                        behavior: "smooth"
                    });

                }

            });

        }

    }


    setupSearch(navbarSearch);
    setupSearch(mobileSearch);
    setupSearch(mainSearch);


    /* ================================
       CATEGORY FILTER
    ================================= */

    const categoryLinks =
        document.querySelectorAll(
            'a[href*="/courses?category="]'
        );


    categoryLinks.forEach(function(link) {

        link.addEventListener("click", function(event) {

            event.preventDefault();


            const href =
                link.getAttribute("href");


            if (!href) {
                return;
            }


            /*
             * Example:
             *
             * /courses?category=development
             */

            const category =
                href.split("category=")[1];


            if (!category) {
                return;
            }


            currentCategory =
                decodeURIComponent(category)
                .toLowerCase()
                .trim();


            /*
             * Remove active category
             */

            categoryLinks.forEach(function(item) {

                item.classList.remove(
                    "selected-category"
                );

            });


            /*
             * Add active category
             */

            link.classList.add(
                "selected-category"
            );


            /*
             * Filter courses
             */

            filterCourses();


            /*
             * Scroll down to courses
             */

            const coursesSection =
                document.getElementById("courses");


            if (coursesSection) {

                coursesSection.scrollIntoView({
                    behavior: "smooth"
                });

            }

        });

    });


    /* ================================
       EXPLORE COURSES / RESET
    ================================= */

    document
        .querySelectorAll('a[href="/courses"]')
        .forEach(function(link) {

            link.addEventListener(
                "click",
                function(event) {

                    /*
                     * Only intercept this on
                     * the dashboard homepage.
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
                            behavior: "smooth"
                        });

                    }

                }
            );

        });


    /* ================================
       CAREER CARD HOVER
    ================================= */

    document
        .querySelectorAll(".career-card")
        .forEach(function(card) {

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


    /* ================================
       LEARNING OPTION HOVER
    ================================= */

    document
        .querySelectorAll(".learning-option")
        .forEach(function(option) {

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


    /* ================================
       SMOOTH SCROLL
    ================================= */

    document
        .querySelectorAll('a[href^="#"]')
        .forEach(function(link) {

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
                        document.querySelector(targetId);


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


    /* ================================
       ESCAPE CLOSE MENU
    ================================= */

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


    /* ================================
       INITIALIZE
    ================================= */

    filterCourses();


    console.log(
        "XTP Student Dashboard JavaScript loaded."
    );


});