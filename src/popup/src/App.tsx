import React from 'react';
import logo from './logo.svg';
import Authenticated from './components/Authenticated/Authenticated';
import './App.css';

function App() {
  return (
    <div className="App">
      <Authenticated
        username={"testuser"}
        accounts={[]}
        selectHandler={(id)=>{}}
        editHandler={(id)=>{}}
        copyPasswordHandler={(id)=>{}}
      />
    </div>
  );
}

export default App;
