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

  getActiveAccountIndex(): number {
    return this.activeAccountIndex;
  }

  getAccountForURL(url: string): SparseAccount | null {
    for (let acc of this.getAccountsForURL(url)) {
      if (acc.active) {
        return acc;
      }
    }
    return null;
  }

  getAccountsForURL(url: string): Array<SparseAccount> {
    if (!this.accountsLoaded()) {
      return []
    }
    let accounts: Array<SparseAccount> = [];
    if (this.activeAccountForced && this.activeAccountIndex) {
      accounts.push(this.accountToSparseAccount(this.backend.getAccountByIndex(this.activeAccountIndex)));
    }
    accounts = accounts.concat(this.backend.getAccounts().filter(
        (account) =>
        account.other["url"].startsWith(url)
      )
      .map(
        (account) =>
        this.accountToSparseAccount(account)
      ));
    if (!accounts.find((account) => account.active)) {
      accounts[0].active = true;
    }
    return accounts;
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