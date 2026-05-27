import { useEffect, useState } from "react";

import { FileText, LogOut, Plus } from "lucide-react";

import {
  getDocuments,
  createDocument,
  deleteDocument,
} from "../api/documentApi";

import { useAuth } from "../context/AuthContext";

import DocumentCard from "../components/DocumentCard";

import { useNavigate } from "react-router-dom";

function DashboardPage() {
  const navigate = useNavigate();

  const { logout } = useAuth();

  const [documents, setDocuments] = useState([]);

  const [page, setPage] = useState(0);

  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchDocuments();
  }, [page]);

  const fetchDocuments = async () => {
    try {
      const response = await getDocuments(page, 6);

      setDocuments(response.content);

      setTotalPages(response.totalPages);
    } catch (error) {
      console.error(error);
    }
  };

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
        <div className="flex items-center gap-3 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-[#5B5BD6] flex items-center justify-center text-white">
            <FileText />
          </div>

          <div>
            <h1 className="text-2xl font-bold">DocFlow</h1>

            <p className="text-sm text-gray-500">Collaborative Workspace</p>
          </div>
        </div>

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
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-5xl font-bold mb-3">Welcome back 👋</h2>

            <p className="text-gray-500 text-lg">
              Your collaborative workspace.
            </p>
          </div>

          <button
            onClick={handleCreate}
            className="flex items-center gap-3 bg-[#5B5BD6] hover:bg-[#4B4BC7] transition text-white px-6 py-4 rounded-2xl shadow-sm"
          >
            <Plus size={20} />
            New Document
          </button>
        </div>

        {/* DOCUMENTS */}

        <div className="mb-8">
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
      </main>
    </div>
  );
}

export default DashboardPage;
