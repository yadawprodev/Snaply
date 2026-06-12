import * as z from 'zod';

// ============================================================
// USER
// ============================================================
export const signupValidation = z.object({
  name: z.string().min(1, { message: 'Too short' }),
  username: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least eight characters' }),
});

export const signinValidation = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least eight characters' }),
});

export const ProfileValidation = z.object({
  file: z.custom<File[]>(),
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  username: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email(),
  bio: z.string(),
});

// ============================================================
// POST
// ============================================================
export const postValidation = z.object({
  caption: z.string().min(5).max(2200),
  file: z
    .custom<File[]>()
    .refine((files) => files && files.length > 0, {
      message: 'Please add a photo.',
    }),
  location: z.string().min(2).max(100),
  tags: z.string().optional(),
});
