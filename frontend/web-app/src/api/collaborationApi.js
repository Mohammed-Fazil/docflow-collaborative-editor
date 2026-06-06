import axios from "./axios";

/*
  SHARE DOCUMENT
*/

export const addCollaborator = async (

    documentId,

    userEmail,

) => {

    const response = await axios.post(

        `/documents/${documentId}/share`,

        {
            userEmail,

            role: "EDITOR",
        },
    );

    return response.data;
};

/*
  GET SHARED DOCUMENTS
*/

export const getSharedDocuments = async () => {

    const response = await axios.get(

        "/documents/shared"
    );

    return response.data;
};