// src/pages/InstructorUpload.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { USER_CURRICULUM } from "../data/curriculum";
import { uploadFile } from "../utils/uploadFile";
import { auth } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";

const FILE_TYPES = [
  "document",
  "video",
  "image"
];

export default function InstructorUpload() {
  const navigate = useNavigate();
  
  // Publishing
  const [title, setTitle] = useState("");
  const [fileType, setFileType] = useState(""); // Single selection: document, video, or image
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

  // Get current path based on category
  const currentPath = useMemo(() => {
    const pathKey = category === "Autism" ? "autism" : "Down Syndrome";
    return USER_CURRICULUM.find(p => p.GeneralPath === pathKey);
  }, [category]);

  // Get available courses for current category
  const availableCourses = useMemo(() => {
    return currentPath?.Courses || [];
  }, [currentPath]);

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

  // Tables
  const [contentRows, setContentRows] = useState([]);
  const [archivedRows, setArchivedRows] = useState([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [quizRows, setQuizRows] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);

  // Fetch content from database
  useEffect(() => {
    const fetchContent = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/content`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const result = await response.json();
          const allContent = result.data || [];
          
          // Separate published/draft from archived
          const active = allContent.filter(c => c.status !== 'archived');
          const archived = allContent.filter(c => c.status === 'archived');
          
          // Map to display format
          const mapContent = (content) => ({
            id: content._id,
            title: content.title,
            category: content.category === 'autism' ? 'Autism' : 'Down Syndrome',
            status: content.status === 'published' ? 'Published' : content.status === 'draft' ? 'Draft' : 'Archived'
          });
          
          setContentRows(active.map(mapContent));
          setArchivedRows(archived.map(mapContent));
        }
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoadingContent(false);
      }
    };

    fetchContent();
  }, []);

  // Fetch quizzes from database
  useEffect(() => {
    const fetchQuizzes = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/quizzes`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const result = await response.json();
          const allQuizzes = result.data || [];
          
          // Filter out archived quizzes
          const active = allQuizzes.filter(q => q.status !== 'archived');
          
          // Map to display format
          const mapQuiz = (quiz) => ({
            id: quiz._id,
            title: quiz.title,
            category: quiz.category === 'autism' ? 'Autism' : 'Down Syndrome',
            status: quiz.status === 'published' ? 'Published' : quiz.status === 'draft' ? 'Draft' : 'Archived',
            difficulty: quiz.difficulty || '-'
          });
          
          setQuizRows(active.map(mapQuiz));
        }
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      } finally {
        setLoadingQuizzes(false);
      }
    };

    fetchQuizzes();
  }, []);

  // Quiz
  const [quizTitle, setQuizTitle] = useState("");
  const [quizCategory, setQuizCategory] = useState("Autism");
  const [quizCourse, setQuizCourse] = useState("");
  const [quizTopic, setQuizTopic] = useState("");
  const [quizLesson, setQuizLesson] = useState("");
  const [pairs, setPairs] = useState(Array(5).fill(null).map(() => ({ q: "", a: "" }))); // Start with 5 questions (minimum)

  // Get current path for quiz based on quiz category
  const quizCurrentPath = useMemo(() => {
    const pathKey = quizCategory === "Autism" ? "autism" : "Down Syndrome";
    return USER_CURRICULUM.find(p => p.GeneralPath === pathKey);
  }, [quizCategory]);

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
      // Deselect if clicking the same type
      setFileType("");
    } else {
      // Select the new type (only one allowed)
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
      // Validate file type
      const fileName = file.name.toLowerCase();
      const validExtensions = ['.pdf', '.doc', '.docx', '.mp4', '.mov', '.jpg', '.jpeg', '.png', '.gif'];
      const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
      
      if (!hasValidExtension) {
        e.file = `Invalid file type. Allowed: ${validExtensions.join(', ')}`;
      } else {
        // Validate file size based on file type
        const isVideo = fileName.endsWith('.mp4') || fileName.endsWith('.mov');
        const isImage = fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png') || fileName.endsWith('.gif');
        const isDocument = fileName.endsWith('.pdf') || fileName.endsWith('.doc') || fileName.endsWith('.docx');
        
        if (isVideo && file.size > 800 * 1024 * 1024) {
          e.file = "Video file is too large. Maximum size is 800MB.";
        } else if (isImage && file.size > 5 * 1024 * 1024) {
          e.file = "Image file is too large. Maximum size is 5MB.";
        } else if (isDocument && file.size > 20 * 1024 * 1024) {
          e.file = "Document file is too large. Maximum size is 20MB.";
        }
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

  // Map file type to storage folder
  const getStorageType = (type) => {
    const folderMap = {
      "document": "documents",
      "video": "videos",
      "image": "images"
    };
    return folderMap[type] || "documents";
  };

  const saveContent = async (status) => {
    if (!validate()) return;

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      alert("Please log in to upload content");
      return;
    }

    // Check Firebase auth - wait for auth state to be determined
    let currentUser = auth.currentUser;
    if (!currentUser) {
      // Wait for Firebase auth state to initialize (up to 2 seconds)
      await new Promise((resolve) => {
        let resolved = false;
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (!resolved) {
            resolved = true;
            unsubscribe();
            resolve();
          }
        });
        // Timeout after 2 seconds
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            unsubscribe();
            resolve();
          }
        }, 2000);
      });
      currentUser = auth.currentUser;
    }

    // If still no Firebase user authenticated, we cannot upload
    // Firebase Storage requires Firebase Auth authentication
    if (!currentUser) {
      alert("Firebase authentication required for file uploads. Please log out and log in again, or ensure you're signed in with Firebase.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Validate file before upload
      if (!file) {
        throw new Error("No file selected");
      }
      
      console.log('Uploading file:', {
        name: file.name,
        size: file.size,
        type: file.type,
        fileType: fileType
      });

      // Upload file to Firebase Storage
      const storageFolder = getStorageType(fileType);
      const uploadResult = await uploadFile(
        file,
        storageFolder,
        currentUser.uid,
        (progress) => setUploadProgress(progress)
      );
      
      console.log('File uploaded successfully:', uploadResult);

      // Save metadata to server
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title,
          category,
          type: fileType, // document, video, or image
          topic,
          lesson,
          course,
          description: desc,
          difficulty,
          url: uploadResult.url,
          storagePath: uploadResult.path,
          fileType: uploadResult.type,
          size: uploadResult.size,
          firebaseUid: uploadResult.firebaseUid,
          status: status === "Published" ? "published" : "draft"
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to save content to MongoDB:', errorData);
        throw new Error(errorData.error || errorData.message || 'Failed to save content');
      }

      const result = await response.json();
      console.log('Content saved to MongoDB:', result);
      
      // Refresh content list
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const refreshResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/content`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (refreshResponse.ok) {
        const refreshResult = await refreshResponse.json();
        const allContent = refreshResult.data || [];
        const active = allContent.filter(c => c.status !== 'archived');
        const mapContent = (content) => ({
          id: content._id,
          title: content.title,
          category: content.category === 'autism' ? 'Autism' : 'Down Syndrome',
          status: content.status === 'published' ? 'Published' : content.status === 'draft' ? 'Draft' : 'Archived'
        });
        setContentRows(active.map(mapContent));
      }
      
      alert(status === "Published" ? "Published!" : "Saved as draft.");
      
      if (status === "Published") {
        // Reset form
        setTitle("");
        setDesc("");
        setFile(null);
        setFileType("");
        setCourse("");
        setTopic("");
        setLesson("");
        setDifficulty("");
        setUploadProgress(0);
      }
    } catch (error) {
      console.error('Upload error:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack,
        file: file ? { name: file.name, size: file.size, type: file.type } : null
      });
      
      // Show more specific error messages
      let errorMessage = error.message;
      if (error.code === 'storage/unauthorized') {
        errorMessage = "Permission denied. Please check Firebase Storage rules.";
      } else if (error.code === 'storage/quota-exceeded') {
        errorMessage = "Storage quota exceeded. Please contact support.";
      } else if (error.message.includes('Not authenticated')) {
        errorMessage = "Authentication error. Please log in again.";
      }
      
      alert(`Upload failed: ${errorMessage}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const onSaveDraft = () => saveContent("Draft");
  const onPublish = () => saveContent("Published");

  // Archive content
  const archiveContent = async (contentId) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      alert("Please log in");
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/content/${contentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'archived' })
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let error;
        if (contentType && contentType.includes('application/json')) {
          error = await response.json();
        } else {
          const text = await response.text();
          console.error('Non-JSON response:', text);
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        throw new Error(error.error || error.message || 'Failed to archive content');
      }

      // Refresh content list
      const refreshResponse = await fetch(`${API_URL}/api/content`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (refreshResponse.ok) {
        const refreshResult = await refreshResponse.json();
        const allContent = refreshResult.data || [];
        const active = allContent.filter(c => c.status !== 'archived');
        const archived = allContent.filter(c => c.status === 'archived');
        
        const mapContent = (content) => ({
          id: content._id,
          title: content.title,
          category: content.category === 'autism' ? 'Autism' : 'Down Syndrome',
          status: content.status === 'published' ? 'Published' : content.status === 'draft' ? 'Draft' : 'Archived'
        });
        
        setContentRows(active.map(mapContent));
        setArchivedRows(archived.map(mapContent));
      }

      alert("Content archived successfully");
    } catch (error) {
      console.error('Error archiving content:', error);
      alert(`Failed to archive: ${error.message}`);
    }
  };

  // Archive quiz
  const archiveQuiz = async (quizId) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      alert("Please log in");
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/quizzes/${quizId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'archived' })
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let error;
        if (contentType && contentType.includes('application/json')) {
          error = await response.json();
        } else {
          const text = await response.text();
          console.error('Non-JSON response:', text);
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        throw new Error(error.error || error.message || 'Failed to archive quiz');
      }

      // Refresh quiz list
      const refreshResponse = await fetch(`${API_URL}/api/quizzes`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (refreshResponse.ok) {
        const refreshResult = await refreshResponse.json();
        const allQuizzes = refreshResult.data || [];
        const active = allQuizzes.filter(q => q.status !== 'archived');
        
        const mapQuiz = (quiz) => ({
          id: quiz._id,
          title: quiz.title,
          category: quiz.category === 'autism' ? 'Autism' : 'Down Syndrome'
        });
        
        setQuizRows(active.map(mapQuiz));
      }

      alert("Quiz archived successfully");
    } catch (error) {
      console.error('Error archiving quiz:', error);
      alert(`Failed to archive: ${error.message}`);
    }
  };

  // Delete content
  const deleteContent = async (contentId) => {
    const confirmed = window.confirm("Are you sure you want to delete this content? This action cannot be undone and the file will be permanently removed from Firebase Storage.");
    if (!confirmed) return;

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      alert("Please log in");
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Delete from MongoDB (backend returns storagePath in response)
      const response = await fetch(`${API_URL}/api/content/${contentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let error;
        if (contentType && contentType.includes('application/json')) {
          error = await response.json();
        } else {
          const text = await response.text();
          console.error('Non-JSON response:', text);
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        throw new Error(error.error || error.message || 'Failed to delete content');
      }

      const result = await response.json();
      const storagePath = result.storagePath;

      console.log('Delete response:', result);
      console.log('Storage path to delete:', storagePath);

      // Delete from Firebase Storage if storagePath exists
      if (storagePath) {
        try {
          const { deleteFileByPath } = await import("../utils/uploadFile");
          console.log('Attempting to delete from Firebase Storage:', storagePath);
          await deleteFileByPath(storagePath);
          console.log('✅ File successfully deleted from Firebase Storage:', storagePath);
        } catch (firebaseError) {
          console.error('❌ Error deleting file from Firebase Storage:', firebaseError);
          console.error('Error details:', {
            code: firebaseError.code,
            message: firebaseError.message,
            storagePath: storagePath
          });
          // Show error to user but don't block - MongoDB deletion succeeded
          alert(`Content deleted from database, but failed to delete file from Firebase Storage: ${firebaseError.message}`);
        }
      } else {
        console.warn('⚠️ No storagePath found in response, skipping Firebase Storage deletion');
        console.log('Response data:', result);
      }

      // Refresh content list
      const refreshResponse = await fetch(`${API_URL}/api/content`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (refreshResponse.ok) {
        const refreshResult = await refreshResponse.json();
        const allContent = refreshResult.data || [];
        const active = allContent.filter(c => c.status !== 'archived');
        const archived = allContent.filter(c => c.status === 'archived');
        
        const mapContent = (content) => ({
          id: content._id,
          title: content.title,
          category: content.category === 'autism' ? 'Autism' : 'Down Syndrome',
          status: content.status === 'published' ? 'Published' : content.status === 'draft' ? 'Draft' : 'Archived'
        });
        
        setContentRows(active.map(mapContent));
        setArchivedRows(archived.map(mapContent));
      }

      alert("Content deleted successfully");
    } catch (error) {
      console.error('Error deleting content:', error);
      alert(`Failed to delete: ${error.message}`);
    }
  };

  // Delete quiz
  const deleteQuiz = async (quizId) => {
    const confirmed = window.confirm("Are you sure you want to delete this quiz? This action cannot be undone.");
    if (!confirmed) return;

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      alert("Please log in");
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let error;
        if (contentType && contentType.includes('application/json')) {
          error = await response.json();
        } else {
          const text = await response.text();
          console.error('Non-JSON response:', text);
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        throw new Error(error.error || error.message || 'Failed to delete quiz');
      }

      // Refresh quiz list
      const refreshResponse = await fetch(`${API_URL}/api/quizzes`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (refreshResponse.ok) {
        const refreshResult = await refreshResponse.json();
        const allQuizzes = refreshResult.data || [];
        const active = allQuizzes.filter(q => q.status !== 'archived');
        
        const mapQuiz = (quiz) => ({
          id: quiz._id,
          title: quiz.title,
          category: quiz.category === 'autism' ? 'Autism' : 'Down Syndrome'
        });
        
        setQuizRows(active.map(mapQuiz));
      }

      alert("Quiz deleted successfully");
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert(`Failed to delete: ${error.message}`);
    }
  };

  // Restore content from archive
  const restoreContent = async (contentId) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      alert("Please log in");
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/content/${contentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'published' })
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let error;
        if (contentType && contentType.includes('application/json')) {
          error = await response.json();
        } else {
          const text = await response.text();
          console.error('Non-JSON response:', text);
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        throw new Error(error.error || error.message || 'Failed to restore content');
      }

      // Refresh content list
      const refreshResponse = await fetch(`${API_URL}/api/content`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (refreshResponse.ok) {
        const refreshResult = await refreshResponse.json();
        const allContent = refreshResult.data || [];
        const active = allContent.filter(c => c.status !== 'archived');
        const archived = allContent.filter(c => c.status === 'archived');
        
        const mapContent = (content) => ({
          id: content._id,
          title: content.title,
          category: content.category === 'autism' ? 'Autism' : 'Down Syndrome',
          status: content.status === 'published' ? 'Published' : content.status === 'draft' ? 'Draft' : 'Archived'
        });
        
        setContentRows(active.map(mapContent));
        setArchivedRows(archived.map(mapContent));
      }

      alert("Content restored and published successfully");
    } catch (error) {
      console.error('Error restoring content:', error);
      alert(`Failed to restore: ${error.message}`);
    }
  };

  const addPair = () => {
    if (pairs.length >= 15) {
      alert("Maximum 15 questions allowed");
      return;
    }
    setPairs([...pairs, { q: "", a: "" }]);
  };
  
  const removePair = (idx) => {
    if (pairs.length <= 5) {
      alert("Minimum 5 questions required");
      return;
    }
    setPairs(pairs.filter((_, i) => i !== idx));
  };
  
  const saveQuiz = async (status) => {
    if (!quizTitle.trim()) {
      alert("Quiz title is required");
      return;
    }
    if (!quizCourse || !quizTopic || !quizLesson) {
      alert("Please select course, topic, and lesson");
      return;
    }
    if (pairs.length < 5) {
      alert("Minimum 5 questions required");
      return;
    }
    if (pairs.length > 15) {
      alert("Maximum 15 questions allowed");
      return;
    }
    if (pairs.some(p => !p.q.trim() || !p.a.trim())) {
      alert("Please fill in all questions and answers");
      return;
    }

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      alert("Please log in to save quiz");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: quizTitle,
          category: quizCategory,
          topic: quizTopic,
          lesson: quizLesson,
          course: quizCourse,
          questionsAndAnswers: pairs,
          status: status === "Published" ? "published" : "draft"
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save quiz');
      }

      // Refresh quiz list
      const refreshResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/quizzes`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (refreshResponse.ok) {
        const refreshResult = await refreshResponse.json();
        const allQuizzes = refreshResult.data || [];
        const active = allQuizzes.filter(q => q.status !== 'archived');
        const mapQuiz = (quiz) => ({
          id: quiz._id,
          title: quiz.title,
          category: quiz.category === 'autism' ? 'Autism' : 'Down Syndrome',
          status: quiz.status === 'published' ? 'Published' : quiz.status === 'draft' ? 'Draft' : 'Archived',
          difficulty: quiz.difficulty || '-'
        });
        setQuizRows(active.map(mapQuiz));
      }

      alert(status === "Published" ? "Quiz published!" : "Quiz saved as draft.");
      
      if (status === "Published") {
        // Reset form
        setQuizTitle("");
        setQuizCategory("Autism");
        setQuizCourse("");
        setQuizTopic("");
        setQuizLesson("");
        setPairs(Array(5).fill(null).map(() => ({ q: "", a: "" })));
      }
    } catch (error) {
      console.error('Quiz save error:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const onPublishQuiz = () => saveQuiz("Published");
  const onSaveQuizDraft = () => saveQuiz("Draft");

  const handleBack = () => {
    navigate("/InstructorDash");
  };

  return (
    <div className="upl-page">
      <div className="upl-topline">
        <button type="button" className="upl-back" onClick={handleBack}>
          <span className="upl-chev">‹</span> Dashboard
        </button>
        <div className="upl-header">Publishing</div>
      </div>
      <div className="upl-card upl-section">
        <div className="upl-row">
          <div className="upl-field">
            <label>Choose a title for your content*:</label>
            <input
              className={`upl-input ${errors.title ? "upl-error" : ""}`}
              placeholder="Give a title to your content"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors.title && <span className="upl-errtxt">{errors.title}</span>}
          </div>

          <div className="upl-field">
            <label>Choose file type*:</label>
            <div
              className="upl-tagbox"
              onClick={() => setShowFileTypeList((s) => !s)}
              role="button"
              tabIndex={0}
            >
              {!fileType ? (
                <span className="upl-placeholder">Choose file type (document, video, or image)</span>
              ) : (
                <div className="upl-chips">
                  <span className="upl-chip">
                    {fileType.charAt(0).toUpperCase() + fileType.slice(1)}
                    </span>
                </div>
              )}
              <span className="upl-caret">▾</span>
            </div>
            {errors.fileType && <span className="upl-errtxt">{errors.fileType}</span>}

            {showFileTypeList && (
              <ul className="upl-taglist" role="listbox" aria-multiselectable="false">
                {FILE_TYPES.map((type) => (
                  <li key={type}>
                    <button
                      type="button"
                      className={`upl-tagitem ${fileType === type ? "selected" : ""}`}
                      onClick={() => selectFileType(type)}
                      role="option"
                      aria-selected={fileType === type}
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
          className="upl-upload"
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add('upl-upload-dragover');
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove('upl-upload-dragover');
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove('upl-upload-dragover');
            setFile(e.dataTransfer.files?.[0] || null);
          }}
        >
          <input
            id="upl-file"
            type="file"
            accept=".mp4,.mov,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0] || null;
              setFile(selectedFile);
              if (selectedFile) {
                console.log('File selected:', {
                  name: selectedFile.name,
                  size: selectedFile.size,
                  type: selectedFile.type
                });
              }
            }}
            hidden
          />
          {!file ? (
            <>
              <div className="upl-upload-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 18V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="upl-upload-content">
          <p className="upl-upload-text">
                  <label htmlFor="upl-file" className="upl-link">Click to upload</label> or drag and drop
                </p>
                <small className="upl-upload-hint">PDF, DOC, DOCX, MP4, MOV, JPG, PNG, GIF (Max 800MB)</small>
              </div>
            </>
          ) : (
            <div className="upl-upload-file-selected">
              <div className="upl-upload-file-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="upl-upload-file-info">
                <div className="upl-filename">{file.name}</div>
                <small className="upl-file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</small>
              </div>
              <label htmlFor="upl-file" className="upl-upload-change-btn">Change</label>
            </div>
          )}
          {errors.file && <span className="upl-errtxt">{errors.file}</span>}
          {isUploading && (
            <div className="upl-upload-progress">
              <div className="upl-upload-progress-bar">
                <div 
                  className="upl-upload-progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                >
                  <span className="upl-upload-progress-text">{Math.round(uploadProgress)}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="upl-cats">
          <span>Category:</span>
          <button
            type="button"
            className={`upl-catbtn ${category === "Down Syndrome" ? "active" : ""}`}
            onClick={() => handleCategoryChange("Down Syndrome")}
          >
            Down Syndrome
          </button>
          <button
            type="button"
            className={`upl-catbtn ${category === "Autism" ? "active" : ""}`}
            onClick={() => handleCategoryChange("Autism")}
          >
            Autism
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '15px' }}>
          <div className="upl-field" style={{ marginBottom: 0 }}>
          <label>Select Course:</label>
          <select 
              className={`upl-input ${errors.course ? "upl-error" : ""}`}
            value={course} 
            onChange={(e) => handleCourseChange(e.target.value)}
            disabled={!availableCourses.length}
          >
            <option value="" disabled>Choose a course</option>
            {availableCourses.map(c => (
              <option key={c.CoursesTitle} value={c.CoursesTitle}>{c.CoursesTitle}</option>
            ))}
          </select>
            {errors.course && <span className="upl-errtxt">{errors.course}</span>}
        </div>

          <div className="upl-field" style={{ marginBottom: 0 }}>
          <label>Select Topic:</label>
          <select 
              className={`upl-input ${errors.topic ? "upl-error" : ""}`}
            value={topic} 
            onChange={(e) => handleTopicChange(e.target.value)}
            disabled={!course || !availableTopics.length}
          >
            <option value="" disabled>Choose a topic</option>
            {availableTopics.map(t => (
              <option key={t.TopicsTitle} value={t.TopicsTitle}>{t.TopicsTitle}</option>
            ))}
          </select>
            {errors.topic && <span className="upl-errtxt">{errors.topic}</span>}
        </div>

          <div className="upl-field" style={{ marginBottom: 0 }}>
          <label>Select Lesson:</label>
          <select 
              className={`upl-input ${errors.lesson ? "upl-error" : ""}`}
            value={lesson} 
            onChange={(e) => setLesson(e.target.value)}
            disabled={!topic || !availableLessons.length}
          >
            <option value="" disabled>Choose a lesson</option>
            {availableLessons.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
            {errors.lesson && <span className="upl-errtxt">{errors.lesson}</span>}
          </div>

          <div className="upl-field" style={{ marginBottom: 0 }}>
            <label>Select Difficulty*:</label>
            <select 
              className={`upl-input ${errors.difficulty ? "upl-error" : ""}`}
              value={difficulty} 
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="" disabled>Choose difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            {errors.difficulty && <span className="upl-errtxt">{errors.difficulty}</span>}
          </div>
        </div>

        <div className="upl-field">
          <label>Description*:</label>
          <textarea
            className={`upl-textarea ${errors.desc ? "upl-error" : ""}`}
            placeholder="Give a description to your content"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          {errors.desc && <span className="upl-errtxt">{errors.desc}</span>}
        </div>

        <div className="upl-actions">
          <button 
            className="upl-secondary" 
            onClick={onSaveDraft}
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Save as Draft"}
          </button>
          <button 
            className="upl-primary" 
            onClick={onPublish}
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Publish"}
          </button>
        </div>
      </div>

      {/* Quiz */}
      <h2 className="upl-section-title">Quiz</h2>
      <div className="upl-quiz-card upl-section">
        <div className="upl-quiz-top upl-grid-2">
          <div className="upl-field">
            <label>Title of the quiz*:</label>
            <input
              className="upl-input"
              placeholder="Give your question here"
              value={quizTitle}
              onChange={(e)=>setQuizTitle(e.target.value)}
            />
          </div>
          <div className="upl-field upl-align-right">
            <label>Category:</label>
            <div className="upl-cats upl-no-margin">
              <button
                type="button"
                className={`upl-catbtn ${quizCategory === "Down Syndrome" ? "active" : ""}`}
                onClick={() => handleQuizCategoryChange("Down Syndrome")}
              >
                Down Syndrome
              </button>
              <button
                type="button"
                className={`upl-catbtn ${quizCategory === "Autism" ? "active" : ""}`}
                onClick={() => handleQuizCategoryChange("Autism")}
              >
                Autism
              </button>
            </div>
          </div>
        </div>

        <div className="upl-quiz-note">Choose the course, topic, and lesson this quiz will be associated. Difficulty will be set automatically based on the number of questions (5: Easy, 6-10: Medium, 11-15: Hard).</div>
        
        <div className="upl-quiz-selects">
          <select 
            className="upl-input upl-quiz-select" 
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
            className="upl-input upl-quiz-select" 
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
            className="upl-input upl-quiz-select" 
            value={quizLesson} 
            onChange={(e) => setQuizLesson(e.target.value)}
            disabled={!quizTopic || !quizAvailableLessons.length}
          >
            <option value="" disabled>Lesson</option>
            {quizAvailableLessons.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
          Questions: {pairs.length} / 15 (Minimum: 5)
        </div>

        {pairs.map((p, i)=>(
          <div key={i} className="upl-qa-row">
            <div className="upl-field">
              <label>Question for the quiz*:</label>
              <input
                className="upl-input"
                placeholder="Give your question here"
                value={p.q}
                onChange={(e)=>{
                  const next=[...pairs]; next[i].q=e.target.value; setPairs(next);
                }}
              />
            </div>
            <div className="upl-field">
              <label>Answer for the question*:</label>
              <input
                className="upl-input"
                placeholder="Give your question here"
                value={p.a}
                onChange={(e)=>{
                  const next=[...pairs]; next[i].a=e.target.value; setPairs(next);
                }}
              />
            </div>

            {pairs.length > 5 && (
              <button
                type="button"
                className="upl-quiz-remove"
                onClick={()=>removePair(i)}
                title="Remove this Q/A (Minimum 5 questions required)"
                style={{marginLeft:8, padding:"0 10px"}}
              >
                −
              </button>
            )}

            {i === pairs.length-1 && pairs.length < 15 && (
              <button type="button" className="upl-quiz-add" onClick={addPair} title="Add question (Maximum 15 questions)">+</button>
            )}
          </div>
        ))}

        <div className="upl-actions">
          <button className="upl-secondary" onClick={onSaveQuizDraft}>Save as Draft</button>
          <button className="upl-primary" onClick={onPublishQuiz}>Publish</button>
        </div>
      </div>

      {/* Quizzes List */}
      <h2 className="upl-section-title">Quizzes</h2>
      <div className="upl-content-card upl-archive-card upl-section" style={{ marginBottom: '40px' }}>
        <div className="upl-content-head upl-archive-head">
          <span>Quiz title</span>
          <span>Category</span>
          <span className="upl-actions-col">Actions</span>
        </div>

        <div className="upl-content-rows upl-archive-rows" style={{ maxHeight: 320, overflowY: "auto" }}>
          {loadingQuizzes ? (
            <div className="upl-empty-archive">
              <div className="upl-empty-icon">⏳</div>
              <p className="upl-empty-text">Loading quizzes...</p>
            </div>
          ) : quizRows.length === 0 ? (
            <div className="upl-empty-archive">
              <div className="upl-empty-icon">📝</div>
              <p className="upl-empty-text">No quizzes yet</p>
              <p className="upl-empty-subtext">Create and publish your first quiz to see it here</p>
            </div>
          ) : (
            quizRows.map((row) => (
              <div key={row.id} className="upl-content-row upl-archive-row">
                <div className="upl-content-title upl-archive-title" title={row.title}>{row.title}</div>

                <div className="upl-pill upl-pill-archive">{row.category}</div>

                <div className="upl-content-actions upl-archive-actions">
                  <button type="button" className="upl-btn-arch" onClick={() => archiveQuiz(row.id)}>Archive</button>
                  <button type="button" className="upl-btn-del"  onClick={() => deleteQuiz(row.id)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Content */}
      <h2 className="upl-section-title">Content</h2>
      <div className="upl-content-card upl-archive-card upl-section" style={{ marginBottom: '40px' }}>
        <div className="upl-content-head upl-archive-head" data-columns="4">
          <span>Content title</span>
          <span>Category</span>
          <span>Status</span>
          <span className="upl-actions-col">Actions</span>
        </div>

        <div className="upl-content-rows upl-archive-rows" style={{ maxHeight: 320, overflowY: "auto" }}>
          {loadingContent ? (
            <div className="upl-empty-archive">
              <div className="upl-empty-icon">⏳</div>
              <p className="upl-empty-text">Loading content...</p>
            </div>
          ) : contentRows.length === 0 ? (
            <div className="upl-empty-archive">
              <div className="upl-empty-icon">📄</div>
              <p className="upl-empty-text">No content yet</p>
              <p className="upl-empty-subtext">Create and publish your first content to see it here</p>
            </div>
          ) : (
            contentRows.map((row) => (
              <div key={row.id} className="upl-content-row upl-archive-row" data-columns="4">
                <div className="upl-content-title upl-archive-title" title={row.title}>{row.title}</div>

                <div className="upl-pill upl-pill-archive">{row.category}</div>

                <div className={`upl-status-pill ${
                  row.status === "Published" ? "upl-status-green" :
                  row.status === "Draft" ? "upl-status-red" : "upl-status-yellow"
                }`}>
                  {row.status}
                </div>

                <div className="upl-content-actions upl-archive-actions">
                  <button type="button" className="upl-btn-arch" onClick={() => archiveContent(row.id)}>Archive</button>
                  <button type="button" className="upl-btn-del"  onClick={() => deleteContent(row.id)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Archive */}
      <h2 className="upl-section-title">Archive</h2>
      <div className="upl-content-card upl-archive-card upl-section">
        <div className="upl-content-head upl-archive-head">
          <span>Content title</span>
          <span>Category</span>
          <span className="upl-actions-col">Actions</span>
        </div>

        <div className="upl-content-rows upl-archive-rows" style={{ maxHeight: 320, overflowY: "auto" }}>
          {archivedRows.length === 0 ? (
            <div className="upl-empty-archive">
              <div className="upl-empty-icon">📦</div>
              <p className="upl-empty-text">No archived content</p>
              <p className="upl-empty-subtext">Archived items will appear here</p>
            </div>
          ) : (
            archivedRows.map((row) => (
              <div key={row.id} className="upl-content-row upl-archive-row">
                <div className="upl-content-title upl-archive-title" title={row.title}>
                  {row.title}
                </div>

                <div className="upl-pill upl-pill-archive">{row.category}</div>

                <div className="upl-content-actions upl-archive-actions">
                  <button 
                    className="upl-btn-arch upl-btn-restore" 
                    onClick={() => restoreContent(row.id)}
                    title="Restore content"
                  >
                    Restore
                  </button>
                  <button 
                    className="upl-btn-del upl-btn-delete-arch" 
                    onClick={() => deleteContent(row.id)}
                    title="Permanently delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}