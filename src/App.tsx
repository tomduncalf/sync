import React, { useRef } from "react";
import { PeerToPeerSignallingSession } from "src/peerToPeer/PeerToPeerSignallingSession";

function App(): JSX.Element {
  const signalling = useRef<PeerToPeerSignallingSession | null>(null);

  const join = () => {
    signalling.current = new PeerToPeerSignallingSession(
      "test",
      Math.random().toString()
    );
  };

  const send = () => {
    signalling.current?.sendMessage({ type: "test", value: Math.random() });
  };

  return (
    <div>
      Synced DJ <a onClick={join}>Join</a> <a onClick={send}>Send</a>
    </div>
  );
}

export default App;
