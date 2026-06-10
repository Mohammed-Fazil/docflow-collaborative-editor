package com.docflow.collaborationservice.dto;

import lombok.Data;

@Data
public class CursorMessage {

	private String documentId;

	private String userEmail;

	private Integer position;
}