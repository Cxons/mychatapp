/* eslint-disable no-unused-vars */
import React, { useState, useContext, useEffect, useRef } from "react";
import { socket } from "../socket";
import { dataContext } from "./FetchContacts";

function Chat() {
  const chatContext = useContext(dataContext);
  const realMessage = chatContext.messages.data;
  console.log(
    "the chat context is this",
    chatContext.chatInfo.recipientId,
    chatContext.chatInfo.conversationId,
    "the state",
    chatContext.loading,
    "the messages",
    chatContext.messages,
    "the real messages",
    realMessage
  );

  const [loadingState, setLoadingState] = useState(true);
  const [chatText, setChatText] = useState({
    chatText: "",
  });
  const [totalMessages, setTotalMessages] = useState([]);
  const [chatStatus, setChatStatus] = useState(false);
  const [socketMsg, setSocketMsg] = useState();
  const chatRef = useRef();
  const userName = localStorage.getItem("userName");
  const userId = localStorage.getItem("userId");
  useEffect(() => {
    setTotalMessages(realMessage);
    console.log("the total messages", totalMessages);
  }, [totalMessages]);

  console.log("the total messages", totalMessages);

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
      setSocketMsg(msg);
      console.log("the socket message", socketMsg);
    });
    setTotalMessages([
      ...totalMessages,
      {
        senderId: userId,
        receiverId: chatContext.chatInfo.recipientId,
        messageText: chatText.chatText,
      },
    ]);
    chatRef.current.value = "";
  }
  console.log("the new socket message", socketMsg);

  {
    return chatContext.chatInfo.recipientId != undefined ? (
      <div className="flex justify-center w-[100vw] min-h-[100vh]  bg-white flex-col">
        <div className="h-[5rem] w-[100%] bg-gray-100 text-[4rem] "></div>
        <div className=" mt-[4rem]  h-[80vh] w-[100%] overflow-auto no-scrollbar flex flex-col ">
          {totalMessages &&
            totalMessages.map((msg) => {
              const value = userId == msg.senderId || userId == msg.receiverId;
              console.log("the hard value", value);
              return value == false ? (
                <div
                  key={Math.random()}
                  className="flex max-w-[100vw] ml-[3rem]"
                >
                  <div className="flex justify-start my-2">
                    <div className="bg-gray-100 text-gray-800 p-2 rounded-lg shadow-md max-w-md">
                      <p>{msg.messageText}.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  key={Math.random()}
                  className="flex self-end mr-[4rem] my-2"
                >
                  <div className="bg-blue-500 text-white p-2 rounded-lg shadow-md max-w-md">
                    <p>{msg.messageText}</p>
                  </div>
                </div>
              );
            })}
          {/* {userId == socketMsg.sender ? (
            <div className="flex self-end max-w-[100vw] ml-[3rem]">
              <div className="flex  my-2">
                <div className="bg-blue-500 text-white p-2 rounded-lg shadow-md max-w-md mr-[4rem]">
                  <p>{socketMsg.message}.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex max-w-[100vw] ml-[3rem]">
              <div className="flex justify-start my-2">
                <div className="bg-gray-100 text-gray-800 p-2 rounded-lg shadow-md max-w-md">
                  <p>{socketMsg.message}</p>
                </div>
              </div>
            </div>
          )} */}
        </div>

        <form
          className="  w-[100%] h-[10vh] mt-[-3rem] flex"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            name="chatText"
            onChange={handleChange}
            placeholder="Type a Message..."
            className="h-[100%] bg-gray-100 w-[85%] indent-[2rem] text-[1.2rem]"
            id=""
            ref={chatRef}
          />
          <button className="text-black w-[15%] h-[100%] text-center bg-blue-400">
            Send
          </button>
        </form>
      </div>
    ) : (
      <div className="h-[100vh] w-[100vw] flex items-center justify-center text-[1.9rem] italic">
        Select a Chat to start a conversation with
      </div>
    );
  }
}

export default Chat;
