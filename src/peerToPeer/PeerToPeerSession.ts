import { computed, makeObservable } from "mobx";
import { PeerToPeerSignallingSession } from "src/peerToPeer/PeerToPeerSignallingSession";

export class PeerToPeerSession {
  private signalling: PeerToPeerSignallingSession;

  private sessionName: string;
  private username: string;

  constructor(sessionName: string, username: string) {
    makeObservable(this, {
      isMaster: computed,
      connected: computed,
    });

    this.sessionName = sessionName;
    this.username = username;

    this.signalling = new PeerToPeerSignallingSession(sessionName, username);
  }

  get isMaster() {
    return this.signalling.isMaster;
  }

  get connected() {
    return this.signalling.connected;
  }

  startSession = () => {
    this.signalling.startSession();
  };

  endSession = () => {
    this.signalling.endSession();
  };
}
