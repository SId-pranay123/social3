const express = require("express");
const Moralis = require("moralis").default;
const { EvmChain } = require("@moralisweb3/common-evm-utils");
const bodyParser = require("body-parser");
const { ethers } = require("ethers");
const app = express();
const port = 4000;
const cors = require("cors");
const ChirpingContractABI = require("./ChirpingContractABI.json");
require("dotenv").config();

const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:4000", "https://test--venerable-griffin-1ab342.netlify.app/", "https://social3-2.onrender.com"],
    credentials: true,
  })
);

const config = {
  domain: process.env.APP_DOMAIN,
  statement: "Please sign this message to confirm your identity.",
  uri: process.env.REACT_URL,
  timeout: 60,
};

const MORALIS_API_KEY = process.env.MORALIS_API_KEY;
const address = "0xa0791eBf8d2bBe2C8c5391f648c4F607178062A1";
const provider = new ethers.JsonRpcProvider(
  "https://data-seed-prebsc-1-s1.binance.org:8545/"
);
const privateKey =
  "f46e7f0936b479bba879c9f764259d1e5838aa015232f0018a1c07214e491812";
const wallet = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(address, ChirpingContractABI, wallet);

app.post("/request-message", async (req, res) => {
  console.log("request-message");
  const { address, chain, network } = req.body;

  console.log("request-message initiated", address, chain);

  try {
    const message = await Moralis.Auth.requestMessage({
      address,
      chain,
      ...config,
    });

    res.status(200).json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
    console.error(error);
  }
});

app.post("/verify", async (req, res) => {
  try {
    const { message, signature } = req.body;

    const { address, profileId } = (
      await Moralis.Auth.verify({
        message,
        signature,
        networkType: "evm",
      })
    ).raw;

    const user = { address, profileId, signature };

    // create JWT token
    const token = jwt.sign(user, process.env.AUTH_SECRET);

    // set JWT cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development", // Secure should be true in production
      sameSite: "strict", // 'Strict' is safest, but consider 'lax' or 'none' for cross-site requests
    });

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
    console.error(error);
  }
});

app.get("/authenticate", async (req, res) => {
  // console.log("cookies check", req);
  const token = req.cookies.jwt;
//   console.log("tokenbhola", token);
  if (!token) return res.sendStatus(403); // if the user did not send a jwt token, they are unauthorized
  console.log("token", token);
  try {
    const data = jwt.verify(token, process.env.AUTH_SECRET);
    console.log("data", data);
    res.json(data);
  } catch {
    return res.sendStatus(403);
  }
  //   return res.json("Hello");
});

app.get("/logout", async (req, res) => {
  try {
    res.clearCookie("jwt");
    return res.sendStatus(200);
  } catch {
    return res.sendStatus(403);
  }
});

app.post("/webhook", async (req, res) => {
  const { body } = req;

  try {
    console.log("Received webhook data:", body);
    res.status(200).json({ message: "Webhook received" });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(400).json({ error: error.message });
  }
});

app.post("/addChirping", async (req, res) => {
  try {
    const { numOfCharacters, chirpingText, chirpingImage, userAddress } =
      req.body;
    const options = {
      address: address,
      functionName: "addChirping",
      abi: ChirpingContractABI,
      chain: EvmChain.SEPOLIA,
      params: {
        _numOfCharacters: numOfCharacters,
        _chirpingText: chirpingText,
        _chirpingImage: chirpingImage,
      },
    };
    const transaction = await Moralis.EvmApi.utils.runContractFunction(options);
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/addUser", async (req, res) => {
  try {
    const { userAddress, displayPicture } = req.body;

    // Validate input
    if (!userAddress || !displayPicture) {
      return res
        .status(400)
        .json({ error: "userAddress and displayPicture are required" });
    }

    // Send the transaction
    const tx = await contract.addUser(userAddress, displayPicture);

    // Wait for the transaction to be mined
    const receipt = await tx.wait();

    // Return the transaction receipt to the client
    res.json({ success: true, receipt });
  } catch (error) {
    console.error("Error in /addUser:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get("/getAllChirpings", async (req, res) => {
  try {
    const options = {
      address: address,
      functionName: "getAllChirpings",
      abi: ChirpingContractABI,
      chain: EvmChain.SEPOLIA,
    };
    const chirpings = await Moralis.EvmApi.utils.runContractFunction(options);
    res.json(chirpings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/getMyChirpings", async (req, res) => {
  try {
    const { userAddress } = req.query;
    const options = {
      address: address,
      functionName: "getMyChirpings",
      abi: ChirpingContractABI,
      chain: EvmChain.SEPOLIA,
      params: {
        user: userAddress,
      },
    };
    const chirpings = await Moralis.EvmApi.utils.runContractFunction(options);
    res.json(chirpings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/getCagedChirpings", async (req, res) => {
  try {
    const { userAddress } = req.query;
    const options = {
      address: address,
      functionName: "getCagedChirpings",
      abi: ChirpingContractABI,
      chain: EvmChain.SEPOLIA,
      params: {
        user: userAddress,
      },
    };
    const chirpings = await Moralis.EvmApi.utils.runContractFunction(options);
    res.json(chirpings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/givingWings", async (req, res) => {
  try {
    const { chirpingId } = req.body;
    const options = {
      address: address,
      functionName: "givingWings",
      abi: ChirpingContractABI,
      chain: EvmChain.SEPOLIA,
      params: {
        _chirpingId: chirpingId,
      },
    };
    const transaction = await Moralis.EvmApi.utils.runContractFunction(options);
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/givingCage", async (req, res) => {
  try {
    const { chirpingId } = req.body;
    const options = {
      address: address,
      functionName: "givingCage",
      abi: ChirpingContractABI,
      chain: EvmChain.SEPOLIA,
      params: {
        _chirpingId: chirpingId,
      },
    };
    const transaction = await Moralis.EvmApi.utils.runContractFunction(options);
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/showUsers", async (req, res) => {
  // console.log("showUsers");
  try {
    const options = {
      address: address,
      functionName: "showUsers",
      abi: ChirpingContractABI,
      chain: EvmChain.SEPOLIA,
    };
    const users = await Moralis.EvmApi.utils.runContractFunction(options);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/showCurrUser", async (req, res) => {
  try {
    const { userAddress } = req.query;
    const options = {
      address: address,
      functionName: "showCurrUser",
      abi: ChirpingContractABI,
      chain: EvmChain.SEPOLIA,
      params: {
        user: userAddress,
      },
    };
    const user = await Moralis.EvmApi.utils.runContractFunction(options);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/promoteLevel", async (req, res) => {
  try {
    const options = {
      address: address,
      functionName: "promoteLevel",
      abi: ChirpingContractABI,
      chain: EvmChain.SEPOLIA,
    };
    const transaction = await Moralis.EvmApi.utils.runContractFunction(options);
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/wingsGivenCheck", async (req, res) => {
  try {
    const { chirpingId, userAddress } = req.body;
    const options = {
      address: address,
      functionName: "wingsGivenCheck",
      abi: ChirpingContractABI,
      chain: EvmChain.SEPOLIA,
      params: {
        _chirpingId: chirpingId,
        _user: userAddress,
      },
    };
    const result = await Moralis.EvmApi.utils.runContractFunction(options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/cagesGivenCheck", async (req, res) => {
  try {
    const { chirpingId, userAddress } = req.body;
    const options = {
      address: address,
      functionName: "cagesGivenCheck",
      abi: ChirpingContractABI,
      chain: EvmChain.SEPOLIA,
      params: {
        _chirpingId: chirpingId,
        _user: userAddress,
      },
    };
    const result = await Moralis.EvmApi.utils.runContractFunction(options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/addName", async (req, res) => {
  try {
    const { userName } = req.body;
    const options = {
      address: address,
      functionName: "addName",
      abi: ChirpingContractABI,
      chain: EvmChain.SEPOLIA,
      params: {
        _name: userName,
      },
    };
    const transaction = await Moralis.EvmApi.utils.runContractFunction(options);
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/changeDisplayPicture", async (req, res) => {
  try {
    const { imageURL } = req.body;
    const options = {
      address: address,
      functionName: "changeDisplayPicture",
      abi: ChirpingContractABI,
      chain: EvmChain.SEPOLIA,
      params: {
        _imageURL: imageURL,
      },
    };
    const transaction = await Moralis.EvmApi.utils.runContractFunction(options);
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/balances", async (req, res) => {
  try {
    const [nativeBalance, tokenBalances] = await Promise.all([
      Moralis.EvmApi.balance.getNativeBalance({
        chain: EvmChain.SEPOLIA,
        address,
      }),
      Moralis.EvmApi.token.getWalletTokenBalances({
        chain: EvmChain.SEPOLIA,
        address,
      }),
    ]);

    res.status(200).json({
      address,
      nativeBalance: nativeBalance.result.balance.ether,
      tokenBalances: tokenBalances.result.map((token) => token.display()),
    });
  } catch (error) {
    console.error("Error fetching balances:", error);
    res.status(500).json({ error: error.message });
  }
});

const startServer = async () => {
  await Moralis.start({
    apiKey: process.env.MORALIS_API_KEY,
  });

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};

startServer();