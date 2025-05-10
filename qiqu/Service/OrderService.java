package com.example.oldproject.Service;

import com.example.oldproject.Entity.Order;
import java.util.List;

public interface OrderService {
    // 创建订单
    int createOrder(Order order);

    // 获取订单列表
    List<Order> getOrderList(Integer userId);

    // 获取订单详情
    Order getOrderDetail(String id);

    // 更新订单状态
    int updateOrderStatus(String id, String status);

    // 删除订单
    int deleteOrder(String id);
} 