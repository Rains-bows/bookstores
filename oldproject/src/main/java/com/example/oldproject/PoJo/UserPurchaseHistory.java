package com.example.oldproject.PoJo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.sql.Timestamp;

@Data
@TableName("user_purchase_history")
public class UserPurchaseHistory {
    @TableId(type = IdType.AUTO)
    private Integer id;
    private Integer userId;
    private String orderId;
    private Timestamp purchaseTime;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private String ipAddress;
}