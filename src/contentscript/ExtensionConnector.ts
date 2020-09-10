interface ExtensionConnectorCallbacks {
  addAccount(proposals: {[index: string]:string}): void;
  editAccount(index: number): void;
}
class ExtensionConnector {

  constructor () {
  }
  getActions() {
  }
  selectAccount(index: number) {
    this.sendMessageToExtensionWithoutResponse("selectAccount", {index: index});
  }
  requestLogin(): boolean {
    let response = await this.sendMessageToExtension("login");
    return response.data["available"];
  }
  logout() {
    this.sendMessageToExtensionWithoutResponse("logout");
  }
  async getHost():Promise<string> {
    let response = await this.sendMessageToExtension("host");
    return response.data["url"];
  }

  private sendMessageToExtension(request: string, message: {} = {}):Promise<any> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({request: request, data: message, origin: window.location.origin}, (data) => resolve(data));
    });
  }
  private sendMessageToExtensionWithoutResponse(request: string, message: {} = {}):void {
    chrome.runtime.sendMessage({request: request, data: message, origin: window.location.origin});
  }
}

export default ExtensionConnector;
