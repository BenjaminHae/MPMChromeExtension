import SparseAccount from '../models/SparseAccount';
//todo
// context
//   contextEntries
// activeTab
//   insertTextIntoInput
// backgroundListener
//   listen to popup
//     hostUrl 
//     IsLoggedIn
//     GetAvailableAccounts (send URL retrieve accounts)
//     SelectAccount
//     SetAction (Edit/Add for normal webpage)
//     CopyPasswordToClipboard
//   listen to content
//     only when this is the url of password manager instance
//     receiveCrypto
//     Logout
//     FetchActions
//     setHost
//     Options
//     selectAccount

// hostCommunication
//   fetchAccounts using backend classes
//   getData from accounts

// listen to popup.js
chrome.runtime.onConnect.addListener(function(port) {
    console.log(port.name + " connected .....");
    // check origin
    if (port["sender"]["id"] != chrome.runtime.id) {
        return;
    }
    port.onMessage.addListener(function(msg) {
        var request = JSON.parse(msg);
        function sendPopupRequest(request, data) {
            port.postMessage(JSON.stringify({'request':request, 'data':data}));
        }
        switch(request["request"]){
            case "Host": 
                sendPopupRequest('Host', {'url':getHost()}); 
                break;
            case "LoggedIn": 
                var loggedIn = isLoggedIn();
                var data={'loggedIn':loggedIn};
                if (loggedIn){
                    data["username"] = getUsername();
                }
                else {
                    data["error"] = getLastError();
                }
                sendPopupRequest('LoggedIn',data); 
                break;
            case "AvailableAccounts": 
                var accounts = getAccountsForDomain(request["data"]["url"]);
                var send:Array<SparseAccount> = [];
                for (let item in accounts){
                    var account = accounts[item];
                    send.push(account);
                }
                sendPopupRequest('AvailableAccounts', {'accounts':send, 'url':request["data"]["url"]}); 
                break;
            case "setAccount":
                setActiveAccount(request["data"]["index"],request["data"]["url"]);
                break;
            case "setAction":
                setAction(request["data"]["action"], request["data"]["data"]);
                break;
            case "copyPassword":
                var account = getAccountByIndex(request["data"]["index"]);
                getPassword(account)
                    .then((password) => {
                        sendPopupRequest('copyPassword', {'text': password}); 
                    });
                break;
        }
    });
});
function isLoggedIn(): boolean {
  return true;
}
function getUsername(): string {
  return "testuser";
}
/*function convertBackendAccountToSparseAccount(account: any): SparseAccount {

}*/
function getAccountsForDomain(url: string): Array<SparseAccount> {
  return [{name:"Testaccount", index:8, active:true,username:"bla"}]
}
function getAccountByIndex(index: number): SparseAccount{
  return {name:"Testaccount", index:index, active:true,username:"bla"}
}
function setActiveAccount(index: number, url: string) {
}
function setAction(action: string, data: object){
}
function getPassword(account: SparseAccount): Promise<string>{
  return Promise.resolve("testpassword");
}
function getHost(): string {
  return "https://testhost.test"
}
function getLastError(): string {
  return "";
}
