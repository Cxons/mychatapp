const asyncHandler = require("express-async-handler");
const {
  conversationsTable,
  userTable,
  messagesTable,
} = require("../schemas/schema");
const { db } = require("../../db/connections/connection");
const { eq, or, and } = require("drizzle-orm");

const inviteContacts = asyncHandler(async (req, res) => {
  const { senderId } = req.body;
  console.log("the sender Id", senderId);
  if (!senderId) {
    res.status(403);
    throw new Error("operation not allowd");
  }
  const checkSender = await db
    .select()
    .from(userTable)
    .where(eq(userTable.userId, senderId));
  console.log("the check sender", checkSender);
  if (checkSender.length == 0) {
    res.status(404);
    throw new Error("user not found");
  }
  res.status(200).json({ message: "all was gotten and no error" });
});
const receiveInvite = asyncHandler(async (req, res) => {});

const handleStartSingleChat = asyncHandler(async (req, res) => {
  const { senderId, recipientId } = req.body;
  console.log("the senderId", senderId, "the recipientId", recipientId);
  if (!senderId | !recipientId) {
    res.status(401);
    throw new Error("Not authorized");
  }
  const existingConversation = await db
    .select()
    .from(conversationsTable)
    .where(
      or(
        eq(conversationsTable.creatorId, senderId),
        and(
          eq(conversationsTable.creatorId, senderId),
          eq(conversationsTable.recipientId)
        ),
        eq(conversationsTable.recipientId),
        and(
          eq(conversationsTable.creatorId, senderId),
          eq(conversationsTable.recipientId, senderId)
        )
      )
    );
  console.log("the existing conversation", existingConversation);
  if (existingConversation.length != 0) {
    res.status(403);
    throw new Error("Sorry not allowed, chat not allowed");
  }

  const date = new Date();
  console.log(date);
  await db
    .insert(conversationsTable)
    .values({
      creatorId: senderId,
      recipientId: recipientId,
      createdAt: date,
    })
    .returning({
      creatorId: conversationsTable.creatorId,
      recipientId: conversationsTable.recipientId,
      timestamp: conversationsTable.createdAt,
    });
  res
    .status(200)
    .json({ message: "You are now contacts with the requested person" });
});

//function to get a user's contacts and conversation
const getAllContacts = asyncHandler(async (req, res) => {
  const { userId } = req.cookies;
  console.log("the userId is this", userId);
  if (!userId) {
    res.status(401);
    throw new Error("Not authorized");
  }

  // fetching all conversations that have the above id
  const allConversations = await db
    .select()
    .from(conversationsTable)
    .where(
      or(
        eq(conversationsTable.creatorId, userId),
        eq(conversationsTable.recipientId, userId)
      )
    );
  if (allConversations.length == 0) {
    res.status(404);
    throw new Error("Sorry no conversations found");
  }
  console.log("all conversations", allConversations);
  //getting the last messages received
  const attachMessage = allConversations.map(async (convo) => {
    const results = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.chatId, convo.conversationId));
    // chatAndMsg.push({
    //   conversationID: convo.conversationId,
    //   lastMessage: results[results.length - 1],
    // });
    return {
      conversationID: convo.conversationId,
      lastMessage: results[results.length - 1],
    };
  });
  const realAttachMessages = await Promise.all(attachMessage);
  console.log("the real attached messages", realAttachMessages);

  //getting user recipients details e.g name
  const theNames = realAttachMessages.map(async (convo) => {
    let totalpkg = [];
    if (convo.lastMessage == undefined) {
      return "";
    } else {
      if (convo.lastMessage.senderId == userId) {
        const userObj = await db
          .select()
          .from(userTable)
          .where(eq(userTable.userId, convo.lastMessage.receiverId));
        console.log("the user obj", userObj);
        totalpkg.push({
          conversationID: convo.conversationID,
          message: convo.lastMessage.messageText,
          name: userObj[0].name,
          contactId: userObj[0].userId,
          sentAt: convo.lastMessage.sentAt,
        });
      }
      if (convo.lastMessage.receiverId == userId) {
        const userObj = await db
          .select()
          .from(userTable)
          .where(eq(userTable.userId, convo.lastMessage.senderId));
        console.log("the user obj", userObj);
        totalpkg.push({
          conversationID: convo.conversationID,
          message: convo.lastMessage.messageText,
          name: userObj[0].name,
          contactId: userObj[0].userId,
          sentAt: convo.lastMessage.sentAt,
        });
      }
    }
    return totalpkg[0];
  });

  const results = await Promise.all(theNames);
  console.log("the total package", results);

  let subfinalArr = [];
  for (let i = 0; i < results.length; i++) {
    if (results[i] == "" || results[i] == undefined) {
      continue;
    }
    subfinalArr.push(results[i]);
  }
  subfinalArr.sort((a, b) => Date.parse(b.sentAt) - Date.parse(a.sentAt));

  let finalArr = [];
  for (let i = 0; i < subfinalArr.length; i++) {
    if (subfinalArr[i] == null) {
      continue;
    }
    finalArr.push(subfinalArr[i]);
  }
  console.log("the results sent is this fool", finalArr);
  res.status(200).json({
    message: "These are your contacts",
    contacts: finalArr,
  });
});

// const handleChatMessages = asyncHandler(async (req, res) => {
//   const { senderId, recipientId, message } = req.body;
//   console.log("the sender Id", senderId, "the recipient id", recipientId);
//   if (!senderId || !recipientId) {
//     res.status(403);
//     throw new Error("operation not allowd");
//   }
//   const checkSender = await db
//     .select()
//     .from(userTable)
//     .where(
//       and(eq(userTable.userId, senderId), eq(userTable.userId, recipientId))
//     );
//   console.log("the check sender", checkSender);
//   if (checkSender.length == 0) {
//     res.status(404);
//     throw new Error("user not found");
//   }
// });

const getSpecificChat = asyncHandler(async (req, res) => {
  const { chatId } = req.body;
  console.log("the req body", req.body);
  if (!chatId) {
    res.status(403);
    throw new Error("cannot retrieve chat without an id");
  }
  const getChat = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.conversationId, chatId));
  console.log("the gotten chat", getChat);
  res.status(200).json({ message: "chat gotten", data: getChat });
});

const getMessagesForChat = asyncHandler(async (req, res) => {
  const { chatId } = req.body;
  if (!chatId) {
    res.status(403);
    throw new Error("Sorry cannot get the messages as there is no chat Id");
  }
  const theMessages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.chatId, chatId));
  console.log("these are the messages", theMessages);

  res
    .status(200)
    .json({ message: "all was successful my gee", data: theMessages });
});

const handleStartGroupChat = asyncHandler(async (req, res) => {
  const { useId, groupId } = req.body;
});

module.exports = {
  handleStartSingleChat,
  handleStartGroupChat,
  getAllContacts,
  inviteContacts,
  getMessagesForChat,
  getSpecificChat,
};
