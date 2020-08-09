import React from 'react';
import AccountList from '../AccountList/AccountList';
import ActionButtons from '../ActionButtons/ActionButtons';
import Info from '../Info/Info';
import SparseAccount from '../../models/SparseAccount';

interface AuthenticatedProps {
  username: string;
  accounts: Array<SparseAccount>;
  logoutHandler: () => void;
  showManagerHandler: () => void;
  showOptionsHandler: () => void;
  addAccountHandler: (url: string) => void;// not sure if url is necessary
  selectHandler: (id: number) => void;
  editHandler: (id: number) => void;
  copyPasswordHandler: (id: number) => void;
}
const Authenticated: React.FC<AuthenticatedProps> = (props: AuthenticatedProps) => (
  <div>
    <ActionButtons
        logoutHandler={props.logoutHandler}
        showManagerHandler={props.showManagerHandler}
        showOptionsHandler={props.showOptionsHandler}
        addAccountHandler={props.addAccountHandler}
    />
    <Info 
      username={props.username}
    />
    <AccountList 
      accounts={props.accounts} 
      selectHandler={props.selectHandler}
      editHandler={props.editHandler}
      copyPasswordHandler={props.copyPasswordHandler}
    />
  </div>
);

export default Authenticated;
