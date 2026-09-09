document.addEventListener("DOMContentLoaded", function() {


    var mobileMenuBtn = document.getElementById("mobileMenuBtn");
    var mobileMenu = document.getElementById("mobileMenu");

    var desktopSearch = document.querySelector(
        '.navbar-search input[name="search"]'
    );

    var mobileSearch = document.querySelector(
        '.mobile-search input[name="search"]'
    );

    var mainSearch = document.querySelector(
        '.main-search input[name="search"]'
    );

    var courseGrid = document.querySelector(".course-grid");

    var courseCards = [];

    if (courseGrid) {
        courseCards = Array.prototype.slice.call(
            courseGrid.querySelectorAll(".course-card")
        );
    }

    var activeCategory = "";
    var activeSearch = "";



    /* ==========================================
       MOBILE MENU
    ========================================== */

    if (mobileMenuBtn && mobileMenu) {

        mobileMenuBtn.addEventListener("click", function() {

            var opened = mobileMenu.classList.toggle("open");

            mobileMenuBtn.setAttribute(
                "aria-expanded",
                opened ? "true" : "false"
            );

        });

    }



    /* ==========================================
       CLOSE MOBILE MENU
    ========================================== */

    if (mobileMenu) {

        var mobileLinks = mobileMenu.querySelectorAll("a");

        mobileLinks.forEach(function(link) {

            link.addEventListener("click", function() {

                mobileMenu.classList.remove("open");

                if (mobileMenuBtn) {

                    mobileMenuBtn.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }

            });

        });

    }



    /* ==========================================
       NORMALIZE TEXT
    ========================================== */

    function normalize(text) {

        return String(text || "")
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();

    }



    /* ==========================================
       GET CATEGORY FROM LINK
    ========================================== */

    function getCategory(link) {

        if (!link) {
            return "";
        }

        var href = link.getAttribute("href") || "";

        try {

            var url = new URL(
                href,
                window.location.origin
            );

            var category = url.searchParams.get(
                "category"
            );

            return normalize(category);

        } catch (error) {

            var match = href.match(
                /[?&]category=([^&]+)/
            );

            if (!match) {
                return "";
            }

            try {

                return normalize(
                    decodeURIComponent(match[1])
                );

            } catch (decodeError) {

                return normalize(match[1]);

            }

        }

    }



    /* ==========================================
       CATEGORY ALIASES
    ========================================== */

    var categoryAliases = {

        development: [
            "development",
            "software development",
            "web development",
            "programming",
            "software",
            "frontend",
            "front end",
            "backend",
            "back end",
            "full stack",
            "fullstack"
        ],

        cybersecurity: [
            "cybersecurity",
            "cyber security",
            "information security",
            "security"
        ],

        hacking: [
            "hacking",
            "ethical hacking",
            "penetration testing",
            "penetration",
            "pentesting"
        ],

        data: [
            "data",
            "data analysis",
            "data analytics",
            "analytics",
            "database",
            "sql"
        ],

        ai: [
            "ai",
            "artificial intelligence",
            "machine learning",
            "deep learning",
            "ml"
        ],

        cloud: [
            "cloud",
            "cloud computing",
            "aws",
            "azure",
            "google cloud",
            "devops"
        ],

        networking: [
            "networking",
            "computer networking",
            "network",
            "infrastructure"
        ],

        design: [
            "design",
            "ui design",
            "ux design",
            "ui/ux",
            "ui ux",
            "user interface",
            "user experience",
            "graphics",
            "graphic design"
        ],

        business: [
            "business",
            "entrepreneurship",
            "entrepreneur",
            "business management"
        ],

        marketing: [
            "marketing",
            "digital marketing",
            "social media marketing",
            "content marketing"
        ],

        it: [
            "it",
            "it support",
            "information technology",
            "technical support",
            "computer support"
        ],

        mobile: [
            "mobile",
            "mobile development",
            "android",
            "ios",
            "react native",
            "mobile app",
            "app development"
        ]

    };



    /* ==========================================
       CATEGORY MATCHING
    ========================================== */

    function categoryMatches(
        courseCategory,
        selectedCategory
    ) {

        var course = normalize(courseCategory);
        var selected = normalize(selectedCategory);

        if (!selected) {
            return true;
        }

        var possibleMatches =
            categoryAliases[selected];

        if (!possibleMatches) {

            return (
                course === selected ||
                course.indexOf(selected) !== -1 ||
                selected.indexOf(course) !== -1
            );

        }

        for (
            var i = 0; i < possibleMatches.length; i++
        ) {

            var value = normalize(
                possibleMatches[i]
            );

            if (course === value) {
                return true;
            }

            if (course.indexOf(value) !== -1) {
                return true;
            }

            if (value.indexOf(course) !== -1) {
                return true;
            }

        }

        return false;

    }



    /* ==========================================
       FILTER COURSES
    ========================================== */

    function filterCourses() {

        var visibleCourses = 0;

        courseCards.forEach(function(card) {

            var titleElement =
                card.querySelector("h3");

            var descriptionElement =
                card.querySelector(".course-description");

            var categoryElement =
                card.querySelector(".course-category");

            var levelElement =
                card.querySelector(".course-level");


            var title = titleElement ?
                titleElement.textContent :
                "";

            var description =
                descriptionElement ?
                descriptionElement.textContent :
                "";

            var category =
                categoryElement ?
                categoryElement.textContent :
                "";

            var level =
                levelElement ?
                levelElement.textContent :
                "";


            var allText = normalize(
                title +
                " " +
                description +
                " " +
                category +
                " " +
                level
            );


            var searchOkay = !activeSearch ||
                allText.indexOf(activeSearch) !== -1;


            var categoryOkay = !activeCategory ||
                categoryMatches(
                    category,
                    activeCategory
                );


            if (
                searchOkay &&
                categoryOkay
            ) {

                card.style.display = "";

                visibleCourses++;

            } else {

                card.style.display = "none";

            }

        });


        showFilterMessage(visibleCourses);
        updateNoResults(visibleCourses);

    }



    /* ==========================================
       FILTER MESSAGE
    ========================================== */

    var filterMessage = null;


    function createFilterMessage() {

        if (!courseGrid) {
            return;
        }


        filterMessage =
            document.createElement("div");


        filterMessage.style.display = "none";
        filterMessage.style.marginBottom = "20px";
        filterMessage.style.padding = "15px 18px";
        filterMessage.style.borderRadius = "10px";
        filterMessage.style.background = "#f5f5f5";
        filterMessage.style.fontSize = "15px";


        courseGrid.parentNode.insertBefore(
            filterMessage,
            courseGrid
        );

    }


    createFilterMessage();



    /* ==========================================
       SHOW FILTER MESSAGE
    ========================================== */

    function showFilterMessage(count) {

        if (!filterMessage) {
            return;
        }


        if (!activeSearch &&
            !activeCategory
        ) {

            filterMessage.style.display = "none";

            return;

        }


        filterMessage.style.display = "block";


        var message = "";


        if (
            activeSearch &&
            activeCategory
        ) {

            message =
                "Showing " +
                count +
                " course" +
                (count === 1 ? "" : "s") +
                ' matching "' +
                activeSearch +
                '" in ' +
                activeCategory +
                ".";

        } else if (activeSearch) {

            message =
                "Showing " +
                count +
                " course" +
                (count === 1 ? "" : "s") +
                ' matching "' +
                activeSearch +
                '".';

        } else {

            message =
                "Showing " +
                count +
                " course" +
                (count === 1 ? "" : "s") +
                " in " +
                activeCategory +
                ".";

        }


        filterMessage.textContent = message;

    }



    /* ==========================================
       NO RESULTS
    ========================================== */

    var noResults = null;


    function createNoResults() {

        if (!courseGrid) {
            return;
        }


        noResults =
            document.createElement("div");


        noResults.style.display = "none";
        noResults.style.padding = "40px 20px";
        noResults.style.textAlign = "center";
        noResults.style.marginTop = "20px";
        noResults.style.borderRadius = "12px";
        noResults.style.background = "#f5f5f5";


        var heading =
            document.createElement("h3");


        heading.textContent =
            "No courses found";


        var paragraph =
            document.createElement("p");


        paragraph.textContent =
            "Try another search or choose another category.";


        var button =
            document.createElement("button");


        button.type = "button";
        button.textContent = "Clear filters";


        button.style.padding = "10px 18px";
        button.style.border = "none";
        button.style.borderRadius = "8px";
        button.style.cursor = "pointer";


        button.addEventListener(
            "click",
            clearFilters
        );


        noResults.appendChild(heading);
        noResults.appendChild(paragraph);
        noResults.appendChild(button);


        courseGrid.parentNode.insertBefore(
            noResults,
            courseGrid.nextSibling
        );

    }


    createNoResults();



    /* ==========================================
       UPDATE NO RESULTS
    ========================================== */

    function updateNoResults(count) {

        if (!noResults) {
            return;
        }


        if (
            count === 0 &&
            (
                activeSearch ||
                activeCategory
            )
        ) {

            noResults.style.display =
                "block";

        } else {

            noResults.style.display =
                "none";

        }

    }



    /* ==========================================
       SEARCH INPUT SYNC
    ========================================== */

    function syncSearch(value, source) {

        if (
            desktopSearch &&
            source !== desktopSearch
        ) {

            desktopSearch.value = value;

        }


        if (
            mobileSearch &&
            source !== mobileSearch
        ) {

            mobileSearch.value = value;

        }


        if (
            mainSearch &&
            source !== mainSearch
        ) {

            mainSearch.value = value;

        }

    }



    /* ==========================================
       SEARCH
    ========================================== */

    function setupSearch(input) {

        if (!input) {
            return;
        }


        input.addEventListener(
            "input",
            function() {

                activeSearch =
                    normalize(input.value);


                syncSearch(
                    input.value,
                    input
                );


                filterCourses();

            }
        );

    }


    setupSearch(desktopSearch);
    setupSearch(mobileSearch);
    setupSearch(mainSearch);



    /* ==========================================
       SEARCH FORM SUBMIT
    ========================================== */

    var searchForms =
        document.querySelectorAll(
            ".navbar-search, .mobile-search, .main-search"
        );


    searchForms.forEach(function(form) {

        form.addEventListener(
            "submit",
            function(event) {

                event.preventDefault();


                var input =
                    form.querySelector(
                        'input[name="search"]'
                    );


                if (!input) {
                    return;
                }


                activeSearch =
                    normalize(input.value);


                syncSearch(
                    input.value,
                    input
                );


                filterCourses();


                if (courseGrid) {

                    courseGrid.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }


                if (mobileMenu) {

                    mobileMenu.classList.remove(
                        "open"
                    );

                }


                if (mobileMenuBtn) {

                    mobileMenuBtn.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }

            }
        );

    });



    /* ==========================================
       CATEGORY LINKS
       
       ALL LINKS USING:
       
       /courses?category=development
       /courses?category=cybersecurity
       /courses?category=data
       etc.
       
       ARE SUPPORTED.
    ========================================== */

    var categoryLinks =
        document.querySelectorAll(
            'a[href*="category="]'
        );


    categoryLinks.forEach(function(link) {

        link.addEventListener(
            "click",
            function(event) {

                var category =
                    getCategory(link);


                if (!category) {
                    return;
                }


                /*
                 * If there are courses on the
                 * homepage, filter them here.
                 */

                if (courseCards.length > 0) {

                    event.preventDefault();


                    activeCategory =
                        category;


                    filterCourses();


                    /*
                     * Scroll to courses.
                     */

                    if (courseGrid) {

                        courseGrid.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });

                    }


                    /*
                     * Close mobile menu.
                     */

                    if (mobileMenu) {

                        mobileMenu.classList.remove(
                            "open"
                        );

                    }


                    if (mobileMenuBtn) {

                        mobileMenuBtn.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                    }

                }

                /*
                 * If there are no course cards,
                 * DO NOT preventDefault().
                 *
                 * The browser will normally go to:
                 *
                 * /courses?category=...
                 */

            }
        );

    });



    /* ==========================================
       CATEGORY CARD KEYBOARD SUPPORT
       
       Makes sure category cards still
       behave correctly when focused and
       activated from the keyboard.
    ========================================== */

    var careerCards =
        document.querySelectorAll(
            ".career-card"
        );


    careerCards.forEach(function(card) {

        card.setAttribute(
            "role",
            "link"
        );

        card.addEventListener(
            "keydown",
            function(event) {

                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {

                    event.preventDefault();

                    card.click();

                }

            }
        );

    });



    /* ==========================================
       LEARNING OPTION CARDS
       
       Hero cards such as:
       
       Development
       Cybersecurity
       Data & AI
       Cloud & Networking
       
       Use the same category system.
    ========================================== */

    var learningOptions =
        document.querySelectorAll(
            ".learning-option"
        );


    learningOptions.forEach(function(option) {

        option.addEventListener(
            "click",
            function(event) {

                var category =
                    getCategory(option);


                if (!category) {
                    return;
                }


                if (courseCards.length > 0) {

                    event.preventDefault();

                    activeCategory =
                        category;

                    filterCourses();


                    if (courseGrid) {

                        courseGrid.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });

                    }

                }

            }
        );

    });



    /* ==========================================
       CLEAR FILTERS
    ========================================== */

    function clearFilters() {

        activeSearch = "";
        activeCategory = "";


        if (desktopSearch) {
            desktopSearch.value = "";
        }


        if (mobileSearch) {
            mobileSearch.value = "";
        }


        if (mainSearch) {
            mainSearch.value = "";
        }


        courseCards.forEach(
            function(card) {

                card.style.display = "";

            }
        );


        showFilterMessage(
            courseCards.length
        );


        updateNoResults(
            courseCards.length
        );

    }



    /* ==========================================
       ESCAPE KEY
    ========================================== */

    document.addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Escape") {

                if (mobileMenu) {

                    mobileMenu.classList.remove(
                        "open"
                    );

                }


                if (mobileMenuBtn) {

                    mobileMenuBtn.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }

            }

        }
    );



    /* ==========================================
       INITIAL URL CATEGORY
       
       If the page was opened with:
       
       /?category=development
       
       or another category URL,
       apply the category automatically.
    ========================================== */

    try {

        var currentURL =
            new URL(window.location.href);

        var urlCategory =
            currentURL.searchParams.get(
                "category"
            );

        var urlSearch =
            currentURL.searchParams.get(
                "search"
            );


        if (urlSearch) {

            activeSearch =
                normalize(urlSearch);

            syncSearch(
                urlSearch,
                null
            );

        }


        if (urlCategory) {

            activeCategory =
                normalize(urlCategory);

        }


        if (
            activeSearch ||
            activeCategory
        ) {

            filterCourses();

        }

    } catch (error) {

        console.log(
            "Could not read URL filters."
        );

    }


});