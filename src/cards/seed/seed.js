import { Card } from "../models/card.js";
import { createCardDoc } from "../services/createCardDoc.js";

/**
 * Seed the database with 3 demo cards (admin, business, regular user)
 * Runs only if the cards collection is empty.
 */
export async function seedCards() {
  const existing = await Card.estimatedDocumentCount().exec();
  if (existing > 0) {
    console.log("[seed] cards: already present → skipping");
    return;
  }

  const base = [
    {
      title: "קפה הבוקר שלי",
      subtitle: "תערובות קלייה טריות בכל יום",
      description:
        "בית קלייה בוטיק בתל אביב המציע מגוון תערובות קפה, ציוד להכנה מקצועית, והדרכות טעימה במקום. באווירה חמימה ובשירות אישי, אנו מזמינים אתכם לגלות את סוד הארומה של הקפה המושלם.",
      phone: "03-5551234",
      email: "hello@roasters.example",
      web: "https://roasters.example",
      image: { url: "https://picsum.photos/seed/coffee/600/400", alt: "קפה" },
      address: {
        country: "ישראל",
        city: "תל אביב",
        street: "הרצל",
        houseNumber: 10,
        zip: 61000,
      },
      likes: [],
      user_id: "68e26818ec6989854c84f4cf", // business user
    },
    {
      title: "גן ירוק",
      subtitle: "עיצוב והקמת גינות פרטיות",
      description:
        "חברת גן ירוק מתמחה בעיצוב והקמת גינות פרטיות ובתחזוקת שטחים ירוקים. אנו שמים דגש על איכות החומרים, מקצועיות ויחס אישי לכל לקוח.",
      phone: "02-7778888",
      email: "contact@greengardens.example",
      web: "https://greengardens.example",
      image: { url: "https://picsum.photos/seed/garden/600/400", alt: "גן" },
      address: {
        country: "ישראל",
        city: "ירושלים",
        street: "יפו",
        houseNumber: 5,
        zip: 91000,
      },
      likes: [],
      user_id: "68e26818ec6989854c84f4d0", // regular user
    },
    {
      title: "תיקון בקליק",
      subtitle: "תיקוני סלולר ומחשבים",
      description:
        "מעבדת שירות מקצועית בחיפה המתמחה בתיקון טלפונים ניידים, טאבלטים ומחשבים ניידים. שירות מהיר, חלפים מקוריים ואחריות מלאה על כל תיקון.",
      phone: "04-1234567",
      email: "support@fixit.example",
      web: "https://fixit.example",
      image: { url: "https://picsum.photos/seed/tech/600/400", alt: "תיקונים" },
      address: {
        country: "ישראל",
        city: "חיפה",
        street: "אלנבי",
        houseNumber: 22,
        zip: 33000,
      },
      likes: [],
      user_id: "68e26818ec6989854c84f4ce", // admin
    },
  ];

  const docs = await Promise.all(
    base.map(async (b) =>
      createCardDoc({
        ownerId: b.user_id,
        input: {
          title: b.title,
          subtitle: b.subtitle,
          description: b.description,
          phone: b.phone,
          email: b.email,
          web: b.web,
          image: b.image,
          address: b.address,
        },
      })
    )
  );

  console.log(`[seed] cards: inserted ${docs.length} default cards`);
}
