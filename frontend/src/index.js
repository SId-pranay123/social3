import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./home.css";
import { EthereumProvider } from "./context/EthereumContext";

import { http, createConfig, WagmiProvider } from "wagmi";
import { bscTestnet, mainnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'


import { BrowserRouter } from "react-router-dom";

const queryClient = new QueryClient()


const config = createConfig({
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
          <EthereumProvider >
            <App />
          </EthereumProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </BrowserRouter>,

  document.getElementById("root")
);
