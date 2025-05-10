package com.example.oldproject.Controller;

import com.example.oldproject.Util.AliOSSUtils;
import com.example.oldproject.Util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Slf4j
@RestController
@CrossOrigin
@Tag(name = "文件上传", description = "文件上传到阿里云OSS的操作")
public class UploadController {

    @Autowired
    private AliOSSUtils aliOSSUtils;

    /**
     * 上传文件到阿里云OSS
     *
     * @param image 上传的文件
     * @return 返回文件在OSS中的URL
     * @throws IOException 文件上传异常
     */
    @PostMapping("/api/upload")
    @Operation(summary = "上传文件", description = "将文件上传到阿里云OSS并返回文件URL")
    public ApiResponse<String> upload(
            @Parameter(description = "上传的文件", required = true) MultipartFile image) throws IOException {
        // 调用阿里云OSS工具类，将上传上来的文件存入阿里云
        String url = aliOSSUtils.upload(image);
        log.info("文件上传成功，URL: {}", url);
        // 将图片上传完成后的url返回，用于浏览器回显展示
        return ApiResponse.success(url);
    }
}