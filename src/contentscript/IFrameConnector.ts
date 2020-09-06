interface PostMessageElement {
  request: string;
  data: {};
}
class IFrameConnector {
  iframe: HTMLIFrameElement;
  iframeHasLoaded: boolean = false;
  dataBuffer: Array<PostMessageElement> = [];
    
  constructor () {
    this.iframe = this.createIFrame();
  }

  createIFrame(): HTMLIFrameElement {
    let iframe = document.createElement('iframe') as HTMLIFrameElement;
    iframe.setAttribute('src', chrome.extension.getURL('webaccessible/index.html'));
    document.body.appendChild(iframe);
    iframe.addEventListener("load", () => {
      this.iframeHasLoaded = true;
      console.log("sending key to iframe");
      this.sendDataToIFrame();
    });
    return iframe;
  }
  removeIFrame() {
    this.iframe.parentNode.removeChild(this.iframe);
  }

  sendSession(session: any) {
    this.sendMessage("session", session);
  }

  sendMessage(request: string, data: any) {
    this.dataBuffer.push({request: request, data: data});
    this.sendDataToIFrame();
  }

  sendDataToIFrame(): boolean {
    if (this.iframeHasLoaded !== true ) {
      return false;
    }
    let element: PostMessageElement;
    while (element = this.dataBuffer.shift()) {
      this.iframe.contentWindow.postMessage(element, "*");
    }
    return true;
  }
}

export default IFrameConnector;
