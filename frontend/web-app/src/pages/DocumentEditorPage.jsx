import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { ArrowLeft, Save, FileText, Share2 } from "lucide-react";

import { getDocumentById, updateDocument } from "../api/documentApi";

import TiptapEditor from "../components/TiptapEditor";
import {
  addCollaborator,
  getCollaborators,
  removeCollaborator,
} from "../api/collaborationApi";
import {
  connectWebSocket,
  sendDocumentChange,
  disconnectWebSocket,
  joinDocument,
  leaveDocument,
  sendTypingEvent,
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
  const [collaborators, setCollaborators] = useState([]);

  const [currentUserRole, setCurrentUserRole] = useState("");

  const isOwner = currentUserRole === "OWNER";

  const isEditor = currentUserRole === "EDITOR";

  const isViewer = currentUserRole === "VIEWER";

  const [shareRole, setShareRole] = useState("EDITOR");

  const [typingUsers, setTypingUsers] = useState([]);

  const [typingTimeoutId, setTypingTimeoutId] = useState(null);

  /*
  Load Collaborators
  */

  const fetchCollaborators = async () => {
    try {
      const data = await getCollaborators(id);

      setCollaborators(data);
    } catch (error) {
      console.error(error);
    }
  };

  /*
      FETCH DOCUMENT
    */

  useEffect(() => {
    fetchDocument();
    fetchCollaborators();
  }, []);

  const fetchDocument = async () => {
    try {
      const response = await getDocumentById(id);

      setTitle(response.title);

      setContent(response.content || "");
      setCurrentUserRole(response.currentUserRole);
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

        setIsRemoteUpdate(true);

        setContent(message.content);
      },

      /*
    PRESENCE UPDATE
  */

      (users) => {
        console.log("Active users:", users);

        setActiveUsers(users);
      },

      /*
    TYPING UPDATE
  */

      (typingMessage) => {
        if (typingMessage.userEmail === user?.email) {
          return;
        }

        if (typingMessage.typing) {
          setTypingUsers((prev) => [
            ...new Set([...prev, typingMessage.userEmail]),
          ]);
        } else {
          setTypingUsers((prev) =>
            prev.filter((email) => email !== typingMessage.userEmail),
          );
        }
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
      SEND DOCUMENT CHANGE
    */

    sendDocumentChange({
      documentId: id,

      content,

      userEmail: user?.email,
    });

    /*
      USER STARTED TYPING
    */

    sendTypingEvent({
      documentId: id,

      userEmail: user?.email,

      typing: true,
    });

    /*
      CLEAR OLD TIMER
    */

    if (typingTimeoutId) {
      clearTimeout(typingTimeoutId);
    }

    /*
      USER STOPPED TYPING
    */

    const timeout = setTimeout(() => {
      sendTypingEvent({
        documentId: id,

        userEmail: user?.email,

        typing: false,
      });
    }, 2000);

    setTypingTimeoutId(timeout);
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

      await addCollaborator(id, shareEmail, shareRole);

      alert("Collaborator added successfully");

      setShareEmail("");
      fetchCollaborators();
    } catch (error) {
      console.error(error);

      alert("Failed to add collaborator");
    } finally {
      setSharing(false);
    }
  };
  /*
  REMOVE COLLABORATOR
*/

  const handleRemoveCollaborator = async (email) => {
    try {
      await removeCollaborator(
        id,

        email,
      );

      fetchCollaborators();
    } catch (error) {
      console.error(error);

      alert("Failed to remove collaborator");
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
              disabled={isViewer}
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
            {/* ROLE */}

            <div className="px-3 py-2 rounded-xl bg-blue-50 text-blue-700 text-sm font-medium">
              {currentUserRole}
            </div>

            {/* SAVE STATUS */}

            <span className="text-sm text-gray-500">
              {saving ? "Saving..." : "All changes saved"}
            </span>

            {/* SHARE */}

            {isOwner && (
              <div className="flex items-center gap-3">
                <input
                  type="email"
                  placeholder="Invite collaborator"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  className="px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#5B5BD6]"
                />
                <select
                  value={shareRole}
                  onChange={(e) => setShareRole(e.target.value)}
                  className="px-4 py-3 rounded-2xl border border-gray-200"
                >
                  <option value="EDITOR">Editor</option>
                  <option value="VIEWER">Viewer</option>
                </select>

                <button
                  onClick={handleShare}
                  disabled={sharing}
                  className="flex items-center gap-2 bg-black hover:bg-gray-900 text-white px-5 py-3 rounded-2xl transition"
                >
                  <Share2 size={18} />

                  {sharing ? "Sharing..." : "Share"}
                </button>
              </div>
            )}

            {/* SAVE BUTTON */}

            <button
              disabled={isViewer}
              onClick={handleSave}
              className={`flex items-center gap-2 text-white px-5 py-3 rounded-2xl shadow-sm

  ${
    isViewer
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-[#5B5BD6] hover:bg-[#4B4BC7]"
  }`}
            >
              <Save size={18} />
              Save
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}

      <main className="max-w-7xl mx-auto py-14 px-8">
        <div className="grid grid-cols-3 gap-8">
          {/* EDITOR */}

          <div className="col-span-2">
            {isViewer && (
              <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-2xl">
                Read Only Mode - You have viewer access to this document.
              </div>
            )}
            {typingUsers.length > 0 && (
              <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-2xl">
                {typingUsers.join(", ")} is typing...
              </div>
            )}
            <TiptapEditor
              content={content}
              onChange={setContent}
              editable={!isViewer}
            />
          </div>

          {/* COLLABORATORS */}

          <div>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-6">Collaborators</h3>

              <div className="space-y-4">
                {collaborators.length === 0 && (
                  <p className="text-gray-500 text-sm">No collaborators yet</p>
                )}

                {collaborators.map((collaborator) => (
                  <div
                    key={collaborator.email}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{collaborator.email}</p>

                      <p className="text-sm text-gray-500">
                        {collaborator.owner ? "OWNER" : collaborator.role}
                      </p>
                    </div>

                    {isOwner && !collaborator.owner && (
                      <button
                        onClick={() =>
                          handleRemoveCollaborator(collaborator.email)
                        }
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DocumentEditorPage;
