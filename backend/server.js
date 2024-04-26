const express = require("express");
const { Server } = require("socket.io");
require("dotenv").config();
const app = express();
const port = process.env.PORT;
const cookieParser = require("cookie-parser");
const { db } = require("./db/connections/connection");
const { userTable, messagesTable } = require("./src/schemas/schema");
const { eq, or, and } = require("drizzle-orm");
const cors = require("cors");
const userRouter = require("./src/routes/userRoutes");
const chatRouter = require("./src/routes/chatRoutes");
const errHandler = require("./src/middleware/errorHandler");
const asyncHandler = require("express-async-handler");

app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/user", userRouter);
app.use("/chat", chatRouter);
app.use("/", errHandler);

const expressServer = app.listen(4500, () => {
  console.log(`server listening at port ${4500}`);
});
const io = new Server(expressServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});
app.use(
  "/chat/message",
  asyncHandler(async (req, res) => {
    // const { senderId, recipientId, message } = req.body;
    // console.log("the sender Id", senderId, "the recipient id", recipientId);
    // if (!senderId || !recipientId) {
    //   res.status(403);
    //   throw new Error("operation not allowd");
    // }
    // const checkSender = await db
    //   .select()
    //   .from(userTable)
    //   .where(
    //     and(eq(userTable.userId, senderId), eq(userTable.userId, recipientId))
    //   );
    // console.log("the check sender", checkSender);
    // if (checkSender.length == 0) {
    //   res.status(404);
    //   throw new Error("user not found");
    // }
    res.json({ message: "hey trying to reach me?" });
  })
);
io.on("connection", (socket) => {
  console.log("the user connected");
  socket.on("chatInfo", async (info) => {
    const { userId, recipientId, chatText, conversationId, sentAt } = info;
    console.log(
      "the object",
      userId,
      recipientId,
      "the chat text",
      info.chatText,
      conversationId
    );
    await db
      .insert(messagesTable)
      .values({
        senderId: userId,
        receiverId: recipientId,
        chatId: conversationId,
        messageText: chatText,
        sentAt: sentAt,
      })
      .returning({
        senderId: messagesTable.senderId,
        receiverId: messagesTable.receiverId,
        chatText: messagesTable.messageText,
      });
    io.emit("receivedMessage", {
      message: chatText,
      sender: userId,
      receiver: recipientId,
    });
  });
});

module.exports = { io };
