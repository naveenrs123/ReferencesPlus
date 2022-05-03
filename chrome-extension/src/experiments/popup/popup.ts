function authenticate(): void {
  let username: HTMLElement = document.getElementById("username");
  window.open(`http:127.0.0.1:5000/auth/${username}`);
  chrome.storage.local.set({ username });
}

function toggleAuthView(): void {
  document.getElementById("pre-auth").classList.toggle("d-none");
  document.getElementById("post-auth").classList.toggle("d-none");
}

interface Authenticated {
  value: boolean;
  expiry: number;
}

window.addEventListener("DOMContentLoaded", function () {
  let rawAuth: string = localStorage.getItem("authenticated");
  let authenticated: Authenticated = rawAuth != null ? JSON.parse(rawAuth) : null;

  if (
    authenticated == null ||
    authenticated.value == false ||
    new Date().getTime() > authenticated.expiry
  ) {
    fetch("http:127.0.0.1:5000/authenticated")
      .then(function (response: any) {
        return response.json();
      })
      .then(function ({ authenticated }: { authenticated: boolean }) {
        if (authenticated) {
          let item = {
            value: authenticated,
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
});
