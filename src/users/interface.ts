// src/users/interface.ts

// Represents a user object as stored in the database (excluding password)
export interface User {
    id: number;
    email: string; // Primary identifier from DB
    name?: string | null; // From DB
    preferred_store_id?: number | null; // From DB
    created_at: Date;
    updated_at: Date;
    // Do NOT include password_hash here for responses
}

// Data Transfer Object for creating a new user
export interface CreateUserDto {
    email: string;
    password: string; // Plain text password, will be hashed by the service
    name?: string;    // Matches your schema's `name` field
    preferred_store_id?: number;
}

// For user data coming from the DB including the hash (internal use only)
export interface UserWithPassword extends User {
    password_hash: string;
}