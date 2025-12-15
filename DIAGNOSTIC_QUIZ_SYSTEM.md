# Diagnostic Quiz System for Neurodivergent Learners

## Overview
This system generates a first-time diagnostic quiz for new students entering the LearnEase platform. The quiz helps identify the student's learning profile and determines whether they are better suited for Autism or Down Syndrome learning paths.

## System Architecture

### Backend Components

#### 1. **Diagnostic Quiz Controller** (`server/controllers/diagnosticQuizController.js`)
   - `generateDiagnosticQuiz()`: Returns the quiz questions in JSON format
   - `submitDiagnosticQuiz()`: Processes quiz responses and determines student type
   - `checkDiagnosticQuizStatus()`: Checks if a student has completed the quiz

#### 2. **Student Model Update** (`server/models/Student.js`)
   - Added `diagnosticQuizCompleted`: Boolean flag
   - Added `diagnosticQuizResults`: Object storing quiz responses and analysis

#### 3. **API Routes** (`server/routes/diagnosticQuizRoutes.js`)
   - `GET /api/diagnostic-quiz/generate`: Generate quiz questions
   - `POST /api/diagnostic-quiz/submit`: Submit quiz results (requires authentication)
   - `GET /api/diagnostic-quiz/status`: Check completion status (requires authentication)

### Frontend Components

#### 1. **Diagnostic Quiz Component** (`client/src/StudentPages/DiagnosticQuiz.jsx`)
   - Three-section quiz interface
   - Progress tracking
   - Answer validation
   - Submission handling

#### 2. **Student Dashboard Integration** (`client/src/StudentPages/StudentDashboard2.jsx`)
   - Automatic redirect to diagnostic quiz for first-time students
   - Success message display after quiz completion

## Quiz Structure

### Section 1: Cognitive & Learning Style (8 questions)
**Goal**: Identify how the student prefers to learn

Topics covered:
- Visual vs verbal preference
- Step-by-step vs exploratory learning
- Short tasks vs long tasks
- Sensitivity to information overload
- Visual vs auditory memory
- Alone vs group work preference
- Quiet vs noisy learning environments
- Routines vs change preference

### Section 2: Subject Baseline Knowledge (12 questions)
**Goal**: Understand the student's academic starting point

Topics covered:
- Reading comprehension (vocabulary)
- Basic math (addition, subtraction)
- Pattern recognition (sequences, shapes, colors)

**Note**: Questions are intentionally easy to avoid discouragement.

### Section 3: Emotional & Interaction Preferences (7 questions)
**Goal**: Understand how the system should interact with the student

Topics covered:
- Preferred feedback style (soft/neutral/direct)
- Preferred learning pace
- Tolerance for challenge
- Error handling preferences
- Celebration style preferences
- Progress display preferences
- Reminders vs self-paced learning

## Analysis Algorithm

The system uses a scoring mechanism to determine student type:

### Autism Indicators (Higher Score = More Likely Autism)
- Preference for routines (+3 points)
- Visual learning preference (+2 points)
- Step-by-step instructions (+2 points)
- Working alone (+2 points)
- Quiet learning environments (+2 points)
- Information overload sensitivity (+1-2 points)
- Own pace preference (+1 point)
- Minimal celebration preference (+1 point)

### Down Syndrome Indicators (Higher Score = More Likely Down Syndrome)
- Social/group work preference (+2 points)
- Verbal/auditory learning (+1 point)
- Direct feedback preference (+1 point)
- Reminders preference (+1 point)
- Big celebration preference (+1 point)
- Exploratory learning (+1 point)

### Determination Logic
- If `autismScore >= 8` and `autismScore > downSyndromeScore`: Type = `autism`
- If `downSyndromeScore >= 6` and `downSyndromeScore > autismScore`: Type = `downSyndrome`
- Otherwise: Type = `other`

## Design Principles

### Question Design Rules
- ✅ Questions are literal and straightforward
- ✅ No idioms, sarcasm, metaphors, or abstract language
- ✅ Each question under 20 words
- ✅ Each answer option under 12 words
- ✅ Safe, non-judgmental, and supportive tone

### User Experience
- Clear progress indicators
- Section-by-section navigation
- Validation before proceeding
- No time limits
- Encouraging messaging
- Accessible design (large buttons, clear text)

## Integration Flow

1. **Student Registration**: New students are created with `type: 'other'` and `diagnosticQuizCompleted: false`

2. **First Login**: When a student logs in and navigates to the dashboard:
   - System checks diagnostic quiz status
   - If not completed, redirects to `/diagnostic-quiz`

3. **Quiz Completion**: 
   - Student completes all three sections
   - Answers are submitted to backend
   - Backend analyzes responses and updates student type
   - Student is redirected to dashboard with success message

4. **Subsequent Logins**: 
   - Quiz status check passes
   - Student proceeds to dashboard normally
   - Learning path is personalized based on their type

## API Endpoints

### Generate Quiz
```http
GET /api/diagnostic-quiz/generate
```

**Response:**
```json
{
  "success": true,
  "data": {
    "section1": [...],
    "section2": [...],
    "section3": [...]
  }
}
```

### Submit Quiz
```http
POST /api/diagnostic-quiz/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "section1": [0, 1, 2, ...],
  "section2": [0, 1, 2, ...],
  "section3": [0, 1, 2, ...]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "studentType": "autism" | "downSyndrome" | "other",
    "autismScore": 12,
    "downSyndromeScore": 5,
    "accuracy": 85,
    "message": "Based on your responses..."
  }
}
```

### Check Status
```http
GET /api/diagnostic-quiz/status
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "completed": true,
    "type": "autism"
  }
}
```

## Files Created/Modified

### New Files
- `server/controllers/diagnosticQuizController.js`
- `server/routes/diagnosticQuizRoutes.js`
- `client/src/StudentPages/DiagnosticQuiz.jsx`
- `client/src/StudentPages/DiagnosticQuiz.css`

### Modified Files
- `server/models/Student.js` - Added diagnostic quiz fields
- `server/app.js` - Added diagnostic quiz routes
- `client/src/App.jsx` - Added diagnostic quiz route
- `client/src/StudentPages/StudentDashboard2.jsx` - Added quiz check and success message

## Future Enhancements

1. **Adaptive Question Selection**: Adjust questions based on previous answers
2. **Detailed Analytics**: Provide more insights into learning preferences
3. **Retake Option**: Allow students to retake quiz after some time
4. **Parent/Guardian View**: Share results with caregivers
5. **Progress Tracking**: Compare initial assessment with current performance

## Testing Checklist

- [ ] New student registration creates student with `diagnosticQuizCompleted: false`
- [ ] First-time login redirects to diagnostic quiz
- [ ] Quiz sections can be navigated forward/backward
- [ ] All questions must be answered before proceeding
- [ ] Quiz submission updates student type correctly
- [ ] After completion, student can access dashboard
- [ ] Subsequent logins skip the quiz
- [ ] Success message displays after completion
- [ ] Quiz questions are clear and accessible
- [ ] Analysis algorithm correctly identifies student types

