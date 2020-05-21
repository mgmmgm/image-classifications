import React, { useEffect, useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as posenet from '@tensorflow-models/posenet';

function BodyPoses() {

    const colors = ['aqua', 'yellow', 'green', 'red', 'blue'];

    const [model, SetModel] = useState();
    const [loading, setLoading] = useState(true);
    const refCanvas = useRef();

    useEffect(() => {
        async function getModel() {
            const posenetModel = await posenet.load();
            SetModel(posenetModel);
            setLoading(false);
        };

        getModel();
    }, []);

    function onImageSelected(event) {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = async(res) => {

            const img = await renderImageToCanvas(res.target.result);
            const input = tf.browser.fromPixels(img);
            const poses = await model.estimatePoses(input, {
                flipHorizontal: false,
                decodingMethod: 'multi-person',
                maxDetections: 15,
                scoreThreshold: 0.1,
                nmsRadius: 20.0
                });

            console.log(poses);
            drawPosesOnImage(poses);
          }
        }
    }

    async function renderImageToCanvas(imageSrc) {
        const img = new Image();
        img.src = imageSrc;
        await img.onload;
        refCanvas.current.width = img.width;
        refCanvas.current.height = img.height;
        const ctx = refCanvas.current.getContext('2d');
        ctx.drawImage(img, 0, 0);
        return img;
    }

    function drawPosesOnImage(poses) {
        const ctx = refCanvas.current.getContext('2d');
        poses.forEach((pose, i) => {
            if (pose.score > 0.5) {
                pose.keypoints.forEach(keypoint => {
                    const {x, y} = keypoint.position;
                    drawPoint(ctx, x, y, 3, colors[i % 5]);
                })
            }
        })
    }

    function drawPoint(ctx, x, y, radius, color) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
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
                    <input type="file" onChange={onImageSelected}></input>
                {true && 
                    <React.Fragment>
                    <div>
                        <canvas ref={refCanvas} ></canvas>
                        {/* <img ref={refImageElement} width="500" height="400" src={image} alt="image"></img> */}
                    </div>
                    {/* <ul className="predictions-list">
                        {predictions.map((p,i) => <li key={i}>{p.className} - {p.probability.toFixed(2)}</li>)}
                    </ul> */}
                    </React.Fragment>
                }
                </div>
            }
            
        </div>
    )
}

export default BodyPoses;