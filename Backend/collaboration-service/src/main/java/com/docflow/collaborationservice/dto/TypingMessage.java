package com.docflow.collaborationservice.dto;

import lombok.Data;

@Data
public class TypingMessage {

	private String documentId;

	private String userEmail;

	private boolean typing;
}