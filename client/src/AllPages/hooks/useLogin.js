import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../config/firebase";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export const useLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
    };

    const togglePassword = () => setShowPassword(!showPassword);

    const validate = () => {
        const e = {};
        if (!formData.username.trim()) {
            e.username = "Username or email is required.";
        } else if (formData.username.includes('@') && !isEmail(formData.username)) {
            e.username = "Enter a valid email.";
        }
        if (!formData.password) {
            e.password = "Password is required.";
        } else if (formData.password.length < 6) {
            e.password = "Minimum 6 characters.";
        }
        setErrors(e);
        setServerError("");
        return Object.keys(e).length === 0;
    };

    const loginTeacher = async ({ email, password }) => {
        try {
            const response = await fetch(`${API_URL}/api/teachers/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                return { ok: false, error: 'Server error. Please try again later.' };
            }

            const data = await response.json();
            if (!response.ok) {
                return { ok: false, error: response.status === 401 ? 'Invalid email or password.' : (data.error || 'Login failed.') };
            }

            return {
                ok: true,
                userType: 'teacher',
                token: data.data.token,
                user: data.data.teacher // Keeping structure simple
            };
        } catch (error) {
            return { ok: false, error: 'Network error.' };
        }
    };

    const loginStudent = async ({ email, password }) => {
        try {
            const response = await fetch(`${API_URL}/api/students/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) return { ok: false, error: null };

            const data = await response.json();
            if (!response.ok) return { ok: false, error: response.status === 401 ? 'Invalid email or password.' : null };

            return {
                ok: true,
                userType: 'student',
                token: data.data?.token || data.token,
                user: data.data?.student || data.student || {}
            };
        } catch (error) {
            return { ok: false, error: null };
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError("");
        if (!validate()) return;
        setLoading(true);

        const email = formData.username.includes('@') ? formData.username : null;
        const loginIdentifier = email || formData.username;

        try {
            let loginResult = null;

            if (email) {
                const checkRes = await fetch(`${API_URL}/api/students/auth/check-email/${encodeURIComponent(email)}`);
                if (checkRes.ok) {
                    const checkData = await checkRes.json();
                    if (checkData.inTeacher) {
                        loginResult = await loginTeacher({ email: loginIdentifier, password: formData.password });
                    } else if (checkData.inStudent) {
                        loginResult = await loginStudent({ email: loginIdentifier, password: formData.password });
                    } else {
                        throw new Error("User not found. Please check your email or sign up.");
                    }
                } else {
                    loginResult = await loginTeacher({ email: loginIdentifier, password: formData.password });
                    if (!loginResult.ok) loginResult = await loginStudent({ email: loginIdentifier, password: formData.password });
                }
            } else {
                loginResult = await loginStudent({ email: loginIdentifier, password: formData.password });
                if (!loginResult.ok) loginResult = await loginTeacher({ email: loginIdentifier, password: formData.password });
            }

            if (!loginResult?.ok) {
                throw new Error(typeof loginResult?.error === 'string' ? loginResult.error : "Invalid credentials.");
            }

            // Success Handling
            if (loginResult.userType === 'teacher') {
                // Firebase Auth for Teachers
                const firebaseCredential = await signInWithEmailAndPassword(auth, loginResult.user.email, formData.password);
                const firebaseUID = firebaseCredential.user.uid;

                // Sync Firebase UID if needed
                if (!loginResult.user.firebaseUID) {
                    await fetch(`${API_URL}/api/teachers/me`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${loginResult.token}`
                        },
                        body: JSON.stringify({ firebaseUID })
                    }).catch(() => { });
                }

                // Check info gathering
                const { areasOfExpertise, cv, informationGatheringComplete } = loginResult.user;
                if (!informationGatheringComplete) {
                    if (!areasOfExpertise || areasOfExpertise.length === 0) navigate('/InformationGathering-1');
                    else if (!cv) navigate('/InformationGathering-2');
                    else navigate('/InformationGathering-3'); // Or auto-complete logic here
                    return;
                }
                navigate('/instructor-dashboard-2');
            } else {
                // Student Logic
                sessionStorage.setItem("token", loginResult.token);
                sessionStorage.setItem("role", "student");
                sessionStorage.setItem("userId", loginResult.user.id || loginResult.user._id);
                sessionStorage.setItem("userName", loginResult.user.fullName || loginResult.user.name || 'Student');
                sessionStorage.setItem("userEmail", loginResult.user.email);

                // Check Diagnostic Quiz
                try {
                    const quizRes = await fetch(`${API_URL}/api/diagnostic-quiz/status`, {
                        headers: { 'Authorization': `Bearer ${loginResult.token}` }
                    });
                    if (quizRes.ok) {
                        const quizData = await quizRes.json();
                        if (!quizData.data.completed) {
                            navigate('/diagnostic-quiz', { replace: true });
                            return;
                        }
                    }
                } catch (e) { }
                navigate('/student-dashboard-2');
            }

        } catch (err) {
            setServerError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return {
        formData,
        errors,
        serverError,
        loading,
        showPassword,
        handleChange,
        togglePassword,
        handleSubmit,
        validate // Exported if needed by UI onBlur
    };
};
