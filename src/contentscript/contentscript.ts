const isThisContentscript = true;
console.log('isThisContentscript', isThisContentscript);

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
