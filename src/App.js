import './App.css';
import React from 'react';
import TickerControl from './components/TickerControl/TickerControl'
import ParticlesBg from 'particles-bg'
import Stack from '@material-ui/core/Stack'

function App() {
  return (
    <Stack>
      <div id="App" className="App">
        <ParticlesBg type="cobweb" color={"#ffffff"} bg={true} num={20}/>
        <TickerControl/>
      </div>
    </Stack>
  );
}

export default App;
