package com.docflow.documentservice.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.docflow.documentservice.dto.CreateDocumentRequest;
import com.docflow.documentservice.dto.DocumentResponse;
import com.docflow.documentservice.dto.PagedResponse;
import com.docflow.documentservice.dto.UpdateDocumentRequest;
import com.docflow.documentservice.entity.Document;
import com.docflow.documentservice.exception.ResourceNotFoundException;
import com.docflow.documentservice.exception.UnauthorizedException;
import com.docflow.documentservice.repository.DocumentRepository;
import com.docflow.documentservice.service.DocumentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {

	private final DocumentRepository documentRepository;

	@Override
	public DocumentResponse createDocument(CreateDocumentRequest request, String ownerId) {

		Document document = Document.builder().title(request.getTitle()).content(request.getContent()).ownerId(ownerId)
				.createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build();

		Document savedDocument = documentRepository.save(document);

		return DocumentResponse.builder().id(savedDocument.getId()).title(savedDocument.getTitle())
				.content(savedDocument.getContent()).ownerId(savedDocument.getOwnerId())
				.createdAt(savedDocument.getCreatedAt()).updatedAt(savedDocument.getUpdatedAt()).build();
	}

	@Override
	public PagedResponse<DocumentResponse> getMyDocuments(String ownerId, int page, int size, String sortBy) {

		Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).descending());

		Page<Document> documentPage = documentRepository.findByOwnerId(ownerId, pageable);

		List<DocumentResponse> documents = documentPage.getContent().stream()
				.map(document -> DocumentResponse.builder().id(document.getId()).title(document.getTitle())
						.content(document.getContent()).ownerId(document.getOwnerId())
						.createdAt(document.getCreatedAt()).updatedAt(document.getUpdatedAt()).build())
				.toList();

		return PagedResponse.<DocumentResponse>builder().content(documents).page(documentPage.getNumber())
				.size(documentPage.getSize()).totalElements(documentPage.getTotalElements())
				.totalPages(documentPage.getTotalPages()).last(documentPage.isLast()).build();
	}

	@Override
	public void deleteDocument(String id, String ownerId) {

		Document document = documentRepository.findById(id)

				.orElseThrow(() -> new ResourceNotFoundException("Document not found"));

		if (!document.getOwnerId().equals(ownerId)) {

			throw new UnauthorizedException("You are not allowed to delete this document");
		}

		documentRepository.delete(document);
	}

	@Override
	public DocumentResponse updateDocument(String id, UpdateDocumentRequest request, String ownerId) {

		Document document = documentRepository.findById(id)

				.orElseThrow(() -> new ResourceNotFoundException("Document not found"));

		if (!document.getOwnerId().equals(ownerId)) {

			throw new UnauthorizedException("You are not allowed to update this document");
		}

		document.setTitle(request.getTitle());

		document.setContent(request.getContent());

		document.setUpdatedAt(LocalDateTime.now());

		Document updatedDocument = documentRepository.save(document);

		return DocumentResponse.builder().id(updatedDocument.getId()).title(updatedDocument.getTitle())
				.content(updatedDocument.getContent()).ownerId(updatedDocument.getOwnerId())
				.createdAt(updatedDocument.getCreatedAt()).updatedAt(updatedDocument.getUpdatedAt()).build();
	}

	@Override
	public DocumentResponse getDocumentById(String id, String ownerId) {

		Document document = documentRepository.findById(id)

				.orElseThrow(() -> new ResourceNotFoundException("Document not found"));

		if (!document.getOwnerId().equals(ownerId)) {

			throw new UnauthorizedException("You are not allowed to access this document");
		}

		return DocumentResponse.builder().id(document.getId()).title(document.getTitle()).content(document.getContent())
				.ownerId(document.getOwnerId()).createdAt(document.getCreatedAt()).updatedAt(document.getUpdatedAt())
				.build();
	}
}