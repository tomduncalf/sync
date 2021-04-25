import { computed, makeObservable } from "mobx";
import { Log } from "src/logging/Log";
import {
  PeerToPeerSignallingSession,
  SignallingIceCandidateCallback,
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

  constructor(private sessionName: string, private username: string) {
    makeObservable(this, {
      isOfferer: computed,
      connected: computed,
    });

    this.sessionName = sessionName;
    this.username = username;

    this.signalling = new PeerToPeerSignallingSession(
      sessionName,
      username,
      this.handleSignallingSessionReady,
      this.handleSignallingIceCandidate
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
    this.log.trace("handleIceCandidate", event);

    if (event.candidate) this.signalling.sendIceCandidate(event.candidate);
  };

  private handleSignallingSessionReady: SignallingSessionReadyCallback = (
    isOfferer
  ) => {
    this.log.trace("handleSignallingSessionReady", { isOfferer });

    if (isOfferer) {
      this.webRtc.createOffer();
    } else {
      this.webRtc.waitForDataChannel();
    }
  };

  private handleSignallingIceCandidate: SignallingIceCandidateCallback = (
    candidate
  ) => {
    this.log.trace("handleSignallingIceCandidate", { candidate });

    this.webRtc.addIceCandidate(candidate);
  };
}
