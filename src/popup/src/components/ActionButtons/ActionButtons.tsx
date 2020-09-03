import React from 'react';
import { Plus, BoxArrowLeft, List, Sliders } from 'react-bootstrap-icons';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

interface ActionButtonsProps {
  logoutHandler: () => void;
  showManagerHandler: () => void;
  showOptionsHandler: () => void;
  addAccountHandler: () => void;// not sure if url is necessary
}

const ActionButtons: React.FC<ActionButtonsProps> = (props: ActionButtonsProps) => (
  <div>
    <ButtonGroup size="sm" className="float-right">
      <Button 
        variant="primary"
        aria-label="Show Password Manager"
        onClick={() => props.showManagerHandler()} >
        <List/>
      </Button>
      <Button 
        variant="dark"
        aria-label="Show Extension Options"
        onClick={() => props.showOptionsHandler()} >
        <Sliders/>
      </Button>
      <Button 
        variant="success"
        aria-label="Add New Account"
        onClick={() => props.addAccountHandler()} >
        <Plus/>
      </Button>
      <Button 
        variant="danger"
        aria-label="Logout"
        onClick={() => props.logoutHandler()} >
        <BoxArrowLeft/>
      </Button>
    </ButtonGroup>
  </div>
);

export default ActionButtons;
