# KitabGhar E-Book Management System - Design Guidelines

## Design Approach

**Hybrid Approach**: Material Design system foundation with inspiration from Goodreads (book displays), Notion (clean data presentation), and Linear (modern admin interfaces). This balances the visual richness of book covers with the functional density of library management and admin dashboards.

## Core Design Principles

1. **Dual Personality**: User view feels inviting and discovery-focused; Admin view feels powerful and data-driven
2. **Visual Hierarchy**: Book covers are heroes, data is supporting cast
3. **Smooth Transitions**: Every interaction flows naturally with purposeful animations
4. **Scannable Density**: Information-rich but never overwhelming

## Typography

- **Headings**: Inter font family - Semi-bold (600) for page titles, Medium (500) for section headers
- **Body**: Inter Regular (400) for descriptions, metadata
- **UI Elements**: Inter Medium (500) for buttons, labels, navigation
- **Size Scale**: text-4xl/3xl for page titles, text-xl for section headers, text-base for body, text-sm for metadata

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24 (p-2, m-4, gap-6, space-y-8, etc.)

**Grid Patterns**:
- Book cards: grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6
- Admin tables: Full-width responsive tables with fixed headers
- Dashboards: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 for stat cards

**Container Max-widths**: max-w-7xl for main content areas, max-w-6xl for reading-focused pages

## Component Library

### User View Components

**Navigation Bar**:
- Logo left, search center, user menu + theme toggle right
- Sticky positioning with backdrop blur on scroll
- Height: h-16, padding px-6

**Book Card** (Primary Display):
- Aspect ratio 2:3 for cover images
- Rounded corners (rounded-lg)
- Hover: Lift effect (translate-y-[-4px]) with shadow increase
- Overlay on hover: Book title, author, rating stars, download count
- Transition duration: 300ms

**Book Detail Page**:
- Two-column layout: Cover image left (max-w-md), details right
- Rating display: Star icons with average rating and review count
- Action buttons: Download (primary), Bookmark (secondary), horizontal layout
- Review section: Card-based layout with user avatar, rating stars, comment text
- Reading progress indicator: Progress bar component

**Search & Filter Panel**:
- Horizontal layout: Search input (flex-1), category dropdown, sort dropdown
- Filter pills below for active filters with dismiss icons
- Results count display

### Admin View Components

**Admin Sidebar**:
- Width: w-64, fixed positioning
- Navigation items with icons (from Heroicons)
- Active state: Background accent, border-l-4
- Spacing: py-3 px-4 per item

**Admin Dashboard**:
- Stat cards in 4-column grid: Total books, users, downloads, reviews
- Each card: Icon top-left, large number, label below, trend indicator
- Padding: p-6, rounded-xl

**Data Tables**:
- Striped rows for readability
- Action buttons in rightmost column (Edit, Delete icons)
- Pagination controls at bottom
- Sortable column headers with arrow indicators

**Upload Form**:
- Two-column layout for form fields
- Drag-and-drop zones for cover image and book file
- Preview panels showing uploaded files
- Progress indicators during upload

**User Management Table**:
- Columns: Avatar, Name, Email, Role, Status, Join Date, Actions
- Role badges with color coding
- Block/Unblock toggle switches
- Role change dropdown

## Theme Implementation

**Light Mode**:
- Background: Slate-50 for page, White for cards
- Text: Slate-900 for primary, Slate-600 for secondary
- Borders: Slate-200

**Dark Mode**:
- Background: Slate-900 for page, Slate-800 for cards  
- Text: Slate-50 for primary, Slate-300 for secondary
- Borders: Slate-700

**Accent Colors**: Blue-600 for primary actions, Emerald-600 for success states, Red-600 for destructive actions

## Animation Strategy

**Page Transitions**: Fade + slide-up (opacity 0→1, translate-y-4→0, duration 400ms)

**Interactive Elements**:
- Buttons: Scale on click (scale-95), 150ms
- Cards: Hover lift (translate-y-[-4px]), 300ms
- Modals: Fade backdrop + scale content (0.95→1), 300ms
- Toasts: Slide-in from top-right, auto-dismiss with progress bar

**Loading States**:
- Skeleton screens for book grids (pulsing gradient)
- Spinner for data tables
- Progress bars for file uploads

**Micro-interactions**:
- Star rating: Scale pulse on click
- Bookmark icon: Heart fill animation
- Theme toggle: Rotate moon/sun icon, 300ms

## Images

**Hero Section**: Full-width banner (h-96) with blurred book cover collage background, centered heading "Discover Your Next Great Read", search bar overlay with backdrop-blur background

**Book Covers**: Use placeholder images (via Unsplash or similar) showing book spines/covers with varied colors. Aspect ratio 2:3, object-cover fit

**Empty States**: Illustration-style graphics for "No books found", "No bookmarks yet", "Start uploading books" (use SVG illustrations or icon combinations)

**User Avatars**: Circular (rounded-full), default to initials in colored backgrounds if no image

## Accessibility

- Keyboard navigation for all interactive elements
- Focus rings visible and distinct (ring-2 ring-blue-500)
- ARIA labels for icon-only buttons
- Color contrast ratios meet WCAG AA standards in both themes
- Form labels always visible, error messages clearly associated
- Screen reader announcements for dynamic content updates