export default function CreateHTMLElement<T = HTMLElement>(elementType, attributes: { [key: string] : string }, textContent?: string): T {
  let element = document.createElement(elementType);
  for (let key in attributes) {
    element.setAttribute(key, attributes[key]); 
  }
  if (textContent) {
    element.textContent = textContent; 
  }
  return element;
}
