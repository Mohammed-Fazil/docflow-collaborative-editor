import api from "./axios";

export const getDocuments = async (
    page = 0,
    size = 10
) => {

    const response = await api.get(
        `/documents?page=${page}&size=${size}`
    );

    return response.data;
};

export const createDocument = async (
    data
) => {

    const response = await api.post(
        "/documents",
        data
    );

    return response.data;
};

export const deleteDocument = async (
    id
) => {

    await api.delete(
        `/documents/${id}`
    );
};
export const getDocumentById = async (
  id
) => {

  const response = await api.get(
    `/documents/${id}`
  );

  return response.data;
};

export const updateDocument = async (
  id,
  data
) => {

  const response = await api.put(
    `/documents/${id}`,
    data
  );

  return response.data;
};