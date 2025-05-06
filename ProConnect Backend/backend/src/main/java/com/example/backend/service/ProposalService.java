package com.example.backend.service;

import com.example.backend.dto.ProposalRequest;
import com.example.backend.entity.Freelancer;
import com.example.backend.entity.Proposal;
import com.example.backend.entity.Project;
import com.example.backend.exception.AlreadyAppliedException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.FreelancerRepository;
import com.example.backend.repository.PaymentRepository;
import com.example.backend.repository.ProposalRepository;
import com.example.backend.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProposalService {

    @Autowired
    private ProposalRepository proposalRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private FreelancerRepository freelancerRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PaymentService paymentService;

    public Proposal getProposalById(Long proposalId) {
        return proposalRepository.findById(proposalId)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal not found"));
    }

    public boolean isProposalPaid(Long proposalId) {
        return paymentRepository.existsByProposalIdAndStatus(proposalId, "succeeded");
    }

    public List<Proposal> getProposalsByProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        List<Proposal> proposals = proposalRepository.findByProjectId(projectId);
        proposals.sort((p1, p2) -> p2.getSubmittedAt().compareTo(p1.getSubmittedAt()));
        return proposals;
    }

    public List<Proposal> getProposalsByFreelancer(Long freelancerId) {
        return proposalRepository.findByFreelancerId(freelancerId);
    }

    public Proposal createProposal(ProposalRequest proposalRequest) {
        // Verify project exists
        Project project = projectRepository.findById(proposalRequest.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        // Verify freelancer exists
        Freelancer freelancer = freelancerRepository.findById(proposalRequest.getFreelancerId())
                .orElseThrow(() -> new ResourceNotFoundException("Freelancer not found"));

        // Check for duplicate applications
        if (proposalRepository.existsByFreelancerIdAndProjectId(
                proposalRequest.getFreelancerId(),
                proposalRequest.getProjectId())) {
            throw new AlreadyAppliedException("You have already applied to this project");
        }

        // Create new proposal
        Proposal proposal = new Proposal();
        proposal.setProject(project);
        proposal.setFreelancer(freelancer);
        proposal.setCoverLetter(proposalRequest.getCoverLetter());
        proposal.setBidAmount(proposalRequest.getBidAmount());
        proposal.setStatus("Pending");
        proposal.setSubmittedAt(LocalDateTime.now());

        return proposalRepository.save(proposal);
    }

    // ProposalService.java
    @Transactional
    public Proposal acceptProposal(Long proposalId) {
        Proposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal not found"));

        if (proposalRepository.existsByProjectIdAndStatus(proposal.getProject().getId(), "Accepted")) {
            throw new IllegalStateException("Project already has an accepted proposal");
        }

        // Update freelancer earnings
        Freelancer freelancer = proposal.getFreelancer();
        freelancer.setEarnings(freelancer.getEarnings() + proposal.getBidAmount());
        freelancerRepository.save(freelancer);

        // Update project with freelancer
        Project project = proposal.getProject();
        project.setFreelancer(freelancer);
        project.setStatus("In Progress");
        projectRepository.save(project);

        // Update proposal status
        proposal.setStatus("Accepted");
        proposal.setReviewedAt(LocalDateTime.now());
        Proposal acceptedProposal = proposalRepository.save(proposal);

        // Reject other proposals
        proposalRepository.rejectOtherProposals(project.getId(), proposalId);

        return acceptedProposal;
    }

    @Transactional
    public Proposal rejectProposal(Long proposalId) {
        Proposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal not found"));

        proposal.setStatus("Rejected");
        proposal.setReviewedAt(LocalDateTime.now());
        return proposalRepository.save(proposal);
    }
}