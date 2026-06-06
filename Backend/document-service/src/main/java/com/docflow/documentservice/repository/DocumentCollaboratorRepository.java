package com.docflow.documentservice.repository;

import java.util.List;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.docflow.documentservice.entity.DocumentCollaborator;

public interface DocumentCollaboratorRepository extends JpaRepository<DocumentCollaborator, String> {

	List<DocumentCollaborator> findByUserEmail(String userEmail);

	Optional<DocumentCollaborator> findByDocumentIdAndUserEmail(String documentId, String userEmail);

	List<DocumentCollaborator> findByDocumentId(String documentId);
}