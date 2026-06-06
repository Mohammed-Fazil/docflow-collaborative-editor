import { useEffect, useState } from "react";

import { FileText, LogOut, Plus, Users } from "lucide-react";

import {
  getDocuments,
  createDocument,
  deleteDocument,
} from "../api/documentApi";

import { getSharedDocuments } from "../api/collaborationApi";

import { useAuth } from "../context/AuthContext";

import DocumentCard from "../components/DocumentCard";

import { useNavigate } from "react-router-dom";

function DashboardPage() {
  const navigate = useNavigate();

  const { logout, user } = useAuth();

  /*
    DOCUMENT STATE
  */

  const [documents, setDocuments] = useState([]);

  const [sharedDocuments, setSharedDocuments] = useState([]);

  /*
    PAGINATION
  */

  const [page, setPage] = useState(0);

  const [totalPages, setTotalPages] = useState(0);

  /*
    FETCH DATA
  */

  useEffect(() => {
    fetchDocuments();
  }, [page]);

  const fetchDocuments = async () => {
    try {
      /*
        OWN DOCUMENTS
      */

      const response = await getDocuments(page, 6);

      setDocuments(response.content);

      setTotalPages(response.totalPages);

      /*
        SHARED DOCUMENTS
      */

      const sharedDocs = await getSharedDocuments();

      setSharedDocuments(sharedDocs);
    } catch (error) {
      console.error(error);
    }
  };

  /*
    CREATE DOCUMENT
  */

  const handleCreate = async () => {
    try {
      const document = await createDocument({
        title: "Untitled Document",

        content: "",
      });

      navigate(`/documents/${document.id}`);
    } catch (error) {
      console.error(error);

      alert("Failed to create document");
    }
  };

  /*
    DELETE DOCUMENT
  */

  const handleDelete = async (id) => {
    try {
      await deleteDocument(id);

      fetchDocuments();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F7F8FA]">
      {/* SIDEBAR */}

      <aside className="w-72 bg-white border-r border-gray-200 p-6 flex flex-col">
        {/* LOGO */}

        <div className="flex items-center gap-3 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-[#5B5BD6] flex items-center justify-center text-white">
            <FileText />
          </div>

          <div>
            <h1 className="text-2xl font-bold">DocFlow</h1>

            <p className="text-sm text-gray-500">Collaborative Workspace</p>
          </div>
        </div>

        {/* USER */}

        <div className="bg-[#F7F8FA] rounded-2xl p-4 mb-6">
          <p className="text-sm text-gray-500 mb-1">Logged in as</p>

          <p className="font-semibold text-gray-800">{user?.email}</p>
        </div>

        {/* CREATE */}

        <button
          onClick={handleCreate}
          className="flex items-center justify-center gap-3 bg-[#5B5BD6] hover:bg-[#4B4BC7] transition text-white p-4 rounded-2xl mb-4"
        >
          <Plus size={20} />
          New Document
        </button>

        {/* LOGOUT */}

        <button
          onClick={() => {
            logout();

            window.location.href = "/login";
          }}
          className="mt-auto flex items-center justify-center gap-2 bg-black text-white p-4 rounded-2xl"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* MAIN */}

      <main className="flex-1 p-10">
        {/* HEADER */}

        <div className="flex items-center justify-between mb-14">
          <div>
            <h2 className="text-5xl font-bold mb-3">Welcome back 👋</h2>

            <p className="text-gray-500 text-lg">
              Your collaborative workspace.
            </p>
          </div>
        </div>

        {/* RECENT DOCUMENTS */}

        <div className="mb-14">
          <div className="flex items-center gap-3 mb-8">
            <FileText className="text-[#5B5BD6]" />

            <h3 className="text-3xl font-bold">Recent Documents</h3>
          </div>

          {documents.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-20 text-center">
              <h3 className="text-2xl font-bold mb-3">No documents yet</h3>

              <p className="text-gray-500 mb-6">
                Create your first document to start collaborating.
              </p>

              <button
                onClick={handleCreate}
                className="bg-[#5B5BD6] hover:bg-[#4B4BC7] transition text-white px-6 py-3 rounded-2xl"
              >
                Create Document
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {documents.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        {/* SHARED DOCUMENTS */}

        <div>
          <div className="flex items-center gap-3 mb-8">
            <Users className="text-[#5B5BD6]" />

            <h3 className="text-3xl font-bold">Shared With Me</h3>
          </div>

          {sharedDocuments.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
              <p className="text-gray-500 text-lg">No shared documents yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sharedDocuments.map((document) => (
                <DocumentCard key={document.id} document={document} shared />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
