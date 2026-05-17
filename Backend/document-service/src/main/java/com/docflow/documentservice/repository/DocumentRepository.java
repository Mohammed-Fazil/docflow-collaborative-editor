package com.docflow.documentservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.docflow.documentservice.entity.Document;

public interface DocumentRepository extends JpaRepository<Document, String> {

	List<Document> findByOwnerId(String ownerId);
}