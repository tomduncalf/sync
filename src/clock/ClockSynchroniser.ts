import { SynchronisedClock } from "src/clock/SynchronisedClock";
import { PeerToPeerSession } from "src/peerToPeer/PeerToPeerSession";

export class ClockSynchroniser {
  private pingInterval?: NodeJS.Timer;
  private pingIntervalDurationMs = 1000;

  constructor(
    private clock: SynchronisedClock,
    private peerToPeerSession: PeerToPeerSession
  ) {}

  start = () => {
    this.pingInterval = setInterval(this.sendPing, this.pingIntervalDurationMs);
  };

  stop = () => {
    if (this.pingInterval) clearInterval(this.pingInterval);
  };

  private sendPing = () => {
    this.peerToPeerSession.sendMessage({
      eventType: "PING",
      globalHostTime: this.clock.globalHostTime,
    });
  };
}
