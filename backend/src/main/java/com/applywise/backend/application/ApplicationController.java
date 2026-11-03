package com.applywise.backend.application;

import com.applywise.backend.auth.User;
import com.applywise.backend.auth.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "http://localhost:5173")
public class ApplicationController {

    private final ApplicationRepository repository;
    private final UserRepository userRepository;

    public ApplicationController(
            ApplicationRepository repository,
            UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    // Get applications belonging to the logged-in user
    @GetMapping
    public List<Application> getAllApplications(Authentication authentication) {
        return repository.findByUserEmail(authentication.getName());
    }

    // Add an application for the logged-in user
    @PostMapping
    public Application createApplication(
            @RequestBody Application application,
            Authentication authentication) {

        User user = getLoggedInUser(authentication);
        application.setUser(user);

        return repository.save(application);
    }

    // Update an application only if it belongs to the logged-in user
    @PutMapping("/{id}")
    public Application updateApplication(
            @PathVariable Long id,
            @RequestBody Application updatedApplication,
            Authentication authentication) {

        Application application = repository.findById(id)
                .filter(existing ->
                        existing.getUser() != null &&
                                existing.getUser().getEmail().equals(authentication.getName()))
                .orElseThrow(() -> new RuntimeException("Application not found"));

        application.setCompany(updatedApplication.getCompany());
        application.setRole(updatedApplication.getRole());
        application.setLocation(updatedApplication.getLocation());
        application.setDateApplied(updatedApplication.getDateApplied());
        application.setStatus(updatedApplication.getStatus());
        application.setJobUrl(updatedApplication.getJobUrl());
        application.setFollowUpDate(updatedApplication.getFollowUpDate());

        return repository.save(application);
    }

    // Delete an application only if it belongs to the logged-in user
    @DeleteMapping("/{id}")
    public void deleteApplication(
            @PathVariable Long id,
            Authentication authentication) {

        Application application = repository.findById(id)
                .filter(existing ->
                        existing.getUser() != null &&
                                existing.getUser().getEmail().equals(authentication.getName()))
                .orElseThrow(() -> new RuntimeException("Application not found"));

        repository.delete(application);
    }

    private User getLoggedInUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}