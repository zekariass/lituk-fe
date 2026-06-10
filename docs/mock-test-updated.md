# Mock Test Submission API — Frontend Implementation Guide

This document describes exactly what the frontend must send when a user submits a mock test, and what changed when the platform moved from **single answer per question** to **multiple answers per question**.

---

## What changed (old vs new)

| Aspect | Old (before multi-answer) | New (current) |
|--------|---------------------------|---------------|
| Answer field | `selectedOptionId: number` (single value) | `selectedOptionIds: number[]` (array) |
| Time field on bulk submit | `durationSeconds: number` | `timeTakenSeconds: number` |
| Single-question answer key | `questionId: number` | `itemId: number` |
| Answer payload shape | `{ questionId, selectedOptionId }` | `{ questionId, selectedOptionIds: [...], timeTakenSeconds? }` |
| Result fields | `selectedOptionId`, `correctOptionId` | `selectedOptionIds[]`, `correctOptionIds[]`, plus text arrays |

> **Important:** The array must be **non-empty**. Even when a question only has one correct option, you must send a single-element array (e.g., `[3]`).

---

## Endpoints that accept answers

### 1) Submit all answers at once (no prior test record)

**`POST /api/v1/mock-tests/submit`**

Use this when the frontend sampled questions itself and now wants to create a completed mock test in one shot.

**Request body:** `SubmitMockTestAnswersRequest`

```json
{
  "jurisdictionId": 1,
  "licenceCategoryId": 1,
  "timeTakenSeconds": 1200,
  "answers": [
    {
      "questionId": 1,
      "selectedOptionIds": [3],
      "timeTakenSeconds": 12
    },
    {
      "questionId": 2,
      "selectedOptionIds": [1, 4],
      "timeTakenSeconds": 8
    }
  ]
}
```

**Field rules:**
- `jurisdictionId` — required `number`
- `licenceCategoryId` — required `number`
- `timeTakenSeconds` — required `number` (total test time in seconds)
- `answers` — required non-empty array
  - `questionId` — required `number`
  - `selectedOptionIds` — required non-empty array of `number`
  - `timeTakenSeconds` — optional `number` (per-question time)

**Response:** `ApiResponse<SubmitMockTestAnswersResponse>` (HTTP 201 Created)

```json
{
  "success": true,
  "data": {
    "mockTestId": 42,
    "status": "completed",
    "totalQuestions": 50,
    "answeredQuestions": 50,
    "correctAnswers": 45,
    "incorrectAnswers": 5,
    "score": 90,
    "passingScore": 86,
    "passed": true,
    "timeTakenSeconds": 1200,
    "completedAt": "2026-06-08T12:00:00Z",
    "categoryBreakdown": [
      {
        "categoryId": 1,
        "categoryName": "Road signs",
        "totalQuestions": 10,
        "correctAnswers": 9,
        "accuracyRate": 90.0
      }
    ],
    "results": [
      {
        "questionId": 1,
        "questionText": "What does this sign mean?",
        "selectedOptionIds": [3],
        "selectedOptionTexts": ["Stop"],
        "correctOptionIds": [3],
        "correctOptionTexts": ["Stop"],
        "isCorrect": true,
        "explanation": "A stop sign means you must come to a complete halt.",
        "timeTakenSeconds": 12
      },
      {
        "questionId": 2,
        "questionText": "Which of these are valid?",
        "selectedOptionIds": [1, 4],
        "selectedOptionTexts": ["Yield", "Keep left"],
        "correctOptionIds": [1, 4],
        "correctOptionTexts": ["Yield", "Keep left"],
        "isCorrect": true,
        "explanation": "Both options are correct under regulation 12.",
        "timeTakenSeconds": 8
      }
    ]
  }
}
```

---

### 2) Submit or update a single question answer (during a tracked test)

**`POST /api/v1/mock-tests/{id}/answer`**

Use this when the user is taking a test that was already started (`CreateMockTest` flow) and you want to save one answer at a time.

**Request body:** `AnswerQuestionRequest`

```json
{
  "itemId": 1001,
  "selectedOptionIds": [3, 7]
}
```

**Field rules:**
- `itemId` — required `number` (this is the **mock test item ID**, not the question ID)
- `selectedOptionIds` — required non-empty array of `number`

**Response:** `ApiResponse<AnswerQuestionResponse>`

```json
{
  "success": true,
  "data": {
    "itemId": 1001,
    "questionId": 123,
    "selectedOptionIds": [3, 7],
    "answeredAt": "2026-06-08T12:05:00Z",
    "totalAnswered": 10,
    "canSubmit": true
  }
}
```

---

### 3) Submit and complete an existing mock test

**`POST /api/v1/mock-tests/{id}/submit`**

Use this to finalize a test that was created earlier. The body includes any remaining or updated answers.

**Request body:** `SubmitMockTestRequest`

```json
{
  "answers": [
    {
      "questionId": 1,
      "selectedOptionIds": [3],
      "timeTakenSeconds": 12
    },
    {
      "questionId": 2,
      "selectedOptionIds": [1, 4],
      "timeTakenSeconds": 8
    }
  ]
}
```

**Field rules:**
- `answers` — required non-empty array
  - `questionId` — required `number`
  - `selectedOptionIds` — required non-empty array of `number`
  - `timeTakenSeconds` — required `number`

---

## Reading back saved answers

When resuming a test or fetching questions for an existing test, saved selections are returned as arrays.

### `GET /api/v1/mock-tests/{id}/questions`

```json
{
  "mockTestId": 42,
  "totalQuestions": 50,
  "questions": [
    {
      "itemId": 1001,
      "order": 1,
      "question": { ... },
      "options": [ ... ],
      "selectedOptionIds": [3],
      "answeredAt": "2026-06-08T12:05:00Z"
    }
  ]
}
```

### `GET /api/v1/mock-tests/{id}/results`

```json
{
  "id": 42,
  "passed": true,
  "score": 90,
  ...
  "questions": [
    {
      "itemId": 1001,
      "order": 1,
      "question": { ... },
      "selectedOptions": [
        { "id": 3, "text": "Stop", ... }
      ],
      "correctOptions": [
        { "id": 3, "text": "Stop", ... }
      ],
      "isCorrect": true,
      "explanation": { ... }
    }
  ]
}
```

---

## Frontend behavior requirements

1. **Always send arrays**
   - Never send `selectedOptionId` as a scalar.
   - For single-select questions, wrap the chosen option in an array: `[id]`.

2. **Prevent empty submissions**
   - Do not allow the user to submit an answer with `selectedOptionIds: []`.
   - The backend will reject it with a validation error.

3. **Multi-select UI**
   - Use checkbox-style toggles instead of radio buttons for all questions.
   - Tapping an option adds or removes its ID from `selectedOptionIds`.
   - The backend decides correctness; the frontend does not need to know whether a question has one or many correct answers.

4. **Order independence**
   - The order of IDs in `selectedOptionIds` does not matter.
   - The backend treats the list as a set.

5. **Resuming a test**
   - When `GET /{id}/questions` returns `selectedOptionIds`, pre-select those options in the UI.

---

## Quick migration from old types

```ts
// Before
interface OldAnswerPayload {
  questionId: number;
  selectedOptionId: number;
}

// After
interface NewAnswerPayload {
  questionId: number;
  selectedOptionIds: number[];
  timeTakenSeconds?: number;
}
```

Update every call site that builds answer objects for:
- `POST /api/v1/mock-tests/submit`
- `POST /api/v1/mock-tests/{id}/answer`
- `POST /api/v1/mock-tests/{id}/submit`
