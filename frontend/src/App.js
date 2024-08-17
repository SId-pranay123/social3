import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Homepage from "./components/Hompage";
import LandingPage from "./components/LandingPage";
import Signin from "./components/Signin";
import User from "./components/User";
// import { createConfig, configureChains, WagmiConfig } from "wagmi";
// import { publicProvider } from "wagmi/providers/public";
// import { bscTestnet } from "wagmi/chains";

function App() {

  // const { publicClient, webSocketPublicClient } = configureChains(
  //   [bscTestnet],
  //   [publicProvider()]
  // );

  // const config = createConfig({
  //   autoConnect: true,
  //   publicClient,
  //   webSocketPublicClient,
  // });

  return (
    <div>
      <Routes>
        <Route exact path="/" element={<LandingPage />}></Route>
        <Route exact path="/signin" element={<Signin />}></Route>
        <Route exact path="/user" element={<User />}></Route>
        <Route exact path="/home" element={<Homepage/>}></Route>
        <Route exact path="/myChirpings" element={<Homepage/>}></Route>
        <Route exact path="/caged" element={<Homepage/>}></Route>
        <Route exact path="/myAccount" element={<Homepage/>}></Route>
      </Routes>
    </div>
  );
}

export default App;
