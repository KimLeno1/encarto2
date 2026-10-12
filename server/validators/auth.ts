import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(24, 'Username cannot exceed 24 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain alphanumeric characters and underscores'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
  birthday: z.string().optional(),
  bio: z.string().max(300, 'Bio cannot exceed 300 characters').optional(),
  avatarUrl: z.string().url('Invalid avatar URL').optional().or(z.literal('')),
});

export const loginSchema = z.object({
  emailOrUsername: z.string().min(1, 'Please provide email or username'),
  password: z.string().min(1, 'Please provide password'),
});

export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(24)
    .regex(/^[a-zA-Z0-9_]+$/)
    .optional(),
  email: z.string().email().optional(),
  bio: z.string().max(300).optional(),
  avatarUrl: z.string().optional(),
  phone: z.string().max(30).optional(),
  birthday: z.string().max(30).optional(),
  selectedTheme: z.string().max(50).optional(),
  activePlugin: z.string().max(50).nullable().optional(),
  activeDecoration: z.string().max(50).nullable().optional(),
  newPassword: z.string().min(8).max(128).optional(),
  currentPassword: z.string().optional(),
});
