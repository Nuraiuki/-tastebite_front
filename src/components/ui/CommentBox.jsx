import { useState } from "react";

const CommentBox = ({ comments, onAdd }) => {
  const [text, setText] = useState("");

  const handlePost = () => {
    if (text.trim()) {
      onAdd(text.trim());
      setText("");
    }
  };

  return (
    <div className="mt-10 mb-6">
      <h2 className="text-2xl font-bold mb-2">💬 Comments</h2>

      <div className="space-y-2 mb-4">
        {comments.length > 0 ? (
          comments.map((c, i) => (
            <div
              key={i}
              className="bg-gray-100 px-3 py-2 rounded shadow text-sm text-gray-700"
            >
              {c}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400">No comments yet.</p>
        )}
      </div>

      <textarea
        rows="3"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add your comment..."
        className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:border-orange-400"
      ></textarea>

      <button
        onClick={handlePost}
        className="mt-2 px-4 py-2 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition"
      >
        Post
      </button>
    </div>
  );
};

export default CommentBox;
