import { OnModuleInit } from "@nestjs/common";
import { Socket } from "socket.io-client";
export declare class SocketClient implements OnModuleInit {
    socketClient: Socket;
    constructor();
    onModuleInit(): void;
    private registerConsumerEvents;
}
