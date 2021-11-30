function authenticate() {
    let username = document.getElementById("username");
    window.open(`http:127.0.0.1:5000/auth/${username}`);
    chrome.storage.local.set({ username });
}

function toggleAuthView() {
    document.getElementById("pre-auth").classList.toggle("d-none");
    document.getElementById("post-auth").classList.toggle("d-none");
}

window.addEventListener("DOMContentLoaded", function() {
    let rawAuth = localStorage.getItem("authenticated");
    let authenticated = rawAuth != null ? JSON.parse(rawAuth) : null;

    if (
        authenticated == null ||
        authenticated.value == false ||
        new Date().getTime() > authenticated.expiry
    ) {
        fetch("http:127.0.0.1:5000/authenticated")
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                if (data.authenticated) {
                    let item = {
                        value: data.authenticated,
                        expiry: new Date().getTime() + 900000,
                    };
                    localStorage.setItem("authenticated", JSON.stringify(item));
                    toggleAuthView();
                } else {
                    document.getElementById("auth").addEventListener("click", authenticate, false);
                }
            });
    } else {
        toggleAuthView();
    }
})