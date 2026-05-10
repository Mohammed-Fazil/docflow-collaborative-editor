package com.docflow.userservice.security;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

	@Value("${jwt.secret}")
	private String secret;

	@Value("${jwt.access-token-expiration}")
	private long accessExpiration;

	@Value("${jwt.refresh-token-expiration}")
	private long refreshExpiration;

	private SecretKey getKey() {
	    return Keys.hmacShaKeyFor(secret.getBytes());
	}

	public String generateAccessToken(String email) {

		return Jwts.builder().subject(email).issuedAt(new Date())
				.expiration(new Date(System.currentTimeMillis() + accessExpiration))
				.signWith(getKey(), SignatureAlgorithm.HS256).compact();
	}

	public String generateRefreshToken(String email) {

		return Jwts.builder().subject(email).issuedAt(new Date())
				.expiration(new Date(System.currentTimeMillis() + refreshExpiration))
				.signWith(getKey(), SignatureAlgorithm.HS256).compact();
	}

	public String extractEmail(String token) {

		return Jwts.parser().verifyWith(getKey()).build().parseSignedClaims(token).getPayload().getSubject();
	}

	public boolean isTokenValid(String token) {

		try {

			Jwts.parser().verifyWith(getKey()).build().parseSignedClaims(token);

			return true;

		} catch (Exception e) {
			return false;
		}
	}
}