import { webRtcConfig } from "src/config/webRtcConfig";
import { debug, error } from "src/logging/logging";

export type IceCandidateCallback = (event: RTCPeerConnectionIceEvent) => void;

export class WebRtcSession {
  private peerConnection = new RTCPeerConnection(webRtcConfig);
  private dataChannel?: RTCDataChannel;

  constructor(iceCandidateCallback: IceCandidateCallback) {
    this.peerConnection.onicecandidate = iceCandidateCallback;
  }

  createOffer = async () => {
    debug("peerToPeer", "createOffer");

    this.peerConnection.onnegotiationneeded = async () => {
      try {
        const offerDescription = await this.peerConnection.createOffer();
        this.setLocalDescription(offerDescription);
      } catch (e) {
        error("peerToPeer", "createOffer error", e);
      }
    };

    this.dataChannel = this.peerConnection.createDataChannel("chat");
    // setupDataChannel();
  };

  waitForDataChannel = async () => {
    debug("peerToPeer", "waitForDataChannel");

    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      //setupDataChannel();
    };
  };

  private setLocalDescription = async (
    description: RTCSessionDescriptionInit
  ) => {
    try {
      await this.peerConnection.setLocalDescription(description);
      // callback here
    } catch (e) {
      error("peerToPeer", "setLocalDescription error", e);
    }
  };
}
