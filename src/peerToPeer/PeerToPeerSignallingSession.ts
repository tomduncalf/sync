import AgoraRTM, {
  RtmChannel,
  RtmClient,
  RtmMessage,
  RtmStatusCode,
} from "agora-rtm-sdk";
import { computed, makeObservable, observable } from "mobx";
import { agoraConfig } from "src/config/agoraConfig";
import { debug, error, warn } from "src/logging/logging";

type Message = Record<string, unknown>;

export class PeerToPeerSignallingSession {
  connected = false;

  members: string[] = [];

  private rtmClient!: RtmClient;
  private rtmChannel!: RtmChannel;

  private sessionName: string;
  private username: string;

  constructor(sessionName: string, username: string) {
    makeObservable(this, {
      isMaster: computed,
      connected: observable,
      members: observable,
    });

    this.sessionName = sessionName;
    this.username = username;

    this.setupRtmClient();
  }

  get isMaster() {
    return this.members.length === 1;
  }

  startSession = async () => {
    await this.rtmClient.login({ uid: this.username });
  };

  endSession = async () => {
    this.connected = false;

    try {
      if (this.rtmChannel) await this.rtmChannel.leave();
    } catch (e) {
      warn("peerToPeer", "endSession caught exception leaving channel", e);
    }

    try {
      await this.rtmClient.logout();
    } catch (e) {
      warn("peerToPeer", "endSession caught exception logging out", e);
    }
  };

  // TODO message types
  sendMessage = (message: Message): void => {
    if (!this.connected) {
      error("peerToPeer", "Tried to send message when not connected", message);
      return;
    }

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
    debug("peerToPeer", `handleMemberJoined: ${memberId}`);
  };

  private handleMemberLeft = (memberId: string): void => {
    debug("peerToPeer", `handleMemberLeft: ${memberId}`);
  };

  private handleChannelMessage = (rtmMessage: RtmMessage) => {
    if (rtmMessage.messageType !== "TEXT") {
      debug(
        "peerToPeer",
        `handleChannelMessage: Unexpected message type: ${rtmMessage.messageType}`,
        { rtmMessage }
      );
      return;
    }

    const message = JSON.parse(rtmMessage.text);
    debug("peerToPeer", "handleChannelMessage", message);
  };
}
