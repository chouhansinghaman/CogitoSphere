import React, { useRef, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Quill from 'quill';

// Add custom fonts
const Font = Quill.import('formats/font');
Font.whitelist = ['sans-serif', 'serif', 'monospace', 'Oswald', 'Lexend'];
Quill.register(Font, true);

// Custom toolbar ID
const TOOLBAR_ID = "toolbar";

const CourseForm = ({ formData, setFormData, pdfFile, setPdfFile, onSave, isSubmitting }) => {
    const fileInputRef = useRef(null);
    const quillRef = useRef(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleContentChange = (value) => {
        setFormData((prev) => ({ ...prev, content: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPdfFile(file); // Set to the new file object
        }
    };

    const handleRemovePdf = () => {
        setPdfFile(null); // Set to null to indicate removal
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData, pdfFile); // Pass formData and the pdfFile state
    };
    
    // Modules and formats for ReactQuill
    const modules = {
        toolbar: {
            container: `#${TOOLBAR_ID}`,
        },
    };

    const formats = [
        'header', 'font', 'size', 'bold', 'italic', 'underline', 'strike',
        'color', 'background', 'script', 'blockquote', 'code-block',
        'list', 'bullet', 'indent', 'align', 'link', 'image', 'video'
    ];

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-white p-8 rounded-2xl border border-gray-200"
        >
            <style>
                {`
                .editor-container {
                    position: relative;
                }
                .editor-container .ql-toolbar {
                    position: sticky;
                    top: 0;
                    z-index: 10;
                    background-color: #f9fafb;
                    border-bottom: 1px solid #e5e7eb;
                }
                .editor-container .ql-container {
                    height: 350px;
                    overflow-y: auto;
                    border-bottom-left-radius: 0.5rem;
                    border-bottom-right-radius: 0.5rem;
                }
                `}
            </style>

            <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Course Title</label>
                <input name="title" type="text" value={formData?.title || ''} onChange={handleInputChange} placeholder="e.g., Knowledge Management Systems" className="w-full bg-gray-50 text-gray-800 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Category</label>
                <input name="category" type="text" value={formData?.category || ''} onChange={handleInputChange} placeholder="e.g., IT & Software" className="w-full bg-gray-50 text-gray-800 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Short Description</label>
                <textarea name="description" value={formData?.description || ''} onChange={handleInputChange} rows="3" placeholder="A brief summary of the course..." className="w-full bg-gray-50 text-gray-800 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required ></textarea>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                    Course Content & Notes (Rich Text Editor)
                </label>
                <div className="editor-container border border-gray-300 rounded-lg">
                    <div id={TOOLBAR_ID}>
                        <select className="ql-header"><option value="1" /><option value="2" /><option value="3" /><option selected /></select>
                        <select className="ql-font"><option selected>sans-serif</option><option value="serif">Serif</option><option value="monospace">Monospace</option><option value="Oswald">Oswald</option><option value="Lexend">Lexend</option></select>
                        <select className="ql-size"><option value="small" /><option selected /><option value="large" /><option value="huge" /></select>
                        <button className="ql-bold" /><button className="ql-italic" /><button className="ql-underline" /><button className="ql-strike" />
                        <select className="ql-color" /><select className="ql-background" />
                        <button className="ql-script" value="sub" /><button className="ql-script" value="super" />
                        <button className="ql-blockquote" /><button className="ql-code-block" />
                        <button className="ql-list" value="ordered" /><button className="ql-list" value="bullet" />
                        <button className="ql-indent" value="-1" /><button className="ql-indent" value="+1" />
                        <select className="ql-align" /><button className="ql-link" /><button className="ql-image" /><button className="ql-video" />
                    </div>
                    <ReactQuill
                        ref={quillRef}
                        theme="snow"
                        value={formData?.content || ''}
                        onChange={handleContentChange}
                        modules={modules}
                        formats={formats}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Course PDF Material (Optional)</label>
                {pdfFile?.url ? (
                    <div className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
                        <a href={pdfFile.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 underline truncate">
                            {pdfFile.name}
                        </a>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleRemovePdf}
                                className="text-2xl font-bold text-red-500 hover:text-red-700"
                                title="Remove PDF"
                            >
                                &times;
                            </button>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                            >
                                Replace
                            </button>
                        </div>
                    </div>
                ) : (
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf"
                        ref={fileInputRef}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                )}
            </div>

            <div className="flex justify-end gap-4">
                <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? 'Saving...' : 'Save Course'}
                </button>
            </div>
        </form>
    );
};

export default CourseForm;