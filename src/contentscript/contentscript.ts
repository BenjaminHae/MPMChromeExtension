const isThisContentscript = true;
console.log('isThisContentscript', isThisContentscript);

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

document.addEventListener('loginSuccessful', (e: CustomEvent) => {
    console.log(e);
    let iframe = document.createElement('iframe');
    iframe.setAttribute('src', chrome.extension.getURL('webaccessible/index.html'));
    document.body.appendChild(iframe);
    iframe.addEventListener("load", () => {
      console.log("sending key to iframe");
      iframe.contentWindow.postMessage({"request":"session", "data": e.detail}, "*");
      //iframe.parentNode.removeChild(iframe);
    })
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
  var wrongHost = false;
  var actionsReceived = false;

  class BrowserExtensionPlugin {
    actionsReceived: boolean = false;
    loginSuccessful(username: string, key: any): void {
      console.log("login Successful");
      let evt = new CustomEvent('loginSuccessful', {detail:{username: username, key: key}});
      document.dispatchEvent(evt);
    }
  }
  var plugin = new BrowserExtensionPlugin();
  window.pluginSystem.registerPlugin(new BrowserExtensionPlugin());
  document.addEventListener('actionsReceived', function(e) {
      actionsReceived = true;
      });
  });

