package com.applywise.backend.gmail;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class GmailOAuthStateStore {

    private static final long STATE_TTL_SECONDS = 300;

    private final SecureRandom secureRandom = new SecureRandom();

    private final Map<String, StateEntry> states = new ConcurrentHashMap<>();

    public String createState(Long applyWiseUserId) {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);

        String state = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes);

        states.put(
                state,
                new StateEntry(
                        applyWiseUserId,
                        Instant.now().plusSeconds(STATE_TTL_SECONDS)
                )
        );

        removeExpiredStates();
        return state;
    }

    public Long consumeState(String state) {
        if (state == null || state.isBlank()) {
            return null;
        }

        StateEntry entry = states.remove(state);

        if (entry == null || entry.expiresAt().isBefore(Instant.now())) {
            return null;
        }

        return entry.applyWiseUserId();
    }

    private void removeExpiredStates() {
        Instant now = Instant.now();

        states.entrySet().removeIf(
                entry -> entry.getValue().expiresAt().isBefore(now)
        );
    }

    private record StateEntry(Long applyWiseUserId, Instant expiresAt) {}
}