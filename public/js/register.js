// Password Visibility
// --------------------------------

function setupPasswordToggle(
    inputId,
    buttonId
) {

    const input =
        document.getElementById(inputId);

    const button =
        document.getElementById(buttonId);

    if (!input || !button) return;

    button.addEventListener("click", () => {

        const isPassword =
            input.type === "password";

        input.type =
            isPassword ?
            "text" :
            "password";

        button.setAttribute(
            "aria-label",
            isPassword ?
            "Hide password" :
            "Show password"
        );

    });

}


setupPasswordToggle(
    "password",
    "passwordToggle"
);


setupPasswordToggle(
    "confirmPassword",
    "confirmPasswordToggle"
);


// --------------------------------
// Password Strength
// --------------------------------

const password =
    document.getElementById("password");

const strengthText =
    document.getElementById("strengthText");

const strengthBars =
    document.querySelectorAll(
        ".strength-bars span"
    );


password.addEventListener("input", () => {

    const value = password.value;

    let strength = 0;


    if (value.length >= 6) {
        strength++;
    }

    if (value.length >= 8) {
        strength++;
    }

    if (/[A-Z]/.test(value)) {
        strength++;
    }

    if (/[0-9]/.test(value)) {
        strength++;
    }


    strengthBars.forEach(
        (bar, index) => {

            bar.classList.toggle(
                "active",
                index < strength
            );

        }
    );


    if (value.length === 0) {

        strengthText.textContent =
            "Enter a password";

        strengthText.className =
            "strength-text";

    } else if (strength <= 1) {

        strengthText.textContent =
            "Weak password";

        strengthText.className =
            "strength-text weak";

    } else if (strength <= 2) {

        strengthText.textContent =
            "Fair password";

        strengthText.className =
            "strength-text fair";

    } else if (strength === 3) {

        strengthText.textContent =
            "Good password";

        strengthText.className =
            "strength-text good";

    } else {

        strengthText.textContent =
            "Strong password";

        strengthText.className =
            "strength-text strong";

    }

});


// --------------------------------
// Password Match
// --------------------------------

const confirmPassword =
    document.getElementById(
        "confirmPassword"
    );

const passwordMatch =
    document.getElementById(
        "passwordMatch"
    );


confirmPassword.addEventListener(
    "input",
    () => {

        if (!confirmPassword.value) {

            passwordMatch.textContent = "";

            passwordMatch.className =
                "password-match";

            return;

        }


        if (
            password.value ===
            confirmPassword.value
        ) {

            passwordMatch.textContent =
                "✓ Passwords match";

            passwordMatch.className =
                "password-match match";

        } else {

            passwordMatch.textContent =
                "Passwords do not match";

            passwordMatch.className =
                "password-match no-match";

        }

    }
);


// --------------------------------
// Form Validation
// --------------------------------

const form =
    document.getElementById(
        "registerForm"
    );


form.addEventListener(
    "submit",
    (event) => {

        if (
            password.value !==
            confirmPassword.value
        ) {

            event.preventDefault();

            confirmPassword.focus();

            passwordMatch.textContent =
                "Passwords do not match";

            passwordMatch.className =
                "password-match no-match";

            return;

        }


        if (password.value.length < 6) {

            event.preventDefault();

            password.focus();

            return;

        }

    }
);