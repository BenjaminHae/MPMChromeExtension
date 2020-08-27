function storage() {
  if ("sync" in chrome.storage)
    return chrome.storage.sync;
  return chrome.storage.local;
}
function loadData() {
  storage().get({url: ""}, function(items) {
    (document.getElementById('url') as HTMLInputElement).value = items.url;
    console.log(items);
  });
}
function storeData() {
  let url = (document.getElementById('url') as HTMLInputElement).value;
  storage().set({url: url}, function() {
    document.getElementById('status').textContent = 'Options saved.';
  });
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
createHTML();
loadData();
