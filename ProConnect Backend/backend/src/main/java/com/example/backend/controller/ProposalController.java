package com.example.backend.controller;

import com.example.backend.dto.ProposalRequest;
import com.example.backend.entity.Proposal;
import com.example.backend.exception.AlreadyAppliedException;
import com.example.backend.exception.ErrorResponse;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.service.ProposalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

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
    public ResponseEntity<List<Proposal>> getProposalsByProject(@PathVariable Long projectId) {
        List<Proposal> proposals = proposalService.getProposalsByProject(projectId);
        return ResponseEntity.ok(proposals);
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
}