import SparseAccount from '../models/SparseAccount';

interface methods {
  setUserSession: (username: string, key: any) => void; 
  getBackendHost: () => string;
  logout: () => void; 
  getLatestAction: () => any;
  loadSettings: () => any;
  setActiveAccountWithoutUrl: (index: number) => void;
}
class TabConnector {
  private meth: methods;
  constructor (meth: methods) {
    this.meth = meth;
    this.openListener();
  }

  openManager() {
    const host = this.meth.getBackendHost();
    chrome.tabs.create({url: host});
  }

  validateSender(sender): boolean {
    if (sender["id"] === chrome.runtime.id) {
      return true;
    }
    else if (sender["url"].startsWith("chrome-extension://" + chrome.runtime.id + '/')){
      return true;
    }
    else if (sender["url"] === this.meth.getBackendHost() + "password.php") {
      return true;
    }
    return false;
  }

  openListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (!this.validateSender(sender)) {
        console.log("wrong host");
        if (message["request"] == "actions") {
          let action = {"request": "wrongHost"};
          sendResponse(action);
        }
        return;
      }
      console.log(sender + " connected .....");
      this.handleTabRequest(message["request"], message["data"], sendResponse);
    });
  }
  handleTabRequest(request: string, data: object, sendResponse) {
    switch(request){
      case "session": 
        this.meth.setUserSession(data["username"], data["key"]); 
        break;
      case "logout":  
        this.meth.logout(); 
        break;
      case "actions": var action = this.meth.getLatestAction();
                      if (action == null)
                        action = {request: "none"};
                      sendResponse(action);
                      break;
      case "host": sendResponse({"request":"host", "data":{"url":this.meth.getBackendHost()}}); break;
      case "reloadSettings": this.meth.loadSettings(); break;
      case "selectAccount": this.meth.setActiveAccountWithoutUrl(data["index"]); break;
    }
  }
  insertTextIntoSelectedInput(text: string, frameId: number = 0) {
    this.executeScript(function (text) {
        const input = document.activeElement as HTMLInputElement;
        input.value = text;
        input.dispatchEvent(new Event('change'));
        }, text, frameId);
  }
  async insertTextIntoAdjacentPassword(text: string, frameId: number = 0) {
    this.executeScript(function (text) {
        const selected = document.activeElement as HTMLInputElement;
        const form = selected.closest("form");
        const input = form.querySelectorAll("input[type=password]")[0] as HTMLInputElement;
        input.value = text;
        input.dispatchEvent(new Event('change'));
        }, text, frameId);
    return new Promise(resolve => setTimeout(resolve, 250));
  }
  async submitClosestForm(frameId: number = 0) {
    this.executeScript(function (text) {
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
