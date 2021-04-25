import AgoraRTM from "agora-rtm-sdk";

export const agoraConfig = {
  appId: process.env.REACT_APP_AGORA_APP_ID,
  logLevel: AgoraRTM.LOG_FILTER_ERROR,
};
