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

  private async fetchSettings(): Promise<any> {
    return new Promise((resolve, reject) => {
      var storage = chrome.storage.local;
      if ("sync" in chrome.storage)
        storage = chrome.storage.sync;
      storage.get(this.defaultSettings(), function(items) {
        resolve(items);
      });
    });
  }

  defaultSettings(): IExtensionSettings {
    return { host: "" };
  }

  async load(): Promise<void> {
    let items = await this.fetchSettings();
    this.settings = items as IExtensionSettings;
    subscriptionExecutor<IExtensionSettings>(this.settingsObservers, this.settings);
  }
}
export default Settings;
