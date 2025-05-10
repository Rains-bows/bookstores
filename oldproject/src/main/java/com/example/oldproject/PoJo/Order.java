package com.example.oldproject.PoJo;

import lombok.Data;

import java.math.BigDecimal;
import java.sql.Timestamp;

@Data
public class Order {
    private String id;           // 订单ID
    private String userId;       // 用户ID
    private BigDecimal totalAmount;  // 总金额
    private String status;        /*订单状态 0待支付：订单创建成功，但用户尚未付款。
    已支付：用户付款成功，订单进入待处理状态。
    待发货：订单已准备好发货，等待仓库处理。
    已发货：订单已从仓库发出，正在运送中。
    已完成：用户确认收货，订单完成。*/
    private Timestamp createdAt;  // 创建时间
    private Timestamp updatedAt;  // 更新时间
}
