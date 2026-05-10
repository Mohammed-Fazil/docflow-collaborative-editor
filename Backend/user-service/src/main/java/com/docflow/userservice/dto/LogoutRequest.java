package com.docflow.userservice.dto;

import lombok.Data;

@Data
public class LogoutRequest {

    private String refreshToken;
}