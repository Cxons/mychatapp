/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function Connect() {
  const { id } = useParams();
  const userId = localStorage.getItem("userId");
  const [name, setName] = useState();
  useEffect(() => {
    const getName = async () => {
      try {
        const res = await fetch("http://localhost:4500/chat/getName", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
            getSetCookie: true,
          },
          credentials: "include",
          body: JSON.stringify({
            userId: id,
          }),
        });
        const response = await res.json();
        console.log("this is the response", response);
        setName(response.data);
      } catch (err) {
        console.log(err);
      }
    };
    getName();
  });
  function handleSubmit(e) {
    e.preventDefault();
    const confirmInvite = async () => {
      const res = await fetch("http://localhost:4500/chat/startChat", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          getSetCookie: true,
        },
        credentials: "include",
        body: JSON.stringify({
          senderId: id,
          recipientId: userId,
        }),
      });
      const result = await res.json();
      console.log("the gotten result", result);
    };
    confirmInvite();
  }
  return (
    <main className="h-[100vh] w-[100vw] flex items-center justify-center">
      <div className="w-[18rem] h-[15rem] bg-blue-400 rounded-lg flex flex-col items-center justify-center space-y-[2rem]">
        <p className="text-white font-[3rem] font-bold w-[7rem]">
          {name} {""}
          invites you to become a contact
        </p>
        <button
          onClick={handleSubmit}
          className="border-[0.02rem] rounded-sm h-[3rem] hover:bg-blue-500 w-[9rem] bg-blue-600 text-white text-center"
        >
          Accept Invite
        </button>
      </div>
    </main>
  );
}

export default Connect;
