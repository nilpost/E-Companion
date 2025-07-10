import { users, pets, posts, comments, likes, appointments, healthRecords, activities, badges, userBadges, chatRooms, chatMessages, chatParticipants, providers } from "@shared/schema";
import { type User, type InsertUser, type Pet, type InsertPet, type Post, type InsertPost, type Comment, type InsertComment, type Appointment, type InsertAppointment, type HealthRecord, type InsertHealthRecord, type Activity, type InsertActivity, type Badge, type UserBadge, type ChatRoom, type ChatMessage, type InsertChatMessage, type ChatParticipant, type Provider, type InsertProvider } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;

  // Pets
  getPetsByOwner(ownerId: number): Promise<Pet[]>;
  getPet(id: number): Promise<Pet | undefined>;
  createPet(pet: InsertPet): Promise<Pet>;
  updatePet(id: number, updates: Partial<Pet>): Promise<Pet | undefined>;

  // Posts
  getPosts(limit?: number, offset?: number): Promise<(Post & { user: User; pet?: Pet; commentCount: number; likesCount: number; isLiked?: boolean })[]>;
  getPost(id: number, userId?: number): Promise<(Post & { user: User; pet?: Pet; comments: (Comment & { user: User })[]; likesCount: number; isLiked?: boolean }) | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  deletePost(id: number): Promise<boolean>;

  // Comments
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByPost(postId: number): Promise<(Comment & { user: User })[]>;

  // Likes
  toggleLike(userId: number, postId: number): Promise<boolean>;

  // Appointments
  getAppointmentsByOwner(ownerId: number): Promise<(Appointment & { provider: User; pet: Pet })[]>;
  getAppointmentsByProvider(providerId: number): Promise<(Appointment & { owner: User; pet: Pet })[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment | undefined>;

  // Health Records
  getHealthRecordsByPet(petId: number): Promise<(HealthRecord & { veterinarian?: User })[]>;
  createHealthRecord(record: InsertHealthRecord): Promise<HealthRecord>;

  // Activities
  getActivitiesByPet(petId: number): Promise<(Activity & { user: User })[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  getRecentActivities(userId: number): Promise<(Activity & { pet: Pet })[]>;

  // Badges
  getAllBadges(): Promise<Badge[]>;
  getUserBadges(userId: number): Promise<(UserBadge & { badge: Badge })[]>;
  awardBadge(userId: number, badgeId: number): Promise<UserBadge>;

  // Chat
  getChatRooms(): Promise<ChatRoom[]>;
  getChatRoom(id: number): Promise<ChatRoom | undefined>;
  getChatMessages(roomId: number, limit?: number): Promise<(ChatMessage & { sender: User })[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  joinChatRoom(userId: number, roomId: number): Promise<ChatParticipant>;

  // Providers
  getProviders(serviceType?: string): Promise<(Provider & { user: User })[]>;
  getProvider(userId: number): Promise<Provider | undefined>;
  createProvider(provider: InsertProvider): Promise<Provider>;

  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  // Pets
  async getPetsByOwner(ownerId: number): Promise<Pet[]> {
    return await db.select().from(pets).where(eq(pets.ownerId, ownerId));
  }

  async getPet(id: number): Promise<Pet | undefined> {
    const [pet] = await db.select().from(pets).where(eq(pets.id, id));
    return pet || undefined;
  }

  async createPet(insertPet: InsertPet): Promise<Pet> {
    const [pet] = await db.insert(pets).values(insertPet).returning();
    return pet;
  }

  async updatePet(id: number, updates: Partial<Pet>): Promise<Pet | undefined> {
    const [pet] = await db.update(pets).set(updates).where(eq(pets.id, id)).returning();
    return pet || undefined;
  }

  // Posts
  async getPosts(limit = 20, offset = 0): Promise<(Post & { user: User; pet?: Pet; commentCount: number; likesCount: number })[]> {
    const result = await db
      .select({
        post: posts,
        user: users,
        pet: pets,
        commentCount: sql<number>`COALESCE(comment_counts.count, 0)`,
        likesCount: sql<number>`COALESCE(like_counts.count, 0)`
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .leftJoin(pets, eq(posts.petId, pets.id))
      .leftJoin(
        sql`(SELECT post_id, COUNT(*) as count FROM ${comments} GROUP BY post_id) as comment_counts`,
        sql`comment_counts.post_id = ${posts.id}`
      )
      .leftJoin(
        sql`(SELECT post_id, COUNT(*) as count FROM ${likes} GROUP BY post_id) as like_counts`,
        sql`like_counts.post_id = ${posts.id}`
      )
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    return result.map(row => ({
      ...row.post,
      user: row.user!,
      pet: row.pet || undefined,
      commentCount: row.commentCount,
      likesCount: row.likesCount
    }));
  }

  async getPost(id: number, userId?: number): Promise<(Post & { user: User; pet?: Pet; comments: (Comment & { user: User })[]; likesCount: number; isLiked?: boolean }) | undefined> {
    const [post] = await db
      .select({
        post: posts,
        user: users,
        pet: pets,
        likesCount: sql<number>`COALESCE(like_counts.count, 0)`,
        isLiked: userId ? sql<boolean>`CASE WHEN user_likes.user_id IS NOT NULL THEN true ELSE false END` : sql<boolean>`false`
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .leftJoin(pets, eq(posts.petId, pets.id))
      .leftJoin(
        sql`(SELECT post_id, COUNT(*) as count FROM ${likes} GROUP BY post_id) as like_counts`,
        sql`like_counts.post_id = ${posts.id}`
      )
      .leftJoin(
        sql`(SELECT post_id, user_id FROM ${likes} WHERE user_id = ${userId || 0}) as user_likes`,
        sql`user_likes.post_id = ${posts.id}`
      )
      .where(eq(posts.id, id));

    if (!post) return undefined;

    const postComments = await this.getCommentsByPost(id);

    return {
      ...post.post,
      user: post.user!,
      pet: post.pet || undefined,
      comments: postComments,
      likesCount: post.likesCount,
      isLiked: post.isLiked
    };
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const [post] = await db.insert(posts).values(insertPost).returning();
    return post;
  }

  async deletePost(id: number): Promise<boolean> {
    const result = await db.delete(posts).where(eq(posts.id, id));
    return result.rowCount > 0;
  }

  // Comments
  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(insertComment).returning();
    return comment;
  }

  async getCommentsByPost(postId: number): Promise<(Comment & { user: User })[]> {
    const result = await db
      .select({
        comment: comments,
        user: users
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));

    return result.map(row => ({
      ...row.comment,
      user: row.user!
    }));
  }

  // Likes
  async toggleLike(userId: number, postId: number): Promise<boolean> {
    const existing = await db
      .select()
      .from(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)));

    if (existing.length > 0) {
      await db.delete(likes).where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
      return false;
    } else {
      await db.insert(likes).values({ userId, postId });
      return true;
    }
  }

  // Appointments
  async getAppointmentsByOwner(ownerId: number): Promise<(Appointment & { provider: User; pet: Pet })[]> {
    const result = await db
      .select({
        appointment: appointments,
        provider: users,
        pet: pets
      })
      .from(appointments)
      .leftJoin(users, eq(appointments.providerId, users.id))
      .leftJoin(pets, eq(appointments.petId, pets.id))
      .where(eq(appointments.ownerId, ownerId))
      .orderBy(desc(appointments.startTime));

    return result.map(row => ({
      ...row.appointment,
      provider: row.provider!,
      pet: row.pet!
    }));
  }

  async getAppointmentsByProvider(providerId: number): Promise<(Appointment & { owner: User; pet: Pet })[]> {
    const result = await db
      .select({
        appointment: appointments,
        owner: users,
        pet: pets
      })
      .from(appointments)
      .leftJoin(users, eq(appointments.ownerId, users.id))
      .leftJoin(pets, eq(appointments.petId, pets.id))
      .where(eq(appointments.providerId, providerId))
      .orderBy(desc(appointments.startTime));

    return result.map(row => ({
      ...row.appointment,
      owner: row.owner!,
      pet: row.pet!
    }));
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db.insert(appointments).values(insertAppointment).returning();
    return appointment;
  }

  async updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment | undefined> {
    const [appointment] = await db.update(appointments).set(updates).where(eq(appointments.id, id)).returning();
    return appointment || undefined;
  }

  // Health Records
  async getHealthRecordsByPet(petId: number): Promise<(HealthRecord & { veterinarian?: User })[]> {
    const result = await db
      .select({
        healthRecord: healthRecords,
        veterinarian: users
      })
      .from(healthRecords)
      .leftJoin(users, eq(healthRecords.veterinarianId, users.id))
      .where(eq(healthRecords.petId, petId))
      .orderBy(desc(healthRecords.date));

    return result.map(row => ({
      ...row.healthRecord,
      veterinarian: row.veterinarian || undefined
    }));
  }

  async createHealthRecord(insertHealthRecord: InsertHealthRecord): Promise<HealthRecord> {
    const [healthRecord] = await db.insert(healthRecords).values(insertHealthRecord).returning();
    return healthRecord;
  }

  // Activities
  async getActivitiesByPet(petId: number): Promise<(Activity & { user: User })[]> {
    const result = await db
      .select({
        activity: activities,
        user: users
      })
      .from(activities)
      .leftJoin(users, eq(activities.userId, users.id))
      .where(eq(activities.petId, petId))
      .orderBy(desc(activities.date));

    return result.map(row => ({
      ...row.activity,
      user: row.user!
    }));
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db.insert(activities).values(insertActivity).returning();
    return activity;
  }

  async getRecentActivities(userId: number): Promise<(Activity & { pet: Pet })[]> {
    const userPets = await this.getPetsByOwner(userId);
    const petIds = userPets.map(pet => pet.id);
    
    if (petIds.length === 0) return [];

    const result = await db
      .select({
        activity: activities,
        pet: pets
      })
      .from(activities)
      .leftJoin(pets, eq(activities.petId, pets.id))
      .where(sql`${activities.petId} IN (${sql.join(petIds, sql`, `)})`)
      .orderBy(desc(activities.date))
      .limit(10);

    return result.map(row => ({
      ...row.activity,
      pet: row.pet!
    }));
  }

  // Badges
  async getAllBadges(): Promise<Badge[]> {
    return await db.select().from(badges);
  }

  async getUserBadges(userId: number): Promise<(UserBadge & { badge: Badge })[]> {
    const result = await db
      .select({
        userBadge: userBadges,
        badge: badges
      })
      .from(userBadges)
      .leftJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId));

    return result.map(row => ({
      ...row.userBadge,
      badge: row.badge!
    }));
  }

  async awardBadge(userId: number, badgeId: number): Promise<UserBadge> {
    const [userBadge] = await db.insert(userBadges).values({ userId, badgeId }).returning();
    return userBadge;
  }

  // Chat
  async getChatRooms(): Promise<ChatRoom[]> {
    return await db.select().from(chatRooms).where(eq(chatRooms.isPrivate, false));
  }

  async getChatRoom(id: number): Promise<ChatRoom | undefined> {
    const [room] = await db.select().from(chatRooms).where(eq(chatRooms.id, id));
    return room || undefined;
  }

  async getChatMessages(roomId: number, limit = 50): Promise<(ChatMessage & { sender: User })[]> {
    const result = await db
      .select({
        message: chatMessages,
        sender: users
      })
      .from(chatMessages)
      .leftJoin(users, eq(chatMessages.senderId, users.id))
      .where(eq(chatMessages.roomId, roomId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);

    return result.map(row => ({
      ...row.message,
      sender: row.sender!
    })).reverse();
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db.insert(chatMessages).values(insertMessage).returning();
    return message;
  }

  async joinChatRoom(userId: number, roomId: number): Promise<ChatParticipant> {
    const existing = await db
      .select()
      .from(chatParticipants)
      .where(and(eq(chatParticipants.userId, userId), eq(chatParticipants.roomId, roomId)));

    if (existing.length > 0) {
      return existing[0];
    }

    const [participant] = await db.insert(chatParticipants).values({ userId, roomId }).returning();
    return participant;
  }

  // Providers
  async getProviders(serviceType?: string): Promise<(Provider & { user: User })[]> {
    const result = await db
      .select({
        provider: providers,
        user: users
      })
      .from(providers)
      .leftJoin(users, eq(providers.userId, users.id))
      .where(
        serviceType 
          ? sql`${providers.services} @> ${JSON.stringify([serviceType])}`
          : undefined
      )
      .orderBy(desc(providers.rating));

    return result.map(row => ({
      ...row.provider,
      user: row.user!
    }));
  }

  async getProvider(userId: number): Promise<Provider | undefined> {
    const [provider] = await db.select().from(providers).where(eq(providers.userId, userId));
    return provider || undefined;
  }

  async createProvider(insertProvider: InsertProvider): Promise<Provider> {
    const [provider] = await db.insert(providers).values(insertProvider).returning();
    return provider;
  }
}

export const storage = new DatabaseStorage();
