import React from 'react';
import SparseAccount from '../../../../models/SparseAccount';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

interface AccountProps {
  account: SparseAccount;
  editHandler: (id: number) => void;
  copyPasswordHandler: (id: number) => void;
}

const Account: React.FC<AccountProps> = (props: AccountProps) => (
  <div><span>{props.account.name} ({props.account.username})</span>
    <ButtonGroup size="sm">
      <Button 
        onClick={() => props.editHandler(props.account.index)}
      >
        Edit
      </Button>
      <Button 
        onClick={()=> props.copyPasswordHandler(props.account.index)}
      >
        Copy Password
      </Button>
    </ButtonGroup>
  </div>
);

export default Account;
