# Admin Traffic Sign Management - Implementation Guide

## Overview
This document provides implementation instructions for the admin backoffice feature to manage traffic signs, including creating, updating, and deleting traffic signs and categories.

**⚠️ IMPORTANT:** Backend for Traffic Signs is NOT yet implemented. This is a frontend specification for future implementation.

---

## 1. Location & Navigation

### Main Route
`/backoffice/traffic-signs?jurisdictionId={jurisdictionId}`

### Access Control
- Only accessible to users with admin role
- Redirect to login if not authenticated
- Show 403 error if authenticated but not admin

### Navigation Flow
1. **Category List View** - `/backoffice/traffic-signs?jurisdictionId={jurisdictionId}`
   - Select jurisdiction
   - View all categories for jurisdiction
   - Create/Edit/Delete categories
   
2. **Category Detail View** - `/backoffice/traffic-signs/categories/{categoryId}`
   - View all traffic signs in the category
   - Create/Edit/Delete traffic signs
   - View individual sign details

3. **Sign Detail Modal/Drawer** - Opens within category detail view
   - View full sign details
   - Edit sign
   - Delete sign

---

## 2. Traffic Sign Categories Management

### Route
`/backoffice/traffic-signs?jurisdictionId={jurisdictionId}`

### Jurisdiction Selection

**Important:** Categories are managed per jurisdiction. Admin must first select a jurisdiction to view and manage its categories.

**UI Flow:**
1. Show jurisdiction selector dropdown at the top of the page
2. Load categories for the selected jurisdiction
3. All category operations (create, update, delete) are scoped to the selected jurisdiction

### List Categories by Jurisdiction

**API Endpoint:**
```http
GET /api/v1/admin/traffic-sign-categories/jurisdiction/{jurisdictionId}
Authorization: Bearer {admin-token}
```

**Path Parameters:**
- `jurisdictionId`: The jurisdiction ID to filter categories

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "jurisdictionId": 1,
      "jurisdictionName": "Ethiopia",
      "jurisdictionCode": "ET",
      "name": "Warning Signs",
      "description": "Signs that warn drivers of potential hazards",
      "translations": {
        "am": {
          "name": "የማስጠንቀቂያ ምልክቶች",
          "description": "ስለሚመጡ አደጋዎች የሚያስጠነቅቁ ምልክቶች"
        },
        "ti": {
          "name": "መጠንቀቒ ምልክታት",
          "description": "ብዛዕባ ዝመጹ ሓደጋታት ዘጠንቅቑ ምልክታት"
        }
      },
      "asset": {
        "url": "traffic-signs/categories/warning-icon.png",
        "type": "image",
        "contentType": "image/png",
        "size": 12345,
        "filename": "warning-icon.png",
        "uploadedAt": "2026-03-01T10:00:00Z"
      },
      "isActive": true,
      "createdAt": "2026-03-01T10:00:00Z",
      "updatedAt": "2026-03-01T10:00:00Z"
    },
    {
      "id": 2,
      "jurisdictionId": 1,
      "jurisdictionName": "Ethiopia",
      "jurisdictionCode": "ET",
      "name": "Regulatory Signs",
      "description": "Signs that inform drivers of traffic laws",
      "translations": {
        "am": {
          "name": "የደንብ ምልክቶች",
          "description": "ስለ ትራፊክ ህጎች የሚያሳውቁ ምልክቶች"
        },
        "ti": {
          "name": "ሕጋዊ ምልክታት",
          "description": "ብዛዕባ ትራፊክ ሕግታት ዘፍልጡ ምልክታት"
        }
      },
      "asset": {
        "url": "traffic-signs/categories/regulatory-icon.png",
        "type": "image",
        "contentType": "image/png",
        "size": 13456,
        "filename": "regulatory-icon.png",
        "uploadedAt": "2026-03-01T10:00:00Z"
      },
      "isActive": true,
      "createdAt": "2026-03-01T10:00:00Z",
      "updatedAt": "2026-03-01T10:00:00Z"
    }
  ]
}
```

**Note:** Returns a list (not paginated) since categories per jurisdiction are typically limited in number.

### UI List Display

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Traffic Sign Categories                                │
│                                                         │
│  Jurisdiction: [Ethiopia ▼]              [+ New Category]│
│  Manage categories for selected jurisdiction            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ [Icon] Warning Signs                       [Edit] [Del]  │
│        Signs that warn drivers of potential hazards     │
│        Status: Active | 12 signs | Created: Mar 1, 2026│
│                                                         │
│        Translations: ✓ Amharic  ✓ Tigrinya             │
│        [View Signs →]                                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ [Icon] Regulatory Signs                    [Edit] [Del]  │
│        Signs that inform drivers of traffic laws        │
│        Status: Active | 8 signs | Created: Mar 1, 2026 │
│                                                         │
│        Translations: ✓ Amharic  ✓ Tigrinya             │
│        [View Signs →]                                   │
└─────────────────────────────────────────────────────────┘
```

**Category Card Interaction:**
- Click on category card or "View Signs →" button to navigate to category detail view
- Shows all traffic signs within that category

**Jurisdiction Selector:**
- Dropdown showing all available jurisdictions
- On change, reload categories for selected jurisdiction
- Store selected jurisdiction in URL query parameter
- Persist selection in session/local storage

### Create Category

**Button:** "+ New Category" (top right)

**Modal/Page Form:**
```
Jurisdiction: [Pre-filled from selected jurisdiction - Read-only]
Name (English): [Text Input - Required, max 255 chars]
Description (English): [Textarea - Required, max 1000 chars]

Category Icon/Image (Optional):
  [Upload File] or [Drag & Drop]
  Accepted: Images (jpg, png, webp)
  Max size: 5MB
  Preview: [Shows uploaded file]

Amharic Translation:
  Name: [Text Input - Optional, max 255 chars]
  Description: [Textarea - Optional, max 1000 chars]

Tigrinya Translation:
  Name: [Text Input - Optional, max 255 chars]
  Description: [Textarea - Optional, max 1000 chars]

Status: [Toggle - Active/Inactive]
```

**Note:** The jurisdiction is automatically set from the currently selected jurisdiction in the UI and cannot be changed in the create form.

**API Endpoint:**
```http
POST /api/v1/admin/traffic-sign-categories
Authorization: Bearer {admin-token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "jurisdictionId": 1,
  "name": "Warning Signs",
  "description": "Signs that warn drivers of potential hazards",
  "translations": {
    "am": {
      "name": "የማስጠንቀቂያ ምልክቶች",
      "description": "ስለሚመጡ አደጋዎች የሚያስጠነቅቁ ምልክቶች"
    },
    "ti": {
      "name": "መጠንቀቒ ምልክታት",
      "description": "ብዛዕባ ዝመጹ ሓደጋታት ዘጠንቅቑ ምልክታት"
    }
  },
  "asset": {
    "url": "traffic-signs/categories/warning-icon.png",
    "type": "image",
    "contentType": "image/png",
    "size": 12345,
    "filename": "warning-icon.png",
    "uploadedAt": "2026-03-01T10:00:00Z"
  },
  "isActive": true
}
```

### Update Category

**API Endpoint:**
```http
PUT /api/v1/admin/traffic-sign-categories/{id}
Authorization: Bearer {admin-token}
Content-Type: application/json
```

**Request Body:** Same as create

### Delete Category

**Confirmation Dialog:**
```
⚠️ Delete Category?

Are you sure you want to delete "Warning Signs"?
This will also delete all traffic signs in this category.

This action cannot be undone.

[Cancel]  [Delete]
```

**API Endpoint:**
```http
DELETE /api/v1/admin/traffic-sign-categories/{id}
Authorization: Bearer {admin-token}
```

---

## 3. Category Detail View - Traffic Signs Management

### Route
`/backoffice/traffic-signs/categories/{categoryId}`

### State Management

**Use Zustand Store:** like:
```typescript
interface TrafficSignStore {
  // Categories
  categories: TrafficSignCategory[];
  selectedJurisdictionId: number | null;
  selectedCategory: TrafficSignCategory | null;
  setCategories: (categories: TrafficSignCategory[]) => void;
  setSelectedJurisdiction: (id: number) => void;
  setSelectedCategory: (category: TrafficSignCategory | null) => void;
  
  // Traffic Signs
  signs: TrafficSign[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  setSigns: (signs: TrafficSign[]) => void;
  
  // Sign detail
  selectedSign: TrafficSign | null;
  isDetailOpen: boolean;
  setSelectedSign: (sign: TrafficSign | null) => void;
  setDetailOpen: (open: boolean) => void;
  
  // Form state
  isCreating: boolean;
  isEditing: boolean;
  setCreating: (creating: boolean) => void;
  setEditing: (editing: boolean) => void;
}
```

### List Signs in Category

**API Endpoint:**
```http
GET /api/v1/admin/traffic-signs?categoryId=1&page=0&size=20
Authorization: Bearer {admin-token}
```

**Query Parameters:**
- `categoryId` (optional): Filter by category
- `page`, `size`: Pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "categoryId": 1,
        "description": "Stop sign - drivers must come to a complete stop",
        "translations": {
          "am": {
            "description": "የማቆሚያ ምልክት - ሹፌሮች ሙሉ በሙሉ ማቆም አለባቸው"
          },
          "ti": {
            "description": "መደምሰሲ ምልክት - ሹፌራት ምሉእ ብምሉእ ክደምሱ ኣለዎም"
          }
        },
        "signAsset": {
          "url": "traffic-signs/stop-sign.png",
          "type": "image",
          "contentType": "image/png",
          "size": 45678,
          "filename": "stop-sign.png",
          "uploadedAt": "2026-03-01T10:00:00Z"
        },
        "additionalAssets": [],
        "realLifeAssets": [],
        "isActive": true,
        "createdAt": "2026-03-01T10:00:00Z",
        "updatedAt": "2026-03-01T10:00:00Z"
      }
    ],
    "page": {
      "number": 0,
      "size": 20,
      "totalElements": 12,
      "totalPages": 1
    }
  }
}
```

### UI Layout

**Page Header:**
```
┌─────────────────────────────────────────────────────────┐
│  ← Back to Categories                                   │
│                                                         │
│  Warning Signs                              [+ New Sign] │
│  Signs that warn drivers of potential hazards          │
│  12 signs total                                         │
└─────────────────────────────────────────────────────────┘
```

**Signs Grid/List:**
```
┌─────────────────────────────────────────────────────────┐
│ [Image]  Stop sign - drivers must come to a complete...│
│          Status: Active | Created: Mar 1, 2026         │
│          Assets: 1 main, 2 additional, 3 real-life     │
│          [View Details] [Edit] [Delete]                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ [Image]  Yield sign - drivers must slow down and...    │
│          Status: Active | Created: Mar 1, 2026         │
│          Assets: 1 main, 0 additional, 2 real-life     │
│          [View Details] [Edit] [Delete]                │
└─────────────────────────────────────────────────────────┘

                    [← Previous] Page 1 of 2 [Next →]
```

**Interactions:**
- Click "View Details" to open sign detail modal/drawer
- Click "Edit" to open edit form modal
- Click "Delete" to show delete confirmation
- Click "+ New Sign" to open create form modal

---

## 4. Traffic Sign Detail View

### Display Type
Modal or Side Drawer (opens within category detail view)

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  Traffic Sign Details                            [✕]    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│              [Main Sign Image/Video]                    │
│              (Large display)                            │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Category: Warning Signs                                │
│  Status: Active                                         │
│  Created: Mar 1, 2026 | Updated: Mar 5, 2026           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Description (English):                                 │
│  Stop sign - drivers must come to a complete stop      │
│  before proceeding. Check for traffic from all          │
│  directions.                                            │
│                                                         │
│  Description (አማርኛ):                                   │
│  የማቆሚያ ምልክት - ሹፌሮች ሙሉ በሙሉ ማቆም አለባቸው...          │
│                                                         │
│  Description (ትግርኛ):                                   │
│  መደምሰሲ ምልክት - ሹፌራት ምሉእ ብምሉእ ክደምሱ ኣለዎም...        │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Additional Assets (2)                                  │
│  ┌──────────┐ ┌──────────┐                            │
│  │[Thumb 1] │ │[Thumb 2] │                            │
│  │Caption 1 │ │Caption 2 │                            │
│  └──────────┘ └──────────┘                            │
├─────────────────────────────────────────────────────────┤
│  Real Life Photos (3)                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │[Photo 1] │ │[Photo 2] │ │[Photo 3] │              │
│  │Location 1│ │Location 2│ │Location 3│              │
│  └──────────┘ └──────────┘ └──────────┘              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Edit Sign]                            [Delete Sign]   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Display full sign details with all assets
- Show descriptions in all languages (rich text HTML rendered)
- View all additional assets and real-life photos
- Quick access to edit and delete actions
- Close button to return to category signs list

---

## 5. Create Traffic Sign

### Display Type
Modal or Side Drawer (opens within category detail view)

### Form Layout

**Important:** 
- Backend handles file uploads via multipart/form-data
- Use **Zustand** for state management (store traffic signs, categories, form state)
- Use **Quill** rich text editor for all description fields
- Category is pre-filled from current category context

```
┌─────────────────────────────────────────────────────────┐
│  Create Traffic Sign                            [✕]     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Basic Information                                      │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Category: [Warning Signs - Read-only/Pre-filled]       │
│  Status: [Toggle - Active/Inactive]                     │
│                                                         │
│  Description (English): [Quill Rich Text Editor - Required]│
│  Max 2000 characters                                    │
│  Supports: Bold, Italic, Lists, Links, etc.            │
│                                                         │
│  Amharic Translation:                                   │
│  Description: [Quill Rich Text Editor - Optional, max 2000]│
│                                                         │
│  Tigrinya Translation:                                  │
│  Description: [Quill Rich Text Editor - Optional, max 2000]│
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Main Sign Image/Video (Required)                       │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  [Upload File] or [Drag & Drop]                         │
│  Accepted: Images (jpg, png, webp), Videos (mp4, webm) │
│  Max size: 10MB for images, 50MB for videos            │
│                                                         │
│  Preview: [Shows uploaded file]                         │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Additional Assets (Optional)                           │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  [+ Add Asset]                                          │
│                                                         │
│  Asset 1:                                               │
│    File: [Upload]                                       │
│    Caption: [Text Input - Optional]                     │
│    Order: [Number - Default: 1]                         │
│    [Remove]                                             │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Real Life Photos (Optional)                            │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  [+ Add Photo]                                          │
│                                                         │
│  Photo 1:                                               │
│    File: [Upload] (Images only)                         │
│    Caption: [Text Input - Optional]                     │
│    Order: [Number - Default: 1]                         │
│    [Remove]                                             │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Cancel]                              [Create Sign]    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### File Upload Implementation

**Important:** Use `multipart/form-data` to send files to backend

**FormData Structure:**
```javascript
const formData = new FormData();

// Basic fields
formData.append('categoryId', '1');
formData.append('description', 'Stop sign - drivers must come to a complete stop');
formData.append('translations', JSON.stringify({
  am: { description: '...' },
  ti: { description: '...' }
}));
formData.append('isActive', 'true');

// Main sign asset (required)
formData.append('signAsset', fileObject); // File object from input

// Additional assets (optional, multiple)
formData.append('additionalAssets[0].file', fileObject1);
formData.append('additionalAssets[0].caption', 'How to approach a stop sign');
formData.append('additionalAssets[0].order', '1');

formData.append('additionalAssets[1].file', fileObject2);
formData.append('additionalAssets[1].caption', 'Stop sign at night');
formData.append('additionalAssets[1].order', '2');

// Real life assets (optional, multiple)
formData.append('realLifeAssets[0].file', fileObject3);
formData.append('realLifeAssets[0].caption', 'Stop sign in Addis Ababa');
formData.append('realLifeAssets[0].order', '1');
```

### API Endpoint

```http
POST /api/v1/admin/traffic-signs
Authorization: Bearer {admin-token}
Content-Type: multipart/form-data
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "categoryId": 1,
    "description": "Stop sign - drivers must come to a complete stop",
    "translations": {...},
    "signAsset": {
      "url": "traffic-signs/stop-sign.png",
      "type": "image",
      "contentType": "image/png",
      "size": 45678,
      "filename": "stop-sign.png",
      "uploadedAt": "2026-03-01T10:00:00Z"
    },
    "additionalAssets": [...],
    "realLifeAssets": [...],
    "isActive": true,
    "createdAt": "2026-03-01T10:00:00Z",
    "updatedAt": "2026-03-01T10:00:00Z"
  }
}
```

### File Upload UI Components

**Upload Button:**
```
┌─────────────────────────────────────┐
│  📁 Choose File                     │
│  or drag and drop                   │
│                                     │
│  Accepted: JPG, PNG, WEBP          │
│  Max size: 10MB                     │
└─────────────────────────────────────┘
```

**File Preview:**
```
┌─────────────────────────────────────┐
│  [Thumbnail]  stop-sign.png         │
│               45.6 KB               │
│               [✓] Uploaded          │
│               [Remove]              │
└─────────────────────────────────────┘
```

**Upload Progress:**
```
┌─────────────────────────────────────┐
│  Uploading stop-sign.png...         │
│  [████████░░] 80%                   │
└─────────────────────────────────────┘
```

---

## 6. Update Traffic Sign

### Display Type
Modal or Side Drawer (opens within category detail view)

### Form
Same as create form, but:
- Pre-populate all fields with existing data
- Show existing assets with option to keep or replace
- Only upload new files if user wants to replace
- Category is read-only (cannot change category in edit)

**API Endpoint:**
```http
PUT /api/v1/admin/traffic-signs/{id}
Authorization: Bearer {admin-token}
Content-Type: multipart/form-data
```

**Request:**
- Same as create
- All fields optional
- Only include files if replacing existing assets
- Backend keeps existing assets if not provided

### Existing Asset Management

**Display existing assets:**
```
┌─────────────────────────────────────┐
│  Current Main Sign:                 │
│  [Thumbnail] stop-sign.png          │
│  Uploaded: Mar 1, 2026              │
│                                     │
│  ☐ Replace with new file            │
│  [Upload New File]                  │
└─────────────────────────────────────┘
```

**For additional/real-life assets:**
```
┌─────────────────────────────────────┐
│  Existing Assets:                   │
│                                     │
│  1. [Thumb] video.mp4  [Remove]     │
│  2. [Thumb] photo.jpg  [Remove]     │
│                                     │
│  [+ Add New Asset]                  │
└─────────────────────────────────────┘
```

---

## 7. Delete Traffic Sign

**Confirmation Dialog:
```
⚠️ Delete Traffic Sign?

Are you sure you want to delete this traffic sign?
Description: "Stop sign - drivers must come to a complete stop"

This action cannot be undone.

[Cancel]  [Delete]
```

**API Endpoint:**
```http
DELETE /api/v1/admin/traffic-signs/{id}
Authorization: Bearer {admin-token}
```

---

## 8. File Upload Specifications

### Accepted File Types

**Images:**
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)

**Videos:**
- MP4 (.mp4)
- WebM (.webm)

### File Size Limits
- Images: 10MB max
- Videos: 50MB max

### Validation
- Validate file type on client side
- Validate file size on client side
- Backend will also validate and reject invalid files
- Show clear error messages for invalid files

### File Naming
- Backend generates unique filenames
- Backend handles file storage to Cloudflare R2
- Frontend receives URLs in response

---

## 9. Asset Management Features

### Reorder Assets

**Drag and Drop:**
```
┌─────────────────────────────────────┐
│  Additional Assets:                 │
│                                     │
│  ☰ 1. [Thumb] video.mp4             │
│  ☰ 2. [Thumb] diagram.png           │
│  ☰ 3. [Thumb] animation.mp4         │
│                                     │
│  Drag to reorder                    │
└─────────────────────────────────────┘
```

### Asset Captions

**Multilingual Support:**
```
Caption (English): [Text Input]
Caption (Amharic): [Text Input - Optional]
Caption (Tigrinya): [Text Input - Optional]
```

**Note:** For MVP, captions can be English only. Add multilingual support later.

---

## 10. Bulk Operations (Optional - Future Enhancement)

### Bulk Upload
- Upload multiple signs at once
- CSV import with asset URLs
- Batch processing

### Bulk Edit
- Change category for multiple signs
- Activate/deactivate multiple signs
- Add tags to multiple signs

---

## 11. Search & Filter (Within Category)

### Search Bar
- Search by description within current category
- Real-time search as user types
- Search across all language descriptions

### Filter Panel
```
┌─────────────────────────────────────┐
│ Filters                             │
│ ─────────────────────────────────── │
│                                     │
│ Status: [All ▼]                     │
│ Has Video: [All ▼]                  │
│ Has Real Photos: [All ▼]            │
│                                     │
│ [Clear] [Apply]                     │
└─────────────────────────────────────┘
```

---

## 11. Preview Feature

### Preview Button
- Show how sign will appear to users
- Display in all three languages
- Show all assets
- Test navigation (prev/next)

**Preview Modal:**
```
┌─────────────────────────────────────┐
│  Preview: Stop Sign                 │
│  [Close Preview]                    │
├─────────────────────────────────────┤
│                                     │
│  [English] [አማርኛ] [ትግርኛ]           │
│                                     │
│  [Main Sign Image]                  │
│                                     │
│  [Explanation] [Real Life] [More]   │
│                                     │
│  Stop sign - drivers must come to   │
│  a complete stop                    │
│                                     │
└─────────────────────────────────────┘
```

---

## 12. Statistics & Analytics (Optional)

### Dashboard Metrics
```
┌──────────────┬──────────────┬──────────────┐
│ Total Signs  │ Categories   │ Active Signs │
│ 234          │ 8            │ 230          │
└──────────────┴──────────────┴──────────────┘
```

### Analytics
- Most viewed signs
- Signs with missing translations
- Signs without real-life photos
- Recently added signs

---

## 13. Error Handling

**File Upload Errors:**
```json
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File size exceeds maximum allowed size",
    "details": {
      "maxSize": "10MB",
      "actualSize": "15MB"
    }
  }
}
```

**Validation Errors:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "description",
        "message": "Description is required"
      },
      {
        "field": "signAsset",
        "message": "Main sign image/video is required"
      }
    ]
  }
}
```

---

## 14. UI/UX Guidelines

### Rich Text Editor (Quill)

**Implementation:**
- Use `react-quill` package for Quill integration
- Configure toolbar with: Bold, Italic, Underline, Lists (ordered/unordered), Links
- Set max length validation (2000 characters)
- Store HTML content in description field
- Apply same editor to all three language descriptions

**Quill Configuration:**
```typescript
const modules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link'],
    ['clean']
  ]
};

const formats = [
  'bold', 'italic', 'underline',
  'list', 'bullet',
  'link'
];
```

**Character Count:**
- Show character counter below editor
- Warn when approaching limit (e.g., at 1900 chars)
- Prevent input when limit reached
- Count plain text length, not HTML tags

### Zustand State Management

**Store Location:** `stores/trafficSignStore.ts`

**Usage Examples:**
```typescript
// Load categories for jurisdiction
const { categories, setCategories, setSelectedJurisdiction } = useTrafficSignStore();

useEffect(() => {
  fetchCategories(jurisdictionId).then(setCategories);
  setSelectedJurisdiction(jurisdictionId);
}, [jurisdictionId]);

// Load signs for category
const { signs, setSigns, setSelectedCategory } = useTrafficSignStore();

useEffect(() => {
  fetchSigns(categoryId, page).then(setSigns);
  setSelectedCategory(categoryId);
}, [categoryId, page]);
```

### Loading States
- Show upload progress for files
- Skeleton loaders for lists
- Spinner during form submission
- Disable submit button while uploading
- Show loading state in Quill editor while fetching data

### Empty States
```
┌─────────────────────────────────────┐
│         🚦                          │
│   No Traffic Signs Yet              │
│                                     │
│   Create your first traffic sign   │
│   [+ Create Sign]                   │
└─────────────────────────────────────┘
```

### Success Messages
- "Category created successfully"
- "Traffic sign created successfully"
- "Files uploaded successfully"
- "Traffic sign updated successfully"
- "Traffic sign deleted successfully"

### Validation Messages
- Show inline validation errors
- Highlight invalid fields
- Clear error messages
- Prevent submission if invalid

---

## 15. Mobile Responsiveness

- Stack form fields vertically
- Touch-friendly file upload
- Responsive image previews
- Mobile-optimized tables
- Bottom sheet for filters

---

## 16. Accessibility

- Keyboard navigation
- Screen reader support
- ARIA labels for file inputs
- Focus management
- Alt text for images
- Proper form labels

---

## 17. Performance Optimization

### Image Optimization
- Compress images before upload (optional)
- Generate thumbnails on backend
- Lazy load images in list
- Use CDN for asset delivery

### File Upload
- Show upload progress
- Allow cancellation
- Retry failed uploads
- Chunked upload for large files (optional)

---

## 18. CDN Configuration

**Environment Variable:**
```env
NEXT_PUBLIC_CDN_URL=https://cdn.habeshadrive.com
```

**Display Assets:**
```typescript
const getAssetUrl = (relativePath: string) => {
  return `${process.env.NEXT_PUBLIC_CDN_URL}/${relativePath}`;
};
```

---

## 19. Permissions

**Admin can:**
- Create categories
- Create traffic signs
- Update categories and signs
- Delete categories and signs
- Upload files
- Manage translations
- Activate/deactivate signs

**Admin cannot:**
- Access user data through this module
- Modify system settings

---

## 20. Future Enhancements

- Version history for signs
- Approval workflow
- Scheduled publishing
- Duplicate sign feature
- Import/export functionality
- Multi-language editor
- Asset library/media manager
- AI-powered translation suggestions
- Bulk translation tools
