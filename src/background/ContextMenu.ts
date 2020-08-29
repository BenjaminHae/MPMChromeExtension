import TabConnector from './TabConnector';
import AccountManager from './AccountManager';
import SparseAccount from '../models/SparseAccount';

class ContextMenu {
  private contextEntries: object = {};

  constructor (private tab: TabConnector, private backend: AccountManager) {
    this.setupContextMenu();
  }

  getAccountForURL(url: string): SparseAccount | undefined {
    return this.backend.getAccountForURL(url);
  }

  async insert(key: "username" | "password", url: string, frame:number = 0): Promise<SparseAccount | undefined>{
    let value: string;
    let account: SparseAccount | undefined;
    if (!this.backend.accountsLoaded()) {
      value = "Not signed in";
    }
    else {
      account = this.getAccountForURL(url);
      if (!account) {
        value = "No account found";
      }
      else {
        switch(key) {
          case "username": 
            value = account.username;
            break;
          case "password": 
            value = await this.backend.getPassword(account);
            break;
        }
      }
    }
    this.tab.insertTextIntoSelectedInput(value, frame);
    return account;
  }

  async insertCredentialsAndSignin(url: string, frame: number) {
    let account = await this.insert("username", url, frame);
    if (account) {
      const password = await this.backend.getPassword(account);
      await this.tab.insertTextIntoAdjacentPassword(password, frame);
      this.tab.submitClosestForm();
    }
  }

  setupContextMenu() {
    const menu = chrome.contextMenus.create( { "title": "Password-Manager", "contexts":["editable"], id: "pwmanroot" });
    const menuEntries = {
        "user": { title: "Insert Username", onclick: (info, tab) => this.insert("username", tab.url, info["frameId"]) },
        "password": { title: "Insert Password", onclick: (info, tab) => this.insert("password", tab.url, info["frameId"]) },
        "signin": { title: "Sign In", onclick: (info, tab) => this.insertCredentialsAndSignin(tab.url, info["frameId"]) }
      };
     
    for (let item in menuEntries) {
      this.contextEntries[item] = chrome.contextMenus.create(
        {
          "title": menuEntries[item].title,
          "parentId": menu,
          "contexts":["editable"], 
          id: item
        }
      );
    }
    chrome.contextMenus.onClicked.addListener((info, tab) => {
        menuEntries[info.menuItemId].onclick(info, tab); 
    }); 
  }
}

export default ContextMenu;
