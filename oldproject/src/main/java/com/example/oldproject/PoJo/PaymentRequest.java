package com.example.oldproject.PoJo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentRequest {
    private String pid; // 商户ID
    private String type; // 支付方式
    private String outTradeNo; // 商户订单号
    private String notifyUrl; // 异步通知地址
    private String returnUrl; // 跳转通知地址（可选）
    private String name; // 商品名称
    private String money; // 商品金额
    private String clientIp; // 用户IP地址
    private String device; // 设备类型（可选）
    private String param; // 业务扩展参数（可选）
}
