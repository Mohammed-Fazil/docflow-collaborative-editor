package com.docflow.documentservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateDocumentRequest {

	@NotBlank
	private String title;

	private String content;
}