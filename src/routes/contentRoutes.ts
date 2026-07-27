import crypto from 'node:crypto';
import { Router } from 'express';
import { and, asc, desc, eq } from 'drizzle-orm';
import { db } from '../db/index.ts';
import { blogArticles, inspirations, photoLocations } from '../db/schema.ts';
import { requireAdmin, requireAuth } from '../middleware/auth.ts';

const router = Router();

const slugify = (value: string) => value.toLowerCase().normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

router.get('/inspirations', async (_req, res) => {
  const items = await db.select().from(inspirations)
    .where(eq(inspirations.status, 'active'))
    .orderBy(asc(inspirations.sortOrder), desc(inspirations.createdAt));
  res.json({ success: true, inspirations: items.map((item) => ({ ...item, favorited: false })) });
});

router.post('/inspirations', requireAuth, requireAdmin, async (req, res) => {
  const id = String(req.body.id || `insp-${crypto.randomUUID()}`).slice(0, 100);
  await db.insert(inspirations).values({
    id,
    title: String(req.body.title || '').slice(0, 255),
    category: String(req.body.category || 'geral').slice(0, 100),
    imageUrl: String(req.body.imageUrl || ''),
    likesCount: Math.max(0, Number(req.body.likesCount) || 0),
    status: 'active',
  });
  const [item] = await db.select().from(inspirations).where(eq(inspirations.id, id)).limit(1);
  res.status(201).json({ success: true, inspiration: item });
});

router.put('/inspirations/:id', requireAuth, requireAdmin, async (req, res) => {
  await db.update(inspirations).set({
    title: String(req.body.title || '').slice(0, 255),
    category: String(req.body.category || 'geral').slice(0, 100),
    imageUrl: String(req.body.imageUrl || ''),
    likesCount: Math.max(0, Number(req.body.likesCount) || 0),
  }).where(eq(inspirations.id, req.params.id));
  const [item] = await db.select().from(inspirations).where(eq(inspirations.id, req.params.id)).limit(1);
  res.json({ success: true, inspiration: item });
});

router.delete('/inspirations/:id', requireAuth, requireAdmin, async (req, res) => {
  await db.update(inspirations).set({ status: 'inactive' }).where(eq(inspirations.id, req.params.id));
  res.json({ success: true });
});

router.get('/photo-locations', async (_req, res) => {
  const locations = await db.select().from(photoLocations)
    .where(eq(photoLocations.status, 'active'))
    .orderBy(asc(photoLocations.sortOrder), asc(photoLocations.name));
  res.json({ success: true, locations });
});

router.get('/blog', async (_req, res) => {
  const articles = await db.select().from(blogArticles).orderBy(desc(blogArticles.createdAt));
  res.json({ success: true, articles });
});

router.get('/blog/:slug', async (req, res) => {
  const [article] = await db.select().from(blogArticles).where(eq(blogArticles.slug, req.params.slug)).limit(1);
  if (!article) return res.status(404).json({ success: false, error: 'Artigo não encontrado.' });
  res.json({ success: true, article });
});

router.post('/admin/blog', requireAuth, requireAdmin, async (req, res) => {
  const slug = slugify(String(req.body.slug || req.body.title || ''));
  const [result] = await db.insert(blogArticles).values({
    slug,
    title: String(req.body.title || '').slice(0, 255),
    excerpt: String(req.body.excerpt || ''),
    content: String(req.body.content || ''),
    category: String(req.body.category || 'Dicas'),
    author: String(req.body.author || 'Equipe Guia Fotógrafo Casamento'),
    date: String(req.body.date || new Date().toLocaleDateString('pt-BR')),
    readTime: String(req.body.readTime || '5 min de leitura'),
    image: String(req.body.image || ''),
    seoKeywords: Array.isArray(req.body.seoKeywords) ? req.body.seoKeywords : [],
  }).$returningId();
  const [article] = await db.select().from(blogArticles).where(eq(blogArticles.id, result.id)).limit(1);
  res.status(201).json({ success: true, article });
});

router.put('/admin/blog/:id', requireAuth, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await db.update(blogArticles).set({
    ...(req.body.title !== undefined ? { title: String(req.body.title).slice(0, 255) } : {}),
    ...(req.body.slug !== undefined || req.body.title !== undefined ? { slug: slugify(String(req.body.slug || req.body.title)) } : {}),
    ...(req.body.excerpt !== undefined ? { excerpt: String(req.body.excerpt) } : {}),
    ...(req.body.content !== undefined ? { content: String(req.body.content) } : {}),
    ...(req.body.category !== undefined ? { category: String(req.body.category) } : {}),
    ...(req.body.author !== undefined ? { author: String(req.body.author) } : {}),
    ...(req.body.date !== undefined ? { date: String(req.body.date) } : {}),
    ...(req.body.readTime !== undefined ? { readTime: String(req.body.readTime) } : {}),
    ...(req.body.image !== undefined ? { image: String(req.body.image) } : {}),
    ...(Array.isArray(req.body.seoKeywords) ? { seoKeywords: req.body.seoKeywords } : {}),
  }).where(eq(blogArticles.id, id));
  const [article] = await db.select().from(blogArticles).where(eq(blogArticles.id, id)).limit(1);
  res.json({ success: true, article });
});

router.delete('/admin/blog/:id', requireAuth, requireAdmin, async (req, res) => {
  await db.delete(blogArticles).where(eq(blogArticles.id, Number(req.params.id)));
  res.json({ success: true });
});

export default router;
