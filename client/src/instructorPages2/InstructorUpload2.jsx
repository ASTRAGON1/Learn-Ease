import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./InstructorUpload2.css";
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
import fullLogo from "../assets/OrangeLogo.png";
import smallLogo from "../assets/OrangeIconLogo.png";
import icCourse from "../assets/course.png";
import icPerformance from "../assets/performance2.png";
import icCurriculum from "../assets/curriculum.png";
import icResources from "../assets/resources.png";
import { auth } from "../config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getMongoDBToken } from "../utils/auth";
import { useSimpleToast } from "../utils/toast";
import { uploadFile } from "../utils/uploadFile";

const FILE_TYPES = ["document", "video", "image"];


const ProfileAvatar = ({ src, name, className, style, fallbackClassName }) => {
  const [error, setError] = useState(false);

  // Reset error when src changes
  useEffect(() => {
    setError(false);
  }, [src]);

  if (src && !error) {
    return (
      <img
        src={src}
        alt="Profile"
        className={className}
        style={style}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <div className={fallbackClassName}>
      {(name || "User").slice(0, 2).toUpperCase()}
    </div>
  );
};

export default function InstructorUpload2() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [scrollDirection, setScrollDirection] = useState("down");
  const [lastScrollY, setLastScrollY] = useState(0);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const [instructorName, setInstructorName] = useState('Instructor');
  const [email, setEmail] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [mongoToken, setMongoToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userStatus, setUserStatus] = useState('pending');
  const { showToast, ToastComponent } = useSimpleToast();

  // Get instructor name from Firebase Auth
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;

      if (!firebaseUser) {
        setLoading(false);
        navigate('/all-login');
        return;
      }

      const token = await getMongoDBToken();
      if (!token) {
        setLoading(false);
        navigate('/all-login');
        return;
      }

      setMongoToken(token);
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${API_URL}/api/teachers/auth/me`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401 || response.status === 403) {
          setLoading(false);
          navigate('/all-login');
          return;
        }

        if (response.ok) {
          const data = await response.json();
          const teacher = data.data || data;
          if (teacher.fullName) {
            setInstructorName(teacher.fullName.split(' ')[0]);
          }
          if (teacher.email) {
            setEmail(teacher.email);
          }
          if (teacher.profilePic) {
            setProfilePic(teacher.profilePic);
          }
          if (teacher.userStatus) {
            setUserStatus(teacher.userStatus);
            // Redirect if not approved or suspended
            if (teacher.userStatus !== 'active') {
              const message = teacher.userStatus === 'suspended'
                ? "Your account has been suspended. Please contact support for more information."
                : "You need to be accepted by the admin to upload content.";
              showToast(message, "error");
              setTimeout(() => {
                navigate('/instructor-dashboard-2');
              }, 2000);
              return;
            }
          }
        }
      } catch (error) {
        console.error('Error fetching instructor name:', error);
        setLoading(false);
        navigate('/all-login');
        return;
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [navigate]);

  // Fetch content from database
  const fetchContent = useCallback(async () => {
    if (!mongoToken) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/content`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${mongoToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.data || [];

        // Transform content to match the display format
        const transformed = content.map(item => ({
          id: item._id,
          title: item.title,
          category: item.pathType === 'autism' ? 'Autism' : item.pathType === 'downSyndrome' ? 'Down Syndrome' : item.pathType,
          status: item.status === 'published' ? 'Published' : item.status === 'draft' ? 'Draft' : item.status === 'archived' ? 'Archived' : item.status,
          storagePath: item.storagePath,
          previousStatus: item.previousStatus || null // Track previous status for archived items
        }));

        // Separate archived and non-archived content
        const activeContent = transformed.filter(item => item.status !== 'Archived');
        const archivedContent = transformed.filter(item => item.status === 'Archived');

        setContentRows(activeContent);
        setArchivedRows(archivedContent);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  }, [mongoToken]);

  // Fetch quizzes
  const fetchQuizzes = useCallback(async () => {
    if (!mongoToken) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/quizzes`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${mongoToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const quizzes = data.data || [];

        // Transform quizzes to match the display format
        const transformed = quizzes.map(item => ({
          id: item._id,
          title: item.title,
          category: item.pathType === 'autism' ? 'Autism' : item.pathType === 'downSyndrome' ? 'Down Syndrome' : item.pathType,
          status: item.status === 'published' ? 'Published' : item.status === 'draft' ? 'Draft' : item.status === 'archived' ? 'Archived' : item.status,
          difficulty: item.difficulty || '',
          previousStatus: item.previousStatus || null
        }));

        // Separate archived and active quizzes
        const activeQuizzes = transformed.filter(item => item.status !== 'Archived');
        const archivedQuizzes = transformed.filter(item => item.status === 'Archived');

        setQuizRows(activeQuizzes);
        setArchivedQuizRows(archivedQuizzes);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  }, [mongoToken]);

  // Fetch content when token is available
  useEffect(() => {
    if (mongoToken) {
      fetchContent();
      fetchQuizzes();
    }
  }, [mongoToken, fetchContent, fetchQuizzes]);

  // Publishing state
  const [title, setTitle] = useState("");
  const [fileType, setFileType] = useState("");
  const [showFileTypeList, setShowFileTypeList] = useState(false);
  const [category, setCategory] = useState("Autism");
  const [course, setCourse] = useState("");
  const [topic, setTopic] = useState("");
  const [lesson, setLesson] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState(null);
  const [difficulty, setDifficulty] = useState("");
  const [errors, setErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [curriculumData, setCurriculumData] = useState([]);

  // Fetch learning paths data
  useEffect(() => {
    const fetchPaths = async () => {
      try {
        const token = await getMongoDBToken();
        const headers = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/api/admin/learning-paths`, {
          headers
        });

        if (response.ok) {
          const result = await response.json();

          if (result.success && result.data) {
            // Keep full structure with IDs and names
            const transformed = result.data.map(path => ({
              id: path.id,
              GeneralPath: path.type || (path.id.includes('autism') ? 'autism' : path.id.includes('down') ? 'downSyndrome' : path.id),
              pathTitle: path.name,
              Courses: path.courses.map(course => ({
                id: course.id,
                CoursesTitle: course.name,
                Topics: course.topics.map(topic => ({
                  id: topic.id,
                  TopicsTitle: topic.name,
                  lessons: topic.lessons.map(lesson => ({
                    id: lesson.id,
                    name: lesson.name
                  }))
                }))
              }))
            }));
            console.log('📚 Fetched curriculum data:', transformed);
            console.log('📚 Number of paths:', transformed.length);
            if (transformed.length > 0) {
              console.log('📚 First path:', transformed[0]);
              console.log('📚 First path courses:', transformed[0].Courses);
            }
            setCurriculumData(transformed);
          }
        } else {
          console.error('❌ Failed to fetch learning paths:', response.status);
        }
      } catch (error) {
        console.error('Error fetching learning paths:', error);
      }
    };
    fetchPaths();
  }, []);

  // Get current path based on category
  const currentPath = useMemo(() => {
    const pathKey = category === "Autism" ? "autism" : "downSyndrome";
    console.log('🔍 Looking for path with key:', pathKey);
    console.log('🔍 Available curriculum data:', curriculumData);
    const found = curriculumData.find(p => p.GeneralPath === pathKey);
    console.log('🔍 Found path:', found);
    return found;
  }, [category, curriculumData]);

  // Get available courses for current category
  const availableCourses = useMemo(() => {
    const courses = currentPath?.Courses || [];
    console.log('📖 Available courses for', category, ':', courses);
    return courses;
  }, [currentPath, category]);

  // Get available topics for selected course
  const availableTopics = useMemo(() => {
    if (!course || !currentPath) return [];
    const selectedCourse = currentPath.Courses.find(c => c.CoursesTitle === course);
    return selectedCourse?.Topics || [];
  }, [course, currentPath]);

  // Get available lessons for selected topic
  const availableLessons = useMemo(() => {
    if (!topic || !availableTopics.length) return [];
    const selectedTopic = availableTopics.find(t => t.TopicsTitle === topic);
    return selectedTopic?.lessons || [];
  }, [topic, availableTopics]);

  // Get IDs for selected items
  const getSelectedIds = useMemo(() => {
    if (!currentPath) return { pathId: null, courseId: null, topicId: null, lessonId: null };

    const pathId = currentPath.id;
    const selectedCourse = currentPath.Courses.find(c => c.CoursesTitle === course);
    const courseId = selectedCourse?.id || null;
    const selectedTopic = selectedCourse?.Topics.find(t => t.TopicsTitle === topic);
    const topicId = selectedTopic?.id || null;
    const selectedLesson = selectedTopic?.lessons.find(l => l.name === lesson);
    const lessonId = selectedLesson?.id || null;

    return { pathId, courseId, topicId, lessonId };
  }, [currentPath, course, topic, lesson]);

  // Reset dependent selections when category or course changes
  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setCourse("");
    setTopic("");
    setLesson("");
  };

  const handleCourseChange = (newCourse) => {
    setCourse(newCourse);
    setTopic("");
    setLesson("");
  };

  const handleTopicChange = (newTopic) => {
    setTopic(newTopic);
    setLesson("");
  };

  // Quiz state
  const [quizTitle, setQuizTitle] = useState("");
  const [quizCategory, setQuizCategory] = useState("Autism");
  const [quizCourse, setQuizCourse] = useState("");
  const [quizTopic, setQuizTopic] = useState("");
  const [quizLesson, setQuizLesson] = useState("");
  const [quizDifficulty, setQuizDifficulty] = useState("Easy");
  const [pairs, setPairs] = useState(Array(3).fill(null).map(() => ({ q: "", a: "" })));

  // Get current path for quiz based on quiz category
  const quizCurrentPath = useMemo(() => {
    const pathKey = quizCategory === "Autism" ? "autism" : "downSyndrome";
    return curriculumData.find(p => p.GeneralPath === pathKey);
  }, [quizCategory, curriculumData]);

  // Get available courses for quiz category
  const quizAvailableCourses = useMemo(() => {
    return quizCurrentPath?.Courses || [];
  }, [quizCurrentPath]);

  // Get available topics for selected quiz course
  const quizAvailableTopics = useMemo(() => {
    if (!quizCourse || !quizCurrentPath) return [];
    const selectedCourse = quizCurrentPath.Courses.find(c => c.CoursesTitle === quizCourse);
    return selectedCourse?.Topics || [];
  }, [quizCourse, quizCurrentPath]);

  // Get available lessons for selected quiz topic
  const quizAvailableLessons = useMemo(() => {
    if (!quizTopic || !quizAvailableTopics.length) return [];
    const selectedTopic = quizAvailableTopics.find(t => t.TopicsTitle === quizTopic);
    return selectedTopic?.lessons || [];
  }, [quizTopic, quizAvailableTopics]);

  // Get IDs for selected quiz items
  const getSelectedQuizIds = useMemo(() => {
    if (!quizCurrentPath) return { pathId: null, courseId: null, topicId: null, lessonId: null };

    const pathId = quizCurrentPath.id;
    const selectedCourse = quizCurrentPath.Courses.find(c => c.CoursesTitle === quizCourse);
    const courseId = selectedCourse?.id || null;
    const selectedTopic = selectedCourse?.Topics.find(t => t.TopicsTitle === quizTopic);
    const topicId = selectedTopic?.id || null;
    const selectedLesson = selectedTopic?.lessons.find(l => l.name === quizLesson);
    const lessonId = selectedLesson?.id || null;

    return { pathId, courseId, topicId, lessonId };
  }, [quizCurrentPath, quizCourse, quizTopic, quizLesson]);

  // Reset dependent selections when quiz category or course changes
  const handleQuizCategoryChange = (newCategory) => {
    setQuizCategory(newCategory);
    setQuizCourse("");
    setQuizTopic("");
    setQuizLesson("");
  };

  const handleQuizCourseChange = (newCourse) => {
    setQuizCourse(newCourse);
    setQuizTopic("");
    setQuizLesson("");
  };

  const handleQuizTopicChange = (newTopic) => {
    setQuizTopic(newTopic);
    setQuizLesson("");
  };

  const selectFileType = (type) => {
    if (fileType === type) {
      setFileType("");
    } else {
      setFileType(type);
    }
    setShowFileTypeList(false);
  };

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = "Title is required";
    if (!desc.trim()) e.desc = "Description is required";
    if (!file) {
      e.file = "File is required";
    } else {
      // Validate file type matches selected type
      const fileMimeType = file.type || '';
      if (fileType === 'video' && !fileMimeType.startsWith('video/')) {
        e.file = "Selected file is not a video. Please select a video file or change the file type.";
      } else if (fileType === 'image' && !fileMimeType.startsWith('image/')) {
        e.file = "Selected file is not an image. Please select an image file or change the file type.";
      } else if (fileType === 'document' && (fileMimeType.startsWith('video/') || fileMimeType.startsWith('image/'))) {
        e.file = "Selected file type doesn't match. Please select the correct file type.";
      }
    }
    if (!fileType) e.fileType = "File type is required";
    if (!course) e.course = "Course is required";
    if (!topic) e.topic = "Topic is required";
    if (!lesson) e.lesson = "Lesson is required";
    if (!difficulty) e.difficulty = "Difficulty is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveContent = async (status) => {
    if (!validate()) return;

    if (!mongoToken) {
      showToast("Please log in to save content", "error");
      return;
    }

    // Check Firebase auth - wait for auth state to be determined
    let currentUser = auth.currentUser;
    if (!currentUser) {
      // Wait for Firebase auth state to initialize (up to 3 seconds)
      await new Promise((resolve) => {
        let resolved = false;
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (!resolved) {
            resolved = true;
            unsubscribe();
            resolve();
          }
        });
        // Timeout after 3 seconds
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            unsubscribe();
            resolve();
          }
        }, 3000);
      });
      currentUser = auth.currentUser;
    }

    // If still no Firebase user authenticated, we cannot upload
    // Firebase Storage requires Firebase Auth authentication
    if (!currentUser) {
      showToast("Firebase authentication required. Please log out and log in again.", "error");
      navigate('/all-login');
      return;
    }

    // Verify the user has a valid Firebase Auth token
    try {
      const token = await currentUser.getIdToken();
      if (!token) {
        throw new Error('No Firebase token available');
      }
    } catch (tokenError) {
      console.error('Firebase token error:', tokenError);
      showToast("Authentication expired. Please log out and log in again.", "error");
      navigate('/all-login');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Determine the correct storage folder based on actual file type
      // Check the file's MIME type to ensure it matches the selected type
      const fileMimeType = file.type || '';
      let actualFileType = fileType;

      // Auto-detect file type from MIME type if it doesn't match selection
      if (fileMimeType.startsWith('video/')) {
        actualFileType = 'video';
      } else if (fileMimeType.startsWith('image/')) {
        actualFileType = 'image';
      } else if (fileMimeType.startsWith('application/') || fileMimeType.startsWith('text/') || !fileMimeType) {
        // PDFs, Word docs, text files, or files without MIME type go to documents
        actualFileType = 'document';
      }

      // Warn if selected type doesn't match actual file type
      if (actualFileType !== fileType) {
        console.warn(`File type mismatch: Selected "${fileType}" but file is "${actualFileType}". Using "${actualFileType}".`);
        showToast(`File type auto-corrected from "${fileType}" to "${actualFileType}" based on file content.`, "error");
      }

      // Map fileType to Firebase Storage folder names (plural)
      const folderMap = {
        'document': 'documents',
        'video': 'videos',
        'image': 'images'
      };
      const storageFolder = folderMap[actualFileType] || 'documents'; // Default to documents

      if (!storageFolder) {
        throw new Error('Invalid file type selected');
      }

      console.log('File upload details:', {
        selectedType: fileType,
        actualType: actualFileType,
        mimeType: fileMimeType,
        folder: storageFolder,
        fileName: file.name
      });

      const uploadResult = await uploadFile(
        file,
        storageFolder,
        currentUser.uid,
        (progress) => setUploadProgress(progress)
      );

      // Step 2: Save content to MongoDB
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const contentStatus = status === "Published" ? "published" : "draft";

      // Normalize category
      const categoryMap = { 'Autism': 'autism', 'Down Syndrome': 'downSyndrome' };
      const normalizedCategory = categoryMap[category] || category.toLowerCase();

      // Use the actual detected file type for MongoDB, not the user's selection
      const mongoType = actualFileType || fileType;

      // Debug: Log the IDs being sent
      console.log('Selected IDs for content:', getSelectedIds);
      console.log('Course:', course, 'Topic:', topic, 'Lesson:', lesson);

      const response = await fetch(`${API_URL}/api/content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mongoToken}`
        },
        body: JSON.stringify({
          title: title.trim(),
          category: normalizedCategory,
          type: mongoType, // Use actual detected type
          topic: topic,
          lesson: lesson,
          course: course,
          // Add IDs for proper linking
          pathId: getSelectedIds.pathId,
          courseId: getSelectedIds.courseId,
          topicId: getSelectedIds.topicId,
          lessonId: getSelectedIds.lessonId,
          description: desc.trim(),
          difficulty: difficulty || null,
          url: uploadResult.url,
          storagePath: uploadResult.path,
          fileType: file.type || '',
          size: file.size,
          firebaseUid: currentUser.uid,
          status: contentStatus
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Include validation details if available
        const errorMessage = errorData.details && Array.isArray(errorData.details)
          ? `${errorData.error || 'Validation error'}: ${errorData.details.map(d => d.message || d).join(', ')}`
          : errorData.error || errorData.message || 'Failed to save content';
        throw new Error(errorMessage);
      }

      const savedContent = await response.json();

      showToast(
        status === "Published" ? "Content published successfully!" : "Content saved as draft",
        "success"
      );

      // Refresh content list
      await fetchContent();

      // Clear form if published
      if (status === "Published") {
        setTitle("");
        setDesc("");
        setFile(null);
        setFileType("");
        setCourse("");
        setTopic("");
        setLesson("");
        setDifficulty("");
        setUploadProgress(0);
      } else {
        // For drafts, just reset progress
        setUploadProgress(0);
      }
    } catch (error) {
      console.error('Error saving content:', error);
      showToast(`Failed to save content: ${error.message}`, "error");
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const onSaveDraft = () => saveContent("Draft");
  const onPublish = () => saveContent("Published");

  // Publish draft content
  const publishDraftContent = async (contentId) => {
    if (!mongoToken) {
      showToast("Please log in to publish content", "error");
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/content/${contentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mongoToken}`
        },
        body: JSON.stringify({
          status: 'published'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to publish content');
      }

      showToast("Content published successfully", "success");
      await fetchContent(); // Refresh content list
    } catch (error) {
      console.error('Error publishing content:', error);
      showToast(`Failed to publish content: ${error.message}`, "error");
    }
  };

  // Archive content (only for published content)
  const archiveContent = async (contentId) => {
    if (!mongoToken) {
      showToast("Please log in to archive content", "error");
      return;
    }

    // Find the content item to get its current status
    const contentItem = contentRows.find(item => item.id === contentId);
    if (!contentItem) {
      showToast("Content not found", "error");
      return;
    }

    // Only allow archiving published content
    if (contentItem.status !== 'Published') {
      showToast("Only published content can be archived. Please publish the content first.", "error");
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/content/${contentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mongoToken}`
        },
        body: JSON.stringify({
          status: 'archived',
          previousStatus: 'published' // Store previous status as published
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to archive content');
      }

      showToast("Content archived successfully", "success");
      await fetchContent(); // Refresh content list
    } catch (error) {
      console.error('Error archiving content:', error);
      showToast(`Failed to archive content: ${error.message}`, "error");
    }
  };

  // Restore archived content to its previous status
  const restoreContent = async (contentId, previousStatus) => {
    if (!mongoToken) {
      showToast("Please log in to restore content", "error");
      return;
    }

    // If no previous status, default to 'published'
    const restoreStatus = previousStatus || 'published';

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/content/${contentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mongoToken}`
        },
        body: JSON.stringify({
          status: restoreStatus,
          previousStatus: null // Clear previous status since it's no longer archived
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to restore content');
      }

      const statusText = restoreStatus === 'published' ? 'published' : 'draft';
      showToast(`Content restored to ${statusText} successfully`, "success");
      await fetchContent(); // Refresh content list
    } catch (error) {
      console.error('Error restoring content:', error);
      showToast(`Failed to restore content: ${error.message}`, "error");
    }
  };

  // Delete content
  const deleteContent = async (contentId, storagePath) => {
    if (!mongoToken) {
      showToast("Please log in to delete content", "error");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this content? This action cannot be undone.")) {
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/content/${contentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${mongoToken}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete content');
      }

      const result = await response.json();

      // Delete file from Firebase Storage if storagePath is provided
      if (result.storagePath && storagePath) {
        try {
          const { deleteFileByPath } = await import('../utils/uploadFile');
          await deleteFileByPath(storagePath);
        } catch (storageError) {
          console.error('Error deleting file from Firebase Storage:', storageError);
          // Continue anyway - file might already be deleted
        }
      }

      showToast("Content deleted successfully", "success");
      await fetchContent(); // Refresh content list
    } catch (error) {
      console.error('Error deleting content:', error);
      showToast(`Failed to delete content: ${error.message}`, "error");
    }
  };

  const addPair = () => {
    if (pairs.length >= 10) {
      showToast("Maximum 10 questions allowed", "error");
      return;
    }
    setPairs([...pairs, { q: "", a: "" }]);
  };

  const removePair = (idx) => {
    if (pairs.length <= 3) {
      showToast("Minimum 3 questions required", "error");
      return;
    }
    setPairs(pairs.filter((_, i) => i !== idx));
  };

  const saveQuiz = async (status) => {
    if (!quizTitle.trim()) {
      showToast("Quiz title is required", "error");
      return;
    }
    if (!quizCourse || !quizTopic || !quizLesson) {
      showToast("Please select course, topic, and lesson", "error");
      return;
    }
    if (!quizDifficulty) {
      showToast("Please select difficulty level", "error");
      return;
    }
    if (pairs.length < 3) {
      showToast("Minimum 3 questions required", "error");
      return;
    }
    if (pairs.some(p => !p.q.trim() || !p.a.trim())) {
      showToast("Please fill in all questions and answers", "error");
      return;
    }

    if (!mongoToken) {
      showToast("Please log in to save quiz", "error");
      navigate('/all-login');
      return;
    }

    try {
      showToast("Generating wrong answers with AI...", "success");

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      // Step 1: Generate wrong answers using AI
      const questionsForAI = pairs.map(p => ({
        question: p.q.trim(),
        correctAnswer: p.a.trim()
      }));

      const aiResponse = await fetch(`${API_URL}/api/ai/quiz/generate-wrong-answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questions: questionsForAI,
          course: quizCourse,
          topic: quizTopic,
          lesson: quizLesson,
          category: quizCategory,
          difficulty: quizDifficulty
        })
      });

      if (!aiResponse.ok) {
        const errorData = await aiResponse.json();
        throw new Error(errorData.error || 'Failed to generate wrong answers');
      }

      const aiData = await aiResponse.json();
      const questionsWithWrongAnswers = aiData.data.questions;

      // Step 2: Save quiz to MongoDB with wrong answers
      const categoryMap = { 'Autism': 'autism', 'Down Syndrome': 'downSyndrome' };
      const normalizedCategory = categoryMap[quizCategory] || quizCategory.toLowerCase();

      // Transform questions to include wrong answers
      const questionsAndAnswers = questionsWithWrongAnswers.map(q => ({
        question: q.question,
        correctAnswer: q.correctAnswer,
        wrongAnswers: q.wrongAnswers || []
      }));

      const quizResponse = await fetch(`${API_URL}/api/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mongoToken}`
        },
        body: JSON.stringify({
          title: quizTitle.trim(),
          category: normalizedCategory,
          topic: quizTopic,
          lesson: quizLesson,
          course: quizCourse,
          // Add IDs for proper linking
          pathId: getSelectedQuizIds.pathId,
          courseId: getSelectedQuizIds.courseId,
          topicId: getSelectedQuizIds.topicId,
          lessonId: getSelectedQuizIds.lessonId,
          difficulty: quizDifficulty,
          questionsAndAnswers: questionsAndAnswers,
          status: status === "Published" ? "published" : "draft"
        })
      });

      if (!quizResponse.ok) {
        const errorData = await quizResponse.json();
        throw new Error(errorData.error || 'Failed to save quiz');
      }

      showToast(status === "Published" ? "Quiz published successfully!" : "Quiz saved as draft.", "success");

      // Refresh quizzes list
      await fetchQuizzes();

      // Clear all fields after saving (both draft and published)
      setQuizTitle("");
      setQuizCategory("Autism");
      setQuizCourse("");
      setQuizTopic("");
      setQuizLesson("");
      setQuizDifficulty("Easy");
      setPairs(Array(3).fill(null).map(() => ({ q: "", a: "" })));
    } catch (error) {
      console.error('Error saving quiz:', error);
      showToast(`Error: ${error.message}`, "error");
    }
  };

  const onPublishQuiz = () => saveQuiz("Published");
  const onSaveQuizDraft = () => saveQuiz("Draft");

  // Publish draft quiz
  const publishDraftQuiz = async (quizId) => {
    if (!mongoToken) {
      showToast("Please log in to publish quiz", "error");
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/quizzes/${quizId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mongoToken}`
        },
        body: JSON.stringify({
          status: 'published'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to publish quiz');
      }

      showToast("Quiz published successfully", "success");
      await fetchQuizzes(); // Refresh quizzes list
    } catch (error) {
      console.error('Error publishing quiz:', error);
      showToast(`Failed to publish quiz: ${error.message}`, "error");
    }
  };

  // Archive quiz (only for published quizzes)
  const archiveQuiz = async (quizId) => {
    if (!mongoToken) {
      showToast("Please log in to archive quiz", "error");
      return;
    }

    // Find the quiz item to get its current status
    const quizItem = quizRows.find(item => item.id === quizId);
    if (!quizItem) {
      showToast("Quiz not found", "error");
      return;
    }

    // Only allow archiving published quizzes
    if (quizItem.status !== 'Published') {
      showToast("Only published quizzes can be archived. Please publish the quiz first.", "error");
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/quizzes/${quizId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mongoToken}`
        },
        body: JSON.stringify({
          status: 'archived',
          previousStatus: 'published' // Store previous status as published
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to archive quiz');
      }

      showToast("Quiz archived successfully", "success");
      await fetchQuizzes(); // Refresh quizzes list
    } catch (error) {
      console.error('Error archiving quiz:', error);
      showToast(`Failed to archive quiz: ${error.message}`, "error");
    }
  };

  // Restore archived quiz
  const restoreQuiz = async (quizId, previousStatus) => {
    if (!mongoToken) {
      showToast("Please log in to restore quiz", "error");
      return;
    }

    // If no previous status, default to 'published'
    const restoreStatus = previousStatus || 'published';

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/quizzes/${quizId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mongoToken}`
        },
        body: JSON.stringify({
          status: restoreStatus,
          previousStatus: null // Clear previous status since it's no longer archived
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to restore quiz');
      }

      const statusText = restoreStatus === 'published' ? 'published' : 'draft';
      showToast(`Quiz restored to ${statusText} successfully`, "success");
      await fetchQuizzes(); // Refresh quizzes list
    } catch (error) {
      console.error('Error restoring quiz:', error);
      showToast(`Failed to restore quiz: ${error.message}`, "error");
    }
  };

  // Delete quiz
  const deleteQuiz = async (quizId) => {
    if (!mongoToken) {
      showToast("Please log in to delete quiz", "error");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) {
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${mongoToken}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete quiz');
      }

      showToast("Quiz deleted successfully", "success");
      await fetchQuizzes(); // Refresh quizzes list
    } catch (error) {
      console.error('Error deleting quiz:', error);
      showToast(`Failed to delete quiz: ${error.message}`, "error");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
    navigate("/all-login", { replace: true });
  };

  // Scroll detection for chatbot animation
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setScrollDirection("down");
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection("up");
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownOpen && !event.target.closest('.ld-profile-container')) {
        setProfileDropdownOpen(false);
      }
    };

    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [profileDropdownOpen]);

  // Close file type dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFileTypeList && !event.target.closest('.ld-upload-field')) {
        setShowFileTypeList(false);
      }
    };

    if (showFileTypeList) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showFileTypeList]);

  const handleChatbotClick = () => {
    console.log("Chatbot clicked");
  };

  // Sidebar items
  const sidebarItems = [
    {
      key: "course",
      label: "Course",
      icon: <img src={icCourse} alt="" style={{ width: "24px", height: "24px" }} />,
      onClick: () => navigate("/instructor-dashboard-2")
    },
    {
      key: "performance",
      label: "Performance",
      icon: <img src={icPerformance} alt="" style={{ width: "24px", height: "24px" }} />,
      onClick: () => navigate("/instructor-dashboard-2")
    },
    {
      key: "curriculum",
      label: "Curriculum",
      icon: <img src={icCurriculum} alt="" style={{ width: "24px", height: "24px" }} />,
      onClick: () => navigate("/instructor-dashboard-2")
    },
    {
      key: "resources",
      label: "Resources",
      icon: <img src={icResources} alt="" style={{ width: "24px", height: "24px" }} />,
      onClick: () => navigate("/instructor-dashboard-2")
    },
  ];

  const handleSidebarEnter = () => {
    if (sidebarCollapsed) setSidebarCollapsed(false);
  };

  const handleSidebarLeave = () => {
    if (!sidebarCollapsed) setSidebarCollapsed(true);
  };

  // Sample data for content and quizzes (no backend)
  const [contentRows, setContentRows] = useState([]);
  const [archivedRows, setArchivedRows] = useState([]);
  const [quizRows, setQuizRows] = useState([]);
  const [archivedQuizRows, setArchivedQuizRows] = useState([]);

  if (loading) {
    return (
      <div className="ld-page">
        <div className="ld-main" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ld-page">
      {/* Left Sidebar */}
      <aside
        className={`ld-sidebar-expandable ${sidebarCollapsed ? "collapsed" : ""}`}
        onMouseEnter={handleSidebarEnter}
        onMouseLeave={handleSidebarLeave}
      >
        <div className="ld-sidebar-inner">
          <Link to="/instructor-dashboard-2" className="ld-sidebar-brand">
            <img
              className="ld-sidebar-logo"
              src={sidebarCollapsed ? smallLogo : fullLogo}
              alt="LearnEase"
            />
          </Link>

          <ul className="ld-sidebar-nav">
            {sidebarItems.map((item) => (
              <li key={item.key}>
                {item.to ? (
                  <Link to={item.to} className="ld-sidebar-link">
                    <span className="ld-sidebar-icon-wrapper">{item.icon}</span>
                    <span className="ld-sidebar-label">{item.label}</span>
                  </Link>
                ) : (
                  <button onClick={item.onClick} className="ld-sidebar-link">
                    <span className="ld-sidebar-icon-wrapper">{item.icon}</span>
                    <span className="ld-sidebar-label">{item.label}</span>
                  </button>
                )}
              </li>
            ))}
          </ul>

          <div className="ld-sidebar-footer">
            <button className="ld-sidebar-link ld-sidebar-logout" onClick={handleLogout}>
              <span className="ld-sidebar-icon-wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </span>
              <span className="ld-sidebar-label">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`ld-main ${sidebarCollapsed ? "sidebar-collapsed" : "sidebar-expanded"}`}>
        {/* Header */}
        <header className="ld-header">
          <div className="ld-header-left">
            <button className="ld-back-btn" onClick={() => navigate("/instructor-dashboard-2")}>
              <span className="ld-back-chev">‹</span> Dashboard
            </button>
          </div>
          <div className="ld-header-center">
            <h1 className="ld-upload-header-title">Publishing</h1>
          </div>
          <div className="ld-header-right">
            <div className="ld-profile-container">
              <button
                className="ld-profile-trigger"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <div className="ld-profile-avatar-wrapper">
                  <ProfileAvatar
                    src={profilePic}
                    name={instructorName}
                    className="ld-profile-avatar-image"
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                    fallbackClassName="ld-profile-avatar"
                  />
                  <div className="ld-profile-status-indicator"></div>
                </div>
                <div className="ld-profile-info">
                  <div className="ld-profile-name">{instructorName}</div>
                  {email && <div className="ld-profile-email">{email}</div>}
                </div>
                <svg
                  className={`ld-profile-chevron ${profileDropdownOpen ? 'open' : ''}`}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              {profileDropdownOpen && (
                <div className="ld-profile-dropdown">
                  <div className="ld-profile-dropdown-header">
                    <ProfileAvatar
                      src={profilePic}
                      name={instructorName}
                      className="ld-profile-dropdown-avatar-img"
                      fallbackClassName="ld-profile-dropdown-avatar"
                    />
                    <div className="ld-profile-dropdown-info">
                      <div className="ld-profile-dropdown-name">{instructorName}</div>
                      <div className="ld-profile-dropdown-email">{email || 'No email'}</div>
                    </div>
                  </div>
                  <div className="ld-profile-dropdown-divider"></div>
                  <Link to="/profile-2" className="ld-profile-dropdown-item" onClick={() => setProfileDropdownOpen(false)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span>Profile</span>
                  </Link>
                  <button className="ld-profile-dropdown-item" onClick={handleLogout}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="ld-content">
          {/* Publishing Section */}
          <section className="ld-upload-section-main">
            <div className="ld-upload-card-main">
              <div className="ld-upload-form-row">
                <div className="ld-upload-field">
                  <label>Choose a title for your content*:</label>
                  <input
                    className={`ld-upload-input ${errors.title ? "ld-upload-error" : ""}`}
                    placeholder="Give a title to your content"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  {errors.title && <span className="ld-upload-error-text">{errors.title}</span>}
                </div>

                <div className="ld-upload-field">
                  <label>Choose file type*:</label>
                  <div
                    className="ld-upload-tagbox"
                    onClick={() => setShowFileTypeList((s) => !s)}
                    role="button"
                    tabIndex={0}
                  >
                    {!fileType ? (
                      <span className="ld-upload-placeholder">Choose file type (document, video, or image)</span>
                    ) : (
                      <div className="ld-upload-chips">
                        <span className="ld-upload-chip">
                          {fileType.charAt(0).toUpperCase() + fileType.slice(1)}
                        </span>
                      </div>
                    )}
                    <span className="ld-upload-caret">▾</span>
                  </div>
                  {errors.fileType && <span className="ld-upload-error-text">{errors.fileType}</span>}

                  {showFileTypeList && (
                    <ul className="ld-upload-taglist">
                      {FILE_TYPES.map((type) => (
                        <li key={type}>
                          <button
                            type="button"
                            className={`ld-upload-tagitem ${fileType === type ? "selected" : ""}`}
                            onClick={() => selectFileType(type)}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div
                className="ld-upload-area"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('ld-upload-dragover');
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('ld-upload-dragover');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('ld-upload-dragover');
                  setFile(e.dataTransfer.files?.[0] || null);
                }}
              >
                <input
                  id="ld-upload-file"
                  type="file"
                  accept=".mp4,.mov,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  style={{ display: 'none' }}
                />
                {!file ? (
                  <>
                    <div className="ld-upload-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 18V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M9 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="ld-upload-content-text">
                      <p className="ld-upload-text">
                        <label htmlFor="ld-upload-file" className="ld-upload-link">Click to upload</label> or drag and drop
                      </p>
                      <small className="ld-upload-hint">PDF, DOC, DOCX, MP4, MOV, JPG, PNG, GIF (Max 800MB)</small>
                    </div>
                  </>
                ) : (
                  <div className="ld-upload-file-selected">
                    <div className="ld-upload-file-icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="ld-upload-file-info">
                      <div className="ld-upload-filename">{file.name}</div>
                      <small className="ld-upload-file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</small>
                    </div>
                    <label htmlFor="ld-upload-file" className="ld-upload-change-btn">Change</label>
                  </div>
                )}
                {errors.file && <span className="ld-upload-error-text">{errors.file}</span>}
                {isUploading && (
                  <div className="ld-upload-progress">
                    <div className="ld-upload-progress-bar">
                      <div
                        className="ld-upload-progress-fill"
                        style={{ width: `${uploadProgress}%` }}
                      >
                        <span className="ld-upload-progress-text">{Math.round(uploadProgress)}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="ld-upload-categories">
                <span>Category:</span>
                <button
                  type="button"
                  className={`ld-upload-catbtn ${category === "Down Syndrome" ? "active" : ""}`}
                  onClick={() => handleCategoryChange("Down Syndrome")}
                >
                  Down Syndrome
                </button>
                <button
                  type="button"
                  className={`ld-upload-catbtn ${category === "Autism" ? "active" : ""}`}
                  onClick={() => handleCategoryChange("Autism")}
                >
                  Autism
                </button>
              </div>

              <div className="ld-upload-selects-grid">
                <div className="ld-upload-field">
                  <label>Select Course:</label>
                  <select
                    className={`ld-upload-input ${errors.course ? "ld-upload-error" : ""}`}
                    value={course}
                    onChange={(e) => handleCourseChange(e.target.value)}
                    disabled={!availableCourses.length}
                  >
                    <option value="" disabled>Choose a course</option>
                    {availableCourses.map(c => (
                      <option key={c.CoursesTitle} value={c.CoursesTitle}>{c.CoursesTitle}</option>
                    ))}
                  </select>
                  {errors.course && <span className="ld-upload-error-text">{errors.course}</span>}
                </div>

                <div className="ld-upload-field">
                  <label>Select Topic:</label>
                  <select
                    className={`ld-upload-input ${errors.topic ? "ld-upload-error" : ""}`}
                    value={topic}
                    onChange={(e) => handleTopicChange(e.target.value)}
                    disabled={!course || !availableTopics.length}
                  >
                    <option value="" disabled>Choose a topic</option>
                    {availableTopics.map(t => (
                      <option key={t.TopicsTitle} value={t.TopicsTitle}>{t.TopicsTitle}</option>
                    ))}
                  </select>
                  {errors.topic && <span className="ld-upload-error-text">{errors.topic}</span>}
                </div>

                <div className="ld-upload-field">
                  <label>Select Lesson:</label>
                  <select
                    className={`ld-upload-input ${errors.lesson ? "ld-upload-error" : ""}`}
                    value={lesson}
                    onChange={(e) => setLesson(e.target.value)}
                    disabled={!topic || !availableLessons.length}
                  >
                    <option value="" disabled>Choose a lesson</option>
                    {availableLessons.map(l => (
                      <option key={l.id} value={l.name}>{l.name}</option>
                    ))}
                  </select>
                  {errors.lesson && <span className="ld-upload-error-text">{errors.lesson}</span>}
                </div>

                <div className="ld-upload-field">
                  <label>Select Difficulty*:</label>
                  <select
                    className={`ld-upload-input ${errors.difficulty ? "ld-upload-error" : ""}`}
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    <option value="" disabled>Choose difficulty</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                  {errors.difficulty && <span className="ld-upload-error-text">{errors.difficulty}</span>}
                </div>
              </div>

              <div className="ld-upload-field">
                <label>Description*:</label>
                <textarea
                  className={`ld-upload-textarea ${errors.desc ? "ld-upload-error" : ""}`}
                  placeholder="Give a description to your content"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
                {errors.desc && <span className="ld-upload-error-text">{errors.desc}</span>}
              </div>

              <div className="ld-upload-actions">
                <button
                  className="ld-upload-secondary"
                  onClick={onSaveDraft}
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Save as Draft"}
                </button>
                <button
                  className="ld-upload-primary"
                  onClick={onPublish}
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Publish"}
                </button>
              </div>
            </div>
          </section>

          {/* Quiz Section */}
          <section className="ld-upload-section-main">
            <h2 className="ld-upload-section-title">Quiz</h2>
            <div className="ld-upload-card-main">
              <div className="ld-upload-quiz-top">
                <div className="ld-upload-field">
                  <label>Title of the quiz*:</label>
                  <input
                    className="ld-upload-input"
                    placeholder="Give your question here"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                  />
                </div>
                <div className="ld-upload-field">
                  <label>Category:</label>
                  <div className="ld-upload-categories ld-upload-no-margin">
                    <button
                      type="button"
                      className={`ld-upload-catbtn ${quizCategory === "Down Syndrome" ? "active" : ""}`}
                      onClick={() => handleQuizCategoryChange("Down Syndrome")}
                    >
                      Down Syndrome
                    </button>
                    <button
                      type="button"
                      className={`ld-upload-catbtn ${quizCategory === "Autism" ? "active" : ""}`}
                      onClick={() => handleQuizCategoryChange("Autism")}
                    >
                      Autism
                    </button>
                  </div>
                </div>
              </div>

              <div className="ld-upload-quiz-note">Choose the course, topic, and lesson this quiz will be associated.</div>

              <div className="ld-upload-quiz-selects">
                <select
                  className="ld-upload-input ld-upload-quiz-select"
                  value={quizCourse}
                  onChange={(e) => handleQuizCourseChange(e.target.value)}
                  disabled={!quizAvailableCourses.length}
                >
                  <option value="" disabled>Course</option>
                  {quizAvailableCourses.map(c => (
                    <option key={c.CoursesTitle} value={c.CoursesTitle}>{c.CoursesTitle}</option>
                  ))}
                </select>
                <select
                  className="ld-upload-input ld-upload-quiz-select"
                  value={quizTopic}
                  onChange={(e) => handleQuizTopicChange(e.target.value)}
                  disabled={!quizCourse || !quizAvailableTopics.length}
                >
                  <option value="" disabled>Topic</option>
                  {quizAvailableTopics.map(t => (
                    <option key={t.TopicsTitle} value={t.TopicsTitle}>{t.TopicsTitle}</option>
                  ))}
                </select>
                <select
                  className="ld-upload-input ld-upload-quiz-select"
                  value={quizLesson}
                  onChange={(e) => setQuizLesson(e.target.value)}
                  disabled={!quizTopic || !quizAvailableLessons.length}
                >
                  <option value="" disabled>Lesson</option>
                  {quizAvailableLessons.map(l => (
                    <option key={l.id} value={l.name}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div className="ld-upload-field">
                <label>Difficulty*:</label>
                <div className="ld-upload-difficulty-pills">
                  {["Easy", "Medium", "Hard"].map((d) => (
                    <button
                      type="button"
                      key={d}
                      className={`ld-upload-difficulty-pill ${quizDifficulty === d ? "active" : ""}`}
                      onClick={() => setQuizDifficulty(d)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="ld-upload-quiz-count">
                Questions: {pairs.length} / 10 (Minimum: 3)
              </div>

              {pairs.map((p, i) => (
                <div key={i} className="ld-upload-qa-row">
                  <div className="ld-upload-field">
                    <label>Question for the quiz*:</label>
                    <input
                      className="ld-upload-input"
                      placeholder="Give your question here"
                      value={p.q}
                      onChange={(e) => {
                        const next = [...pairs];
                        next[i].q = e.target.value;
                        setPairs(next);
                      }}
                    />
                  </div>
                  <div className="ld-upload-field">
                    <label>Answer for the question*:</label>
                    <input
                      className="ld-upload-input"
                      placeholder="Give your answer here"
                      value={p.a}
                      onChange={(e) => {
                        const next = [...pairs];
                        next[i].a = e.target.value;
                        setPairs(next);
                      }}
                    />
                  </div>

                  {pairs.length > 3 && (
                    <button
                      type="button"
                      className="ld-upload-quiz-remove"
                      onClick={() => removePair(i)}
                      title="Remove this Q/A (Minimum 3 questions required)"
                    >
                      −
                    </button>
                  )}

                  {i === pairs.length - 1 && pairs.length < 10 && (
                    <button type="button" className="ld-upload-quiz-add" onClick={addPair} title="Add question (Maximum 10 questions)">+</button>
                  )}
                </div>
              ))}

              <div className="ld-upload-actions">
                <button className="ld-upload-secondary" onClick={onSaveQuizDraft}>Save as Draft</button>
                <button className="ld-upload-primary" onClick={onPublishQuiz}>Publish</button>
              </div>
            </div>
          </section>

          {/* Content List Section */}
          <section className="ld-upload-section-main">
            <h2 className="ld-upload-section-title">Content</h2>
            <div className="ld-upload-content-card">
              <div className="ld-upload-content-head">
                <span>Content title</span>
                <span>Category</span>
                <span>Status</span>
                <span className="ld-upload-actions-col">Actions</span>
              </div>
              <div className={`ld-upload-content-rows ${contentRows.length === 0 ? 'ld-upload-content-rows-empty' : ''}`}>
                {contentRows.length === 0 ? (
                  <div className="ld-upload-empty">
                    <div className="ld-upload-empty-icon">📄</div>
                    <p className="ld-upload-empty-text">No content yet</p>
                    <p className="ld-upload-empty-subtext">Create and publish your first content to see it here</p>
                  </div>
                ) : (
                  contentRows.map((row) => (
                    <div key={row.id} className="ld-upload-content-row">
                      <div className="ld-upload-content-title">{row.title}</div>
                      <div className="ld-upload-pill">{row.category}</div>
                      <div className={`ld-upload-status-pill ${row.status === "Published" ? "ld-upload-status-green" :
                          row.status === "Draft" ? "ld-upload-status-red" : "ld-upload-status-yellow"
                        }`}>
                        {row.status}
                      </div>
                      <div className="ld-upload-content-actions">
                        {row.status === "Draft" ? (
                          <button
                            type="button"
                            className="ld-upload-btn-publish"
                            onClick={() => publishDraftContent(row.id)}
                          >
                            Publish
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="ld-upload-btn-arch"
                            onClick={() => archiveContent(row.id)}
                          >
                            Archive
                          </button>
                        )}
                        <button
                          type="button"
                          className="ld-upload-btn-del"
                          onClick={() => deleteContent(row.id, row.storagePath)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Archive Section */}
          <section className="ld-upload-section-main">
            <h2 className="ld-upload-section-title">Archived Content</h2>
            <div className="ld-upload-content-card">
              <div className="ld-upload-content-head">
                <span>Content title</span>
                <span>Category</span>
                <span>Status</span>
                <span className="ld-upload-actions-col">Actions</span>
              </div>
              <div className={`ld-upload-content-rows ${archivedRows.length === 0 ? 'ld-upload-content-rows-empty' : ''}`}>
                {archivedRows.length === 0 ? (
                  <div className="ld-upload-empty">
                    <div className="ld-upload-empty-icon">📦</div>
                    <p className="ld-upload-empty-text">No archived content</p>
                    <p className="ld-upload-empty-subtext">Archived content will appear here</p>
                  </div>
                ) : (
                  archivedRows.map((row) => {
                    // Determine previous status - check if it's stored, otherwise default to 'published'
                    const previousStatus = row.previousStatus || 'published';
                    const restoreStatusText = previousStatus === 'published' ? 'Published' : 'Draft';

                    return (
                      <div key={row.id} className="ld-upload-content-row">
                        <div className="ld-upload-content-title">{row.title}</div>
                        <div className="ld-upload-pill">{row.category}</div>
                        <div className={`ld-upload-status-pill ld-upload-status-yellow`}>
                          {row.status}
                        </div>
                        <div className="ld-upload-content-actions">
                          <button
                            type="button"
                            className="ld-upload-btn-arch"
                            onClick={() => restoreContent(row.id, previousStatus)}
                            title={`Restore to ${restoreStatusText}`}
                          >
                            Restore
                          </button>
                          <button
                            type="button"
                            className="ld-upload-btn-del"
                            onClick={() => deleteContent(row.id, row.storagePath)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          {/* Quizzes List Section */}
          <section className="ld-upload-section-main">
            <h2 className="ld-upload-section-title">Quizzes</h2>
            <div className="ld-upload-content-card">
              <div className="ld-upload-content-head">
                <span>Quiz title</span>
                <span>Category</span>
                <span>Status</span>
                <span className="ld-upload-actions-col">Actions</span>
              </div>
              <div className={`ld-upload-content-rows ${quizRows.length === 0 ? 'ld-upload-content-rows-empty' : ''}`}>
                {quizRows.length === 0 ? (
                  <div className="ld-upload-empty">
                    <div className="ld-upload-empty-icon">📝</div>
                    <p className="ld-upload-empty-text">No quizzes yet</p>
                    <p className="ld-upload-empty-subtext">Create and publish your first quiz to see it here</p>
                  </div>
                ) : (
                  quizRows.map((row) => (
                    <div key={row.id} className="ld-upload-content-row">
                      <div className="ld-upload-content-title">{row.title}</div>
                      <div className="ld-upload-pill">{row.category}</div>
                      <div className={`ld-upload-status-pill ${row.status === "Published" ? "ld-upload-status-green" :
                          row.status === "Draft" ? "ld-upload-status-red" : "ld-upload-status-yellow"
                        }`}>
                        {row.status}
                      </div>
                      <div className="ld-upload-content-actions">
                        {row.status === "Draft" ? (
                          <button
                            type="button"
                            className="ld-upload-btn-publish"
                            onClick={() => publishDraftQuiz(row.id)}
                          >
                            Publish
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="ld-upload-btn-arch"
                            onClick={() => archiveQuiz(row.id)}
                          >
                            Archive
                          </button>
                        )}
                        <button
                          type="button"
                          className="ld-upload-btn-del"
                          onClick={() => deleteQuiz(row.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Archived Quizzes Section */}
          <section className="ld-upload-section-main">
            <h2 className="ld-upload-section-title">Archived Quizzes</h2>
            <div className="ld-upload-content-card">
              <div className="ld-upload-content-head">
                <span>Quiz title</span>
                <span>Category</span>
                <span>Status</span>
                <span className="ld-upload-actions-col">Actions</span>
              </div>
              <div className={`ld-upload-content-rows ${archivedQuizRows.length === 0 ? 'ld-upload-content-rows-empty' : ''}`}>
                {archivedQuizRows.length === 0 ? (
                  <div className="ld-upload-empty">
                    <div className="ld-upload-empty-icon">📦</div>
                    <p className="ld-upload-empty-text">No archived quizzes</p>
                    <p className="ld-upload-empty-subtext">Archived quizzes will appear here</p>
                  </div>
                ) : (
                  archivedQuizRows.map((row) => {
                    // Determine previous status - check if it's stored, otherwise default to 'published'
                    const previousStatus = row.previousStatus || 'published';
                    const restoreStatusText = previousStatus === 'published' ? 'Published' : 'Draft';

                    return (
                      <div key={row.id} className="ld-upload-content-row">
                        <div className="ld-upload-content-title">{row.title}</div>
                        <div className="ld-upload-pill">{row.category}</div>
                        <div className={`ld-upload-status-pill ld-upload-status-yellow`}>
                          {row.status}
                        </div>
                        <div className="ld-upload-content-actions">
                          <button
                            type="button"
                            className="ld-upload-btn-arch"
                            onClick={() => restoreQuiz(row.id, previousStatus)}
                            title={`Restore to ${restoreStatusText}`}
                          >
                            Restore
                          </button>
                          <button
                            type="button"
                            className="ld-upload-btn-del"
                            onClick={() => deleteQuiz(row.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      <ToastComponent />
    </div>
  );
}

