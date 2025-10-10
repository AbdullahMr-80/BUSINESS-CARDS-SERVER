import mongoose from "mongoose";
import { seedUsers } from "../users/seed/seed.js";
import { seedCards } from "../cards/seed/seed.js";

function mapState(code) {
  switch (code) {
    case 0:
      return "disconnected";
    case 1:
      return "connected";
    case 2:
      return "connecting";
    case 3:
      return "disconnecting";
    default:
      return "disconnected";
  }
}

export function getDbState() {
  return mapState(mongoose.connection.readyState);
}

export async function connectToDatabase(uri, { seed = false } = {}) {
  const state = getDbState();
  if (state === "connected" || state === "connecting") return;

  try {
    await mongoose.connect(uri, {
      autoIndex: true,
      maxPoolSize: 10,
    });
    console.log("[db] connected:", uri.replace(/\/\/.*@/, "//***:***@"));

    if (seed && process.env.NODE_ENV !== "production") {
      await seedUsers();
      await seedCards();
    }
  } catch (err) {
    console.error("[db] connection error:", err);
    throw err;
  }
}
4;
export async function disconnectFromDatabase() {
  const state = getDbState();
  if (state === "disconnected" || state === "disconnecting") return;

  try {
    await mongoose.connection.close();
    console.log("[db] disconnected");
  } catch (err) {
    console.error("[db] disconnect error:", err);
    throw err;
  }
}
