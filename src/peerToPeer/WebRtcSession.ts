import { makeAutoObservable, runInAction } from "mobx";
import { webRtcConfig } from "src/config/webRtcConfig";
import { Log } from "src/logging/Log";

export type IceCandidateCallback = (event: RTCPeerConnectionIceEvent) => void;

export type LocalDescriptionSetCallback = (
  description: RTCSessionDescriptionInit
) => void;

export type WebRtcMessageCallback = (message: string) => void;

export class WebRtcSession {
  connected = false;

  private log = new Log("peerToPeerWebRtc");

  private peerConnection = new RTCPeerConnection(webRtcConfig);
  private dataChannel?: RTCDataChannel;

  constructor(
    iceCandidateCallback: IceCandidateCallback,
    private localDescriptionSetCallback: LocalDescriptionSetCallback,
    private messageCallback: WebRtcMessageCallback
  ) {
    makeAutoObservable(this);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (webRtcConfig.iceServers!.length < 2) {
      this.log.warn(
        "No TURN server is configured which may result in connectivity issues, see README"
      );
    }

    this.peerConnection.onicecandidate = iceCandidateCallback;
  }

  createOffer = async (): Promise<void> => {
    this.log.trace("createOffer");

    this.peerConnection.onnegotiationneeded = async () => {
      try {
        const offerDescription = await this.peerConnection.createOffer();
        this.setLocalDescription(offerDescription);
      } catch (e) {
        this.log.error("createOffer error", e);
      }
    };

    this.dataChannel = this.peerConnection.createDataChannel("chat");
    this.setupDataChannel();
  };

  waitForDataChannel = async (): Promise<void> => {
    this.log.trace("waitForDataChannel");

    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannel();
    };
  };

  addIceCandidate = (candidate: RTCIceCandidate): void => {
    this.log.trace("addIceCandidate", { candidate });

    this.peerConnection.addIceCandidate(candidate);
  };

  setRemoteDescription = async (
    description: RTCSessionDescriptionInit
  ): Promise<void> => {
    this.log.trace("setRemoteDescription", { description });

    await this.peerConnection.setRemoteDescription(description);
    if (description.type === "offer") {
      const localDescription = await this.peerConnection.createAnswer();
      this.setLocalDescription(localDescription);
    }
  };

  sendMessage = (message: string) => {
    if (!this.dataChannel) {
      this.log.error("sendMessage called before dataChannel is ready", {
        message,
      });
      return;
    }

    this.log.trace("sendMessage", { message });
    this.dataChannel.send(message);
  };

  private setLocalDescription = async (
    description: RTCSessionDescriptionInit
  ) => {
    try {
      await this.peerConnection.setLocalDescription(description);
      this.localDescriptionSetCallback(description);
    } catch (e) {
      this.log.error("setLocalDescription error", e);
    }
  };

  private setupDataChannel = () => {
    if (!this.dataChannel) {
      this.log.error("setupDataChannel called before data channel ready");
      return;
    }

    this.log.trace("setupDataChannel");

    this.dataChannel.onopen = this.checkDataChannelState;
    this.dataChannel.onclose = this.checkDataChannelState;
    this.dataChannel.onmessage = (event) => this.handleMessage(event);
  };

  private checkDataChannelState = () => {
    if (!this.dataChannel) {
      this.log.error("checkDataChannelState called before data channel ready");
      return;
    }

    this.log.trace(`Data channel state is ${this.dataChannel.readyState}`);

    if (this.dataChannel.readyState === "open") {
      this.log.debug("Data channel open");

      this.connected = true;

      setInterval(() => {
        this.sendMessage(Math.random().toString());
      }, 1000);
    }
  };

  private handleMessage = (event: MessageEvent<any>) => {
    this.log.trace("handleMessage", event.data);

    this.messageCallback(event.data);
  };
}
