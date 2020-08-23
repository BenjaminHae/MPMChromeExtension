import SparseAccount from '../models/SparseAccount';

interface methods {
  setUserSession: (username: string, key: any) => void; 
}
class IFrameConnector {
  private meth: methods;
  constructor (meth: methods) {
    this.meth = meth;
    this.openListener();
  }

  validateSender(sender): boolean {
    //ToDo
/*
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
*/
    return true;
  }

  openListener() {
    console.log("Adding IFrameListener");
    window.addEventListener('message',(event) => {
      if (!this.validateSender(event)) {
        console.log(`wrong host: ${event}`);
        return;
      }
      console.log("received message from iframe" );
      this.handleFrameRequest(event.data["request"], event.data["data"]);
    });
  }
  handleFrameRequest(request: string, data: object) {
    switch(request){
      case "session": 
        this.meth.setUserSession(data["username"], data["key"]); 
        break;
    }
  }
}

export default IFrameConnector;
