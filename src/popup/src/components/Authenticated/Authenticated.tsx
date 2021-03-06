import React from 'react';
import AccountList from '../AccountList/AccountList';
import ActionButtons from '../ActionButtons/ActionButtons';
import Info from '../Info/Info';
import SparseAccount from '../../../../models/SparseAccount';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

interface AuthenticatedProps {
  username: string;
  accounts: Array<SparseAccount>;
  logoutHandler: () => void;
  showManagerHandler: () => void;
  showOptionsHandler: () => void;
  addAccountHandler: () => void;// not sure if url is necessary
  selectHandler: (id: number) => void;
  editHandler: (id: number) => void;
  copyPasswordHandler: (id: number) => void;
}
const Authenticated: React.FC<AuthenticatedProps> = (props: AuthenticatedProps) => (
  <div>
    <Row>
      <Col>
        <Info 
          username={props.username}
        />
      </Col>
      <Col>
        <ActionButtons
            logoutHandler={props.logoutHandler}
            showManagerHandler={props.showManagerHandler}
            showOptionsHandler={props.showOptionsHandler}
            addAccountHandler={props.addAccountHandler}
        />
      </Col>
    </Row>
    <Row>
      <Col>
        <AccountList 
          accounts={props.accounts} 
          selectHandler={props.selectHandler}
          editHandler={props.editHandler}
          copyPasswordHandler={props.copyPasswordHandler}
        />
      </Col>
    </Row>
  </div>
);

export default Authenticated;
