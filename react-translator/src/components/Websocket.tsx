import React, { useContext, useEffect, useState } from "react";
import { WebsocketContext } from "../contexts/WebsocketContext";

export const Websocket = () => {
    const [value, setValue] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const socket = useContext(WebsocketContext);

    // speech to text
    const recorder = require('node-record-lpcm16');
    const speech = require('@google-cloud/speech'); // imports the Google Cloud client library
    const client = new speech.SpeechClient(); // creates a client
    const encoding = 'Encoding of the audio file, e.g. LINEAR16';
    const sampleRateHertz = 16000;
    const languageCode = 'en-US';
    const request = {
        config: {
            encoding: encoding,
            sampleRateHertz: sampleRateHertz,
            languageCode: languageCode,
        },
        interimResults: false, // if you want interim results, set this to true
    };
    // create a recognize stream
    const recognizeStream = client
        .streamingRecognize(request)
        .on('error', console.error)
        .on('data', (data: { results: { alternatives: { transcript: any; }[]; }[]; }) =>
            process.stdout.write(
                data.results[0] && data.results[0].alternatives[0]
                    ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
                    : '\n\nReached transcription time limit, press Ctrl+C\n'
            )
        );
    // start recording and send the microphone input to the Speech API
    // ensure SoX is installed, see https://www.npmjs.com/package/node-record-lpcm16#dependencies
    recorder
        .record({
            sampleRateHertz: sampleRateHertz,
            threshold: 0,
            // other options, see https://www.npmjs.com/package/node-record-lpcm16#options
            verbose: false,
            recordProgram: 'rec', // try also "arecord" or "sox"
            silence: '5.0',
        })
        .stream()
        .on('error', console.error)
        .pipe(recognizeStream);
    console.log('Listening, press Ctrl+C to stop.');

    // text field and message sending
    useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected!');
        });
        socket.on('onMessage', (data: string) => {
            console.log('onMessage event received!');
            setMessage(data); // update the message content to value
        });

        return () => {
            console.log('Unregistering Events...');
            socket.off('connect');
            socket.off('onMessage');
        };
    }, [value, socket]);

    function onChange(e: React.ChangeEvent<HTMLInputElement>) {
        setValue(e.target.value) // update value as user types
        socket.emit('newMessage', value) // send the message to the server
    }

    return (
        <div>
            <div>
                <h1>Websocket Component</h1>
                <div>
                    <p>{message}</p>
                </div>
                <div>
                    <input
                        type="text" value={value} onChange={(e) => onChange(e)}
                    />
                </div>
            </div>
        </div>
    );
};