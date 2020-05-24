import React from 'react';
import './ChatBox.css';

function ChatBox(props) {

    return (
        <div className="chat-box" style={props.message.speak === 'bot' ? {backgroundColor: 'aquamarine'} : {}}>
            <p className="chat-box-text">{props.message.text}</p>
        </div>
    )
}

export default ChatBox;
