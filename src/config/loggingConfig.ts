export const loggingConfig = {
  enabled: {
    trace: false,
    debug: true,
    warn: true,
    error: true,
  },
  modules: {
    peerToPeer: { trace: true, debug: true, warn: true },
    peerToPeerSignalling: { trace: true, debug: true, warn: true },
    peerToPeerWebRtc: { trace: true, debug: true, warn: true },
  },
};
