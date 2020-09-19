import Action from '../models/Action';

class ExtensionConnector {

  constructor () {
  }
  async getAction(): Promise<Action | undefined> {
    let response = await this.sendMessageToExtension("action");
    console.log(response);
    if (response.data)
      return response.data as Action
    return undefined;
  }
  selectAccount(index: number) {
    this.sendMessageToExtensionWithoutResponse("selectAccount", {index: index});
  }
  async requestLogin(): Promise<boolean> {
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
