# CSS Structure Documentation

## Overview
The CSS has been refactored from a monolithic `index.css` into a modular, well-organized structure for better maintainability and scalability.

## Directory Structure
```
src/styles/
├── index.css                 # Main import file
├── globals.css              # Root variables and global resets
├── shared.css               # Common styles used across pages
├── forms.css                # Form-specific styles
├── components/
│   ├── Navbar.css          # Navbar component styles
│   └── EventCard.css       # Event card component styles
└── pages/
    ├── Login.css           # Login page styles
    ├── Register.css        # Register page styles
    ├── EventsList.css      # Events list page styles
    ├── EventDetail.css     # Event detail page styles
    ├── CreateEvent.css     # Create event page styles
    ├── MyTickets.css       # My tickets page styles
    ├── EventReport.css     # Event report page styles
    └── OrganizerDashboard.css  # Organizer dashboard styles
```

## File Descriptions

### Core Files
- **globals.css**: CSS variables (--ink, --paper, --amber, etc.), reset styles, and base element styling
- **shared.css**: Common styles like buttons (.pill-btn), layout containers, alerts, tables, stats, and empty states
- **forms.css**: All form-related styles (.form-card, .form-group, input styling)
- **index.css**: Central import file that combines all CSS files

### Component Styles
- **components/Navbar.css**: Navigation bar, brand, links, and role badges
- **components/EventCard.css**: Event cards with ticket stub design, pricing, and seat information

### Page-Specific Styles
Each page has its own CSS file containing only the styles unique to that page:
- **Login.css**: Login form layout and styling
- **Register.css**: Registration form and role selection
- **EventsList.css**: Events grid and filtering UI
- **EventDetail.css**: Event details, booking box, and quantity controls
- **CreateEvent.css**: Event creation form and sections
- **MyTickets.css**: Ticket grid and ticket item display
- **EventReport.css**: Report layout, filters, stats, and tables
- **OrganizerDashboard.css**: Dashboard tabs, event cards, and analytics

## Usage

### For Components
Import the specific component CSS in your component files:
```javascript
// In components/Navbar.jsx
import '../styles/components/Navbar.css';
```

### For Pages
Import the specific page CSS in your page files:
```javascript
// In pages/EventsList.jsx
import '../styles/pages/EventsList.css';
```

### For Global Styles
All global and shared styles are automatically imported through `src/styles/index.css`, which is imported in `index.js`.

## Benefits
- **Modularity**: Each page/component has isolated styles
- **Maintainability**: Easier to find and update specific styles
- **Performance**: Can lazy-load styles if needed in the future
- **Organization**: Clear separation of concerns
- **Scalability**: Easy to add new pages or components with their own CSS files

## Adding New Pages
1. Create a new CSS file in `src/styles/pages/YourPage.css`
2. Add your page-specific styles
3. Import it in `src/styles/index.css`
4. Import it in your page component file

## Variables Available
All CSS files can use the following variables from globals.css:
- Colors: --ink, --ink-soft, --paper, --paper-dim, --amber, --amber-deep, --teal, --red-cancel, --line
- Fonts: --font-display, --font-body, --font-mono
