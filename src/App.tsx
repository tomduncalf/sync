import React from "react";
import { PeerToPeerSignalling } from "src/peerToPeer/PeerToPeerSignalling";

function App() {
  const signalling = new PeerToPeerSignalling();

  return <div>Synced DJ</div>;
}

export default App;
