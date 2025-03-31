
# Desktop View Redesign for Discover Feeds

## Objective
Redesign the desktop view of the discover pages to use a horizontal card layout while ensuring the mobile experience stays exactly the same.

## Implementation Plan

1. Create a responsive layout that shows:
   - Vertical card layout on mobile (unchanged from current)
   - Horizontal card layout on desktop with image on left, content on right

2. Use the `useIsMobile` hook to conditionally render different layouts based on screen width

3. Update the following components:
   - ContentCard.tsx - Add desktop specific layout
   - Feed pages (IconsFeedPage, ClassicsFeedPage, ConceptsFeedPage)
   - DiscoverLayout.tsx

4. Maintain all existing functionality, including:
   - Navigation between items
   - Favorite toggling
   - Detail view access
   - Back navigation

5. Improve desktop-specific styling:
   - Larger typography
   - Better spacing
   - Hover effects
   - Improved navigation controls

## Technical Approach
- Use breakpoint of 768px to distinguish between mobile and desktop 
- Apply conditional rendering based on `useIsMobile` hook
- Keep all business logic unchanged
- Focus only on layout and styling changes for desktop
