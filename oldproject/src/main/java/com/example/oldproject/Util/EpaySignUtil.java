package com.example.oldproject.Util;

import java.util.*;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class EpaySignUtil {
    
    /**
     * 生成签名
     */
    public static String generateSign(Map<String, String> params, String key) {
        if (params == null || params.isEmpty()) {
            return null;
        }
        
        // 1. 参数名ASCII码从小到大排序
        Map<String, String> sortedParams = new TreeMap<>(params);
        
        // 2. 拼接键值对
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> entry : sortedParams.entrySet()) {
            String k = entry.getKey();
            String v = entry.getValue();
            if (v == null || v.trim().length() == 0 || "sign".equals(k) || "sign_type".equals(k)) {
                continue;
            }
            sb.append(k).append("=").append(v).append("&");
        }
        
        // 3. 拼接商户密钥
        sb.append(key);
        
        // 4. MD5加密
        return md5(sb.toString());
    }
    
    /**
     * 验证签名
     */
    public static boolean verifySign(Map<String, String> params, String key) {
        String sign = params.get("sign");
        if (sign == null) {
            return false;
        }
        
        String generatedSign = generateSign(params, key);
        return sign.equals(generatedSign);
    }
    
    /**
     * MD5加密
     */
    public static String md5(String text) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] bytes = md.digest(text.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("MD5加密失败", e);
        }
    }
} 