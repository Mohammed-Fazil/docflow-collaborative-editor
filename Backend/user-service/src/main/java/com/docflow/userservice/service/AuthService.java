package com.docflow.userservice.service;

import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.docflow.userservice.dto.AuthResponse;
import com.docflow.userservice.dto.LoginRequest;
import com.docflow.userservice.dto.RefreshTokenRequest;
import com.docflow.userservice.dto.RegisterRequest;
import com.docflow.userservice.entity.RefreshToken;
import com.docflow.userservice.entity.User;
import com.docflow.userservice.repository.RefreshTokenRepository;
import com.docflow.userservice.repository.UserRepository;
import com.docflow.userservice.security.JwtService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenRepository refreshTokenRepository;

    public AuthResponse register(RegisterRequest request) {

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        userRepository.save(user);

        String accessToken =
                jwtService.generateAccessToken(user.getEmail());

        String refreshToken =
                jwtService.generateRefreshToken(user.getEmail());

        RefreshToken savedToken = RefreshToken.builder()
                .token(refreshToken)
                .user(user)
                .expiryDate(LocalDateTime.now().plusDays(7))
                .build();

        refreshTokenRepository.save(savedToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("Invalid credentials"));

        boolean matches = passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        );

        if (!matches) {
            throw new RuntimeException("Invalid credentials");
        }

        String accessToken =
                jwtService.generateAccessToken(user.getEmail());

        String refreshToken =
                jwtService.generateRefreshToken(user.getEmail());

        RefreshToken savedToken = RefreshToken.builder()
                .token(refreshToken)
                .user(user)
                .expiryDate(LocalDateTime.now().plusDays(7))
                .build();

        refreshTokenRepository.save(savedToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    public AuthResponse refreshToken(
            RefreshTokenRequest request
    ) {

        RefreshToken refreshToken = refreshTokenRepository
                .findByToken(request.getRefreshToken())
                .orElseThrow(() ->
                        new RuntimeException("Invalid refresh token"));

        if (refreshToken.getExpiryDate()
                .isBefore(LocalDateTime.now())) {

            throw new RuntimeException("Refresh token expired");
        }

        String accessToken =
                jwtService.generateAccessToken(
                        refreshToken.getUser().getEmail()
                );

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .build();
    }
}