package com.example.backend.controller;

import com.example.backend.entity.Rating;
import com.example.backend.repository.RatingRepository;
import com.example.backend.service.RatingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<Rating> createRating(@RequestBody Rating rating) {
        return ResponseEntity.ok(ratingService.saveRating(rating));
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
    public ResponseEntity<Boolean> checkIfClientRatedFreelancer(
            @RequestParam Long freelancerId,
            @RequestParam Long clientId,
            @RequestParam Long projectId) {
        try {
            boolean hasRated = ratingService.hasClientRatedFreelancerForProject(freelancerId, clientId, projectId);
            return ResponseEntity.ok(hasRated);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(false);
        }
    }
}