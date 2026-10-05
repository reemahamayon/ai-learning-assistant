"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, collection, getDocs, query, orderBy } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface UserData {
  name: string;
  email: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  order: number;
  topics: string[];
}

interface Progress {
  status: string;
  score: number;
  weakTopics: string[];
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, Progress>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(true);
      setLoadError("");

      if (!currentUser) {
        setUserData(null);
        setModules([]);
        setProgressMap({});
        setLoading(false);
        return;
      }

      try {
        const modulesQuery = query(collection(db, "modules"), orderBy("order"));
        const modulesSnap = await getDocs(modulesQuery);
        const modulesList = modulesSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as Module[];
        setModules(modulesList);

        const [userDoc, progressSnap] = await Promise.all([
          getDoc(doc(db, "users", currentUser.uid)),
          getDocs(collection(db, "users", currentUser.uid, "progress")),
        ]);
        setUserData(userDoc.exists() ? userDoc.data() as UserData : null);

        const progressData: Record<string, Progress> = {};
        progressSnap.docs.forEach((d) => {
          progressData[d.id] = d.data() as Progress;
        });
        setProgressMap(progressData);
      } catch {
        setLoadError("Dashboard data could not be loaded. Please sign in or try again later.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="app-loading">
        <p>Loading...</p>
      </div>
    );
  }

  const completedCount = Object.values(progressMap).filter((p) => p.status === "completed").length;
  const allWeakTopics = Array.from(
    new Set(Object.values(progressMap).flatMap((p) => p.weakTopics || []))
  );

  return (
  <div className="app-page dashboard-page">
  <div className="max-w-4xl mx-auto p-8">
    <div className="mb-8">
      <p className="eyebrow">YOUR LEARNING SPACE</p>
      <h1 className="text-2xl font-bold">Welcome, {userData?.name || user?.email || "learner"}</h1>
      <p className="dashboard-subtitle">
        {user ? user.email : "Explore your learning path. Sign in to save progress and pick up where you left off."}
      </p>
      {!user && <a href="/login" className="dashboard-sign-in">Sign in to save progress <span aria-hidden="true">→</span></a>}
    </div>

        {loadError && <p className="dashboard-load-error" role="alert">{loadError}</p>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">{user ? "Modules Completed" : "Learning progress"}</p>
            <p className="text-3xl font-bold">{user ? `${completedCount} / ${modules.length}` : "Sign in to view"}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 md:col-span-2">
            <p className="text-gray-400 text-sm mb-2">Weak Areas</p>
            {!user ? (
              <p className="text-gray-500 text-sm">Sign in to see your learning insights</p>
            ) : allWeakTopics.length === 0 ? (
              <p className="text-gray-500 text-sm">None yet — complete a quiz to see this</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {allWeakTopics.map((topic) => (
                  <span key={topic} className="text-xs px-3 py-1 rounded-full bg-red-950 text-red-300 border border-red-900">
                    {topic}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-4">Your Learning Path</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map((mod) => {
            const progress = progressMap[mod.id];
            return (
              <div key={mod.id} className="bg-gray-900 rounded-xl p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{mod.title}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-400">{mod.difficulty}</span>
                </div>
                <p className="text-gray-400 text-sm mb-3">{mod.description}</p>

                {progress ? (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-green-950 text-green-400 border border-green-900">
                        Completed
                      </span>
                      <span className="text-sm text-gray-300">Score: {progress.score}%</span>
                    </div>
                    {progress.weakTopics?.length > 0 && (
                      <p className="text-xs text-gray-500">
                        Needs review: {progress.weakTopics.join(", ")}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {mod.topics?.map((topic) => (
                      <span key={topic} className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-500">{topic}</span>
                    ))}
                  </div>
                )}

                <div className="flex gap-4">
                  <a href={`/chat?module=${mod.id}`} className="text-sm theme-link">
                    {progress ? "Review with AI" : "Start learning"} →
                  </a>
                  <a href={`/quiz/${mod.id}`} className="text-sm theme-link">
                    {progress ? "Retake Quiz" : "Take Quiz"} →
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {modules.length === 0 && (
          <p className="text-gray-500">
            {user ? "No modules found. Add some in Firebase." : "Sign in to load your learning modules."}
          </p>
        )}
      </div>
    </div>
  );
}