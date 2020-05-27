import React, { useEffect, useState, useRef } from 'react';
import * as mobilenet from '@tensorflow-models/mobilenet';
import './ImageClassify.css';

function ImageClassify() {
    const [model, setModel] = useState();
  const [loading, setLoading] = useState(true);
  const [val, setVal] = useState('');
  const [image, setImage] = useState();
  const [predictions, setPredictions] = useState([]);
  const refImageElement = useRef();

  useEffect(() => {
    async function getModel() {
      const mobilenetModel = await mobilenet.load();
      setModel(mobilenetModel);
      setLoading(false);
    }
    getModel();
  }, []);

  function onImageSelected(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async(res) => {
        await setImage(res.target.result);
        predictImage();
      }
    }
  }

  async function predictImage() {
    const predicts = await model.classify(refImageElement.current);
    setPredictions(predicts);
  }
  
  return (
    <div>
      {loading && <div>
        <img src="https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif" />
        <div>Loading model...</div>
      </div>
      }
     {!loading && 
      <div>
        {/* <input type="text" value={val} onChange={e => setVal(e.target.value)}></input> */}
        <input type="file" onChange={onImageSelected}></input>
      {image && 
        <React.Fragment>
          <div>
            <img ref={refImageElement} width="500" height="400" src={image} alt="image"></img>
          </div>
          <ul className="predictions-list">
            {predictions.map((p,i) => <li key={i}>{p.className} - {p.probability.toFixed(2)*100}%</li>)}
          </ul>
        </React.Fragment>
      }
      </div>
    }
    
    </div>
  );

}

export default ImageClassify;