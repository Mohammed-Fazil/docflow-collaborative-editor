package com.docflow.documentservice.dto;

import com.docflow.documentservice.role.CollaboratorRole;

import lombok.Data;

@Data
public class ShareDocumentRequest {

	private String userEmail;
	private CollaboratorRole role;
	
}