package com.docflow.userservice.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {

    @GetMapping("/me")
    public String me(Authentication authentication) {

        return "Hello " + authentication.getName();
    }
}