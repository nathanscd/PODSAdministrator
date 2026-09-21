# Phase 5.1: Quick Reference & Execution Guide

**Phase:** 5.1 - Database-Driven Architecture & Localization System  
**Status:** Planning Complete ✅ Ready to Execute  
**Created:** June 1, 2026

---

## What's in This Phase?

Transform the application from hardcoded modules/testbooks/translations to a **fully database-driven, scalable system**.

### Before (Current State)

```
Hardcoded modules in component files
❌ Streetlight.tsx, Pantheon.tsx, Zeus.tsx in src/pages/
❌ Translations in src/locales/*.json
❌ Testbooks in Testbooks.tsx constant
❌ Design tokens scattered across CSS
```

### After (Target State)

```
Everything in database
✅ Modules in Firestore collection
✅ Translations in Firestore collection
✅ All testbooks in Firestore
✅ Design tokens in Firestore
✅ Zero hardcoded content
✅ Dynamic module rendering
✅ Automatic translation generation
✅ Localized PDF export
✅ Fully responsive design
```

---

## Planning Documents Created

| Document             | Purpose                                           | Read Time |
| -------------------- | ------------------------------------------------- | --------- |
| **PLAN.md**          | 41 concrete tasks, dependencies, timeline         | 30 min    |
| **RESEARCH.md**      | Current state analysis, risks, opportunities      | 20 min    |
| **SPECIFICATION.md** | Technical details, schemas, APIs                  | 40 min    |
| **CONTEXT.md**       | Implementation guide, file locations, constraints | 25 min    |
| **STATE.md**         | Progress tracking, assumptions, decisions         | 10 min    |

---

## Quick Start: Phase 5.1.1

**Next Step:** Execute Phase 5.1.1 - Database Schema & API Foundation

### Task Checklist

**[5.1.1.1] Design Firestore Collections**

```
- [ ] finalize modules collection (done in SPEC)
- [ ] finalize translations collection (done in SPEC)
- [ ] finalize design_tokens collection (done in SPEC)
- [ ] create testbooks collection (verify structure)
- [ ] document all indexes
```

**[5.1.1.2] Create Type Definitions**

```
- [ ] Add ModuleRecord interface to src/types.ts
- [ ] Add ModuleSection interface
- [ ] Add DesignTokens interface
- [ ] Add SupportedLanguage interface
```

**[5.1.1.3] Create Core Hooks**

```
- [ ] src/hooks/useModules.ts
- [ ] src/hooks/useTranslationManager.ts
- [ ] src/hooks/useDesignTokens.ts
```

**[5.1.1.4] Firestore Security Rules**

```
- [ ] Deploy security rules to modules collection
- [ ] Deploy security rules to translations
- [ ] Deploy security rules to design_tokens
- [ ] Test read/write permissions
```

**[5.1.1.5] Seeding & Initialization**

```
- [ ] Create seed scripts
- [ ] Seed system modules (Streetlight, Pantheon, Zeus)
- [ ] Seed translations (EN, PT, ES, CN)
- [ ] Seed design tokens
- [ ] Verify data in Firebase console
```

---

## Key Files to Review

### Source Files

- `src/pages/Streetlight.tsx` - Module template (analyze structure)
- `src/locales/*.json` - Translation source (extract keys)
- `src/pages/Testbooks.tsx` - Testbook list (identify hardcoded data)
- `src/contexts/LangContext.tsx` - Language system (understand current approach)

### Configuration

- `tailwind.config.js` - Current design tokens (baseline for migration)
- `firebase.json` - Firebase configuration
- `.planning/ROADMAP.md` - Phase dependencies

### New Files to Create

- `src/hooks/useModules.ts`
- `src/hooks/useTranslationManager.ts`
- `src/hooks/useDesignTokens.ts`
- `.scripts/seed-modules.ts`
- `.scripts/seed-translations.ts`

---

## Firestore Collections Overview

```
Firestore Structure
│
├── modules/
│   ├── streetlight (module record + sections)
│   ├── pantheon
│   ├── zeus
│   └── {versions}/ (subcollection)
│
├── translations/
│   ├── en (all English translations)
│   ├── pt (all Portuguese translations)
│   ├── es (all Spanish translations)
│   └── cn (all Chinese translations)
│
├── design_tokens/
│   └── current (single document with all tokens)
│
└── testbooks/ (existing, no schema changes)
    ├── pantheon-ng
    ├── streetlight
    ├── zeus
    └── {custom testbooks}
```

---

## Database Schema Quick Reference

### modules/{id}

```typescript
{
  id: "streetlight",
  name: "Streetlight",
  slug: "streetlight",
  icon: "Lightbulb",
  color: "blue-500",
  description: "Street Light Management System",
  version: "1.0.0",
  sections: [...],  // Array of sections
  isActive: true,
  isPublic: true,
  isSystem: true,
  ownerId: "system",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### translations/{language}

```javascript
{
  "modules.streetlight.title": "Streetlight",
  "modules.streetlight.description": "Street Light Management System",
  "common.save": "Save",
  "ui.loading": "Loading...",
  // ... all translations for this language
}
```

### design_tokens/current

```typescript
{
  typography: { h1: {...}, h2: {...}, body: {...} },
  spacing: { xs: "4px", sm: "8px", ... },
  colors: { primary: "#2563eb", ... },
  shadows: { sm: "...", md: "..." },
  breakpoints: { mobile: 375, tablet: 768, ... }
}
```

---

## Hooks API Quick Reference

### useModules

```typescript
const { modules, fetchModules, getModule, createModule } = useModules();

// Fetch all modules
await fetchModules();

// Get specific module
const module = await getModule('streetlight');

// Create new module
await createModule({ name, slug, sections, ... });

// Update module
await updateModule(moduleId, { description, ... });

// Publish/unpublish
await publishModule(moduleId);
```

### useTranslationManager

```typescript
const { getTranslation, updateTranslation, fetchTranslations } = useTranslationManager();

// Get translation (with fallback)
const title = getTranslation('modules.streetlight.title');

// Get all translations for language
const ptTranslations = await fetchTranslations('pt');

// Update translation
await updateTranslation('modules.streetlight.title', 'New Title', 'en');

// Bulk update
await upsertBulkTranslations('pt', { ... });
```

### useDesignTokens

```typescript
const { tokens, getToken, injectCSSVariables } = useDesignTokens();

// Inject CSS variables at app start
useEffect(() => {
  injectCSSVariables();
}, []);

// Get specific token
const primaryColor = getToken("colors", "primary");
const spacing = getToken("spacing", "md");

// Get all tokens
const allTokens = tokens;
```

---

## Component Replacement Plan

### Phase 5.1.2: Module System

**Replace hardcoded with database-driven:**

| Current                                      | New             | Status       |
| -------------------------------------------- | --------------- | ------------ |
| `src/pages/Streetlight.tsx`                  | Database record | To implement |
| `src/pages/Pantheon.tsx`                     | Database record | To implement |
| `src/pages/Zeus.tsx`                         | Database record | To implement |
| Routes: `/streetlight`, `/pantheon`, `/zeus` | Dynamic routing | To implement |

**New Components:**

- `src/components/ModuleRenderer.tsx` - Generic module display
- `src/pages/ModuleEditor.tsx` - Admin module editor
- `src/pages/ModuleManagement.tsx` - Admin module list

---

## Localization Migration Steps

**Current:** `src/locales/*.json` static files  
**Target:** `translations/{language}` in Firestore

### Steps:

1. Parse all locale JSON files
2. Extract keys in namespace format
3. Create Firestore documents per language
4. Test retrieval and fallback
5. Update all components to use hook
6. Delete locale JSON files

---

## Testing Checklist

### Unit Tests

- [ ] useModules hook tests
- [ ] useTranslationManager hook tests
- [ ] useDesignTokens hook tests
- [ ] ModuleRenderer component tests

### Integration Tests

- [ ] Create module → translations auto-generated
- [ ] Edit module → updates everywhere
- [ ] Change language → all text updates
- [ ] Design token update → UI reflects change

### E2E Tests

- [ ] Load Streetlight module
- [ ] Switch languages
- [ ] Export to PDF
- [ ] Admin creates new module
- [ ] Module appears on frontend

### Responsive Tests

- [ ] Mobile (375px)
- [ ] Tablet (768px)
- [ ] Desktop (1920px)
- [ ] No horizontal overflow
- [ ] Touch interactions work

---

## Risk Mitigation

| Risk                  | Impact | Mitigation                            |
| --------------------- | ------ | ------------------------------------- |
| Data migration errors | HIGH   | Test migrations in staging            |
| User disruption       | HIGH   | Phased rollout (one module at a time) |
| Performance issues    | MEDIUM | Caching + query optimization          |
| Translation gaps      | MEDIUM | Fallback system + notifications       |

---

## Timeline Summary

**Total Duration:** 3-4 weeks

```
Week 1: Database Foundation (5.1.1)
  └─ Database schema, hooks, seeding

Week 2: Module & Testbook Migration (5.1.2, 5.1.3)
  └─ Move modules to database
  └─ Move testbooks to database

Week 3: Localization & Design (5.1.4, 5.1.5)
  └─ Move translations to database
  └─ Standardize design & responsive

Week 4: PDF, Testing, & Deployment
  └─ PDF generation enhancement
  └─ Full QA & testing
  └─ Deployment prep
```

---

## Success Criteria (Must All Be True)

✅ All modules stored in database (100%)  
✅ All testbooks stored in database (100%)  
✅ All translations stored in database (100%)  
✅ Zero hardcoded content in frontend  
✅ Dynamic module management works  
✅ New languages can be added without code  
✅ PDF export with localization works  
✅ All pages responsive (mobile, tablet, desktop)  
✅ Design consistent across all modules  
✅ All tests pass  
✅ Zero production issues

---

## Next Actions

### Immediate (Today)

- [ ] Review PLAN.md (30 minutes)
- [ ] Review SPECIFICATION.md (40 minutes)
- [ ] Schedule Phase 5.1.1 kickoff meeting

### This Week

- [ ] Finalize database schema
- [ ] Create Firestore collections
- [ ] Deploy security rules
- [ ] Create TypeScript interfaces
- [ ] Build core hooks

### Next Week

- [ ] Create seeding scripts
- [ ] Seed system modules
- [ ] Build ModuleRenderer component
- [ ] Update routing

---

## Team Assignments

| Role          | Primary                         | Secondary                |
| ------------- | ------------------------------- | ------------------------ |
| **Architect** | Schema design                   | Integration oversight    |
| **Backend**   | Hooks, APIs, seeding            | Database optimization    |
| **Frontend**  | Components, routing, responsive | Localization integration |
| **QA**        | Test planning, execution        | Regression testing       |
| **DevOps**    | Firebase setup, deployment      | Monitoring & alerts      |

---

## Reference Links

- ROADMAP.md - Phase dependencies and timeline
- PLAN.md - Detailed task breakdown
- SPECIFICATION.md - Technical implementation details
- CONTEXT.md - File locations and constraints
- RESEARCH.md - Current state analysis

---

## Key Contacts

- **Architecture Questions:** Review SPECIFICATION.md
- **Task Breakdown:** See PLAN.md
- **Implementation Details:** Review CONTEXT.md
- **Current State Analysis:** See RESEARCH.md

---

**Phase Ready for Execution**  
**Confidence Level:** ⭐⭐⭐⭐⭐ High  
**Complexity:** ⭐⭐⭐⭐ Very High  
**Duration:** 3-4 weeks

**Next Step:** Begin Phase 5.1.1 - Database Schema & API Foundation

---

_Last Updated: June 1, 2026_  
_Created by: GSD Planning System_  
_Status: ✅ Complete & Ready for Execution_
