import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { ArrowLeft, Save, FileText } from "lucide-react";

import { getDocumentById, updateDocument } from "../api/documentApi";

import TiptapEditor from "../components/TiptapEditor";

import {
  connectWebSocket,
  sendDocumentChange,
  disconnectWebSocket,
} from "../websocket/websocketService";

function DocumentEditorPage() {
  const navigate = useNavigate();

  const { id } = useParams();

  const [title, setTitle] = useState("");

  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [isRemoteUpdate, setIsRemoteUpdate] = useState(false);

  /*
    FETCH DOCUMENT
  */

  useEffect(() => {
    fetchDocument();
  }, []);

  const fetchDocument = async () => {
    try {
      const response = await getDocumentById(id);

      setTitle(response.title);

      setContent(response.content || "");
    } catch (error) {
      console.error(error);

      alert("Failed to load document");
    } finally {
      setLoading(false);
    }
  };

  /*
    WEBSOCKET CONNECTION
  */

  useEffect(() => {
    connectWebSocket(
      id,

      (message) => {
        console.log("Received update:", message);

        setIsRemoteUpdate(true);

        setContent(message.content);
      },
    );

    return () => {
      disconnectWebSocket();
    };
  }, [id]);

  /*
    BROADCAST CHANGES
  */

  useEffect(() => {
    if (isRemoteUpdate) {
      setIsRemoteUpdate(false);

      return;
    }

    sendDocumentChange({
      documentId: id,

      content,

      userEmail: "current-user",
    });
  }, [content]);

  /*
    MANUAL SAVE
  */

  const handleSave = async () => {
    try {
      setSaving(true);

      await updateDocument(id, {
        title,

        content,
      });
    } catch (error) {
      console.error(error);

      alert("Failed to save document");
    } finally {
      setSaving(false);
    }
  };

  /*
    LOADING UI
  */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA]">
        <p className="text-gray-500">Loading document...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* TOP BAR */}

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
          {/* LEFT */}

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-3 rounded-xl hover:bg-gray-100 transition"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="w-10 h-10 rounded-xl bg-[#5B5BD6] text-white flex items-center justify-center">
              <FileText size={18} />
            </div>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-3xl font-bold bg-transparent outline-none"
            />
          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-5">
            <span className="text-sm text-gray-500">
              {saving ? "Saving..." : "All changes saved"}
            </span>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-[#5B5BD6] hover:bg-[#4B4BC7] transition text-white px-5 py-3 rounded-2xl shadow-sm"
            >
              <Save size={18} />
              Save
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}

      <main className="max-w-5xl mx-auto py-14 px-8">
        <TiptapEditor content={content} onChange={setContent} />
      </main>
    </div>
  );
}

export default DocumentEditorPage;
