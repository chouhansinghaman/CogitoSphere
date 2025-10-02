import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import 'react-quill/dist/quill.snow.css';

export default function CourseDetail() {
    const { id } = useParams(); // ← Use id instead of slug
    const location = useLocation();
    const navigate = useNavigate();
    const [course, setCourse] = useState(location.state?.course || null);
    const [loading, setLoading] = useState(!course);

    useEffect(() => {
        const fetchCourse = async () => {
            if (!course) {
                setLoading(true);
                try {
                    const res = await fetch(`http://localhost:5001/api/courses/${id}`);
                    if (!res.ok) {
                        const errData = await res.json();
                        throw new Error(errData.message || "Course not found");
                    }
                    const data = await res.json();
                    setCourse(data.course);
                } catch (err) {
                    toast.error(err.message);
                    navigate("/courses");
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchCourse();
    }, [id, course, navigate]);

    if (loading) return <p className="text-center text-gray-500 p-10">Loading course...</p>;
    if (!course) return null;

    return (
        <div className="w-full min-h-screen flex flex-col font-sans relative p-0 md:p-6">
            <button
                onClick={() => navigate("/courses")}
                className="absolute top-4 left-4 md:top-6 md:left-6 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors shadow-sm z-20"
            >
                ← Back
            </button>

            <div className="bg-white w-full h-full relative mt-0 md:mt-14 rounded-none md:rounded-2xl border-0 md:border md:border-gray-200 shadow-none md:shadow-sm p-4 pt-16 md:p-8">
                <h1 className="text-3xl font-bold text-black mb-4">{course.title}</h1>
                <p className="text-sm text-gray-500 mb-2">Category: {course.category}</p>
                <p className="text-gray-700 leading-relaxed mb-6">{course.description}</p>

                <hr className="my-6" />

                <div className="ql-snow bg-white rounded-xl">
                    <div
                        className="ql-editor text-gray-800"
                        style={{ fontFamily: "'Lexend', sans-serif", minHeight: "300px" }}
                        dangerouslySetInnerHTML={{ __html: course.content }}
                    />
                </div>
            </div>
        </div>
    );
}
