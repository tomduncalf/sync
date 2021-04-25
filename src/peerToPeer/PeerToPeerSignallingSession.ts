import AgoraRTM, {
  RtmChannel,
  RtmClient,
  RtmMessage,
  RtmStatusCode,
} from "agora-rtm-sdk";
import { computed, makeObservable, observable } from "mobx";
import { agoraConfig } from "src/config/agoraConfig";
import { Log } from "src/logging/Log";

type IceCandidateMessage = {
  eventType: "ICE_CANDIDATE";
  candidate: RTCIceCandidate;
};

type Message = IceCandidateMessage;

export type SignallingSessionReadyCallback = (isOfferer: boolean) => void;

export class PeerToPeerSignallingSession {
  connected = false;
  members: string[] = [];

  private log = new Log("peerToPeerSignalling");

  private rtmClient!: RtmClient;
  private rtmChannel!: RtmChannel;

  private sessionName: string;
  private username: string;

  private sessionReadyCallback: SignallingSessionReadyCallback;

  constructor(
    sessionName: string,
    username: string,
    sessionReadyCallback: SignallingSessionReadyCallback
  ) {
    makeObservable(this, {
      isOfferer: computed,
      connected: observable,
      members: observable,
    });

    this.sessionName = sessionName;
    this.username = username;

    this.sessionReadyCallback = sessionReadyCallback;

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
    this.connected = false;

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

    this.log.debug("sendMessage signalling", message);

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

    this.connected = true;
  };

  private updateMembers = async () => {
    this.members = await this.rtmChannel.getMembers();
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

    const message = JSON.parse(rtmMessage.text);
    this.log.debug("peerToPeerSignalling", "handleChannelMessage", message);
  };
}
