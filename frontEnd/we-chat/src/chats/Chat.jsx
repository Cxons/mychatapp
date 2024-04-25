/* eslint-disable no-unused-vars */
import React, { useState, useContext } from "react";
import { socket } from "../socket";
import { dataContext } from "./FetchContacts";

function Chat() {
  const chatContext = useContext(dataContext);
  console.log(
    "the chat context is this",
    chatContext.chatInfo.recipientId,
    chatContext.chatInfo.conversationId,
    "the state",
    chatContext.loading,
    "the messages",
    chatContext.messages
  );
  const [chatText, setChatText] = useState({
    chatText: "",
  });
  const [chatStatus, setChatStatus] = useState(false);
  const userName = localStorage.getItem("userName");
  const userId = localStorage.getItem("userId");
  console.log("the userName", userName, "the userId", userId);
  function handleChange(e) {
    e.preventDefault();
    setChatText({
      ...chatText,
      [e.target.name]: e.target.value,
    });
    console.log(chatText.chatText);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setChatStatus((prev) => !prev);
    console.log("this is it", chatText, chatStatus);
    const date = new Date();
    socket.emit("chatInfo", {
      userId: userId,
      recipientId: chatContext.chatInfo.recipientId,
      chatText: chatText.chatText,
      conversationId: chatContext.chatInfo.conversationId,
      sentAt: date,
    });
    socket.on("receivedMessage", (msg) => {
      console.log("this is the received message", msg);
    });
  }
  return (
    <div className="flex justify-center w-[100vw] min-h-[100vh] bg-white  flex-col">
      <div className="h-[20%] w-[100%] bg-gray-100 text-[4rem]">{userName}</div>
      <div>
        {chatStatus ? (
          <div className="text-black">{chatText.chatText}</div>
        ) : (
          <div>{userId}</div>
        )}
      </div>

      <form
        className="  w-[100%] h-[10vh] my-[73.9vh] flex"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          name="chatText"
          onChange={handleChange}
          placeholder="Type a Message..."
          className="h-[4rem] bg-gray-100 w-[85%] indent-[2rem] text-[1.2rem]"
          id=""
        />
        <button className="text-black w-[15%] text-center bg-blue-400">
          Send
        </button>
      </form>
    </div>
  );
}

export default Chat;
