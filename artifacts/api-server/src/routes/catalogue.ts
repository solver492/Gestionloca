import { Router } from "express";
import { db, propertiesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

// Public catalogue — no auth required
// Returns only verified + disponible properties, with sensitive data stripped
router.get("/", async (req, res) => {
  try {
    const { zone, type } = req.query;

    const conditions = [
      eq(propertiesTable.isVerified, true),
      eq(propertiesTable.status, "disponible"),
    ];
    if (zone) conditions.push(eq(propertiesTable.zone, zone as string));
    if (type) conditions.push(eq(propertiesTable.type, type as string));

    const properties = await db
      .select({
        id: propertiesTable.id,
        reference: propertiesTable.reference,
        title: propertiesTable.title,
        type: propertiesTable.type,
        zone: propertiesTable.zone,
        address: propertiesTable.address,
        surface: propertiesTable.surface,
        rooms: propertiesTable.rooms,
        bathrooms: propertiesTable.bathrooms,
        rentAmount: propertiesTable.rentAmount,
        chargesAmount: propertiesTable.chargesAmount,
        amenities: propertiesTable.amenities,
        photos: propertiesTable.photos,
        videoUrl: propertiesTable.videoUrl,
        description: propertiesTable.description,
        status: propertiesTable.status,
      })
      .from(propertiesTable)
      .where(and(...conditions));

    res.json(
      properties.map((p) => ({
        ...p,
        surface: parseFloat(p.surface),
        rentAmount: parseFloat(p.rentAmount),
        chargesAmount: parseFloat(p.chargesAmount || "0"),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Error fetching catalogue");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
