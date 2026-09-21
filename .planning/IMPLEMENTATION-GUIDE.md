# Design System Implementation Guide

## Overview

This guide explains how to apply the modern corporate design system to components throughout the app using the `designSystem.ts` utility classes.

---

## Quick Start

### Import the Design System

```tsx
import {
  layoutClasses,
  cardClasses,
  buttonClasses,
  formClasses,
  typographyClasses,
  cn,
  getButtonClasses,
  getInputClasses,
} from "@/styles/designSystem";
```

### Basic Usage Patterns

#### 1. Page Container

```tsx
export default function MyPage() {
  return (
    <div className={layoutClasses.pageContainer}>
      <div className={layoutClasses.pagePadding}>
        <div className={layoutClasses.pageContent}>{/* Page content */}</div>
      </div>
    </div>
  );
}
```

#### 2. Cards

```tsx
// Basic card
<div className={cardClasses.base}>
  <div className={cardClasses.header}>
    <h3 className={typographyClasses.h3}>Card Title</h3>
  </div>
  {/* Card content */}
</div>

// Elevated interactive card
<div className={cn(cardClasses.base, cardClasses.elevated, cardClasses.interactive)}>
  {/* Card content */}
</div>
```

#### 3. Buttons

```tsx
// Using the helper function
<button className={getButtonClasses("primary", "lg")}>
  Click Me
</button>

// Or combining classes
<button className={cn(buttonClasses.base, buttonClasses.secondary)}>
  Click Me
</button>
```

#### 4. Forms

```tsx
<div className={formClasses.group}>
  <label className={formClasses.label}>Email</label>
  <input
    type="email"
    className={getInputClasses("primary")}
    placeholder="your@email.com"
  />
  {error && <span className={typographyClasses.error}>{error}</span>}
</div>
```

#### 5. Tables

```tsx
<div className={tableClasses.container}>
  <table className={tableClasses.table}>
    <thead className={tableClasses.thead}>
      <tr>
        <th className={tableClasses.th}>Column 1</th>
        <th className={tableClasses.th}>Column 2</th>
      </tr>
    </thead>
    <tbody className={tableClasses.tbody}>
      <tr className={tableClasses.tr}>
        <td className={tableClasses.td}>Data 1</td>
        <td className={tableClasses.td}>Data 2</td>
      </tr>
    </tbody>
  </table>
</div>
```

#### 6. Badges

```tsx
import { getBadgeClasses } from "@/styles/designSystem";

<div>
  <span className={getBadgeClasses("success")}>Active</span>
  <span className={getBadgeClasses("danger")}>Error</span>
  <span className={getBadgeClasses("warning")}>Pending</span>
</div>;
```

#### 7. Modals

```tsx
<div className={modalClasses.modal}>
  <div className={modalClasses.overlay} onClick={onClose} />
  <div className={modalClasses.content}>
    <div className={modalClasses.header}>
      <h2 className={typographyClasses.h2}>Modal Title</h2>
      <button onClick={onClose} className={buttonClasses.ghost}>
        ×
      </button>
    </div>
    <div className={modalClasses.body}>{/* Modal content */}</div>
    <div className={modalClasses.footer}>
      <button className={getButtonClasses("secondary")}>Cancel</button>
      <button className={getButtonClasses("primary")}>Confirm</button>
    </div>
  </div>
</div>
```

#### 8. Empty States

```tsx
<div className={emptyStateClasses.container}>
  <SearchIcon className={emptyStateClasses.icon} />
  <h3 className={emptyStateClasses.title}>No Results</h3>
  <p className={emptyStateClasses.description}>
    Try adjusting your search criteria
  </p>
</div>
```

---

## Common Patterns

### Header with Title and Action Button

```tsx
<div className={cn(layoutClasses.flexBetween, cardClasses.header)}>
  <h1 className={typographyClasses.h1}>Dashboard</h1>
  <button className={getButtonClasses("primary")}>Add New</button>
</div>
```

### Card Grid with Responsive Columns

```tsx
<div className={responsiveClasses.gridResponsive}>
  {items.map((item) => (
    <div
      key={item.id}
      className={cn(cardClasses.base, cardClasses.interactive)}
    >
      {/* Card content */}
    </div>
  ))}
</div>
```

### Loading Skeleton

```tsx
<div className={cardClasses.base}>
  <div
    className={cn(loadingClasses.skeleton, loadingClasses.skeletonText, "mb-4")}
  />
  <div
    className={cn(
      loadingClasses.skeleton,
      loadingClasses.skeletonText,
      "w-3/4",
    )}
  />
</div>
```

### Status Badge with Icon

```tsx
<div className={cn(layoutClasses.flexCenter, "gap-2")}>
  <StatusIcon size={16} />
  <span className={getBadgeClasses("success")}>Active</span>
</div>
```

### Two-Column Form Layout

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div className={formClasses.group}>
    <label className={formClasses.label}>First Name</label>
    <input className={getInputClasses()} />
  </div>
  <div className={formClasses.group}>
    <label className={formClasses.label}>Last Name</label>
    <input className={getInputClasses()} />
  </div>
</div>
```

---

## Color System Integration

All utilities automatically use CSS custom variables for theming:

- `var(--accent-color)` - Primary accent (orange, pink, purple, etc.)
- `var(--text-primary)` - Main text color
- `var(--text-secondary)` - Secondary text color
- `var(--card-bg)` - Card background with transparency
- `var(--border-color)` - Border and divider color
- `var(--bg-app)` - App background
- `var(--shadow-color)` - Shadow tint

These automatically adapt when switching between light/dark themes and accent color variants.

---

## Composing Custom Classes

For cases not covered by the design system, use the `cn()` helper to safely combine classes:

```tsx
const customCardClasses = cn(
  cardClasses.base,
  cardClasses.elevated,
  "my-8", // Tailwind classes
  condition && "opacity-50", // Conditional classes
  dynamicClass, // Dynamic values
);

<div className={customCardClasses}>{/* content */}</div>;
```

---

## Animation & Transitions

For smooth animations, use the provided animation classes:

```tsx
<div
  className={cn(
    cardClasses.base,
    animationClasses.smooth,
    "hover:scale-105", // Custom hover effect
  )}
>
  {/* Animated content */}
</div>
```

Add custom animations in `index.css` if needed:

```css
@keyframes myAnimation {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-myAnimation {
  animation: myAnimation 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

## Responsive Design

Use responsive utilities for mobile-first design:

```tsx
<div className={responsiveClasses.gridResponsive}>
  {/* Automatically adapts: 1 col on mobile, 2 on tablet, 3 on desktop, 4 on xl */}
</div>

<h1 className={cn(
  typographyClasses.h1,
  "text-xl sm:text-2xl md:text-3xl lg:text-4xl" // Custom responsive sizes
)}>
  Responsive Heading
</h1>
```

---

## Dark Mode Support

All utilities automatically support dark mode through CSS custom variables set in `index.css`:

- The system detects `[data-theme="dark-*"]` attributes
- All colors, shadows, and backgrounds adapt automatically
- No additional CSS needed for dark mode support

---

## Migration Strategy

When updating existing components:

1. **Identify** the component structure (card, form, table, etc.)
2. **Find** the matching class utility in `designSystem.ts`
3. **Replace** inline Tailwind classes with utility classes
4. **Test** in both light and dark themes
5. **Verify** responsive design on mobile/tablet/desktop

### Before

```tsx
<div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-6 shadow-md">
  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Title</h3>
</div>
```

### After

```tsx
import { cardClasses, typographyClasses } from "@/styles/designSystem";

<div className={cardClasses.base}>
  <h3 className={typographyClasses.h3}>Title</h3>
</div>;
```

---

## Performance Notes

- All design system classes use Tailwind's built-in optimizations
- CSS custom variables enable instant theme switching without re-renders
- Use `cn()` helper instead of string concatenation for better tree-shaking
- Import only the utilities you need to reduce bundle size

---

## Questions & Troubleshooting

### Classes not applying?

- Ensure `designSystem.ts` is imported correctly
- Check that Tailwind CSS is properly configured
- Verify CSS custom variables are defined in `index.css`

### Dark mode not working?

- Check `[data-theme]` attribute is set on root or parent element
- Verify `index.css` has dark mode variable definitions
- Reload the page to ensure CSS custom variables are updated

### Need a custom variant?

- Use the `cn()` helper to combine utilities with custom Tailwind classes
- Extend `designSystem.ts` with new patterns following existing conventions
- Keep theme-specific logic in CSS custom variables, not in class names

---

## Next Steps

Apply this design system to priority pages in order:

1. **Navigation** - Sidebar (✅ Done), Breadcrumbs
2. **Layouts** - Page containers, sections, spacing
3. **Forms** - Inputs, labels, validation states
4. **Data** - Tables, lists, grids
5. **Feedback** - Modals, toasts, empty states
6. **Polish** - Micro-interactions, loading states, animations
