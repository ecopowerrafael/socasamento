import { Router } from 'express';
import { db } from '../db/index.ts';
import {
  weddingWebsites,
  weddingRsvps,
  weddingGifts,
  weddingGuests,
  photographyQuoteRequests,
  photographers,
} from '../db/schema.ts';
import { eq, and, isNull } from 'drizzle-orm';

const router = Router();

// GET /api/wedding-website/:slug (Public Wedding Website View for Guests)
router.get('/wedding-website/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const sites = await db
      .select()
      .from(weddingWebsites)
      .where(and(eq(weddingWebsites.slug, slug), eq(weddingWebsites.isPublished, true)));

    if (sites.length === 0) {
      return res.status(404).json({ success: false, error: 'Site de casamento não encontrado ou não publicado.' });
    }

    const site = sites[0];

    // Fetch gifts for the couple
    const gifts = await db
      .select()
      .from(weddingGifts)
      .where(and(eq(weddingGifts.userId, site.userId), isNull(weddingGifts.deletedAt)));

    return res.json({
      success: true,
      website: {
        id: site.id,
        coupleNames: site.coupleNames,
        headline: site.headline,
        story: site.story,
        weddingDate: site.weddingDate,
        ceremonyLocation: site.ceremonyLocation,
        receptionLocation: site.receptionLocation,
        coverImage: site.coverImage,
        theme: site.theme,
        primaryColor: site.primaryColor,
        rsvpEnabled: site.rsvpEnabled,
      },
      gifts,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/wedding-website/:slug/rsvp (Public RSVP Confirmation)
router.post('/wedding-website/:slug/rsvp', async (req, res) => {
  try {
    const { slug } = req.params;
    const { guestName, phone, email, companions, confirmationStatus, message } = req.body;

    if (!guestName) {
      return res.status(400).json({ success: false, error: 'Por favor, informe seu nome completo.' });
    }

    const sites = await db
      .select()
      .from(weddingWebsites)
      .where(and(eq(weddingWebsites.slug, slug), eq(weddingWebsites.isPublished, true)));

    if (sites.length === 0) {
      return res.status(404).json({ success: false, error: 'Site de casamento não encontrado.' });
    }

    const site = sites[0];
    if (!site.rsvpEnabled) {
      return res.status(400).json({ success: false, error: 'A confirmação de presença (RSVP) está desativada no momento.' });
    }

    // Insert RSVP record
    const [insert] = await db.insert(weddingRsvps).values({
      weddingWebsiteId: site.id,
      guestName,
      phone: phone || null,
      email: email || null,
      companions: companions ? Number(companions) : 0,
      confirmationStatus: confirmationStatus || 'confirmed',
      message: message || null,
    });

    // Also update guest list in wedding_guests if name matches
    try {
      const matchGuests = await db
        .select()
        .from(weddingGuests)
        .where(and(eq(weddingGuests.userId, site.userId), eq(weddingGuests.name, guestName)));

      if (matchGuests.length > 0) {
        await db
          .update(weddingGuests)
          .set({
            confirmationStatus: confirmationStatus === 'confirmed' ? 'confirmed' : 'declined',
            companions: companions ? Number(companions) : matchGuests[0].companions,
            updatedAt: new Date(),
          })
          .where(eq(weddingGuests.id, matchGuests[0].id));
      } else {
        await db.insert(weddingGuests).values({
          userId: site.userId,
          name: guestName,
          phone: phone || null,
          email: email || null,
          companions: companions ? Number(companions) : 0,
          confirmationStatus: confirmationStatus === 'confirmed' ? 'confirmed' : 'declined',
          notes: `RSVP via mini site em ${new Date().toLocaleDateString('pt-BR')}`,
        });
      }
    } catch (e) {
      // non-critical
    }

    return res.status(201).json({
      success: true,
      message: 'Sua confirmação de presença foi enviada com sucesso! Obrigado!',
      id: insert.insertId,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
