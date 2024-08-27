import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./home.css";
import { EthereumProvider } from "./context/EthereumContext";
// import { MoralisProvider } from "react-moralis";

import { http, createConfig, WagmiProvider } from "wagmi";
import { bscTestnet, mainnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'


import { BrowserRouter } from "react-router-dom";

const queryClient = new QueryClient()

const serverUrl = "https://odzn6qu9o4zo.usemoralis.com:2053/server";
const appId = "DhIkCD6RgzXux1tHt61zUUfy05Qw6YDg7P4F77TI";

// const { publicClient, webSocketPublicClient } = configureChains(
//   [bscTestnet],
//   [publicProvider()]
// );

const config = createConfig({
  // autoConnect: true,
  // publicClient,
  // webSocketPublicClient,
  chains: [bscTestnet],
  transports:{
    [mainnet.id] : http(),
    [bscTestnet.id] : http()
  }
});

ReactDOM.render(
  <BrowserRouter>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {/* <MoralisProvider serverUrl={serverUrl} appId={appId}> */}
          <EthereumProvider >
            <App />
          </EthereumProvider>
        {/* </MoralisProvider> */}
      </QueryClientProvider>
    </WagmiProvider>
  </BrowserRouter>,

  document.getElementById("root")
);
