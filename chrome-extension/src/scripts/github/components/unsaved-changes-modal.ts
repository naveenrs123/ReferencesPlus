import { ButtonColor } from "../../common/interfaces";
import { PlayerBtn } from "./util-components";

export function UnsavedChangesModal() {
  const heading = document.createElement("h3") as HTMLHeadingElement;
  heading.innerText = "You have unsaved changes!";

  const sub = document.createElement("p") as HTMLParagraphElement;
  sub.innerText = "Do you want to save them?";

  const textContainer = document.createElement("div") as HTMLDivElement;
  textContainer.classList.add("d-flex", "flex-column", "flex-justify-center", "flex-items-center");
  textContainer.appendChild(heading);
  textContainer.appendChild(sub);

  const ok = PlayerBtn("OK", ButtonColor.Green);
  const close = PlayerBtn("Close", ButtonColor.Red);

  const buttonContainer = document.createElement("div") as HTMLDivElement;
  buttonContainer.classList.add("d-flex", "flex-justify-center");
  buttonContainer.appendChild(ok);
  buttonContainer.appendChild(close);

  const container = document.createElement("div") as HTMLDivElement;
  container.id = "refg-unsaved-changes-modal";
  container.classList.add(
    "d-flex",
    "flex-column",
    "flex-justify-center",
    "flex-items-center",
    "position-relative",
    "top-0",
    "left-0"
  );
  container.appendChild(textContainer);
  container.appendChild(buttonContainer);

  return container;
}
