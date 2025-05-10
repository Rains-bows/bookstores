package com.example.oldproject;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties
@MapperScan("com.example.oldproject.Mapper") // 添加这行
public class OldprojectApplication {

    public static void main(String[] args) {
        SpringApplication.run(OldprojectApplication.class, args);
    }

}
