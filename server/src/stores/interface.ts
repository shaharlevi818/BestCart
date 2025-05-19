// src/stores/interface.ts

export interface Store {
    id: number;
    name: string;
    base_url?: string | null; // Added from your schema
    // address and city were in my previous example, but not in your stores schema.
    // If you add them to the DB, you can add them here.
    created_at: Date;
    updated_at: Date;
}
