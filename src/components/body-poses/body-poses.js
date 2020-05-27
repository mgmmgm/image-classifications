import React, { useEffect, useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as posenet from '@tensorflow-models/posenet';

function BodyPoses() {

    const colors = ['aqua', 'yellow', 'green', 'red', 'blue'];

    const [model, setModel] = useState();
    const [loading, setLoading] = useState(true);
    const refCanvas = useRef();

    useEffect(() => {
        async function getModel() {
            const posenetModel = await posenet.load();
            setModel(posenetModel);
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
                const color = colors[i % 5];
                pose.keypoints.forEach(keypoint => {
                    const {x, y} = keypoint.position;
                    drawPoint(ctx, x, y, 3, color);
                })
                drawLinesBetweenPoses(ctx, pose, color);
            }
        })
        
    }

    function drawPoint(ctx, x, y, radius, color) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    }

    function drawLinesBetweenPoses(ctx, pose, color) {
        ctx.beginPath();
        ctx.moveTo(pose.keypoints[9].position.x, pose.keypoints[9].position.y);
        ctx.lineTo(pose.keypoints[7].position.x, pose.keypoints[7].position.y);
        ctx.lineTo(pose.keypoints[5].position.x, pose.keypoints[5].position.y);
        ctx.lineTo(pose.keypoints[6].position.x, pose.keypoints[6].position.y);
        ctx.lineTo(pose.keypoints[8].position.x, pose.keypoints[8].position.y);
        ctx.lineTo(pose.keypoints[10].position.x, pose.keypoints[10].position.y);

        ctx.moveTo(pose.keypoints[15].position.x, pose.keypoints[15].position.y);
        ctx.lineTo(pose.keypoints[13].position.x, pose.keypoints[13].position.y);
        ctx.lineTo(pose.keypoints[11].position.x, pose.keypoints[11].position.y);
        ctx.lineTo(pose.keypoints[12].position.x, pose.keypoints[12].position.y);
        ctx.lineTo(pose.keypoints[14].position.x, pose.keypoints[14].position.y);
        ctx.lineTo(pose.keypoints[16].position.x, pose.keypoints[16].position.y);

        ctx.moveTo(pose.keypoints[5].position.x, pose.keypoints[5].position.y);
        ctx.lineTo(pose.keypoints[11].position.x, pose.keypoints[11].position.y);
        ctx.moveTo(pose.keypoints[6].position.x, pose.keypoints[6].position.y);
        ctx.lineTo(pose.keypoints[12].position.x, pose.keypoints[12].position.y);

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
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
                    <div>
                        <canvas ref={refCanvas} ></canvas>
                        {/* <img ref={refImageElement} width="500" height="400" src={image} alt="image"></img> */}
                    </div>
                </div>
            }
            
        </div>
    )
}

export default BodyPoses;