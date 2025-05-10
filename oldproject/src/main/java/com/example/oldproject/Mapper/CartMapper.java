package com.example.oldproject.Mapper;

import com.example.oldproject.PoJo.Cart;
import org.apache.ibatis.annotations.*;

import java.util.List;
@Mapper()
public interface CartMapper {

    // 插入购物车项
    @Insert("INSERT INTO cart (user_id, product_id, quantity, created_at, updated_at) " +
            "VALUES (#{userId}, #{productId}, #{quantity}, #{createdAt}, #{updatedAt})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    void insertCart(Cart cart);

    // 根据用户ID查询购物车列表
    @Select("SELECT * FROM cart WHERE user_id = #{userId}")
    List<Cart> findByUserId(int userId);

    // 根据ID查询购物车项
    @Select("SELECT * FROM cart WHERE id = #{id}")
    Cart findById(int id);

    // 更新购物车项
    @Update("UPDATE cart SET user_id = #{userId}, product_id = #{productId}, quantity = #{quantity}, " +
            "updated_at = #{updatedAt} WHERE id = #{id}")
    void updateCart(Cart cart);

    // 删除购物车项
    @Delete("DELETE FROM cart WHERE id = #{id}")
    void deleteCart(int id);
}