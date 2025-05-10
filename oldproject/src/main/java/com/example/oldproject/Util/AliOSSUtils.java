package com.example.oldproject.Util;

import com.aliyun.oss.OSS;
import com.aliyun.oss.OSSClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;

@Component
public class AliOSSUtils {

    @Value("${aliyun.oss.endpoint}")
    private String endpoint; // OSS 访问端点，例如：oss-cn-beijing.aliyuncs.com

    @Value("${aliyun.oss.accessKeyId}")
    private String accessKeyId; // 阿里云 AccessKey ID

    @Value("${aliyun.oss.accessKeySecret}")
    private String accessKeySecret; // 阿里云 AccessKey Secret

    @Value("${aliyun.oss.bucketName}")
    private String bucketName; // OSS 存储桶名称

    /**
     * 上传文件到阿里云 OSS
     *
     * @param multipartFile 上传的文件
     * @return 文件访问 URL
     * @throws IOException 如果文件读取失败
     */
    public String upload(MultipartFile multipartFile) throws IOException {
        // 获取上传文件的输入流
        InputStream inputStream = multipartFile.getInputStream();

        // 避免文件覆盖，生成唯一的文件名
        String originalFilename = multipartFile.getOriginalFilename();
        String fileName = UUID.randomUUID().toString() + originalFilename.substring(originalFilename.lastIndexOf("."));

        // 创建 OSS 客户端
        OSS ossClient = new OSSClientBuilder().build(endpoint, accessKeyId, accessKeySecret);

        // 上传文件到 OSS
        ossClient.putObject(bucketName, fileName, inputStream);

        // 构造文件访问 URL
        String url = "https://" + bucketName + "." + endpoint + "/" + fileName;

        // 关闭 OSS 客户端
        ossClient.shutdown();

        // 返回上传文件的 URL
        return url;
    }
}