# Database Schema Update: ObjectId References (CLEAN VERSION)

## Overview
Updated the `Quiz` and `Content` models to use **ONLY** ObjectId references for `path`, `course`, `topic`, and `lesson` fields. All deprecated fields have been removed for a clean schema.

## Final Schema

### Quiz Model (`server/models/Quiz.js`)

```javascript
{
  teacher: { type: ObjectId, ref: 'Teacher', required: true },
  title: { type: String, required: true },
  // ObjectId References (REQUIRED)
  path: { type: ObjectId, ref: 'Path', required: true },
  course: { type: ObjectId, ref: 'Course', required: true },
  topic: { type: ObjectId, ref: 'Topic', required: true },
  lesson: { type: ObjectId, ref: 'Lesson', required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  questionsAndAnswers: [{ ... }],
  releaseDate: { type: Date, default: Date.now }
}
```

### Content Model (`server/models/Content.js`)

```javascript
{
  teacher: { type: ObjectId, ref: 'Teacher', required: true },
  title: { type: String, required: true },
  // ObjectId References (REQUIRED)
  path: { type: ObjectId, ref: 'Path', required: true },
  course: { type: ObjectId, ref: 'Course', required: true },
  topic: { type: ObjectId, ref: 'Topic', required: true },
  lesson: { type: ObjectId, ref: 'Lesson', required: true },
  contentType: { type: String, enum: ['video', 'document', 'image'], required: true },
  description: { type: String },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'] },
  status: { type: String, enum: ['draft', 'published', 'archived', 'deleted'], default: 'draft' },
  fileURL: { type: String, required: true },
  // ... other file-related fields
}
```

## Controller Updates

### Quiz Controller (`server/controllers/quizController.js`)
- **Requires**: `pathId`, `courseId`, `topicId`, `lessonId` in request body
- **Validates**: All IDs are provided
- **Stores**: Only ObjectId references (no deprecated fields)

### Storage Controller (`server/controllers/storageController.js`)
- **Requires**: `pathId`, `courseId`, `topicId`, `lessonId` in request body
- **Validates**: All IDs are valid ObjectIds
- **Stores**: Only ObjectId references (no deprecated fields)

## Benefits

### 1. **Clean Schema**
- No deprecated fields
- Single source of truth
- Easier to maintain

### 2. **Proper Database Relationships**
```javascript
// Query all quizzes for a specific path
Quiz.find({ path: pathObjectId })

// Query all content for a specific lesson
Content.find({ lesson: lessonObjectId })

// Populate to get full details
Quiz.find().populate('path course topic lesson')
```

### 3. **Better Performance**
- Indexed ObjectId fields are faster than string matching
- Efficient joins using `$lookup`

### 4. **Referential Integrity**
```javascript
// Can implement cascading operations
// When a lesson is deleted, can handle related content/quizzes
```

## Database Indexes

**Quiz:**
- `teacher`, `path`, `course`, `topic`, `lesson`, `status`

**Content:**
- `teacher`, `path`, `contentType`, `course`, `topic`, `lesson`, `status`, `difficulty`

## Frontend Requirements

### Request Format
```javascript
{
  title: "Quiz Title",
  pathId: "693b6c3cd9ef5aced1d2955c",      // REQUIRED ObjectId
  courseId: "693b6c45d9ef5aced1d295eb",    // REQUIRED ObjectId  
  topicId: "693b6c45d9ef5aced1d295ea",     // REQUIRED ObjectId
  lessonId: "693b6c45d9ef5aced1d295ea",    // REQUIRED ObjectId
  difficulty: "Easy",
  questionsAndAnswers: [...]
}
```

### Current Implementation
✅ **AIQuiz2.jsx** - Sends IDs via `getSelectedIds`
✅ **InstructorUpload2.jsx** - Sends IDs via `getSelectedIds`

## Example Queries

### Find by ObjectId
```javascript
// Find all quizzes for a specific course
Quiz.find({ course: ObjectId("693b6c45d9ef5aced1d295eb") })

// Find all content for a specific topic
Content.find({ topic: ObjectId("693b6c45d9ef5aced1d295ea") })
```

### With Population
```javascript
Quiz.find()
  .populate('path', 'title type')
  .populate('course', 'title')
  .populate('topic', 'title')
  .populate('lesson', 'title')
  .exec()
```

### Aggregation Pipeline
```javascript
Quiz.aggregate([
  {
    $lookup: {
      from: 'Path',
      localField: 'path',
      foreignField: '_id',
      as: 'pathDetails'
    }
  },
  {
    $lookup: {
      from: 'Lesson',
      localField: 'lesson',
      foreignField: '_id',
      as: 'lessonDetails'
    }
  }
])
```

## Migration Notes

**Old documents** (with string fields like `pathType: "autism"`, `topic: "Listening 2"`) will need to be migrated or removed. The new schema only accepts ObjectId references.

## Summary

✅ **Clean schema** - No deprecated fields
✅ **Proper references** - All curriculum relationships use ObjectIds  
✅ **Better queries** - Faster and more efficient
✅ **Data integrity** - Enforceable relationships
✅ **Inheritance ready** - Full database relationship hierarchy
