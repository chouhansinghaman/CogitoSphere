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
        setPdfFile(e.target.files[0]);
    };

    const handleRemovePdf = () => {
        setPdfFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData, pdfFile);
    };

    const imageHandler = useCallback(() => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (/^image\//.test(file.type)) {
                console.log('Uploading image:', file.name);
                const imageUrl = await fakeImageUpload(file);
                console.log('Received URL:', imageUrl);

                const quill = quillRef.current.getEditor();
                const range = quill.getSelection(true);
                quill.insertEmbed(range.index, 'image', imageUrl);
                quill.setSelection(range.index + 1);
            } else {
                console.warn('You can only upload images.');
            }
        };
    }, []);
    
    const fakeImageUpload = (file) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(`https://via.placeholder.com/400x300.png?text=Uploaded:${file.name}`);
            }, 1500);
        });
    };

    const modules = {
        toolbar: {
            container: `#${TOOLBAR_ID}`,
            handlers: {
                image: imageHandler,
            },
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
            {/* ✨ NEW: Style tag for sticky toolbar and scrollable editor */}
            <style>
                {`
                .editor-container {
                    position: relative;
                }
                .editor-container .ql-toolbar {
                    position: sticky;
                    top: 0;
                    z-index: 10;
                    background-color: #f9fafb; /* Tailwind's gray-50 */
                    border-bottom: 1px solid #e5e7eb; /* Tailwind's gray-200 */
                }
                .editor-container .ql-container {
                    height: 350px;
                    overflow-y: auto;
                    border-bottom-left-radius: 0.5rem;
                    border-bottom-right-radius: 0.5rem;
                }
                `}
            </style>

            {/* Title, Category, and Description fields remain the same... */}
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

            {/* ReactQuill Editor */}
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                    Course Content & Notes (Rich Text Editor)
                </label>

                {/* ✨ NEW: Wrapper div for editor and toolbar */}
                <div className="editor-container border border-gray-300 rounded-lg">
                    {/* Custom Toolbar (now inside the wrapper) */}
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
                        // ✨ REMOVED: The inline style is no longer needed
                    />
                </div>
                 <p className="text-xs text-gray-500 mt-2">
                    ✨ Your toolbar will now stick to the top as you write!
                </p>
            </div>

            {/* PDF Upload */}
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Course PDF Material (Optional)</label>
                {!pdfFile ? (
                    <input type="file" onChange={handleFileChange} accept=".pdf" ref={fileInputRef} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                ) : (
                    <div className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
                        <p className="text-sm text-gray-700 truncate">{pdfFile.name}</p>
                        <button type="button" onClick={handleRemovePdf} className="ml-4 text-2xl font-bold text-red-500 hover:text-red-700">&times;</button>
                    </div>
                )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
                <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? 'Saving...' : 'Save Course'}
                </button>
            </div>
        </form>
    );
};

export default CourseForm;