let border;
let timeout = null;

function createFrame() {
  let entryPoint = document.getElementById("main");

  let fragment = document.createDocumentFragment();
  let miniForm = document.createElement("div");

  let input = document.createElement("input");
  input.type = "text";
  input.placeholder = "www.google.com";

  let button = document.createElement("button");
  button.innerText = "Load URL";

  let frame = document.createElement("iframe");
  frame.height = "700";
  frame.width = "1200";

  miniForm.appendChild(input);
  miniForm.appendChild(button);

  fragment.appendChild(miniForm);
  fragment.appendChild(frame);

  entryPoint.appendChild(fragment);

  button.addEventListener("click", () => {
    frame.src = input.value;
  });
}

function createEmulatorButtons() {
  let entryPoint = document.querySelector("body");

  let container = document.createElement("div");
  container.id = "emulator-buttons";
  container.style.display = "flex";

  let sheet = document.styleSheets[0];
  let rules = "#emulator-buttons { flex-direction: row; position: fixed; top: 20px; left: 20px; z-index: 20000; }"
  sheet.insertRule(rules, sheet.cssRules.length);

  let btn1 = document.createElement('button');
  btn1.innerText = "Enable Borders";

  container.appendChild(btn1);
  entryPoint.insertBefore(container, entryPoint.childNodes[0]);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "initial load" && message.tab.url.includes("127.0.0.1")) {
    createFrame();
  }

  if (message.action === "toggle emulation") {
    let container = document.getElementById("emulator-buttons");
    if (!container) {
      createEmulatorButtons();
    } else if (container.style.display === "flex") {
      container.style.display = "none";
    } else {
      container.style.display = "flex"
    }
  }
  sendResponse("Response!");
});

const onMouseEnter = (event) => {
  timeout = setTimeout(() => {
    border = event.target.style.border;
    event.target.style.border = "5px solid pink";
  }, 250);
};

const onMouseLeave = (event) => {
  clearTimeout(timeout);
  event.target.style.border = border;
};

if (window.location !== window.parent.location) {
  window.addEventListener("mouseover", onMouseEnter);
  window.addEventListener("mouseout", onMouseLeave);
}