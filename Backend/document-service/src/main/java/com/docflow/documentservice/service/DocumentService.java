package com.docflow.documentservice.service;

import java.util.List;

import com.docflow.documentservice.dto.CreateDocumentRequest;
import com.docflow.documentservice.dto.DocumentResponse;
import com.docflow.documentservice.dto.UpdateDocumentRequest;

public interface DocumentService {

	DocumentResponse createDocument(CreateDocumentRequest request, String ownerId);

	List<DocumentResponse> getMyDocuments(String ownerId);

	void deleteDocument(String id, String ownerId);

	DocumentResponse updateDocument(String id, UpdateDocumentRequest request, String ownerId);

	DocumentResponse getDocumentById(String id, String ownerId);

}