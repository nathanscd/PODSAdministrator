# UI-SPEC: Modern Corporate Redesign

**Phase Goal:** Transform app into a cohesive, award-winning corporate UI while preserving existing light/dark theme system and accent colors.

---

## Design Philosophy

- **Modern Corporate:** Clean lines, professional hierarchy, sophisticated micro-interactions
- **Consistent:** Every component follows unified design language across all pages
- **Accessible:** WCAG 2.1 AA compliant, high contrast, clear focus states
- **Performant:** Smooth animations (300-400ms), GPU-accelerated transitions
- **Responsive:** Seamless mobile → tablet → desktop experience

---

## Color System (Preserved)

### Root Theme

- **Light Mode:** `#ffffff` background, `#213547` text
- **Dark Mode:** `#121212` background, `#e0e0e0` text

### Accent Variants

| Theme    | Light Accent | Dark Accent | Background Gradient      |
| -------- | ------------ | ----------- | ------------------------ |
| Orange   | `#ff6a00`    | `#ff8c38`   | `rgba(252, 234, 211, 1)` |
| Rosa     | `#ff0080`    | `#ff3399`   | `rgba(255, 214, 231, 1)` |
| Roxo     | `#8a2be2`    | `#b066ff`   | `rgba(230, 214, 255, 1)` |
| Vermelho | `#dc2626`    | `#ff5c5c`   | `rgba(255, 214, 214, 1)` |
| Azul     | `#2651dc`    | `#5b7ce9`   | `rgb(214, 231, 255)`     |

### Extended Palette (New)

- **Neutrals:** `#6b7280` (subtle), `#d1d5db` (light border)
- **States:** Success `#10b981`, Warning `#f59e0b`, Danger `#ef4444`, Info `#3b82f6`

---

## Typography

### Font Stack

- **Family:** `'Inter', system-ui, sans-serif` (already set)
- **Rendering:** `text-rendering: optimizeLegibility`

### Scale (Tailwind-based)

| Level       | Size          | Weight | Line Height | Usage                       |
| ----------- | ------------- | ------ | ----------- | --------------------------- |
| **Display** | `2xl` / 36px  | 700    | 1.3         | Page titles, hero sections  |
| **H1**      | `xl` / 30px   | 600    | 1.4         | Section headers, modals     |
| **H2**      | `lg` / 24px   | 600    | 1.4         | Subsection headers          |
| **H3**      | `base` / 16px | 600    | 1.5         | Small headers, card titles  |
| **Body**    | `base` / 16px | 400    | 1.6         | Main content, descriptions  |
| **Label**   | `sm` / 14px   | 500    | 1.5         | Form labels, small text     |
| **Caption** | `xs` / 12px   | 500    | 1.4         | Hints, metadata, timestamps |

---

## Spacing System

### Base Unit: 4px

| Scale   | Value | Usage                        |
| ------- | ----- | ---------------------------- |
| **xs**  | 4px   | Micro spacing                |
| **sm**  | 8px   | Icon margins, tight spacing  |
| **md**  | 12px  | Component padding            |
| **lg**  | 16px  | Section margins              |
| **xl**  | 24px  | Large sections, cards        |
| **2xl** | 32px  | Page margins, major sections |
| **3xl** | 48px  | Large gaps                   |

---

## Component Guidelines

### Buttons

- **Style:** Glassmorphic (backdrop blur, border, shadow)
- **Padding:** `12px 20px` (compact), `16px 24px` (standard)
- **Border:** `1px solid var(--border-color)`
- **Border Radius:** `12px`
- **States:**
  - Default: `bg-[var(--card-bg)]` with subtle shadow
  - Hover: Border accent color, `translateY(-2px)`, enhanced shadow
  - Active: `translateY(0)`, immediate response
  - Disabled: `opacity-50`, no cursor
- **Animations:** `all 0.3s cubic-bezier(0.16, 1, 0.3, 1)`

### Cards & Containers

- **Base:** `backdrop-filter: blur(8px)`, `border-radius: 16px`
- **Border:** `1px solid var(--border-color)`
- **Padding:** `24px` (desktop), `16px` (mobile)
- **Shadow:** `0 4px 6px -1px var(--shadow-color)`
- **Hover:** Optional subtle lift `translateY(-2px)` on interactive cards

### Inputs & Forms

- **Height:** `44px` (mobile-friendly)
- **Padding:** `12px 16px`
- **Border:** `1px solid var(--border-color)`
- **Border Radius:** `10px`
- **Focus:** Border color → `var(--accent-color)`, `outline: none`, `box-shadow: 0 0 0 3px var(--accent-color)/10%`
- **Label:** `12px` weight 500, `8px` gap above input
- **Error State:** `border-color: #ef4444`, hint text `#ef4444`

### Sidebar (Navigation)

- **Width Collapsed:** `90px`
- **Width Expanded:** `280px`
- **Hover Transition:** `400ms cubic-bezier(0.16, 1, 0.3, 1)`
- **Item Height:** `44px`
- **Border Radius:** `12px`
- **Active State:** `bg-[var(--card-bg)]` + `1px border var(--border-color)` + accent icon
- **Icon Size:** `22px` (navigation items)
- **Text Opacity:** Hidden when collapsed, fade in on hover

### Modals & Dialogs

- **Overlay:** `bg-black/40` with `backdrop-blur-sm`
- **Container:** `rounded-2xl`, `bg-[var(--card-bg)]`, `border: 1px var(--border-color)`
- **Padding:** `32px` (desktop), `24px` (mobile)
- **Shadow:** `0 25px 50px -12px rgba(0, 0, 0, 0.25)`
- **Close Button:** Icon-only, transparent background, hover state

### Tables & Data Grids

- **Header:** Background `var(--card-bg)`, weight 600, `12px` padding
- **Rows:** Alternating subtle background stripes (optional)
- **Cell Padding:** `12px`
- **Border:** `1px solid var(--border-color)`
- **Hover Row:** `bg-[var(--accent-color)]/5%` (very subtle)
- **Responsive:** Stack on mobile, horizontal scroll on tablet

### Charts & Visualizations

- **Accent Color:** Use `var(--accent-color)` as primary series
- **Secondary Series:** `var(--text-secondary)`
- **Grid Lines:** `var(--border-color)`
- **Text:** `var(--text-primary)` for labels, `var(--text-secondary)` for axis
- **Legend:** Compact, right-aligned, sans-serif 12px

---

## Layout Principles

### Page Layout

```
┌─────────────────────────────────────────┐
│ SIDEBAR (90-280px)  MAIN CONTENT        │
│                   ┌───────────────────┐ │
│                   │ Header/Title      │ │
│                   ├───────────────────┤ │
│                   │                   │ │
│                   │  Content (px 32)  │ │
│                   │                   │ │
│                   └───────────────────┘ │
└─────────────────────────────────────────┘
```

### Content Margins

- **Desktop:** `32px` horizontal, `32px` top, `16px` bottom
- **Tablet:** `24px` horizontal
- **Mobile:** `16px` horizontal

### Max Width

- **Main Content:** `1440px` (optional constraint)
- **Form/Modal:** `600px`
- **Sidebar:** As defined

---

## Interaction & Micro-Interactions

### Transitions

- **Standard:** `300-400ms`
- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` (spring-like, professional)
- **Properties:** `all` (except batch transforms when needed)

### Hover Effects

- **Buttons:** `translateY(-2px)` + shadow lift
- **Links:** Color shift to accent, optional underline animation
- **Cards:** `translateY(-2px)` + shadow increase (on interactive cards only)
- **Icons:** Color shift to accent, optional scale 1.1

### Focus States

- **Keyboard Nav:** `outline: 2px solid var(--accent-color)`
- **Inputs:** Accent border + halo shadow
- **Buttons:** Accent border + visible focus ring

### Loading States

- **Spinner:** Circular SVG, `var(--accent-color)`, 24px
- **Skeleton:** `bg-[var(--text-primary)]/10%`, `animate-pulse`, rounded corners matching target

---

## Accessibility

### Contrast

- Text on background: Minimum **WCAG AA 4.5:1**
- Large text (18px+): Minimum **3:1**
- Interactive elements: Minimum **3:1**

### Touch Targets

- Minimum **44px × 44px** for all clickable elements

### Keyboard Navigation

- Tab order logical and predictable
- `:focus-visible` always present on interactive elements
- No keyboard traps

### Screen Readers

- Semantic HTML (button, link, form, nav)
- ARIA labels where needed
- Status updates via `aria-live` for toasts/notifications

---

## Component Inventory

### Core Components (Priority 1)

- [ ] Button (Primary, Secondary, Ghost, Danger variants)
- [ ] Card (Standard, elevated, interactive)
- [ ] Input (Text, email, password, number)
- [ ] Textarea
- [ ] Select / Dropdown
- [ ] Checkbox & Radio
- [ ] Toggle Switch
- [ ] Pill / Badge

### Navigation (Priority 2)

- [ ] Sidebar (refined)
- [ ] Breadcrumbs
- [ ] Tabs
- [ ] Pagination

### Feedback (Priority 3)

- [ ] Toast / Notification
- [ ] Alert
- [ ] Modal / Dialog
- [ ] Skeleton Loader

### Data Display (Priority 4)

- [ ] Table (with sorting, pagination)
- [ ] Data Grid (with filtering)
- [ ] List (with grouping)

### Forms (Priority 5)

- [ ] Form Container
- [ ] Form Field (label + input + error)
- [ ] Form Validation
- [ ] Checkbox Group
- [ ] Radio Group
- [ ] Multi-select

### Charts (Priority 6)

- [ ] Line Chart
- [ ] Bar Chart
- [ ] Pie / Donut Chart
- [ ] Area Chart
- [ ] Legend

---

## Implementation Phases

### Phase 1: Foundation (Week 1)

- [ ] Update global CSS with extended palette
- [ ] Create base component utilities
- [ ] Refine Tailwind configuration
- [ ] Establish component story book (if applicable)

### Phase 2: Core Components (Week 2-3)

- [ ] Redesign Button variants
- [ ] Update Card styling
- [ ] Refactor Input components
- [ ] Create Form wrapper

### Phase 3: Navigation (Week 3-4)

- [ ] Enhance Sidebar with refined interactions
- [ ] Add breadcrumbs to page headers
- [ ] Implement tabs for multi-section pages

### Phase 4: Pages (Week 4-6)

- [ ] Dashboard redesign
- [ ] Pages/CMS interface
- [ ] Forms and modals
- [ ] Reports and charts

### Phase 5: Polish (Week 6-7)

- [ ] Micro-interaction refinement
- [ ] Dark/light theme verification
- [ ] Responsive design auditing
- [ ] Accessibility compliance check

---

## Design Tokens (CSS Variables)

### Already Defined

```css
--color-accent
--color-accent-hover
--color-text-primary
--color-text-secondary
--color-bg-app
--color-card-bg
--color-border-color
--spacing-sidebar-collapsed
--spacing-sidebar-expanded
```

### To Add

```css
/* Status Colors */
--color-success: #10b981;
--color-warning: #f59e0b;
--color-danger: #ef4444;
--color-info: #3b82f6;

/* Semantic */
--shadow-sm: 0 1px 2px 0 var(--shadow-color);
--shadow-md: 0 4px 6px -1px var(--shadow-color);
--shadow-lg: 0 10px 15px -3px var(--shadow-color);

/* Radius */
--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-2xl: 20px;
```

---

## Success Criteria

- ✅ All pages use consistent component library
- ✅ Light/dark theme switch works smoothly across all accents
- ✅ Mobile responsive (tested at 320px, 768px, 1440px)
- ✅ Animations smooth and purposeful (no janky transitions)
- ✅ WCAG 2.1 AA compliant
- ✅ New design feels premium, corporate, modern
- ✅ No regression in functionality

---

## Notes

- Preserve existing `index.css` variables and theme switching logic
- Tailwind class names should remain consistent with current setup
- Test all changes in both light and dark modes
- Verify mobile experience is not compromised
- Prioritize visual consistency over feature parity
