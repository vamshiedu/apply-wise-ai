package com.applywise.backend.gmail;

import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.SessionScope;

@Component
@SessionScope
public class GmailLinkState {

    private Long applyWiseUserId;

    public Long getApplyWiseUserId() {
        return applyWiseUserId;
    }

    public void setApplyWiseUserId(Long applyWiseUserId) {
        this.applyWiseUserId = applyWiseUserId;
    }

    public void clear() {
        this.applyWiseUserId = null;
    }
}