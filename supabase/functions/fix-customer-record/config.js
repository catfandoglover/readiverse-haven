// This makes your Supabase Edge Function publicly accessible
// without requiring JWT authentication
export default {
  // Set the access control level to "public"
  // This means requests can be made without a valid JWT
  access: "public",
  // Disable JWT verification for public access
  verify_jwt: false
} 