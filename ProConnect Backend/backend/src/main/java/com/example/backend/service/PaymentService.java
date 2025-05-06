package com.example.backend.service;

import com.example.backend.entity.*;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.FreelancerRepository;
import com.example.backend.repository.PaymentRepository;
import com.example.backend.repository.ProjectRepository;
import com.example.backend.repository.ProposalRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;


// PaymentService.java
@Service
@Transactional
public class PaymentService {
    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private FreelancerRepository freelancerRepository;

    public void processPayment(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (!"Completed".equals(project.getStatus())) {
            throw new IllegalStateException("Only completed projects can be paid");
        }

        if (project.getIsPaid()) {
            throw new IllegalStateException("Project already paid");
        }

        // Update freelancer earnings
        Freelancer freelancer = project.getFreelancer();
        freelancer.setEarnings(freelancer.getEarnings() + project.getBudget());
        freelancerRepository.save(freelancer);

        // Mark project as paid
        project.setIsPaid(true);
        projectRepository.save(project);
    }
}