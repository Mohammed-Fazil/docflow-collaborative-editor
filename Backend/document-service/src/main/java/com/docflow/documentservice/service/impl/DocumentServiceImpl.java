package com.docflow.documentservice.service.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.docflow.documentservice.dto.CollaboratorResponse;
import com.docflow.documentservice.dto.CreateDocumentRequest;
import com.docflow.documentservice.dto.DocumentResponse;
import com.docflow.documentservice.dto.PagedResponse;
import com.docflow.documentservice.dto.ShareDocumentRequest;
import com.docflow.documentservice.dto.UpdateDocumentRequest;
import com.docflow.documentservice.entity.Document;
import com.docflow.documentservice.entity.DocumentCollaborator;
import com.docflow.documentservice.exception.ConflictException;
import com.docflow.documentservice.exception.ResourceNotFoundException;
import com.docflow.documentservice.exception.UnauthorizedException;
import com.docflow.documentservice.repository.DocumentCollaboratorRepository;
import com.docflow.documentservice.repository.DocumentRepository;
import com.docflow.documentservice.role.CollaboratorRole;
import com.docflow.documentservice.service.DocumentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {

	private final DocumentRepository documentRepository;

	private final DocumentCollaboratorRepository collaboratorRepository;

	/*
	 * CREATE DOCUMENT
	 */

	@Override
	public DocumentResponse createDocument(CreateDocumentRequest request, String ownerId) {

		Document document = Document.builder().title(request.getTitle()).content(request.getContent()).ownerId(ownerId)
				.createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build();

		Document savedDocument = documentRepository.save(document);

		return mapToResponse(savedDocument,ownerId);
	}

	/*
	 * GET MY DOCUMENTS
	 */

	@Override
	public PagedResponse<DocumentResponse> getMyDocuments(String currentUser, int page, int size, String sortBy) {

		Pageable pageable =

				PageRequest.of(

						page,

						size,

						Sort.by(sortBy).descending());

		Page<Document> ownedPage =

				documentRepository.findByOwnerId(

						currentUser,

						pageable);

		List<DocumentResponse> responses = ownedPage.getContent().stream().map(document -> mapToResponse(document, currentUser)).toList();

		return PagedResponse.<DocumentResponse>builder().content(responses).page(page).size(size)
				.totalElements(ownedPage.getTotalElements()).totalPages(ownedPage.getTotalPages())
				.last(ownedPage.isLast()).build();
	}
	/*
	 * GET SHARED DOCUMENT
	 */

	@Override
	public List<DocumentResponse> getSharedDocuments(String currentUser) {

		List<DocumentCollaborator> collaborations = collaboratorRepository.findByUserEmail(currentUser);

		return collaborations.stream()
		        .map(DocumentCollaborator::getDocument)
		        .map(document -> mapToResponse(document, currentUser))
		        .toList();
	}
	/*
	 * GET DOCUMENT
	 */

	@Override
	public DocumentResponse getDocumentById(String id, String currentUser) {

		Document document = getDocumentOrThrow(id);

		validateAccess(document, currentUser);

		return mapToResponse(document,currentUser);
	}

	/*
	 * UPDATE DOCUMENT
	 */

	@Override
	public DocumentResponse updateDocument(String id, UpdateDocumentRequest request, String currentUser) {

		Document document = getDocumentOrThrow(id);
		if (!canEdit(document, currentUser)) {
			throw new UnauthorizedException("You do not have edit permission");
		}
		document.setTitle(request.getTitle());
		document.setContent(request.getContent());
		document.setUpdatedAt(LocalDateTime.now());
		Document updatedDocument = documentRepository.save(document);
		return mapToResponse(updatedDocument,currentUser);
	}

	/*
	 * DELETE DOCUMENT OWNER ONLY
	 */

	@Override
	public void deleteDocument(String id, String currentUser) {

		Document document = getDocumentOrThrow(id);

		if (!document.getOwnerId().equals(currentUser)) {
			throw new UnauthorizedException("You are not allowed to delete this document");
		}
		documentRepository.delete(document);
	}

	/*
	 * SHARE DOCUMENT
	 */

	@Override
	public void shareDocument(String documentId, ShareDocumentRequest request, String currentUser) {

		Document document = getDocumentOrThrow(documentId);

		/*
		 * OWNER ONLY
		 */

		if (!document.getOwnerId().equals(currentUser)) {
			throw new UnauthorizedException("Only owner can share document");
		}

		/*
		 * ALREADY SHARED?
		 */

		boolean exists = collaboratorRepository.findByDocumentIdAndUserEmail(documentId, request.getUserEmail())
				.isPresent();

		if (exists) {
			throw new ConflictException("Document already shared with this user");
		}

		/*
		 * CREATE COLLABORATOR
		 */

		DocumentCollaborator collaborator = DocumentCollaborator.builder().document(document)
				.userEmail(request.getUserEmail()).role(request.getRole()).build();
		collaboratorRepository.save(collaborator);
	}

	/*
	 * ACCESS VALIDATION
	 */

	private void validateAccess(Document document, String userEmail) {

		if (!hasAccess(document, userEmail)) {
			throw new UnauthorizedException("You are not allowed to access this document");
		}
	}

	/*
	 * OWNER OR COLLABORATOR
	 */

	private boolean hasAccess(Document document, String userEmail) {

		/*
		 * OWNER
		 */

		if (document.getOwnerId().equals(userEmail)) {
			return true;
		}

		/*
		 * COLLABORATOR
		 */

		return collaboratorRepository.findByDocumentIdAndUserEmail(document.getId(), userEmail).isPresent();
	}

	/*
	 * GET DOCUMENT
	 */

	private Document getDocumentOrThrow(String id) {

		return documentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Document not found"));
	}

	/*
	 * MAP RESPONSE
	 */

	private DocumentResponse mapToResponse(Document document, String currentUser) {

		return DocumentResponse.builder()

				.id(document.getId())

				.title(document.getTitle())

				.content(document.getContent())

				.ownerId(document.getOwnerId())

				.createdAt(document.getCreatedAt())

				.updatedAt(document.getUpdatedAt())

				.currentUserRole(getCurrentUserRole(document, currentUser))

				.build();
	}

	@Override
	public List<CollaboratorResponse> getCollaborators(String documentId, String currentUser) {

		Document document = getDocumentOrThrow(documentId);

		validateAccess(document, currentUser);

		List<CollaboratorResponse> collaborators = new ArrayList<>();

		/*
		 * OWNER
		 */

		collaborators.add(CollaboratorResponse.builder().email(document.getOwnerId()).role(null).owner(true).build());

		/*
		 * COLLABORATORS
		 */

		collaboratorRepository.findByDocumentId(documentId).forEach(collaborator -> collaborators.add(

				CollaboratorResponse.builder().email(collaborator.getUserEmail()).role(collaborator.getRole())
						.owner(false).build()));
		return collaborators;
	}

	@Override
	public void removeCollaborator(String documentId, String collaboratorEmail, String currentUser) {

		Document document = getDocumentOrThrow(documentId);

		/*
		 * OWNER ONLY
		 */

		if (!document.getOwnerId().equals(currentUser)) {
			throw new UnauthorizedException("Only owner can remove collaborators");
		}

		DocumentCollaborator collaborator =

				collaboratorRepository

						.findByDocumentIdAndUserEmail(

								documentId,

								collaboratorEmail)

						.orElseThrow(() ->

						new ResourceNotFoundException(

								"Collaborator not found"));

		collaboratorRepository.delete(collaborator);
	}

	private boolean canEdit(Document document, String userEmail) {

		/*
		 * OWNER
		 */

		if (document.getOwnerId().equals(userEmail)) {

			return true;
		}

		return collaboratorRepository.findByDocumentIdAndUserEmail(document.getId(), userEmail)

				.map(collaborator -> collaborator.getRole() == CollaboratorRole.EDITOR).orElse(false);
	}

	private String getCurrentUserRole(Document document, String currentUser) {

		if (document.getOwnerId().equals(currentUser)) {
			return "OWNER";
		}

		return collaboratorRepository

				.findByDocumentIdAndUserEmail(document.getId(), currentUser)

				.map(collaborator -> collaborator.getRole().name())

				.orElse("VIEWER");
	}
}