import { observer } from "mobx-react";
import React, { useEffect, useRef } from "react";
import { Application } from "src/Application";
import { PingMessage } from "src/peerToPeer/messages";

const application = new Application();

const App = observer(
  (): JSX.Element => {
    useEffect(() => {
      application.peerToPeerSession.registerMessageHandler(
        "PING",
        (message: PingMessage) => {
          console.log("handle ping");
        }
      );
    }, []);

    const join = () => {
      application.peerToPeerSession.startSession();
    };

    const leave = () => {
      application.peerToPeerSession.endSession();
    };

    const send = () => {
      application.peerToPeerSession.sendMessage({
        eventType: "PING",
        time: Date.now(),
      });
    };

    return (
      <div>
        <div>Synced DJ</div>
        <div>
          <a onClick={join}>Join</a>
        </div>
        <div>
          <a onClick={leave}>Leave</a>
        </div>
        <div>
          connected:{" "}
          {application.peerToPeerSession.connected ? "true" : "false"}
        </div>
        <div>
          isOfferer:{" "}
          {application.peerToPeerSession.isOfferer ? "true" : "false"}
        </div>
        <div>
          <a onClick={send}>Send</a>
        </div>
      </div>
    );
  }
);

export default App;
