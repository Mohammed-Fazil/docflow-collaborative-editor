package com.docflow.collaborationservice.dto;

import lombok.Data;

@Data
public class DocumentChangeMessage {

	private String documentId;

	private String content;

	private String userEmail;
}