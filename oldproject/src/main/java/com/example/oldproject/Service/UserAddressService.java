package com.example.oldproject.Service;

import com.example.oldproject.PoJo.UserAddress;
import com.example.oldproject.Util.ApiResponse;

import java.util.List;

public interface UserAddressService {

    // 插入用户地址
    ApiResponse<Void> insertUserAddress(UserAddress userAddress);

    // 根据ID查询用户地址
    ApiResponse<UserAddress> findUserAddressById(int id);

    // 根据用户ID查询用户地址列表
    ApiResponse<List<UserAddress>> findUserAddressByUserId(int userId);

    // 更新用户地址
    ApiResponse<Void> updateUserAddress(UserAddress userAddress);

    // 根据ID删除用户地址
    ApiResponse<Void> deleteUserAddressById(int id);
}