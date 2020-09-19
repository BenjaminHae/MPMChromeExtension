import ExtensionConnector from './ExtensionConnector';
import IFrameConnector from './IFrameConnector';
import { ICredentialProvider } from '../backend/controller/credentialProvider';
import { Account } from '../backend/models/account';
import Action from '../models/Action';

interface IPluginSystem {
  backendLogin(credentialProvider: ICredentialProvider, username?: string): void;
  backendLogout(): void;
  registerPlugin(plugin: any): void;
  getAccountByIndex(index:number): Account;
  UIeditAccountSelect(account: Account): void;
  UIaddAccountSelect(proposals: {[index: string]:string}): void;
}

interface WindowWithPluginSystem { pluginSystem: IPluginSystem; }

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
      case "accountViewReady":
        let action: Action;
        if (action = await extensionConnector.getAction()) {
          console.log("sending action to plugin");
          console.log(action);
          sendEvent("action", action);
        }
        break;
      case "logout":
        extensionConnector.logout();
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
    private accountsLoaded: boolean = false;
    private action: Action;

    constructor(private pluginSystem: IPluginSystem) {
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
      this.accountsLoaded = true;
      if (this.actionsReceived) {
        this.performAction();
      }
      this.sendEvent("accountViewReady");
    }

    preLogout() {
      this.sendEvent("logout");
    }

    performAction() {
      switch (this.action.action) {
        case "logout": 
          this.pluginSystem.logout();
          break;
        case "edit": 
          let account: Account;
          if (account = this.pluginSystem.getAccountByIndex(this.action.data.index)) {
            console.log(`found account by id ${account.index}`);
            this.pluginSystem.UIeditAccountSelect(account);
          }
          else {
            console.log("did not find account by id");
            console.log(this.action);
          }
          break;
        case "add":
          this.pluginSystem.UIaddAccountSelect(this.action.data);
          break;
      }
    }

    setAction(action: Action) {
      this.action = action;
      this.actionsReceived = true;
      if (this.accountsLoaded) {
        this.performAction();
      }
    }

    doLogin(username: string, key: CryptoKey) {
      let credentials = {
        getKey: () => key,
        cleanUp: () => Promise.resolve()
      };
      this.pluginSystem.backendLogin(credentials);
    }
  }
  const pluginSystem = ((window as unknown) as WindowWithPluginSystem).pluginSystem
  const plugin = new BrowserExtensionPlugin(pluginSystem);
  pluginSystem.registerPlugin(plugin);
  document.addEventListener('MPMExtensionEventToPlugin', (e: CustomEvent) => {
      console.log(e);
      switch (e.detail.request) {
        case "session": 
          plugin.doLogin(e.detail.data.username, e.detail.data.key);
          break;
        case "action": 
          plugin.setAction(e.detail.data);
          break;
      }
    }, 
    false);
});

