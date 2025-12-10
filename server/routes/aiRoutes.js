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
- Minimum 3 questions, maximum 10 questions
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

// POST /api/ai/quiz/generate-wrong-answers - Generate wrong answers for quiz questions
router.post('/quiz/generate-wrong-answers', async (req, res) => {
  try {
    const { questions, course, topic, lesson, category, difficulty } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Questions array is required'
      });
    }

    if (!openai || !process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        success: false,
        error: 'AI service is not configured. Please contact support.'
      });
    }

    // Validate each question has question and correctAnswer
    for (const q of questions) {
      if (!q.question || !q.correctAnswer) {
        return res.status(400).json({
          success: false,
          error: 'Each question must have both question and correctAnswer fields'
        });
      }
    }

    // Build context for AI based on course, topic, lesson, category, and difficulty
    const contextInfo = [];
    if (category) contextInfo.push(`Category: ${category}`);
    if (course) contextInfo.push(`Course: ${course}`);
    if (topic) contextInfo.push(`Topic: ${topic}`);
    if (lesson) contextInfo.push(`Lesson: ${lesson}`);
    if (difficulty) contextInfo.push(`Difficulty Level: ${difficulty}`);
    const contextString = contextInfo.length > 0 ? `\n\nContext: ${contextInfo.join(', ')}` : '';
    
    // Build difficulty-specific instructions for AI
    let difficultyInstructions = '';
    if (difficulty === 'Easy') {
      difficultyInstructions = '\n\nDifficulty Level: EASY - Generate simpler wrong answers that are clearly different from the correct answer. Use basic vocabulary and straightforward concepts appropriate for beginners.';
    } else if (difficulty === 'Medium') {
      difficultyInstructions = '\n\nDifficulty Level: MEDIUM - Generate moderately challenging wrong answers. Some should be closer to the correct answer to test deeper understanding, while others can be more obviously wrong.';
    } else if (difficulty === 'Hard') {
      difficultyInstructions = '\n\nDifficulty Level: HARD - Generate sophisticated wrong answers that require careful thinking to distinguish from the correct answer. Include subtle distinctions and more advanced concepts.';
    }

    // Generate wrong answers for all questions
    const questionsWithWrongAnswers = await Promise.all(
      questions.map(async (q) => {
        try {
          const prompt = `You are an educational content creator for LearnEase, a platform for students with autism and Down syndrome.

Given this quiz question and its correct answer, generate 3-4 plausible but incorrect answer options. The wrong answers should:
1. Be related to the topic but clearly incorrect
2. Be plausible enough to test understanding (not obviously wrong)
3. Be appropriate for students with special needs (clear, simple language)
4. Vary in how wrong they are (some closer to correct, some more obviously wrong)${contextString}${difficultyInstructions}

Question: ${q.question}
Correct Answer: ${q.correctAnswer}

Generate 3-4 wrong answers as a JSON array of strings. Return ONLY the JSON array, nothing else. Example format: ["Wrong answer 1", "Wrong answer 2", "Wrong answer 3"]`;

          const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are a helpful educational assistant. Always respond with valid JSON arrays only.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.8,
            max_tokens: 300
          });

          let wrongAnswers = [];
          try {
            const responseText = completion.choices[0].message.content.trim();
            // Try to parse as JSON array
            const parsed = JSON.parse(responseText);
            if (Array.isArray(parsed)) {
              wrongAnswers = parsed.slice(0, 4); // Limit to 4 wrong answers max
            } else {
              // If not an array, try to extract from text
              wrongAnswers = [parsed].filter(Boolean).slice(0, 4);
            }
          } catch (parseError) {
            // If JSON parsing fails, try to extract answers from text
            const lines = completion.choices[0].message.content.split('\n');
            wrongAnswers = lines
              .map(line => line.replace(/^[-•*]\s*/, '').replace(/^"\s*|\s*"$/g, '').trim())
              .filter(line => line.length > 0)
              .slice(0, 4);
          }

          // Ensure we have at least 3 wrong answers, generate more if needed
          if (wrongAnswers.length < 3) {
            // Generate additional wrong answers if we have less than 3
            const additionalPrompt = `Generate ${3 - wrongAnswers.length} more wrong answer(s) for this question:
Question: ${q.question}
Correct Answer: ${q.correctAnswer}
Existing wrong answers: ${wrongAnswers.join(', ')}${contextString}${difficultyInstructions}

Return as JSON array only.`;

            const additionalCompletion = await openai.chat.completions.create({
              model: 'gpt-4o-mini',
              messages: [
                {
                  role: 'system',
                  content: 'You are a helpful educational assistant. Always respond with valid JSON arrays only.'
                },
                {
                  role: 'user',
                  content: additionalPrompt
                }
              ],
              temperature: 0.8,
              max_tokens: 200
            });

            try {
              const additionalText = additionalCompletion.choices[0].message.content.trim();
              const additionalParsed = JSON.parse(additionalText);
              if (Array.isArray(additionalParsed)) {
                wrongAnswers = [...wrongAnswers, ...additionalParsed].slice(0, 4);
              }
            } catch (e) {
              // If parsing fails, just use what we have
            }
          }

          // Ensure we have at least 3 wrong answers (generate simple ones if needed)
          while (wrongAnswers.length < 3) {
            wrongAnswers.push(`Incorrect option ${wrongAnswers.length + 1}`);
          }

          return {
            question: q.question,
            correctAnswer: q.correctAnswer,
            wrongAnswers: wrongAnswers.slice(0, 4) // Max 4 wrong answers
          };
        } catch (error) {
          console.error(`Error generating wrong answers for question: ${q.question}`, error);
          // Return with default wrong answers if AI fails
          return {
            question: q.question,
            correctAnswer: q.correctAnswer,
            wrongAnswers: ['Incorrect option 1', 'Incorrect option 2', 'Incorrect option 3']
          };
        }
      })
    );

    res.json({
      success: true,
      data: {
        questions: questionsWithWrongAnswers
      }
    });

  } catch (error) {
    console.error('Error generating wrong answers:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate wrong answers. Please try again.'
    });
  }
});

// POST /api/ai/quiz/generate - Generate complete quiz with AI
router.post('/quiz/generate', async (req, res) => {
  try {
    const { title, category, course, topic, lesson, difficulty, numQuestions, numAnswers } = req.body;

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Quiz title is required'
      });
    }

    if (!category || !course || !topic || !lesson) {
      return res.status(400).json({
        success: false,
        error: 'Category, course, topic, and lesson are required'
      });
    }

    if (!difficulty || !['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      return res.status(400).json({
        success: false,
        error: 'Difficulty must be Easy, Medium, or Hard'
      });
    }

    if (!numQuestions || numQuestions < 3 || numQuestions > 10) {
      return res.status(400).json({
        success: false,
        error: 'Number of questions must be between 3 and 10'
      });
    }

    if (!numAnswers || numAnswers < 3 || numAnswers > 5) {
      return res.status(400).json({
        success: false,
        error: 'Number of answers must be between 3 and 5'
      });
    }

    if (!openai || !process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        success: false,
        error: 'AI service is not configured. Please contact support.'
      });
    }

    // Build difficulty-specific instructions
    let difficultyInstructions = '';
    if (difficulty === 'Easy') {
      difficultyInstructions = 'EASY level: Create simple, straightforward questions with clear correct answers. Use basic vocabulary and simple concepts appropriate for beginners. Wrong answers should be obviously different from the correct answer.';
    } else if (difficulty === 'Medium') {
      difficultyInstructions = 'MEDIUM level: Create moderately challenging questions that test understanding. Some wrong answers should be closer to correct to test deeper comprehension. Use intermediate vocabulary and concepts.';
    } else if (difficulty === 'Hard') {
      difficultyInstructions = 'HARD level: Create sophisticated questions that require careful thinking. Wrong answers should be plausible and require students to distinguish subtle differences. Use advanced vocabulary and complex concepts.';
    }

    // Build the prompt for AI
    const prompt = `You are an educational content creator for LearnEase, a platform designed for students with autism and Down syndrome.

Generate a complete quiz with ${numQuestions} questions based on the following information:

Quiz Title: ${title}
Category: ${category}
Course: ${course}
Topic: ${topic}
Lesson: ${lesson}
Difficulty Level: ${difficulty}

${difficultyInstructions}

Requirements:
1. Generate exactly ${numQuestions} questions related to the lesson topic
2. Each question should have ${numAnswers} answer options (1 correct, ${numAnswers - 1} wrong)
3. Questions should be appropriate for students with special needs (clear, structured, sensory-aware)
4. Use simple, direct language
5. Focus on practical understanding of the lesson content
6. Wrong answers should be plausible but clearly incorrect
7. Questions should progress logically through the lesson material

Return the quiz as a JSON object with this exact structure:
{
  "questions": [
    {
      "question": "Question text here",
      "answers": ["Answer 1", "Answer 2", "Answer 3", ...],
      "correctIndex": 0
    },
    ...
  ]
}

The "answers" array should contain all ${numAnswers} options, and "correctIndex" should be the 0-based index of the correct answer in that array.

Return ONLY the JSON object, nothing else.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful educational assistant. Always respond with valid JSON only. Generate educational quiz questions appropriate for students with special needs.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000
    });

    // Parse the AI response
    let quizData;
    try {
      const responseText = completion.choices[0].message.content.trim();
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        quizData = JSON.parse(jsonMatch[0]);
      } else {
        quizData = JSON.parse(responseText);
      }

      // Validate the response structure
      if (!quizData.questions || !Array.isArray(quizData.questions)) {
        throw new Error('Invalid response format: questions array not found');
      }

      // Validate each question
      const validatedQuestions = quizData.questions
        .filter(q => q.question && q.answers && Array.isArray(q.answers) && q.answers.length === numAnswers && typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex < numAnswers)
        .slice(0, numQuestions); // Ensure we don't exceed requested number

      if (validatedQuestions.length < numQuestions) {
        throw new Error(`Only generated ${validatedQuestions.length} valid questions, need ${numQuestions}`);
      }

      res.json({
        success: true,
        data: {
          questions: validatedQuestions
        }
      });

    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('AI Response:', completion.choices[0].message.content);
      res.status(500).json({
        success: false,
        error: 'Failed to parse AI response. Please try again.'
      });
    }

  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate quiz. Please try again.'
    });
  }
});

// Daily tip cache (stores tip for each day)
const dailyTipCache = {};

// Helper function to get today's date key (YYYY-MM-DD)
function getTodayKey() {
  const today = new Date();
  return today.toISOString().split('T')[0]; // Returns YYYY-MM-DD
}

// Generate daily teaching tip
router.get('/daily-tip', async (req, res) => {
  if (!openai) {
    return res.status(503).json({
      success: false,
      error: 'AI service is not available. Please configure OPENAI_API_KEY.'
    });
  }

  try {
    const todayKey = getTodayKey();
    
    // Check if we already have a tip for today
    if (dailyTipCache[todayKey]) {
      return res.json({
        success: true,
        data: {
          tip: dailyTipCache[todayKey],
          date: todayKey
        }
      });
    }

    // Generate a new tip for today
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a specialized educational assistant for LearnEase, a platform for teaching students with autism and Down syndrome.

Generate a practical, actionable teaching tip that:
- Is specific to teaching students with autism and/or Down syndrome
- Is EXACTLY 10 words or less (count carefully)
- Is practical and easy to apply
- Focuses on daily teaching strategies
- Is encouraging and supportive
- Varies from day to day (don't repeat the same tips)

Format: Just the tip text, no quotes, no "Tip:" prefix, maximum 10 words.`
        },
        {
          role: "user",
          content: `Generate a unique daily teaching tip for today (${todayKey}). Maximum 10 words. Make it practical and specific to teaching students with autism and Down syndrome.`
        }
      ],
      temperature: 0.8,
      max_tokens: 30
    });

    let tip = completion.choices[0]?.message?.content?.trim() || 
      "Use visual schedules to help students stay organized and focused.";
    
    // Ensure tip is 10 words or less
    const words = tip.split(/\s+/).filter(w => w.length > 0);
    if (words.length > 10) {
      tip = words.slice(0, 10).join(' ');
    }

    // Cache the tip for today
    dailyTipCache[todayKey] = tip;

    // Clean up old cache entries (keep only last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    Object.keys(dailyTipCache).forEach(key => {
      if (key < sevenDaysAgo.toISOString().split('T')[0]) {
        delete dailyTipCache[key];
      }
    });

    res.json({
      success: true,
      data: {
        tip: tip,
        date: todayKey
      }
    });

  } catch (error) {
    console.error('Error generating daily tip:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate daily tip. Please try again.'
    });
  }
});

module.exports = router;

