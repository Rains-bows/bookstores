package com.example.oldproject.Controller;

import com.example.oldproject.Config.EpayConfig;
import com.example.oldproject.PoJo.Order;
import com.example.oldproject.PoJo.UserPurchaseHistory;
import com.example.oldproject.Service.EpayCore;
import com.example.oldproject.Service.OrderService;
import com.example.oldproject.Service.UserPurchaseHistoryService;
import com.example.oldproject.Util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.util.Map;
import java.math.BigDecimal;
import java.util.HashMap;

import com.example.oldproject.PoJo.Payment;
import com.example.oldproject.Service.PaymentService;
@CrossOrigin
@RestController
@RequestMapping("/api/epay")
@Tag(name = "支付管理", description = "支付相关的操作")
public class EpayController {

    private static final Logger logger = LoggerFactory.getLogger(EpayController.class);

    @Autowired
    private EpayCore epayCore;

    @Autowired
    private OrderService orderService;

@Autowired
private UserPurchaseHistoryService userPurchaseHistoryService;
    @Autowired
    private PaymentService paymentService;
    @Autowired
    private EpayConfig epayConfig;

    @GetMapping("/getPayLink")
    @Operation(summary = "获取支付链接", description = "生成支付链接并返回")
    public ApiResponse<String> getPayLink(
            @Parameter(description = "支付参数", required = true)
            @RequestParam Map<String, String> params) {
        try {
            System.out.println(params);
            // 调用支付核心服务生成支付链接
            String payLink = epayCore.getPayLink(params);
            System.out.println(payLink);
            return ApiResponse.success(payLink);
        } catch (Exception e) {
            logger.error("生成支付链接失败: {}", e.getMessage(), e);
            return ApiResponse.failure("生成支付链接失败: " + e.getMessage());
        }
    }

    @PostMapping("/submitPay")
    @Operation(summary = "发起支付请求", description = "生成支付表单并返回")
    public ApiResponse<String> submitPay(
            @Parameter(description = "支付参数", required = true)
            @RequestBody Map<String, String> params) {
        try {
            // 调用支付核心服务生成支付表单
            String payForm = epayCore.submitPay(params);
            return ApiResponse.success(payForm);
        } catch (Exception e) {
            logger.error("生成支付表单失败: {}", e.getMessage(), e);
            return ApiResponse.failure("生成支付表单失败: " + e.getMessage());
        }
    }

    @GetMapping("/queryOrder")
    @Operation(summary = "查询订单", description = "根据商户订单号查询订单信息")
    public ApiResponse<?> queryOrder(
            @Parameter(description = "商户订单号", required = true)
            @RequestParam String outTradeNo) {
        try {
            // 调用支付核心服务查询订单
            Map<String, Object> orderInfo = epayCore.queryOrder(outTradeNo);
            return ApiResponse.success(orderInfo);
        } catch (Exception e) {
            logger.error("查询订单失败: {}", e.getMessage(), e);
            return ApiResponse.failure("查询订单失败: " + e.getMessage());
        }
    }

    @PostMapping("/notify")
    @Operation(summary = "支付异步通知", description = "处理支付平台的异步通知")
    public String handleNotify(@RequestParam Map<String, String> params, HttpServletRequest request) {
        logger.info("收到支付异步通知，参数: {}", params);
        boolean verifyResult = epayCore.verifyNotify(params);
        if (verifyResult) {
            // 获取参数
            String outTradeNo = params.get("out_trade_no");
            String type = params.get("type");
            String money = params.get("money");

            logger.info("支付成功，订单号: {}", outTradeNo);

            // 根据订单号查询订单
            Order order = orderService.getOrderById(outTradeNo);
            if (order != null) {
                // 1. 更新订单状态
                order.setStatus("PAID");
                order.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
                orderService.updateOrder(order);

                // 2. 保存支付记录
                Payment payment = new Payment();
                payment.setOrderId(Integer.valueOf(order.getId()));
                payment.setAmount(new BigDecimal(money));
                payment.setPaymentMethod(type);
                payment.setStatus("SUCCESS");
                payment.setPaymentTime(new Timestamp(System.currentTimeMillis()));
                paymentService.createPayment(payment);

                // 3. 保存用户购买历史记录
                UserPurchaseHistory history = new UserPurchaseHistory();
                history.setUserId(Integer.valueOf(order.getUserId()));
                history.setOrderId(order.getId());
                history.setPurchaseTime(new Timestamp(System.currentTimeMillis()));
                history.setTotalAmount(new BigDecimal(money));
                history.setPaymentMethod(type);
                history.setIpAddress(request.getRemoteAddr());
                userPurchaseHistoryService.save(history);

                logger.info("订单处理完成，订单号: {}, 用户ID: {}", outTradeNo, order.getUserId());
                return "success";
            } else {
                logger.warn("未找到对应订单，订单号: {}", outTradeNo);
            }
        }
        logger.warn("支付异步通知验证失败，参数: {}", params);
        return "fail";
    }

    @GetMapping("/return")
    @Operation(summary = "支付同步通知", description = "处理支付平台的同步通知")
    public String handleReturn(@RequestParam Map<String, String> params, HttpServletRequest request) {
        logger.info("收到支付同步通知，参数: {}", params);
        boolean verifyResult = epayCore.verifyReturn(params);
        if (verifyResult) {
            // 处理支付成功逻辑
            String outTradeNo = params.get("outTradeNo");
            String type = params.get("type");
            String money = params.get("money");

            logger.info("支付成功，订单号: {}", outTradeNo);

            // 根据订单号查询订单
            Order order = orderService.getOrderById(outTradeNo);
            if (order != null) {
                // 1. 更新订单状态
                order.setStatus("PAID");
                order.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
                orderService.updateOrder(order);

                // 2. 保存用户购买历史记录（如果异步通知可能未处理）
                UserPurchaseHistory existingHistory = userPurchaseHistoryService.lambdaQuery()
                        .eq(UserPurchaseHistory::getOrderId, order.getId())
                        .one();

                if (existingHistory == null) {
                    UserPurchaseHistory history = new UserPurchaseHistory();
                    history.setUserId(Integer.valueOf(order.getUserId()));
                    history.setOrderId(order.getId());
                    history.setPurchaseTime(new Timestamp(System.currentTimeMillis()));
                    history.setTotalAmount(new BigDecimal(money));
                    history.setPaymentMethod(type);
                    history.setIpAddress(request.getRemoteAddr());
                    userPurchaseHistoryService.save(history);
                    logger.info("新增用户购买历史记录，订单号: {}", outTradeNo);
                }

                logger.info("订单状态已更新为已支付，订单号: {}", outTradeNo);
                return "支付成功";
            } else {
                logger.warn("未找到对应订单，订单号: {}", outTradeNo);
            }
        }
        logger.warn("支付同步通知验证失败，参数: {}", params);
        return "支付失败";
    }

    @PostMapping("/pay")
    @Operation(summary = "创建支付订单", description = "创建新的支付订单并返回支付链接")
    public ApiResponse<String> pay(
            @Parameter(description = "订单ID", required = true) @RequestParam String orderId) {
        try {
            // 获取订单信息
            Order order = orderService.getOrderById(orderId);
            if (order == null) {
                return ApiResponse.failure("订单不存在");
            }

            // 构建支付参数
            Map<String, String> payParams = new HashMap<>();
            payParams.put("pid", epayConfig.getPid());
            payParams.put("type", "alipay"); // 默认使用支付宝，可以从请求参数中获取
            payParams.put("out_trade_no", order.getId());
            payParams.put("notify_url", epayConfig.getNotifyUrl());
            payParams.put("return_url", epayConfig.getReturnUrl());
            payParams.put("name", "订单" + order.getId()); // 可以根据实际业务设置商品名称
            payParams.put("money", order.getTotalAmount().toString());
            payParams.put("sitename", epayConfig.getSitename());
            
            // 生成签名
            String sign = epayCore.generateSign(payParams);
            payParams.put("sign", sign);
            payParams.put("sign_type", "MD5");

            // 生成支付表单
            String payForm = epayCore.submitPay(payParams);
            return ApiResponse.success(payForm);
        } catch (Exception e) {
            logger.error("创建支付订单失败: {}", e.getMessage(), e);
            return ApiResponse.failure("创建支付订单失败: " + e.getMessage());
        }
    }
}