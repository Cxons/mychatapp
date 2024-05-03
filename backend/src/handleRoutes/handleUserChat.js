const asyncHandler = require("express-async-handler");
const {
  conversationsTable,
  userTable,
  messagesTable,
  groupTable,
} = require("../schemas/schema");
const { db } = require("../../db/connections/connection");
const { eq, or, and } = require("drizzle-orm");
const { DateTime } = require("luxon");

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
        and(
          eq(conversationsTable.creatorId, senderId),
          eq(conversationsTable.recipientId, recipientId)
        ),
        and(
          eq(conversationsTable.creatorId, recipientId),
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
  console.log("the subfinal array", subfinalArr);
  subfinalArr.sort((a, b) => Date.parse(b.sentAt) - Date.parse(a.sentAt));

  let finalArr = [];
  for (let i = 0; i < subfinalArr.length; i++) {
    if (subfinalArr[i] == null) {
      continue;
    }
    let timeSent;
    const now = DateTime.now();
    const msgDate = DateTime.fromISO(subfinalArr[i].sentAt);
    const dayDifference = now.diff(msgDate, "days").as("days");
    if (dayDifference == 1) {
      timeSent = "yesterday";
    } else if (dayDifference > 1) {
      timeSent = DateTime.fromISO(subfinalArr[i].sentAt).toFormat(
        "LLLL dd,yyyy"
      );
    } else {
      timeSent = DateTime.fromISO(subfinalArr[i].sentAt).toFormat("hh:mm a");
    }
    finalArr.push({ ...subfinalArr[i], sentAt: timeSent });
  }
  console.log("the results sent is this", finalArr);
  res.status(200).json({
    message: "These are your contacts",
    contacts: finalArr,
  });
});

const handleSearch = asyncHandler(async (req, res) => {
  const { userId } = req.cookies;
  const { similar } = req.query;
  console.log("the similar", similar);
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
  console.log("allConversations", allConversations);
  if (allConversations.length == 0) {
    res.status(404);
    throw new Error("Sorry no conversations found");
  }
  console.log("all conversations is this new one", allConversations);
  const theNames = allConversations.map(async (convo) => {
    let totalpkg = [];
    if (convo.creatorId == userId) {
      const userObj = await db
        .select()
        .from(userTable)
        .where(eq(userTable.userId, convo.recipientId));
      console.log("the user obj", userObj);
      totalpkg.push({
        conversationID: convo.conversationId,
        name: userObj[0].name,
        contactId: userObj[0].userId,
      });
    }
    if (convo.recipientId == userId) {
      const userObj = await db
        .select()
        .from(userTable)
        .where(eq(userTable.userId, convo.creatorId));
      console.log("the user obj", userObj);
      totalpkg.push({
        conversationID: convo.conversationId,
        name: userObj[0].name,
        contactId: userObj[0].userId,
      });
    }
    return totalpkg[0];
  });
  const results = await Promise.all(theNames);
  console.log("the total package", results);

  const semiPkg = results.map(async (convo) => {
    const msg = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.chatId, convo.conversationID));
    if (msg.length == 0) {
      return {
        conversationId: convo.conversationID,
        name: convo.name,
      };
    }
    let sentAt;
    const now = DateTime.now();
    const msgDate = DateTime.fromISO(msg[msg.length - 1].sentAt);
    const dayDifference = now.diff(msgDate, "days").as("days");
    if (dayDifference == 1) {
      sentAt = "yesterday";
    } else if (dayDifference > 1) {
      sentAt = DateTime.fromISO(msg[msg.length - 1].sentAt).toFormat(
        "LLLL dd,yyyy"
      );
    } else {
      sentAt = DateTime.fromISO(msg[msg.length - 1].sentAt).toFormat("hh:mm a");
    }
    return {
      conversationId: convo.conversationID,
      name: convo.name,
      lastMessage: msg[msg.length - 1],
      sentAt: sentAt,
    };
  });
  const semi = await Promise.all(semiPkg);
  console.log("the semi package", semi);
  if (similar == "") {
    return;
  }
  const finalArr = semi.filter((item) => item.name.startsWith(similar));
  console.log("semi", semi);
  console.log("finalArr", finalArr);
  res.status(200).json({ message: "the filtered array", data: finalArr });
});

const getIdName = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  checkUser = await db
    .select()
    .from(userTable)
    .where(eq(userTable.userId, userId));
  console.log("the user ", checkUser);
  if (checkUser.length == 0) {
    res.status(404);
    throw new Error("contact not found");
  }

  res
    .status(200)
    .json({ message: "The userName is this", data: checkUser[0].name });
});

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

const getJustContacts = asyncHandler(async (req, res) => {
  const { userId } = req.cookies;
  const { similar } = req.query;
  console.log("the similar", similar);
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
  console.log("allConversations", allConversations);
  if (allConversations.length == 0) {
    res.status(404);
    throw new Error("Sorry no conversations found");
  }
  console.log("all conversations is this new one", allConversations);
  const theNames = allConversations.map(async (convo) => {
    let totalpkg = [];
    if (convo.creatorId == userId) {
      const userObj = await db
        .select()
        .from(userTable)
        .where(eq(userTable.userId, convo.recipientId));
      console.log("the user obj", userObj);
      totalpkg.push({
        conversationID: convo.conversationId,
        name: userObj[0].name,
        contactId: userObj[0].userId,
      });
    }
    if (convo.recipientId == userId) {
      const userObj = await db
        .select()
        .from(userTable)
        .where(eq(userTable.userId, convo.creatorId));
      console.log("the user obj", userObj);
      totalpkg.push({
        conversationID: convo.conversationId,
        name: userObj[0].name,
        contactId: userObj[0].userId,
      });
    }
    return totalpkg[0];
  });
  const results = await Promise.all(theNames);
  console.log("the total package", results);

  const finalResults = results.sort((a, b) => a.name.localeCompare(b.name));
  console.log("the final results", finalResults);
  res
    .status(200)
    .json({ message: "here are all your contacts", data: results });
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
  const finalMessages = theMessages.map((msg) => {
    let sentAt;
    const now = DateTime.now();
    const msgDate = DateTime.fromISO(msg.sentAt);
    const dayDifference = now.diff(msgDate, "days").as("days");
    if (dayDifference == 1) {
      sentAt = "yesterday";
    } else if (dayDifference > 1) {
      sentAt = DateTime.fromISO(msg.sentAt).toFormat("LLLL dd,yyyy");
    } else {
      sentAt = DateTime.fromISO(msg.sentAt).toFormat("hh:mm a");
    }
    return {
      chatId: msg.chatId,
      groupId: msg.groupId,
      messageText: msg.messageText,
      messagesId: msg.messagesId,
      receiverId: msg.receiverId,
      senderId: msg.senderId,
      sentAt: sentAt,
    };
  });
  res
    .status(200)
    .json({ message: "all was successful my gee", data: finalMessages });
});

const handleStartGroupChat = asyncHandler(async (req, res) => {
  const { creatorId, arrOfParticipantsId, groupName } = req.body;
  console.log(
    "creator",
    creatorId,
    "arr",
    arrOfParticipantsId,
    "group",
    groupName
  );
  if (!creatorId || arrOfParticipantsId.length == 0 || !groupName) {
    res.status(403);
    throw new Error("Group chat cannot be created");
  }
  const checkValidCreator = await db
    .select()
    .from(userTable)
    .where(eq(userTable.userId, creatorId));
  if (checkValidCreator.length == 0) {
    res.status(403);
    throw new Error("Not a valid user");
  }
  const validMembers = arrOfParticipantsId.map(async (member) => {
    const eachUser = await db
      .select()
      .from(userTable)
      .where(eq(userTable.userId, member));
    console.log("each user", eachUser);
    return eachUser;
  });
  const realResults = await Promise.all(validMembers);
  console.log("the results", arrOfParticipantsId);
  const newMembers = JSON.stringify(arrOfParticipantsId);

  await db
    .insert(groupTable)
    .values({
      groupName: groupName,
      creatorId: creatorId,
      memberIds: newMembers,
    })
    .returning({
      groupName: groupTable.groupName,
      creatorId: groupTable.creatorId,
    });

  console.log("the real results", realResults);
  res.status(200).json({ message: "groupCreated" });
});

module.exports = {
  handleStartSingleChat,
  handleStartGroupChat,
  getAllContacts,
  handleSearch,
  inviteContacts,
  getMessagesForChat,
  getSpecificChat,
  getIdName,
  getJustContacts,
};
