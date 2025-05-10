package com.example.oldproject.Mapper;


import com.example.oldproject.PoJo.Product;
import com.example.oldproject.PoJo.UserAddress;
import org.apache.ibatis.annotations.*;

import java.util.List;


@Mapper
public interface UserAddressMapper {

    @Select("SELECT * FROM product WHERE category_id = #{categoryId}")
    List<Product> findByCategoryId(Integer categoryId);
    void insert(UserAddress userAddress);


    UserAddress findById(int id);


    List<UserAddress> findByUserId(int userId);

    void update(UserAddress userAddress);


    void delete(int id);
}