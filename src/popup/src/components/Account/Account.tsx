import React from 'react';
import SparseAccount from '../../../../models/SparseAccount';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { PencilFill } from 'react-bootstrap-icons';
import { ClipboardData } from 'react-bootstrap-icons';

interface AccountProps {
  account: SparseAccount;
  editHandler: (id: number) => void;
  copyPasswordHandler: (id: number) => void;
}

const Account: React.FC<AccountProps> = (props: AccountProps) => (
  <div>
    <span>
      {props.account.name} 
      {props.account.username !== "" && 
        <>({props.account.username}) </>
      }
    </span>
    <ButtonGroup size="sm" className="float-right">
      <Button 
        aria-label="Edit Account"
        onClick={() => props.editHandler(props.account.index)}
        variant="light" >
        <PencilFill/>
      </Button>
      <Button 
        aria-label="Copy Password to Clipboard"
        onClick={()=> props.copyPasswordHandler(props.account.index)}
        variant="light" >
        <ClipboardData/>
      </Button>
    </ButtonGroup>
  </div>
);

export default Account;
