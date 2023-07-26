import { MessageBody, SubscribeMessage, WebSocketGateway, WsResponse } from '@nestjs/websockets';
import { from, map, Observable } from 'rxjs';

@WebSocketGateway()
export class EventsGateway {

  @SubscribeMessage('connect')
  connect(@MessageBody() data: any): Observable<WsResponse<number>> {
    console.log(data)

    return from([1, 2, 3]).pipe(map(item => ({ event: 'connect', data: item })));
  }

  //@SubscribeMessage('identity')
  //async identity(@MessageBody() data: number): Promise<number> {
  //  return data;
  //}
}
