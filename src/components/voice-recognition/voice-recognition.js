import React, { useState } from 'react';
import './voice-recognition.css';
import ChatBox from './ChatBox';

function VoiceRecognition() {

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';

    const [sentences, setSentences] = useState([]);
    const [isRecording, setIsRecording] = useState(false);

    function startRecord() {
        setIsRecording(true);
        recognition.start();
        recognition.onresult = event => {
            setIsRecording(false);
            const newSentence = {
                text: event.results[event.resultIndex][0].transcript,
                speak: 'user'
            } 
            
            addNewSentence(newSentence);
            
            setTimeout(() => {
                botResponse(newSentence.text);
            })
        }
    }

    function addNewSentence(newSentence) {
        setSentences(prevState => [...prevState, newSentence]);
    }

    function botResponse(userText) {
        let botText = 'I am not understand you';
        if (userText.includes('how are you')) {
            botText = 'I am fine thank you';
        } else if (userText.includes('time')) {
            botText = getTime();
        } else if (userText.includes('date')) {
            botText = getDate();
        } else if (userText.includes('temperature')) {
            botText = 'What is your location ?'
        } else if(userText.toLowerCase().includes('israel') || userText.toLowerCase().includes('tel aviv')) {
            botText = 'It\'s very hot outside, 31 celsius degree'
        } else if (userText.includes('something else to say')) {
            botText = 'Yes, this is awesome';
        } else if (userText.includes('bye')) {
            botText = 'bye bye';
        }

        const botSentence = {
            text: botText,
            speak: 'bot'
        }

        botVoice(botSentence.text);
        addNewSentence(botSentence);
    }

    function botVoice(text) {
        const speech = new SpeechSynthesisUtterance(text);
        // speech.text = text;
        speech.volume = 1;
        speech.rate = 1;
        speech.pitch = 1;
        window.speechSynthesis.speak(speech);
    }

    function getTime() {
        const time = new Date();
        return `the time is ${time.toLocaleString('en-US', {hour: 'numeric', minute: 'numeric', hour12: true})}`;
    }

    function getDate() {
        const date = new Date();
        return `today is ${date.toLocaleDateString()}`;
    }


    return (
        <div>
            <div className="voice-recorder">
                <img className={`voice-recorder-image ${isRecording ? 'recording' : ''}`} src="assets/voicerecorder.jpg" onClick={startRecord}></img>
            </div>
            <div>
                {
                    sentences.map((s, i) => <ChatBox key={i} message={s} />)
                }
            </div>
        </div>
    )
}

export default VoiceRecognition;