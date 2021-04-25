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
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  webRtcConfig.iceServers!.push({
    urls: process.env.REACT_APP_TURN_SERVER_URL,
    username: process.env.REACT_APP_TURN_SERVER_USERNAME,
    credential: process.env.REACT_APP_TURN_SERVER_PASSWORD,
  });
}
