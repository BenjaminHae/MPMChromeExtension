import { Account } from '../backend/models/account';
import BackendGateway from './BackendGateway';
import SparseAccount from '../models/SparseAccount';

class AccountManager {
  activeAccountIndex?: number;
  activeAccountForced: boolean = false;

  constructor (private backend: BackendGateway) {
  }

  accountsLoaded() {
    return this.backend.accountsReady;
  }

  accountToSparseAccount(account: Account): SparseAccount {
    return { 
      name: account.name, 
      index: account.index, 
      active: this.getActiveAccountIndex() === account.index, 
      username: account.other["user"]
    }
  }

  getActiveAccountIndex(): number | undefined {
    return this.activeAccountIndex;
  }

  getAccountForURL(url: string): SparseAccount | undefined {
    return this.getAccountsForURL(url).find((account) => account.active);
  }

  getAccountsForURL(url: string): Array<SparseAccount> {
    if (!this.accountsLoaded()) {
      return []
    }
    let accounts: Array<SparseAccount> = [];
    let alreadySelected: number | undefined = undefined;
    if (this.activeAccountForced && this.activeAccountIndex) {
      accounts.push(this.accountToSparseAccount(this.backend.getAccountByIndex(this.activeAccountIndex)));
      accounts[0].active = true;
      alreadySelected = this.activeAccountIndex;
    }
    accounts = accounts.concat(
      // filter accounts for matching url
      this.backend.getAccounts().filter(
        (account) =>
        account.other["url"] && account.other["url"].trim() !== "" && url.startsWith(account.other["url"])
      )
      // remove account that is already selected by activeAccountIndex
      .filter(
        (account) =>
        account.index !== alreadySelected
      )
      .map(
        (account) =>
        this.accountToSparseAccount(account)
      ))
      .sort(
        (account1, account2) =>
        account1.index - account2.index
      );
    if (accounts.length > 0 && !accounts.find((account) => account.active)) {
      accounts[0].active = true;
    }
    return accounts;
  }

  getAccountByIndex(index: number) {
    return this.accountToSparseAccount(this.backend.getAccountByIndex(index));
  }

  async getPassword(account: SparseAccount): Promise<string> {
    this.resetSelectForced();
    return this.backend.getPassword(account.index);
  }

  selectAccount(id: number, force: boolean = false) {
    this.activeAccountIndex = id;
    this.activeAccountForced = force;
  }

  resetSelectForced() {
    this.activeAccountForced = false;
  }
}
export default AccountManager;
