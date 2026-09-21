# 📖 Testbook System - Complete Implementation Guide

## ✅ What's Been Implemented

### 1. **Testbook Viewer & Editor** 🎯

Users can now click on any testbook (default or custom) to open a full-featured editor with:

- **Module Navigation** - Easy sidebar to switch between testbook modules
- **Rich Content Editing** - Edit module content with a textarea
- **Dual Save Options** - Save to only this testbook OR across all testbooks (with admin validation)
- **Edit History** - Track who updated what and when
- **Admin Controls** - Admins can approve or edit global modules

### 2. **Admin Validation System** 🔐

When non-admin users try to make **global changes** (affecting all testbooks with that module):

- A modal appears asking to choose between:
  - **"Apenas Neste Testbook"** (This testbook only) - Saves immediately
  - **"Em Todos os Testbooks"** (Global) - Requires admin approval (or auto-approves if you're admin)
- Admins can directly make global changes without validation
- Non-admins get a message that their request needs validation

### 3. **Complete Module Content Structure** 📝

Each testbook module now has:

- `title` - Module name (e.g., "1. Introdução")
- `description` - Short description
- `content` - Full markdown/HTML content (editable)
- `isGlobal` - Whether this is a global or testbook-specific version
- `createdAt` - When it was created
- `updatedAt` - Last update timestamp
- `updatedBy` - User ID of last editor
- `updatedByName` - Name of last editor
- `images` - Array of image URLs (future feature)
- `alerts` - Info boxes and warnings (future feature)

### 4. **Pre-loaded Default Content** 📚

All 8 modules come with default professional content:

- **1. Introdução** - Overview and prerequisites
- **2. Dispositivos** - Network management and device info
- **3. Corte/Religue** - Connection/disconnection procedures
- **4. Leitura de Demanda** - On-demand reading procedures
- **5. Alarmes** - Alarm management
- **6. Parametrização** - System parameter configuration
- **7. Relatórios** - Report generation and analysis
- **8. Diagnósticos** - Diagnostic tools and procedures

---

## 🚀 How to Use

### **Opening a Testbook**

1. Go to the **Testbooks** page
2. Click any testbook card to open it
3. You'll see:
   - Module list on the left sidebar
   - Module content in the center
   - Edit button in the top right (if you're the owner)

### **Editing a Module**

1. Click **"Editar"** (Edit) button
2. Modify the content in the textarea
3. Choose one of two save options:
   - **"Salvar Apenas Neste Testbook"** → Saves immediately
   - **"Solicitar Atualização Global"** (non-admin) / **"Salvar em Todos os Testbooks (Admin)"** (admin)

### **For Admins: Approving Global Changes**

1. Non-admin users submit global change requests
2. Admins see a modal with:
   - The proposed change description
   - Option to approve (update all testbooks)
   - Option to approve testbook-only instead
3. Click to approve
4. Change is applied to all testbooks using that module

### **Creating a Custom Testbook**

1. Click **"Criar Novo"** button
2. Fill in name, description, select modules, choose color
3. New testbook created with all default content
4. Start editing modules as needed

---

## 📂 File Structure

### **New/Modified Files**

```
src/
├── types.ts                                   (MODIFIED)
│   ├── TestbookModuleContent interface
│   └── TestbookEditChange interface
│
├── hooks/
│   ├── useTestbook.ts                        (EXISTING - working)
│   ├── useTestbookContent.ts                 (NEW)
│   └── useTestbookPDF.ts                     (EXISTING)
│
├── components/Testbook/
│   ├── TestbookCreateModal.tsx               (EXISTING)
│   ├── TestbookShareModal.tsx                (EXISTING)
│   └── AdminValidationModal.tsx              (NEW)
│
├── pages/
│   ├── Testbooks.tsx                         (EXISTING - routing updated)
│   ├── TestbookEditor.tsx                    (NEW)
│   └── Testbooks/
│       ├── PantheonTestbook.tsx              (EXISTING)
│       ├── Streelight.tsx                    (EXISTING)
│       └── Zeus.tsx                          (EXISTING)
│
└── App.tsx                                   (MODIFIED)
    └── Added route: /testbook/:testbookId
```

---

## 🔥 Firebase Structure

### **Collection: testbooks**

```
testbooks/
├── [testbookId]/
│   ├── (document fields: title, description, modules, etc.)
│   └── modules/                    (subcollection)
│       └── [moduleId]/
│           ├── moduleId: "intro"
│           ├── title: "1. Introdução"
│           ├── description: "..."
│           ├── content: "..."
│           ├── isGlobal: false
│           ├── updatedAt: Timestamp
│           ├── updatedBy: "user-id"
│           └── updatedByName: "User Name"
```

### **Security Rules** (Recommended)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /testbooks/{testbookId} {
      allow read: if resource.data.isPublic == true
                  || request.auth.uid == resource.data.ownerId
                  || request.auth.token.email in resource.data.sharedWith;
      allow create, update, delete: if request.auth.uid == resource.data.ownerId;

      match /modules/{moduleId} {
        allow read: if true;
        allow write: if request.auth.uid == get(/databases/$(database)/documents/testbooks/$(testbookId)).data.ownerId
                     || request.auth.token.custom_admin == true;
      }
    }
  }
}
```

---

## 🎮 Component APIs

### **useTestbookContent Hook**

```typescript
const {
  content, // TestbookModuleContent[] - All loaded modules
  loading, // boolean - Loading state
  error, // string | null
  fetchTestbookContent, // (testbookId) => Promise<void>
  getModuleContent, // (moduleId) => TestbookModuleContent | undefined
  updateModuleContent, // (testbookId, moduleId, updates, userId, userName) => Promise<boolean>
  updateGlobalModule, // (moduleId, updates, userId, userName) => Promise<boolean>
} = useTestbookContent();
```

### **AdminValidationModal Component**

```tsx
<AdminValidationModal
  isOpen={boolean}
  onClose={() => void}
  onApprove={() => Promise<void>}
  onTestbookOnly={() => Promise<void>}
  isLoading={boolean}
  changeDescription={string}
  moduleName={string}
/>
```

---

## 🎯 Key Features

### **1. Automatic Content Initialization**

When a testbook is created or a new module is accessed, it uses `DEFAULT_MODULE_CONTENTS` to provide professional starting content.

### **2. Edit Control**

- **Testbook Owner** can edit their testbooks
- **Admins** can edit any testbook and make global changes
- **Non-Admins** can only make testbook-only edits or request global approval

### **3. Change Tracking**

Every module update records:

- Who made the change (`updatedBy`, `updatedByName`)
- When it was made (`updatedAt`)
- Global vs testbook-specific scope (`isGlobal`)

### **4. Global Change System**

- Non-admins can request global changes
- Admins must approve
- Prevents unauthorized platform-wide changes
- Auto-approves if requester is admin

### **5. Responsive UI**

- Mobile-friendly sidebar (collapses on small screens)
- Smooth animations between modules
- Desktop menu for actions
- Mobile menu (hamburger)

---

## 🚀 Advanced Usage

### **Programmatically Update Content**

```typescript
const { updateModuleContent, updateGlobalModule } = useTestbookContent();

// Update just this testbook
await updateModuleContent(
  "testbook-id",
  "intro",
  { content: "New content here" },
  user.uid,
  user.displayName,
);

// Update all testbooks with this module (requires admin)
await updateGlobalModule(
  "intro",
  { content: "New global content" },
  user.uid,
  user.displayName,
);
```

### **Querying Module Content**

```typescript
const { getModuleContent } = useTestbookContent();
const introContent = getModuleContent("intro");

if (introContent) {
  console.log(introContent.title); // "1. Introdução"
  console.log(introContent.content); // Full content
  console.log(introContent.updatedByName); // "John Doe"
}
```

---

## 🔄 User Workflows

### **Owner Editing Own Testbook**

```
1. Click on testbook card
2. View module content
3. Click "Editar"
4. Edit content
5. Click "Salvar Apenas Neste Testbook"
6. Changes saved immediately
```

### **Non-Admin Making Global Change Request**

```
1. Click on testbook card
2. Click "Editar"
3. Edit content
4. Click "Solicitar Atualização Global"
5. Modal appears with validation prompt
6. Choose "Apenas Neste Testbook" or "Todos os Testbooks"
7. If "Todos", request pending admin approval
8. Admin receives notification/sees pending requests
9. Admin approves → content updates everywhere
```

### **Admin Making Global Change**

```
1. Click on any testbook
2. Click "Editar"
3. Edit content
4. Click "Salvar em Todos os Testbooks (Admin)"
5. Change applies to ALL testbooks with this module immediately
6. Tracked as admin change with timestamp
```

---

## 🐛 Troubleshooting

### **Module Content Not Loading**

- Check Firebase connection
- Verify Firestore is enabled
- Check security rules allow reading testbooks

### **Edit Button Not Appearing**

- You must be the testbook owner
- Or you must be an admin
- Check `useAuth()` returns correct user

### **Can't Save Global Changes**

- You're a non-admin - use "Solicitar Atualização Global" instead
- Wait for admin approval
- Or ask an admin to make the change directly

### **Default Content Not Showing**

- New testbooks should auto-populate with defaults
- If missing, check `DEFAULT_MODULE_CONTENTS` in TestbookEditor.tsx
- Manually create modules via the editor

---

## 📊 Status

✅ **Completed**

- Testbook viewer and editor
- Module management
- Admin validation system
- Content tracking
- Edit history

🔄 **Ready for Future**

- PDF export (infrastructure ready)
- Image uploads
- Alert boxes and formatting
- Email notifications for approvals
- Testbook versioning
- Content audit trail

---

## 🎓 Notes

- All default testbooks (Pantheon, Streetlight, Zeus) retain their original routes
- Custom testbooks use the new `/testbook/:testbookId` route
- Content is stored in Firestore subcollections for scalability
- Global changes affect ALL testbooks with that module
- Admin approval required for non-admin global changes

---

**Last Updated**: May 25, 2026  
**Status**: ✅ Fully Functional and Ready for Testing
