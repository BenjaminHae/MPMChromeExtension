import SparseAccount from '../models/SparseAccount';
import PopupConnector from './PopupConnector';
import TabConnector from './TabConnector';
import IFrameConnector from './IFrameConnector';
import BackendGateway from './BackendGateway';
import Settings from '../shared/Settings';
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
  constructor (private backend: BackendGateway) {
  }
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
    return this.backend.getAccountsForDomain(url);
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
  async setUserSession(username: string, key: any): Promise<void> {
    await this.backend.setUserSession(username, key);
    return
  }
  logout(): void {
  }
  loadSettings(): void {
  }
}

let backend: BackendGateway;
let popup: PopupConnector;
let tab: TabConnector;
let iframe: IFrameConnector;

let settings = new Settings();
settings.load()
  .then(() => {
      backend = new BackendGateway(settings.host);
      popup = new PopupConnector(new DummyMethods(backend));
      tab = new TabConnector(new DummyMethods(backend));
      iframe = new IFrameConnector(backend);
    });
  /*function convertBackendAccountToSparseAccount(account: any): SparseAccount {


  }*/
