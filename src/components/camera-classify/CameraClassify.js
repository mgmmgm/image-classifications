import React, { useState, useEffect, useRef } from 'react';
import * as mobilenet from '@tensorflow-models/mobilenet';

function CameraClassify() {

    const [model, setModel] = useState();
    const [loading, setLoading] = useState(true);
    const [preditions, setPredictions] = useState([]);
    const refVideo = useRef();

    useEffect(() => {
        let interval;
        async function getModel() {
            const mobilenetModel = await mobilenet.load();
            setModel(mobilenetModel);
            getMedia();
            setLoading(false);
            interval = setInterval(async() => {
                const predicts = await mobilenetModel.classify(refVideo.current);
                setPredictions(predicts);
            }, 3000);
        }
        getModel();

        return () => {
            clearInterval(interval);
            refVideo.current.pause();
        }
    }, []);

    async function getMedia() {
        if (navigator.mediaDevices.getUserMedia) {
            const stream = await navigator.mediaDevices.getUserMedia({video: true});
            refVideo.current.srcObject = stream;
        }
    }

    return (
        <div style={{textAlign: "center"}}>
            {loading && <div>
                    <img src="https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif" />
                    <div>Loading model...</div>
                </div>
            }
            {!loading &&
                <React.Fragment>
                    <div>
                        <video ref={refVideo} autoPlay muted width="400px" height="400px"></video>
                    </div>
                    <div>
                        <ul style={{display: "inline-block", textAlign: 'left'}}>
                            {preditions.map((p, i) => <li key={i}>{p.className} - {p.probability.toFixed(2)}</li>)}
                        </ul>
                    </div>
                </React.Fragment>
            }
        </div>
    )
}

export default CameraClassify;