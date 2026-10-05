"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  getAdditionalUserInfo,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyAction, setBusyAction] = useState("");

  const saveUserProfile = async (uid: string, userName: string, userEmail: string) => {
    await setDoc(doc(db, "users", uid), {
      name: userName,
      email: userEmail,
      role: "intern",
      currentModule: "",
      createdAt: serverTimestamp(),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusyAction("email");

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        await saveUserProfile(userCredential.user.uid, name, email);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message.replace("Firebase: ", "") : "Something went wrong. Please try again.");
    } finally {
      setBusyAction("");
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setNotice("");
    setBusyAction("google");

    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      if (getAdditionalUserInfo(result)?.isNewUser) {
        await saveUserProfile(
          result.user.uid,
          result.user.displayName ?? "",
          result.user.email ?? ""
        );
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message.replace("Firebase: ", "") : "Google sign-in failed. Please try again.");
    } finally {
      setBusyAction("");
    }
  };

  const handlePasswordReset = async () => {
    setError("");
    setNotice("");
    if (!email.trim()) {
      setError("Enter your email address first, then select Forgot password?");
      return;
    }

    setBusyAction("reset");
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setNotice("Password reset email sent. Check your inbox.");
    } catch (err) {
      setError(err instanceof Error ? err.message.replace("Firebase: ", "") : "Could not send a reset email. Please try again.");
    } finally {
      setBusyAction("");
    }
  };

  return (
    <main className="app-page auth-page">
      <section className="auth-card" aria-labelledby="auth-heading">
        <div className="auth-card-mark" aria-hidden="true">✳</div>
        <h1 id="auth-heading">
          {isSignUp ? "Create an account" : "Welcome back"}
        </h1>
        <p className="auth-intro">
          {isSignUp
            ? "Sign up to start your learning journey"
            : "Log in to continue learning"}
        </p>

        <button
          type="button"
          className="auth-google-button"
          onClick={handleGoogleSignIn}
          disabled={Boolean(busyAction)}
        >
          <span className="google-mark" aria-hidden="true">G</span>
          {busyAction === "google" ? "Connecting..." : "Continue with Google"}
        </button>

        <div className="auth-divider"><span>or continue with email</span></div>

        <form onSubmit={handleSubmit} className="auth-form">
          {isSignUp && (
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              aria-label="Full name"
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            aria-label="Email address"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={isSignUp ? "new-password" : "current-password"}
            aria-label="Password"
          />

          {!isSignUp && (
            <button
              type="button"
              className="auth-forgot-button"
              onClick={handlePasswordReset}
              disabled={Boolean(busyAction)}
            >
              {busyAction === "reset" ? "Sending reset email..." : "Forgot password?"}
            </button>
          )}

          {error && <p className="auth-message auth-error" role="alert">{error}</p>}
          {notice && <p className="auth-message auth-notice" role="status">{notice}</p>}

          <button
            type="submit"
            disabled={Boolean(busyAction)}
            className="auth-submit-button"
          >
            {busyAction === "email" ? "Please wait..." : isSignUp ? "Create account" : "Log in"}
          </button>
        </form>

        <p className="auth-switch-prompt">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
              setNotice("");
            }}
          >
            {isSignUp ? "Log in" : "Sign up"}
          </button>
        </p>
      </section>
    </main>
  );
}