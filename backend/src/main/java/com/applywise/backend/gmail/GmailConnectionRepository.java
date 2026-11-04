package com.applywise.backend.gmail;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GmailConnectionRepository
        extends JpaRepository<GmailConnection, Long> {

    Optional<GmailConnection> findByUserId(Long userId);

    Optional<GmailConnection> findByGoogleEmail(String googleEmail);

    void deleteByUserId(Long userId);
}