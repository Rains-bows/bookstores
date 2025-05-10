package com.example.oldproject.DTO;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderDetailDTO {
    private Integer id;              // 订单详情ID
    private String orderId;          // 订单ID
    private Integer productId;       // 商品ID
    private String productName;      // 商品名称
    private String productImage;     // 商品图片
    private String productDesc;      // 商品描述
    private Integer quantity;        // 购买数量
    private BigDecimal price;        // 商品单价
    private BigDecimal totalPrice;   // 小计金额
    private Integer userAddressId;   // 地址ID
    private String recipientName;    // 收件人姓名
    private String recipientPhone;   // 收件人电话
    private String addressDetail;    // 收货地址
    private String orderStatus;      // 订单状态
    private String createdAt;        // 订单创建时间
} 