/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion } from "framer-motion";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  function handleChange(e) {
    e.preventDefault();
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    console.log(formData);
  }
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const data = await fetch("http://localhost:4500/user/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          getSetCookie: "true",
        },
        body: JSON.stringify(formData),
      });
      const newData = await data.json();
      localStorage.setItem("userName", newData.name);
      localStorage.setItem("userId", newData.id);
      console.log(newData);
    } catch (err) {
      console.log("this is the error", err);
    }
  }
  return (
    <div>
      <div className="bg-white min-h-[100vh] max-w-[100vw] flex">
        <div className="basis-[50%] h-[100vh] overflow-hidden">
          <img className="w-full h-full" />
        </div>
        <div className="basis-[50%] flex items-center w-[50vw] flex-col">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col h-[100%] w-[80%] bg-white ml-[5rem] mt-[0rem] rounded-[0.5rem]"
          >
            <div className="my-[1rem] ml-[2.5rem] mt-[3rem] text-[2rem] italic font-serif bg-clip-text bg-gradient-to-tr from-amber-300 via-orange-500 to-white text-transparent font-bold">
              WE-CHAT
            </div>
            <label className="text-left ml-[2.5rem] mt-[1rem]" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              onChange={handleChange}
              value={formData.email}
              className="border-b border-gray-500 py-2 px-3 text-black-500 leading-tight focus:outline-none focus:border-yellow-900 w-[20rem] ml-[2.5rem]"
            />
            <label
              className="text-left ml-[2.5rem] mt-[1.5rem]"
              htmlFor="password"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              onChange={handleChange}
              value={formData.password}
              className="border-b border-gray-500 py-2 px-3 text-black-500 leading-tight focus:outline-none focus:border-yellow-900 w-[20rem] ml-[2.5rem]"
            />

            <motion.button
              whileHover={{ scale: 1.05 }}
              className="border-[2px] ml-[6rem] h-[2.4rem] w-[10rem] rounded-[1rem] mt-[2.5rem]  bg-orange-500 opacity-[.9] font-semibold text-white"
              type="submit"
            >
              LOGIN
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
