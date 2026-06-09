package com.docflow.collaborationservice.controller;

import java.util.Set;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.docflow.collaborationservice.dto.DocumentChangeMessage;
import com.docflow.collaborationservice.dto.PresenceMessage;
import com.docflow.collaborationservice.dto.TypingMessage;
import com.docflow.collaborationservice.service.PresenceService;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class CollaborationController {

	private final SimpMessagingTemplate messagingTemplate;

	private final PresenceService presenceService;

	/*
	 * DOCUMENT EDITS
	 */

	@MessageMapping("/document.edit")
	public void handleEdit(@Payload DocumentChangeMessage message) {
		messagingTemplate.convertAndSend("/topic/document/" + message.getDocumentId(), message);
	}

	/*
	 * USER JOIN
	 */

	@MessageMapping("/document.join")
	public void handleJoin(@Payload PresenceMessage message, SimpMessageHeaderAccessor headerAccessor) {

		/*
		 * SESSION ID
		 */

		String sessionId = headerAccessor.getSessionId();

		/*
		 * ADD USER
		 */

		presenceService.addUser(sessionId, message.getDocumentId(), message.getUserEmail());

		/*
		 * BROADCAST USERS
		 */

		broadcastPresence(message.getDocumentId());
	}

	/*
	 * USER LEAVE
	 */

	@MessageMapping("/document.leave")
	public void handleLeave(@Payload PresenceMessage message, SimpMessageHeaderAccessor headerAccessor) {

		/*
		 * SESSION ID
		 */

		String sessionId = headerAccessor.getSessionId();

		/*
		 * REMOVE USER
		 */

		presenceService.removeUser(sessionId);

		/*
		 * BROADCAST USERS
		 */

		broadcastPresence(message.getDocumentId());
	}

	/*
	 * USER TYPING
	 */
	@MessageMapping("/document.typing")
	public void handleTyping(@Payload TypingMessage message) {

		messagingTemplate.convertAndSend("/topic/typing/" + message.getDocumentId(), message);
	}

	/*
	 * BROADCAST USERS
	 */

	private void broadcastPresence(String documentId) {

		Set<String> users = presenceService.getUsers(documentId);

		messagingTemplate.convertAndSend("/topic/presence/" + documentId, users);
	}

}