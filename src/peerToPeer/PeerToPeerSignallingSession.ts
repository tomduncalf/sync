import AgoraRTM, {
  RtmChannel,
  RtmClient,
  RtmMessage,
  RtmStatusCode,
} from "agora-rtm-sdk";
import { agoraConfig } from "src/config/agoraConfig";
import { debug, error } from "src/logging/logging";

type Message = Record<string, unknown>;

export class PeerToPeerSignallingSession {
  private rtmClient!: RtmClient;
  private rtmChannel!: RtmChannel;

  private sessionName: string;
  private username: string;

  private connected = false;

  constructor(sessionName: string, username: string) {
    this.sessionName = sessionName;
    this.username = username;

    this.setupRtmClient();
  }

  // TODO message types
  sendMessage = (message: Message): void => {
    if (!this.connected) {
      error("peerToPeer", "Tried to send message when not connected", message);
      return;
    }

    this.rtmChannel.sendMessage({ text: JSON.stringify(message) });
  };

  private setupRtmClient = async (): Promise<void> => {
    if (!agoraConfig.APP_ID) {
      throw new Error("peerToPeer: Agora app ID must be provided, see README");
    }

    this.rtmClient = AgoraRTM.createInstance(agoraConfig.APP_ID);
    this.rtmClient.on(
      "ConnectionStateChanged",
      this.handleConnectionStateChanged
    );

    await this.rtmClient.login({ uid: this.username });
  };

  private setupRtmChannel = async (): Promise<void> => {
    this.rtmChannel = this.rtmClient.createChannel(this.sessionName);

    this.rtmChannel.on("MemberJoined", this.handleMemberJoined);
    this.rtmChannel.on("ChannelMessage", this.handleChannelMessage);

    await this.rtmChannel.join();
    this.connected = true;
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
