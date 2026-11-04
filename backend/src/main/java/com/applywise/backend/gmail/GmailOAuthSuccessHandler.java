package com.applywise.backend.gmail;

import com.applywise.backend.auth.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class GmailOAuthSuccessHandler implements AuthenticationSuccessHandler {

    private final OAuth2AuthorizedClientService authorizedClientService;
    private final GmailLinkState gmailLinkState;
    private final GmailConnectionService gmailConnectionService;
    private final UserRepository userRepository;
    private final TokenEncryptionService tokenEncryptionService;

    public GmailOAuthSuccessHandler(
            OAuth2AuthorizedClientService authorizedClientService,
            GmailLinkState gmailLinkState,
            GmailConnectionService gmailConnectionService,
            UserRepository userRepository,
            TokenEncryptionService tokenEncryptionService) {
        this.authorizedClientService = authorizedClientService;
        this.gmailLinkState = gmailLinkState;
        this.gmailConnectionService = gmailConnectionService;
        this.userRepository = userRepository;
        this.tokenEncryptionService = tokenEncryptionService;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication)
            throws IOException, ServletException {

        Long applyWiseUserId = gmailLinkState.getApplyWiseUserId();

        if (applyWiseUserId == null) {
            response.sendError(
                    HttpServletResponse.SC_BAD_REQUEST,
                    "Gmail linking session expired. Please try again.");
            return;
        }

        if (!(authentication instanceof OAuth2AuthenticationToken oauthToken)) {
            response.sendError(
                    HttpServletResponse.SC_BAD_REQUEST,
                    "Google OAuth authentication was not received.");
            return;
        }

        OAuth2AuthorizedClient client =
                authorizedClientService.loadAuthorizedClient(
                        oauthToken.getAuthorizedClientRegistrationId(),
                        oauthToken.getName());

        if (client == null || client.getAccessToken() == null) {
            response.sendError(
                    HttpServletResponse.SC_BAD_REQUEST,
                    "Google authorization tokens were not found.");
            return;
        }

        String googleEmail = oauthToken.getPrincipal().getAttribute("email");

        if (googleEmail == null || googleEmail.isBlank()) {
            response.sendError(
                    HttpServletResponse.SC_BAD_REQUEST,
                    "Could not retrieve Google account email.");
            return;
        }

        GmailConnection connection = gmailConnectionService
                .findByUserId(applyWiseUserId)
                .orElseGet(GmailConnection::new);

        connection.setUserId(applyWiseUserId);
        connection.setGoogleEmail(googleEmail);
        connection.setAccessToken(
                tokenEncryptionService.encrypt(
                        client.getAccessToken().getTokenValue()));

        if (client.getRefreshToken() != null) {
            connection.setRefreshToken(
                    tokenEncryptionService.encrypt(
                            client.getRefreshToken().getTokenValue()));
        }

        if (client.getAccessToken().getExpiresAt() != null) {
            connection.setTokenExpiry(
                    client.getAccessToken().getExpiresAt());
        }

        gmailConnectionService.save(connection);
        gmailLinkState.clear();

        response.sendRedirect("http://localhost:5173/settings?gmail=connected");
    }
}