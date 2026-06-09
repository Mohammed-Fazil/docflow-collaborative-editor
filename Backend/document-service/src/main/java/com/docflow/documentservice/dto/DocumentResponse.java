package com.docflow.documentservice.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DocumentResponse {

	private String id;

	private String title;

	private String content;

	private String ownerId;

	private LocalDateTime createdAt;

	private LocalDateTime updatedAt;

	private String currentUserRole;
}