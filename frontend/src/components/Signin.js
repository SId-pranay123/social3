import { useNavigate } from "react-router-dom";

import { useAccount, useConnect, useSignMessage, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import axios from "axios";

export default function SignIn() {
  const navigate = useNavigate();

  const { connectAsync } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const ServerUrl = "https://social3-1.onrender.com";

  const handleAuth = async () => {
    //disconnects the web3 provider if it's already active
    console.log("isconnected", isConnected);
    if (isConnected) {
      await disconnectAsync();
    }
    // enabling the web3 provider metamask
    const res = await connectAsync({
      connector: injected({ target: 'metaMask'}),
    });

    const { accounts, chainId } = res;

    const userData = { address: accounts[0], chain: chainId };

    console.log(userData);
    // making a post request to our 'request-message' endpoint
    const { data } = await axios.post(
      `${ServerUrl}/request-message`,
      userData,
      {
        headers: {
          "content-type": "application/json",
        },
      }
    );

    console.log(data);
    console.log("================================");
    const message = data.message;

    console.log(message);
    console.log("================================");
    // signing the received message via metamask
    const signature = await signMessageAsync({ message });

    console.log(signature);

    console.log("================================");

    const very = await axios.post(
      `${ServerUrl}/verify`,
      {
        message,
        signature,
      },
      { withCredentials: true } // set cookie from Express server
    );

    console.log("cooky========",very);

    console.log("================================");

    // redirect to /user
    navigate("/user");
  };

  return (
    <div>
      <h3>Web3 Authentication</h3>
      <button onClick={() => handleAuth()}>Authenticate via MetaMask</button>
    </div>
  );
}