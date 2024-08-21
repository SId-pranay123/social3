import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import axios from 'axios';

export default function User() {
  const navigate = useNavigate();

  const [session, setSession] = useState({});

  const ServerUrl = "https://social3-1.onrender.com";


  useEffect(() => {
    axios(`${ServerUrl}/authenticate`, {
      withCredentials: true,
    })
      .then(({ data }) => {
        console.log("data",data);
        const { iat, ...authData } = data; // remove unimportant iat value

        setSession(authData);
      })
      .catch((err) => {
        navigate('/signin');
      });
  }, []);

  async function signOut() {
    await axios(`${ServerUrl}/logout`, {
      withCredentials: true,
    });

    navigate('/signin');
  }

  return (
    <div>
      <h3>User session:</h3>
      <pre>{JSON.stringify(session, null, 2)}</pre>
      <button type="button" onClick={signOut}>
        Sign out
      </button>
    </div>
  );
}