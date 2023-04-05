import { OnModuleInit } from "@nestjs/common";
import { MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io"

const { Translate } = require('@google-cloud/translate').v2;
const translate = new Translate();

const target = 'es';

@WebSocketGateway({
    cors: {
        origin: ['http://localhost:3000'],
    },
})
export class MyGateway implements OnModuleInit, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server

    async onModuleInit() {
        this.server.on('connection', (socket) => {
            console.log(socket.id);
            console.log('Connected');
        });
    }

    handleDisconnect() {
        this.server.on('disconnect', (socket) => {
            console.log(socket.id);
            console.log('Disconnected');
        });
    }

    @SubscribeMessage('newMessage')
    async translateAndSend(@MessageBody() text: string) {
        console.log(text);

        // "text" can be a string for translating a single piece of text, 
        // or an array of strings for translating multiple texts
        // let [translations] = await translate.translate(text, target);
        // translations = Array.isArray(translations) ? translations : [translations];

        let [translation] = await translate.translate(text, target);


        // log the translations
        // console.log('Translations:');
        // translations.forEach((translation, i) => {
        //     console.log(`${text[i]} => ${translation}`);
        // });

        console.log(translation);
        this.server.emit('onMessage', translation);
    }
}