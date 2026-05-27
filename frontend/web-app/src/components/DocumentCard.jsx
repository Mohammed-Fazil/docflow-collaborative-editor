import { useNavigate } from "react-router-dom";

import { Clock, Trash2, ArrowRight } from "lucide-react";

function DocumentCard({
  document,

  onDelete,
}) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition">
      <h2 className="text-2xl font-bold mb-4 line-clamp-1">{document.title}</h2>

      <div
        className="text-gray-500 mb-6 line-clamp-3"
        dangerouslySetInnerHTML={{
          __html: document.content,
        }}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Clock size={16} />

          {new Date(document.updatedAt).toLocaleDateString()}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/documents/${document.id}`)}
            className="flex items-center gap-2 bg-[#5B5BD6] hover:bg-[#4B4BC7] transition text-white px-4 py-2 rounded-xl"
          >
            Open
            <ArrowRight size={16} />
          </button>

          <button
            onClick={() => onDelete(document.id)}
            className="p-2 rounded-xl border border-red-100 text-red-500 hover:bg-red-50"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DocumentCard;
