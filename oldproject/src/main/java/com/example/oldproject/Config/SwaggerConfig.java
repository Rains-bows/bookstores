package com.example.oldproject.Config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("在线书城API 文档")
                        .description("在线书城项目的 API 文档，包含商品和分类的管理接口。")
                        .version("1.0.0"));
    }
}