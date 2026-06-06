import { useNavigate } from "react-router-dom";

import { Clock, Trash2, ArrowRight, Users } from "lucide-react";

function DocumentCard({
  document,

  onDelete,

  shared = false,
}) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition">
      {/* TITLE */}

      <h2 className="text-2xl font-bold mb-3 line-clamp-1">{document.title}</h2>

      {/* SHARED BADGE */}

      {shared && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium mb-4">
          <Users size={14} />
          Shared Document
        </div>
      )}

      {/* CONTENT */}

      <div
        className="text-gray-500 mb-6 line-clamp-3 prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{
          __html: document.content,
        }}
      />

      {/* FOOTER */}

      <div className="flex items-center justify-between">
        {/* DATE */}

        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Clock size={16} />

          {new Date(document.updatedAt).toLocaleDateString()}
        </div>

        {/* ACTIONS */}

        <div className="flex gap-2">
          {/* OPEN */}

          <button
            onClick={() => navigate(`/documents/${document.id}`)}
            className="flex items-center gap-2 bg-[#5B5BD6] hover:bg-[#4B4BC7] transition text-white px-4 py-2 rounded-xl"
          >
            Open
            <ArrowRight size={16} />
          </button>

          {/* DELETE */}

          {!shared && (
            <button
              onClick={() => onDelete(document.id)}
              className="p-2 rounded-xl border border-red-100 text-red-500 hover:bg-red-50"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default DocumentCard;
