import React from 'react';
import logo from './logo.svg';
import Authenticated from './components/Authenticated/Authenticated';
import SparseAccount from '../../models/SparseAccount';
import Action from '../../models/Action';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

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
        case "Host": this.setHost(request["data"]["url"]); break;
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
    if(!this.state.authenticated) {
      if (this.state.host !== "") {
        console.log("not logged in should open manager");
        this.openHost();
      }
    }
  }

  showAvailableAccounts(accounts: Array<SparseAccount>, url: string) {
    this.setState({accounts: accounts, currentUrl: url});
  }

  setHost(host: string) {
     this.setState({host: host});
     if (host === "") {
       this.showOptions();  
     }
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

  openHostWithActions(actions: Array<Action>) {
    if(this.state.host !== "" ) {
      let action = actions.shift();
      while (action) {
        this.sendBackgroundRequest("setAction", action);
        action = actions.shift();
      }
      this.sendBackgroundRequest("showManager");
    }
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
        <Container fluid>
          <Row>
            <Col><h1>Password Manager</h1></Col>
          </Row>
          <Row>
          {this.state.authenticated &&
            <Authenticated
              username={this.state.username || ""}
              accounts={this.state.accounts || []}
              logoutHandler={()=>{this.sendBackgroundRequest("logout")}}
              showManagerHandler={()=>{this.openHost()}}
              showOptionsHandler={this.showOptions.bind(this)}
              addAccountHandler={()=>{this.openHostWithActions([{action: "add", data: {url: this.state.currentUrl}}])}}
              selectHandler={(id) => {this.sendBackgroundRequest("setAccount", {index: id}); this.sendBackgroundRequest("AvailableAccounts", {url: this.state.currentUrl});}}
              editHandler={(id: number)=>{this.openHostWithActions([{action: "edit", data: {index: id}}])}}
              copyPasswordHandler={(id)=>{this.sendBackgroundRequest("copyPassword", {index: id})}}
            />
          } 
          </Row>
        </Container>
      </div>
    );
  }

}
