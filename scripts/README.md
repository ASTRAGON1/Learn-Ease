# Fix Existing Students Difficulty Script

## Problem
Students who completed the diagnostic test **before** the difficulty feature was added don't have `currentDifficulty` set in their records.

This causes them to see ALL content instead of filtered content.

## Solution
Run this script to automatically assign difficulty to all existing students based on their diagnostic test accuracy.

## How to Use

### Step 1: Update MongoDB Connection
Open `fixExistingStudentsDifficulty.js` and update the connection string:

```javascript
const MONGODB_URI = 'your-mongodb-connection-string';
```

Or set it as environment variable:
```bash
export MONGODB_URI="your-mongodb-connection-string"
```

### Step 2: Run the Script

From the project root:

```bash
cd scripts
node fixExistingStudentsDifficulty.js
```

### Expected Output:

```
🔌 Connecting to MongoDB...
✅ Connected to MongoDB

📊 Found 3 students without currentDifficulty

✅ Updated student2 (student2@email.com) - Accuracy: 45% → Easy
✅ Updated student3 (student3@email.com) - Accuracy: 75% → Medium
✅ Updated student1 (student1@email.com) - Accuracy: 90% → Hard

============================================================
✅ Successfully updated 3 students
⚠️ Skipped 0 students (no test found)
============================================================

✅ Disconnected from MongoDB
```

## What It Does

1. Finds all students who:
   - Have completed diagnostic test (have `type` set)
   - Don't have `currentDifficulty` set

2. For each student:
   - Retrieves their diagnostic test result
   - Calculates accuracy percentage
   - Assigns difficulty:
     - **< 50% accuracy** → Easy
     - **50-80% accuracy** → Medium  
     - **> 80% accuracy** → Hard

3. Updates the student record with `currentDifficulty`

## Verify It Worked

After running, check a student in MongoDB:

```javascript
db.Student.findOne({ email: "student2@email.com" })
```

Should show:
```javascript
{
  _id: ObjectId("..."),
  name: "student2",
  email: "student2@email.com",
  type: "autism",
  currentDifficulty: "Easy",  // ← Should be present now!
  ...
}
```

## Check Server Logs

When student logs in and views content, you should now see:

```
🎯 Filtering content for student xxx: Easy difficulty only
✅ Returning 5 published content items (Easy difficulty)
```

Instead of:
```
⚠️ Student xxx has no difficulty set - showing all content
```

## Notes

- Script is **safe** to run multiple times (won't overwrite existing difficulty)
- Only updates students who are missing `currentDifficulty`
- Requires student to have completed diagnostic test
- Script connects to database, makes updates, then disconnects

## Future Students

All NEW students who complete the diagnostic test after the update will automatically get `currentDifficulty` assigned. This script is only needed for existing students.
