import { convertMsToTime } from "../../common/helpers";
import { ButtonColor } from "../../common/interfaces";
import { getMainPlayer } from "../rrweb-utils";
import { MiniPlayerBtn } from "./util-components";

export function Comment(timestamp: number) {
  const timestampLabel = document.createElement("label") as HTMLLabelElement;
  timestampLabel.innerText = convertMsToTime(timestamp < 0 ? 0 : timestamp);
  timestampLabel.classList.add("mt-2", "Link--muted");
  timestampLabel.setAttribute("data-timestamp", (timestamp < 0 ? 0 : timestamp).toString());
  timestampLabel.addEventListener("click", (event: MouseEvent) => {
    const time = parseInt(timestampLabel.getAttribute("data-timestamp"));
    getMainPlayer().goto(time, false);
  });

  const commentTextArea = document.createElement("textarea") as HTMLTextAreaElement;
  commentTextArea.classList.add("m-2");
  commentTextArea.style.resize = "vertical";
  commentTextArea.style.width = "90%";

  const buttonsContainer = document.createElement("div") as HTMLDivElement;
  buttonsContainer.classList.add("d-flex", "flex-justify-center");

  const save = MiniPlayerBtn("Save", ButtonColor.Green);
  const del = MiniPlayerBtn("Delete", ButtonColor.Red);
  buttonsContainer.appendChild(save);
  buttonsContainer.appendChild(del);

  const container = document.createElement("div") as HTMLDivElement;
  container.classList.add(
    "d-flex",
    "mx-2",
    "flex-column",
    "flex-items-center",
    "color-shadow-small",
    "border",
    "refg-comment"
  );
  container.style.height = "250px";
  container.style.width = "150px";
  container.appendChild(timestampLabel);
  container.appendChild(commentTextArea);
  container.appendChild(buttonsContainer);

  return container;
}
