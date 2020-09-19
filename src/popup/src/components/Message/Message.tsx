import React from 'react';
import Alert from 'react-bootstrap/Alert';

interface IMessageProps {
  message: string;
}
const Message: React.FC<IMessageProps> = (props: IMessageProps) => (
    <Alert variant="success">{ props.message }</Alert>
);

export default Message;
