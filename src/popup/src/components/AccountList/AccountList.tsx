import React from 'react';
import Account from '../Account/Account';
import SparseAccount from '../../../../models/SparseAccount';

interface AccountListProps {
  accounts: Array<SparseAccount>;
  selectHandler: (id: number) => void;
  editHandler: (id: number) => void;
  copyPasswordHandler: (id: number) => void;
}

const AccountList: React.FC<AccountListProps> = (props: AccountListProps) => {
  const accounts = props.accounts.map((account) => ( 
      <Account 
        account={account} 
        selectHandler={props.selectHandler}
        editHandler={props.editHandler}
        copyPasswordHandler={props.copyPasswordHandler}
        key={account.index} 
      /> 
    ) 
  );
  return (
    <div>
      <h3>Accounts</h3>
      {accounts}
    </div>
  );
}

export default AccountList;
