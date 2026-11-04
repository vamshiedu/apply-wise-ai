package com.applywise.backend.gmail;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class GmailConnectionService {

    private final GmailConnectionRepository repository;

    public GmailConnectionService(GmailConnectionRepository repository) {
        this.repository = repository;
    }

    public Optional<GmailConnection> findByUserId(Long userId) {
        return repository.findByUserId(userId);
    }

    @Transactional
    public GmailConnection save(GmailConnection connection) {
        return repository.save(connection);
    }

    @Transactional
    public void disconnect(Long userId) {
        repository.deleteByUserId(userId);
    }
}