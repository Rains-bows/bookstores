package com.example.oldproject.Mapper;

import com.example.oldproject.Entity.Order;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface OrderMapper {
    // 创建订单
    int createOrder(Order order);

    // 获取订单列表
    List<Order> getOrderList(@Param("userId") Integer userId);

    // 获取订单详情
    Order getOrderDetail(@Param("id") String id);

    // 更新订单状态
    int updateOrderStatus(@Param("id") String id, @Param("status") String status);

    // 删除订单
    int deleteOrder(@Param("id") String id);
} 