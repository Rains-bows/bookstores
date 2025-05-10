package com.example.oldproject.Config;


import com.example.oldproject.Util.JwtUtil;
import com.example.oldproject.annotation.RequireLogin;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class TokenInterceptor implements HandlerInterceptor {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // 如果不是HandlerMethod（比如资源文件），直接放行
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        HandlerMethod handlerMethod = (HandlerMethod) handler;
        RequireLogin requireLogin = handlerMethod.getMethodAnnotation(RequireLogin.class);
        if (requireLogin == null) {
            requireLogin = handlerMethod.getBeanType().getAnnotation(RequireLogin.class);
        }

        // 如果没有@RequireLogin注解或者required=false，则不需要验证token
        if (requireLogin == null || !requireLogin.required()) {
            return true;
        }

        // 获取token
        String token = request.getHeader("Authorization");
        if (token == null || token.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return false;
        }

        // 验证token并解析用户信息
        if (validateToken(token)) {
            UserContext userContext = new UserContext();
            userContext.setUserId(getUserIdFromToken(token));
            userContext.setUsername(getUsernameFromToken(token));
            userContext.setToken(token);
            
            // 设置到ThreadLocal中
            UserContextHolder.setUserContext(userContext);
            return true;
        }
        
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        return false;
    }
    
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, 
                              Object handler, Exception ex) {
        // 请求完成后清理ThreadLocal，防止内存泄漏
        UserContextHolder.clear();
    }
    
    private boolean validateToken(String token) {
        try {
            // 使用现有的JwtUtil验证token
            return !JwtUtil.isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }
    
    private Long getUserIdFromToken(String token) {
        // 从token中解析用户ID
        return JwtUtil.getUserIdFromToken(token);
    }
    
    private String getUsernameFromToken(String token) {
        // 从token中解析用户名
        return JwtUtil.getUsernameFromToken(token);
    }
}