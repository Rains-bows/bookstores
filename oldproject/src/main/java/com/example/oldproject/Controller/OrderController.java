package com.example.oldproject.Controller;

import com.example.oldproject.Controller2.BaseController;
import com.example.oldproject.PoJo.Order;
import com.example.oldproject.Util.ApiResponse;
import com.example.oldproject.Service.OrderService;
import com.example.oldproject.annotation.RequireLogin;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
@CrossOrigin
@RestController
@RequestMapping("/api/order")
@RequireLogin
public class OrderController extends BaseController {

    @Autowired
    private OrderService orderService;

    /**
     * 获取所有订单
     *
     * @return 返回所有订单的列表
     */
    @GetMapping("/list")
    @Operation(summary = "获取所有订单", description = "返回所有订单的列表")
    public ApiResponse<List<Order>> getAllOrders() {
        Long userId = getCurrentUserId();
        return ApiResponse.success(orderService.getAllOrders());
    }

    /**
     * 根据ID获取订单
     *
     * @param id 订单ID
     * @return 返回查询到的订单
     */
    @GetMapping("/{id}")
    @Operation(summary = "根据ID获取订单", description = "根据订单ID查询订单信息")
    public ApiResponse<Order> getOrderById(
            @Parameter(description = "订单ID", required = true) @PathVariable Integer id) {
        Order order = orderService.getOrderById(String.valueOf(id));
        if (order != null) {
            return ApiResponse.success(order);
        } else {
            return ApiResponse.failure("订单未找到");
        }
    }

    /**
     * 创建订单
     *
     * @param order 订单对象
     * @return 返回创建的订单
     */
    @PostMapping("/create")
    @Operation(summary = "创建订单", description = "创建一个新的订单")
    public ApiResponse<Order> createOrder(
            @Parameter(description = "订单对象", required = true) @RequestBody Order order) {
        Long userId = getCurrentUserId();
        order.setStatus("待付款");
        order.setCreatedAt(Timestamp.valueOf(LocalDateTime.now()));
        order.setUpdatedAt(Timestamp.valueOf(LocalDateTime.now()));
        orderService.createOrder(order);
        return ApiResponse.success(order);
    }

    /**
     * 更新订单
     *
     * @param id    订单ID
     * @param order 订单对象
     * @return 返回操作结果
     */
    @PutMapping("/{id}")
    @Operation(summary = "更新订单", description = "根据订单ID更新订单信息")
    public ApiResponse<Void> updateOrder(
            @Parameter(description = "订单ID", required = true) @PathVariable String id,
            @Parameter(description = "订单对象", required = true) @RequestBody Order order) {
        order.setId(id);
        orderService.updateOrder(order);
        return ApiResponse.success(null);
    }

    /**
     * 删除订单
     *
     * @param id 订单ID
     * @return 返回操作结果
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除订单", description = "根据订单ID删除订单")
    public ApiResponse<Void> deleteOrder(
            @Parameter(description = "订单ID", required = true) @PathVariable String id) {
        orderService.deleteOrder(id);
        return ApiResponse.success(null);
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "根据状态查询订单", description = "根据订单状态查询订单列表")
    public ApiResponse<List<Order>> getOrdersByStatus(
            @Parameter(description = "订单状态", required = true) 
            @PathVariable String status) {
        Long userId = getCurrentUserId();
        List<Order> orders = orderService.getOrdersByStatus(status);
        return ApiResponse.success(orders);
    }

    @GetMapping("/user/orders")
    @Operation(summary = "获取当前用户的订单", description = "获取当前登录用户的所有订单信息")
    public ApiResponse<List<Order>> getCurrentUserOrders() {
        try {
            // 从 BaseController 获取当前登录用户ID
            Long userId = getCurrentUserId();
            List<Order> orders = orderService.getOrdersByUserId(userId);
            return ApiResponse.success(orders);
        } catch (IllegalArgumentException e) {
            return ApiResponse.failure("参数错误: " + e.getMessage());
        } catch (RuntimeException e) {
            return ApiResponse.failure(e.getMessage());
        } catch (Exception e) {
            return ApiResponse.failure("获取订单失败: " + e.getMessage());
        }
    }
}