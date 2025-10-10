import { User } from "../models/user.js";
import bcrypt from "bcrypt";

/**
 * Seeds 3 default users (admin, business, regular) if the collection is empty.
 * Runs automatically at server startup.
 */
export async function seedUsers() {
  const count = await User.estimatedDocumentCount().exec();
  if (count > 0) {
    console.log("[seed] users: already present → skipping");
    return;
  }

  console.log("[seed] Users collection empty — seeding defaults...");

  const SALT_ROUNDS = 10;
  const hash = (pwd) => bcrypt.hashSync(pwd, SALT_ROUNDS);

  const users = [
    {
      name: { first: "מנהל", last: "מערכת" },
      phone: "03-1234567",
      email: "admin@cardforge.io",
      password: hash("Demo1234$"),
      image: {
        url: "https://i.pravatar.cc/150?u=admin",
        alt: "Admin avatar",
      },
      address: {
        country: "ישראל",
        city: "תל אביב",
        street: "הרצל",
        houseNumber: 1,
        zip: 61000,
      },
      isBusiness: false,
      isAdmin: true,
    },
    {
      name: { first: "משתמש", last: "עסקי" },
      phone: "04-7654321",
      email: "business@cardforge.io",
      password: hash("Demo1234$"),
      image: {
        url: "https://i.pravatar.cc/150?u=business",
        alt: "Business user avatar",
      },
      address: {
        country: "ישראל",
        city: "חיפה",
        street: "בן גוריון",
        houseNumber: 5,
        zip: 33200,
      },
      isBusiness: true,
      isAdmin: false,
    },
    {
      name: { first: "משתמש", last: "רגיל" },
      phone: "02-5557777",
      email: "user@cardforge.io",
      password: hash("Demo1234$"),
      image: {
        url: "https://i.pravatar.cc/150?u=user",
        alt: "Regular user avatar",
      },
      address: {
        country: "ישראל",
        city: "ירושלים",
        street: "קינג ג'ורג'",
        houseNumber: 10,
        zip: 91000,
      },
      isBusiness: false,
      isAdmin: false,
    },
  ];

  await User.insertMany(users);
  console.log("[seed] Inserted 3 default users.");
}
