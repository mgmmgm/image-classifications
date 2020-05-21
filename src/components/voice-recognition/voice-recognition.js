import React from 'react';

function VoiceRecognition() {

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    function startRecord() {
        console.log('start');
    }

    return (
        <div>
            <button onClick={startRecord}>Click to speak</button>
        </div>
    )
}

export default VoiceRecognition;