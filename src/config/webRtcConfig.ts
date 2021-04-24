export const webRtcConfig: RTCConfiguration = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

if (process.env.VIAGENIE_USERNAME && process.env.VIAGENIE_PASSWORD) {
  webRtcConfig.iceServers!.push({
    urls: "turn:numb.viagenie.ca:3478",
    username: process.env.VIAGENIE_USERNAME,
    credential: process.env.VIAGENIE_PASSWORD,
  });
}
