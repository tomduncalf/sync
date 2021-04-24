import { warn } from "src/logging/logging";

export const webRtcConfig: RTCConfiguration = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

if (
  process.env.REACT_APP_VIAGENIE_USERNAME &&
  process.env.REACT_APP_VIAGENIE_PASSWORD
) {
  webRtcConfig.iceServers!.push({
    urls: "turn:numb.viagenie.ca:3478",
    username: process.env.REACT_APP_VIAGENIE_USERNAME,
    credential: process.env.REACT_APP_VIAGENIE_PASSWORD,
  });
}

if (
  process.env.REACT_APP_TURN_SERVER_URL &&
  process.env.REACT_APP_TURN_SERVER_USERNAME &&
  process.env.REACT_APP_TURN_SERVER_PASSWORD
) {
  webRtcConfig.iceServers!.push({
    urls: process.env.REACT_APP_TURN_SERVER_URL,
    username: process.env.REACT_APP_TURN_SERVER_USERNAME,
    credential: process.env.REACT_APP_TURN_SERVER_PASSWORD,
  });
}

if (webRtcConfig.iceServers!.length < 2) {
  warn(
    "peerToPeer",
    "No TURN server is configured which may result in connectivity issues, see README"
  );
}
