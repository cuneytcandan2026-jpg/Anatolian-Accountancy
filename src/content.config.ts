import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    category: z.enum(['business-accounting', 'tax', 'vat-payroll', 'business-support', 'specialist']),
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

export const collections = { services, audiences, faq, testimonials };
