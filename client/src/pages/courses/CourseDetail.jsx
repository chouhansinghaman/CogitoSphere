import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "react-quill/dist/quill.snow.css";

// ✅ Proper Settings Icon SVG (Lucide style)
const SettingsIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06
      a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09
      a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06
      a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 5 15.4
      1.65 1.65 0 0 0 3.5 14H3a2 2 0 0 1 0-4h.09
      a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06
      a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 5
      a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09
      a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06
      a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82
      1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09
      a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

export default function CourseDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Mock toast (safe placeholder)
  const toast = { error: (msg) => console.error("Error:", msg) };

  const [course, setCourse] = useState(location.state?.course || null);
  const [loading, setLoading] = useState(!course);
  const [isPrintLayout, setIsPrintLayout] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!course) {
        setLoading(true);
        try {
          // ✅ Mock data (replace with real API later)
          const mockCourseData = {
            course: {
              id,
              title: `The Fundamentals of React Development - ID: ${id}`,
              category: "Programming",
              description:
                "Dive deep into modern React hooks, state management, and component architecture for building scalable web applications.",
              content: `
                <h2>Introduction to Hooks</h2>
                <p>Hooks are functions that let you "hook into" React state and lifecycle features from function components.</p>
                
                <h3>The useState Hook</h3>
                <p>This hook allows you to add state to function components. For example:</p>
                <pre style="background: #f8f8f8; padding: 10px; border-radius: 6px; overflow-x: auto;"><code>
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    &lt;div&gt;
      &lt;p&gt;You clicked &#123;count&#125; times&lt;/p&gt;
      &lt;button onClick={() =&gt; setCount(count + 1)}&gt;
        Click me
      &lt;/button&gt;
    &lt;/div&gt;
  );
}
                </code></pre>

                <p>Using the print layout gives this long-form content a focused, book-like feel on mobile devices, making reading much easier.</p>

                <h3>The useEffect Hook</h3>
                <p>The Effect Hook lets you perform side effects in function components. Data fetching, subscriptions, and manual DOM changes are examples.</p>

                <ul>
                  <li><strong>No dependency array</strong>: Runs after every render.</li>
                  <li><strong>Empty array <code>[]</code></strong>: Runs only once (on mount).</li>
                  <li><strong>Array with values <code>[val1, val2]</code></strong>: Runs on mount and whenever any dependency changes.</li>
                </ul>
              `,
            },
          };

          await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate delay
          setCourse(mockCourseData.course);
        } catch (err) {
          toast.error(err.message || "Failed to load course.");
          navigate("/courses");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCourse();
  }, [id, navigate]); // ✅ removed `course` to prevent infinite loop

  if (loading)
    return <p className="text-center text-gray-500 p-10">Loading course...</p>;
  if (!course) return null;

  const layoutClasses = isPrintLayout
    ? "mx-auto max-w-xl shadow-lg border border-gray-200 my-2 md:my-0"
    : "max-w-full";

  const contentPadding = isPrintLayout ? "p-8 md:p-12" : "p-4 md:p-8";

  return (
    <div className="w-full min-h-screen flex flex-col font-sans relative p-0 sm:p-0 md:p-6 bg-gray-50 md:bg-white">
      {/* ✅ Mobile Header */}
      <div className="flex justify-between items-center w-full md:hidden bg-white shadow-md z-30 sticky top-0 px-4 py-3">
        <button
          onClick={() => navigate("/courses")}
          className="flex items-center text-gray-700 hover:text-gray-900 transition-colors"
        >
          <span className="text-xl mr-2">←</span>
          <span className="text-sm font-medium">Back to Courses</span>
        </button>

        <button
          onClick={() => setIsPrintLayout(!isPrintLayout)}
          className={`p-2 rounded-full transition-colors ${
            isPrintLayout
              ? "bg-indigo-500 text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          aria-label="Toggle Print Layout"
        >
          <SettingsIcon className="w-5 h-5" />
        </button>
      </div>

      {/* ✅ Main Content */}
      <div
        className={`bg-white w-full flex-grow relative rounded-none md:rounded-2xl border-0 md:border md:border-gray-200 shadow-none md:shadow-sm transition-all duration-300 ${layoutClasses}`}
      >
        {/* Desktop Back Button */}
        <button
          onClick={() => navigate("/courses")}
          className="hidden md:block absolute top-6 left-6 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors shadow-sm z-20"
        >
          ← Back
        </button>

        {/* Content Wrapper */}
        <div className={`w-full ${contentPadding} pt-4 md:pt-16`}>
          {/* Course Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
              {course.title}
            </h1>
            <p className="text-sm text-indigo-600 font-medium mb-1">
              {course.category}
            </p>
            <p className="text-gray-500 text-base leading-snug">
              {course.description}
            </p>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* Course Content */}
          <div className="ql-snow bg-white">
            <div
              className="ql-editor text-gray-800"
              style={{
                fontFamily: "'Lexend', sans-serif",
                minHeight: "300px",
                padding: 0,
              }}
              dangerouslySetInnerHTML={{ __html: course.content }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
