import SparseAccount from '../models/SparseAccount';
import PopupConnector from './PopupConnector';
import TabConnector from './TabConnector';
import IFrameConnector from './IFrameConnector';
import BackendGateway from './BackendGateway';
import AccountManager from './AccountManager';
import ContextMenu from './ContextMenu';
import Settings from '../shared/Settings';
import Action from '../models/Action';
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
  private tabs?: TabConnector;
  private action?: Action;

  constructor (private backend: BackendGateway, private accounts: AccountManager, private settings: Settings) {
  }
  setTabs(tabs: TabConnector) {
    this.tabs = tabs;
  }
  getBackendHost(): string {
    return this.settings.settings.host;
  }
  getLoggedIn(): boolean {
    return this.backend.authenticated;
  }
  getUsername(): string {
    return this.backend.username;
  }
  getAccountsForDomain(url: string): Array<SparseAccount> {
    return this.accounts.getAccountsForURL(url);
  }
  getAccountByIndex(index: number): SparseAccount {
    return this.accounts.getAccountByIndex(index);
  }
  getPasswordByAccountIndex(index: number): Promise<string> {
    return this.backend.getPassword(index);
  }
  getLastError(): string {
    return "";
  }
  getLatestAction(): Action {
    let action = this.action;
    this.action = undefined;
    return action;
  }
  setActiveAccount(index: number, url: string): void {
    //Todo filter for url
    this.accounts.selectAccount(index);
  }
  setActiveAccountWithoutUrl(index: number): void {
    this.accounts.selectAccount(index, true);
  }
  setAction(action: Action): void {
    this.action = action;
  }
  async setUserSession(username: string, key: any): Promise<void> {
    await this.backend.setUserSession(username, key);
  }
  getUserSession(): {username: string, key:any} {
    return this.backend.getUserSession();
  }
  async logout(): Promise<void> {
    await this.backend.logout();
  }
  logoutPage(): void {
    this.action = { action: "logout", data: {} };
    this.openManager();
  }
  loadSettings(): void {
    console.log("reloading settings");
    settings.load();
  }
  openManager(): void {
    this.tabs.openManager();
  }
}

let settings = new Settings();
let backend = new BackendGateway("");
backend.authenticationObservable
  .subscribe((authenticated: boolean) => {
      let icon = authenticated ? "assets/iconLoggedIn.png" : "assets/iconLoggedOut.png";
      chrome.browserAction.setIcon({ path: icon });
    });
let accountManager = new AccountManager(backend);
let dummyMethods = new DummyMethods(backend, accountManager, settings)
let popup = new PopupConnector(dummyMethods);
let tab = new TabConnector(dummyMethods);
dummyMethods.setTabs(tab);
let iframe = new IFrameConnector(backend);
let contextMenu = new ContextMenu(tab, accountManager);
settings.settingsObservable
  .subscribe((settings) => {
      backend.setHost(settings.host);
    });
settings.load();
  /*function convertBackendAccountToSparseAccount(account: any): SparseAccount {


  }*/
