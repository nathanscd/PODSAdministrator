# Phase 5.1: Technical Specification

**Version:** 1.0  
**Date:** June 1, 2026  
**Status:** Final (Ready for Implementation)

---

## Overview

This specification defines the technical implementation details for Phase 5.1: Database-Driven Architecture & Localization System. It covers database schemas, API designs, component architectures, and integration points.

---

## Part 1: Database Schema Specification

### 1.1 modules Collection

**Purpose:** Central registry of all modules (both system and user-created)

**Collection Path:** `modules`  
**Document ID:** Module slug (e.g., "streetlight", "pantheon", "zeus")

**Schema:**

```typescript
interface ModuleRecord {
  // Identity
  id: string; // Unique module ID (slug format)
  name: string; // Display name (e.g., "Streetlight")
  slug: string; // URL-friendly (e.g., "streetlight")

  // Display Metadata
  icon: string; // Icon identifier or URL
  color: string; // Tailwind color (e.g., "blue-500")
  description: string; // 1-2 sentence description

  // Content Structure
  sections: ModuleSection[]; // Dynamic section array
  subsections?: ModuleSection[]; // Optional nested sections

  // Versioning
  version: string; // Semantic version (e.g., "1.0.0")
  previousVersions?: string[]; // Array of prior version IDs

  // Status & Access
  isActive: boolean; // Currently available for use
  isPublic: boolean; // Visible to public/users
  isSystem: boolean; // System module (like Streetlight)
  isArchived: boolean; // Archived/hidden modules

  // Content Properties
  type: "reference" | "procedure" | "guide";
  category?: string; // Custom categorization
  tags?: string[]; // Search tags

  // Ownership
  ownerId: string; // User ID ("system" for system modules)
  ownerName?: string; // Display name of owner

  // Audit Trail
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // User ID
  updatedBy: string; // User ID
  lastModifiedOn: Timestamp;

  // Metadata
  metadata: {
    author?: string;
    reviewedBy?: string;
    reviewDate?: Timestamp;
    approvedOn?: Timestamp;
  };

  // Custom fields
  [key: string]: any;
}

interface ModuleSection {
  id: string; // Unique section ID
  title: string; // Section title
  description?: string; // Optional description
  content: string; // HTML/Markdown content
  order: number; // Display order
  isVisible: boolean; // Toggle visibility
  icon?: string; // Optional section icon
  subsections?: ModuleSection[]; // Nested sections
  metadata?: {
    estimatedReadTime?: number;
    difficulty?: "beginner" | "intermediate" | "advanced";
  };
}
```

**Indexes Needed:**

- `isActive, isPublic` (for filtering active public modules)
- `isSystem` (for identifying system modules)
- `ownerId` (for user's own modules)
- `tags` (array field, for filtering by tag)

**Security Rules:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /modules/{document=**} {
    allow read: if resource.data.isPublic == true
                || request.auth.uid == resource.data.ownerId
                || request.auth.token.custom_admin == true;
    allow create, update, delete: if request.auth.token.custom_admin == true;
  }
}
```

---

### 1.2 module_versions Subcollection

**Purpose:** Track version history for rollback and audit

**Collection Path:** `modules/{moduleId}/versions`  
**Document ID:** Version timestamp or version number

**Schema:**

```typescript
interface ModuleVersion {
  versionNumber: string; // Semantic version
  releasedAt: Timestamp;
  releasedBy: string; // User ID

  // Snapshot of module at this version
  snapshot: ModuleRecord;

  // Change notes
  changelog: string; // What changed in this version
  releaseNotes?: string; // User-facing release notes

  // Metadata
  status: "draft" | "released" | "archived";
}
```

---

### 1.3 translations Collection

**Purpose:** All translations for the application

**Collection Path:** `translations/{language}/{namespace}`  
**Document ID:** Translation key

**Schema:**

```typescript
// Structure: translations/{language}
// Example: translations/pt/{documents for each namespace}

interface TranslationDocument {
  // General structure:
  // Key: Value pairs

  // Example content for translations/en
  [key: string]: string;
}

// Usage example:
// translations/en/modules/streetlight_title = "Streetlight"
// translations/en/modules/streetlight_description = "Street Light Management System"
// translations/en/common/save = "Save"
// translations/en/common/delete = "Delete"
// translations/pt/modules/streetlight_title = "Rua Iluminada"
```

**Supported Languages:**

- `en` - English (default)
- `pt` - Portuguese (Brazilian)
- `es` - Spanish
- `cn` - Chinese (Simplified)

**Namespaces:**

- `modules` - Module-specific strings
- `common` - Global UI strings
- `ui` - UI element labels
- `errors` - Error messages
- `notifications` - Notification messages

**Structure Alternative (Recommended):**

```javascript
// Path: translations/{language}
// Document structure: Map of all keys for that language
{
  "modules.streetlight.title": "Streetlight",
  "modules.streetlight.description": "...",
  "modules.pantheon.title": "Pantheon",
  "common.save": "Save",
  "common.delete": "Delete",
  "ui.loading": "Loading...",
  // ... all translations for this language in one document
}
```

**Security Rules:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /translations/{document=**} {
    allow read: if true; // Public, anyone can read
    allow create, update, delete: if request.auth.token.custom_admin == true;
  }
}
```

**Fallback Strategy:**

- If translation missing in user's language → use English
- If English also missing → use translation key as display text
- Log missing translations for admin review

---

### 1.4 design_tokens Collection

**Purpose:** Centralized design system tokens

**Collection Path:** `design_tokens`  
**Document ID:** "current" (single document)

**Schema:**

```typescript
interface DesignTokens {
  typography: {
    heading: {
      h1: TypographyToken;
      h2: TypographyToken;
      h3: TypographyToken;
    };
    body: {
      large: TypographyToken;
      base: TypographyToken;
      small: TypographyToken;
    };
    mono: TypographyToken;
  };

  spacing: {
    xs: string; // "4px"
    sm: string; // "8px"
    md: string; // "16px"
    lg: string; // "24px"
    xl: string; // "32px"
    "2xl": string; // "48px"
  };

  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    gray: {
      50: string;
      100: string;
      // ... 900
    };
  };

  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };

  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };

  breakpoints: {
    mobile: number; // 375px
    tablet: number; // 768px
    desktop: number; // 1024px
    wide: number; // 1280px
    ultrawide: number; // 1920px
  };

  zIndex: {
    dropdown: number;
    sticky: number;
    fixed: number;
    modalBackdrop: number;
    modal: number;
    popover: number;
    tooltip: number;
  };
}

interface TypographyToken {
  fontSize: string;
  fontWeight: number;
  lineHeight: string;
  letterSpacing?: string;
}
```

**Security Rules:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /design_tokens/{document=**} {
    allow read: if true;
    allow create, update, delete: if request.auth.token.custom_admin == true;
  }
}
```

---

### 1.5 testbooks Collection

**Purpose:** Existing - store testbook metadata and content

**Note:** This collection already exists. No changes to core structure, but ensure all testbooks (system and custom) are stored here with consistent schema.

**Path:** `testbooks/{testbookId}`

**Ensure fields:**

- `id`, `title`, `description`, `version`
- `modules` array (module IDs included in this testbook)
- `ownerId` ("system" for default testbooks)
- `isCustom` boolean
- `isPublic` boolean
- Timestamps

**Subcollection:** `testbooks/{testbookId}/modules/{moduleId}` (for module-specific content in this testbook)

---

## Part 2: Hook Specifications

### 2.1 useModules Hook

**Purpose:** Module CRUD operations

**File:** `src/hooks/useModules.ts`

**Interface:**

```typescript
interface UseModulesReturn {
  // State
  modules: ModuleRecord[];
  loading: boolean;
  error: string | null;

  // Operations
  fetchModules(): Promise<ModuleRecord[]>;
  getModule(moduleId: string): Promise<ModuleRecord | null>;
  getModuleBySlug(slug: string): Promise<ModuleRecord | null>;
  getActiveModules(): Promise<ModuleRecord[]>;

  // Creation & Updates
  createModule(data: Partial<ModuleRecord>): Promise<string>; // Returns moduleId
  updateModule(moduleId: string, updates: Partial<ModuleRecord>): Promise<void>;
  deleteModule(moduleId: string): Promise<void>;

  // Publishing
  publishModule(moduleId: string): Promise<void>;
  unpublishModule(moduleId: string): Promise<void>;

  // Versioning
  createVersion(moduleId: string, changelog: string): Promise<void>;
  getVersionHistory(moduleId: string): Promise<ModuleVersion[]>;
  revertToVersion(moduleId: string, versionId: string): Promise<void>;

  // Search & Filter
  searchModules(query: string): Promise<ModuleRecord[]>;
  getModulesByTag(tag: string): Promise<ModuleRecord[]>;
  getModulesByOwner(ownerId: string): Promise<ModuleRecord[]>;
}

// Usage:
const { modules, loading, fetchModules, createModule, getModule } =
  useModules();

useEffect(() => {
  fetchModules();
}, []);

// Create new module
const handleCreate = async (name: string, description: string) => {
  const moduleId = await createModule({
    name,
    description,
    slug: name.toLowerCase().replace(/\s+/g, "-"),
    sections: [],
    isActive: false,
    isPublic: false,
  });
};

// Get specific module
const module = await getModule("streetlight");
```

---

### 2.2 useTranslationManager Hook

**Purpose:** Translation management with caching and fallback

**File:** `src/hooks/useTranslationManager.ts`

**Interface:**

```typescript
interface UseTranslationManagerReturn {
  // State
  translations: Record<string, string>;
  loading: boolean;
  error: string | null;
  currentLanguage: string;

  // Retrieval
  getTranslation(key: string, defaultValue?: string): string;
  getTranslations(namespace: string): Record<string, string>;
  getAllTranslations(): Record<string, string>;

  // Management
  fetchTranslations(language: string): Promise<Record<string, string>>;
  updateTranslation(
    key: string,
    value: string,
    language: string,
  ): Promise<void>;
  upsertBulkTranslations(
    language: string,
    translations: Record<string, string>,
  ): Promise<void>;

  // Language Management
  getSupportedLanguages(): string[];
  addLanguage(languageCode: string): Promise<void>;

  // Fallback & Validation
  getMissingTranslations(): string[];
  validateTranslations(): Promise<ValidationResult>;
}

// Usage with LangContext:
const { getTranslation, updateTranslation } = useTranslationManager();
const title = getTranslation("modules.streetlight.title");

// In component:
const { t } = useTranslationManager();
// OR with React Context:
const { language } = useLanguage();
const { getTranslation } = useTranslationManager();
const text = getTranslation(`key.for.${language}`);
```

---

### 2.3 useDesignTokens Hook

**Purpose:** Design token management

**File:** `src/hooks/useDesignTokens.ts`

**Interface:**

```typescript
interface UseDesignTokensReturn {
  // State
  tokens: DesignTokens;
  loading: boolean;
  error: string | null;

  // Retrieval
  getToken(category: string, name: string): string | number | undefined;
  getTokens(category: string): Record<string, any>;
  getAllTokens(): DesignTokens;

  // CSS Variables Injection
  injectCSSVariables(): void;

  // Updates
  updateToken(
    category: string,
    name: string,
    value: string | number,
  ): Promise<void>;
  updateTokens(tokens: Partial<DesignTokens>): Promise<void>;

  // Utilities
  getBreakpoint(
    size: "mobile" | "tablet" | "desktop" | "wide" | "ultrawide",
  ): number;
  getColor(colorName: string): string;
  getSpacing(spacingSize: string): string;
  getTypography(typographyName: string): TypographyToken;
}

// Usage:
const { tokens, getToken, injectCSSVariables } = useDesignTokens();

// Inject CSS variables on app start
useEffect(() => {
  injectCSSVariables();
}, []);

// Use in components
const primaryColor = getToken("colors", "primary");
const heading1 = getToken("typography", "heading.h1");
```

---

## Part 3: Component Specifications

### 3.1 ModuleRenderer Component

**Purpose:** Generic module display component (replaces hardcoded modules)

**File:** `src/components/ModuleRenderer.tsx`

**Props:**

```typescript
interface ModuleRendererProps {
  moduleId: string; // Which module to render
  language?: string; // Language override
  isEditMode?: boolean; // Edit vs view mode
  onSectionClick?: (sectionId: string) => void;
  onExport?: (format: "pdf" | "json") => void;
  className?: string;
}
```

**Behavior:**

- Fetches module from database
- Renders sections dynamically
- Applies design tokens
- Handles responsive layout
- Supports edit mode
- Handles localization

**Example Usage:**

```tsx
<ModuleRenderer
  moduleId="streetlight"
  isEditMode={isAdmin}
  onExport={handleExport}
/>
```

---

### 3.2 ModuleEditor Component

**Purpose:** Create/edit modules

**File:** `src/pages/ModuleEditor.tsx`

**Features:**

- Visual editor for module structure
- Section/subsection management
- Drag-and-drop reordering
- Rich text editing
- Preview pane
- Version control
- Publishing workflow

---

### 3.3 AdminDashboard Component

**Purpose:** Central admin panel

**File:** `src/pages/AdminDashboard.tsx`

**Sections:**

- Module Management
- Testbook Management
- Translation Management
- Design Tokens Editor
- Audit Logs
- System Health

---

## Part 4: Type Definitions

### 4.1 Update to src/types.ts

Add new interfaces to existing types.ts:

```typescript
// Modules
export interface ModuleRecord {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string;
  sections: ModuleSection[];
  version: string;
  isActive: boolean;
  isPublic: boolean;
  isSystem: boolean;
  ownerId: string;
  createdAt: any;
  updatedAt: any;
  createdBy: string;
  updatedBy: string;
}

export interface ModuleSection {
  id: string;
  title: string;
  description?: string;
  content: string;
  order: number;
  isVisible: boolean;
  subsections?: ModuleSection[];
}

export interface ModuleVersion {
  versionNumber: string;
  releasedAt: any;
  releasedBy: string;
  snapshot: ModuleRecord;
  changelog: string;
}

// Translations
export interface TranslationRecord {
  [key: string]: string;
}

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  direction: "ltr" | "rtl";
}

// Design Tokens
export interface DesignTokens {
  typography: Record<string, TypographyToken>;
  spacing: Record<string, string>;
  colors: Record<string, any>;
  shadows: Record<string, string>;
  borderRadius: Record<string, string>;
  breakpoints: Record<string, number>;
  zIndex: Record<string, number>;
}

export interface TypographyToken {
  fontSize: string;
  fontWeight: number;
  lineHeight: string;
  letterSpacing?: string;
}
```

---

## Part 5: API Design

### 5.1 Seeding API

**Script:** `.scripts/seed-modules.ts`

**Operations:**

```typescript
// 1. Clear existing data (in staging only)
await clearModulesCollection();

// 2. Seed system modules
const streetlight = await seedModule("streetlight", streetlightData);
const pantheon = await seedModule("pantheon", pantheonData);
const zeus = await seedModule("zeus", zeusData);

// 3. Seed translations
await seedTranslations("en", enTranslations);
await seedTranslations("pt", ptTranslations);
await seedTranslations("es", esTranslations);
await seedTranslations("cn", cnTranslations);

// 4. Seed design tokens
await seedDesignTokens(designTokenData);

// 5. Migrate testbooks
const testbooksRef = collection(db, "testbooks");
// Ensure all testbooks include module references
// Set ownerId to "system" for default testbooks
```

---

## Part 6: Migration Plan

### 6.1 Data Migration

1. **Export Current Data**
   - Export Streetlight.tsx data to structured format
   - Export Pantheon.tsx data
   - Export Zeus.tsx data
   - Extract all translations from locale JSON files

2. **Transform to Database Schema**
   - Convert module files to ModuleRecord format
   - Convert translations to TranslationRecord format
   - Validate all transformations

3. **Test in Staging**
   - Seed staging database
   - Verify all data correct
   - Test querying
   - Test rendering

4. **Deploy to Production**
   - Create backup
   - Seed production database
   - Verify imports
   - Run integration tests

5. **Cutover**
   - Disable hardcoded modules (one by one)
   - Enable database modules (one by one)
   - Monitor for errors
   - Keep rollback plan ready

---

## Part 7: Performance Considerations

### 7.1 Caching Strategy

```typescript
// Cache modules in memory (with TTL)
const moduleCache = new Map<string, ModuleRecord>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cache translations per language
const translationCache = new Map<string, Record<string, string>>();

// Use SWR or React Query for automatic caching
const { data: module } = useSWR(`/api/modules/${id}`, fetcher, {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 60000,
});
```

### 7.2 Optimization

- Lazy-load module content (intersectionObserver)
- Pagination for large translation lists
- Query indexes in Firestore
- Minimize re-renders with React.memo
- Code-split admin interfaces

---

## Part 8: Testing Strategy

### 8.1 Unit Tests

```typescript
// useModules.test.ts
describe("useModules", () => {
  test("should fetch all active modules", async () => {});
  test("should create new module", async () => {});
  test("should update module", async () => {});
  test("should publish module", async () => {});
});

// useTranslationManager.test.ts
describe("useTranslationManager", () => {
  test("should retrieve translation", () => {});
  test("should fallback to English", () => {});
  test("should detect missing translations", () => {});
});
```

### 8.2 Integration Tests

```typescript
// E2E: Create module → Generate translations → Render
test("E2E: Module creation workflow", async () => {
  // 1. Create new module
  // 2. Verify translations auto-generated
  // 3. Render module
  // 4. Verify all sections display
});
```

---

## Part 9: Rollback Plan

**If deployment fails:**

1. Immediately revert code deployment
2. Update routing back to hardcoded modules
3. Disable database queries
4. Restore from database backup
5. Post-mortem and retry

**Estimated rollback time:** < 15 minutes

---

## Part 10: Success Metrics

| Metric                    | Target  | Measurement         |
| ------------------------- | ------- | ------------------- |
| Module load time          | < 500ms | Performance metrics |
| Translation miss rate     | 0%      | Error logs          |
| Render errors             | 0       | Error tracking      |
| Mobile responsiveness     | 100%    | Visual testing      |
| PDF export success        | 100%    | Test suite          |
| Admin interface usability | 4.5/5   | User feedback       |

---

**Specification Version:** 1.0  
**Last Updated:** June 1, 2026  
**Status:** Ready for Implementation
