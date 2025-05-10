package com.example.oldproject.Service.Impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.example.oldproject.PoJo.UserLoginLog;
import com.example.oldproject.PoJo.UserPurchaseHistory;
import com.example.oldproject.Service.UserLoginLogService;
import com.example.oldproject.Service.UserPurchaseHistoryService;
import com.example.oldproject.Util.IpUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SystemAnalysisServiceImpl {

    @Autowired
    private UserLoginLogService userLoginLogService;

    @Autowired
    private UserPurchaseHistoryService userPurchaseHistoryService;

    /**
     * 分析设备使用情况
     * @param days 最近多少天(可选)
     * @return 设备分析结果
     */
    public Map<String, Object> analyzeDeviceUsage(Integer days) {
        QueryWrapper<UserLoginLog> queryWrapper = new QueryWrapper<>();
        if (days != null && days > 0) {
            queryWrapper.ge("login_time", Timestamp.valueOf(LocalDateTime.now().minusDays(days)));
        }

        List<UserLoginLog> logs = userLoginLogService.list(queryWrapper);

        Map<String, Object> result = new HashMap<>();
        if (!logs.isEmpty()) {
            // 设备分布统计
            Map<String, Long> deviceDistribution = logs.stream()
                    .filter(log -> log.getDeviceInfo() != null && !log.getDeviceInfo().isEmpty())
                    .collect(Collectors.groupingBy(
                            UserLoginLog::getDeviceInfo,
                            Collectors.counting()
                    ));

            // 最常用设备TOP5
            List<Map<String, Object>> topDevices = deviceDistribution.entrySet().stream()
                    .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                    .limit(5)
                    .map(entry -> {
                        Map<String, Object> device = new HashMap<>();
                        device.put("name", entry.getKey());
                        device.put("count", entry.getValue());
                        return device;
                    })
                    .collect(Collectors.toList());

            result.put("totalDevices", deviceDistribution.size());
            result.put("deviceDistribution", deviceDistribution);
            result.put("topDevices", topDevices);
        }

        return result;
    }

    /**
     * 分析用户地理位置
     * @param days 最近多少天(可选)
     * @return 位置分析结果
     */
    public Map<String, Object> analyzeLocation(Integer days) {
        QueryWrapper<UserLoginLog> queryWrapper = new QueryWrapper<>();
        if (days != null && days > 0) {
            queryWrapper.ge("login_time", Timestamp.valueOf(LocalDateTime.now().minusDays(days)));
        }

        List<UserLoginLog> logs = userLoginLogService.list(queryWrapper);

        Map<String, Object> result = new HashMap<>();
        if (!logs.isEmpty()) {
            // 地理位置分布统计
            Map<String, Long> locationDistribution = new HashMap<>();

            for (UserLoginLog log : logs) {
                if (log.getIpAddress() != null && !log.getIpAddress().isEmpty()) {
                    String cityInfo = IpUtils.getIp2region(log.getIpAddress());
                    String city = "未知地区";

                    if (cityInfo != null && !cityInfo.isEmpty()) {
                        String[] parts = cityInfo.split("\\|");
                        // 安全获取地区信息，防止数组越界
                        if (parts.length > 2) {
                            city = parts[2];
                        } else if (parts.length > 0) {
                            city = parts[0];
                        }
                    }

                    locationDistribution.merge(city, 1L, Long::sum);
                }
            }

            // 最常用位置TOP5
            List<Map<String, Object>> topLocations = locationDistribution.entrySet().stream()
                    .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                    .limit(5)
                    .map(entry -> {
                        Map<String, Object> location = new HashMap<>();
                        location.put("name", entry.getKey());
                        location.put("count", entry.getValue());
                        return location;
                    })
                    .collect(Collectors.toList());

            result.put("totalLocations", locationDistribution.size());
            result.put("locationDistribution", locationDistribution);
            result.put("topLocations", topLocations);
        }

        return result;
    }

    /**
     * 分析消费情况
     * @param days 最近多少天(可选)
     * @return 消费分析结果
     */
    public Map<String, Object> analyzePurchase(Integer days) {
        QueryWrapper<UserPurchaseHistory> queryWrapper = new QueryWrapper<>();
        if (days != null && days > 0) {
            queryWrapper.ge("purchase_time", Timestamp.valueOf(LocalDateTime.now().minusDays(days)));
        }

        List<UserPurchaseHistory> histories = userPurchaseHistoryService.list(queryWrapper);

        Map<String, Object> result = new HashMap<>();
        if (!histories.isEmpty()) {
            // 总消费金额
            BigDecimal totalSpent = histories.stream()
                    .map(UserPurchaseHistory::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // 平均消费金额
            BigDecimal averageSpent = totalSpent.divide(
                    new BigDecimal(histories.size()), 2, BigDecimal.ROUND_HALF_UP);

            // 支付方式分布
            Map<String, Long> paymentDistribution = histories.stream()
                    .filter(history -> history.getPaymentMethod() != null)
                    .collect(Collectors.groupingBy(
                            UserPurchaseHistory::getPaymentMethod,
                            Collectors.counting()
                    ));

            // 每日消费趋势
            Map<String, BigDecimal> dailyTrend = histories.stream()
                    .collect(Collectors.groupingBy(
                            history -> history.getPurchaseTime().toLocalDateTime().toLocalDate().toString(),
                            Collectors.reducing(
                                    BigDecimal.ZERO,
                                    UserPurchaseHistory::getTotalAmount,
                                    BigDecimal::add
                            )
                    ));

            result.put("totalSpent", totalSpent);
            result.put("averageSpent", averageSpent);
            result.put("totalTransactions", histories.size());
            result.put("paymentDistribution", paymentDistribution);
            result.put("dailyTrend", dailyTrend);
        }

        return result;
    }

    /**
     * 分析登录情况
     * @param days 最近多少天(可选)
     * @return 登录分析结果
     */
    public Map<String, Object> analyzeLogin(Integer days) {
        QueryWrapper<UserLoginLog> queryWrapper = new QueryWrapper<>();
        if (days != null && days > 0) {
            queryWrapper.ge("login_time", Timestamp.valueOf(LocalDateTime.now().minusDays(days)));
        }

        List<UserLoginLog> logs = userLoginLogService.list(queryWrapper);

        Map<String, Object> result = new HashMap<>();
        if (!logs.isEmpty()) {
            // 总登录次数
            long totalLogins = logs.size();

            // 活跃用户数
            long activeUsers = logs.stream()
                    .map(UserLoginLog::getUserId)
                    .distinct()
                    .count();

            // 登录时段分布
            Map<Integer, Long> hourlyDistribution = logs.stream()
                    .map(log -> log.getLoginTime().toInstant()
                            .atZone(ZoneId.systemDefault())
                            .toLocalDateTime()
                            .getHour())
                    .collect(Collectors.groupingBy(
                            hour -> hour,
                            Collectors.counting()
                    ));

            // 每日登录趋势
            Map<String, Long> dailyTrend = logs.stream()
                    .collect(Collectors.groupingBy(
                            log -> log.getLoginTime().toLocalDateTime().toLocalDate().toString(),
                            Collectors.counting()
                    ));

            result.put("totalLogins", totalLogins);
            result.put("activeUsers", activeUsers);
            result.put("hourlyDistribution", hourlyDistribution);
            result.put("dailyTrend", dailyTrend);
        }

        return result;
    }

    /**
     * 分析用户活跃度
     * @param days 最近多少天(可选)
     * @return 活跃度分析结果
     */
    public Map<String, Object> analyzeUserActivity(Integer days) {
        QueryWrapper<UserLoginLog> queryWrapper = new QueryWrapper<>();
        if (days != null && days > 0) {
            queryWrapper.ge("login_time", Timestamp.valueOf(LocalDateTime.now().minusDays(days)));
        }

        List<UserLoginLog> logs = userLoginLogService.list(queryWrapper);

        Map<String, Object> result = new HashMap<>();
        if (!logs.isEmpty()) {
            // 按用户分组统计登录次数
            Map<Integer, Long> userActivity = logs.stream()
                    .collect(Collectors.groupingBy(
                            UserLoginLog::getUserId,
                            Collectors.counting()
                    ));

            // 活跃用户分级
            Map<String, Long> activityLevels = new LinkedHashMap<>();
            activityLevels.put("高活跃(>10次)", userActivity.values().stream().filter(count -> count > 10).count());
            activityLevels.put("中活跃(5-10次)", userActivity.values().stream().filter(count -> count >= 5 && count <= 10).count());
            activityLevels.put("低活跃(1-4次)", userActivity.values().stream().filter(count -> count >= 1 && count < 5).count());

            // 最活跃用户TOP10
            List<Map<String, Object>> topActiveUsers = userActivity.entrySet().stream()
                    .sorted(Map.Entry.<Integer, Long>comparingByValue().reversed())
                    .limit(10)
                    .map(entry -> {
                        Map<String, Object> user = new HashMap<>();
                        user.put("userId", entry.getKey());
                        user.put("loginCount", entry.getValue());
                        return user;
                    })
                    .collect(Collectors.toList());

            result.put("totalUsers", userActivity.size());
            result.put("activityLevels", activityLevels);
            result.put("topActiveUsers", topActiveUsers);
        }

        return result;
    }
}