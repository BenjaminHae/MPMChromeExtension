import { Account } from '../backend/models/account';
import BackendGateway from './BackendGateway';
import SparseAccount from '../models/SparseAccount';

class AccountManager {

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
      username: account.other["username"]
    }
  }

  getActiveAccountIndex(): number {
    // todo
    return -1;
  }

  getAccountForURL(url: string): SparseAccount | null {
    return undefined;
  }

  getAccountsForURL(url: string): Array<SparseAccount> {
    if (!this.accountsLoaded()) {
      return []
    }
    return this.backend.getAccounts().filter(
        (account) =>
        account.other["url"].startsWith(url)
      )
      .map(
        (account) =>
        this.accountToSparseAccount(account)
      );
  }

  async getPassword(account: SparseAccount): Promise<string> {
    return this.backend.getPassword(account.index);
  }

}
export default AccountManager;
