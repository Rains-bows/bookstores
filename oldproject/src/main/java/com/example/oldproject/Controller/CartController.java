package com.example.oldproject.Controller;

import com.example.oldproject.PoJo.Cart;
import com.example.oldproject.Service.CartService;
import com.example.oldproject.Util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
@CrossOrigin
@RestController
@RequestMapping("/api/cart")
@Tag(name = "购物车管理", description = "购物车的增删改查操作")
public class CartController {

    @Autowired
    private CartService cartService;

    /**
     * 添加商品到购物车
     *
     * @param cart 购物车项
     * @return 返回添加的购物车项
     */
    @PostMapping
    @Operation(summary = "添加商品到购物车", description = "将商品添加到用户的购物车")
    public ApiResponse<Cart> addToCart(
            @Parameter(description = "购物车项", required = true) @RequestBody Cart cart) {
        try {
            Cart addedCart = cartService.addToCart(cart);
            return ApiResponse.success(addedCart); // 使用现有的 success 方法
        } catch (Exception e) {
            return ApiResponse.failure("添加购物车失败: " + e.getMessage());
        }
    }

    /**
     * 获取用户的购物车列表
     *
     * @param userId 用户ID
     * @return 返回购物车列表
     */
    @GetMapping("/user/{userId}")
    @Operation(summary = "获取用户的购物车列表", description = "根据用户ID查询购物车列表")
    public ApiResponse<List<Cart>> getCartByUserId(
            @Parameter(description = "用户ID", required = true) @PathVariable int userId) {
        try {
            List<Cart> cartList = cartService.getCartByUserId(userId);
            return ApiResponse.success(cartList); // 使用现有的 success 方法
        } catch (Exception e) {
            return ApiResponse.failure("获取购物车列表失败: " + e.getMessage());
        }
    }

    /**
     * 根据ID获取购物车项
     *
     * @param id 购物车项ID
     * @return 返回查询到的购物车项
     */
    @GetMapping("/{id}")
    @Operation(summary = "根据ID获取购物车项", description = "根据购物车项ID查询购物车项")
    public ApiResponse<Cart> getCartById(
            @Parameter(description = "购物车项ID", required = true) @PathVariable int id) {
        try {
            Optional<Cart> cart = cartService.getCartById(id);
            return cart.map(ApiResponse::success) // 使用现有的 success 方法
                    .orElseGet(() -> ApiResponse.failure("购物车项未找到"));
        } catch (Exception e) {
            return ApiResponse.failure("获取购物车项失败: " + e.getMessage());
        }
    }

    /**
     * 更新购物车项
     *
     * @param id   购物车项ID
     * @param cart 购物车项
     * @return 返回更新后的购物车项
     */
    @PutMapping("/{id}")
    @Operation(summary = "更新购物车项", description = "根据购物车项ID更新购物车项")
    public ApiResponse<Cart> updateCart(
            @Parameter(description = "购物车项ID", required = true) @PathVariable int id,
            @Parameter(description = "购物车项", required = true) @RequestBody Cart cart) {
        try {
            Optional<Cart> existingCart = cartService.getCartById(id);
            if (existingCart.isPresent()) {
                cart.setId(id); // 设置ID确保更新的是正确的购物车项
                Cart updatedCart = cartService.updateCart(cart);
                return ApiResponse.success(updatedCart); // 使用现有的 success 方法
            } else {
                return ApiResponse.failure("购物车项未找到");
            }
        } catch (Exception e) {
            return ApiResponse.failure("更新购物车项失败: " + e.getMessage());
        }
    }

    /**
     * 删除购物车项
     *
     * @param id 购物车项ID
     * @return 返回操作结果
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除购物车项", description = "根据购物车项ID删除购物车项")
    public ApiResponse<Void> deleteCart(
            @Parameter(description = "购物车项ID", required = true) @PathVariable int id) {
        try {
            Optional<Cart> cart = cartService.getCartById(id);
            if (cart.isPresent()) {
                cartService.deleteCart(id);
                return ApiResponse.success(null); // 使用现有的 success 方法，data 为 null
            } else {
                return ApiResponse.failure("购物车项未找到");
            }
        } catch (Exception e) {
            return ApiResponse.failure("删除购物车项失败: " + e.getMessage());
        }
    }
}