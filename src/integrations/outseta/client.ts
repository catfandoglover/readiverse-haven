import { Outseta } from '@outseta/client';

export const outseta = new Outseta({ 
  domain: 'lightninginspiration.outseta.com'
});

// Helper function to get the current user
export const getCurrentUser = async () => {
  try {
    const user = await outseta.auth.getCurrentUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};