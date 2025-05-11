// src/middleware/validateRequest.ts
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod'; // Import Zod types

// Middleware generator function that takes a schema
export const validateRequest = (schema: AnyZodObject) =>
  // Returns the actual middleware function
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse and validate request parts against the schema
      // parseAsync throws an error if validation fails
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      // If validation is successful, call next() to pass control to the route handler
      return next();
    } catch (error) {
      // Check if the error is a Zod validation error
      if (error instanceof ZodError) {
        // Format the Zod errors into a more readable structure
        const formattedErrors = error.errors.map(err => ({
          path: err.path.join('.'), // e.g., "body.name"
          message: err.message,
        }));
        // Send a 400 Bad Request response with the validation errors
        return res.status(400).json({
          message: 'Input validation failed',
          errors: formattedErrors,
        });
      }
      // If it's not a Zod error, pass it to the default Express error handler
      next(error);
    }
  };




  