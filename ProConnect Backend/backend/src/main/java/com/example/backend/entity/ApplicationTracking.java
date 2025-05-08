package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "application_tracking")
public class ApplicationTracking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Freelancer freelancer;

    private String skill;
    private boolean won;
    private LocalDateTime appliedDate;

}
