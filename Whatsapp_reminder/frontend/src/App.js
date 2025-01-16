import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.scss';
import Navbar from './Components/Navbar';
import Sidebar from './Components/Sidebar';

function App() {
  return (
    <Router>
      <Navbar />
       <div class="Flex"> 
        <Sidebar />
        </div>
        <div class="content">

        </div>
    </Router>
  );
}

export default App;