import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../../config/firebase";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export const useSignup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        userType: "student",
        fullName: "",
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
        agreeToTerms: false
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    // Sign out any unverified Firebase users
    useEffect(() => {
        const checkAndSignOut = async () => {
            if (auth.currentUser && !auth.currentUser.emailVerified) {
                await signOut(auth);
            }
        };
        checkAndSignOut();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
        // Clear error for field
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const validate = () => {
        const e = {};
        if (!formData.fullName.trim()) e.fullName = "Full name is required.";
        if (!formData.email.trim()) e.email = "Email is required.";
        else if (!isEmail(formData.email)) e.email = "Enter a valid email.";

        if (formData.userType === "student" && !formData.username.trim()) {
            e.username = "Username is required.";
        }

        if (!formData.password) e.password = "Password is required.";
        else if (formData.password.length < 6) e.password = "Minimum 6 characters.";

        if (!formData.confirmPassword) e.confirmPassword = "Please confirm your password.";
        else if (formData.password !== formData.confirmPassword) e.confirmPassword = "Passwords do not match.";

        if (!formData.agreeToTerms) e.agreeToTerms = "You must agree to the terms and conditions.";

        setErrors(e);
        setGeneralError("");
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setGeneralError("");
        setShowLoginPrompt(false);
        setLoading(true);

        let mongoRegistrationSuccess = false;
        let firebaseUser = null;

        try {
            // 1. Check MongoDB existence
            const emailCheckRes = await fetch(`${API_URL}/api/students/auth/check-email/${encodeURIComponent(formData.email)}`);
            if (emailCheckRes.ok) {
                const checkData = await emailCheckRes.json();
                if (checkData.exists) {
                    setGeneralError(`This email is already registered as a ${checkData.inStudent ? 'student' : 'teacher'}. Would you like to go to the login page?`);
                    setShowLoginPrompt(true);
                    setLoading(false);
                    return;
                }
            }

            // 2. Create Firebase Account
            let firebaseUID;
            try {
                const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
                firebaseUser = cred.user;
                firebaseUID = firebaseUser.uid;
            } catch (createError) {
                if (createError.code === 'auth/email-already-in-use') {
                    // Handle case where exists in Firebase but maybe not MongoDB (or check verified)
                    try {
                        // Try check if verified by signing in? (Risky if password wrong, but follows original logic)
                        const cred = await signInWithEmailAndPassword(auth, formData.email, formData.password);
                        await signOut(auth);
                        if (cred.user.emailVerified) {
                            setGeneralError("Email already registered and verified. Go to login?");
                        } else {
                            setGeneralError("Email registered but not verified. Go to login?");
                        }
                        setShowLoginPrompt(true);
                        setLoading(false);
                        return;
                    } catch (err) {
                        setGeneralError("Email already registered. Go to login?");
                        setShowLoginPrompt(true);
                        setLoading(false);
                        return;
                    }
                } else {
                    throw createError; // Rethrow other errors
                }
            }

            // 3. Register in MongoDB
            const endpoint = formData.userType === "instructor"
                ? `${API_URL}/api/teachers/auth/register`
                : `${API_URL}/api/students/auth/register`;

            const payload = {
                fullName: formData.fullName.trim(),
                email: formData.email,
                password: formData.password,
                firebaseUID,
                ...(formData.userType === "student" && { username: formData.username.trim() })
            };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                // Cleanup Firebase if Mongo fails
                if (firebaseUser) await signOut(auth).catch(() => { });
                const data = await response.json().catch(() => ({}));

                if (response.status === 409) {
                    setGeneralError("Account already exists. Go to login?");
                    setShowLoginPrompt(true);
                } else {
                    setGeneralError(data.error || "Sign up failed.");
                }
                setLoading(false);
                return;
            }

            mongoRegistrationSuccess = true;
            const data = await response.json();

            // 4. Send Verification Email
            if (firebaseUser && !firebaseUser.emailVerified) {
                await sendEmailVerification(firebaseUser, {
                    url: window.location.origin + '/verify-email',
                    handleCodeInApp: false
                }).catch(console.error);
            }

            // 5. Store temp data (for students) & Navigate
            if (formData.userType === "student" && data.data?.token) {
                sessionStorage.setItem("tempToken", data.data.token);
                sessionStorage.setItem("tempRole", "student");
                sessionStorage.setItem("tempUserId", data.data.student?.id || "");
                sessionStorage.setItem("tempUserName", data.data.student?.fullName || formData.fullName);
                sessionStorage.setItem("tempUserEmail", formData.email);
            }

            setLoading(false);
            navigate("/verify-email", {
                state: {
                    email: formData.email,
                    userType: formData.userType,
                    fullName: formData.fullName
                }
            });

        } catch (error) {
            console.error("Signup error:", error);
            if (auth.currentUser && !mongoRegistrationSuccess) await signOut(auth).catch(() => { });

            const msg = error.code === 'auth/weak-password' ? "Password too weak."
                : error.code === 'auth/invalid-email' ? "Invalid email."
                    : error.message || "Sign up failed.";

            setGeneralError(msg);
            setLoading(false);
        }
    };

    return {
        formData,
        showPassword,
        showConfirmPassword,
        errors,
        generalError,
        loading,
        showLoginPrompt,
        setShowPassword,
        setShowConfirmPassword,
        handleChange,
        handleSubmit,
        validate
    };
};
