#!/usr/bin/env node
// Test script for exchange function
import fetch from 'node-fetch';

// Get command line arguments
const args = process.argv.slice(2);
const token = args[0];
const url = args[1] || 'https://myeyoafugkrkwcnfedlu.supabase.co/functions/v1/exchange';
const serviceRoleKey = args[2]; // Optional service role key

if (!token) {
  console.error('Error: Please provide an Outseta token as the first argument');
  console.log('Usage: node test-exchange.js <outseta-token> [edge-function-url] [service-role-key]');
  process.exit(1);
}

// Make the request to the edge function
async function testExchange() {
  console.log(`Testing token exchange at: ${url}`);
  console.log(`Token (first 10 chars): ${token.substring(0, 10)}...`);
  
  // Headers
  const headers = {
    'Content-Type': 'application/json'
  };
  
  // Add service role key if provided
  if (serviceRoleKey) {
    headers['Authorization'] = `Bearer ${serviceRoleKey}`;
    console.log('Using service role key for authentication');
  }
  
  try {
    console.log('\nSending request with token in body...');
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ token })
    });
    
    const status = response.status;
    const text = await response.text();
    
    console.log(`Status: ${status}`);
    try {
      // Try to parse as JSON
      const data = JSON.parse(text);
      console.log('Response (parsed):', data);
      
      // If successful, verify the JWT structure
      if (data.supabaseJwt) {
        console.log('\nSupabase JWT received. Token structure:');
        const parts = data.supabaseJwt.split('.');
        if (parts.length === 3) {
          // Decode the payload (middle part)
          const encodedPayload = parts[1];
          const decodedPayload = Buffer.from(
            encodedPayload.replace(/-/g, '+').replace(/_/g, '/'), 
            'base64'
          ).toString('utf8');
          
          try {
            const payload = JSON.parse(decodedPayload);
            console.log('JWT Payload:', payload);
            console.log('Expiration:', new Date(payload.exp * 1000).toLocaleString());
          } catch (e) {
            console.log('Could not parse JWT payload:', e.message);
          }
        } else {
          console.log('Invalid JWT format (should have 3 parts)');
        }
      }
    } catch (e) {
      // If not JSON, show the raw response
      console.log('Raw response:', text);
    }
  } catch (error) {
    console.error('Error making request:', error.message);
  }
}

testExchange();
