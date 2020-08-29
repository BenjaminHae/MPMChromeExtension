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

class KeyCredentialProvider {
  key: CryptoKey;
  constructor (key: CryptoKey) {
    this.key = key;
  }
  getKey(): CryptoKey {
    return this.key;
  }

  cleanUp(): Promise<void> {
    this.key = null;
    return Promise.resolve();
  }
}

class BackendGateway {
  authenticated: boolean;
  accountsReady: boolean;
  private backend: BackendService;

  constructor (host: string) {
    this.cleanup();
    const csrfMiddleware = new CSRFMiddleware();
    const APIconfiguration = new OpenAPIConfiguration({ basePath: host, middleware: [csrfMiddleware]});
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
          });
    this.backend.accountsObservable
      .subscribe((accounts: Array<Account>) => {
          this.accountsReady = true;
          });
  }

  cleanup() {
    this.authenticated = false;
    this.accountsReady = false;
  }
  
  async setUserSession(username: string, key: any): Promise<void> {
    let credentials = new KeyCredentialProvider(key);
    await this.backend.waitForBackend();
    await this.backend.logonWithCredentials(credentials, username);
    console.log('login successful');
    return
  }

  async getPassword(accountId: number): Promise<string> {
    const account = this.backend.accounts.find((account) => account.index === accountId);
    if (!account) {
      throw new Error("Account not found");
    }
    return await this.backend.getPassword(account);
  }

  getAccounts(): Array<Account> {
    return this.backend.accounts;
  }
}

export default BackendGateway;

