package com.docflow.collaborationservice.event;

import java.util.Set;

import org.springframework.context.event.EventListener;

import org.springframework.messaging.simp.SimpMessagingTemplate;

import org.springframework.messaging.simp.stomp.StompHeaderAccessor;

import org.springframework.stereotype.Component;

import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import com.docflow.collaborationservice.service.PresenceService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class WebSocketDisconnectListener {

	private final PresenceService presenceService;

	private final SimpMessagingTemplate messagingTemplate;

	@EventListener
	public void handleDisconnect(SessionDisconnectEvent event) {

		StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());

		/*
		 * SESSION ID
		 */

		String sessionId = accessor.getSessionId();

		/*
		 * GET DOCUMENT
		 */

		String documentId = presenceService.getDocumentId(sessionId);

		/*
		 * REMOVE USER
		 */

		presenceService.removeUser(sessionId);

		/*
		 * BROADCAST UPDATED USERS
		 */

		if (documentId != null) {

			Set<String> users = presenceService.getUsers(documentId);

			messagingTemplate.convertAndSend("/topic/presence/" + documentId, users);
		}

		System.out.println("Disconnected session: " + sessionId);
	}
}