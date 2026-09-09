document.addEventListener("DOMContentLoaded", function() {


    var sidebar = document.getElementById("sidebar");
    var menuToggle = document.getElementById("menuToggle");

    var searchInput = document.getElementById("courseSearch");
    var courseGrid = document.getElementById("coursesGrid");
    var courseCount = document.getElementById("courseCount");

    var editModal = document.getElementById("editModal");
    var editForm = document.getElementById("editForm");

    var editTitle = document.getElementById("editTitle");
    var editCategory = document.getElementById("editCategory");
    var editLevel = document.getElementById("editLevel");
    var editDescription = document.getElementById("editDescription");

    var currentVideo = document.getElementById("currentVideo");
    var currentThumbnail = document.getElementById("currentThumbnail");

    var closeModal = document.getElementById("closeModal");
    var cancelModal = document.getElementById("cancelModal");
    var modalBackdrop = document.querySelector(".modal-backdrop");


    /* SIDEBAR */

    if (menuToggle && sidebar) {

        menuToggle.addEventListener("click", function() {

            sidebar.classList.toggle("open");

        });

    }


    /* SEARCH */

    if (searchInput && courseGrid) {

        searchInput.addEventListener("input", function() {

            var searchValue =
                searchInput.value.toLowerCase().trim();

            var cards =
                courseGrid.querySelectorAll(".course-card");

            var visible = 0;


            for (var i = 0; i < cards.length; i++) {

                var card = cards[i];

                var title =
                    card.getAttribute("data-title") || "";

                var category =
                    card.getAttribute("data-category") || "";

                var level =
                    card.getAttribute("data-level") || "";

                var text =
                    (
                        title +
                        " " +
                        category +
                        " " +
                        level
                    ).toLowerCase();


                if (text.indexOf(searchValue) !== -1) {

                    card.style.display = "";

                    visible++;

                } else {

                    card.style.display = "none";

                }

            }


            if (courseCount) {

                courseCount.textContent = visible;

            }

        });

    }


    /* OPEN EDIT */

    var editButtons =
        document.querySelectorAll(".edit-button");


    for (var i = 0; i < editButtons.length; i++) {

        editButtons[i].addEventListener(
            "click",
            function() {

                var button = this;

                var id =
                    button.getAttribute("data-id");

                var title =
                    button.getAttribute("data-title");

                var category =
                    button.getAttribute("data-category");

                var level =
                    button.getAttribute("data-level");

                var description =
                    button.getAttribute("data-description");

                var video =
                    button.getAttribute("data-video");

                var thumbnail =
                    button.getAttribute("data-thumbnail");


                editTitle.value = title || "";

                editCategory.value = category || "";

                editLevel.value = level || "";

                editDescription.value =
                    description || "";


                currentVideo.textContent =
                    video || "No video";

                currentThumbnail.textContent =
                    thumbnail || "No thumbnail";


                editForm.action =
                    "/admin/courses/edit/" + id;


                editModal.classList.add("show");

                document.body.style.overflow = "hidden";

            }
        );

    }


    /* CLOSE MODAL */

    function closeEditModal() {

        editModal.classList.remove("show");

        document.body.style.overflow = "";

    }


    if (closeModal) {

        closeModal.addEventListener(
            "click",
            closeEditModal
        );

    }


    if (cancelModal) {

        cancelModal.addEventListener(
            "click",
            closeEditModal
        );

    }


    if (modalBackdrop) {

        modalBackdrop.addEventListener(
            "click",
            closeEditModal
        );

    }


    document.addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Escape") {

                closeEditModal();

            }

        }
    );


    /* DELETE CONFIRMATION */

    var deleteForms =
        document.querySelectorAll(".delete-form");


    for (var j = 0; j < deleteForms.length; j++) {

        deleteForms[j].addEventListener(
            "submit",
            function(event) {

                var confirmed =
                    window.confirm(
                        "Are you sure you want to delete this course? This will permanently delete the course, video and thumbnail."
                    );


                if (!confirmed) {

                    event.preventDefault();

                }

            }
        );

    }


});