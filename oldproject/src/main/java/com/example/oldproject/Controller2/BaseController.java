package com.example.oldproject.Controller2;

import com.example.oldproject.Config.UserContext;
import com.example.oldproject.Config.UserContextHolder;

public class BaseController {
    protected UserContext getCurrentUser() {
        UserContext userContext = UserContextHolder.getUserContext();
        if (userContext == null) {
            throw new RuntimeException("用户未登录");
        }
        return userContext;
    }
    
    protected Long getCurrentUserId() {
        return getCurrentUser().getUserId();
    }
    
    protected String getCurrentUsername() {
        return getCurrentUser().getUsername();
    }
} 