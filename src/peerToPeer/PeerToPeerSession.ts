import { PeerToPeerSignallingSession } from "src/peerToPeer/PeerToPeerSignallingSession";

export class PeerToPeerSession {
  private signalling: PeerToPeerSignallingSession;

  private sessionName: string;
  private username: string;

  constructor(sessionName: string, username: string) {
    this.sessionName = sessionName;
    this.username = username;

    this.signalling = new PeerToPeerSignallingSession(sessionName, username);
  }
}
