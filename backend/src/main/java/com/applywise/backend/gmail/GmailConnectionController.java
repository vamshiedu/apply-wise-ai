package com.applywise.backend.gmail;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestRedirectFilter;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@RestController
@RequestMapping("/api/gmail")
public class GmailConnectionController {

    private final ClientRegistrationRepository clientRegistrationRepository;

    public GmailConnectionController(
            ClientRegistrationRepository clientRegistrationRepository) {
        this.clientRegistrationRepository = clientRegistrationRepository;
    }

    @GetMapping("/connect")
    public void connectGmail(
            Authentication authentication,
            HttpServletRequest request,
            HttpServletResponse response) throws IOException {

        if (authentication == null || !authentication.isAuthenticated()) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        ClientRegistration registration =
                clientRegistrationRepository.findByRegistrationId("google");

        if (registration == null) {
            response.sendError(
                    HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    "Google OAuth client is not configured"
            );
            return;
        }

        response.sendRedirect(
                request.getContextPath()
                        + OAuth2AuthorizationRequestRedirectFilter
                        .DEFAULT_AUTHORIZATION_REQUEST_BASE_URI
                        + "/google"
        );
    }
}