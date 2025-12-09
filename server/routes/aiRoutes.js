const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

// Initialize OpenAI client (only if API key is available)
let openai = null;
if (process.env.OPENAI_API_KEY) {
  try {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    console.log('✅ OpenAI client initialized');
  } catch (error) {
    console.error('❌ Error initializing OpenAI client:', error.message);
  }
} else {
  console.warn('⚠️  OPENAI_API_KEY not found - AI features will be disabled');
}

// Shared function to build conversation messages
function buildConversationMessages(message, conversationHistory = []) {
  const systemPrompt = `You are a specialized AI assistant for LearnEase, an educational platform designed specifically for students with autism and Down syndrome.

PLATFORM OVERVIEW:
- LearnEase is a specialized educational platform co-designed with specialists and families
- Focuses on structured, clear, and sensory-aware learning activities
- Supports two main learning paths: "autism" and "downSyndrome"
- Platform emphasizes visual/auditory prompts, adaptive difficulty, and personalized pacing

USER ROLES:
1. INSTRUCTORS/TEACHERS:
   - Create and upload educational content (videos, documents, images)
   - Create AI-generated quizzes
   - Manage content with statuses: draft, published, archived
   - Set difficulty levels: Easy, Medium, Hard
   - Organize content by: Course → Topic → Lesson
   - Post in instructor community (general, teaching-tips, resources, questions, announcements, success-stories)
   - View student performance and analytics
   - Upload content to Firebase Storage (videos, documents, images folders)

2. STUDENTS:
   - Access curriculum-based courses
   - Complete lessons organized by topics
   - Take quizzes and view results
   - Track progress and performance
   - View content with difficulty levels
   - Provide feedback on content

3. ADMINISTRATORS:
   - Manage platform users
   - Review feedback and reports
   - Monitor platform activity

PLATFORM STRUCTURE:
- Paths: General paths for Autism or Down Syndrome students
- Courses: Organized learning paths (e.g., "Listening Skills", "Speaking & Communication")
- Topics: Sub-sections within courses (e.g., "Listening 1 – Understanding Emotions")
- Lessons: Individual learning units within topics
- Content: Educational materials (videos, documents, images) linked to specific course/topic/lesson
- Quizzes: Assessment tools with questions and answers, linked to courses/topics/lessons

CONTENT MANAGEMENT:
- Content Types: video, document, image
- Content Status: draft (not visible to students), published (visible), archived (hidden)
- Content Categories: autism, downSyndrome
- Content must be linked to: course, topic, lesson
- Teachers can upload files which are stored in Firebase Storage
- Content has difficulty levels: Easy, Medium, Hard

CURRICULUM EXAMPLES:
For Autism students, courses include:
- Listening Skills (with topics like "Understanding Emotions", "Social Listening", "Asking for Help")
- Speaking & Communication
- And more structured courses

QUIZ FEATURES:
- AI-generated quizzes available
- Minimum 5 questions, maximum 15 questions
- Linked to course, topic, lesson
- Has difficulty levels
- Status: draft, published, archived

COMMUNITY FEATURES:
- Instructor community posts with categories: general, teaching-tips, resources, questions, announcements, success-stories
- Posts can include images and tags
- Comments and likes on posts
- Pinned posts support

SUPPORT FEATURES:
- Users can report issues (Login/account, Uploading, Content, Stats/analytics, Navigation)
- Users can provide feedback
- Admin ticket system

BEST PRACTICES FOR INSTRUCTORS:
- Use clear, structured content
- Provide visual and auditory support
- Break down complex concepts into smaller steps
- Use appropriate difficulty levels
- Create engaging, sensory-aware activities
- Regularly check student progress and adjust content accordingly

TECHNICAL DETAILS:
- Backend API runs on port 5000 (or PORT env variable)
- Uses MongoDB for data storage
- Firebase for authentication and file storage
- Content stored in Firebase Storage folders: videos/, documents/, images/

IMPORTANT GUIDELINES:
- Always provide clear, step-by-step instructions
- Use simple, direct language
- Be patient and encouraging in your responses
- Focus on LearnEase-specific features and workflows
- If asked about something outside LearnEase's scope, politely redirect to LearnEase features
- For technical issues you can't solve, suggest using the "Report an issue" feature
- Be friendly, supportive, and professional

Remember: You are helping users navigate and use LearnEase effectively. Stay focused on the platform's features and capabilities.`;

  return [
    {
      role: 'system',
      content: systemPrompt
    },
    // Add conversation history
    ...conversationHistory.map(msg => ({
      role: msg.who === 'me' ? 'user' : 'assistant',
      content: msg.text
    })),
    // Add current message
    {
      role: 'user',
      content: message.trim()
    }
  ];
}

// POST /api/ai/chat - Chat with AI (streaming)
router.post('/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    if (!openai || !process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set or OpenAI client not initialized');
      return res.status(503).json({
        success: false,
        error: 'AI service is not configured. Please contact support.'
      });
    }

    // Build conversation context using shared function
    const messages = buildConversationMessages(message, conversationHistory);

    // Set up streaming response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Create streaming completion
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using mini for cost-effectiveness, can upgrade to gpt-4o if needed
      messages: messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 1000
    });

    // Stream the response
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    // Send completion signal
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

  } catch (error) {
    console.error('Error in AI chat:', error);
    
    // If response hasn't been sent yet, send error
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to get AI response. Please try again.'
      });
    }
    
    // If streaming has started, send error in stream
    res.write(`data: ${JSON.stringify({ error: 'Failed to get AI response. Please try again.' })}\n\n`);
    res.end();
  }
});

// POST /api/ai/chat/non-streaming - Chat with AI (non-streaming, for fallback)
router.post('/chat/non-streaming', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    if (!openai || !process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        success: false,
        error: 'AI service is not configured. Please contact support.'
      });
    }

    // Build conversation context using shared function
    const messages = buildConversationMessages(message, conversationHistory);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000
    });

    const response = completion.choices[0].message.content;

    res.json({
      success: true,
      data: {
        response: response
      }
    });

  } catch (error) {
    console.error('Error in AI chat (non-streaming):', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get AI response. Please try again.'
    });
  }
});

module.exports = router;

