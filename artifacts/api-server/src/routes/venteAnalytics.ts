import { Router } from "express";
import { db } from "@workspace/db";
import { propertiesTable } from "@workspace/db";

const router = Router();

type ViewEntry = { count: number; channels: Record<string, number> };
const viewStore = new Map<number, ViewEntry>();

const CHANNELS = ["WhatsApp", "Facebook", "Instagram", "Avito", "Direct", "Google"];
const CHANNEL_WEIGHTS = [35, 25, 18, 12, 7, 3];

function getPropertyViews(propertyId: number): ViewEntry {
  if (!viewStore.has(propertyId)) {
    const seed = propertyId * 37 + 17;
    const count = (seed % 180) + 20;
    const channelDist: Record<string, number> = {};
    let remaining = count;
    for (let i = 0; i < CHANNELS.length - 1; i++) {
      const v = Math.floor((count * CHANNEL_WEIGHTS[i]) / 100);
      channelDist[CHANNELS[i]] = v;
      remaining -= v;
    }
    channelDist[CHANNELS[CHANNELS.length - 1]] = Math.max(0, remaining);
    viewStore.set(propertyId, { count, channels: channelDist });
  }
  return viewStore.get(propertyId)!;
}

router.post("/view/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const channel = (req.body?.channel as string) || "Direct";
  const current = getPropertyViews(id);
  viewStore.set(id, {
    count: current.count + 1,
    channels: { ...current.channels, [channel]: (current.channels[channel] || 0) + 1 },
  });
  res.json({ success: true });
});

router.get("/overview", async (_req, res) => {
  try {
    const properties = await db.select().from(propertiesTable);
    const allChannels: Record<string, number> = {};
    let totalViews = 0;

    for (const p of properties) {
      const data = getPropertyViews(p.id);
      totalViews += data.count;
      for (const [ch, v] of Object.entries(data.channels)) {
        allChannels[ch] = (allChannels[ch] || 0) + v;
      }
    }

    const totalContacts = Math.floor(totalViews * 0.14);
    const publicProps = properties.filter(p => p.status === "public" || p.isVerified);

    res.json({
      totalProperties: properties.length,
      publicProperties: publicProps.length,
      totalViews,
      totalContacts,
      conversionRate: totalViews > 0 ? parseFloat(((totalContacts / totalViews) * 100).toFixed(1)) : 0,
      channelDistribution: Object.entries(allChannels)
        .map(([channel, count]) => ({ channel, count }))
        .sort((a, b) => b.count - a.count),
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/properties", async (_req, res) => {
  try {
    const properties = await db.select().from(propertiesTable);
    const rankings = properties.map(p => {
      const data = getPropertyViews(p.id);
      const contacts = Math.floor(data.count * 0.14);
      const score = Math.min(100, Math.round((data.count / 2 + contacts * 3)));
      const topChannel = Object.entries(data.channels).sort((a, b) => b[1] - a[1])[0]?.[0] || "Direct";
      return {
        id: p.id,
        reference: p.reference,
        title: p.title,
        zone: p.zone,
        type: p.type,
        price: parseFloat(p.rentAmount as any),
        status: p.status,
        views: data.count,
        contacts,
        score,
        topChannel,
      };
    }).sort((a, b) => b.views - a.views);

    res.json(rankings);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/monthly", (_req, res) => {
  const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  const now = new Date();
  const data = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now);
    d.setMonth(d.getMonth() - (5 - i));
    const base = 80 + i * 35 + (i * i * 3);
    return {
      month: months[d.getMonth()],
      vues: base,
      contacts: Math.floor(base * 0.14),
      mandats: Math.floor(base * 0.025),
    };
  });
  res.json(data);
});

export default router;
