import { webRtcConfig } from "src/config/webRtcConfig";
import { Log } from "src/logging/Log";

export type IceCandidateCallback = (event: RTCPeerConnectionIceEvent) => void;

export class WebRtcSession {
  private log = new Log("peerToPeerWebRtc");

  private peerConnection = new RTCPeerConnection(webRtcConfig);
  private dataChannel?: RTCDataChannel;

  constructor(iceCandidateCallback: IceCandidateCallback) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (webRtcConfig.iceServers!.length < 2) {
      this.log.warn(
        "No TURN server is configured which may result in connectivity issues, see README"
      );
    }

    this.peerConnection.onicecandidate = iceCandidateCallback;
  }

  createOffer = async () => {
    this.log.debug("createOffer");

    this.peerConnection.onnegotiationneeded = async () => {
      try {
        const offerDescription = await this.peerConnection.createOffer();
        this.setLocalDescription(offerDescription);
      } catch (e) {
        this.log.error("createOffer error", e);
      }
    };

    this.dataChannel = this.peerConnection.createDataChannel("chat");
    // setupDataChannel();
  };

  waitForDataChannel = async () => {
    this.log.debug("waitForDataChannel");

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
      this.log.error("setLocalDescription error", e);
    }
  };
}
