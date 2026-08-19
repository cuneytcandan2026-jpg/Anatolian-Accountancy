import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    category: z.enum(['business-accounting', 'tax', 'vat-payroll', 'business-support', 'mtd', 'specialist']),
    summary: z.string(),
    icon: z.string(),
    order: z.number(),
    href: z.string(),
  }),
});

const audiences = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/audiences' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    icon: z.string(),
    order: z.number(),
    href: z.string(),
  }),
});

const faq = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/faq' }),
  schema: z.object({
    question: z.string(),
    order: z.number(),
    group: z.enum(['getting-started', 'tax', 'cis', 'general']),
  }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/testimonials' }),
  schema: z.object({
    name: z.string(),
    context: z.string().optional(),
    source: z.enum(['google', 'direct', 'placeholder']),
    order: z.number(),
  }),
});

// EN/TR pairs live side by side as src/content/blog/en/<slug>.md and
// src/content/blog/tr/<slug>.md — the glob loader's id (e.g. "en/cis-guide")
// links each pair by matching slug across the two folders, since (unlike
// services/audiences/faq) blog needs real bilingual content rather than a
// hardcoded TR array.
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    // Unique <title>-tag copy, separate from the on-page H1 (`title`) so SEO
    // titles aren't just the heading with a suffix templated on — optional
    // because older/untranslated placeholder posts fall back to `title`.
    metaTitle: z.string().optional(),
    description: z.string(),
    category: z.enum(['cis', 'business-structure', 'vat', 'tax', 'mtd', 'general']),
    order: z.number(),
    status: z.enum(['placeholder', 'published']).default('placeholder'),
    relatedServiceHref: z.string().optional(),
    // Display string (e.g. "19 August 2026") shown on the post; absent on
    // posts that don't have real content yet.
    lastReviewed: z.string().optional(),
    // ISO date (YYYY-MM-DD): when this post's figures/rules should next be
    // checked against gov.uk. Cadence varies by topic — see the article's
    // own notes for why. Not rendered on the page, tracked for content ops.
    reviewBy: z.string().optional(),
  }),
});

export const collections = { services, audiences, faq, testimonials, blog };
