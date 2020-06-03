import React, { useEffect, useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as posenet from '@tensorflow-models/posenet';
import './body-poses.css';

function BodyPoses() {

    const colors = ['aqua', 'yellow', 'green', 'red', 'blue'];

    const [model, setModel] = useState();
    const [loading, setLoading] = useState(true);
    const refCanvas = useRef();

    const [showDots, setShowDots] = useState(true);
    const [showLines, setShowLines] = useState(true);
    const [showMask, setShowMask] = useState(false);
    const [image, setImage] = useState();
    const [bodyPoses, setBodyPoses] = useState();

    useEffect(() => {
        async function getModel() {
            const posenetModel = await posenet.load();
            setModel(posenetModel);
            setLoading(false);
        };

        getModel();
    }, []);

    useEffect(() => {
        async function redraw() {
            if (refCanvas && image) {
                const ctx = refCanvas.current.getContext('2d');
                // clear all canvas and redraw again
                ctx.clearRect(0, 0, refCanvas.current.width, refCanvas.current.height);
                ctx.drawImage(image, 0, 0);
                drawPosesOnImage(bodyPoses);
            }
        }
        redraw();        
    }, [showDots, showLines, showMask]);

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
            setBodyPoses(poses);
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
        setImage(img);
        return img;
    }

    function drawPosesOnImage(poses) {
        const ctx = refCanvas.current.getContext('2d');
        poses.forEach((pose, i) => {
            if (pose.score > 0.5) {
                const color = colors[i % 5];
                if (showDots) {
                    pose.keypoints.forEach(keypoint => {
                        const {x, y} = keypoint.position;
                        drawPoint(ctx, x, y, 3, color);
                    })
                }
                if (showLines) {
                    drawLinesBetweenPoses(ctx, pose, color);
                }
                
                if (showMask) {
                    drawMaskOnFace(ctx, pose);
                }
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

    function drawMaskOnFace(ctx, pose) {
        // calc mouth
        const earsDistance = pose.keypoints[3].position.x - pose.keypoints[4].position.x;
        const earsMiddle = earsDistance / 2;
        const mouthX = pose.keypoints[3].position.x - earsMiddle;
        const noseEyeMaxDistance = Math.max(pose.keypoints[0].position.y - pose.keypoints[1].position.y, pose.keypoints[0].position.y - pose.keypoints[2].position.y);
        const mouthY = pose.keypoints[0].position.y + noseEyeMaxDistance;
        // draw mouth
        drawPoint(ctx, mouthX, mouthY, 3, 'blue');
        
        ctx.beginPath();
        ctx.moveTo(pose.keypoints[0].position.x, pose.keypoints[0].position.y);
        ctx.lineTo(pose.keypoints[3].position.x, pose.keypoints[3].position.y);
        ctx.lineTo(mouthX + noseEyeMaxDistance, mouthY + noseEyeMaxDistance);
        ctx.lineTo(mouthX - noseEyeMaxDistance, mouthY + noseEyeMaxDistance);
        ctx.lineTo(pose.keypoints[4].position.x, pose.keypoints[4].position.y);
        ctx.lineTo(pose.keypoints[0].position.x, pose.keypoints[0].position.y);
        
        // ctx.strokeStyle = 'red';
        // ctx.lineWidth = 2;
        // ctx.stroke();
        ctx.fillStyle = '#68b2ed';
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
                    {image && <div className="body-poses-labels-container">
                        <label className="body-poses-label">
                            <input type="checkbox" checked={showDots} onChange={() => setShowDots(!showDots)}></input>
                            Show Dots
                        </label>
                        <label className="body-poses-label">
                            <input type="checkbox" checked={showLines} onChange={() => setShowLines(!showLines)}></input>
                            Show Lines
                        </label>
                        <label>
                            <input type="checkbox" checked={showMask} onChange={() => setShowMask(!showMask)}></input>
                            Show Mask
                        </label>
                    </div>
                    }
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