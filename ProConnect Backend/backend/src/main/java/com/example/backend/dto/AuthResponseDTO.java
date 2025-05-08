package com.example.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponseDTO {
    @JsonProperty("token")
    private String token;

    @JsonProperty("message")
    private String message;

    @JsonProperty("success")
    private boolean success;


    public AuthResponseDTO() {}

    public AuthResponseDTO(String token, String message, boolean success) {
        this.token = token;
        this.message = message;
        this.success = success;
    }

    // Add getters and setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }
}