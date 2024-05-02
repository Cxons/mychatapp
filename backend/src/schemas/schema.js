const { relations } = require("drizzle-orm");
const { time, date } = require("drizzle-orm/mysql-core");
const {
  pgTable,
  uuid,
  varchar,
  integer,
  boolean,
  timestamp,
} = require("drizzle-orm/pg-core");

const userTable = pgTable("user", {
  userId: uuid("userId").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  verificationCode: varchar("verificationCode", { length: 255 }),
});

const conversationsTable = pgTable("conversations", {
  conversationId: uuid("conversationId").primaryKey().defaultRandom(),
  creatorId: uuid("creatorId")
    .references(() => userTable.userId)
    .notNull(),
  recipientId: uuid("recipientId")
    .notNull()
    .references(() => userTable.userId),
  createdAt: varchar("createdAt", { length: 30 }),
});

const messagesTable = pgTable("messages", {
  messagesId: uuid("messagesId").primaryKey().defaultRandom(),
  senderId: uuid("senderId")
    .references(() => userTable.userId, { onUpdate: "cascade" })
    .notNull(),
  receiverId: uuid("receiverId")
    .references(() => userTable.userId, { onUpdate: "cascade" })
    .notNull(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => conversationsTable.conversationId),
  groupId: uuid("groupId").references(() => groupTable.groupId),
  messageText: varchar("message", { length: 10000 }),
  sentAt: varchar("sentAt", { length: 30 }),
});

const groupTable = pgTable("group", {
  groupId: uuid("groupId").primaryKey().defaultRandom(),
  groupName: varchar("groupName", { length: 255 }),
  creatorId: uuid("creatorId")
    .notNull()
    .references(() => userTable.userId),
  memberIds: uuid("memberIds", { isArray: true })
    .references(() => userTable.userId)
    .notNull(),
});

module.exports = { userTable, conversationsTable, messagesTable, groupTable };
