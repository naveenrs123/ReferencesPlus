import * as h from "../../common/helpers";
import g from "../../common/globals";
import { IDictionary } from "../../common/interfaces";

export function activateDOMChangeForm(): void {
  let oldDOMChangeForm: HTMLElement = document.getElementById("refg-dom-form");
  if (oldDOMChangeForm) g.body.removeChild(oldDOMChangeForm);

  g.DOMFormInfo.node = g.hoverInfo.node;
  g.DOMFormInfo.posX = g.hoverInfo.posX;
  g.DOMFormInfo.posY = g.hoverInfo.posY;

  let DOMChangeForm: HTMLDivElement = createDOMChangeInterface();
  g.body.appendChild(DOMChangeForm);
  g.DOMFormOpen = true;
}

function createDOMChangeInterface(): HTMLDivElement {
  let container: HTMLDivElement = document.createElement("div");
  container.id = "refg-dom-form";
  container.style.backgroundColor = "#FFF";
  container.style.color = "#000";

  let title: HTMLHeadingElement = document.createElement("h3");
  title.textContent = "DOM Change Form";
  title.style.marginBottom = "15px";
  title.style.color = "#4461EE";

  let form: HTMLFormElement = createDOMChangeForm();

  let style: CSSStyleDeclaration = getComputedStyle(g.DOMFormInfo.node);
  let docElem: HTMLElement = document.documentElement;
  let width: number = style?.position == "fixed" ? docElem.clientWidth : docElem.scrollWidth;
  let posX: number = h.shiftPosition(g.DOMFormInfo.posX, 300, width);
  let height: number = style?.position == "fixed" ? docElem.clientHeight : docElem.scrollHeight;
  let posY: number = h.shiftPosition(g.DOMFormInfo.posY, 300, height);

  let sheet: CSSStyleSheet = document.styleSheets[0];
  let refgDomFormRules: string = `#refg-dom-form { width: fit-content; max-width: 400px; max-height: 500px; overflow-y: auto; background-color: #FFF; color: #000; border-radius: 10px; border: 3px solid #000; position: absolute; top: ${posY}px; left: ${posX}px; padding: 15px; z-index: 200000; font-size: 12pt; }`;

  sheet.insertRule(refgDomFormRules, sheet.cssRules.length);

  container.appendChild(title);
  container.appendChild(form);

  return container;
}

function createDOMChangeForm(): HTMLFormElement {
  let form: HTMLFormElement = document.createElement("form");
  form.style.display = "flex";
  form.style.flexDirection = "column";

  let label: HTMLLabelElement = document.createElement("label");
  label.setAttribute("for", "dom-element-selector");
  label.style.fontSize = "18px";
  label.textContent = "CSS Query Selector";

  let text: HTMLInputElement = document.createElement("input");
  text.placeholder = "Blank for current element.";
  text.id = "dom-element-selector";
  text.value = "";
  text.style.marginBottom = "10px";

  let subtitle: HTMLLabelElement = document.createElement("label");
  subtitle.style.fontSize = "18px";
  subtitle.setAttribute("for", "dom-change-text");
  subtitle.textContent = "Enter properties in JSON Format";

  let textarea: HTMLTextAreaElement = document.createElement("textarea");
  textarea.id = "dom-change-text";
  textarea.textContent = '{\n"property": "value"\n}';
  textarea.style.marginBottom = "15px";

  let submit: HTMLInputElement = document.createElement("input");
  submit.type = "submit";
  submit.value = "Submit";
  form.addEventListener("submit", onSubmitDOMChange);

  form.appendChild(label);
  form.appendChild(text);
  form.appendChild(subtitle);
  form.appendChild(textarea);
  form.appendChild(submit);

  return form;
}

function onSubmitDOMChange(event: SubmitEvent) {
  event.preventDefault();
  let textarea: HTMLTextAreaElement = document.getElementById(
    "dom-change-text"
  ) as HTMLTextAreaElement;
  let text: HTMLInputElement = document.getElementById("dom-element-selector") as HTMLInputElement;
  let elem: HTMLElement;
  let cssProperties: IDictionary<any> = {};

  try {
    cssProperties: Object = JSON.parse(textarea.value.replace(/\n/g, ""));
    let elementQuery: string = text.value;
    elem = elementQuery != "" ? document.querySelector(elementQuery) : g.DOMFormInfo.node;

    let propertyString: string = "Changed Properties: ";
    
    for (let property in cssProperties) {
      elem.style.setProperty(property, cssProperties[property]);
      if (g.recordingState) {
        propertyString += `${property} : ${cssProperties[property]};`;
      }
    }

    if (g.recordingState) {
      let timeStamp: number = (Date.now() - g.start) / 1000;
      let node: HTMLElement = g.hoverInfo.node;
      let hoverNodeHTML: string = node.innerHTML.trim();
      let innerHTML: string =
        hoverNodeHTML.length > 100 ? hoverNodeHTML.slice(0, 100) : hoverNodeHTML;
      let log: string =
        timeStamp +
        "s - Changed DOM for: " +
        node.nodeName +
        ", parent: " +
        node.parentNode.nodeName +
        ", id: " +
        node.id +
        ", innerHTML: " +
        innerHTML +
        "\n" +
        propertyString +
        "\n";
      g.logs.push(log);
    }
  } catch (error: any) {
    let errorText: string = "An error occurred.";
    if (elem == null) {
      errorText = "Invalid CSS selector query.";
    } else if (cssProperties == null) {
      errorText = `Invalid JSON syntax provided\n${textarea.value.replace(/\n/g, "")}`;
    }
    alert(errorText);
  }
}
