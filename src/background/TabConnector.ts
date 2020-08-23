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
        var input = document.activeElement as HTMLInputElement;
        input.value = text;
        input.dispatchEvent(new Event('change'));
        }, text, frameId);
  }
  executeScript(script, args, frameId: number = 0) {
    let payload = '(' + script + ')('+JSON.stringify(args)+');';
    chrome.tabs.executeScript({"code" : payload, "frameId" : frameId});
  }
}

export default TabConnector;
