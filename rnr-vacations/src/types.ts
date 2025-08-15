export type Listing = { id: string; owner_id: string; type: 'hotel'|'timeshare'; name: string; description?: string; city: string; country: string; area?: string; rating?: number; price_per_night: number; hero_image_url?: string; images?: string[]; amenities?: string[]; };
export type Booking = { id: string; listing_id: string; guest_id: string; start_date: string; end_date: string; guests: number; status: string; total_amount: number };
export type Thread = { id: string; listing_id: string; host_id: string; guest_id: string; created_at: string };
export type Message = { id: string; thread_id: string; sender_id: string; body: string; created_at: string };
export type Review = { id: string; listing_id: string; author_id: string; rating: number; comment?: string; created_at: string };