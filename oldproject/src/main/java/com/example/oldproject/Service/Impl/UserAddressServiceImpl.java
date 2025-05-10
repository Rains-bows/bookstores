package com.example.oldproject.Service.Impl;

import com.example.oldproject.Mapper.UserAddressMapper;
import com.example.oldproject.PoJo.UserAddress;
import com.example.oldproject.Service.UserAddressService;
import com.example.oldproject.Util.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserAddressServiceImpl implements UserAddressService {

    @Autowired
    private UserAddressMapper userAddressMapper;

    @Override
    public ApiResponse<Void> insertUserAddress(UserAddress userAddress) {
        try {
            userAddressMapper.insert(userAddress);
            return ApiResponse.success(null);
        } catch (Exception e) {
            return ApiResponse.failure("插入用户地址失败: " + e.getMessage());
        }
    }

    @Override
    public ApiResponse<UserAddress> findUserAddressById(int id) {
        try {
            UserAddress userAddress = userAddressMapper.findById(id);
            if (userAddress != null) {
                return ApiResponse.success(userAddress);
            } else {
                return ApiResponse.failure("未找到用户地址");
            }
        } catch (Exception e) {
            return ApiResponse.failure("查询用户地址失败: " + e.getMessage());
        }
    }

    @Override
    public ApiResponse<List<UserAddress>> findUserAddressByUserId(int userId) {
        try {
            List<UserAddress> userAddressList = userAddressMapper.findByUserId(userId);
            return ApiResponse.success(userAddressList);
        } catch (Exception e) {
            return ApiResponse.failure("查询用户地址列表失败: " + e.getMessage());
        }
    }

    @Override
    public ApiResponse<Void> updateUserAddress(UserAddress userAddress) {
        try {
            userAddressMapper.update(userAddress);
            return ApiResponse.success(null);
        } catch (Exception e) {
            return ApiResponse.failure("更新用户地址失败: " + e.getMessage());
        }
    }

    @Override
    public ApiResponse<Void> deleteUserAddressById(int id) {
        try {
            userAddressMapper.delete(id);
            return ApiResponse.success(null);
        } catch (Exception e) {
            return ApiResponse.failure("删除用户地址失败: " + e.getMessage());
        }
    }
}