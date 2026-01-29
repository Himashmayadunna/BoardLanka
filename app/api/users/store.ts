// Shared user store for demo purposes
// In production, replace with a proper database (MongoDB, PostgreSQL, etc.)

import fs from "fs";
import path from "path";

interface User {
  id: string;
  accountType: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  marketingUpdates: boolean;
  createdAt: string;
}

// File-based storage for persistence across server restarts
const DATA_FILE = path.join(process.cwd(), "data", "users.json");

// Ensure data directory exists
function ensureDataDir(): void {
  const dataDir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Read users from file
function readUsersFromFile(): User[] {
  try {
    ensureDataDir();
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading users file:", error);
  }
  return [];
}

// Write users to file
function writeUsersToFile(users: User[]): void {
  try {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Error writing users file:", error);
  }
}

export function getUsers(): User[] {
  return readUsersFromFile();
}

export function addUser(user: User): void {
  const users = readUsersFromFile();
  users.push(user);
  writeUsersToFile(users);
}

export function findUserByEmail(email: string): User | undefined {
  const users = readUsersFromFile();
  return users.find((user) => user.email === email);
}

export function findUserById(id: string): User | undefined {
  const users = readUsersFromFile();
  return users.find((user) => user.id === id);
}
