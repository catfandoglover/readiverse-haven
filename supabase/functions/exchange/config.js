// This makes your Supabase Edge Function publicly accessible
// without requiring JWT authentication
export default {
  // Set the access control level to "public"
  // This means requests can be made without a valid JWT
  // necessary for exchanging external tokens
  access: "public",
  // Disable JWT verification. necessary for exchanging external tokens because the function much be reachable before has authed with supabase 
  verify_jwt: false
} 
