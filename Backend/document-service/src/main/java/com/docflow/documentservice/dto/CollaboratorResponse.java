package com.docflow.documentservice.dto;

import com.docflow.documentservice.role.CollaboratorRole;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CollaboratorResponse {

	private String email;

	private CollaboratorRole role;

	private boolean owner;
}