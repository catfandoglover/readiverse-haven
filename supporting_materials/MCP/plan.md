My app is at /Users/philip.galebach/coding-projects/alexandria/readiverse-haven/

I plan to use outseta for auth while continuing with supabase for the rest of the backend. I have outseta admin access and supabase project set up. 

Start by just adding login and signup buttons for outseta to the app using the official API here: https://github.com/tiltcamp/outseta-api-client

my full outseta domain: 'lightninginspiration.outseta.com'
my outseta subdomain: 'lightninginspiration'

Simplified Plan for JWT Authentication Check:

1. Basic Outseta Setup (DONE)
   - Install Outseta SDK
   - Add minimal Outseta authentication button
   - Verify we can get a JWT token from Outseta login

2. Simple Supabase JWT Test
   - Configure Supabase to use Outseta's JWT signing key
   - Create a basic protected endpoint in Supabase
   - Write a simple test function that:
     - Gets the JWT from Outseta login
     - Makes a test call to protected Supabase endpoint using the JWT
     - Verifies success/failure

3. Test Flow
   - Login with Outseta
   - Log the JWT to console
   - Try accessing protected Supabase endpoint
   - Verify in logs if authentication worked
