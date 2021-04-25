export const loggingConfig = {
  enabled: {
    debug: true,
    warn: true,
    error: true,
  },
  modules: {
    peerToPeer: { debug: true, warn: true },
    peerToPeerSignalling: { debug: true, warn: true },
    peerToPeerWebRtc: { debug: true, warn: true },
  },
};
