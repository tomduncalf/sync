import { observer } from "mobx-react";
import React, { useRef } from "react";
import { PeerToPeerSession } from "src/peerToPeer/PeerToPeerSession";

const App = observer(
  (): JSX.Element => {
    const session = useRef(
      new PeerToPeerSession("test8", Math.random().toString())
    );

    const join = () => {
      session.current.startSession();
    };

    const leave = () => {
      session.current.endSession();
    };

    const send = () => {
      // signalling.current?.sendMessage({ type: "test", value: Math.random() });
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
