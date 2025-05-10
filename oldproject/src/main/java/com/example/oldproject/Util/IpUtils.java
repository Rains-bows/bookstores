package com.example.oldproject.Util;

import eu.bitwalker.useragentutils.UserAgent;
import jakarta.servlet.http.HttpServletRequest;
import org.apache.commons.lang3.StringUtils;
import org.lionsoul.ip2region.xdb.Searcher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.FileCopyUtils;

import java.io.IOException;
import java.io.InputStream;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.regex.Pattern;

/**
 * IP工具类
 * @author HAOYANG
 */
public class IpUtils {
    private static final Logger logger = LoggerFactory.getLogger(IpUtils.class);
    private static final String LOCAL_IP = "127.0.0.1";
    private static final String IPV6_LOOPBACK = "0:0:0:0:0:0:0:1";
    private static final String IPV6_LOOPBACK_SHORT = "::1";

    private static Searcher searcher = null;

    // IP地址正则表达式
    private static final Pattern IPV4_PATTERN = Pattern.compile(
            "^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$");
    private static final Pattern IPV6_PATTERN = Pattern.compile(
            "^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$");

    static {
        initIp2Region();
    }

    private static void initIp2Region() {
        try {
            InputStream ris = IpUtils.class.getResourceAsStream("/ip2region/ip2region.xdb");
            if (ris == null) {
                logger.error("无法加载ip2region数据库文件");
                throw new RuntimeException("ip2region.xdb文件未找到");
            }
            byte[] dbBinStr = FileCopyUtils.copyToByteArray(ris);
            searcher = Searcher.newWithBuffer(dbBinStr);
            logger.info("ip2region数据库初始化成功");
        } catch (IOException e) {
            logger.error("初始化ip2region数据库失败", e);
            throw new RuntimeException("初始化ip2region数据库失败", e);
        }
    }

    /**
     * 获取客户端真实IP地址
     */
    public static String getIp(HttpServletRequest request) {
        String ipAddress = null;
        try {
            // 尝试从各种HTTP头中获取IP
            String[] headers = {
                    "X-Original-Forwarded-For",
                    "X-Forwarded-For",
                    "x-forwarded-for",
                    "Proxy-Client-IP",
                    "WL-Proxy-Client-IP",
                    "HTTP_CLIENT_IP",
                    "HTTP_X_FORWARDED_FOR"
            };

            for (String header : headers) {
                ipAddress = request.getHeader(header);
                if (isValidIp(ipAddress)) {
                    break;
                }
            }

            // 如果头信息中没有获取到有效IP，使用remoteAddr
            if (!isValidIp(ipAddress)) {
                ipAddress = request.getRemoteAddr();
                if (LOCAL_IP.equals(ipAddress) || IPV6_LOOPBACK.equals(ipAddress) || IPV6_LOOPBACK_SHORT.equals(ipAddress)) {
                    try {
                        ipAddress = InetAddress.getLocalHost().getHostAddress();
                    } catch (UnknownHostException e) {
                        logger.warn("获取本地IP失败", e);
                    }
                }
            }

            // 处理多IP情况（如X-Forwarded-For: ip1,ip2,ip3）
            if (ipAddress != null && ipAddress.contains(",")) {
                String[] ips = ipAddress.split(",");
                for (String ip : ips) {
                    if (isValidIp(ip.trim())) {
                        ipAddress = ip.trim();
                        break;
                    }
                }
            }

            // 统一转换IPv6回环地址
            if (IPV6_LOOPBACK.equals(ipAddress) || IPV6_LOOPBACK_SHORT.equals(ipAddress)) {
                ipAddress = LOCAL_IP;
            }

            return ipAddress;
        } catch (Exception e) {
            logger.error("获取客户端IP异常", e);
            return LOCAL_IP;
        }
    }

    /**
     * 验证IP地址是否有效
     */
    private static boolean isValidIp(String ip) {
        if (StringUtils.isBlank(ip) || "unknown".equalsIgnoreCase(ip)) {
            return false;
        }
        return isIPv4(ip) || isIPv6(ip);
    }

    /**
     * 判断是否为IPv4地址
     */
    public static boolean isIPv4(String ip) {
        return ip != null && IPV4_PATTERN.matcher(ip).matches();
    }

    /**
     * 判断是否为IPv6地址
     */
    public static boolean isIPv6(String ip) {
        return ip != null && IPV6_PATTERN.matcher(ip).matches();
    }

    /**
     * 获取访问设备信息
     */
    public static UserAgent getUserAgent(HttpServletRequest request) {
        try {
            return UserAgent.parseUserAgentString(request.getHeader("User-Agent"));
        } catch (Exception e) {
            logger.warn("解析User-Agent失败", e);
            return null;
        }
    }

    /**
     * 根据IP获取地理位置信息
     */
    public static String getCityInfo(String ipAddress) {
        return getIp2region(ipAddress);
    }

    /**
     * 使用ip2region查询IP信息
     */
    public static String getIp2region(String ip) {
        if (StringUtils.isBlank(ip)) {
            return null;
        }

        // 处理IPv6地址
        if (isIPv6(ip)) {
            if (IPV6_LOOPBACK.equals(ip) || IPV6_LOOPBACK_SHORT.equals(ip)) {
                return "内网IP|内网IP|内网IP";
            }

            // 尝试提取IPv4映射地址（如::ffff:192.168.1.1）
            if (ip.startsWith("::ffff:")) {
                ip = ip.substring(7);
                if (!isIPv4(ip)) {
                    return "IPv6地址|不支持查询|IPv6";
                }
            } else {
                return "IPv6地址|不支持查询|IPv6";
            }
        }

        if (searcher == null) {
            logger.error("ip2region搜索器未初始化");
            return null;
        }

        try {
            String ipInfo = searcher.search(ip);
            if (StringUtils.isNotEmpty(ipInfo)) {
                return ipInfo.replace("|0", "").replace("0|", "");
            }
            return ipInfo;
        } catch (Exception e) {
            logger.error("查询IP[{}]信息失败: {}", ip, e.getMessage());
            return null;
        }
    }

    /**
     * 获取本机IP地址
     */
    public static String getHostIp() {
        try {
            return InetAddress.getLocalHost().getHostAddress();
        } catch (UnknownHostException e) {
            logger.warn("获取本机IP失败", e);
            return LOCAL_IP;
        }
    }

    /**
     * 获取本机主机名
     */
    public static String getHostName() {
        try {
            return InetAddress.getLocalHost().getHostName();
        } catch (UnknownHostException e) {
            logger.warn("获取本机主机名失败", e);
            return "未知";
        }
    }
}