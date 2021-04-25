import { computed, makeObservable } from "mobx";
import { debug } from "src/logging/logging";
import {
  PeerToPeerSignallingSession,
  SignallingSessionReadyCallback,
} from "src/peerToPeer/PeerToPeerSignallingSession";
import {
  WebRtcSession,
  IceCandidateCallback,
} from "src/peerToPeer/WebRtcSession";

export class PeerToPeerSession {
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
    debug("peerToPeer", "handleIceCandidate", event);

    if (event.candidate) this.signalling.sendIceCandidate(event.candidate);
  };

  private handleSignallingSessionReady: SignallingSessionReadyCallback = (
    isOfferer
  ) => {
    debug("peerToPeer", "handleSignallingSessionReady", { isOfferer });

    if (isOfferer) {
      this.webRtc.createOffer();
    } else {
      this.webRtc.waitForDataChannel();
    }
  };
}
