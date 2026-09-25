"use client";

import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const modules = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};

export default function RichTextEditor({ value, onChange, placeholder }) {
  return (
    <div className="rich-text overflow-hidden rounded-lg border bg-white text-black [&_.ql-container]:min-h-36 [&_.ql-editor]:min-h-36 [&_.ql-toolbar]:border-0 [&_.ql-toolbar]:border-b [&_.ql-container]:border-0">
      <ReactQuill theme="snow" value={value || ""} onChange={onChange} modules={modules} placeholder={placeholder} />
    </div>
  );
}
