export interface BasePeerToPeerMessage {
  eventType: string;
}

export interface PingMessage extends BasePeerToPeerMessage {
  eventType: "PING";
  globalHostTime: number;
}

export interface PongMessage extends BasePeerToPeerMessage {
  eventType: "PONG";
  globalHostTime: number;
  pingGlobalHostTime: number;
}

export type PeerToPeerMessage = PingMessage | PongMessage;
