package com.example.oldproject.PoJo;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderDetail {
    private Integer id;          // 详情ID
    private String orderId;      // 订单ID
    private Integer productId;   // 产品ID
    private Integer quantity;    // 数量
    private BigDecimal price;    // 单价
    private Integer userAddressId; // 用户地址ID
}