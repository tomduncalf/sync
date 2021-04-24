export class PeerToPeerSession {
  private sessionName = "default";

  constructor() {}

  startSession = (sessionName: string) => {
    this.sessionName = sessionName;
  };
}
