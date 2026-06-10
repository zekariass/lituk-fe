# Tip Admin Management API

## Overview

Admin endpoints for managing question tips. Tips are short hints or advice attached to a question to help learners understand the correct answer. Each tip supports multilingual translations.

## Base Configuration

- **Base URL**: `/api/v1`
- **Authentication**: `Authorization: Bearer <JWT>`
- **Required Role**: `ADMIN`
- **Content-Type**: `application/json`

---

## 1. Fetch Tips by Question

Retrieves all tips associated with a specific question.

```http
GET /api/v1/questions/{questionId}/tips
```

**Path Parameters**

| Parameter    | Type   | Description                  |
|--------------|--------|------------------------------|
| `questionId` | number | ID of the parent question    |

**Response 200**

```json
{
  "success": true,
  "data": [
    {
      "id": 301,
      "questionId": 101,
      "title": "Red Light Rule",
      "body": "Always come to a complete stop at red lights, even if no traffic is visible.",
      "translations": {
        "en": {
          "title": "Red Light Rule",
          "body": "Always come to a complete stop at red lights.",
          "tip": "Always come to a complete stop at red lights."
        },
        "am": {
          "tip": "ምንም ትራፊክ ባይታይም በቀይ መብራቶች ላይ ሁልጊዜ ሙሉ በሙሉ ይቁሙ።"
        }
      },
      "assets": [],
      "order": 1,
      "active": true,
      "createdAt": "2026-02-20T10:00:00Z",
      "updatedAt": "2026-02-20T10:00:00Z"
    }
  ]
}
```

**Response Object — `QuestionTip`**

| Field          | Type     | Description                                                        |
|----------------|----------|--------------------------------------------------------------------|
| `id`           | number   | Unique tip identifier                                              |
| `questionId`   | number   | ID of the parent question                                          |
| `title`        | string   | Tip title (primary language)                                       |
| `body`         | string   | Tip body text (primary language)                                   |
| `translations` | object   | Locale-keyed object with optional `title`, `body`, and `tip` fields|
| `assets`       | array    | Attached assets (images, diagrams, etc.)                           |
| `order`        | number   | Display order among the question's tips                            |
| `active`       | boolean  | Whether the tip is active                                          |
| `createdAt`    | string   | ISO 8601 creation timestamp                                       |
| `updatedAt`    | string?  | ISO 8601 last-update timestamp                                    |

---

## 2. Create Tip

Adds a new tip to a question. The primary-language text is sent in the `tip` field; additional languages go into `translations`.

```http
POST /api/v1/admin/questions/{questionId}/tips
Content-Type: application/json
```

**Path Parameters**

| Parameter    | Type   | Description               |
|--------------|--------|---------------------------|
| `questionId` | number | ID of the parent question |

**Request Body — `AddTipRequest`**

```json
{
  "tip": "Always come to a complete stop at red lights, even if no traffic is visible.",
  "translations": {
    "am": { "tip": "ምንም ትራፊክ ባይታይም በቀይ መብራቶች ላይ ሁልጊዜ ሙሉ በሙሉ ይቁሙ።" },
    "ti": { "tip": "ዝኾነ ትራፊክ እንተዘይረአየ እውን፡ ኣብ ቀይሕ መብራህቲ ኩሉ ግዜ ምሉእ ብምሉእ ደው በል።" }
  }
}
```

| Field          | Type    | Required | Description                                          |
|----------------|---------|----------|------------------------------------------------------|
| `tip`          | string  | Yes      | Tip text in the primary language (min 10 characters)  |
| `translations` | object? | No       | Locale-keyed object, each value has `{ tip: string }` |

**Response 201**

```json
{
  "success": true,
  "data": {
    "id": 301,
    "tip": "Always come to a complete stop at red lights, even if no traffic is visible.",
    "translations": {
      "am": { "tip": "ምንም ትራፊክ ባይታይም በቀይ መብራቶች ላይ ሁልጊዜ ሙሉ በሙሉ ይቁሙ።" },
      "ti": { "tip": "ዝኾነ ትራፊክ እንተዘይረአየ እውን፡ ኣብ ቀይሕ መብራህቲ ኩሉ ግዜ ምሉእ ብምሉእ ደው በል።" }
    },
    "createdAt": "2026-02-21T10:00:00Z",
    "updatedAt": "2026-02-21T10:00:00Z"
  }
}
```

---

## 3. Update Tip

Partially updates an existing tip's text and/or translations.

```http
PATCH /api/v1/admin/tips/{tipId}
Content-Type: application/json
```

**Path Parameters**

| Parameter | Type   | Description              |
|-----------|--------|--------------------------|
| `tipId`   | number | ID of the tip to update  |

**Request Body — `UpdateTipRequest`**

```json
{
  "tip": "Updated tip text with more detail.",
  "translations": {
    "am": { "tip": "የዘመነ ምክር ጽሑፍ" }
  }
}
```

| Field          | Type    | Required | Description                                          |
|----------------|---------|----------|------------------------------------------------------|
| `tip`          | string? | No       | Updated tip text in the primary language              |
| `translations` | object? | No       | Locale-keyed object, each value has `{ tip?: string }`|

**Response 200**

```json
{
  "success": true,
  "data": {
    "id": 301,
    "tip": "Updated tip text with more detail.",
    "translations": {
      "am": { "tip": "የዘመነ ምክር ጽሑፍ" }
    },
    "createdAt": "2026-02-20T10:00:00Z",
    "updatedAt": "2026-02-21T12:00:00Z"
  }
}
```

---

## 4. Delete Tip

Permanently removes a tip from the system.

```http
DELETE /api/v1/admin/tips/{tipId}
```

**Path Parameters**

| Parameter | Type   | Description              |
|-----------|--------|--------------------------|
| `tipId`   | number | ID of the tip to delete  |

**Response 200**

```json
{
  "success": true,
  "message": "Tip deleted successfully"
}
```

---

## Validation Rules

| Rule              | Constraint                |
|-------------------|---------------------------|
| Tip text length   | Minimum 10 characters     |
| Translations      | Optional per locale       |

---

## Error Responses

All endpoints return a standard error envelope on failure:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Tip must be at least 10 characters.",
    "details": [
      { "field": "tip", "message": "Tip must be at least 10 characters" }
    ]
  }
}
```

**Common Error Codes**

| Code                   | Description                                |
|------------------------|--------------------------------------------|
| `VALIDATION_ERROR`     | Request body failed validation             |
| `NOT_FOUND`            | Tip or question not found                  |
| `UNAUTHORIZED`         | Missing or invalid JWT token               |
| `FORBIDDEN`            | User does not have ADMIN role              |

---

## Frontend Store Actions

Reference: `lib/store/admin-store.ts`

| Action              | Method | Endpoint                                        |
|---------------------|--------|-------------------------------------------------|
| `fetchTipsByQuestion` | GET    | `/api/v1/questions/{questionId}/tips`           |
| `addTip`            | POST   | `/api/v1/admin/questions/{questionId}/tips`      |
| `updateTip`         | PATCH  | `/api/v1/admin/tips/{tipId}`                     |
| `deleteTip`         | DELETE | `/api/v1/admin/tips/{tipId}`                     |
