const websocket: any = jest.genMockFromModule("websocket");

websocket.connect = jest.fn();

module.exports = websocket;
