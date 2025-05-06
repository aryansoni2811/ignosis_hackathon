package com.example.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/debug")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class DebugController {

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }

    @PostMapping("/test-post")
    public ResponseEntity<Map<String, Object>> testPost() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "POST request successful");
        response.put("status", "OK");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/cors-info")
    public ResponseEntity<Map<String, Object>> corsInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("allowedOrigins", "http://localhost:5173");
        info.put("allowedMethods", "GET, POST, PUT, DELETE, OPTIONS");
        info.put("allowCredentials", true);
        return ResponseEntity.ok(info);
    }
}