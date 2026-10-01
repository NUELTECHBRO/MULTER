document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar");
    const menuToggle = document.getElementById("menuToggle");
    const searchInput = document.getElementById("studentSearch");
    const clearSearch = document.getElementById("clearSearch");
    const rows = Array.from(document.querySelectorAll(".student-row"));
    const visibleCount = document.getElementById("visibleStudentCount");
    const noResults = document.getElementById("noSearchResults");

    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", () => sidebar.classList.toggle("open"));
    }

    if (searchInput && rows.length) {
        const filterStudents = () => {
            const query = searchInput.value.trim().toLocaleLowerCase();
            let visible = 0;

            rows.forEach((row) => {
                const matches = row.dataset.search.includes(query);
                row.hidden = !matches;
                if (matches) visible += 1;
            });

            visibleCount.textContent = visible.toLocaleString();
            noResults.hidden = visible > 0;
        };

        searchInput.addEventListener("input", filterStudents);
        clearSearch.addEventListener("click", () => {
            searchInput.value = "";
            filterStudents();
            searchInput.focus();
        });
    }

    document.querySelectorAll(".delete-student-form").forEach((form) => {
        form.addEventListener("submit", (event) => {
            const studentName = form.dataset.studentName || "this student";
            if (!window.confirm(`Delete ${studentName} and all their enrollments? This cannot be undone.`)) {
                event.preventDefault();
            }
        });
    });
});