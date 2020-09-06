import ExtensionConnector from './ExtensionConnector';
import IFrameConnector from './IFrameConnector';

interface Window { pluginSystem: any; }

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

//todo make one generic event with a random prefix. Handle specific type of event in data
document.addEventListener('loginSuccessful', (e: CustomEvent) => {
    console.log(e);
    let iframeConnector = new IFrameConnector();
    iframeConnector.sendSession("session", e.detail);
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
    actionsReceived: boolean = false;
    loginSuccessful(username: string, key: any): void {
      console.log("login Successful");
      let evt = new CustomEvent('loginSuccessful', {detail:{username: username, key: key}});
      document.dispatchEvent(evt);
    }

    // this callback reacts to accounts in backend being ready
    // it is possibly necessary to react to the "account view" being ready
    accountsReady() {
        //perform actions
    }

    setAction(action: {}) {
    }
  }
  let plugin = new BrowserExtensionPlugin();
  window.pluginSystem.registerPlugin(new BrowserExtensionPlugin());
  document.addEventListener('actionsReceived', (e: CustomEvent) => {
      plugin.setAction(e.detail);
      plugin.actionsReceived = true;
      });
  });

