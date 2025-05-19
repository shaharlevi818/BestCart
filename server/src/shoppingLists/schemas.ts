// src/shoppingLists/schemas.ts
import { xml } from 'cheerio';
import { z } from 'zod';

// Schema for the BODY of the "Create List" request (POST /api/lists)
export const createListSchema = z.object({
  // Define validation rules for the 'body' part of the request
  body: z.object({
    name: z.string({ required_error: 'VALIDATION: List name is required.' }) // Ensure name is a string
           .min(1, { message: 'VALIDATION: List name cannot be empty.' }) // Ensure not empty
           .max(255, { message: 'VALIDATION: List name too long (max 255 chars).' }), // Optional max length
    description: z.string()
                  .max(1000, { message: 'VALIDATION: Description too long (max 1000 chars).'})
                  .optional(), // description is optional
    is_template: z.boolean().optional(), // is_template is optional, must be boolean if provided
    // user_id typically comes from authentication, not the request body for creating a list for oneself
  })
  // You could also validate req.params or req.query here if needed, e.g.
  // params: z.object({ listId: z.string().regex(/^\d+$/, { message: "List ID must be a number"}) })
});

export const getListByListIdSchema = z.object({
  params: z.object({
    listId: z.string({ required_error: 'VALIDATION: List ID is required.'})
             .regex(/^\d+$/, {message: `VALIDATION: List ID must be positive integer.`})
             .transform(Number)
             .refine(num => num > 0, 'VALIDATION: List ID must be positive.')

  }),
});


// --- Define other schemas here ---
// export const updateListSchema = z.object({ ... });
// export const addItemSchema = z.object({ ... });
// export const updateItemSchema = z.object({ ... });

// Type inferred from the schema (optional, but can be useful)
export type CreateListInput = z.infer<typeof createListSchema>['body'];
export type GetListByListIdInput = z.infer<typeof getListByListIdSchema>;
