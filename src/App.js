import React from 'react';
import './App.css';
import ImageClassify from './components/image-classify/ImageClassify';
import { BrowserRouter as Router, Link, Switch, Route } from 'react-router-dom';
import CameraClassify from './components/camera-classify/CameraClassify';
import BodyPoses from './components/body-poses/body-poses';
import VoiceRecognition from './components/voice-recognition/voice-recognition';

function App() {

  

  return (
    <Router>
      <div className="App">
        <ul className="menu">
          <li>
            <Link to="/">Image Classifictions</Link>
          </li>
          <li>
            <Link to="/camera">Camera Classifications</Link>
          </li>
          <li>
            <Link to="/body">Body Poses</Link>
          </li>
          <li>
            <Link to="/voice">Voice</Link>
          </li>
        </ul>
        <Switch>
          <Route exact path="/">
            <ImageClassify/>
          </Route>
          <Route path="/camera">
            <CameraClassify/>
          </Route>
          <Route path="/body">
            <BodyPoses/>
          </Route>
          <Route path="/voice">
            <VoiceRecognition/>
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
