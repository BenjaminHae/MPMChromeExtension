import SparseAccount from '../models/SparseAccount';

interface methods {
  getBackendHost: () => string;
  getLoggedIn: () => boolean;
  getUsername: () => string;
  getLastError: () => string;
  getAccountsForDomain: (url: string) => Array<SparseAccount>;
  setActiveAccount: (index: number, url: string) => void;
  getPasswordByAccountIndex: (index: number) => Promise<string>;
  setAction: (action: string, data: object) => void;
}
class PopupConnector {
  private meth: methods;
  constructor (meth: methods) {
    this.meth = meth;
    this.openListener();
  }

  openListener() {
    chrome.runtime.onConnect.addListener((port) => {
      console.log(port.name + " connected .....");
      // check origin
      if (port["sender"]["id"] != chrome.runtime.id) {
        console.log(port.name + " connection with wrong id: " + port["sender"]["id"]);
        return;
      }
      port.onMessage.addListener((msg) => {
        var request = JSON.parse(msg);
        this.handlePopupRequest(port, request["request"], request["data"]);
      });
    });
  }
  sendPopupRequest(port: any, request, data) {
    port.postMessage(JSON.stringify({'request':request, 'data':data}));
  }
  handlePopupRequest(port: any, request: string, data: object) {
    switch(request){
      case "Host": 
        this.sendPopupRequest(port, 'Host', {'url':this.meth.getBackendHost()}); 
        break;
      case "LoggedIn": 
        var loggedIn = this.meth.getLoggedIn();
        var returnData={'loggedIn': loggedIn};
        if (loggedIn){
          returnData["username"] = this.meth.getUsername();
        }
        else {
          returnData["error"] = this.meth.getLastError();
        }
        this.sendPopupRequest(port, 'LoggedIn', returnData); 
        break;
      case "AvailableAccounts": 
        var accounts = this.meth.getAccountsForDomain(data["url"]);
        var send:Array<SparseAccount> = [];
        for (let item in accounts){
          var account = accounts[item];
          send.push(account);
        }
        this.sendPopupRequest(port, 'AvailableAccounts', {'accounts':send, 'url':data["url"]}); 
        break;
      case "setAccount":
        this.meth.setActiveAccount(data["index"],data["url"]);
        break;
      case "setAction":
        this.meth.setAction(data["action"], data["data"]);
        break;
      case "copyPassword":
        this.meth.getPasswordByAccountIndex(data["index"])
          .then((password) => {
              this.sendPopupRequest(port, 'copyPassword', {'text': password}); 
              });
        break;
    }
  }
}

export default PopupConnector;
