package com.docflow.documentservice.dto;

import jakarta.validation.constraints.NotBlank;

import lombok.Data;

@Data
public class UpdateDocumentRequest {

	@NotBlank
	private String title;

	private String content;
}