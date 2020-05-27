import React, { useEffect, useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';

function ObjectDetection() {

    const colors = ['red', 'blue', 'green', 'black', 'brown'];

    const [model,setModel] = useState();
    const [loading, setLoading] = useState(true);
    const refImageElement = useRef();
    const refCanvas = useRef();

    useEffect(() => {
        async function getModel() {
            const cocossdModel = await cocossd.load();
            setModel(cocossdModel);
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
                const img = await renderImageToCanvas(res.target.result);
                const input = tf.browser.fromPixels(img);
                detectImage(input);
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

    async function detectImage(img) {
        const detections = await model.detect(img);
        console.log(detections);
        drawDetections(detections);
    }

    function drawDetections(detections) {
        const ctx = refCanvas.current.getContext('2d');
        detections.forEach((detect, i) => {
            const x = detect.bbox[0];
            const y = detect.bbox[1];
            const width = detect.bbox[2];
            const height = detect.bbox[3];
            ctx.beginPath();
            ctx.rect(x, y, width, height);
            ctx.strokeStyle = colors[i%5];
            ctx.stroke();
            
            ctx.font = "16px Arial";
            ctx.fillStyle = colors[i%5];
            ctx.fillText(`${detect.class} - ${detect.score.toFixed(2)*100}%`, x, y-5);
        })
    }

    return (
        <div>
            {loading && 
                <div>
                    <img src="https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif" />
                    <div>Loading model...</div>
                </div>
             }
             {!loading && <div>
                    <input type="file" onChange={onImageSelected}></input>
                    <div>
                        <canvas ref={refCanvas} ></canvas>
                        {/* <img ref={refImageElement} src={image} width="640" height="480" alt="image"></img> */}
                    </div>
                </div>
             }
        </div>
    )
}

export default ObjectDetection;