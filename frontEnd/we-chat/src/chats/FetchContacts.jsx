/* eslint-disable no-unused-vars */
import React, { useEffect, useState, createContext, Children } from "react";
import { Outlet } from "react-router-dom";

export const dataContext = createContext();
function FetchContacts({ children }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatInfo, setChatInfo] = useState();
  const [messages, setMessages] = useState();
  useEffect(() => {
    const getContacts = async () => {
      try {
        const data = await fetch("http://localhost:4500/chat/getChats", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            getSetCookie: "true",
          },
        });
        const newData = await data.json();
        console.log("THIS IS THE NEW DATA", newData.contacts);
        setContacts(newData.contacts);
        console.log("this is the new contacts", contacts);
      } catch (err) {
        console.log("this is the error", err);
      }
    };
    getContacts();
  }, []);

  return (
    <main className="min-h-[100vh]  w-[100vw] bg-blue-100 flex justify-center fixed">
      <div className=" min-h-[100vh] h-[100vh] w-[40%] bg-blue-500 flex flex-col  ">
        <div className="flex w-[100%] h-[9%] items-center">
          <h1 className="text-white text-3xl ml-16 mt-[1.5rem]">WE-CHAT</h1>
        </div>
        <form
          action=""
          className="w-[100%] h-[3.4rem]  flex items-center justify-center mt-[2rem]"
        >
          <input
            type="text"
            placeholder="Search..."
            className="h-[100%] w-[80%] rounded-md text-center text-2xl bg-blue-200 text-black"
          />
        </form>
        <div className="w-[100%] h-[100%] overflow-auto no-scrollbar">
          {contacts.map((contact) => {
            return (
              <div
                onClick={async () => {
                  try {
                    const res = await fetch(
                      "http://localhost:4500/chat/getSingleChat",
                      {
                        method: "POST",
                        credentials: "include",
                        headers: {
                          "Content-Type": "application/json",
                          getSetCookie: "true",
                        },
                        body: JSON.stringify({
                          chatId: contact.conversationID,
                        }),
                      }
                    );
                    const anotherRes = await fetch(
                      "http://localhost:4500/chat/getMessagesForChat",
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          getSetCookie: true,
                        },
                        credentials: "include",
                        body: JSON.stringify({
                          chatId: contact.conversationID,
                        }),
                      }
                    );
                    const result = await res.json();
                    console.log("the sent result", result.data[0]);
                    const allMessages = await anotherRes.json();
                    console.log("all messages", allMessages);
                    setChatInfo(result.data[0]);
                    setMessages(allMessages);
                    setLoading(false);
                    console.log(
                      "chat info",
                      chatInfo,
                      "the messages",
                      allMessages
                    );
                    console.log("the loading state is this oh", loading);
                  } catch (err) {
                    console.log("this is the error", err);
                  }
                }}
                key={Math.random()}
                className="w-[100%]  h-[4.5rem] items-center flex justify-left mt-[5rem] cursor-pointer  hover:bg-white hover:bg-opacity-[.3]"
              >
                <div className="w-[3.3rem] h-[2.8rem] bg-white rounded-full ml-[2.7rem]"></div>
                <div className="w-[100%] h-[2.8rem] flex  flex-col ml-[1rem]">
                  <div className="text-[1.4rem] text-white cursor-pointer">
                    {contact.name}
                  </div>
                  {contact.message == undefined ? (
                    <div>{""}</div>
                  ) : (
                    <div className="text-white text-[0.8rem] ">
                      {contact.message.messageText}
                      <div className="text-black font-bold text-right mr-[1.5rem] mt-[-2rem]">
                        {contact.message.sentAt}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {loading == false ? (
        <dataContext.Provider value={{ chatInfo, loading, messages }}>
          {children}
        </dataContext.Provider>
      ) : (
        <div className="h-[100vh] w-[100vw] flex items-center justify-center text-[1.9rem] italic">
          Select a Chat to start a conversation with
        </div>
      )}
      <Outlet />
    </main>
  );
}

export default FetchContacts;
