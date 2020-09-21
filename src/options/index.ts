import Settings from '../shared/Settings';
import createElement from '../shared/CreateHTMLElement';

function loadData(items) {
  console.log(items);
  (document.getElementById('url') as HTMLInputElement).value = items.host;
}
async function storeData() {
  settings.settings.host = (document.getElementById('url') as HTMLInputElement).value; 
  await settings.store();
  chrome.runtime.sendMessage({"request":"reloadSettings"}, function(response) {}); 
  document.getElementById('status').textContent = 'Options saved.';
}
function createHTML() {
  document.body.appendChild(createElement('label', {'for': 'url'}, 'Password-Manager URL:'));
  let input = createElement('input', { 'type':'url', 'id':'url', 'placeholder':'https://www.yourdomain.com/' } );
  document.body.appendChild(input);
  let button = createElement<HTMLButtonElement>('button', {'id': 'save'}, 'store');
  button.onclick = storeData;
  document.body.appendChild(button);
  let status = createElement('p', {'id':'status'});
  document.body.appendChild(status);
}

let settings = new Settings();
settings.settingsObservable
  .subscribe((settings) => {
      loadData(settings);
    });
createHTML();
settings.load();

