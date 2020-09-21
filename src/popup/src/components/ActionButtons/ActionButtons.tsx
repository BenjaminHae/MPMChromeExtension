import React from 'react';
import { Plus, BoxArrowLeft, List, Sliders } from 'react-bootstrap-icons';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

interface ActionButtonsProps {
  logoutHandler: () => void;
  showManagerHandler: () => void;
  showOptionsHandler: () => void;
  addAccountHandler: () => void;// not sure if url is necessary
}

const renderTooltip = (tip: string, id: string) => (
    <Tooltip id={id}>{tip}</Tooltip>
  );

const ActionButtons: React.FC<ActionButtonsProps> = (props: ActionButtonsProps) => {
  const buttons = [
    {tooltipId: "ttShow", tooltip: "Show Password Manager", variant: "primary", onClick: () => props.showManagerHandler(), icon: (<List/>)},
    {tooltipId: "ttOpt", tooltip: "Show Extension Options", variant: "dark", onClick: () => props.showOptionsHandler(), icon: (<Sliders/>)},
    {tooltipId: "ttAdd", tooltip: "Add New Account", variant: "success", onClick: () => props.addAccountHandler(), icon: (<Plus/>)},
    {tooltipId: "ttLogout", tooltip: "Logout", variant: "danger", onClick: () => props.logoutHandler(), icon: (<BoxArrowLeft/>)}
  ]
  const renderedButtons = buttons.map((button) => (
      <OverlayTrigger
        placement="bottom"
        delay={{ show: 250, hide: 400 }}
        overlay={renderTooltip(button.tooltip, button.tooltipId)}
        key={button.tooltipId}
        >
        <Button 
          variant={button.variant}
          aria-label={button.tooltip}
          onClick={button.onClick} >
          {button.icon}
        </Button>
      </OverlayTrigger>
    ))
  return (
  <div>
    <ButtonGroup size="sm" className="float-right">
      {renderedButtons}
    </ButtonGroup>
  </div>
  );
}

export default ActionButtons;
