// D:\backend\src\content\content.gateway.ts
import {WebSocketGateway, WebSocketServer} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Content } from './content.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ContentGateway {
  @WebSocketServer()
  server: Server;

  emitNewContent(content: Content) {
    console.log('Emit newContent:', content.title);
    this.server.emit('newContent', content);
  }
}
