package com.docflow.documentservice.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.docflow.documentservice.dto.CreateDocumentRequest;
import com.docflow.documentservice.dto.DocumentResponse;
import com.docflow.documentservice.dto.PagedResponse;
import com.docflow.documentservice.dto.UpdateDocumentRequest;
import com.docflow.documentservice.service.DocumentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
public class DocumentController {

	private final DocumentService documentService;

	@PostMapping
	public DocumentResponse createDocument(@Valid @RequestBody CreateDocumentRequest request,
			Authentication authentication) {

		return documentService.createDocument(request, authentication.getName());
	}

	@GetMapping
	public PagedResponse<DocumentResponse> getMyDocuments(Authentication authentication,
			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size,
			@RequestParam(defaultValue = "updatedAt") String sortBy) {

		return documentService.getMyDocuments(authentication.getName(), page, size, sortBy);
	}

	@DeleteMapping("/{id}")
	public void deleteDocument(@PathVariable String id, Authentication authentication) {

		documentService.deleteDocument(id, authentication.getName());
	}

	@PutMapping("/{id}")
	public DocumentResponse updateDocument(@PathVariable String id, @Valid @RequestBody UpdateDocumentRequest request,
			Authentication authentication) {

		return documentService.updateDocument(id, request, authentication.getName());
	}

	@GetMapping("/{id}")
	public DocumentResponse getDocumentById(@PathVariable String id, Authentication authentication) {

		return documentService.getDocumentById(id, authentication.getName());
	}
}