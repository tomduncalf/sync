/**
 * A monotonic high-resolution clock (like Performance.now()) which is synchronised
 * between peers, giving us a "shared timeline". We refer to the synchronised time
 * as the "global host time".
 *
 * Every peer should see (approximately) the same global host time for a given "real
 * clock" time, allowing us to ensure both parties are hearing the same track at the same
 * time, and that any timing sensitive actions (e.g. playing or changing pitch) can be
 * described in terms of an absolute reference time so we can compensate for latency.
 *
 * It uses PING/PONG messages to measure clock deviation between peers, and then uses
 * a Kalman filter to smooth the deviation measurements as they may be noisy. This will
 * implicitly be corrected for latency, but we also measure the latency to give users an
 * idea of how late the other peer will hear their actions.
 *
 * See also: ClockSynchroniser which performs the synchronisation
 *
 * Inspired by Ableton's Link system, see for more details on how this works:
 * - https://depositonce.tu-berlin.de/bitstream/11303/7886/4/LAC2018_proceedings.pdf#page=51
 * - https://media.ccc.de/v/lac2018-42-ableton_link_a_technology_to_synchronize_music_software
 * - https://github.com/Ableton/link
 */

export class SynchronisedClock {
  private localToGlobalOffset = 0;

  get globalHostTime() {
    return this.localToGlobalHostTime(this.localHostTime);
  }

  get localHostTime() {
    return performance.now();
  }

  setLocaltoGlobalOffset = (offset: number) => {
    this.localToGlobalOffset = offset;
  };

  // TODO make this a linear function rather than purely an offset
  private localToGlobalHostTime = (time: number) =>
    time + this.localToGlobalOffset;
}
