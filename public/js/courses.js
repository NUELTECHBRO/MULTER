document.addEventListener("DOMContentLoaded", function() {


    /* =========================
       MOBILE SIDEBAR
    ========================= */

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
            sidebar.classList.contains("open") &&
            !sidebar.contains(event.target) &&
            !menuToggle.contains(event.target)
        ) {
            sidebar.classList.remove("open");
        }

    });


    /* =========================
       COURSE ELEMENTS
    ========================= */

    const grid = document.getElementById("coursesGrid");

    const filterButtons =
        document.querySelectorAll(".filter-btn");

    const visibleCourseCount =
        document.getElementById("visibleCourseCount");

    const clearFilters =
        document.getElementById("clearFilters");

    const filterEmpty =
        document.getElementById("filterEmpty");

    const resetSearch =
        document.getElementById("resetSearch");

    const courseSort =
        document.getElementById("courseSort");


    /* =========================
       SEARCH INPUTS
    ========================= */

    const searchInputs =
        document.querySelectorAll(
            'input[name="search"]'
        );


    let currentFilter = "all";

    let currentSearch = "";


    /* =========================
       GET COURSE CARDS
    ========================= */

    function getCourseCards() {

        if (!grid) {
            return [];
        }

        return Array.from(
            grid.querySelectorAll(".course-card")
        );

    }


    /* =========================
       SEARCH + FILTER
    ========================= */

    function updateCourses() {

        if (!grid) {
            return;
        }

        const cards = getCourseCards();

        let visibleCards = 0;


        cards.forEach(function(card) {

            const title =
                (card.dataset.title || "").toLowerCase();

            const category =
                (card.dataset.category || "").toLowerCase();

            const level =
                (card.dataset.level || "").toLowerCase();

            const descriptionElement =
                card.querySelector(".course-description");

            const description =
                descriptionElement ?
                descriptionElement.textContent.toLowerCase() :
                "";


            const searchText =
                currentSearch.toLowerCase().trim();


            /* =========================
               SEARCH MATCH
            ========================= */

            const matchesSearch =
                searchText === "" ||
                title.includes(searchText) ||
                category.includes(searchText) ||
                level.includes(searchText) ||
                description.includes(searchText);


            /* =========================
               LEVEL FILTER
            ========================= */

            let matchesFilter = true;


            if (currentFilter !== "all") {

                matchesFilter =
                    level.includes(currentFilter);

            }


            /* =========================
               SHOW / HIDE
            ========================= */

            if (
                matchesSearch &&
                matchesFilter
            ) {

                card.style.display = "";

                visibleCards++;

            } else {

                card.style.display = "none";

            }

        });


        /* =========================
           UPDATE COUNT
        ========================= */

        if (visibleCourseCount) {

            visibleCourseCount.textContent =
                visibleCards;

        }


        /* =========================
           EMPTY MESSAGE
        ========================= */

        if (filterEmpty) {

            filterEmpty.style.display =
                visibleCards === 0 ?
                "block" :
                "none";

        }

    }


    /* =========================
       LIVE SEARCH
    ========================= */

    searchInputs.forEach(function(input) {

        input.addEventListener(
            "input",
            function() {

                currentSearch =
                    input.value;

                /* Keep both search boxes synchronized */

                searchInputs.forEach(function(otherInput) {

                    if (otherInput !== input) {

                        otherInput.value =
                            input.value;

                    }

                });


                updateCourses();

            }
        );

    });


    /* =========================
       PREVENT SEARCH FORM RELOAD
    ========================= */

    searchInputs.forEach(function(input) {

        const form =
            input.closest("form");

        if (form) {

            form.addEventListener(
                "submit",
                function(event) {

                    event.preventDefault();

                    currentSearch =
                        input.value;

                    updateCourses();

                }
            );

        }

    });


    /* =========================
       FILTER BUTTONS
    ========================= */

    filterButtons.forEach(function(button) {

        button.addEventListener(
            "click",
            function() {

                filterButtons.forEach(
                    function(btn) {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add("active");


                currentFilter =
                    button.dataset.filter || "all";


                updateCourses();

            }
        );

    });


    /* =========================
       SORT COURSES
    ========================= */

    if (courseSort && grid) {

        courseSort.addEventListener(
            "change",
            function() {

                const cards =
                    getCourseCards();

                const sortValue =
                    courseSort.value;


                if (sortValue === "az") {

                    cards.sort(function(a, b) {

                        return (
                                a.dataset.title || ""
                            )
                            .toLowerCase()
                            .localeCompare(
                                (
                                    b.dataset.title || ""
                                ).toLowerCase()
                            );

                    });

                }


                if (sortValue === "za") {

                    cards.sort(function(a, b) {

                        return (
                                b.dataset.title || ""
                            )
                            .toLowerCase()
                            .localeCompare(
                                (
                                    a.dataset.title || ""
                                ).toLowerCase()
                            );

                    });

                }


                cards.forEach(function(card) {

                    grid.appendChild(card);

                });


                updateCourses();

            }
        );

    }


    /* =========================
       CLEAR EVERYTHING
    ========================= */

    function resetFilters() {

        currentFilter = "all";

        currentSearch = "";


        /* Reset filter buttons */

        filterButtons.forEach(
            function(button) {

                button.classList.remove(
                    "active"
                );

            }
        );


        const allButton =
            document.querySelector(
                '.filter-btn[data-filter="all"]'
            );


        if (allButton) {

            allButton.classList.add("active");

        }


        /* Reset search boxes */

        searchInputs.forEach(
            function(input) {

                input.value = "";

            }
        );


        /* Reset sorting */

        if (courseSort) {

            courseSort.value = "default";

        }


        /* Show all cards */

        if (grid) {

            const cards =
                getCourseCards();

            cards.forEach(function(card) {

                card.style.display = "";

            });

        }


        updateCourses();

    }


    /* =========================
       CLEAR FILTER BUTTON
    ========================= */

    if (clearFilters) {

        clearFilters.addEventListener(
            "click",
            resetFilters
        );

    }


    /* =========================
       SHOW ALL COURSES
    ========================= */

    if (resetSearch) {

        resetSearch.addEventListener(
            "click",
            resetFilters
        );

    }


    /* =========================
       COURSE BUTTON LOADING
    ========================= */

    const startButtons =
        document.querySelectorAll(
            ".start-course"
        );


    startButtons.forEach(function(button) {

        button.addEventListener(
            "click",
            function() {

                button.classList.add(
                    "loading"
                );

            }
        );

    });


    /* =========================
       ESCAPE KEY
    ========================= */

    document.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Escape" &&
                sidebar &&
                sidebar.classList.contains("open")
            ) {

                sidebar.classList.remove(
                    "open"
                );

            }

        }
    );


    /* =========================
       INITIALIZE
    ========================= */

    updateCourses();


});