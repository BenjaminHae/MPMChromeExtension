import React from 'react';

interface InfoProps {
  username: string;
}

const Info: React.FC<InfoProps> = (props:InfoProps) => (
  <div>
    Logged in as {props.username}
  </div>
);

export default Info;
