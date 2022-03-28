import { ButtonColor } from "../../common/interfaces";
import { PlayerBtn } from "./util-components";

export function UnsavedChangesModal(idx: number) {
  const heading = document.createElement("h3") as HTMLHeadingElement;
  heading.innerText = "You have unsaved changes!";

  const sub = document.createElement("p") as HTMLParagraphElement;
  sub.innerText = "Do you want to save them?";

  const textContainer = document.createElement("div") as HTMLDivElement;
  textContainer.classList.add("d-flex", "flex-column", "flex-justify-center", "flex-items-center");
  textContainer.appendChild(heading);
  textContainer.appendChild(sub);

  const ok = PlayerBtn("OK", ButtonColor.Green);
  ok.addEventListener("click", () => {
    const interfaceContainer = document.getElementById(`refg-interface-container-${idx}`);
    interfaceContainer.parentElement.removeChild(interfaceContainer);
  });
  const close = PlayerBtn("Close", ButtonColor.Red);
  close.addEventListener("click", () => {
    const interfaceContainer = document.getElementById(`refg-interface-container-${idx}`);
    interfaceContainer.parentElement.removeChild(interfaceContainer);
  });

  const buttonContainer = document.createElement("div") as HTMLDivElement;
  buttonContainer.classList.add("d-flex", "flex-justify-center");
  buttonContainer.appendChild(ok);
  buttonContainer.appendChild(close);

  const container = document.createElement("div") as HTMLDivElement;
  container.id = `refg-unsaved-changes-modal-${idx}`;
  container.classList.add(
    "p-4",
    "d-flex",
    "flex-column",
    "flex-justify-center",
    "flex-items-center",
    "position-absolute",
    "color-bg-overlay",
    "color-border-default"
  );

  container.style.top = "50%";
  container.style.left = "50%";
  container.style.transform = "translate(-50%, -50%)";
  container.appendChild(textContainer);
  container.appendChild(buttonContainer);

  return container;
}
