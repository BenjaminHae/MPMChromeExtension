interface PostMessageElement {
  request: string;
  data: object;
}

interface IFrameConnectorCallbacks {
  setSession(username: string, key: CryptoKey);
}

class IFrameConnector {
  iframe: HTMLIFrameElement;
  iframeHasLoaded: boolean = false;
  dataBuffer: Array<PostMessageElement> = [];
    
  constructor (private meth?: IFrameConnectorCallbacks) {
    this.iframe = this.createIFrame();
    window.addEventListener('message', (event) => this.receiveMessage(event), false);
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

  retreiveSession() {
    this.sendMessage("retreiveSession");
  }

  sendMessage(request: string, data?: any) {
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
  receiveMessage(event: MessageEvent): void {
    if (event.source !== this.iframe.contentWindow) {
      return
    }
    if (event.data.request === "session") {
      if (this.meth) {
        this.meth.setSession(event.data.data.username, event.data.data.key);
      }
    }
  }
}

export default IFrameConnector;
