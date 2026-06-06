package com.docflow.documentservice.entity;

import com.docflow.documentservice.role.CollaboratorRole;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "document_collaborators")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentCollaborator {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private String id;

	/*
	 * DOCUMENT
	 */

	@ManyToOne(fetch = FetchType.LAZY)

	@JoinColumn(name = "document_id")

	private Document document;

	/*
	 * USER
	 */

	private String userEmail;

	/*
	 * ROLE
	 */

	@Enumerated(EnumType.STRING)
	private CollaboratorRole role;
}