import Action from '../models/Action';

class ExtensionConnector {
  credentialsPresent = false;
  credentialsPresentFetched = false;

  async getAction(): Promise<Action | undefined> {
    let response = await this.sendMessageToExtension("action");
    if (response.data)
      return response.data as Action
    return undefined;
  }
  selectAccount(index: number) {
    this.sendMessageToExtensionWithoutResponse("selectAccount", {index: index});
  }
  async requestLogin(): Promise<boolean> {
    if (!this.credentialsPresentFetched) {
      let response = await this.sendMessageToExtension("login");
      this.credentialsPresentFetched = true;
      this.credentialsPresent = response.data["available"];
    }
    return this.credentialsPresent;
  }
  logout() {
    this.sendMessageToExtensionWithoutResponse("logout");
  }
  reloadAccounts() {
    this.sendMessageToExtensionWithoutResponse("reloadAccounts");
  }
  async getHost():Promise<string> {
    let response = await this.sendMessageToExtension("host");
    return response.data["url"];
  }

  async getHostMatches():Promise<boolean> {
    let response = await this.sendMessageToExtension("hostMatches");
    return response.data["match"];
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
