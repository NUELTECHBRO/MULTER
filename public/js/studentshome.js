document.addEventListener("DOMContentLoaded", function() {


    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const mobileMenu = document.getElementById("mobileMenu");

    const navbarSearch = document.getElementById("studentNavbarSearch");
    const mobileSearch = document.getElementById("studentMobileSearch");
    const mainSearch = document.getElementById("studentMainSearch");

    const courseGrid = document.getElementById("studentCoursesGrid");
    const searchStatus = document.getElementById("studentSearchStatus");
    const noSearchResults = document.getElementById("studentNoSearchResults");


    /*
    ==========================================
    MOBILE MENU
    ==========================================
    */

    if (mobileMenuBtn && mobileMenu) {

        mobileMenuBtn.addEventListener("click", function() {

            const isOpen = mobileMenu.classList.toggle("active");

            mobileMenuBtn.setAttribute(
                "aria-expanded",
                isOpen ? "true" : "false"
            );

            mobileMenuBtn.textContent = isOpen ? "✕" : "☰";

        });


        document.addEventListener("click", function(event) {

            if (!mobileMenu.contains(event.target) &&
                !mobileMenuBtn.contains(event.target)
            ) {

                mobileMenu.classList.remove("active");

                mobileMenuBtn.setAttribute(
                    "aria-expanded",
                    "false"
                );

                mobileMenuBtn.textContent = "☰";

            }

        });

    }


    /*
    ==========================================
    MAKE SURE COURSE GRID EXISTS
    ==========================================
    */

    if (!courseGrid) {
        return;
    }


    /*
    ==========================================
    GET COURSE CARDS
    ==========================================
    */

    const courseCards = Array.from(
        courseGrid.querySelectorAll(".course-card")
    );


    /*
    ==========================================
    GET SEARCH INPUTS
    ==========================================
    */

    const searchInputs = [];


    if (navbarSearch) {

        const input = navbarSearch.querySelector(
            "input[name='search']"
        );

        if (input) {
            searchInputs.push(input);
        }

    }


    if (mobileSearch) {

        const input = mobileSearch.querySelector(
            "input[name='search']"
        );

        if (input) {
            searchInputs.push(input);
        }

    }


    if (mainSearch) {

        const input = mainSearch.querySelector(
            "input[name='search']"
        );

        if (input) {
            searchInputs.push(input);
        }

    }


    /*
    ==========================================
    NORMALIZE SEARCH
    ==========================================
    */

    function normalizeSearch(value) {

        return String(value || "")
            .toLowerCase()
            .trim()
            .replace(/\s+/g, " ");

    }


    /*
    ==========================================
    GET COURSE SEARCH CONTENT
    ==========================================
    */

    function getCourseSearchText(card) {

        const title = card.dataset.courseTitle || "";
        const description = card.dataset.courseDescription || "";
        const category = card.dataset.courseCategory || "";
        const level = card.dataset.courseLevel || "";

        return normalizeSearch(
            title + " " +
            description + " " +
            category + " " +
            level
        );

    }


    /*
    ==========================================
    SYNCHRONIZE ALL SEARCH BOXES
    ==========================================
    */

    function synchronizeSearchInputs(sourceInput) {

        const value = sourceInput.value;

        searchInputs.forEach(function(input) {

            if (input !== sourceInput) {
                input.value = value;
            }

        });

    }


    /*
    ==========================================
    SEARCH COURSES
    ==========================================
    */

    function searchCourses(value) {

        const searchTerm = normalizeSearch(value);

        let visibleCourses = 0;


        /*
        --------------------------------------
        NO SEARCH
        --------------------------------------
        */

        if (!searchTerm) {

            courseCards.forEach(function(card) {

                card.style.display = "";

            });

            visibleCourses = courseCards.length;

        }


        /*
        --------------------------------------
        SEARCH
        --------------------------------------
        */
        else {

            const searchWords = searchTerm.split(" ");


            courseCards.forEach(function(card) {

                const courseText = getCourseSearchText(card);

                const matches = searchWords.every(function(word) {

                    return courseText.includes(word);

                });


                if (matches) {

                    card.style.display = "";

                    visibleCourses++;

                } else {

                    card.style.display = "none";

                }

            });

        }


        /*
        ==========================================
        SEARCH STATUS
        ==========================================
        */

        if (searchStatus) {

            if (searchTerm) {

                searchStatus.hidden = false;


                if (visibleCourses === 0) {

                    searchStatus.textContent =
                        "No courses found for \"" +
                        value.trim() +
                        "\"";

                } else {

                    searchStatus.textContent =
                        visibleCourses +
                        " course" +
                        (visibleCourses === 1 ? "" : "s") +
                        " found";

                }

            } else {

                searchStatus.hidden = true;

                searchStatus.textContent = "";

            }

        }


        /*
        ==========================================
        NO SEARCH RESULTS MESSAGE
        ==========================================
        */

        if (noSearchResults) {

            if (searchTerm && visibleCourses === 0) {

                noSearchResults.hidden = false;

            } else {

                noSearchResults.hidden = true;

            }

        }

    }


    /*
    ==========================================
    LIVE SEARCH
    ==========================================
    */

    searchInputs.forEach(function(input) {

        input.addEventListener("input", function() {

            synchronizeSearchInputs(input);

            searchCourses(input.value);

        });


        input.addEventListener("keydown", function(event) {

            if (event.key === "Enter") {

                event.preventDefault();

                synchronizeSearchInputs(input);

                searchCourses(input.value);

            }

        });

    });


    /*
    ==========================================
    FORM SUBMISSION
    ==========================================
    */

    const searchForms = [
        navbarSearch,
        mobileSearch,
        mainSearch
    ].filter(function(form) {

        return form !== null;

    });


    searchForms.forEach(function(form) {

        form.addEventListener("submit", function() {

            const input = form.querySelector(
                "input[name='search']"
            );


            if (!input) {
                return;
            }


            synchronizeSearchInputs(input);

        });

    });


    /*
    ==========================================
    SEARCH FROM URL
    ==========================================
    */

    const urlParams = new URLSearchParams(
        window.location.search
    );

    const urlSearch = urlParams.get("search");


    if (urlSearch) {

        searchInputs.forEach(function(input) {

            input.value = urlSearch;

        });

        searchCourses(urlSearch);

    }


    /*
    ==========================================
    CLEAR SEARCH WHEN BROWSING ALL COURSES
    ==========================================
    */

    const browseLinks = document.querySelectorAll(
        ".browse-courses-btn, .view-all"
    );


    browseLinks.forEach(function(link) {

        link.addEventListener("click", function() {

            searchInputs.forEach(function(input) {

                input.value = "";

            });

        });

    });


});