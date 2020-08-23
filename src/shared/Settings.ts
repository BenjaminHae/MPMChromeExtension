
class Settings {
  fetched: boolean = false;
  host: string = "";

  private async fetchSettings(): Promise<any> {
    return new Promise((resolve, reject) => {
      var storage = chrome.storage.local;
      if ("sync" in chrome.storage)
        storage = chrome.storage.sync;
      storage.get({
        timeout: 10,
        url: ""
      }, function(items) {
        resolve(items);
      });
    });
  }

  async load(): Promise<void> {
    let items = await this.fetchSettings();
    this.host = items.host;
  }
}
export default Settings;
