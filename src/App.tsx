import { autorun } from "mobx";
import { observer } from "mobx-react";
import React, { useEffect, useRef } from "react";
import { PingMessage } from "src/peerToPeer/messages";
import { PeerToPeerSession } from "src/peerToPeer/PeerToPeerSession";

const App = observer(
  (): JSX.Element => {
    const session = useRef(
      new PeerToPeerSession("test3", Math.random().toString())
    );

    useEffect(() => {
      session.current.registerMessageHandler("PING", (message: PingMessage) => {
        console.log("handle ping");
      });
    }, []);

    const join = () => {
      session.current.startSession();
    };

    const leave = () => {
      session.current.endSession();
    };

    const send = () => {
      session.current.sendMessage({
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
        <div>connected: {session.current.connected ? "true" : "false"}</div>
        <div>isOfferer: {session.current.isOfferer ? "true" : "false"}</div>
        <div>
          <a onClick={send}>Send</a>
        </div>
      </div>
    );
  }
);

export default App;
