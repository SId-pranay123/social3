import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import config from '../config/config';
import abi from '../contract/ChirpingABI.json';
const EthereumContext = createContext();

export const useEthereum = () => useContext(EthereumContext);

export const EthereumProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [contract, setContract] = useState(null);
    // console.log("config", config.contractAddress)

    const contractAddress = config.contractAddress;
    // Function to connect wallet and authenticate user
    const authenticate = async () => {
        try {

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, abi, signer);

            const contractWithSigner = contract.connect(await signer);

            // Request account access if needed 
            const accounts = await provider.send("eth_requestAccounts", []);

            // console.log("currUser = ", await contractWithSigner.showCurrUser(accounts[0]));
            console.log("accounts - ", accounts, accounts.length > 0)
            if (accounts.length > 0) {
                setContract(contractWithSigner);
                setUser(accounts[0]);
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
                setUser(null);
                console.error("No account found. Make sure MetaMask is connected.");
            }
        } catch (error) {
            setIsAuthenticated(false);
            setUser(null);
            console.error("Failed to authenticate:", error);
        }
    };

    // Function to logout the user
    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
    };

    // Automatically attempt to connect when component mounts
    // useEffect(() => {
    //     console.log("isAuthenticated", isAuthenticated);
    //     console.log("user", user);
    // }, [user, isAuthenticated]);

    // Provide state and functions to the context
    const value = {
        isAuthenticated,
        user,
        authenticate,
        logout,
        contract
    };

    return (
        <EthereumContext.Provider value={value}>
            {children}
        </EthereumContext.Provider>
    );
};