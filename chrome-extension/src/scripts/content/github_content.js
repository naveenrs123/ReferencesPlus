import { rrwebPlayer } from "../external/rrwebPlayer.js";

function makeButton() {
  let detailsButton = document.querySelector("markdown-toolbar[for='new_comment_field'] details");
  let detailsParent = detailsButton.parentNode;

  let emulator = document.getElementById("refg-github-emulator");
  if (emulator != null) {
    detailsButton.removeChild(emulator);
  }
  emulator = document.createElement("details");
  emulator.id = "refg-github-emulator";
  emulator.classList.add("toolbar-item", "details-reset");

  let summary = document.createElement("summary");
  summary.innerHTML = "X <span class='dropdown-caret'></span>";

  let playerContainer = document.createElement("details-menu");
  playerContainer.id = "refg-github-emulator-container";
  playerContainer.classList.add("position-absolute", "color-bg-default", "mt-3");
  playerContainer.style.zIndex = "20000";
  playerContainer.setAttribute("role", "menu");

  let recordStart = document.createElement("button");
  recordStart.id = "record-page-start";
  recordStart.classList.add("m-2", "btn");
  recordStart.innerText = "Receive Recording";
  recordStart.addEventListener("click", () => {
    chrome.runtime.sendMessage({
      action: "[GITHUB] Ready to Receive",
      source: "github_content",
    });
  });

  let player = document.createElement("div");
  player.id = "refg-github-player";

  playerContainer.appendChild(recordStart);
  playerContainer.appendChild(player);

  emulator.appendChild(summary);
  emulator.appendChild(playerContainer);

  detailsParent.appendChild(emulator);
}

function makeButton2() {
  let detailsButton = document.querySelector("markdown-toolbar[for='new_comment_field'] details");
  let detailsParent = detailsButton.parentNode;

  let emulator = document.getElementById("refg-github-emulator");
  if (emulator != null) {
    detailsButton.removeChild(emulator);
  }
  emulator = document.createElement("details");
  emulator.id = "refg-github-emulator";
  emulator.classList.add("toolbar-item", "details-reset");

  let summary = document.createElement("summary");
  summary.innerHTML = "X <span class='dropdown-caret'></span>";

  let playerContainer = document.createElement("details-menu");
  playerContainer.id = "refg-github-emulator-container";
  playerContainer.classList.add("position-absolute", "color-bg-default", "mt-3");
  playerContainer.style.zIndex = "20000";
  playerContainer.setAttribute("role", "menu");

  let frame = document.createElement('iframe');
  frame.id = "refg-player-interface";
  frame.src = chrome.runtime.getURL("recordInterface.html");

  playerContainer.appendChild(frame);

  emulator.appendChild(summary);
  emulator.appendChild(playerContainer);

  detailsParent.appendChild(emulator);
}

chrome.runtime.onMessage.addListener((m, sender, sendResponse) => {
  console.log(m);
  if (m.action == "[GITHUB] Load Content" && m.source == "background") {
    console.log("Received: [GITHUB] Load Content from background.");
    makeButton2();
  } else if (m.action == "[GITHUB] Send Log" && m.source == "background") {
    let events = m.events;
    if (events && events.length > 2) {
      console.log(events);
    }
    new rrwebPlayer({
      target: document.getElementById("refg-player"),
      props: {
        events,
      },
    });
  }
});

/**
 * Function that allows an element to be dragged across a page.
 *
 * Taken from: https://www.w3schools.com/howto/howto_js_draggable.asp
 *
 * @param elmnt The element you want to make draggable.
 */
export function dragElement(elmnt) {
  var pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  if (document.getElementById(elmnt.id + "-header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "-header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = elmnt.offsetTop - pos2 + "px";
    elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
