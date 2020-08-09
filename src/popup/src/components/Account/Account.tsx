import React from 'react';
import SparseAccount from '../../models/SparseAccount';

interface AccountProps {
  account: SparseAccount;
  selectHandler: (id: number) => void;
  editHandler: (id: number) => void;
  copyPasswordHandler: (id: number) => void;
}

const Account: React.FC<AccountProps> = (props: AccountProps) => (
  <p>{props.account.name}</p>
);

export default Account;
