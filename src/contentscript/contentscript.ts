import ExtensionConnector from './ExtensionConnector';
import IFrameConnector from './IFrameConnector';

declare global {
  interface WindowWithPluginSystem { pluginSystem: any; }
}

let extensionConnector = new ExtensionConnector();

// listen to:
//   login done (fetch password)
//   Logout
//   selectAccount
//   fetchActionsFromPlugin (when first view is ready, actions are executed either immediately, or when login is performed)

// Actions:
//   login (sending key from plugin)
//   logout
//   edit (sending in account id)
//   addAccount (sending in account url)
//   wrongHost?? Set Wrong host in content-script ?
//   none (do nothing)
// actionsfinished at the end

// registered Events in MPM pluginSystem
// preDataReady -> receive actions from extension
// accountsReady -> retrieve secretkey for authenticating extension
// preLogout -> dologout in extension
// drawAccount -> add select in extension button

function sendEvent(request: string, data?: object) {
  let evt = new CustomEvent('MPMExtensionEventToPlugin', {detail:{request: request, data: data}});
  document.dispatchEvent(evt);
}

//todo make one generic event with a random prefix. Handle specific type of event in data
document.addEventListener('MPMExtensionEventToContentScript', async (e: CustomEvent) => {
    console.log(e);
    switch (e.detail.request) {
      case "loginSuccessful": 
        let iframeConnector = new IFrameConnector();
        iframeConnector.sendSession(e.detail.data);
        break;
      case "loginViewReady":
        if (await extensionConnector.requestLogin()) {
          let iframeConnector = new IFrameConnector({setSession: (username, key)=>{sendEvent("session", {username: username, key: key})}});
          iframeConnector.retreiveSession();//todo add random identifier that is then sent back
        }
        break;
    }
  }, 
  false
);

function executeScript(script, args = null) {
    let payload = '(' + script + ')('+JSON.stringify(args)+');';
    let executableScript = document.createElement('script');
    executableScript.textContent = payload;
    (document.head||document.documentElement).appendChild(executableScript);
    executableScript.remove();
}

executeScript(function() {
  //Todo validate if this is the password-manager
  let wrongHost = false;

  class BrowserExtensionPlugin {
    private actionsReceived: boolean = false;

    constructor() {
    }

    private sendEvent(request: string, data?: object) {
      let evt = new CustomEvent('MPMExtensionEventToContentScript', {detail:{request: request, data: data}});
      document.dispatchEvent(evt);
    }
    loginSuccessful(username: string, key: any): void {
      console.log("login Successful");
      this.sendEvent('loginSuccessful', {username: username, key: key});
    }

    loginViewReady() {
      console.log("login view ready");
      this.sendEvent('loginViewReady');
    }

    // this callback reacts to accounts in backend being ready
    // it is possibly necessary to react to the "account view" being ready
    accountsReady() {
        //perform actions
    }

    setAction(action: {}) {
    }

    doLogin(username: string, key: CryptoKey) {

    }
  }
  let plugin = new BrowserExtensionPlugin();
  ((window as unknown) as WindowWithPluginSystem).pluginSystem.registerPlugin(new BrowserExtensionPlugin());
  document.addEventListener('MPMExtensionEventToContentScript', async (e: CustomEvent) => {
    console.log(e);
    switch (e.detail.request) {
      case "session": 
        plugin.doLogin(e.detail.data.username, e.detail.data.key);
        break;
    }
  }, 
  false
);

