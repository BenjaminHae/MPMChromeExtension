import React from 'react';
import logo from './logo.svg';
import Authenticated from './components/Authenticated/Authenticated';
import SparseAccount from '../../models/SparseAccount';
import './App.css';

interface AppState {
  authenticated: boolean;
  accounts: Array<SparseAccount>;
  username?: string;
  selectedAccount?: number;//ToDo set for AccountList
  host: string;
  currentUrl: string;
}

export default class App extends React.Component<{}, AppState> {
  private port: any;

  constructor (props: {}) {
    super(props);
    this.state = {
      authenticated: false,
      accounts: [],
      username: "",
      host: "",
      currentUrl: ""
    }

    // Open a connection to the background
    this.port = chrome.runtime.connect({
        name: "popup"
    });
    this.port.onMessage.addListener((msg: string) => {
      console.log(msg);
      var request = JSON.parse(msg);
      switch(request["request"]){
        case "LoggedIn": this.showLoggedIn(request["data"]["loggedIn"], request["data"]["username"]); break;
        case "AvailableAccounts": this.showAvailableAccounts(request["data"]["accounts"],request["data"]["url"]); break;
        case "Host": this.setState({host: request["data"]["url"]}); break;
        case "copyPassword": navigator.clipboard.writeText(request["data"]["text"]); break;
      }
    });
    this.sendBackgroundRequest('Host');
    this.sendBackgroundRequest('LoggedIn');
    this.getCurrentTabUrl()
      .then((url: string) => {
        this.setState({currentUrl: url});
        this.sendBackgroundRequest("AvailableAccounts", {url: url});
    });
  }

  sendBackgroundRequest(request: string, data?: object) {
    this.port.postMessage(JSON.stringify({'request':request, 'data':data}));
  } 

  showLoggedIn(loggedIn: boolean, username?: string) {
    this.setState( {authenticated: loggedIn, username: username});
  }

  showAvailableAccounts(accounts: Array<SparseAccount>, url: string) {
    this.setState({accounts: accounts, currentUrl: url});
  }

  getCurrentTabUrl(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const queryInfo = {
          active: true,
          currentWindow: true
        };

        chrome.tabs.query(queryInfo, function(tabs) {
          let tab = tabs[0];
          let url = tab.url;
          console.assert(typeof url == 'string', 'tab.url should be a string');
          resolve(url);
        }); 
      }
      catch(e) {
        reject(e);
      }
    });
  }

  openHostWithActions(actions: Array<object>) {
    let action = actions.shift();
    while (action !== null) {
      this.sendBackgroundRequest("setAction", action);
      action = actions.shift();
    }
    chrome.tabs.create({ url: this.state.host });
  }
  
  openHost() {
    this.openHostWithActions([]);
  }

  showOptions() {
    chrome.runtime.openOptionsPage();
  }

  render () {
    return (
      <div className="App">
      {this.state.authenticated &&
        <Authenticated
          username={this.state.username || ""}
          accounts={this.state.accounts || []}
          logoutHandler={()=>{}}
          showManagerHandler={()=>{}}
          showOptionsHandler={this.showOptions.bind(this)}
          addAccountHandler={(url: string)=>{}}
          selectHandler={(id)=>{}}
          editHandler={(id)=>{}}
          copyPasswordHandler={(id)=>{}}
        />
      }
      </div>
    );
  }

}
