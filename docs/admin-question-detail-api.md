# Admin Question Detail Management API Specification

## Overview
This API supports a detail-first admin workflow where the UI displays current question data (text, assets, options, tips, explanation) in read-only format, then provides explicit CRUD action buttons for managing each resource type.

## Base Configuration
- **Base URL**: `/api/v1/admin`
- **Authentication**: `Authorization: Bearer <JWT>`
- **Required Role**: `ADMIN`
- **Content-Type**: 
  - `application/json` for metadata operations
  - `multipart/form-data` for file uploads

---

## 1. Question CRUD

### 1.1 Get Question Detail (Full Aggregate)
```http
GET /api/v1/admin/questions/{questionId}
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": 101,
    "question": "What should you do at a red traffic light?",
    "translations": {
      "en": { "question": "What should you do at a red traffic light?" },
      "am": { "question": "በቀይ የትራፊክ መብራት ላይ ምን ማድረግ አለብዎት?" },
      "ti": { "question": "ኣብ ቀይሕ መብራህቲ ትራፊክ እንታይ ክትገብር ኣለካ?" }
    },
    "jurisdictionId": 1,
    "jurisdictionName": "Ethiopia",
    "categoryId": 5,
    "categoryName": "Traffic Signals",
    "active": true,
    "assets": [
      {
        "url": "https://cdn.example.com/q101-traffic-light.jpg",
        "type": "image",
        "alt": "Red traffic light",
        "caption": "Figure 1: Standard traffic light",
        "order": 1
      }
    ],
    "options": [
      {
        "id": 501,
        "text": "Stop completely",
        "translations": {
          "en": { "text": "Stop completely" },
          "am": { "text": "ሙሉ በሙሉ ያቁሙ" },
          "ti": { "text": "ምሉእ ብምሉእ ደው በል" }
        },
        "isCorrect": true,
        "position": 1,
        "asset": null
      },
      {
        "id": 502,
        "text": "Slow down and proceed with caution",
        "translations": {
          "en": { "text": "Slow down and proceed with caution" }
        },
        "isCorrect": false,
        "position": 2,
        "asset": null
      }
    ],
    "tips": [
      {
        "id": 301,
        "tip": "Always come to a complete stop at red lights, even if no traffic is visible.",
        "translations": {
          "en": { "tip": "Always come to a complete stop at red lights, even if no traffic is visible." },
          "am": { "tip": "ምንም ትራፊክ ባይታይም በቀይ መብራቶች ላይ ሁልጊዜ ሙሉ በሙሉ ይቁሙ።" }
        },
        "createdAt": "2026-02-20T10:00:00Z",
        "updatedAt": "2026-02-20T10:00:00Z"
      }
    ],
    "explanation": {
      "id": 201,
      "questionId": 101,
      "text": "Red traffic lights require all vehicles to stop completely before the stop line or intersection.",
      "translations": {
        "en": { "text": "Red traffic lights require all vehicles to stop completely before the stop line or intersection." },
        "am": { "text": "ቀይ የትራፊክ መብራቶች ሁሉም ተሽከርካሪዎች ከማቆሚያ መስመር ወይም መገናኛ በፊት ሙሉ በሙሉ እንዲቆሙ ይጠይቃሉ።" }
      },
      "assets": [
        {
          "url": "https://cdn.example.com/exp201-diagram.png",
          "type": "diagram",
          "alt": "Traffic light diagram",
          "caption": "Proper stopping position"
        }
      ],
      "createdAt": "2026-02-20T09:00:00Z",
      "updatedAt": "2026-02-20T09:30:00Z"
    },
    "licenceCategories": [
      { "id": 1, "code": "B", "name": "Light Vehicle" },
      { "id": 2, "code": "C", "name": "Medium Vehicle" }
    ],
    "createdAt": "2026-02-15T08:00:00Z",
    "updatedAt": "2026-02-20T10:00:00Z",
    "deletedAt": null
  }
}
```

### 1.2 Create Question (Step 1 - Basic Info Only)
```http
POST /api/v1/admin/questions
Content-Type: application/json
```

**Request Body**
```json
{
  "jurisdictionId": 1,
  "categoryId": 5,
  "question": "What should you do at a red traffic light?",
  "translations": {
    "en": { "question": "What should you do at a red traffic light?" },
    "am": { "question": "በቀይ የትራፊክ መብራት ላይ ምን ማድረግ አለብዎት?" },
    "ti": { "question": "ኣብ ቀይሕ መብራህቲ ትራፊክ እንታይ ክትገብር ኣለካ?" }
  },
  "active": true
}
```

**Response 201**
```json
{
  "success": true,
  "data": {
    "id": 101,
    "question": "What should you do at a red traffic light?",
    "jurisdictionId": 1,
    "categoryId": 5,
    "active": true,
    "options": [],
    "tips": [],
    "assets": [],
    "createdAt": "2026-02-21T10:00:00Z",
    "updatedAt": "2026-02-21T10:00:00Z"
  }
}
```

### 1.3 Update Question
```http
PATCH /api/v1/admin/questions/{questionId}
Content-Type: application/json
```

**Request Body**
```json
{
  "jurisdictionId": 1,
  "categoryId": 5,
  "question": "What should you do at a red traffic light?",
  "translations": {
    "en": { "question": "What should you do at a red traffic light?" },
    "am": { "question": "በቀይ የትራፊክ መብራት ላይ ምን ማድረግ አለብዎት?" }
  },
  "active": true
}
```

**Response 200**
```json
{
  "success": true,
  "data": { /* updated question */ }
}
```

### 1.4 Delete Question (Soft Delete)
```http
DELETE /api/v1/admin/questions/{questionId}
```

**Response 200**
```json
{
  "success": true,
  "message": "Question deleted successfully"
}
```

---

## 2. Question Assets

### 2.1 Upload Question Assets
```http
POST /api/v1/admin/questions/{questionId}/assets
Content-Type: multipart/form-data
```

**Form Fields**
- `files[]`: File[] (one or more files)
- `assetTypes[]`: string[] (image|video|document|diagram|illustration|question_image)
- `alts[]`: string[]
- `captions[]`: string[]

**Response 201**
```json
{
  "success": true,
  "data": {
    "uploadedAssets": [
      {
        "url": "https://cdn.example.com/q101-asset1.jpg",
        "type": "image",
        "alt": "Traffic light",
        "caption": "Figure 1"
      }
    ]
  }
}
```

### 2.2 Update Question Asset Metadata
```http
PATCH /api/v1/admin/questions/{questionId}/assets/metadata
Content-Type: application/json
```

**Request Body**
```json
{
  "assetUrl": "https://cdn.example.com/q101-asset1.jpg",
  "type": "image",
  "alt": "Updated alt text",
  "caption": "Updated caption"
}
```

### 2.3 Replace Question Asset File
```http
PUT /api/v1/admin/questions/{questionId}/assets/replace
Content-Type: multipart/form-data
```

**Form Fields**
- `assetUrl`: string (current asset URL to replace)
- `file`: File (new file)
- `type`: string (optional, defaults to existing)
- `alt`: string (optional, defaults to existing)
- `caption`: string (optional, defaults to existing)

### 2.4 Delete Question Asset
```http
DELETE /api/v1/admin/questions/{questionId}/assets?assetUrl={encodedUrl}
```

**Response 200**
```json
{
  "success": true,
  "message": "Asset deleted successfully"
}
```

---

## 3. Options CRUD

### 3.1 Create Option
```http
POST /api/v1/admin/questions/{questionId}/options
Content-Type: application/json
```

**Request Body**
```json
{
  "text": "Stop completely",
  "translations": {
    "en": { "text": "Stop completely" },
    "am": { "text": "ሙሉ በሙሉ ያቁሙ" },
    "ti": { "text": "ምሉእ ብምሉእ ደው በል" }
  },
  "isCorrect": true,
  "position": 1
}
```

**Response 201**
```json
{
  "success": true,
  "data": {
    "id": 501,
    "text": "Stop completely",
    "translations": {
      "en": { "text": "Stop completely" },
      "am": { "text": "ሙሉ በሙሉ ያቁሙ" },
      "ti": { "text": "ምሉእ ብምሉእ ደው በል" }
    },
    "isCorrect": true,
    "position": 1,
    "asset": null
  }
}
```

### 3.2 Update Option
```http
PATCH /api/v1/admin/options/{optionId}
Content-Type: application/json
```

**Request Body**
```json
{
  "text": "Stop completely",
  "translations": {
    "en": { "text": "Stop completely" },
    "am": { "text": "ሙሉ በሙሉ ያቁሙ" }
  },
  "isCorrect": true,
  "position": 1
}
```

### 3.3 Delete Option
```http
DELETE /api/v1/admin/options/{optionId}
```

### 3.4 Reorder Options (Atomic)
```http
PATCH /api/v1/admin/questions/{questionId}/options/reorder
Content-Type: application/json
```

**Request Body**
```json
{
  "optionOrders": [
    { "optionId": 501, "position": 1 },
    { "optionId": 502, "position": 2 },
    { "optionId": 503, "position": 3 }
  ]
}
```

---

## 4. Option Assets

### 4.1 Upload/Replace Option Image
```http
POST /api/v1/admin/options/{optionId}/image
Content-Type: multipart/form-data
```

**Form Fields**
- `file`: File
- `alt`: string (optional)
- `caption`: string (optional)

**Response 201**
```json
{
  "success": true,
  "data": {
    "url": "https://cdn.example.com/opt501-image.jpg",
    "type": "image",
    "alt": "Option illustration",
    "caption": ""
  }
}
```

### 4.2 Update Option Image Metadata
```http
PATCH /api/v1/admin/options/{optionId}/image/metadata
Content-Type: application/json
```

**Request Body**
```json
{
  "alt": "Updated alt text",
  "caption": "Updated caption"
}
```

### 4.3 Delete Option Image
```http
DELETE /api/v1/admin/options/{optionId}/image
```

---

## 5. Explanation CRUD

### 5.1 Get Explanation by Question
```http
GET /api/v1/admin/explanations/question/{questionId}
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": 201,
    "questionId": 101,
    "text": "Red traffic lights require all vehicles to stop completely.",
    "translations": {
      "en": { "text": "Red traffic lights require all vehicles to stop completely." },
      "am": { "text": "ቀይ የትራፊክ መብራቶች ሁሉም ተሽከርካሪዎች ሙሉ በሙሉ እንዲቆሙ ይጠይቃሉ።" }
    },
    "assets": [],
    "createdAt": "2026-02-20T09:00:00Z",
    "updatedAt": "2026-02-20T09:30:00Z"
  }
}
```

### 5.2 Create Explanation
```http
POST /api/v1/admin/explanations
Content-Type: application/json
```

**Request Body**
```json
{
  "questionId": 101,
  "text": "Red traffic lights require all vehicles to stop completely before the stop line or intersection.",
  "translations": {
    "en": { "text": "Red traffic lights require all vehicles to stop completely before the stop line or intersection." },
    "am": { "text": "ቀይ የትራፊክ መብራቶች ሁሉም ተሽከርካሪዎች ከማቆሚያ መስመር ወይም መገናኛ በፊት ሙሉ በሙሉ እንዲቆሙ ይጠይቃሉ።" }
  }
}
```

**Response 201**
```json
{
  "success": true,
  "data": {
    "id": 201,
    "questionId": 101,
    "text": "Red traffic lights require all vehicles to stop completely before the stop line or intersection.",
    "translations": { /* ... */ },
    "assets": [],
    "createdAt": "2026-02-21T10:00:00Z",
    "updatedAt": "2026-02-21T10:00:00Z"
  }
}
```

### 5.3 Update Explanation
```http
PATCH /api/v1/admin/explanations/{explanationId}
Content-Type: application/json
```

**Request Body**
```json
{
  "text": "Updated explanation text",
  "translations": {
    "en": { "text": "Updated explanation text" },
    "am": { "text": "የዘመነ ማብራሪያ ጽሑፍ" }
  }
}
```

### 5.4 Delete Explanation
```http
DELETE /api/v1/admin/explanations/{explanationId}
```

---

## 6. Explanation Assets

### 6.1 Upload Explanation Assets
```http
POST /api/v1/admin/explanations/{explanationId}/assets
Content-Type: multipart/form-data
```

**Form Fields**
- `files[]`: File[]
- `assetTypes[]`: string[]
- `alts[]`: string[]
- `captions[]`: string[]

### 6.2 Update Explanation Asset Metadata
```http
PATCH /api/v1/admin/explanations/{explanationId}/assets/metadata
Content-Type: application/json
```

**Request Body**
```json
{
  "assetUrl": "https://cdn.example.com/exp201-diagram.png",
  "type": "diagram",
  "alt": "Updated alt",
  "caption": "Updated caption"
}
```

### 6.3 Replace Explanation Asset File
```http
PUT /api/v1/admin/explanations/{explanationId}/assets/replace
Content-Type: multipart/form-data
```

**Form Fields**
- `assetUrl`: string
- `file`: File
- `type`: string (optional)
- `alt`: string (optional)
- `caption`: string (optional)

### 6.4 Delete Explanation Asset
```http
DELETE /api/v1/admin/explanations/{explanationId}/assets?assetUrl={encodedUrl}
```

---

## 7. Tips CRUD

### 7.1 Create Tip
```http
POST /api/v1/admin/questions/{questionId}/tips
Content-Type: application/json
```

**Request Body**
```json
{
  "tip": "Always come to a complete stop at red lights, even if no traffic is visible.",
  "translations": {
    "en": { "tip": "Always come to a complete stop at red lights, even if no traffic is visible." },
    "am": { "tip": "ምንም ትራፊክ ባይታይም በቀይ መብራቶች ላይ ሁልጊዜ ሙሉ በሙሉ ይቁሙ።" },
    "ti": { "tip": "ዝኾነ ትራፊክ እንተዘይረአየ እውን፡ ኣብ ቀይሕ መብራህቲ ኩሉ ግዜ ምሉእ ብምሉእ ደው በል።" }
  }
}
```

**Response 201**
```json
{
  "success": true,
  "data": {
    "id": 301,
    "tip": "Always come to a complete stop at red lights, even if no traffic is visible.",
    "translations": { /* ... */ },
    "createdAt": "2026-02-21T10:00:00Z",
    "updatedAt": "2026-02-21T10:00:00Z"
  }
}
```

### 7.2 Update Tip
```http
PATCH /api/v1/admin/tips/{tipId}
Content-Type: application/json
```

**Request Body**
```json
{
  "tip": "Updated tip text",
  "translations": {
    "en": { "tip": "Updated tip text" },
    "am": { "tip": "የዘመነ ምክር ጽሑፍ" }
  }
}
```

### 7.3 Delete Tip
```http
DELETE /api/v1/admin/tips/{tipId}
```

---

## 8. Validation Rules

### Server-Side Validation
- **Question text**: Minimum 10 characters
- **Option count**: 2-6 options per question
- **Correct options**: Exactly one option must be marked as correct
- **Option positions**: Must be unique and contiguous (1, 2, 3, ...)
- **Tip text**: Minimum 10 characters
- **Explanation text**: Minimum 20 characters
- **File size**: Maximum 10MB per file
- **Allowed file types**:
  - Images: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/svg+xml`
  - Videos: `video/mp4`, `video/webm`, `video/ogg`
  - Documents: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

---

## 9. Error Responses

### Standard Error Envelope
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Exactly one option must be marked as correct",
    "details": [
      {
        "field": "options",
        "message": "Exactly one option must be correct"
      }
    ]
  },
  "requestId": "4f4f7d2a-8c3e-4b5a-9d1f-2e3c4d5e6f7a"
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Request validation failed
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Missing or invalid authentication
- `FORBIDDEN`: Insufficient permissions (not ADMIN role)
- `CONFLICT`: Resource conflict (e.g., duplicate position)
- `FILE_TOO_LARGE`: Uploaded file exceeds size limit
- `UNSUPPORTED_FILE_TYPE`: File type not allowed

---

## 10. Frontend Workflow

### Recommended Sequence for Detail Page

1. **Load Question Detail**
   ```
   GET /api/v1/admin/questions/{id}
   ```

2. **Display Read-Only Summary**
   - Question text + metadata
   - Question assets (with delete buttons)
   - Options list (with edit/delete buttons)
   - Tips list (with edit/delete buttons)
   - Explanation (with edit/delete button)
   - Explanation assets (with delete buttons)

3. **Action Buttons**
   - **Edit Question**: Opens question edit dialog → `PATCH /questions/{id}`
   - **Delete Question**: Confirms → `DELETE /questions/{id}`
   - **Add Option**: Opens option create dialog → `POST /questions/{id}/options`
   - **Edit Option**: Opens option edit dialog → `PATCH /options/{id}`
   - **Delete Option**: Confirms → `DELETE /options/{id}`
   - **Add Tip**: Opens tip create dialog → `POST /questions/{id}/tips`
   - **Edit Tip**: Opens tip edit dialog → `PATCH /tips/{id}`
   - **Delete Tip**: Confirms → `DELETE /tips/{id}`
   - **Add/Edit Explanation**: Opens explanation dialog → `POST /explanations` or `PATCH /explanations/{id}`
   - **Delete Explanation**: Confirms → `DELETE /explanations/{id}`
   - **Upload Asset**: File input → `POST /questions/{id}/assets` or `/explanations/{id}/assets`
   - **Delete Asset**: Confirms → `DELETE /questions/{id}/assets` or `/explanations/{id}/assets`

4. **After Each Mutation**
   - Re-fetch question detail to refresh UI
   - Display success/error feedback

---

## 11. Pagination & Filtering

### List Questions with Filters
```http
GET /api/v1/admin/questions?page=0&size=20&categoryId=5&jurisdictionId=1&licenceCategoryId=1&active=true
```

**Query Parameters**
- `page`: number (0-indexed)
- `size`: number (default 20, max 100)
- `categoryId`: number (optional)
- `jurisdictionId`: number (optional)
- `licenceCategoryId`: number (optional)
- `active`: boolean (optional)
- `search`: string (optional, searches question text and ID)

**Response 200**
```json
{
  "success": true,
  "data": {
    "content": [ /* array of questions */ ],
    "page": 0,
    "size": 20,
    "totalElements": 150,
    "totalPages": 8,
    "first": true,
    "last": false
  }
}
```

---

## 12. Notes

- All timestamps are in ISO 8601 format (UTC)
- Soft deletes set `deletedAt` timestamp; resources remain queryable by ID but excluded from lists
- Asset URLs are CDN URLs (e.g., Cloudflare R2) with long-lived signed URLs or public access
- Translations are optional; if not provided, the primary language (English) text is used
- File uploads use `multipart/form-data` with array fields for batch operations
- All mutation operations return the updated resource in the response
