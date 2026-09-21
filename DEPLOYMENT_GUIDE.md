# 🚀 Testbook & Module Content Migration Deployment Guide

## What's Been Implemented

### Testbooks + Module Content = Fully Database-Driven ✅

| Item                 | Before                                  | After                       |
| -------------------- | --------------------------------------- | --------------------------- |
| Testbooks            | ❌ Hardcoded in code                    | ✅ Firestore collection     |
| Module Content       | ❌ Hardcoded in DEFAULT_MODULE_CONTENTS | ✅ Firestore subcollections |
| Modules per Testbook | ❌ 4-5 (inconsistent)                   | ✅ 8 (consistent)           |
| Persistence          | ❌ Lost on reload                       | ✅ Backed up in Firebase    |
| Add New Testbooks    | ❌ Code change needed                   | ✅ Dynamic creation         |

## 2-Step Deployment

### STEP 1️⃣: Seed Testbooks Metadata to Firestore

```bash
npx ts-node scripts/seedTestbooks.ts
```

**What it does:**

- Creates `testbooks` collection in Firestore
- Adds 3 default testbooks: Pantheon, Streetlight, Zeus
- Each marked `isCustom: false` and `isPublic: true`
- All 8 standard modules linked to each testbook

**Expected output:**

```
✅ Seeded testbook: Pantheon V4 Testbook
✅ Seeded testbook: Streetlight Testbook
✅ Seeded testbook: Zeus Testbook
✅ All testbooks seeded successfully!
```

### STEP 2️⃣: Migrate Module Content to Firestore

```bash
npx ts-node scripts/migrateModuleContents.ts
```

**What it does:**

- Creates `testbooks/{id}/modules/{moduleId}` subcollections
- Saves all module content (8 modules × 3 testbooks = 24 documents)
- Each module includes full markdown content
- Links to specific testbook via testbookId

**Expected output:**

```
📦 Migrating content for testbook: pantheon-ng
  ✅ Module: intro
  ✅ Module: dispositivos
  ✅ Module: corte-religue
  ✅ Module: leitura-demanda
  ✅ Module: alarmes
  ✅ Module: parametrizacao
  ✅ Module: relatorios
  ✅ Module: diagnosticos
📦 Migrating content for testbook: streetlight
  ... (8 modules)
📦 Migrating content for testbook: zeus
  ... (8 modules)
✅ All module contents migrated successfully!

Structure created:
testbooks/
  ├── pantheon-ng/modules/ (8 modules)
  ├── streetlight/modules/ (8 modules)
  └── zeus/modules/ (8 modules)
```

### STEP 3️⃣: Start Application

```bash
npm run dev
```

## Database Structure Created

### Collection: `testbooks/`

```
Documents:
├── pantheon-ng
│   ├── id: "pantheon-ng"
│   ├── title: "Pantheon V4 Testbook"
│   ├── modules: [intro, dispositivos, corte-religue, ...]
│   ├── isCustom: false
│   ├── isPublic: true
│
├── streetlight
│   └── (same structure)
│
└── zeus
    └── (same structure)
```

### Subcollection: `testbooks/{id}/modules/`

```
For each testbook, 8 modules:

testbooks/pantheon-ng/modules/
├── intro
│   ├── id: "intro"
│   ├── title: "1. Introdução"
│   ├── content: "# 1. Introdução\n\n..." (full markdown)
│   ├── images: []
│   ├── alerts: []
│
├── dispositivos
│   ├── id: "dispositivos"
│   ├── title: "2. Dispositivos"
│   ├── content: "# 2. Dispositivos\n\n..." (full markdown)
│   ...
│
├── corte-religue
├── leitura-demanda
├── alarmes
├── parametrizacao
├── relatorios
└── diagnosticos
```

Same structure for `streetlight/` and `zeus/` testbooks.

## 8 Standard Modules in Every Testbook

1. **intro** - Introduction & basic concepts
2. **dispositivos** - Devices & components
3. **corte-religue** - Cut/reconnect procedures
4. **leitura-demanda** - Demand reading
5. **alarmes** - Alarms & alerts
6. **parametrizacao** - System parametrization
7. **relatorios** - Reports generation
8. **diagnosticos** - Diagnostics tools

## How It Works

### Loading Flow

```
User navigates to /testbooks
    ↓
Testbooks.tsx calls useTestbook().fetchTestbooks()
    ↓
Fetches from Firestore collection: testbooks/
    ↓
Lists all testbooks (Pantheon, Streetlight, Zeus, + custom)
    ↓
User clicks on testbook
    ↓
TestbookEditor loads specific testbook
    ↓
useTestbookContent().fetchTestbookContent(testbookId)
    ↓
Fetches from Firestore subcollection: testbooks/{id}/modules/
    ↓
Displays all 8 modules with content
```

### Editing Flow

```
User clicks "Edit" on a module
    ↓
currentModuleContent?.content || DEFAULT_MODULE_CONTENTS[activeModule]
    ↓
(Firebase content if loaded, fallback to hardcoded while loading)
    ↓
User modifies content
    ↓
Clicks "Save" or "Save Global"
    ↓
updateModuleContent() or updateGlobalModule()
    ↓
Updates Firestore: testbooks/{id}/modules/{moduleId}
    ↓
Re-fetches content to display updated version
```

## Verification Checklist

After running both seed scripts:

- [ ] Navigate to `/testbooks` → See 3 testbooks from Firebase
- [ ] Click on Pantheon V4 → Opens TestbookEditor
- [ ] See 8 modules listed (intro, dispositivos, corte-religue, ...)
- [ ] Click on each module → Content loads from Firebase
- [ ] Click "Edit" → Can edit content
- [ ] Click "Save" → Saves to Firebase, re-fetches
- [ ] Create new testbook → Can select 8 modules
- [ ] Console shows no errors

## Files Modified for This Migration

**Created:**

- `scripts/seedTestbooks.ts` - Initialize testbooks
- `scripts/migrateModuleContents.ts` - Migrate module content

**Updated:**

- `src/pages/Testbooks.tsx` - Fetch from Firebase
- `src/hooks/useTestbookContent.ts` - Fixed getModuleContent()

**Already Working:**

- `src/pages/TestbookEditor.tsx` - Loads content from Firebase with fallback
- `src/hooks/useTestbook.ts` - Testbook CRUD
- `src/types.ts` - All type definitions

## Troubleshooting

### Issue: "testbooks collection not found"

**Solution:** Run `npx ts-node scripts/seedTestbooks.ts` first

### Issue: "No module content displayed"

**Solution:** Run `npx ts-node scripts/migrateModuleContents.ts` after seeding testbooks

### Issue: "Content won't save"

**Solution:** Verify user is logged in and check Firebase console for permission errors

### Issue: "Content shows DEFAULT_MODULE_CONTENTS instead of Firebase"

**Normal:** While content is loading, fallback is used. Refresh the page after a few seconds.

## Summary

✅ **Step 1:** Run `npx ts-node scripts/seedTestbooks.ts`  
✅ **Step 2:** Run `npx ts-node scripts/migrateModuleContents.ts`  
✅ **Step 3:** Run `npm run dev`  
✅ **Result:** Fully database-driven testbooks with persistent module content

---

**Status:** Ready for Production  
**Deployment Time:** 2-3 minutes (both scripts + dev server)  
**Data Backed Up:** ✅ Yes, in Firestore
