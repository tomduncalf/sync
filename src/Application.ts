/**
 * The Application class is the main entry point into the business logic
 * of the application, and is responsible for wiring everything up.
 * It can be thought of as somewhat analogous to a MobX root store, but
 * less coupled to MobX concepts/terminology.
 */

import { SynchronisedClock } from "src/clock/SynchronisedClock";
import { PeerToPeerSession } from "src/peerToPeer/PeerToPeerSession";

export class Application {
  peerToPeerSession = new PeerToPeerSession("test", Math.random().toString());
  clock = new SynchronisedClock();

  constructor() {
    setInterval(() => {
      console.log(this.clock.localHostTime, this.clock.globalHostTime);
    }, 1000);
  }
}
