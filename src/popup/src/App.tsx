import React from 'react';
import logo from './logo.svg';
import Authenticated from './components/Authenticated/Authenticated';
import SparseAccount from './models/SparseAccount';
import './App.css';

interface AppState {
  authenticated: boolean;
  accounts: Array<SparseAccount>;
  username: string;
  selectedAccount?: number;//ToDo set for AccountList
}

export default class App extends React.Component<{}, AppState> {
  constructor (props: {}) {
    super(props);
    this.state = {
      authenticated: false,
      accounts: [],
      username: ""
    }
  }

  render () {
    return (
      <div className="App">
        <Authenticated
          username={this.state.username}
          accounts={this.state.accounts}
          logoutHandler={()=>{}}
          showManagerHandler={()=>{}}
          addAccountHandler={(url: string)=>{}}
          selectHandler={(id)=>{}}
          editHandler={(id)=>{}}
          copyPasswordHandler={(id)=>{}}
        />
      </div>
    );
  }
}
