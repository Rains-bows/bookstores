package com.example.oldproject.Service;

import com.example.oldproject.PoJo.Cart;

import java.util.List;
import java.util.Optional;

public interface CartService {

    /**
     * 添加商品到购物车
     *
     * @param cart 购物车项
     * @return 返回添加的购物车项
     */
    Cart addToCart(Cart cart);

    /**
     * 获取用户的购物车列表
     *
     * @param userId 用户ID
     * @return 返回购物车列表
     */
    List<Cart> getCartByUserId(int userId);

    /**
     * 根据ID获取购物车项
     *
     * @param id 购物车项ID
     * @return 返回购物车项
     */
    Optional<Cart> getCartById(int id);

    /**
     * 更新购物车项
     *
     * @param cart 购物车项
     * @return 返回更新后的购物车项
     */
    Cart updateCart(Cart cart);

    /**
     * 删除购物车项
     *
     * @param id 购物车项ID
     */
    void deleteCart(int id);
}