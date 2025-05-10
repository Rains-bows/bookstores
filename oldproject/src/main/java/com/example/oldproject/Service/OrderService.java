package com.example.oldproject.Service;

import com.example.oldproject.PoJo.Order;

import java.util.List;

public interface OrderService {
    List<Order> getAllOrders();
    Order getOrderById(String id);
    void createOrder(Order order);
    void updateOrder(Order order);
    void deleteOrder(String id);
    /**
     * 根据状态查询订单
     *
     * @param status 订单状态
     * @return 订单列表
     */
    List<Order> getOrdersByStatus(String status);
    /**
     * 根据用户ID查询订单
     */
    List<Order> getOrdersByUserId(Long userId);
}
