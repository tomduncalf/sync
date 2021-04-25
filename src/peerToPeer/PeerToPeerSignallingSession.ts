import AgoraRTM, {
  RtmChannel,
  RtmClient,
  RtmMessage,
  RtmStatusCode,
} from "agora-rtm-sdk";
import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from "mobx";
import { agoraConfig } from "src/config/agoraConfig";
import { Log } from "src/logging/Log";

type IceCandidateMessage = {
  eventType: "ICE_CANDIDATE";
  candidate: RTCIceCandidate;
};

type Message = IceCandidateMessage;

export type SignallingSessionReadyCallback = (isOfferer: boolean) => void;
export type SignallingIceCandidateCallback = (
  candidate: RTCIceCandidate
) => void;

export class PeerToPeerSignallingSession {
  connected = false;
  members: string[] = [];

  private log = new Log("peerToPeerSignalling");

  private rtmClient!: RtmClient;
  private rtmChannel!: RtmChannel;

  constructor(
    private sessionName: string,
    private username: string,
    private sessionReadyCallback: SignallingSessionReadyCallback,
    private iceCandidateCallback: SignallingIceCandidateCallback
  ) {
    makeObservable<this, "setConnected">(this, {
      isOfferer: computed,
      connected: observable,
      members: observable,
      setConnected: action,
    });

    this.setupRtmClient();
  }

  // TODO make this work for n users
  get isOfferer() {
    return this.members.length === 2;
  }

  startSession = async () => {
    await this.rtmClient.login({ uid: this.username });
  };

  endSession = async () => {
    this.setConnected(false);

    try {
      if (this.rtmChannel) await this.rtmChannel.leave();
    } catch (e) {
      this.log.warn("endSession caught exception leaving channel", e);
    }

    try {
      await this.rtmClient.logout();
    } catch (e) {
      this.log.warn("endSession caught exception logging out", e);
    }
  };

  sendIceCandidate = (candidate: RTCIceCandidate) => {
    this.sendMessage({ eventType: "ICE_CANDIDATE", candidate });
  };

  private sendMessage = (message: Message): void => {
    if (!this.connected) {
      this.log.error("Tried to send message when not connected", message);
      return;
    }

    this.log.debug("sendMessage", message);

    this.rtmChannel.sendMessage({ text: JSON.stringify(message) });
  };

  private setupRtmClient = async (): Promise<void> => {
    if (!agoraConfig.appId) {
      throw new Error("peerToPeer: Agora app ID must be provided, see README");
    }

    this.rtmClient = AgoraRTM.createInstance(agoraConfig.appId, {
      logFilter: agoraConfig.logLevel,
    });

    this.rtmClient.on(
      "ConnectionStateChanged",
      this.handleConnectionStateChanged
    );
  };

  private setupRtmChannel = async (): Promise<void> => {
    this.rtmChannel = this.rtmClient.createChannel(this.sessionName);

    this.rtmChannel.on("MemberJoined", this.handleMemberJoined);
    this.rtmChannel.on("MemberLeft", this.handleMemberLeft);
    this.rtmChannel.on("MemberCountUpdated", this.updateMembers);
    this.rtmChannel.on("ChannelMessage", this.handleChannelMessage);

    await this.rtmChannel.join();
    await this.updateMembers();

    this.sessionReadyCallback(this.isOfferer);

    this.setConnected(true);
  };

  private setConnected = (state: boolean) => {
    this.connected = state;
  };

  private updateMembers = async () => {
    const members = await this.rtmChannel.getMembers();
    runInAction(() => {
      this.members = members;
    });
  };

  private handleConnectionStateChanged = async (
    state: RtmStatusCode.ConnectionState
  ): Promise<void> => {
    if (state === "CONNECTED" && !this.connected) {
      await this.setupRtmChannel();
    }
  };

  private handleMemberJoined = (memberId: string): void => {
    this.log.debug(`handleMemberJoined: ${memberId}`);
  };

  private handleMemberLeft = (memberId: string): void => {
    this.log.debug(`handleMemberLeft: ${memberId}`);
  };

  private handleChannelMessage = (rtmMessage: RtmMessage) => {
    if (rtmMessage.messageType !== "TEXT") {
      this.log.warn(
        `handleChannelMessage: Unexpected message type: ${rtmMessage.messageType}`,
        { rtmMessage }
      );
      return;
    }

    const message = JSON.parse(rtmMessage.text) as Message;
    this.log.debug("handleChannelMessage", message);

    switch (message.eventType) {
      case "ICE_CANDIDATE":
        this.iceCandidateCallback(message.candidate);
        break;
      default:
        this.log.warn(
          `handleChannelMessage: Unexpected eventType: ${message.eventType}`,
          { message }
        );
        break;
    }
  };
}
