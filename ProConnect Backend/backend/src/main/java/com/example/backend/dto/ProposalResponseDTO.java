package com.example.backend.dto;

import com.example.backend.entity.Proposal;
import java.time.LocalDateTime;

public class ProposalResponseDTO {
    private Long id;
    private Long projectId;
    private String projectTitle; // Added for better frontend display
    private FreelancerDTO freelancer;
    private String coverLetter;
    private Double bidAmount;
    private String status;
    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;

    public static ProposalResponseDTO fromEntity(Proposal proposal) {
        ProposalResponseDTO dto = new ProposalResponseDTO();
        if (proposal == null) return dto;

        dto.id = proposal.getId();

        if (proposal.getProject() != null) {
            dto.projectId = proposal.getProject().getId();
            dto.projectTitle = proposal.getProject().getTitle();
        }

        dto.freelancer = proposal.getFreelancer() != null ?
                FreelancerDTO.fromEntity(proposal.getFreelancer()) : null;

        dto.coverLetter = proposal.getCoverLetter();
        dto.bidAmount = proposal.getBidAmount();
        dto.status = proposal.getStatus();
        dto.submittedAt = proposal.getSubmittedAt();
        dto.reviewedAt = proposal.getReviewedAt();

        return dto;
    }

    // Getters only (immutable DTO)
    public Long getId() { return id; }
    public Long getProjectId() { return projectId; }
    public String getProjectTitle() { return projectTitle; }
    public FreelancerDTO getFreelancer() { return freelancer; }
    public String getCoverLetter() { return coverLetter; }
    public Double getBidAmount() { return bidAmount; }
    public String getStatus() { return status; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public LocalDateTime getReviewedAt() { return reviewedAt; }
}