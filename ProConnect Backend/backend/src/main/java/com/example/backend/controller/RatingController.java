package com.example.backend.controller;

import com.example.backend.entity.Rating;
import com.example.backend.repository.RatingRepository;
import com.example.backend.service.RatingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ratings")
public class RatingController {
    @Autowired
    private RatingService ratingService;

    @Autowired
    private RatingRepository ratingRepository;


    @PostMapping
    public ResponseEntity<?> createRating(@RequestBody Rating rating) {
        try {
            // Validate required fields
            if (rating.getFreelancerId() == null) {
                return ResponseEntity.badRequest().body("Freelancer ID is required");
            }
            if (rating.getClientId() == null) {
                return ResponseEntity.badRequest().body("Client ID is required");
            }
            if (rating.getProjectId() == null) {
                return ResponseEntity.badRequest().body("Project ID is required");
            }
            if (rating.getRating() < 1 || rating.getRating() > 10) {
                return ResponseEntity.badRequest().body("Rating must be between 1 and 10");
            }

            // Set creation timestamp
            rating.setCreatedAt(LocalDateTime.now());

            // Save the rating
            Rating savedRating = ratingService.saveRating(rating);
            return ResponseEntity.ok(savedRating);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating rating: " + e.getMessage());
        }
    }

    @GetMapping("/freelancer/{freelancerId}")
    public ResponseEntity<List<Rating>> getFreelancerRatings(@PathVariable Long freelancerId) {
        return ResponseEntity.ok(ratingService.getRatingsByFreelancerId(freelancerId));
    }

    @GetMapping("/freelancer/{freelancerId}/average")
    public ResponseEntity<Double> getFreelancerAverageRating(@PathVariable Long freelancerId) {
        Double average = ratingService.getAverageRating(freelancerId);
        return ResponseEntity.ok(average != null ? average : 0.0);
    }

    @GetMapping("/freelancer/{freelancerId}/stats")
    public ResponseEntity<Map<String, Object>> getFreelancerRatingStats(@PathVariable Long freelancerId) {
        return ResponseEntity.ok(ratingService.getFreelancerRatingStats(freelancerId));
    }

    @GetMapping
    public ResponseEntity<List<Rating>> getAllRatings() {
        return ResponseEntity.ok(ratingRepository.findAll());
    }


    @GetMapping("/check-rating")
    public ResponseEntity<?> checkIfClientRatedFreelancer(
            @RequestParam Long projectId,
            @RequestParam Long clientId,
            @RequestParam(required = false) Long freelancerId) {
        try {
            boolean hasRated;

            // If freelancerId is provided, check specific project-freelancer-client combination
            if (freelancerId != null) {
                hasRated = ratingService.hasClientRatedFreelancerForProject(freelancerId, clientId, projectId);
            } else {
                // Otherwise just check if the client rated for this project
                hasRated = ratingService.hasClientRatedForProject(clientId, projectId);
            }

            return ResponseEntity.ok(hasRated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error checking rating: " + e.getMessage());
        }
    }
}
