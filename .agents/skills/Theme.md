# Dark Theme Implementation Agent — Storefront

You are an expert frontend engineer and UI/UX designer working on my existing website.

## Objective

The website already has a fully implemented **light theme** for the storefront.

Your task is to add a **beautiful, polished dark theme specifically for the Storefront**, while preserving the existing light theme and all existing functionality.

**Important:** Do NOT redesign the website from scratch. Inspect the existing codebase first and integrate the dark theme into the current architecture, components, styling system, and theme/state management.

---

# 1. Scope

### Storefront

Implement:

* Light theme — preserve the existing design exactly as much as reasonably possible.
* Dark theme — add the new design described below.
* Smooth animated transition between light and dark themes.
* Persistent theme selection.
* Attractive animated theme-switch button.

### Admin Panel

Do **NOT** change the Admin panel's visual design or functionality unless the Admin panel shares theme components/styles with the storefront.

If the theme system is shared, make the implementation scoped properly so enabling dark mode for the storefront does not unintentionally redesign the Admin panel.

---

# 2. Dark Theme Design System

Use the following exact colors as the foundation of the dark theme.

### Primary Background

```text
#47412D
```

Use this as the main dark-theme background.

Examples:

* Main page background
* Large sections
* Header/navigation where appropriate
* Empty states
* Main layout areas

Do not blindly apply this color to every element. Create visual hierarchy using opacity, borders, gradients, shadows, and the secondary color.

### Secondary Color

```text
#8A8548
```

Use this as the main accent/secondary color.

Use it for:

* Buttons
* Active navigation items
* Links
* Highlights
* Icons
* Badges
* Borders where appropriate
* Hover states
* Product/category accents
* Important UI elements

### Text

Primary text:

```text
#FFFFFF
```

Use white for important/main text.

For secondary text, you may use appropriately transparent versions of white, for example:

```text
rgba(255, 255, 255, 0.75)
rgba(255, 255, 255, 0.60)
```

Do not use pure white for every piece of text because it can reduce hierarchy.

---

# 3. Visual Direction

The dark theme should feel:

* Premium
* Modern
* Elegant
* Clean
* Attractive
* Professional
* Comfortable to browse at night
* Suitable for an e-commerce storefront

Avoid making it look like a generic black/dark-mode website.

The combination of:

```text
#47412D
#8A8548
#FFFFFF
```

should be clearly visible throughout the visual hierarchy.

Use subtle tonal variations where necessary, derived from the provided colors.

For example, you can create darker/lighter surfaces using the primary background with controlled opacity or slight tonal adjustments.

Do NOT introduce unrelated bright colors unless they are required for existing semantic states such as success, warning, or error.

---

# 4. Component-by-Component Implementation

Inspect the entire storefront and make sure dark mode works correctly across ALL existing pages and components.

Check at minimum:

### Header / Navbar

* Background
* Logo
* Navigation links
* Search
* Cart icon
* Account/user icon
* Mobile menu
* Dropdowns
* Hover states
* Active states
* Theme switch

### Homepage

* Hero section
* Hero text
* CTA buttons
* Product sections
* Categories
* Promotional banners
* Cards
* Featured products
* Testimonials if present
* Newsletter section
* Footer

### Product Listing

* Product cards
* Product images
* Product names
* Prices
* Discount labels
* Ratings
* Add-to-cart buttons
* Wishlist buttons
* Filters
* Sorting controls
* Pagination

### Product Details

* Product title
* Price
* Discount
* Product gallery
* Product description
* Quantity selector
* Add-to-cart
* Buy-now button
* Variant selectors
* Reviews
* Related products

### Cart

* Cart items
* Quantity controls
* Remove buttons
* Summary
* Total
* Checkout CTA
* Empty cart state

### Checkout

* Form inputs
* Labels
* Selects
* Radio buttons
* Payment sections
* Order summary
* Checkout buttons
* Validation/error states

### Authentication

If present:

* Login
* Register
* Forgot password
* Reset password
* OTP
* Form fields
* Buttons
* Error messages

### Other Storefront Pages

Inspect the repository and automatically identify additional storefront pages/components such as:

* About
* Contact
* FAQ
* Orders
* Profile
* Wishlist
* Search results
* Categories
* Offers
* Notifications
* Modals
* Drawers
* Toasts
* Loading states
* Error pages
* 404 page

Dark mode must work consistently everywhere.

---

# 5. Theme Switch Button

Create an **attractive animated theme-switch button**.

Do not use a basic checkbox.

The switch should clearly communicate:

☀️ Light Mode

and

🌙 Dark Mode

The animation should change when switching themes.

### Desired behavior

When switching from Light → Dark:

* Button smoothly animates
* Sun icon transitions/moves away
* Moon icon appears
* Background/accent changes smoothly
* A subtle rotation/scale effect can be used
* Page colors transition smoothly

When switching from Dark → Light:

* Reverse the animation
* Moon transitions away
* Sun appears
* Theme colors transition smoothly

Use CSS transitions/keyframes or the animation system already used by the project.

The animation should feel premium and smooth, not excessive.

Recommended transition duration:

```text
300ms – 500ms
```

Use appropriate easing such as:

```text
ease-in-out
```

or a polished cubic-bezier curve.

---

# 6. Theme Switch UI

Place the switch in the most logical existing location, preferably inside the existing:

* Navbar/header
* User menu
* Settings menu

Do not disrupt the current navbar layout.

Make the switch responsive and mobile-friendly.

On small screens, make sure it does not cause:

* Overflow
* Header wrapping
* Misalignment
* Horizontal scrolling

---

# 7. Page Transition

Add smooth theme transitions.

Avoid an abrupt color change when switching.

Where appropriate, use:

```css
transition:
  background-color 300ms ease,
  color 300ms ease,
  border-color 300ms ease,
  box-shadow 300ms ease;
```

Do NOT add transitions to properties where they could create performance problems.

Do not animate large images unnecessarily.

---

# 8. Theme Persistence

The user's selected theme must persist.

If the project already has a theme/context/state-management system, use it instead of creating another system.

Otherwise implement a lightweight solution using the existing application architecture.

The theme should persist after:

* Page refresh
* Navigation
* Closing and reopening the browser

Use an appropriate mechanism such as:

```text
localStorage
```

The initial theme behavior should respect the existing website's current behavior.

If the project already detects the user's system preference, preserve that behavior where appropriate.

---

# 9. Architecture Requirements

Before making changes:

1. Inspect the entire project structure.
2. Identify the frontend framework.
3. Identify the styling system.
4. Identify whether Tailwind CSS, CSS modules, plain CSS, styled-components, Sass, or another system is being used.
5. Identify existing theme/state management.
6. Identify the storefront/admin separation.
7. Identify reusable components.
8. Identify existing color variables/tokens.
9. Reuse existing components instead of duplicating them.

Do not introduce a new UI framework unnecessarily.

Do not migrate the project from one styling system to another.

Do not rewrite working components unless required.

---

# 10. Prefer Theme Variables

If the project architecture allows it, create centralized theme variables/tokens.

For example:

```css
:root {
  --background: existing-light-background;
  --secondary: existing-light-secondary;
  --text: existing-light-text;
}

.dark {
  --background: #47412D;
  --secondary: #8A8548;
  --text: #FFFFFF;
}
```

Adapt this structure to the project's existing architecture.

Do NOT blindly copy this exact implementation if the project uses Tailwind, CSS-in-JS, Context, Zustand, Redux, or another system.

The important requirement is centralized and maintainable theme values.

---

# 11. Cards and Surfaces

Do not make every card exactly the same color as the main background.

Create hierarchy.

For example:

Main:

```text
#47412D
```

Secondary accent:

```text
#8A8548
```

Cards/surfaces can use subtle variations or translucent overlays derived from the primary palette.

Use subtle:

* Borders
* Shadows
* Transparency
* Highlights

to separate cards from the background.

Avoid excessive shadows.

---

# 12. Buttons

Update existing storefront buttons for dark mode.

Primary buttons should strongly use:

```text
#8A8548
```

with:

```text
#FFFFFF
```

text.

Create polished hover/active/focus states.

Example behavior:

Normal:

* Secondary background
* White text

Hover:

* Slight brightness/lightness change
* Subtle elevation
* Smooth transition

Active:

* Slight scale-down or pressed effect

Focus:

* Clear accessible focus ring

Do not make every button identical. Preserve the existing button hierarchy.

---

# 13. Inputs and Forms

Dark mode must also cover:

* Input backgrounds
* Input borders
* Placeholder text
* Labels
* Focus states
* Select menus
* Textareas
* Checkboxes
* Radio buttons

Ensure sufficient contrast.

Do not leave white input backgrounds accidentally appearing throughout the dark theme.

---

# 14. Images

Do not alter product images unnecessarily.

Images should remain natural and clearly visible.

If the current image containers have white backgrounds, adapt the container/background for dark mode where appropriate without damaging the actual product image.

---

# 15. Accessibility

The dark theme must remain accessible.

Check:

* Text contrast
* Button contrast
* Link visibility
* Focus indicators
* Form labels
* Hover states
* Keyboard navigation

Do not sacrifice readability for aesthetics.

White text on #47412D should remain the primary text relationship.

---

# 16. Responsive Design

Verify the theme on:

* Desktop
* Laptop
* Tablet
* Mobile

The dark theme must not introduce:

* Overflow
* Broken layouts
* Text clipping
* Hidden buttons
* Misaligned icons
* Broken navigation
* Incorrect modal positioning

---

# 17. Do Not Break Existing Functionality

This is extremely important.

Do NOT break:

* Authentication
* Product loading
* API calls
* Cart
* Checkout
* Search
* Filters
* Forms
* Routing
* Admin functionality
* Existing animations
* Responsive behavior

The task is primarily a **visual/theme enhancement**, not a rewrite.

---

# 18. Code Quality

Keep the implementation:

* Clean
* Reusable
* Maintainable
* Component-based
* DRY
* Consistent with the existing project

Avoid:

* Massive duplicated CSS
* Hardcoded colors scattered across dozens of files
* Duplicate components for light/dark mode
* Unnecessary dependencies
* Unnecessary rewrites

Use the existing architecture whenever possible.

---

# 19. Testing

After implementation:

1. Start the application.
2. Test light mode.
3. Test dark mode.
4. Switch repeatedly between both themes.
5. Refresh the page.
6. Navigate between pages.
7. Test mobile layout.
8. Test desktop layout.
9. Test buttons.
10. Test forms.
11. Test product cards.
12. Test cart.
13. Test checkout.
14. Test modals/dropdowns.
15. Confirm Admin remains unaffected.
16. Check browser console for errors.
17. Fix any errors caused by your implementation.

---

# 20. Final Visual Quality Check

Before finishing, review the storefront as a professional UI/UX designer.

Ask:

* Does the dark theme actually look premium?
* Is #47412D clearly the dominant background?
* Is #8A8548 used effectively as the accent?
* Is white text readable?
* Is the visual hierarchy clear?
* Does the theme switch look attractive?
* Does the animation feel smooth?
* Are all storefront pages covered?
* Are cards and sections visually separated?
* Does mobile look good?
* Does light mode still look correct?

Make any necessary refinements.

---

# Important Final Instruction

Do not simply provide instructions or explain what should be changed.

**Actually inspect the existing project and implement the dark theme directly in the codebase.**

Preserve the existing storefront design and functionality, and add the new dark visual system on top of it.

The final result should feel like the website was intentionally designed with both light and dark themes from the beginning, rather than having a dark filter applied afterward.
