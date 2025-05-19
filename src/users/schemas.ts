// src/users/schemas.ts
import { z } from 'zod';

export const createUserSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email address."),
        password: z.string().min(8, "Password must be at least 8 characters long."),
        name: z.string().max(100).optional(), // Matches schema: VARCHAR(100) NULL
        preferred_store_id: z.number().int().positive().optional(),
    }),
});

// Schema to validate userId in route parameters
export const userIdParamSchema = z.object({
    params: z.object({
        userId: z.string()
                   .regex(/^\d+$/, "User ID must be a positive integer string")
                   .transform(Number)
                   .refine(num => num > 0, "User ID must be positive"),
    }),
});
export type ValidatedUserIdParams = z.infer<typeof userIdParamSchema>['params'];


// schema for login later
// export const loginUserSchema = z.object({
//     body: z.object({
//         email: z.string().email("Invalid email address."),
//         password: z.string(),
//     }),
// });
