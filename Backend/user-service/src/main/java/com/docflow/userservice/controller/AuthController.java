package com.docflow.userservice.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.docflow.userservice.dto.AuthResponse;
import com.docflow.userservice.dto.LoginRequest;
import com.docflow.userservice.dto.RefreshTokenRequest;
import com.docflow.userservice.dto.RegisterRequest;
import com.docflow.userservice.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public AuthResponse register(
            @Valid @RequestBody RegisterRequest request
    ) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(
            @Valid @RequestBody LoginRequest request
    ) {
        return authService.login(request);
    }
    @PostMapping("/refresh")
    public AuthResponse refreshToken(
            @RequestBody RefreshTokenRequest request
    ) {
        return authService.refreshToken(request);
    }
}