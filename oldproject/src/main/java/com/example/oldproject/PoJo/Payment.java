package com.example.oldproject.PoJo;

import lombok.Data;

import java.math.BigDecimal;
import java.sql.Timestamp;

@Data
public class Payment {
    private Integer id;                // 支付记录ID
    private Integer orderId;           // 订单ID
    private BigDecimal amount;         // 支付金额
    private String paymentMethod;      // 支付方式
    private String status;             // 支付状态
    private Timestamp paymentTime;     // 支付时间
}
