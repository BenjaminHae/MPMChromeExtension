import { BackendService } from '../backend/backend.service';
import { CredentialProviderUndefined } from '../backend/controller/credentialProviderUndefined';
import { CSRFMiddleware } from '../backend/api/CSRFMiddleware';
import { MaintenanceService, BackendOptions } from '../backend/api/maintenance.service';
import { UserService, ILogonInformation } from '../backend/api/user.service';
import { AccountsService } from '../backend/api/accounts.service';
import { AccountTransformerService } from '../backend/controller/account-transformer.service';
import { CredentialService } from '../backend/credential.service';
import { CryptoService } from '../backend/crypto.service';
import { Account } from '../backend/models/account';
import { Configuration as OpenAPIConfiguration } from '@pm-server/pm-server-react-client';
import { MaintenanceApi as OpenAPIMaintenanceService } from '@pm-server/pm-server-react-client';
import { UserApi as OpenAPIUserService } from '@pm-server/pm-server-react-client';
import { AccountsApi as OpenAPIAccountsService } from '@pm-server/pm-server-react-client';
import SparseAccount from '../models/SparseAccount';
import { Observable, Subscriber, TeardownLogic } from 'rxjs';

class KeyCredentialProvider {
  key?: CryptoKey;
  constructor (key: CryptoKey) {
    this.key = key;
  }
  getKey(): CryptoKey {
    if (this.key) {
      return this.key;
    }
    throw new Error("Key is not present");
  }

  cleanUp(): Promise<void> {
    this.key = undefined;
    return Promise.resolve();
  }
}
function subscriptionCreator<T>(list: Array<Subscriber<T>>): (s: Subscriber<T>) => TeardownLogic {
    return (observer: Subscriber<T>) => {
      list.push(observer);
      return {
        unsubscribe() {
          list.splice(list.indexOf(observer), 1);
        }
      }
    };
}
function subscriptionExecutor<T>(list: Array<Subscriber<T>>, params?:T) {
  list.forEach(obs => obs.next(params));
}

class BackendGateway {
  authenticated: boolean = false;
  accountsReady: boolean = false;
  username: string = "";
  private backend: BackendService;
  private credentials?: {username: string, key:any};
  private authenticationObservers: Array<Subscriber<boolean>> = [];
  authenticationObservable = new Observable<boolean>(subscriptionCreator(this.authenticationObservers));

  constructor (private host: string) {
    this.cleanup();
    this.initBackend();
  }

  initBackend() {
    const csrfMiddleware = new CSRFMiddleware();
    const APIconfiguration = new OpenAPIConfiguration({ basePath: this.host, middleware: [csrfMiddleware]});
    const noCredential = new CredentialService();
    const crypto = new CryptoService(noCredential);
    const accountTransformerService = new AccountTransformerService(crypto); 
    this.backend = new BackendService(
        new MaintenanceService(new OpenAPIMaintenanceService(APIconfiguration), csrfMiddleware), 
        new UserService(new OpenAPIUserService(APIconfiguration), accountTransformerService),
        new AccountsService(new OpenAPIAccountsService(APIconfiguration), accountTransformerService), 
        noCredential, 
        accountTransformerService, 
        crypto);
    this.backend.loginObservable
      .subscribe(()=>{
          console.log('logged in');
          this.authenticated = true;
          subscriptionExecutor<boolean>(this.authenticationObservers, true);
          });
    this.backend.accountsObservable
      .subscribe((accounts: Array<Account>) => {
          this.accountsReady = true;
          });
  }

  setHost(host: string) {
    this.host = host;
    this.initBackend();
  }

  cleanup() {
    this.authenticated = false;
    this.accountsReady = false;
    this.username = "";
    this.credentials = undefined;
  }
  
  async setUserSession(username: string, key: any): Promise<void> {
    let credentials = new KeyCredentialProvider(key);
    await this.backend.waitForBackend();
    await this.backend.logonWithCredentials(credentials, username);
    this.credentials = {username: username, key: key};
    this.username = username;
    console.log('login successful');
  }

  getUserSession(): {username: string, key:any} | undefined {
    return this.credentials;
  }

  getAccountByIndex(accountId: number): Account {
    const account = this.backend.accounts.find((account) => account.index === accountId);
    if (!account) {
      throw new Error("Account not found");
    }
    return account;
  }

  async getPassword(accountId: number): Promise<string> {
    return await this.backend.getPassword(this.getAccountByIndex(accountId));
  }

  getAccounts(): Array<Account> {
    return this.backend.accounts;
  }

  async logout(): Promise<void> {
    await this.backend.logout();
    this.cleanup();
    subscriptionExecutor<boolean>(this.authenticationObservers, false);
    this.initBackend();
  }

}

export default BackendGateway;

