import Settings from '../shared/Settings';

function loadData(items) {
  console.log(items);
  (document.getElementById('url') as HTMLInputElement).value = items.host;
}
async function storeData() {
  settings.settings.host = (document.getElementById('url') as HTMLInputElement).value; 
  await settings.store();
  document.getElementById('status').textContent = 'Options saved.';
}
function createHTML() {
  let label = document.createElement('label');
  label.setAttribute('for','url'); 
  label.textContent = 'Password-Manager URL:'; 
  document.body.appendChild(label);
  let input = document.createElement('input');
  input.setAttribute('type','url'); 
  input.setAttribute('id','url'); 
  input.setAttribute('placeholder','https://www.yourdomain.com/'); 
  document.body.appendChild(input);
  let button = document.createElement('button');
  button.setAttribute('id','save'); 
  button.textContent = 'store'; 
  button.onclick = storeData;
  document.body.appendChild(button);
  let status = document.createElement('p');
  status.setAttribute('id','status'); 
  document.body.appendChild(status);
}

let settings = new Settings();
settings.settingsObservable
  .subscribe((settings) => {
      loadData(settings);
    });
createHTML();
settings.load();

