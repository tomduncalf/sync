export class PeerToPeerSession {
  private sessionName = "default";

  startSession = (sessionName: string): void => {
    this.sessionName = sessionName;
  };
}
