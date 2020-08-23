window.addEventListener("message", receiveMessage, false);
console.log('webaccessible running');

function receiveMessage(event) {
  console.log("received Message");
  console.log(event);
  chrome.extension.getBackgroundPage().postMessage(event.data, "*");
}
