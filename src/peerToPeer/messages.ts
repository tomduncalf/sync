export interface BasePeerToPeerMessage {
  eventType: string;
}

export interface PingMessage extends BasePeerToPeerMessage {
  eventType: "PING";
}

export interface PongMessage extends BasePeerToPeerMessage {
  eventType: "PONG";
}

export type PeerToPeerMessage = PingMessage | PongMessage;
