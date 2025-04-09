// Supabase Edge Function that will check subscription status directly with Stripe
// This function is public (no authentication required) to ensure it can be called
// from anywhere in the application
module.exports = {
  access: "public",
  verify_jwt: false
} 