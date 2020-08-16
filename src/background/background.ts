import SparseAccount from '../models/SparseAccount';
import PopupConnector from './PopupConnector';
import TabConnector from './TabConnector';
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

class DummyMethods {
  getBackendHost(): string {
    return "https://testhost.test"
  }
  getLoggedIn(): boolean {
    return true;
  }
  getUsername(): string {
    return "testuser";
  }
  getAccountsForDomain(url: string): Array<SparseAccount> {
    return [{name:"Testaccount", index:8, active:true,username:"bla"}]
  }
  getAccountByIndex(index: number): SparseAccount {
    return {name:"Testaccount", index:index, active:true,username:"bla"}
  }
  getPasswordByAccountIndex(index: number): Promise<string> {
    return Promise.resolve("testpassword");
  }
  getLastError(): string {
    return "";
  }
  getLatestAction(): object {
    return {request: "hi"}
  }
  setActiveAccount(index: number, url: string): void {
  }
  setActiveAccountWithoutUrl(index: number): void {
  }
  setAction(action: string, data: object): void {
  }
  setUserSession(data:any): void {
  }
  logout(): void {
  }
  loadSettings(): void {
  }
}

let popup = new PopupConnector(new DummyMethods());
let tab = new TabConnector(new DummyMethods());

  /*function convertBackendAccountToSparseAccount(account: any): SparseAccount {

  }*/
