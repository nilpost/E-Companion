import type { Express, Request, Response, NextFunction, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertPetSchema, insertPostSchema, insertCommentSchema, insertAppointmentSchema, insertHealthRecordSchema, insertActivitySchema, insertChatMessageSchema, insertProviderSchema } from "@shared/schema";
import { WebSocketServer, WebSocket } from "ws";

// Express doesn't catch rejections from async handlers, so an uncaught DB
// error crashes the whole process. Route every handler through here so it
// reaches the global error middleware via next(err) instead.
function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<any>,
): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}

export function registerRoutes(app: Express): Server {
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Pets API
  app.get("/api/pets", asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const pets = await storage.getPetsByOwner(req.user!.id);
    res.json(pets);
  }));

  app.post("/api/pets", asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const petData = insertPetSchema.parse({ ...req.body, ownerId: req.user!.id });
      const pet = await storage.createPet(petData);
      res.status(201).json(pet);
    } catch (error) {
      res.status(400).json({ message: "Invalid pet data" });
    }
  }));

  app.get("/api/pets/:id", asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const pet = await storage.getPet(parseInt(req.params.id));
    if (!pet) return res.sendStatus(404);

    // Check if user owns this pet
    if (pet.ownerId !== req.user!.id) return res.sendStatus(403);

    res.json(pet);
  }));

  // Posts API
  app.get("/api/posts", asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const posts = await storage.getPosts(limit, offset);
    res.json(posts);
  }));

  app.post("/api/posts", asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const postData = insertPostSchema.parse({ ...req.body, userId: req.user!.id });
      const post = await storage.createPost(postData);
      res.status(201).json(post);
    } catch (error) {
      res.status(400).json({ message: "Invalid post data" });
    }
  }));

  app.get("/api/posts/:id", asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const post = await storage.getPost(parseInt(req.params.id), req.user!.id);
    if (!post) return res.sendStatus(404);

    res.json(post);
  }));

  app.delete("/api/posts/:id", asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const post = await storage.getPost(parseInt(req.params.id));
    if (!post) return res.sendStatus(404);

    // Check if user owns this post
    if (post.userId !== req.user!.id) return res.sendStatus(403);

    const deleted = await storage.deletePost(parseInt(req.params.id));
    res.json({ success: deleted });
  }));

  // Comments API
  app.post("/api/posts/:postId/comments", asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const commentData = insertCommentSchema.parse({
        ...req.body,
        postId: parseInt(req.params.postId),
        userId: req.user!.id
      });
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      res.status(400).json({ message: "Invalid comment data" });
    }
  }));

  // Likes API
  app.post("/api/posts/:postId/like", asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const liked = await storage.toggleLike(req.user!.id, parseInt(req.params.postId));
    res.json({ liked });
  }));

  // Appointments API
  app.get("/api/appointments", asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const appointments = await storage.getAppointmentsByOwner(req.user!.id);
    res.json(appointments);
  }));

  app.post("/api/appointments", asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const appointmentData = insertAppointmentSchema.parse({ ...req.body, ownerId: req.user!.id });
      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (error) {
      res.status(400).json({ message: "Invalid appointment data" });
    }
  }));

  // Health Records API
  app.get("/api/pets/:petId/health", asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const pet = await storage.getPet(parseInt(req.params.petId));
    if (!pet || pet.ownerId !== req.user!.id) return res.sendStatus(403);

    const healthRecords = await storage.getHealthRecordsByPet(parseInt(req.params.petId));
    res.json(healthRecords);
  }));

  app.post("/api/pets/:petId/health", asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const pet = await storage.getPet(parseInt(req.params.petId));
    if (!pet || pet.ownerId !== req.user!.id) return res.sendStatus(403);

    try {
      const healthData = insertHealthRecordSchema.parse({
        ...req.body,
        petId: parseInt(req.params.petId)
      });
      const healthRecord = await storage.createHealthRecord(healthData);
      res.status(201).json(healthRecord);
    } catch (error) {
      res.status(400).json({ message: "Invalid health record data" });
    }
  }));

  // Activities API
  app.get("/api/pets/:petId/activities", asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const pet = await storage.getPet(parseInt(req.params.petId));
    if (!pet || pet.ownerId !== req.user!.id) return res.sendStatus(403);

    const activities = await storage.getActivitiesByPet(parseInt(req.params.petId));
    res.json(activities);
  }));

  app.post("/api/pets/:petId/activities", asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const pet = await storage.getPet(parseInt(req.params.petId));
    if (!pet || pet.ownerId !== req.user!.id) return res.sendStatus(403);

    try {
      const activityData = insertActivitySchema.parse({
        ...req.body,
        petId: parseInt(req.params.petId),
        userId: req.user!.id,
        xpEarned: 50 // Simple XP calculation
      });
      const activity = await storage.createActivity(activityData);

      // Award XP to user
      await storage.updateUser(req.user!.id, {
        xpPoints: req.user!.xpPoints + 50
      });

      res.status(201).json(activity);
    } catch (error) {
      res.status(400).json({ message: "Invalid activity data" });
    }
  }));

  app.get("/api/activities/recent", asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const activities = await storage.getRecentActivities(req.user!.id);
    res.json(activities);
  }));

  // Badges API
  app.get("/api/badges", asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const badges = await storage.getAllBadges();
    res.json(badges);
  }));

  app.get("/api/user/badges", asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const userBadges = await storage.getUserBadges(req.user!.id);
    res.json(userBadges);
  }));

  // Chat API
  app.get("/api/chat/rooms", asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const rooms = await storage.getChatRooms();
    res.json(rooms);
  }));

  app.get("/api/chat/rooms/:roomId/messages", asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const messages = await storage.getChatMessages(parseInt(req.params.roomId));
    res.json(messages);
  }));

  app.post("/api/chat/rooms/:roomId/messages", asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const messageData = insertChatMessageSchema.parse({
        ...req.body,
        roomId: parseInt(req.params.roomId),
        senderId: req.user!.id
      });
      const message = await storage.createChatMessage(messageData);

      // Broadcast to WebSocket clients
      broadcastToRoom(parseInt(req.params.roomId), {
        type: 'new_message',
        message: { ...message, sender: req.user! }
      });

      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ message: "Invalid message data" });
    }
  }));

  // Providers API
  app.get("/api/providers", asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const serviceType = req.query.service as string;
    const providers = await storage.getProviders(serviceType);
    res.json(providers);
  }));

  app.post("/api/providers", asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const providerData = insertProviderSchema.parse({ ...req.body, userId: req.user!.id });
      const provider = await storage.createProvider(providerData);
      res.status(201).json(provider);
    } catch (error) {
      res.status(400).json({ message: "Invalid provider data" });
    }
  }));

  const httpServer = createServer(app);

  // WebSocket setup for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const roomClients = new Map<number, Set<WebSocket>>();

  wss.on('connection', (ws, req) => {
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'join_room') {
          const roomId = message.roomId;
          if (!roomClients.has(roomId)) {
            roomClients.set(roomId, new Set());
          }
          roomClients.get(roomId)!.add(ws);
          
          ws.on('close', () => {
            roomClients.get(roomId)?.delete(ws);
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
  });

  function broadcastToRoom(roomId: number, data: any) {
    const clients = roomClients.get(roomId);
    if (clients) {
      const message = JSON.stringify(data);
      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  }

  return httpServer;
}
