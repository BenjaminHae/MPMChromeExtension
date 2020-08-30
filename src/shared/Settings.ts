import { Observable, Subscriber, TeardownLogic } from 'rxjs';

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
interface IExtensionSettings {
  host: string;
}
class Settings {
  fetched: boolean = false;
  settings: IExtensionSettings;
  private settingsObservers: Array<Subscriber<IExtensionSettings>> = [];
  settingsObservable = new Observable<IExtensionSettings>(subscriptionCreator(this.settingsObservers));

  private getStorage(): any {
    if ("sync" in chrome.storage)
      return chrome.storage.sync;
    return chrome.storage.local;
  }
  private async fetchSettings(): Promise<IExtensionSettings> {
    return new Promise((resolve, reject) => {
      this.getStorage().get(this.defaultSettings(), function(items) {
        resolve(items as IExtensionSettings);
      });
    });
  }

  defaultSettings(): IExtensionSettings {
    return { host: "" };
  }

  async load(): Promise<void> {
    let items = await this.fetchSettings();
    this.settings = items;
    subscriptionExecutor<IExtensionSettings>(this.settingsObservers, this.settings);
  }

  async storeSettings(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.getStorage().set(this.settings, function() {
        resolve();
      });
    });
  }
  
  async store(): Promise<void> {
    await this.storeSettings();
    subscriptionExecutor<IExtensionSettings>(this.settingsObservers, this.settings);
  }
}
export default Settings;
