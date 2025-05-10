package com.example.oldproject.Service;

import com.example.oldproject.Config.EpayConfig;
import com.google.gson.Gson;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

@Service
public class EpayCore {

    private static final Logger logger = LoggerFactory.getLogger(EpayCore.class);

    @Autowired
    private EpayConfig epayConfig;

    private static final String API_URL = "https://mzf.guur.cn/";

    /**
     * 获取支付链接
     */
    public String getPayLink(Map<String, String> params) {
        // 添加必要参数
        params.put("pid", epayConfig.getPid());
        params.put("sign_type", "MD5");

        // 生成签名
        String sign = generateSign(params);
        params.put("sign", sign);

        // 构建支付链接
        StringBuilder urlBuilder = new StringBuilder(epayConfig.getApiurl() + "submit.php?");
        for (Map.Entry<String, String> entry : params.entrySet()) {
            urlBuilder.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8))
                    .append('=')
                    .append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8))
                    .append('&');
        }
        urlBuilder.setLength(urlBuilder.length() - 1); // 移除最后的 &

        return urlBuilder.toString();
    }

    /**
     * 发起支付请求（生成支付表单）
     */
    public String submitPay(Map<String, String> params) {
        // 添加必要参数
        params.put("pid", epayConfig.getPid());
        params.put("sign_type", "MD5");

        // 生成签名
        String sign = generateSign(params);
        params.put("sign", sign);

        // 构建支付表单
        StringBuilder form = new StringBuilder();
        form.append("<form id='payForm' action='").append(epayConfig.getApiurl()).append("submit.php' method='post'>\n");

        // 添加所有参数
        for (Map.Entry<String, String> entry : params.entrySet()) {
            form.append("<input type='hidden' name='")
                    .append(entry.getKey())
                    .append("' value='")
                    .append(entry.getValue())
                    .append("'/>\n");
        }

        form.append("</form>\n");
        form.append("<script>document.getElementById('payForm').submit();</script>");

        return form.toString();
    }

    /**
     * 查询订单
     */
    public Map<String, Object> queryOrder(String outTradeNo) {
        String url = API_URL + "api.php";
        Map<String, String> params = new HashMap<>();
        params.put("act", "order");
        params.put("pid", epayConfig.getPid());
        params.put("key", epayConfig.getKey());
        params.put("out_trade_no", outTradeNo);

        return executeGet(url, params);
    }

    /**
     * 验证异步通知签名
     */
    public boolean verifyNotify(Map<String, String> params) {
        String sign = params.get("sign");
        if (sign == null) {
            logger.error("Sign is missing in notify params");
            return false;
        }

        // 验证签名
        String calculatedSign = generateSign(params);
        logger.info("Calculated sign: {}, Received sign: {}", calculatedSign, sign);
        return sign.equals(calculatedSign);
    }

    /**
     * 验证同步通知签名
     */
    public boolean verifyReturn(Map<String, String> params) {
        return verifyNotify(params);
    }

    /**
     * 生成签名（公开方法）
     */
    public String generateSign(Map<String, String> params) {
        // 按照指定顺序拼接签名字符串
        StringBuilder signStr = new StringBuilder();
        signStr.append("money=").append(params.get("money")).append("&");
        signStr.append("name=").append(params.get("name")).append("&");
        signStr.append("notify_url=").append(params.get("notify_url")).append("&");
        signStr.append("out_trade_no=").append(params.get("out_trade_no")).append("&");
        signStr.append("pid=").append(params.get("pid")).append("&");
        signStr.append("return_url=").append(params.get("return_url")).append("&");
        signStr.append("sitename=").append(params.get("sitename")).append("&");
        signStr.append("type=").append(params.get("type"));
        signStr.append(epayConfig.getKey()); // 加上商户密钥

        // 打印签名字符串，方便调试
        logger.info("Sign string: {}", signStr.toString());

        // MD5加密
        return md5(signStr.toString());
    }

    /**
     * 执行GET请求
     */
    private Map<String, Object> executeGet(String url, Map<String, String> params) {
        try {
            // 构建带参数的URL
            StringBuilder urlBuilder = new StringBuilder(url);
            if (!params.isEmpty()) {
                urlBuilder.append('?');
                for (Map.Entry<String, String> entry : params.entrySet()) {
                    urlBuilder.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8))
                            .append('=')
                            .append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8))
                            .append('&');
                }
                urlBuilder.setLength(urlBuilder.length() - 1); // 移除最后的 &
            }

            // 创建连接
            HttpURLConnection conn = (HttpURLConnection) new URL(urlBuilder.toString()).openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(10000);
            conn.setReadTimeout(10000);

            // 检查响应状态码
            int responseCode = conn.getResponseCode();
            if (responseCode != HttpURLConnection.HTTP_OK) {
                logger.error("GET request failed with status code: {}", responseCode);
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("code", 0);
                errorResponse.put("msg", "请求失败，状态码: " + responseCode);
                return errorResponse;
            }

            // 读取响应
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                StringBuilder response = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }

                // 解析JSON响应
                if (response.length() == 0) {
                    logger.error("GET request returned empty response");
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("code", 0);
                    errorResponse.put("msg", "请求返回空响应");
                    return errorResponse;
                }

                return new Gson().fromJson(response.toString(), Map.class);
            }
        } catch (Exception e) {
            logger.error("GET request failed: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("code", 0);
            errorResponse.put("msg", "请求失败: " + e.getMessage());
            return errorResponse;
        }
    }

    /**
     * MD5加密工具
     */
    private static String md5(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("MD5加密失败", e);
        }
    }
}