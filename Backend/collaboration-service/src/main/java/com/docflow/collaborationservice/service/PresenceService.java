package com.docflow.collaborationservice.service;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;

@Service
public class PresenceService {

	/*
	 * documentId -> users
	 */

	private final Map<String,

			Set<String>> activeUsers =

					new HashMap<>();

	/*
	 * sessionId -> documentId
	 */

	private final Map<String,

			String> sessionDocuments =

					new HashMap<>();

	/*
	 * sessionId -> userEmail
	 */

	private final Map<String,

			String> sessionUsers =

					new HashMap<>();

	/*
	 * USER JOIN
	 */

	public void addUser(

			String sessionId,

			String documentId,

			String userEmail

	) {

		/*
		 * STORE SESSION
		 */

		sessionDocuments.put(

				sessionId,

				documentId);

		sessionUsers.put(

				sessionId,

				userEmail);

		/*
		 * ADD ACTIVE USER
		 */

		activeUsers

				.computeIfAbsent(

						documentId,

						key -> new HashSet<>())

				.add(userEmail);
	}

	/*
	 * USER LEAVE
	 */

	public void removeUser(

			String sessionId

	) {

		String documentId =

				sessionDocuments.get(sessionId);

		String userEmail =

				sessionUsers.get(sessionId);

		if (

		documentId == null ||

				userEmail == null

		) {

			return;
		}

		Set<String> users =

				activeUsers.get(documentId);

		if (users != null) {

			users.remove(userEmail);

			/*
			 * CLEAN EMPTY ROOM
			 */

			if (users.isEmpty()) {

				activeUsers.remove(documentId);
			}
		}

		/*
		 * CLEAN SESSION MAPS
		 */

		sessionDocuments.remove(sessionId);

		sessionUsers.remove(sessionId);
	}

	/*
	 * GET USERS
	 */

	public Set<String> getUsers(

			String documentId

	) {

		return activeUsers.getOrDefault(

				documentId,

				new HashSet<>());
	}

	/*
	 * GET DOCUMENT BY SESSION
	 */

	public String getDocumentId(

			String sessionId

	) {

		return sessionDocuments.get(sessionId);
	}
}