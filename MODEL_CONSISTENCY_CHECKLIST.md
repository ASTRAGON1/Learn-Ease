# Model Consistency Checklist ✅

## Quick Reference: Field Name Usage

| Field Name | Models Using It | Purpose | Values |
|------------|----------------|---------|---------|
| `type` | Path, Student | Learning path type | `'autism'`, `'downSyndrome'`, `'other'` |
| `pathType` | Content, Quiz | Learning path type (avoiding conflict) | `'autism'`, `'downSyndrome'` |
| `contentType` | Content | File/media type | `'video'`, `'document'`, `'image'` |
| `category` | Post | Post category | Various string values |
| `pathId` | Course, Topic, Lesson, Content, Quiz | Reference to Path | ObjectId |
| `courseId` | Topic, Lesson, Content, Quiz | Reference to Course | ObjectId |
| `topicId` | Lesson, Content, Quiz | Reference to Topic | ObjectId |
| `lessonId` | Content, Quiz | Reference to Lesson | ObjectId |
| `teacher` | Content, Quiz | Reference to Teacher | ObjectId |
| `student` | StudentProgress, etc. | Reference to Student | ObjectId |

---

## ✅ Consistency Rules

### Rule 1: No Field Name Conflicts
- **`type`** is ONLY used for learning path types (Path, Student models)
- **`contentType`** is ONLY used for file types (Content model)
- **`category`** is ONLY used for post categories (Post model)
- **`pathType`** is used when a model needs both path type AND another type field

### Rule 2: ObjectId Reference Naming
All ObjectId references MUST follow this pattern:
```
[modelName] + "Id"
```

Examples:
- Path reference: `pathId`
- Course reference: `courseId`
- Topic reference: `topicId`
- Lesson reference: `lessonId`

Exception: Teacher and Student use just `teacher` and `student` (no "Id" suffix)

### Rule 3: Enum Value Consistency

#### Learning Path Types (MUST be lowercase):
```javascript
['autism', 'downSyndrome', 'other']
```

#### Content/File Types (MUST be lowercase):
```javascript
['video', 'document', 'image']
```

#### Difficulty Levels (MUST be capitalized):
```javascript
['Easy', 'Medium', 'Hard']
```

#### Status Values (MUST be lowercase):
```javascript
// Content
['draft', 'published', 'archived', 'deleted']

// Quiz
['draft', 'published', 'archived']

// Student
['active', 'inactive']

// Teacher
['pending', 'active', 'suspended']
```

---

## 🔍 Model Validation Checklist

### Path Model ✅
```javascript
{
  type: String,              // ✅ Learning path type
  title: String,             // ✅ Clear purpose
  courses: [ObjectId],       // ✅ Array of references
  estimatedDuration: Number, // ✅ Descriptive
  isPublished: Boolean       // ✅ Clear boolean
}
```
**Indexes:** `type`, `isPublished`

---

### Course Model ✅
```javascript
{
  title: String,             // ✅ Clear purpose
  pathId: ObjectId,          // ✅ Follows naming convention
  topics: [ObjectId],        // ✅ Array of references
  order: Number,             // ✅ For sorting
  isPublished: Boolean       // ✅ Clear boolean
}
```
**Indexes:** `pathId`, `order`, `isPublished`

---

### Topic Model ✅
```javascript
{
  title: String,             // ✅ Clear purpose
  courseId: ObjectId,        // ✅ Follows naming convention
  pathId: ObjectId,          // ✅ Follows naming convention
  lessons: [ObjectId],       // ✅ Array of references
  order: Number              // ✅ For sorting
}
```
**Indexes:** `courseId`, `pathId`, `order`

---

### Lesson Model ✅
```javascript
{
  title: String,             // ✅ Clear purpose
  topicId: ObjectId,         // ✅ Follows naming convention
  courseId: ObjectId,        // ✅ Follows naming convention
  pathId: ObjectId,          // ✅ Follows naming convention
  order: Number,             // ✅ For sorting
  duration: Number           // ✅ Descriptive
}
```
**Indexes:** `topicId`, `courseId`, `pathId`, `order`

---

### Content Model ✅
```javascript
{
  teacher: ObjectId,         // ✅ Exception: no "Id" suffix
  title: String,             // ✅ Clear purpose
  pathType: String,          // ✅ Avoids conflict with contentType
  contentType: String,       // ✅ Clear: file type
  topic: String,             // ⚠️ Consider using topicId only
  lesson: String,            // ⚠️ Consider using lessonId only
  course: String,            // ⚠️ Consider using courseId only
  pathId: ObjectId,          // ✅ Proper reference
  courseId: ObjectId,        // ✅ Proper reference
  topicId: ObjectId,         // ✅ Proper reference
  lessonId: ObjectId,        // ✅ Proper reference
  description: String,       // ✅ Clear purpose
  difficulty: String,        // ✅ Clear purpose
  status: String,            // ✅ Clear purpose
  fileURL: String,           // ✅ Descriptive
  storagePath: String,       // ✅ Descriptive
  fileType: String,          // ✅ MIME type
  size: Number,              // ✅ File size in bytes
  previousStatus: String,    // ✅ For archive tracking
  deletedAt: Date,           // ✅ Soft delete timestamp
  releaseDate: Date,         // ✅ Clear purpose
  views: Number,             // ✅ Analytics
  likes: Number              // ✅ Analytics
}
```
**Indexes:** `teacher`, `pathType`, `contentType`, `status`, `difficulty`, `pathId`, `courseId`, `topicId`, `lessonId`

**Note:** Content stores both string names AND ObjectId references for flexibility. Consider standardizing to ObjectIds only in future.

---

### Quiz Model ✅
```javascript
{
  teacher: ObjectId,         // ✅ Exception: no "Id" suffix
  title: String,             // ✅ Clear purpose
  pathType: String,          // ✅ Avoids conflict
  topic: String,             // ⚠️ Consider using topicId only
  lesson: String,            // ⚠️ Consider using lessonId only
  course: String,            // ⚠️ Consider using courseId only
  pathId: ObjectId,          // ✅ Proper reference
  courseId: ObjectId,        // ✅ Proper reference
  topicId: ObjectId,         // ✅ Proper reference
  lessonId: ObjectId,        // ✅ Proper reference
  difficulty: String,        // ✅ Required field
  status: String,            // ✅ Clear purpose
  previousStatus: String,    // ✅ For archive tracking
  questionsAndAnswers: [{    // ✅ Descriptive array
    question: String,
    correctAnswer: String,
    wrongAnswers: [String]
  }],
  releaseDate: Date          // ✅ Clear purpose
}
```
**Indexes:** `teacher`, `pathType`, `status`, `pathId`, `courseId`, `topicId`, `lessonId`

---

### Student Model ✅
```javascript
{
  name: String,              // ✅ Clear purpose
  email: String,             // ✅ Clear purpose
  pass: String,              // ✅ Hashed password
  type: String,              // ✅ Learning path type
  avatar: String,            // ✅ Image URL/filename
  status: String,            // ✅ Account status
  suspended: Boolean,        // ✅ Moderation flag
  assignedPath: String,      // ⚠️ Consider using pathId ObjectId
  isOnline: Boolean,         // ✅ Presence tracking
  lastActivity: Date,        // ✅ Presence tracking
  createdAt: Date            // ✅ Audit field
}
```
**Note:** `type` here refers to student's learning path type (autism/downSyndrome/other)

---

### Teacher Model ✅
```javascript
{
  fullName: String,          // ✅ Clear purpose
  email: String,             // ✅ Clear purpose
  password: String,          // ✅ Hashed password
  profilePic: String,        // ✅ Image URL
  headline: String,          // ✅ Short bio
  bio: String,               // ✅ Full bio
  userStatus: String,        // ✅ Clear: account status
  ranking: Number,           // ✅ Teacher ranking
  specializations: [String], // ✅ Array of expertise
  isOnline: Boolean,         // ✅ Presence tracking
  lastActivity: Date,        // ✅ Presence tracking
  createdAt: Date            // ✅ Audit field
}
```

---

### Post Model ✅
```javascript
{
  author: ObjectId,          // ✅ References Teacher
  authorName: String,        // ✅ Denormalized for performance
  authorProfilePic: String,  // ✅ Denormalized for performance
  content: String,           // ✅ Post content
  image: String,             // ✅ Optional image URL
  tags: [String],            // ✅ Array of tag strings
  category: String,          // ✅ Post category (NOT path type)
  likes: [ObjectId],         // ✅ Array of Teacher references
  comments: [{               // ✅ Embedded comments
    author: ObjectId,
    authorName: String,
    authorProfilePic: String,
    content: String,
    likes: [ObjectId]
  }],
  views: Number,             // ✅ Analytics
  isPinned: Boolean          // ✅ Featured posts
}
```

**✅ No Conflicts:** Post model uses `category` appropriately for post categories, which is separate from learning path types.

---

## 🔧 Recommended Fixes

### Priority 1: Critical Naming Conflicts

✅ **No critical conflicts found!** All field names are used consistently across models.

### Priority 2: Consistency Improvements

#### Issue 1: Mixed reference types in Content/Quiz
```javascript
// CURRENT: Both string names AND ObjectIds
topic: String,
topicId: ObjectId,

// RECOMMENDED: Use ObjectIds only
topicId: ObjectId,    // Remove string field
```

**Rationale:** Storing both strings and ObjectIds is redundant. ObjectIds provide referential integrity.

#### Issue 2: Student.assignedPath should be ObjectId
```javascript
// BEFORE
assignedPath: String

// AFTER
assignedPath: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Path'
}
```

**Rationale:** Consistent with other model references and enables proper joins.

---

## 🧪 Testing Checklist

After any model changes, verify:

- [ ] All enum values match exactly (check capitalization)
- [ ] ObjectId references use consistent naming (`modelNameId`)
- [ ] No field name is used for multiple purposes
- [ ] All indexes are updated to match new field names
- [ ] Controllers are updated to use new field names
- [ ] Frontend API responses handle new field names
- [ ] Existing data is migrated (if needed)

---

## 📝 Adding New Fields

When adding a new field to any model:

1. ✅ Check this document to ensure the field name isn't already used elsewhere
2. ✅ If it's an ObjectId reference, use the `modelNameId` convention
3. ✅ Add appropriate enum values if it's a restricted field
4. ✅ Add index if the field will be queried frequently
5. ✅ Update this document with the new field
6. ✅ Update controllers and API endpoints
7. ✅ Update frontend to handle the new field

---

Last Updated: December 14, 2025
