import React from 'react';
import Account from '../Account/Account';
import SparseAccount from '../../../../models/SparseAccount';
import ListGroup from 'react-bootstrap/ListGroup';
import Alert from 'react-bootstrap/Alert';

interface AccountListProps {
  accounts: Array<SparseAccount>;
  selectHandler: (id: number) => void;
  editHandler: (id: number) => void;
  copyPasswordHandler: (id: number) => void;
}

const AccountList: React.FC<AccountListProps> = (props: AccountListProps) => {
  const accounts = props.accounts.map((account) => ( 
      <ListGroup.Item 
        action 
        active={account.active}
        onClick={() => props.selectHandler(account.index)}
        key={account.index} >
        <Account 
          account={account} 
          editHandler={props.editHandler}
          copyPasswordHandler={props.copyPasswordHandler}
        /> 
      </ListGroup.Item>
    ) 
  );
  return (
    <div>
      <h3>Accounts</h3>
      { props.accounts.length === 0 &&
        <Alert variant="info">No accounts available</Alert>
      }
      <ListGroup variant="flush">
        {accounts}
      </ListGroup>
    </div>
  );
}

export default AccountList;
