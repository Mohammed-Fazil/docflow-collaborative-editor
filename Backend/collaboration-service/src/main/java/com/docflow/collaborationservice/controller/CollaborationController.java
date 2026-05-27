package com.docflow.collaborationservice.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.docflow.collaborationservice.dto.DocumentChangeMessage;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class CollaborationController {

	private final SimpMessagingTemplate messagingTemplate;

	@MessageMapping("/document.edit")
	public void editDocument(@Payload DocumentChangeMessage message) {

		messagingTemplate.convertAndSend("/topic/document/" + message.getDocumentId(), message);
	}
}