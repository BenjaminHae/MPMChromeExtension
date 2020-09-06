class ExtensionConnector {
  getActions() {
  }
  selectAccount(index: number) {
    this.sendMessageToExtensionWithoutResponse("selectAccount", {index: index});
  }
  logout() {
    this.sendMessageToExtensionWithoutResponse("logout");
  }
  async getHost():Promise<string> {
    let response = await this.sendMessageToExtension("host");
    return response.data["url"];
  }

  private sendMessageToExtension(request: string, message: {} = {}):Promise<{}> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({request: request, data: message, origin: window.location.origin}, (data) => resolve(data));
    });
  }
  private sendMessageToExtensionWithoutResponse(request: string, message: {} = {}):void {
    chrome.runtime.sendMessage({request: request, data: message, origin: window.location.origin});
  }
}

export default ExtensionConnector;
