package com.applywise.backend.application;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "http://localhost:5173")
public class ApplicationController {

    private final ApplicationRepository repository;

    public ApplicationController(ApplicationRepository repository) {
        this.repository = repository;
    }

    // Get all applications
    @GetMapping
    public List<Application> getAllApplications() {
        return repository.findAll();
    }

    // Add an application
    @PostMapping
    public Application createApplication(@RequestBody Application application) {
        return repository.save(application);
    }

    // Update an application
    @PutMapping("/{id}")
    public Application updateApplication(
            @PathVariable Long id,
            @RequestBody Application updatedApplication) {

        Application application = repository.findById(id)
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

    // Delete an application
    @DeleteMapping("/{id}")
    public void deleteApplication(@PathVariable Long id) {
        repository.deleteById(id);
    }
}