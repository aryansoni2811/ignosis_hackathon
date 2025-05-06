package com.example.backend.controller;

import com.example.backend.dto.PaymentRequest;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.service.PaymentService;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;


// PaymentController.java
@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    @Autowired
    private PaymentService paymentService;

    @PostMapping("/process/{projectId}")
    public ResponseEntity<Void> processPayment(@PathVariable Long projectId) {
        paymentService.processPayment(projectId);
        return ResponseEntity.ok().build();
    }
}