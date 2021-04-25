/**
 * This class handles the lifetime of a peer to peer session, which consists
 * of a signalling session (using Agora's RTM service) which is used to
 * coordinate the setup of a WebRTC session, which is used as the actual data
 * transport (due to usually much lower peer-to-peer latency).
 *
 * The high level connection flow goes like:
 *
 * 1. One client joins a specific Agora RTM channel
 * 2. A second client joins the same channel
 * 3. The second client is the "offerer" and creates a WebRTC SDP offer
 * 4. The SDP offer is sent to the first client via Agora RTM
 * 5. The clients exchange ICE candidates via Agora RTM
 * 6. WebRTC connection is successfully established, clients can
 *    now communicate via WebRTC directly
 */

import { makeAutoObservable } from "mobx";
import { Log } from "src/logging/Log";
import { PeerToPeerMessage } from "src/peerToPeer/messages";
import {
  PeerToPeerSignallingSession,
  SignallingIceCandidateCallback,
  SignallingSessionDescriptionCallback,
  SignallingSessionReadyCallback,
} from "src/peerToPeer/PeerToPeerSignallingSession";
import {
  WebRtcSession,
  IceCandidateCallback,
  LocalDescriptionSetCallback,
  WebRtcMessageCallback,
} from "src/peerToPeer/WebRtcSession";

export class PeerToPeerSession {
  private log = new Log("peerToPeer");

  private messageHandlers: Record<
    string,
    // TODO how to model message type?
    ((message: any) => void)[]
  > = {};

  private signalling: PeerToPeerSignallingSession;
  private webRtc: WebRtcSession;

  constructor(private sessionName: string, private username: string) {
    makeAutoObservable(this);

    this.sessionName = sessionName;
    this.username = username;

    this.signalling = new PeerToPeerSignallingSession(
      sessionName,
      username,
      this.handleSignallingSessionReady,
      this.handleSignallingIceCandidate,
      this.handleSignallingSessionDescription
    );
    this.webRtc = new WebRtcSession(
      this.handleIceCandidate,
      this.handleLocalDescriptionSet,
      this.handleWebRtcMessage
    );
  }

  get isOfferer(): boolean {
    return this.signalling.isOfferer;
  }

  get connected(): boolean {
    return this.signalling.connected && this.webRtc.connected;
  }

  startSession = (): void => {
    this.signalling.startSession();
  };

  endSession = (): void => {
    this.signalling.endSession();
  };

  sendMessage = (message: PeerToPeerMessage) => {
    if (!this.connected) {
      this.log.error(`sendMessage called before we are connected`, { message });
      return;
    }

    this.log.debug("sendMessage", message);

    this.webRtc.sendMessage(JSON.stringify(message));
  };

  registerMessageHandler = <T extends PeerToPeerMessage>(
    messageType: T["eventType"],
    handler: (message: T) => void
  ) => {
    if (this.messageHandlers[messageType] === undefined) {
      this.messageHandlers[messageType] = [handler];
    } else {
      this.messageHandlers[messageType].push(handler);
    }
  };

  private handleIceCandidate: IceCandidateCallback = (event) => {
    this.log.trace("handleIceCandidate", event);

    if (event.candidate) this.signalling.sendIceCandidate(event.candidate);
  };

  private handleLocalDescriptionSet: LocalDescriptionSetCallback = (
    description
  ) => {
    this.log.trace("handleLocalDescriptionSet", { description });

    this.signalling.sendSessionDescription(description);
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

  private handleSignallingSessionDescription: SignallingSessionDescriptionCallback = (
    description
  ) => {
    this.log.trace("handleSignallingSessionDescription", { description });

    this.webRtc.setRemoteDescription(description);
  };

  private handleWebRtcMessage: WebRtcMessageCallback = (rawMessage) => {
    try {
      const message = JSON.parse(rawMessage) as PeerToPeerMessage;

      if (this.messageHandlers[message.eventType]) {
        this.messageHandlers[message.eventType].forEach((handler) =>
          handler(message)
        );
      } else {
        this.log.warn(
          `handleWebRtcMessage: no handlers registered for ${message.eventType}`,
          { message }
        );
      }
    } catch (e) {
      this.log.error(`handleWebRtcMessage: Error handling message`, {
        rawMessage,
      });
    }
  };
}
