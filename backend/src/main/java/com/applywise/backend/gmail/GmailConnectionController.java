package com.applywise.backend.gmail;

import com.applywise.backend.auth.User;
import com.applywise.backend.auth.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api/gmail")
public class GmailConnectionController {

    private final GmailLinkState gmailLinkState;
    private final UserRepository userRepository;

    public GmailConnectionController(
            GmailLinkState gmailLinkState,
            UserRepository userRepository) {
        this.gmailLinkState = gmailLinkState;
        this.userRepository = userRepository;
    }

    @GetMapping("/connect")
    public void connect(
            Authentication authentication,
            HttpServletRequest request,
            HttpServletResponse response) throws IOException {

        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof String email)) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException(
                        "ApplyWise user not found"));

        HttpSession session = request.getSession(true);
        gmailLinkState.setApplyWiseUserId(user.getId());

        response.sendRedirect(
                request.getContextPath() + "/oauth2/authorization/google");
    }
}