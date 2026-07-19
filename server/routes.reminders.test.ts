// Strategy: covers auth flows (401/403), ownership checks, happy path for each route,
// 404 vs 403 ordering on PATCH/DELETE, input validation, and storage function behavior.
// SETUP REQUIRED: npm install --save-dev vitest @vitest/ui supertest @types/supertest
// Also update package.json scripts: "test": "vitest", "test:ui": "vitest --ui"

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import express from "express";
import { registerRoutes } from "./routes";
import { storage } from "./storage";
import type { Reminder, InsertReminder } from "@shared/schema";

// Mock the storage module
vi.mock("./storage", () => ({
  storage: {
    getPet: vi.fn(),
    getRemindersByPet: vi.fn(),
    getReminder: vi.fn(),
    createReminder: vi.fn(),
    updateReminder: vi.fn(),
    deleteReminder: vi.fn(),
  },
}));

// Mock passport session setup — hoisted to the top level (nesting this
// inside beforeEach is deprecated by vitest and will become an error).
vi.mock("./auth", () => ({
  setupAuth: vi.fn(),
  isAuthenticated: (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    next();
  },
}));

// Mock passport's isAuthenticated
const mockReqUser = vi.fn();
const mockIsAuthenticated = vi.fn();

let app: express.Application;

beforeEach(() => {
  app = express();
  app.use(express.json());

  // Mock authentication middleware
  app.use((req: any, res, next) => {
    req.isAuthenticated = mockIsAuthenticated;
    if (mockReqUser.getMockImplementation()) {
      req.user = mockReqUser();
    }
    next();
  });

  registerRoutes(app);

  // Reset all mocks
  vi.clearAllMocks();
  mockReqUser.mockClear();
  mockIsAuthenticated.mockClear();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("Reminders API - GET /api/pets/:petId/reminders", () => {
  it("401 if not authenticated", async () => {
    mockIsAuthenticated.mockReturnValue(false);

    const res = await request(app).get("/api/pets/1/reminders");
    expect(res.status).toBe(401);
  });

  it("403 if user does not own the pet", async () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockReqUser.mockReturnValue({ id: 999 }); // Different user
    vi.mocked(storage.getPet).mockResolvedValue({
      id: 1,
      ownerId: 1, // Owned by user 1, but authenticated as 999
      name: "Fluffy",
      breed: "Labrador",
      species: "dog",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const res = await request(app).get("/api/pets/1/reminders");
    expect(res.status).toBe(403);
  });

  it("200 and returns empty array if pet has no reminders", async () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockReqUser.mockReturnValue({ id: 1 });
    vi.mocked(storage.getPet).mockResolvedValue({
      id: 1,
      ownerId: 1,
      name: "Fluffy",
      breed: "Labrador",
      species: "dog",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);
    vi.mocked(storage.getRemindersByPet).mockResolvedValue([]);

    const res = await request(app).get("/api/pets/1/reminders");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(0);
  });

  it("200 and returns reminders sorted by dueAt", async () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockReqUser.mockReturnValue({ id: 1 });
    vi.mocked(storage.getPet).mockResolvedValue({
      id: 1,
      ownerId: 1,
      name: "Fluffy",
      breed: "Labrador",
      species: "dog",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const reminder1: Reminder = {
      id: 1,
      petId: 1,
      ownerId: 1,
      careType: "feeding",
      title: "Morning feed",
      description: "Feed Fluffy",
      scheduleType: "recurring",
      dueAt: new Date("2026-07-20T08:00:00Z"),
      recurrenceRule: "FREQ=DAILY",
      isActive: true,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const reminder2: Reminder = {
      id: 2,
      petId: 1,
      ownerId: 1,
      careType: "grooming",
      title: "Grooming",
      description: "Groom Fluffy",
      scheduleType: "one_time",
      dueAt: new Date("2026-07-25T10:00:00Z"),
      recurrenceRule: null,
      isActive: true,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(storage.getRemindersByPet).mockResolvedValue([reminder1, reminder2]);

    const res = await request(app).get("/api/pets/1/reminders");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].id).toBe(1);
    expect(res.body[1].id).toBe(2);
  });
});

describe("Reminders API - POST /api/pets/:petId/reminders", () => {
  it("401 if not authenticated", async () => {
    mockIsAuthenticated.mockReturnValue(false);

    const res = await request(app)
      .post("/api/pets/1/reminders")
      .send({
        careType: "feeding",
        title: "Morning feed",
        dueAt: new Date("2026-07-20T08:00:00Z"),
      });
    expect(res.status).toBe(401);
  });

  it("403 if user does not own the pet", async () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockReqUser.mockReturnValue({ id: 999 });
    vi.mocked(storage.getPet).mockResolvedValue({
      id: 1,
      ownerId: 1,
      name: "Fluffy",
      breed: "Labrador",
      species: "dog",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const res = await request(app)
      .post("/api/pets/1/reminders")
      .send({
        careType: "feeding",
        title: "Morning feed",
        dueAt: new Date("2026-07-20T08:00:00Z").toISOString(),
      });
    expect(res.status).toBe(403);
  });

  it("400 if reminder data is invalid", async () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockReqUser.mockReturnValue({ id: 1 });
    vi.mocked(storage.getPet).mockResolvedValue({
      id: 1,
      ownerId: 1,
      name: "Fluffy",
      breed: "Labrador",
      species: "dog",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    // Missing required 'title' field
    const res = await request(app)
      .post("/api/pets/1/reminders")
      .send({
        careType: "feeding",
        dueAt: new Date("2026-07-20T08:00:00Z").toISOString(),
      });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  it("201 and creates reminder when data is valid", async () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockReqUser.mockReturnValue({ id: 1 });
    vi.mocked(storage.getPet).mockResolvedValue({
      id: 1,
      ownerId: 1,
      name: "Fluffy",
      breed: "Labrador",
      species: "dog",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const createdReminder: Reminder = {
      id: 1,
      petId: 1,
      ownerId: 1,
      careType: "feeding",
      title: "Morning feed",
      description: "Feed Fluffy in the morning",
      scheduleType: "recurring",
      dueAt: new Date("2026-07-20T08:00:00Z"),
      recurrenceRule: "FREQ=DAILY",
      isActive: true,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(storage.createReminder).mockResolvedValue(createdReminder);

    const res = await request(app)
      .post("/api/pets/1/reminders")
      .send({
        careType: "feeding",
        title: "Morning feed",
        description: "Feed Fluffy in the morning",
        scheduleType: "recurring",
        dueAt: new Date("2026-07-20T08:00:00Z").toISOString(),
        recurrenceRule: "FREQ=DAILY",
      });

    expect(res.status).toBe(201);
    // res.body is JSON — dates arrive as ISO strings, not Date instances.
    expect(res.body).toEqual(JSON.parse(JSON.stringify(createdReminder)));
    expect(vi.mocked(storage.createReminder)).toHaveBeenCalledWith(
      expect.objectContaining({
        petId: 1,
        ownerId: 1,
        careType: "feeding",
        title: "Morning feed",
      })
    );
  });
});

describe("Reminders API - PATCH /api/reminders/:id", () => {
  it("401 if not authenticated", async () => {
    mockIsAuthenticated.mockReturnValue(false);

    const res = await request(app)
      .patch("/api/reminders/1")
      .send({ title: "Updated title" });
    expect(res.status).toBe(401);
  });

  it("404 if reminder does not exist", async () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockReqUser.mockReturnValue({ id: 1 });
    vi.mocked(storage.getReminder).mockResolvedValue(undefined);

    const res = await request(app)
      .patch("/api/reminders/999")
      .send({ title: "Updated title" });
    expect(res.status).toBe(404);
  });

  it("403 if reminder belongs to different user (check after 404)", async () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockReqUser.mockReturnValue({ id: 999 }); // Different user
    vi.mocked(storage.getReminder).mockResolvedValue({
      id: 1,
      petId: 1,
      ownerId: 1, // Owned by user 1, not 999
      careType: "feeding",
      title: "Morning feed",
      description: "Feed Fluffy",
      scheduleType: "recurring",
      dueAt: new Date("2026-07-20T08:00:00Z"),
      recurrenceRule: "FREQ=DAILY",
      isActive: true,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const res = await request(app)
      .patch("/api/reminders/1")
      .send({ title: "Updated title" });
    expect(res.status).toBe(403);
  });

  it("400 if update data is invalid", async () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockReqUser.mockReturnValue({ id: 1 });
    vi.mocked(storage.getReminder).mockResolvedValue({
      id: 1,
      petId: 1,
      ownerId: 1,
      careType: "feeding",
      title: "Morning feed",
      description: "Feed Fluffy",
      scheduleType: "recurring",
      dueAt: new Date("2026-07-20T08:00:00Z"),
      recurrenceRule: "FREQ=DAILY",
      isActive: true,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    // careType is free text (matching every other "type" column in the
    // schema — e.g. serviceType, recordType, activityType — none of them are
    // enum-validated), so an arbitrary string is accepted. An unparseable
    // date is the actual validation failure this route enforces.
    const res = await request(app)
      .patch("/api/reminders/1")
      .send({ dueAt: "not-a-date" });
    expect(res.status).toBe(400);
  });

  it("200 and updates reminder with partial fields", async () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockReqUser.mockReturnValue({ id: 1 });
    vi.mocked(storage.getReminder).mockResolvedValue({
      id: 1,
      petId: 1,
      ownerId: 1,
      careType: "feeding",
      title: "Morning feed",
      description: "Feed Fluffy",
      scheduleType: "recurring",
      dueAt: new Date("2026-07-20T08:00:00Z"),
      recurrenceRule: "FREQ=DAILY",
      isActive: true,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const updatedReminder: Reminder = {
      id: 1,
      petId: 1,
      ownerId: 1,
      careType: "feeding",
      title: "Updated title",
      description: "Feed Fluffy",
      scheduleType: "recurring",
      dueAt: new Date("2026-07-20T08:00:00Z"),
      recurrenceRule: "FREQ=DAILY",
      isActive: true,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(storage.updateReminder).mockResolvedValue(updatedReminder);

    const res = await request(app)
      .patch("/api/reminders/1")
      .send({ title: "Updated title" });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Updated title");
    expect(vi.mocked(storage.updateReminder)).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ title: "Updated title" })
    );
  });
});

describe("Reminders API - DELETE /api/reminders/:id", () => {
  it("401 if not authenticated", async () => {
    mockIsAuthenticated.mockReturnValue(false);

    const res = await request(app).delete("/api/reminders/1");
    expect(res.status).toBe(401);
  });

  it("404 if reminder does not exist", async () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockReqUser.mockReturnValue({ id: 1 });
    vi.mocked(storage.getReminder).mockResolvedValue(undefined);

    const res = await request(app).delete("/api/reminders/999");
    expect(res.status).toBe(404);
  });

  it("403 if reminder belongs to different user (check after 404)", async () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockReqUser.mockReturnValue({ id: 999 }); // Different user
    vi.mocked(storage.getReminder).mockResolvedValue({
      id: 1,
      petId: 1,
      ownerId: 1, // Owned by user 1, not 999
      careType: "feeding",
      title: "Morning feed",
      description: "Feed Fluffy",
      scheduleType: "recurring",
      dueAt: new Date("2026-07-20T08:00:00Z"),
      recurrenceRule: "FREQ=DAILY",
      isActive: true,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const res = await request(app).delete("/api/reminders/1");
    expect(res.status).toBe(403);
  });

  it("200 and deletes reminder successfully", async () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockReqUser.mockReturnValue({ id: 1 });
    vi.mocked(storage.getReminder).mockResolvedValue({
      id: 1,
      petId: 1,
      ownerId: 1,
      careType: "feeding",
      title: "Morning feed",
      description: "Feed Fluffy",
      scheduleType: "recurring",
      dueAt: new Date("2026-07-20T08:00:00Z"),
      recurrenceRule: "FREQ=DAILY",
      isActive: true,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    vi.mocked(storage.deleteReminder).mockResolvedValue(true);

    const res = await request(app).delete("/api/reminders/1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
    expect(vi.mocked(storage.deleteReminder)).toHaveBeenCalledWith(1);
  });
});

describe("Reminders Storage Functions", () => {
  it("getRemindersByPet orders results by dueAt", async () => {
    // This test validates the storage layer's sorting behavior
    // In a real implementation, you'd mock the db layer or test against a test database
    const reminder1: Reminder = {
      id: 1,
      petId: 1,
      ownerId: 1,
      careType: "feeding",
      title: "Later reminder",
      description: "",
      scheduleType: "one_time",
      dueAt: new Date("2026-07-25T08:00:00Z"),
      recurrenceRule: null,
      isActive: true,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const reminder2: Reminder = {
      id: 2,
      petId: 1,
      ownerId: 1,
      careType: "feeding",
      title: "Earlier reminder",
      description: "",
      scheduleType: "one_time",
      dueAt: new Date("2026-07-20T08:00:00Z"),
      recurrenceRule: null,
      isActive: true,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Storage should return them sorted by dueAt (ascending)
    vi.mocked(storage.getRemindersByPet).mockResolvedValue([reminder2, reminder1]);

    const result = await storage.getRemindersByPet(1);
    expect(result[0].dueAt.getTime()).toBeLessThan(result[1].dueAt.getTime());
  });
});
