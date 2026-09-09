const mobileMenuBtn =
    document.getElementById("mobileMenuBtn");

const mobileMenu =
    document.getElementById("mobileMenu");


if (mobileMenuBtn && mobileMenu) {

    mobileMenuBtn.addEventListener(
        "click",
        function() {

            mobileMenu.classList.toggle(
                "active"
            );

        }
    );

}