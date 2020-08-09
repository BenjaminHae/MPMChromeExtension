import React from 'react';

interface ActionButtonsProps {
  logoutHandler: () => void;
  showManagerHandler: () => void;
  addAccountHandler: (url: string) => void;// not sure if url is necessary
}

const ActionButtons: React.FC<ActionButtonsProps> = (props: ActionButtonsProps) => (
  <div>
    ActionButtons Component
  </div>
);

export default ActionButtons;
