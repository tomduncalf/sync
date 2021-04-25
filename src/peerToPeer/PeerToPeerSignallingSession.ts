import AgoraRTM, {
  RtmChannel,
  RtmClient,
  RtmMessage,
  RtmStatusCode,
} from "agora-rtm-sdk";
import { makeAutoObservable, runInAction } from "mobx";
import { agoraConfig } from "src/config/agoraConfig";
import { Log } from "src/logging/Log";

interface BaseMessage {
  eventType: string;
}

interface IceCandidateMessage extends BaseMessage {
  eventType: "ICE_CANDIDATE";
  candidate: RTCIceCandidate;
}

interface SessionDescriptionMessage extends BaseMessage {
  eventType: "SESSION_DESCRIPTION";
  description: RTCSessionDescriptionInit;
}

type Message = IceCandidateMessage | SessionDescriptionMessage;

export type SignallingSessionReadyCallback = (isOfferer: boolean) => void;

export type SignallingIceCandidateCallback = (
  candidate: RTCIceCandidate
) => void;

export type SignallingSessionDescriptionCallback = (
  description: RTCSessionDescriptionInit
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
    private iceCandidateCallback: SignallingIceCandidateCallback,
    private sessionDescriptionCallback: SignallingSessionDescriptionCallback
  ) {
    makeAutoObservable(this);

    this.setupRtmClient();
  }

  // TODO make this work for n users
  get isOfferer(): boolean {
    return this.members.length === 2;
  }

  startSession = async (): Promise<void> => {
    await this.rtmClient.login({ uid: this.username });
  };

  endSession = async (): Promise<void> => {
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

  sendIceCandidate = (candidate: RTCIceCandidate): void => {
    this.sendMessage({ eventType: "ICE_CANDIDATE", candidate });
  };

  sendSessionDescription = (description: RTCSessionDescriptionInit): void => {
    this.sendMessage({ eventType: "SESSION_DESCRIPTION", description });
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
    this.setMembers(members);
  };

  private setMembers = (members: string[]) => {
    this.members = members;
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

  // TODO should we be using direct p2p messages instead of channel?
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
      case "SESSION_DESCRIPTION":
        this.sessionDescriptionCallback(message.description);
        break;
      default:
        this.log.warn(`handleChannelMessage: Unexpected eventType`, {
          message,
        });
        break;
    }
  };
}
