package com.docflow.documentservice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.docflow.documentservice.entity.Document;

public interface DocumentRepository extends JpaRepository<Document, String> {

	Page<Document> findByOwnerId(String ownerId, Pageable pageable);
}