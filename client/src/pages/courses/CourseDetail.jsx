import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
// Assuming you have 'react-hot-toast' installed
// import toast from "react-hot-toast"; 
import 'react-quill/dist/quill.snow.css';

// Using Lucide-React for the toggle icon (assuming it's available or use an inline SVG)
// Using a basic SVG for portability if Lucide is not assumed
const SettingsIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.44a2 2 0 0 1-2 2H4a2 2 0 0 0-2 2v.44a2 2 0 0 1-2 2v.44a2 2 0 0 0 2 2h.44a2 2 0 0 1 2 2v.44a2 2 0 0 0 2 2h.44a2 2 0 0 1 2 2v.44a2 2 0 0 0 2 2h.44a2 2 0 0 1 2-2v-.44a2 2 0 0 0 2-2h.44a2 2 0 0 1 2 2v.44a2 2 0 0 0 2 2h.44a2 2 0 0 1 2-2v-.44a2 2 0 0 0 2-2h.44a2 2 0 0 1 2-2v-.44a2 2 0 0 0 2-2h-.44a2 2 0 0 1-2-2v-.44a2 2 0 0 0-2-2h-.44a2 2 0 0 1-2-2v-.44a2 2 0 0 0-2-2z"></path>
        <circle cx="12" cy="12" r="3" />
    </svg>
);


export default function CourseDetail() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    // Assuming a simple toast setup without actual API key validation
    const toast = { error: (msg) => console.error("Error:", msg) }; 

    // FIX APPLIED HERE: Replaced optional chaining (location.state?.course) 
    // with logical AND (location.state && location.state.course) 
    const [course, setCourse] = useState(location.state && location.state.course || null);
    const [loading, setLoading] = useState(!course);
    // New state to manage the print/mobile layout toggle
    const [isPrintLayout, setIsPrintLayout] = useState(true); 

    useEffect(() => {
        const fetchCourse = async () => {
            if (!course) {
                setLoading(true);
                try {
                    // Mocking fetch since we don't have the actual VITE_API_BASE_URL
                    // const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/courses/${id}`);
                    
                    // --- MOCK FETCH START ---
                    const mockCourseData = {
                        course: {
                            id,
                            title: `The Fundamentals of React Development - ID: ${id}`,
                            category: "Programming",
                            description: "Dive deep into modern React hooks, state management, and component architecture for building scalable web applications.",
                            content: `
                                <h2>Introduction to Hooks</h2>
                                <p>Hooks are functions that let you "hook into" React state and lifecycle features from function components.</p>
                                <h3>The useState Hook</h3>
                                <p>This hook allows you to add state to function components. For example, <code>const [count, setCount] = useState(0);</code></p>
                                <pre style="background: #f8f8f8; padding: 10px; border-radius: 6px; overflow-x: auto;"><code>
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    &lt;div&gt;
      &lt;p&gt;You clicked {count} times&lt;/p&gt;
      &lt;button onClick={() => setCount(count + 1)}&gt;
        Click me
      &lt;/button&gt;
    &lt;/div&gt;
  );
}
                                </code></pre>
                                <p>Using the print layout gives this long-form content a focused, book-like feel on mobile devices, making reading much easier.</p>
                                <h3>The useEffect Hook</h3>
                                <p>The Effect Hook lets you perform side effects in function components. Data fetching, setting up a subscription, and manually changing the DOM are examples of side effects.</p>
                                <ul>
                                    <li>**No dependency array**: Runs after every render.</li>
                                    <li>**Empty array \`[]\`**: Runs only once (on mount).</li>
                                    <li>**Array with values \`[val1, val2]\`**: Runs on mount and whenever any dependency changes.</li>
                                </ul>
                            `,
                        }
                    };
                    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
                    setCourse(mockCourseData.course);
                    // --- MOCK FETCH END ---

                    // Replace MOCK with real logic once backend is available
                    /* if (!res.ok) {
                        const errData = await res.json();
                        throw new Error(errData.message || "Course not found");
                    }
                    const data = await res.json();
                    setCourse(data.course);
                    */
                } catch (err) {
                    toast.error(err.message || "Failed to load course.");
                    navigate("/courses");
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchCourse();
    }, [id, course, navigate]); // FIX APPLIED HERE: Removed trailing comment

    if (loading) return <p className="text-center text-gray-500 p-10">Loading course...</p>;
    if (!course) return null;

    // Determine the layout class based on the toggle state, but only on small screens
    const layoutClasses = isPrintLayout 
        ? "mx-auto max-w-xl shadow-lg border-gray-200 border-x my-2 md:my-0" 
        : "max-w-full";
        
    // Base padding for content wrapper. Mobile default is no padding, Print layout adds padding.
    const contentPadding = isPrintLayout ? "p-8 md:p-12" : "p-4 md:p-8";

    return (
        // Main container: No padding on mobile (p-0), standard padding on medium and up (md:p-6)
        <div className="w-full min-h-screen flex flex-col font-sans relative p-0 sm:p-0 md:p-6 bg-gray-50 md:bg-white">
            
            {/* Header/Utility Bar for Mobile */}
            <div className="flex justify-between items-center w-full md:hidden bg-white shadow-md z-30 sticky top-0 px-4 py-3">
                <button
                    onClick={() => navigate("/courses")}
                    className="flex items-center text-gray-700 hover:text-gray-900 transition-colors"
                >
                    <span className="text-xl mr-2">←</span> 
                    <span className="text-sm font-medium">Back to Courses</span>
                </button>
                
                {/* Print Layout Toggle Button (visible only on mobile) */}
                <button
                    onClick={() => setIsPrintLayout(!isPrintLayout)}
                    className={`p-2 rounded-full transition-colors ${
                        isPrintLayout ? "bg-indigo-500 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    aria-label="Toggle Print Layout"
                >
                    <SettingsIcon className="w-5 h-5" />
                </button>
            </div>


            {/* Content Area */}
            {/* On medium/desktop screens, the layout is always standard */}
            <div className={`
                bg-white w-full flex-grow relative rounded-none md:rounded-2xl border-0 md:border md:border-gray-200 shadow-none md:shadow-sm 
                transition-all duration-300
                ${layoutClasses}
            `}>
                
                {/* Back button for Desktop (Original positioning) */}
                <button
                    onClick={() => navigate("/courses")}
                    className="hidden md:block absolute top-6 left-6 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors shadow-sm z-20"
                >
                    ← Back
                </button>

                {/* Inner Content Wrapper: applies conditional padding */}
                <div className={`w-full ${contentPadding} pt-4 md:pt-16`}>
                    
                    {/* Course Metadata */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">{course.title}</h1>
                        <p className="text-sm text-indigo-600 font-medium mb-1">{course.category}</p>
                        <p className="text-gray-500 text-base leading-snug">{course.description}</p>
                    </div>

                    <hr className="my-6 border-gray-200" />

                    {/* Course Content (React-Quill Output) */}
                    <div className="ql-snow bg-white">
                        <div
                            className="ql-editor text-gray-800"
                            style={{ fontFamily: "'Lexend', sans-serif", minHeight: "300px", padding: 0 }}
                            dangerouslySetInnerHTML={{ __html: course.content }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
    // Base padding for content wrapper. Mobile default is no padding, Print layout adds padding.
    const contentPadding = isPrintLayout ? "p-8 md:p-12" : "p-4 md:p-8";

    return (
        // Main container: No padding on mobile (p-0), standard padding on medium and up (md:p-6)
        <div className="w-full min-h-screen flex flex-col font-sans relative p-0 sm:p-0 md:p-6 bg-gray-50 md:bg-white">
            
            {/* Header/Utility Bar for Mobile */}
            <div className="flex justify-between items-center w-full md:hidden bg-white shadow-md z-30 sticky top-0 px-4 py-3">
                <button
                    onClick={() => navigate("/courses")}
                    className="flex items-center text-gray-700 hover:text-gray-900 transition-colors"
                >
                    <span className="text-xl mr-2">←</span> 
                    <span className="text-sm font-medium">Back to Courses</span>
                </button>
                
                {/* Print Layout Toggle Button (visible only on mobile) */}
                <button
                    onClick={() => setIsPrintLayout(!isPrintLayout)}
                    className={`p-2 rounded-full transition-colors ${
                        isPrintLayout ? "bg-indigo-500 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    aria-label="Toggle Print Layout"
                >
                    <SettingsIcon className="w-5 h-5" />
                </button>
            </div>


            {/* Content Area */}
            {/* On medium/desktop screens, the layout is always standard */}
            <div className={`
                bg-white w-full flex-grow relative rounded-none md:rounded-2xl border-0 md:border md:border-gray-200 shadow-none md:shadow-sm 
                transition-all duration-300
                ${layoutClasses}
            `}>
                
                {/* Back button for Desktop (Original positioning) */}
                <button
                    onClick={() => navigate("/courses")}
                    className="hidden md:block absolute top-6 left-6 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors shadow-sm z-20"
                >
                    ← Back
                </button>

                {/* Inner Content Wrapper: applies conditional padding */}
                <div className={`w-full ${contentPadding} pt-4 md:pt-16`}>
                    
                    {/* Course Metadata */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">{course.title}</h1>
                        <p className="text-sm text-indigo-600 font-medium mb-1">{course.category}</p>
                        <p className="text-gray-500 text-base leading-snug">{course.description}</p>
                    </div>

                    <hr className="my-6 border-gray-200" />

                    {/* Course Content (React-Quill Output) */}
                    <div className="ql-snow bg-white">
                        <div
                            className="ql-editor text-gray-800"
                            style={{ fontFamily: "'Lexend', sans-serif", minHeight: "300px", padding: 0 }}
                            dangerouslySetInnerHTML={{ __html: course.content }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
        ? "mx-auto max-w-xl shadow-lg border-gray-200 border-x my-2 md:my-0" 
        : "max-w-full";
        
    // Base padding for content wrapper. Mobile default is no padding, Print layout adds padding.
    const contentPadding = isPrintLayout ? "p-8 md:p-12" : "p-4 md:p-8";

    return (
        // Main container: No padding on mobile (p-0), standard padding on medium and up (md:p-6)
        <div className="w-full min-h-screen flex flex-col font-sans relative p-0 sm:p-0 md:p-6 bg-gray-50 md:bg-white">
            
            {/* Header/Utility Bar for Mobile */}
            <div className="flex justify-between items-center w-full md:hidden bg-white shadow-md z-30 sticky top-0 px-4 py-3">
                <button
                    onClick={() => navigate("/courses")}
                    className="flex items-center text-gray-700 hover:text-gray-900 transition-colors"
                >
                    <span className="text-xl mr-2">←</span> 
                    <span className="text-sm font-medium">Back to Courses</span>
                </button>
                
                {/* Print Layout Toggle Button (visible only on mobile) */}
                <button
                    onClick={() => setIsPrintLayout(!isPrintLayout)}
                    className={`p-2 rounded-full transition-colors ${
                        isPrintLayout ? "bg-indigo-500 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    aria-label="Toggle Print Layout"
                >
                    <SettingsIcon className="w-5 h-5" />
                </button>
            </div>


            {/* Content Area */}
            {/* On medium/desktop screens, the layout is always standard */}
            <div className={`
                bg-white w-full flex-grow relative rounded-none md:rounded-2xl border-0 md:border md:border-gray-200 shadow-none md:shadow-sm 
                transition-all duration-300
                ${layoutClasses}
            `}>
                
                {/* Back button for Desktop (Original positioning) */}
                <button
                    onClick={() => navigate("/courses")}
                    className="hidden md:block absolute top-6 left-6 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors shadow-sm z-20"
                >
                    ← Back
                </button>

                {/* Inner Content Wrapper: applies conditional padding */}
                <div className={`w-full ${contentPadding} pt-4 md:pt-16`}>
                    
                    {/* Course Metadata */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">{course.title}</h1>
                        <p className="text-sm text-indigo-600 font-medium mb-1">{course.category}</p>
                        <p className="text-gray-500 text-base leading-snug">{course.description}</p>
                    </div>

                    <hr className="my-6 border-gray-200" />

                    {/* Course Content (React-Quill Output) */}
                    <div className="ql-snow bg-white">
                        <div
                            className="ql-editor text-gray-800"
                            style={{ fontFamily: "'Lexend', sans-serif", minHeight: "300px", padding: 0 }}
                            dangerouslySetInnerHTML={{ __html: course.content }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

