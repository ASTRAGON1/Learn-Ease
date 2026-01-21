# Agent Prompt: Fix Static Curriculum Assignment in LearnEase

**Project Context:**
LearnEase is a platform for students with Autism and Down Syndrome. It uses a Diagnostic Test to determine a student's learning profile.

**The Problem:**
Currently, in `server/controllers/diagnosticTestController.js`, the system determines a student's type (autism/downSyndrome) correctly, but it then assigns the **exact same set of content** to every student within that category. It simply pulls a static template from the `Path` model and assigns all "published" content linked to that path to the student's `StudentPath`. While there is an AI recommendation step, it doesn't actually affect the main curriculum list, resulting in a repetitive user experience where different students see identical paths.

**Goal:**
Modify the backend logic so that the `StudentPath` is **dynamically filtered** based on the student's diagnostic performance (Accuracy Score and Difficulty) rather than just assigning a bulk template.

**Technical Files to Review:**
1. `server/controllers/diagnosticTestController.js` (The logic resides here)
2. `server/models/StudentPath.js` (The schema being updated)
3. `server/models/Content.js` (The content being filtered)

**Instructions for Implementation:**
1.  **Filter by Difficulty:** In the `submitQuiz` function of `diagnosticTestController.js`, use the calculated `accuracy` score to filter which content is assigned.
    *   If `accuracy < 40%`: Assign only 'Easy' difficulty content.
    *   If `accuracy` is between 40%-75%: Assign 'Easy' and 'Medium' content.
    *   If `accuracy > 75%`: Assign all difficulty levels.
2.  **Integrate AI Recommendations:** Instead of just saving AI recommendations to a separate `personalizedRecommendations` array, ensure these "AI-picked" items are marked with a high priority or "Recommended" flag within the `assignedContent` so the UI can highlight them.
3.  **Topic Personalization:** Use the `section1` (Preferences) data to prioritize content that matches the student's interests (e.g., if they prefer visual learning, prioritize 'video' content types).
4.  **Avoid Bulk Assignment:** Remove the logic that simply `map`s every single piece of content from the `curriculumPath` to the user's `assignedContent`. Replace it with a filtered query that considers `difficulty`, `type`, and `category`.

**Verification:**
After the changes, two students with the same "Type" (e.g., Autism) but different "Accuracy Scores" should have a different number of lessons/videos in their `StudentPath` dashboard.
