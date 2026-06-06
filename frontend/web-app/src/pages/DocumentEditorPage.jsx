import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { ArrowLeft, Save, FileText, Share2 } from "lucide-react";

import { getDocumentById, updateDocument } from "../api/documentApi";

import TiptapEditor from "../components/TiptapEditor";
import { addCollaborator } from "../api/collaborationApi";
import {
  connectWebSocket,
  sendDocumentChange,
  disconnectWebSocket,
  joinDocument,
  leaveDocument,
} from "../websocket/websocketService";

import { useAuth } from "../context/AuthContext";

function DocumentEditorPage() {
  const navigate = useNavigate();

  const { id } = useParams();

  /*
    AUTH CONTEXT
  */

  const { user } = useAuth();

  /*
    DOCUMENT STATE
  */

  const [title, setTitle] = useState("");

  const [content, setContent] = useState("");

  /*
    UI STATE
  */

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  /*
    REALTIME STATE
  */

  const [isRemoteUpdate, setIsRemoteUpdate] = useState(false);

  const [activeUsers, setActiveUsers] = useState([]);

  const [shareEmail, setShareEmail] = useState("");

  const [sharing, setSharing] = useState(false);

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
    /*
      CONNECT
    */

    connectWebSocket(
      id,

      /*
        DOCUMENT UPDATE
      */

      (message) => {
        console.log("Received update:", message);

        /*
          PREVENT LOOP
        */

        setIsRemoteUpdate(true);

        setContent(message.content);
      },

      /*
        ACTIVE USERS
      */

      (users) => {
        console.log("Active users:", users);

        setActiveUsers(users);
      },
    );

    /*
      JOIN ROOM
    */

    const timer = setTimeout(() => {
      joinDocument({
        documentId: id,

        userEmail: user?.email,

        type: "JOIN",
      });
    }, 1000);

    /*
      CLEANUP
    */

    return () => {
      clearTimeout(timer);

      leaveDocument({
        documentId: id,

        userEmail: user?.email,

        type: "LEAVE",
      });

      disconnectWebSocket();
    };
  }, [id, user]);

  /*
    BROADCAST CHANGES
  */

  useEffect(() => {
    /*
      SKIP REMOTE UPDATES
    */

    if (isRemoteUpdate) {
      setIsRemoteUpdate(false);

      return;
    }

    /*
      SEND EDIT EVENT
    */

    sendDocumentChange({
      documentId: id,

      content,

      userEmail: user?.email,
    });
  }, [content]);

  /*
  SHARE DOCUMENT
*/

  const handleShare = async () => {
    if (!shareEmail) {
      return;
    }

    try {
      setSharing(true);

      await addCollaborator(
        id,

        shareEmail,
      );

      alert("Collaborator added successfully");

      setShareEmail("");
    } catch (error) {
      console.error(error);

      alert("Failed to add collaborator");
    } finally {
      setSharing(false);
    }
  };

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
            {/* ACTIVE USERS */}

            <div className="flex items-center gap-3">
              {activeUsers.map((activeUser) => (
                <div
                  key={activeUser}
                  className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-xl text-sm"
                >
                  <div className="w-2 h-2 rounded-full bg-green-500" />

                  {activeUser}
                </div>
              ))}
            </div>

            {/* SAVE STATUS */}

            <span className="text-sm text-gray-500">
              {saving ? "Saving..." : "All changes saved"}
            </span>

            {/* SHARE */}

            <div className="flex items-center gap-3">
              <input
                type="email"
                placeholder="Invite collaborator"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                className="px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#5B5BD6]"
              />

              <button
                onClick={handleShare}
                disabled={sharing}
                className="flex items-center gap-2 bg-black hover:bg-gray-900 text-white px-5 py-3 rounded-2xl transition"
              >
                <Share2 size={18} />

                {sharing ? "Sharing..." : "Share"}
              </button>
            </div>

            {/* SAVE BUTTON */}

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
