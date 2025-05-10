package com.example.oldproject.Config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final TokenInterceptor tokenInterceptor;

    @Autowired
    public WebConfig(TokenInterceptor tokenInterceptor) {
        this.tokenInterceptor = tokenInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(tokenInterceptor)
                .order(1) // 设置拦截器顺序
                .addPathPatterns("/**")  // 拦截所有路径
                .excludePathPatterns(
                        "/user/login",
                        "/user/register",
                        "/user/reset-password",
                        "/user/send-email-code",
                        "/**/OPTIONS" // 排除所有 OPTIONS 请求
                );
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://lapper.site:5173","http://lapper.site:5174","http://lapper.site","https://localhost","http://www.lapper.site","http://localhost","http://localhost:5173","http://localhost:5174") // 明确指定允许的域名
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // 允许的 HTTP 方法
                .allowedHeaders("*") // 允许的请求头
                .allowCredentials(true) // 允许携带凭证（如 cookies）
                .maxAge(3600); // 预检请求缓存时间（单位：秒）
    }
}