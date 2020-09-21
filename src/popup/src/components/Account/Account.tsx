import React from 'react';
import SparseAccount from '../../../../models/SparseAccount';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { PencilFill } from 'react-bootstrap-icons';
import { ClipboardData } from 'react-bootstrap-icons';

interface AccountProps {
  account: SparseAccount;
  editHandler: (id: number) => void;
  copyPasswordHandler: (id: number) => void;
}

const renderTooltip = (tip: string, id: string) => (
    <Tooltip id={id}>{tip}</Tooltip>
  );
const renderButtons = (props: AccountProps) => {
  const buttons = [
    {tooltipId: `ttEdit${props.account.index}`, tooltip: "Edit Account", variant: "light", onClick: () => props.editHandler(props.account.index), icon: (<PencilFill/>)},
    {tooltipId: `ttCopy${props.account.index}`, tooltip: "Copy Account Password to Clipboard", variant: "light", onClick: () => props.copyPasswordHandler(props.account.index), icon: (<ClipboardData/>)}
  ]
  return buttons.map((button) => (
      <OverlayTrigger
        placement="top"
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
      {renderButtons(props)}
    </ButtonGroup>
  </div>
);

export default Account;
