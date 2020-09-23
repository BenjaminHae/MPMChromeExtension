import ExtensionConnector from './ExtensionConnector';
import IFrameConnector from './IFrameConnector';
import { ICredentialProvider } from '../backend/controller/credentialProvider';
import { Account } from '../backend/models/account';
import Action from '../models/Action';

interface IBrowserExtensionPlugin {
  doLogin: (username: string, key: CryptoKey) => void;
  setAction: (action: Action) => void;
  setActive: () => void;
}

interface WindowWithPluginSystem { browserExtensionPlugin?: IBrowserExtensionPlugin; }

// todo: create on first request
let extensionConnector = new ExtensionConnector();

// listen to:
//   selectAccount

// Actions:
//   wrongHost?? Set Wrong host in content-script ?

function sendEvent(request: string, data?: object) {
  let evt = new CustomEvent('MPMExtensionEventToPlugin', {detail:{request: request, data: data}});
  document.dispatchEvent(evt);
}

//todo make one generic event with a random prefix. Handle specific type of event in data
document.addEventListener('MPMExtensionEventToContentScript', async (e: CustomEvent) => {
    switch (e.detail.request) {
      case "hostMatches":
        if (await extensionConnector.getHostMatches()) {
          sendEvent("hostMatches");
        }
        break;
      case "loginViewReady":
        if (await extensionConnector.requestLogin()) {
          let iframeConnector = new IFrameConnector({
            setSession: (username, key) => {
                sendEvent("session", {username: username, key: key});
                iframeConnector.removeIFrame();
              }
            });
          iframeConnector.retreiveSession();//todo add random identifier that is then sent back
        }
        break;
      case "loginSuccessful": 
        let iframeConnector = new IFrameConnector();
        iframeConnector.sendSession(e.detail.data);
        window.setTimeout(() => iframeConnector.removeIFrame(), 1000);
        break;
      case "accountViewReady":
        let action: Action;
        if (action = await extensionConnector.getAction()) {
          sendEvent("action", action);
        }
        break;
      case "selectAccount":
        extensionConnector.selectAccount(e.detail.data.index);
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
  const plugin = ((window as unknown) as WindowWithPluginSystem).browserExtensionPlugin
  // todo maybe check something else to find out whether this is the correct password manager instance (but this should also be checked in background)
  if (plugin) {
    document.addEventListener('MPMExtensionEventToPlugin', (e: CustomEvent) => {
        switch (e.detail.request) {
          case "hostMatches": 
            plugin.setActive();
            break;
          case "session": 
            plugin.doLogin(e.detail.data.username, e.detail.data.key);
            break;
          case "action": 
            plugin.setAction(e.detail.data);
            break;
        }
      }, 
      false);
    let evt = new CustomEvent('MPMExtensionEventToContentScript', {detail:{request: "hostMatches"}});
    document.dispatchEvent(evt);
  }
});

