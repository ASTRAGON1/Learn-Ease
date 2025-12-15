# Field Naming Conventions & Consistency Guide

## Purpose
This document ensures consistent field naming across all models to prevent conflicts and confusion.

## Core Principle
**Each field name should have ONE specific meaning across the entire application.**

---

## Field Naming Standards

### 1. **Path/Category Type Fields** (Learning Path Type)
- **Field Name:** `type`
- **Used In:** Path, Student
- **Values:** `'autism'`, `'downSyndrome'`, `'other'` (Student only)
- **Purpose:** Identifies which learning path type (Autism or Down Syndrome)

**Models:**
```javascript
// Path Model - PRIMARY
type: {
  type: String,
  enum: ['autism', 'downSyndrome']
}

// Student Model
type: {
  type: String,
  enum: ['autism', 'downSyndrome', 'other']
}
```

---

### 2. **Path Type in Content & Quiz** (To avoid conflict with file type)
- **Field Name:** `pathType`
- **Used In:** Content, Quiz
- **Values:** `'autism'`, `'downSyndrome'`
- **Purpose:** Links content/quiz to a specific learning path type
- **Why different from Path?** Because Content needs both path type AND file type

**Models:**
```javascript
// Content Model
pathType: {
  type: String,
  enum: ['autism', 'downSyndrome']
}

// Quiz Model
pathType: {
  type: String,
  enum: ['autism', 'downSyndrome']
}
```

---

### 3. **Content/File Type Fields** (Video, Document, Image)
- **Field Name:** `contentType`
- **Used In:** Content
- **Values:** `'video'`, `'document'`, `'image'`
- **Purpose:** Identifies the type of file/content being uploaded

**Models:**
```javascript
// Content Model ONLY
contentType: {
  type: String,
  enum: ['video', 'document', 'image']
}
```

---

### 4. **Post Category** (Community Posts)
- **Field Name:** `category`
- **Used In:** Post
- **Values:** Various post categories
- **Purpose:** Categorizes community forum posts
- **Note:** This is separate from learning path types

**Models:**
```javascript
// Post Model ONLY
category: {
  type: String,
  // Post-specific categories
}
```

---

### 5. **Reference ID Fields** (Consistent naming)
All ObjectId references follow this pattern:

| Reference To | Field Name | Type |
|--------------|-----------|------|
| Path | `pathId` | ObjectId |
| Course | `courseId` | ObjectId |
| Topic | `topicId` | ObjectId |
| Lesson | `lessonId` | ObjectId |
| Teacher | `teacher` | ObjectId |
| Student | `student` | ObjectId |

---

## Model Summary

### Path Model
```javascript
{
  type: String,              // 'autism' | 'downSyndrome'
  title: String,
  courses: [ObjectId],
  estimatedDuration: Number,
  isPublished: Boolean
}
```

### Course Model
```javascript
{
  title: String,
  pathId: ObjectId,          // References Path
  topics: [ObjectId],
  order: Number,
  isPublished: Boolean
}
```

### Topic Model
```javascript
{
  title: String,
  courseId: ObjectId,        // References Course
  pathId: ObjectId,          // References Path
  lessons: [ObjectId],
  order: Number
}
```

### Lesson Model
```javascript
{
  title: String,
  topicId: ObjectId,         // References Topic
  courseId: ObjectId,        // References Course
  pathId: ObjectId,          // References Path
  order: Number,
  duration: Number
}
```

### Content Model
```javascript
{
  teacher: ObjectId,         // References Teacher
  title: String,
  pathType: String,          // 'autism' | 'downSyndrome'
  contentType: String,       // 'video' | 'document' | 'image'
  topic: String,
  lesson: String,
  course: String,
  pathId: ObjectId,
  courseId: ObjectId,
  topicId: ObjectId,
  lessonId: ObjectId,
  description: String,
  difficulty: String,        // 'Easy' | 'Medium' | 'Hard'
  status: String,            // 'draft' | 'published' | 'archived' | 'deleted'
  fileURL: String,
  storagePath: String,
  fileType: String,
  size: Number,
  // ... other fields
}
```

### Quiz Model
```javascript
{
  teacher: ObjectId,         // References Teacher
  title: String,
  pathType: String,          // 'autism' | 'downSyndrome'
  topic: String,
  lesson: String,
  course: String,
  pathId: ObjectId,
  courseId: ObjectId,
  topicId: ObjectId,
  lessonId: ObjectId,
  difficulty: String,        // 'Easy' | 'Medium' | 'Hard'
  status: String,            // 'draft' | 'published' | 'archived'
  questionsAndAnswers: [{
    question: String,
    correctAnswer: String,
    wrongAnswers: [String]
  }],
  // ... other fields
}
```

### Student Model
```javascript
{
  name: String,
  email: String,
  pass: String,
  type: String,              // 'autism' | 'downSyndrome' | 'other'
  avatar: String,
  status: String,            // 'active' | 'inactive'
  suspended: Boolean,
  assignedPath: String,
  isOnline: Boolean,
  lastActivity: Date,
  createdAt: Date
}
```

---

## API Field Mapping

### Frontend → Backend Mapping

When the frontend sends data, it uses user-friendly names:
- `category` → Backend converts to → `pathType` (for Content/Quiz)
- `type` → Backend converts to → `contentType` (for Content)

**Example:**
```javascript
// Frontend sends:
{
  category: "Autism",        // User-friendly
  type: "document"           // File type
}

// Backend stores:
{
  pathType: "autism",        // Normalized
  contentType: "document"    // Normalized
}
```

---

## Migration Notes

If you have existing data with old field names:

1. **Old Content/Quiz with `category` field:**
   - Already migrated to `pathType`

2. **Old Content with `type` field for file type:**
   - Already migrated to `contentType`

---

## Rules for New Fields

1. **Never reuse field names** with different meanings across models
2. **Use descriptive names** that clearly indicate purpose
3. **Suffix with 'Id'** for all ObjectId references
4. **Use lowercase** for enum values (except difficulty levels)
5. **Document any exceptions** in this file

---

## Common Pitfalls to Avoid

❌ **DON'T:**
- Use `type` for multiple purposes (path type AND file type)
- Use `category` inconsistently (learning path vs post category)
- Mix reference styles (`courseId` vs `course_id` vs `courseRef`)

✅ **DO:**
- Use specific names: `pathType`, `contentType`, `postCategory`
- Be consistent with reference naming: always use `Id` suffix
- Document any new fields here

---

## Validation

All enum values must match exactly:
- Learning Path Types: `'autism'`, `'downSyndrome'`
- Content Types: `'video'`, `'document'`, `'image'`
- Difficulty Levels: `'Easy'`, `'Medium'`, `'Hard'` (Capitalized!)
- Status Values: `'draft'`, `'published'`, `'archived'`, `'deleted'`

---

Last Updated: December 14, 2025
