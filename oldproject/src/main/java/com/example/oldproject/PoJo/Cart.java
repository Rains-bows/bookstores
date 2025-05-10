package com.example.oldproject.PoJo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.sql.Timestamp;

@Data
public class Cart {
    private int id;                          // 购物车项ID
    private int userId;                      // 用户ID（外键，关联用户表）
    private int productId;                   // 商品ID（外键，关联商品表）
    private int quantity;                    // 商品数量
private  Product product;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Timestamp createdAt;             // 创建时间

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Timestamp updatedAt;             // 更新时间
}
