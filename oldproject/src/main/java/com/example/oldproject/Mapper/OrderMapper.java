package com.example.oldproject.Mapper;

import com.example.oldproject.PoJo.Order;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface OrderMapper {


    List<Order> getAllOrders();


    Order getOrderById(String id);


    void createOrder(Order order);

    void updateOrder(Order order);


    void deleteOrder(String id);

    /**
     * 根据状态查询订单
     */
    List<Order> findByStatus(@Param("status") String status, @Param("userId") Long userId);

    /**
     * 根据用户ID查询订单
     */
    List<Order> findByUserId(@Param("userId") Long userId);
}
