package com.docflow.documentservice.service;

import com.docflow.documentservice.dto.CreateDocumentRequest;
import com.docflow.documentservice.dto.DocumentResponse;
import com.docflow.documentservice.dto.PagedResponse;
import com.docflow.documentservice.dto.UpdateDocumentRequest;

public interface DocumentService {

	DocumentResponse createDocument(CreateDocumentRequest request, String ownerId);

	PagedResponse<DocumentResponse> getMyDocuments(String ownerId, int page, int size, String sortBy);

	void deleteDocument(String id, String ownerId);

	DocumentResponse updateDocument(String id, UpdateDocumentRequest request, String ownerId);

	DocumentResponse getDocumentById(String id, String ownerId);

}