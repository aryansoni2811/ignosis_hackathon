package com.example.backend.controller;

import com.example.backend.dto.ProposalRequest;
import com.example.backend.dto.ProposalResponseDTO;
import com.example.backend.entity.Proposal;
import com.example.backend.exception.AlreadyAppliedException;
import com.example.backend.exception.ErrorResponse;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.service.ProposalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/proposals")
public class ProposalController {

    @Autowired
    private ProposalService proposalService;

    @PostMapping
    public ResponseEntity<?> createProposal(@RequestBody ProposalRequest proposalRequest) {
        try {
            Proposal createdProposal = proposalService.createProposal(proposalRequest);
            return ResponseEntity.ok(createdProposal);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (AlreadyAppliedException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Failed to create proposal: " + e.getMessage()));
        }
    }


    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<ProposalResponseDTO>> getProposalsByProject(@PathVariable Long projectId) {
        List<Proposal> proposals = proposalService.getProposalsByProject(projectId);

        List<ProposalResponseDTO> dtos = proposals.stream()
                .map(ProposalResponseDTO::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/{proposalId}/accept")
    public ResponseEntity<Proposal> acceptProposal(@PathVariable Long proposalId) {
        Proposal acceptedProposal = proposalService.acceptProposal(proposalId);
        return ResponseEntity.ok(acceptedProposal);
    }

    @PutMapping("/{proposalId}/reject")
    public ResponseEntity<Proposal> rejectProposal(@PathVariable Long proposalId) {
        Proposal rejectedProposal = proposalService.rejectProposal(proposalId);
        return ResponseEntity.ok(rejectedProposal);
    }

    @GetMapping("/project/{projectId}/debug")
    public ResponseEntity<?> debugProposals(@PathVariable Long projectId) {
        try {
            List<Proposal> proposals = proposalService.getProposalsByProject(projectId);
            StringBuilder debug = new StringBuilder();
            debug.append("Found ").append(proposals.size()).append(" proposals for project ").append(projectId).append("\n");

            // Add detailed info about each proposal
            for (Proposal p : proposals) {
                debug.append("Proposal ID: ").append(p.getId())
                        .append(", Status: ").append(p.getStatus())
                        .append(", BidAmount: ").append(p.getBidAmount());

                if (p.getFreelancer() != null) {
                    debug.append(", Freelancer: ").append(p.getFreelancer().getName())
                            .append(" (ID: ").append(p.getFreelancer().getId()).append(")");
                } else {
                    debug.append(", Freelancer: NULL");
                }
                debug.append("\n");
            }

            return ResponseEntity.ok(debug.toString());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("Error in debug endpoint: " + e.getMessage());
        }
    }

    @GetMapping("/project/{projectId}/test")
    public ResponseEntity<?> testProposals(@PathVariable Long projectId) {
        List<Proposal> proposals = proposalService.getProposalsByProject(projectId);

        // Simple debug output
        List<Map<String, Object>> result = proposals.stream().map(p -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", p.getId());
            map.put("status", p.getStatus());
            map.put("freelancerId", p.getFreelancer() != null ? p.getFreelancer().getId() : null);
            map.put("projectId", p.getProject() != null ? p.getProject().getId() : null);
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}