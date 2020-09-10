window.addEventListener("message", receiveMessage, false);
console.log('webaccessible running');

function receiveMessage(event: MessageEvent) {
  console.log("received Message");
  console.log(event);
  if (event.data.to && (event.data.to === "page")) {
    window.parent.postMessage(event.data, '*');// todo: * durch host ersetzen
  }
  else {
    chrome.extension.getBackgroundPage().postMessage(event.data, "*");
  }
}
