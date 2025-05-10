package com.example.oldproject.Util;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class MD5Util {

    /**
     * 对字符串进行 MD5 加密
     * @param input 要加密的字符串
     * @return 加密后的 MD5 字符串
     */
    public static String encrypt(String input) {
        try {
            // 获取 MD5 MessageDigest 实例
            MessageDigest md = MessageDigest.getInstance("MD5");
            // 对输入的字符串进行 MD5 计算
            byte[] digest = md.digest(input.getBytes());
            // 将字节数组转为 16 进制的字符串
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                // 将字节转换为无符号的 16 进制字符串，并保证每个字节前有 0
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 验证 MD5 字符串是否与原始输入匹配
     * @param input 原始字符串
     * @param hash 待验证的 MD5 哈希值
     * @return 如果加密后的字符串与给定的 MD5 哈希值匹配，则返回 true
     */
    public static boolean verify(String input, String hash) {
        return encrypt(input).equals(hash);
    }

}
