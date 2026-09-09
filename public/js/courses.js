document.addEventListener("DOMContentLoaded", function() {
    const coursesGrid = document.getElementById("coursesGrid");
    const clearFilters = document.getElementById("clearFilters");
    const filterEmpty = document.getElementById("filterEmpty");
    const resetSearch = document.getElementById("resetSearch");
    const courseSort = document.getElementById("courseSort");
    const filterButtons = document.querySelectorAll(".filter-btn");
    const searchInput = document.querySelector(".nav-search input[name='search']");


    if (!coursesGrid) {
        return;
    }

    let courseCards = Array.from(
        coursesGrid.querySelectorAll(".course-card")
    );

    let currentLevel = "all";
    let currentSearch = "";
    let currentSort = "default";

    function normalizeText(value) {
        return String(value || "")
            .toLowerCase()
            .trim()
            .replace(/\s+/g, " ");
    }

    function getCourseText(card) {
        const title = card.dataset.title || "";
        const category = card.dataset.category || "";
        const level = card.dataset.level || "";

        const descriptionElement =
            card.querySelector(".course-description");

        let description = "";

        if (descriptionElement) {
            description = descriptionElement.textContent || "";
        }

        return normalizeText(
            title +
            " " +
            category +
            " " +
            level +
            " " +
            description
        );
    }

    function matchesLevel(card) {
        if (currentLevel === "all") {
            return true;
        }

        const courseLevel = normalizeText(
            card.dataset.level || ""
        );

        return courseLevel === currentLevel;
    }

    function matchesSearch(card) {
        if (!currentSearch) {
            return true;
        }

        const courseText = getCourseText(card);
        const searchWords = currentSearch.split(" ");

        return searchWords.every(function(word) {
            return courseText.includes(word);
        });
    }

    function sortCourses() {
        const cards = Array.from(
            coursesGrid.querySelectorAll(".course-card")
        );

        if (currentSort === "az") {
            cards.sort(function(a, b) {
                const titleA = normalizeText(
                    a.dataset.title || ""
                );

                const titleB = normalizeText(
                    b.dataset.title || ""
                );

                return titleA.localeCompare(titleB);
            });
        } else if (currentSort === "za") {
            cards.sort(function(a, b) {
                const titleA = normalizeText(
                    a.dataset.title || ""
                );

                const titleB = normalizeText(
                    b.dataset.title || ""
                );

                return titleB.localeCompare(titleA);
            });
        } else {
            cards.sort(function(a, b) {
                const numberElementA =
                    a.querySelector(".course-number");

                const numberElementB =
                    b.querySelector(".course-number");

                let numberA = 0;
                let numberB = 0;

                if (numberElementA) {
                    numberA = Number(
                        numberElementA.textContent.trim()
                    ) || 0;
                }

                if (numberElementB) {
                    numberB = Number(
                        numberElementB.textContent.trim()
                    ) || 0;
                }

                return numberA - numberB;
            });
        }

        cards.forEach(function(card) {
            coursesGrid.appendChild(card);
        });

        courseCards = Array.from(
            coursesGrid.querySelectorAll(".course-card")
        );
    }

    function updateResultCount(visibleCount) {
        const resultText =
            document.querySelector(".result-bar span");

        if (!resultText) {
            return;
        }

        resultText.innerHTML =
            "Showing <strong id=\"visibleCourseCount\">" +
            visibleCount +
            "</strong> " +
            (visibleCount === 1 ? "course" : "courses");
    }

    function applyFilters() {
        let visibleCount = 0;

        courseCards.forEach(function(card) {
            const searchMatch = matchesSearch(card);
            const levelMatch = matchesLevel(card);

            if (searchMatch && levelMatch) {
                card.style.display = "";
                visibleCount++;
            } else {
                card.style.display = "none";
            }
        });

        updateResultCount(visibleCount);

        if (filterEmpty) {
            if (visibleCount === 0) {
                filterEmpty.style.display = "block";
            } else {
                filterEmpty.style.display = "none";
            }
        }
    }

    if (searchInput) {
        searchInput.addEventListener("input", function() {
            currentSearch = normalizeText(
                searchInput.value
            );

            applyFilters();
        });

        searchInput.addEventListener("keydown", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();

                currentSearch = normalizeText(
                    searchInput.value
                );

                applyFilters();
            }
        });
    }

    const urlParams =
        new URLSearchParams(window.location.search);

    const urlSearch =
        urlParams.get("search");

    if (urlSearch && searchInput) {
        searchInput.value = urlSearch;

        currentSearch =
            normalizeText(urlSearch);
    }

    filterButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            filterButtons.forEach(function(item) {
                item.classList.remove("active");
            });

            button.classList.add("active");

            currentLevel =
                normalizeText(
                    button.dataset.filter || "all"
                );

            applyFilters();
        });
    });

    if (courseSort) {
        courseSort.addEventListener("change", function() {
            currentSort = courseSort.value;

            sortCourses();
            applyFilters();
        });
    }

    function resetAllFilters() {
        currentLevel = "all";
        currentSearch = "";
        currentSort = "default";

        if (searchInput) {
            searchInput.value = "";
        }

        if (courseSort) {
            courseSort.value = "default";
        }

        filterButtons.forEach(function(button) {
            button.classList.remove("active");
        });

        const allButton =
            document.querySelector(
                ".filter-btn[data-filter='all']"
            );

        if (allButton) {
            allButton.classList.add("active");
        }

        sortCourses();
        applyFilters();
    }

    if (clearFilters) {
        clearFilters.addEventListener(
            "click",
            resetAllFilters
        );
    }

    if (resetSearch) {
        resetSearch.addEventListener(
            "click",
            resetAllFilters
        );
    }

    sortCourses();
    applyFilters();


});