import { computed, makeObservable } from "mobx";
import { Log } from "src/logging/Log";
import {
  PeerToPeerSignallingSession,
  SignallingSessionReadyCallback,
} from "src/peerToPeer/PeerToPeerSignallingSession";
import {
  WebRtcSession,
  IceCandidateCallback,
} from "src/peerToPeer/WebRtcSession";

export class PeerToPeerSession {
  private log = new Log("peerToPeer");

  private signalling: PeerToPeerSignallingSession;
  private webRtc: WebRtcSession;

  private sessionName: string;
  private username: string;

  constructor(sessionName: string, username: string) {
    makeObservable(this, {
      isOfferer: computed,
      connected: computed,
    });

    this.sessionName = sessionName;
    this.username = username;

    this.signalling = new PeerToPeerSignallingSession(
      sessionName,
      username,
      this.handleSignallingSessionReady
    );
    this.webRtc = new WebRtcSession(this.handleIceCandidate);
  }

  get isOfferer() {
    return this.signalling.isOfferer;
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

  private handleIceCandidate: IceCandidateCallback = (event) => {
    this.log.debug("handleIceCandidate", event);

    if (event.candidate) this.signalling.sendIceCandidate(event.candidate);
  };

  private handleSignallingSessionReady: SignallingSessionReadyCallback = (
    isOfferer
  ) => {
    this.log.debug("handleSignallingSessionReady", { isOfferer });

    if (isOfferer) {
      this.webRtc.createOffer();
    } else {
      this.webRtc.waitForDataChannel();
    }
  };
}
