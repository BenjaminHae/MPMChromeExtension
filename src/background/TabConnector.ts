import SparseAccount from '../models/SparseAccount';

interface methods {
  setUserSession: (username: string, key: any) => void; 
  getBackendHost: () => string;
  logout: () => void; 
  getLoggedIn: () => boolean;
  getLatestAction: () => any;
  loadSettings: () => any;
  setActiveAccountWithoutUrl: (index: number) => void;
  reloadAccounts: () => void;
}
class TabConnector {
  private meth: methods;
  constructor (meth: methods) {
    this.meth = meth;
    this.openListener();
  }

  openManager(autoLogin: boolean = false) {
    let url = this.meth.getBackendHost();
    if (url !== "") {
      if (!autoLogin) {
        url += '?noAutoLogin';
      }
      chrome.tabs.create({url: url});
    }
  }

  validateSender(sender): boolean {
    if (sender["id"] !== chrome.runtime.id) {
      return false;
    }
    const host = this.meth.getBackendHost();
    const optionsUrl = "chrome-extension://" + chrome.runtime.id;
    if (!(sender["url"].startsWith(optionsUrl + "/") || sender["url"].startsWith(host + "/" ))) {
      return false;
    }
    else if (!(sender["origin"] === (host) || sender["origin"] === optionsUrl)) {
      return false;
    }
    return true;
  }

  openListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (!this.validateSender(sender)) {
        if (message["request"] == "hostMatches") {
          sendResponse({request: "hostMatches", data: { match: false }});
        }
        return;
      }
      if (message["origin"] !== this.meth.getBackendHost()) {
        console.log(`origin check failed, origin: ${message["origin"]} host: ${this.meth.getBackendHost()}`);
        return;
      }
      this.handleTabRequest(message["request"], message["data"], sendResponse);
    });
  }
  handleTabRequest(request: string, data: object, sendResponse) {
    switch(request){
      case "logout":  
        this.meth.logout(); 
        break;
      case "login":  
        sendResponse({"request":"host", "data":{"available":this.meth.getLoggedIn()}}); 
        break;
      case "action": 
        var action = this.meth.getLatestAction();
        sendResponse({"request":"action", "data": action});
        break;
      case "host": 
        sendResponse({"request":"host", "data":{"url":this.meth.getBackendHost()}}); 
        break;
      case "hostMatches":
        sendResponse({request: "hostMatches", data: { match: true }});
        break;
      case "reloadSettings": 
        this.meth.loadSettings(); 
        break;
      case "reloadAccounts": 
        this.meth.reloadAccounts(); 
        break;
      case "selectAccount": 
        this.meth.setActiveAccountWithoutUrl(data["index"]); 
        break;
    }
  }
  insertTextIntoSelectedInput(text: string, frameId: number = 0) {
    this.executeScript(function (text: string) {
        const input = document.activeElement as HTMLInputElement;
        input.value = text;
        input.dispatchEvent(new Event('change'));
        }, text, frameId);
  }
  async insertTextIntoAdjacentPassword(text: string, frameId: number = 0) {
    this.executeScript(function (text: string) {
        const selected = document.activeElement as HTMLInputElement;
        const form = selected.closest("form");
        const input = form.querySelectorAll("input[type=password]")[0] as HTMLInputElement;
        input.value = text;
        input.dispatchEvent(new Event('change'));
        }, text, frameId);
    return new Promise(resolve => setTimeout(resolve, 250));
  }
  async submitClosestForm(frameId: number = 0) {
    this.executeScript(function (text: string) {
        const selected = document.activeElement as HTMLInputElement;
        const form = selected.closest("form");
        const buttons = form.querySelectorAll("input[type=submit]");
        if (buttons.length > 0) {
          (buttons[0] as HTMLButtonElement).click();
        }
        else {
          //Hack to prevent issues with forms containing <input name="submit"
          //See https://stackoverflow.com/a/41846503/3592375
          const submitFormFunction = Object.getPrototypeOf(form).submit;
          submitFormFunction.call(form);
        }
      }, null, frameId);
  }
 
  executeScript(script, args, frameId: number = 0) {
    let payload = '(' + script + ')('+JSON.stringify(args)+');';
    chrome.tabs.executeScript({"code" : payload, "frameId" : frameId});
  }
}

export default TabConnector;
