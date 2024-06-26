/* eslint-disable no-unused-vars */
import React, {
  useState,
  useContext,
  useEffect,
  useRef,
  createContext,
} from "react";
import { socket } from "../socket";
import { dataContext } from "./FetchContacts";

function Chat() {
  const chatContext = useContext(dataContext);
  const { getChildData } = chatContext;
  const realMessage = chatContext.messages.data;
  const [onState, setOnState] = useState(true);
  const [chatText, setChatText] = useState({
    chatText: "",
  });
  const [totalMessages, setTotalMessages] = useState([]);
  const [messages, setMessages] = useState();
  const [sentStatus, setSentStatus] = useState(false);
  const [socketMsg, setSocketMsg] = useState();
  const chatRef = useRef();
  const userName = localStorage.getItem("userName");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fn = async () => {
      const result = await fetch(
        "http://localhost:4500/chat/getMessagesForChat",
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
            getSetCookie: true,
          },
          credentials: "include",
          body: JSON.stringify({
            chatId: chatContext.chatInfo.conversationId,
          }),
        }
      );
      const res = await result.json();
      setMessages(res.data);
    };
    fn();
  }, [chatContext, socketMsg]);

  function handleChange(e) {
    e.preventDefault();
    setChatText({
      ...chatText,
      [e.target.name]: e.target.value,
    });
  }
  function handleKeyDown(e) {
    if (e.shiftKey && e.key === "Enter") {
      // Prevent the default behavior (line break in textarea)
      e.preventDefault();
      // Get the current cursor position
      const cursorPosition = chatRef.current.selectionStart;
      const currentValue = chatRef.current.value;
      // Insert a newline character at the cursor position
      const newValue =
        currentValue.substring(0, cursorPosition) +
        "\n" +
        currentValue.substring(cursorPosition);
      // Update the textarea value and cursor position
      chatRef.current.value = newValue;
      chatRef.current.selectionStart = cursorPosition + 1;
      chatRef.current.selectionEnd = cursorPosition + 1;
    }
  }

  socket.on("receivedMessage", (msg) => {
    setSocketMsg(msg);
    setSentStatus((prev) => !prev);
    getChildData(sentStatus);
  });
  function handleSubmit(e) {
    e.preventDefault();
    const date = new Date();
    if (chatText.chatText == "") {
      return;
    } else {
      let receiver;
      if (chatContext.chatInfo.recipientId == userId) {
        receiver = chatContext.chatInfo.creatorId;
      } else if (chatContext.chatInfo.creatorId == userId) {
        receiver = chatContext.chatInfo.recipientId;
      }
      socket.emit("chatInfo", {
        userId: userId,
        recipientId: receiver,
        chatText: chatText.chatText,
        conversationId: chatContext.chatInfo.conversationId,
        sentAt: date,
      });
      getChildData(sentStatus);
    }
    setTotalMessages([
      ...messages,
      {
        senderId: userId,
        receiverId: chatContext.chatInfo.recipientId,
        messageText: chatText.chatText,
      },
    ]);
    chatRef.current.value = "";
  }

  {
    return chatContext.chatInfo.recipientId != undefined ? (
      <div className="flex justify-center w-[100vw] min-h-[100vh]  bg-white flex-col">
        <div className="h-[5rem] w-[100%] bg-gray-100 flex items-center">
          <div className="w-[3.3rem] h-[3.3rem] bg-blue-400 rounded-full ml-[2.7rem]"></div>
          <div className="text-[2rem] ml-[2rem]">
            {chatContext.recipientName}{" "}
          </div>
        </div>
        <div className=" mt-[4rem]  h-[70vh] w-[100%] overflow-auto no-scrollbar flex flex-col ">
          {messages == undefined ? (
            <div>getting messages...</div>
          ) : (
            messages.map((msg) => {
              const value = userId == msg.senderId;
              return value == false ? (
                <div
                  key={Math.random()}
                  className="flex max-w-[100vw] ml-[3rem]"
                >
                  <div className="flex justify-start my-2">
                    <div className="bg-gray-100 text-gray-800 p-2 rounded-lg shadow-md max-w-md">
                      <p>{msg.messageText}.</p>
                      <p className="text-right text-[.7rem] text-gray-700 font-bold mt-[.5rem]">
                        {msg.sentAt}
                      </p>
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
                    <p className="text-right text-[.7rem] text-white font-bold mt-[.5rem]">
                      {msg.sentAt}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {/* {socketMsg == undefined ? (
          <div></div>
        ) : (
          <div className="text-[2rem]">{socketMsg.message}</div>
        )} */}
        <form
          className="  w-[100%] h-[10vh] mt-[0rem] flex"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            name="chatText"
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a Message..."
            className="h-[100%] bg-gray-100 w-[85%] indent-[2rem] text-[1.2rem]"
            id=""
            ref={chatRef}
            rows={5}
          />
          <button className="text-black w-[15%] h-[100%] font-semibold text-[1.2rem] text-center bg-blue-400">
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
