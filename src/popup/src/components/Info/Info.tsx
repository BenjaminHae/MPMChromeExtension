import React from 'react';

interface InfoProps {
  username: string;
}

const Info: React.FC<InfoProps> = (props:InfoProps) => (
  <div>
    Info Component {props.username}
  </div>
);

export default Info;
