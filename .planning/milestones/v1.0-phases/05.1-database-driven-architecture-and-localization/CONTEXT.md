# Phase 5.1: Context - Database-Driven Architecture & Localization System

## Current State Assessment

### ✅ What Already Exists

- Firebase Firestore integration (auth, basic data storage)
- Custom testbook editor (TestbookEditor.tsx, useTestbookContent hook)
- Language context system (LangContext.tsx)
- Locale files for EN, PT, ES, CN
- Streetlight.tsx as design reference
- useTestbook.ts for basic testbook operations

### ❌ What Needs to Be Built

- Database collections for modules, translations, design tokens
- Hooks for managing all database-driven content
- Admin interfaces for module/testbook/translation management
- Dynamic module renderer (replaces hardcoded module components)
- Standardized responsive design across all pages
- Complete PDF generation with localization

---

## Critical Files & Locations

### Source Code Structure

```
src/
├── types.ts                          ← Update with new interfaces
├── App.tsx                           ← Update routing
├── contexts/
│   ├── LangContext.tsx              ← Update to use database
│   └── AuthContext.tsx              ← (Use for admin checks)
├── hooks/
│   ├── useTestbook.ts               ← Update
│   ├── useTestbookContent.ts        ← Keep as-is (works with DB)
│   ├── useTestbookPDF.ts            ← Replace with v2
│   ├── useTitle.ts
│   └── [NEW] useModules.ts
│   └── [NEW] useTranslations.ts
│   └── [NEW] useDesignTokens.ts
├── pages/
│   ├── Testbooks.tsx                ← Remove hardcoded testbooks
│   ├── TestbookEditor.tsx           ← Update to use DB
│   ├── Streetlight.tsx              ← Move to database
│   ├── Pantheon.tsx                 ← Move to database
│   ├── Zeus.tsx                     ← Move to database
│   ├── [NEW] ModuleEditor.tsx
│   ├── [NEW] ModuleManagement.tsx
│   ├── [NEW] AdminDashboard.tsx
│   └── [NEW] TranslationManagement.tsx
├── components/
│   ├── Testbook/
│   │   ├── TestbookCreateModal.tsx
│   │   ├── AdminValidationModal.tsx
│   │   └── [NEW] ModuleRenderer.tsx
│   └── [NEW] ModuleRenderer.tsx
└── locales/                         ← DELETE (migrate to DB)
    ├── en.json
    ├── pt.json
    ├── es.json
    └── cn.json
```

### Firestore Collections to Create

```
modules/                    ← New module registry
├── {moduleId}
│   ├── id: string
│   ├── name: string
│   ├── slug: string
│   ├── version: string
│   ├── icon: string
│   ├── color: string
│   ├── sections: array
│   ├── isActive: boolean
│   ├── metadata: object
│   └── versions/          ← Subcollection (version history)

translations/               ← New translations
├── {language}             ← "en", "pt", "es", "cn"
│   ├── modules: object    ← Module-specific strings
│   ├── common: object     ← Global strings
│   ├── ui: object         ← UI strings
│   └── ...

design_tokens/             ← New design system
├── typography/
├── spacing/
├── colors/
├── shadows/
└── ...

testbooks/                  ← Existing, now includes system testbooks
├── {testbookId}
│   ├── modules/           ← Subcollection (module content)
│   │   ├── {moduleId}
│   │   │   ├── title: string
│   │   │   ├── content: string
│   │   │   └── metadata: object
│   │   └── ...
│   └── metadata: object
```

---

## Key Architectural Decisions

### 1. Module Structure

- Modules are **first-class database entities**
- Each module has a **unique ID and slug**
- Modules contain **versioning capability** for rollback
- Modules use **dynamic sections array** for flexibility
- All module metadata (icon, color, description) is in database

### 2. Localization Architecture

- **Namespace-based organization** (modules, common, ui)
- **Language-specific collections** in database
- **Fallback to English** if translation missing
- **Automatic generation** when module created/updated
- **Admin interface** for translation management

### 3. Testbook Standardization

- **All testbooks in database** (no hardcoding)
- **System testbooks** (ownerId: "system") migrated from code
- **Consistent schema** for all testbooks
- **Module reference** via moduleId array or subcollection content

### 4. Design System

- **Design tokens in database** for runtime updates
- **Streetlight.tsx as canonical reference**
- **Tailwind utilities** for responsive design
- **Component-level consistency** through reusable components

### 5. PDF Generation

- **Dynamic content** from database
- **Localization support** with user's language
- **Proper rendering** of colors, typography, images
- **Export from any module** without code changes

---

## Database Field Specifications

### modules Collection

```typescript
{
  // Identity
  id: string,                 // Unique identifier (slug-like)
  name: string,               // Display name
  slug: string,               // URL-friendly identifier

  // Metadata
  icon: string,               // Icon name or URL
  color: string,              // Tailwind color class (e.g., "blue-500")
  description: string,        // Short description
  version: string,            // Current version (e.g., "1.0.0")

  // Content
  sections: [{                // Dynamic section array
    id: string,               // Section identifier
    title: string,            // Section title
    content: string,          // HTML/markdown content
    subsections?: [{          // Optional nested sections
      id: string,
      title: string,
      content: string
    }]
  }],

  // Status
  isActive: boolean,          // Is module currently available
  isPublic: boolean,          // Public or private

  // Metadata
  metadata: {
    author?: string,
    tags?: string[],
    category?: string
  },

  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp,
  createdBy: string,          // User ID

  // Audit
  changeLog?: [{
    timestamp: Timestamp,
    changedBy: string,
    changes: string
  }]
}
```

### translations Collection

```typescript
// Structure: translations/{language}/{namespace}/{key}
// Example: translations/pt/modules/streetlight_title = "Rua Iluminada"

{
  en: {
    modules: {
      "streetlight_title": "Streetlight",
      "streetlight_description": "...",
      "pantheon_title": "Pantheon",
      // ... all module strings
    },
    common: {
      "save": "Save",
      "delete": "Delete",
      // ... common UI strings
    },
    ui: {
      "loading": "Loading...",
      "error": "An error occurred"
      // ... UI-specific strings
    }
  },
  pt: { ... },
  es: { ... },
  cn: { ... }
}
```

### design_tokens Collection

```typescript
{
  typography: {
    h1: { size: "32px", weight: "700", lineHeight: "40px" },
    h2: { size: "24px", weight: "600", lineHeight: "32px" },
    body: { size: "14px", weight: "400", lineHeight: "20px" }
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px"
  },
  colors: {
    primary: "#2563eb",
    secondary: "#64748b",
    success: "#16a34a",
    warning: "#ea580c",
    error: "#dc2626"
  },
  shadows: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px rgba(0, 0, 0, 0.1)"
  }
}
```

---

## Implementation Priority

### ✅ Start With (Week 1)

1. Database schema design and documentation
2. Firestore collection creation
3. Core hooks (useModules, useTranslations, useDesignTokens)
4. Type definitions
5. Seed scripts

### ✏️ Continue (Week 2)

6. Module management system (admin interface)
7. Testbook migration to database
8. Translation migration to database
9. Dynamic module renderer

### 🎨 Finish (Week 3-4)

10. Design standardization
11. Responsive design audit and fixes
12. PDF generation enhancement
13. Testing and QA

---

## Migration Strategy

### Phase 1: Shadow Parallel (Safe)

1. **Keep existing system running**
2. **Load new data from database** alongside existing
3. **Validate database works**
4. **Gradual cutover per module**

### Phase 2: Cutover (Controlled)

1. **Disable hardcoded modules** one by one
2. **Enable database modules** one by one
3. **Test extensively**
4. **Rollback plan ready**

### Phase 3: Cleanup (Final)

1. **Remove hardcoded definitions**
2. **Delete old locale files**
3. **Archive old code**

---

## Testing Requirements

### Before Deployment

- [ ] All modules load from database
- [ ] All testbooks load from database
- [ ] All translations work in all 4 languages
- [ ] Fallback to English when translation missing
- [ ] All pages responsive (mobile, tablet, desktop)
- [ ] PDF export works for all modules
- [ ] Admin interfaces work correctly
- [ ] Performance acceptable (<2s page load)
- [ ] No console errors
- [ ] Cross-browser tested (Chrome, Firefox, Safari)

### Post-Deployment Checklist

- [ ] 0 production errors
- [ ] User reports positive feedback
- [ ] Analytics show normal user behavior
- [ ] Performance metrics normal
- [ ] Rollback plan tested and ready

---

## Success Metrics

| Metric                    | Target    | Importance |
| ------------------------- | --------- | ---------- |
| Modules from DB           | 100%      | Critical   |
| Testbooks from DB         | 100%      | Critical   |
| Translations from DB      | 100%      | Critical   |
| Responsive breakpoints    | All 3     | High       |
| PDF render success        | 100%      | High       |
| Admin interface usability | 4/5 stars | Medium     |
| Performance degradation   | < 10%     | High       |
| Defect rate               | < 1%      | Critical   |

---

## Known Constraints

1. **Firebase Limits**
   - Read/write limits (scale appropriately)
   - Document size limits (keep sections reasonable)
   - Firestore indexes needed for some queries

2. **Frontend Size**
   - Keep bundle size manageable (monitor with webpack-bundle-analyzer)
   - Lazy-load module components
   - Use code splitting for admin panels

3. **Translation Volume**
   - 4 languages × ~500 keys = 2000 translation records
   - Manageable but needs proper indexing

4. **Time Constraints**
   - 4 weeks estimated (3-5 depending on complexity)
   - Full testing required (1 week)
   - Buffer for unknowns (0.5 weeks)

---

## Team Roles

| Role             | Responsibility                                     |
| ---------------- | -------------------------------------------------- |
| **Architect**    | Schema design, technical decisions, integration    |
| **Backend Dev**  | Database operations, hooks, APIs, seeding          |
| **Frontend Dev** | Components, pages, responsive design, localization |
| **QA**           | Testing strategy, test execution, edge cases       |
| **Admin/DevOps** | Firebase setup, deployment, monitoring             |

---

## Critical Success Factors

1. ✅ **Comprehensive schema design upfront** - Saves rework later
2. ✅ **Thorough data migration testing** - Prevents data loss
3. ✅ **Extensive responsive testing** - Ensures mobile experience
4. ✅ **Clear admin interfaces** - Enables long-term maintenance
5. ✅ **Documentation** - Helps future engineers understand system

---

## Communication Plan

- **Daily standup** - 15 min, discuss blockers
- **Weekly review** - Check progress vs plan
- **Stakeholder updates** - Weekly to leadership
- **Post-deployment review** - Document lessons learned

---

**Phase Ready for Implementation**  
**Confidence Level:** High  
**Risk Level:** Medium (architectural refactor, but well-planned)
