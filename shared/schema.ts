import { pgTable, text, serial, integer, boolean, timestamp, real, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("owner"), // owner, trainer, vet, groomer
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  avatar: text("avatar"),
  bio: text("bio"),
  phone: text("phone"),
  location: text("location"),
  verified: boolean("verified").default(false),
  xpPoints: integer("xp_points").default(0),
  level: integer("level").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const pets = pgTable("pets", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").references(() => users.id),
  name: text("name").notNull(),
  breed: text("breed").notNull(),
  species: text("species").notNull(), // dog, cat, etc.
  age: integer("age"),
  weight: real("weight"),
  gender: text("gender"),
  color: text("color"),
  avatar: text("avatar"),
  microchipId: text("microchip_id"),
  medicalNotes: text("medical_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  petId: integer("pet_id").references(() => pets.id),
  content: text("content").notNull(),
  images: json("images").$type<string[]>().default([]),
  location: text("location"),
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id),
  userId: integer("user_id").references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  postId: integer("post_id").references(() => posts.id),
  createdAt: timestamp("created_at").defaultNow()
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").references(() => users.id),
  providerId: integer("provider_id").references(() => users.id),
  petId: integer("pet_id").references(() => pets.id),
  serviceType: text("service_type").notNull(), // walking, vet, grooming, training
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: text("status").default("pending"), // pending, confirmed, completed, cancelled
  price: real("price"),
  location: text("location"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const healthRecords = pgTable("health_records", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").references(() => pets.id),
  recordType: text("record_type").notNull(), // vaccination, medication, checkup, activity
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  veterinarianId: integer("veterinarian_id").references(() => users.id),
  notes: text("notes"),
  attachments: json("attachments").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow()
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").references(() => pets.id),
  userId: integer("user_id").references(() => users.id),
  activityType: text("activity_type").notNull(), // walk, feeding, grooming, training
  title: text("title").notNull(),
  description: text("description"),
  duration: integer("duration"), // in minutes
  distance: real("distance"), // in km
  calories: integer("calories"),
  steps: integer("steps"),
  heartRate: integer("heart_rate"),
  temperature: real("temperature"),
  gpsRoute: json("gps_route").$type<Array<{lat: number, lng: number}>>(),
  xpEarned: integer("xp_earned").default(0),
  date: timestamp("date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});

export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  category: text("category").notNull(), // health, social, activity, care
  requirement: text("requirement").notNull(),
  xpReward: integer("xp_reward").default(0)
});

export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  badgeId: integer("badge_id").references(() => badges.id),
  earnedAt: timestamp("earned_at").defaultNow()
});

export const chatRooms = pgTable("chat_rooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // faq, general, direct
  isPrivate: boolean("is_private").default(false),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow()
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").references(() => chatRooms.id),
  senderId: integer("sender_id").references(() => users.id),
  content: text("content").notNull(),
  messageType: text("message_type").default("text"), // text, image, file
  attachments: json("attachments").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow()
});

export const chatParticipants = pgTable("chat_participants", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").references(() => chatRooms.id),
  userId: integer("user_id").references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow(),
  lastReadAt: timestamp("last_read_at")
});

export const providers = pgTable("providers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  businessName: text("business_name"),
  services: json("services").$type<string[]>().default([]),
  hourlyRate: real("hourly_rate"),
  availability: json("availability").$type<object>(),
  rating: real("rating").default(0),
  reviewCount: integer("review_count").default(0),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  pets: many(pets),
  posts: many(posts),
  comments: many(comments),
  likes: many(likes),
  ownedAppointments: many(appointments, { relationName: "owner" }),
  providedAppointments: many(appointments, { relationName: "provider" }),
  activities: many(activities),
  userBadges: many(userBadges),
  chatMessages: many(chatMessages),
  chatParticipants: many(chatParticipants),
  provider: one(providers)
}));

export const petsRelations = relations(pets, ({ one, many }) => ({
  owner: one(users, {
    fields: [pets.ownerId],
    references: [users.id]
  }),
  posts: many(posts),
  appointments: many(appointments),
  healthRecords: many(healthRecords),
  activities: many(activities)
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id]
  }),
  pet: one(pets, {
    fields: [posts.petId],
    references: [pets.id]
  }),
  comments: many(comments),
  likes: many(likes)
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id]
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id]
  })
}));

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id]
  }),
  post: one(posts, {
    fields: [likes.postId],
    references: [posts.id]
  })
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  owner: one(users, {
    fields: [appointments.ownerId],
    references: [users.id],
    relationName: "owner"
  }),
  provider: one(users, {
    fields: [appointments.providerId],
    references: [users.id],
    relationName: "provider"
  }),
  pet: one(pets, {
    fields: [appointments.petId],
    references: [pets.id]
  })
}));

export const healthRecordsRelations = relations(healthRecords, ({ one }) => ({
  pet: one(pets, {
    fields: [healthRecords.petId],
    references: [pets.id]
  }),
  veterinarian: one(users, {
    fields: [healthRecords.veterinarianId],
    references: [users.id]
  })
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  pet: one(pets, {
    fields: [activities.petId],
    references: [pets.id]
  }),
  user: one(users, {
    fields: [activities.userId],
    references: [users.id]
  })
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id]
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id]
  })
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  room: one(chatRooms, {
    fields: [chatMessages.roomId],
    references: [chatRooms.id]
  }),
  sender: one(users, {
    fields: [chatMessages.senderId],
    references: [users.id]
  })
}));

export const chatParticipantsRelations = relations(chatParticipants, ({ one }) => ({
  room: one(chatRooms, {
    fields: [chatParticipants.roomId],
    references: [chatRooms.id]
  }),
  user: one(users, {
    fields: [chatParticipants.userId],
    references: [users.id]
  })
}));

export const providersRelations = relations(providers, ({ one }) => ({
  user: one(users, {
    fields: [providers.userId],
    references: [users.id]
  })
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  xpPoints: true,
  level: true
});

export const insertPetSchema = createInsertSchema(pets).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  likes: true
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true
});

export const insertHealthRecordSchema = createInsertSchema(healthRecords).omit({
  id: true,
  createdAt: true
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
  xpEarned: true
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true
});

export const insertProviderSchema = createInsertSchema(providers).omit({
  id: true,
  createdAt: true,
  rating: true,
  reviewCount: true,
  verified: true
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Pet = typeof pets.$inferSelect;
export type InsertPet = z.infer<typeof insertPetSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type HealthRecord = typeof healthRecords.$inferSelect;
export type InsertHealthRecord = z.infer<typeof insertHealthRecordSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Badge = typeof badges.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;
export type ChatRoom = typeof chatRooms.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatParticipant = typeof chatParticipants.$inferSelect;
export type Provider = typeof providers.$inferSelect;
export type InsertProvider = z.infer<typeof insertProviderSchema>;
