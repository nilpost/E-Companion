// Seeds reference/dummy data for local development and manual QA.
//
// Usage (needs DATABASE_URL set — same as running the app):
//   npx tsx server/seed.ts
//
// Idempotent: re-running skips any user that already exists (matched by
// username), so it's safe to run again after a schema push without
// duplicating data. Pet/post/etc. data is only created alongside a
// newly-created user, so it won't duplicate on a second run either.

import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { pool } from "./db";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

const SEED_PASSWORD = "password123";

async function seed() {
  console.log("Seeding reference data...");
  console.log(`All seeded users share the password: ${SEED_PASSWORD}\n`);

  const existing = await storage.getUserByUsername("alice");
  if (existing) {
    console.log("Seed data already present (user 'alice' exists) — skipping. Delete the rows manually to reseed.");
    await pool.end();
    return;
  }

  const hashedPassword = await hashPassword(SEED_PASSWORD);

  // Owners
  const alice = await storage.createUser({
    username: "alice",
    email: "alice@example.com",
    password: hashedPassword,
    role: "owner",
    firstName: "Alice",
    lastName: "Nguyen",
    bio: "Dog mom of two, loves hiking.",
    location: "Portland, OR",
  });

  const bob = await storage.createUser({
    username: "bob",
    email: "bob@example.com",
    password: hashedPassword,
    role: "owner",
    firstName: "Bob",
    lastName: "Martinez",
    bio: "First-time cat owner.",
    location: "Austin, TX",
  });

  // A vet, so appointments/health records have a real veterinarianId/providerId
  const vet = await storage.createUser({
    username: "dr_kim",
    email: "dr.kim@example.com",
    password: hashedPassword,
    role: "vet",
    firstName: "Sarah",
    lastName: "Kim",
    bio: "Small animal veterinarian, 10 years experience.",
    location: "Portland, OR",
    verified: true,
  });

  console.log(`Created users: alice (#${alice.id}), bob (#${bob.id}), dr_kim (#${vet.id})`);

  // Pets
  const fluffy = await storage.createPet({
    ownerId: alice.id,
    name: "Fluffy",
    breed: "Labrador",
    species: "dog",
    age: 3,
    weight: 28.5,
    gender: "female",
    color: "golden",
  });

  const rex = await storage.createPet({
    ownerId: alice.id,
    name: "Rex",
    breed: "German Shepherd",
    species: "dog",
    age: 5,
    weight: 34,
    gender: "male",
    color: "black and tan",
  });

  const whiskers = await storage.createPet({
    ownerId: bob.id,
    name: "Whiskers",
    breed: "Domestic Shorthair",
    species: "cat",
    age: 2,
    weight: 4.2,
    gender: "male",
    color: "grey tabby",
  });

  console.log(`Created pets: Fluffy (#${fluffy.id}), Rex (#${rex.id}), Whiskers (#${whiskers.id})`);

  // Provider profile for the vet
  await storage.createProvider({
    userId: vet.id,
    businessName: "Kim Veterinary Clinic",
    services: ["vet", "checkup"],
    hourlyRate: 85,
  });

  // Appointments — one upcoming, one in the past (completed)
  const now = Date.now();
  const hour = 60 * 60 * 1000;
  await storage.createAppointment({
    ownerId: alice.id,
    providerId: vet.id,
    petId: fluffy.id,
    serviceType: "vet",
    title: "Annual checkup",
    description: "Routine annual wellness exam",
    startTime: new Date(now + 3 * 24 * hour),
    endTime: new Date(now + 3 * 24 * hour + hour),
    price: 85,
    location: "Kim Veterinary Clinic",
  });

  await storage.createAppointment({
    ownerId: bob.id,
    providerId: vet.id,
    petId: whiskers.id,
    serviceType: "vet",
    title: "Vaccination",
    description: "Rabies booster",
    startTime: new Date(now - 10 * 24 * hour),
    endTime: new Date(now - 10 * 24 * hour + hour),
    price: 60,
    location: "Kim Veterinary Clinic",
  });

  // Health records
  await storage.createHealthRecord({
    petId: fluffy.id,
    recordType: "vaccination",
    title: "Rabies vaccine",
    description: "3-year rabies vaccine administered",
    date: new Date(now - 60 * 24 * hour),
    veterinarianId: vet.id,
  });

  await storage.createHealthRecord({
    petId: whiskers.id,
    recordType: "checkup",
    title: "Annual wellness exam",
    description: "All normal, slight tartar buildup noted",
    date: new Date(now - 10 * 24 * hour),
    veterinarianId: vet.id,
  });

  // Activities
  await storage.createActivity({
    petId: fluffy.id,
    userId: alice.id,
    activityType: "walk",
    title: "Morning walk",
    description: "Neighborhood loop",
    duration: 30,
    distance: 2.1,
    date: new Date(now - hour),
  });

  await storage.createActivity({
    petId: rex.id,
    userId: alice.id,
    activityType: "training",
    title: "Obedience training",
    description: "Sit, stay, recall practice",
    duration: 20,
    date: new Date(now - 2 * hour),
  });

  // Reminders — mix of overdue, upcoming, recurring, and completed
  await storage.createReminder({
    petId: fluffy.id,
    ownerId: alice.id,
    careType: "feeding",
    title: "Evening feed",
    description: "1 cup dry food + supplement",
    scheduleType: "recurring",
    recurrenceRule: "FREQ=DAILY;BYHOUR=18",
    dueAt: new Date(now + 4 * hour),
  });

  await storage.createReminder({
    petId: fluffy.id,
    ownerId: alice.id,
    careType: "medication",
    title: "Heartworm prevention",
    description: "Monthly chewable",
    scheduleType: "recurring",
    recurrenceRule: "FREQ=MONTHLY",
    dueAt: new Date(now - 2 * 24 * hour), // overdue, still active
  });

  const groomingReminder = await storage.createReminder({
    petId: rex.id,
    ownerId: alice.id,
    careType: "grooming",
    title: "Bath and nail trim",
    scheduleType: "one_time",
    dueAt: new Date(now - 7 * 24 * hour),
  });
  await storage.updateReminder(groomingReminder.id, {
    isActive: false,
    completedAt: new Date(now - 7 * 24 * hour + hour),
  });

  await storage.createReminder({
    petId: whiskers.id,
    ownerId: bob.id,
    careType: "vet_visit",
    title: "6-month follow-up",
    scheduleType: "one_time",
    dueAt: new Date(now + 30 * 24 * hour),
  });

  console.log("Created appointments, health records, activities, and reminders (feeding/medication/grooming/vet_visit — overdue, upcoming, recurring, and completed examples).");

  // Badges (referenced by the badges API; harmless if it already has rows)
  const badges = await storage.getAllBadges();
  if (badges.length === 0) {
    await pool.query(
      `INSERT INTO badges (name, description, icon, category, requirement, xp_reward) VALUES
       ('First Steps', 'Logged your first activity', 'footprints', 'activity', '1 activity logged', 10),
       ('Consistent Carer', 'Completed 7 reminders in a row', 'calendar-check', 'care', '7 reminders completed', 50),
       ('Social Butterfly', 'Made your first post', 'message-circle', 'social', '1 post created', 10)`
    );
    console.log("Created 3 badges.");
  }

  console.log("\nDone. Log in as alice / bob / dr_kim with password: " + SEED_PASSWORD);
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
