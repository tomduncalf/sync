import AgoraRTM, { RtmClient } from "agora-rtm-sdk";
import { agoraConfig } from "src/config/agoraConfig";

export class PeerToPeerSignalling {
  rtmClient!: RtmClient;

  constructor() {
    if (!agoraConfig.APP_ID) {
      throw new Error("peerToPeer: Agora app ID must be provided, see README");
    }

    this.rtmClient = AgoraRTM.createInstance(agoraConfig.APP_ID);
  }
}
