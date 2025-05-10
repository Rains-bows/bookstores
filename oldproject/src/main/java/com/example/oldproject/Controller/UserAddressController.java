package com.example.oldproject.Controller;

import com.example.oldproject.PoJo.UserAddress;
import com.example.oldproject.Service.UserAddressService;
import com.example.oldproject.Util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@CrossOrigin

@RestController
@RequestMapping("/api/userAddress")
@Tag(name = "用户地址管理", description = "用户地址的增删改查操作")
public class UserAddressController {

    @Autowired
    private UserAddressService userAddressService;

    /**
     * 插入用户地址
     *
     * @param userAddress 用户地址对象
     * @return 返回操作结果
     */
    @PostMapping("/insert")
    @Operation(summary = "插入用户地址", description = "插入一个新的用户地址")
    public ApiResponse<Void> insertUserAddress(
            @Parameter(description = "用户地址对象", required = true) @RequestBody UserAddress userAddress) {
        return userAddressService.insertUserAddress(userAddress);
    }

    /**
     * 根据ID查询用户地址
     *
     * @param id 用户地址ID
     * @return 返回查询到的用户地址
     */
    @GetMapping("/findById/{id}")
    @Operation(summary = "根据ID查询用户地址", description = "根据用户地址ID查询用户地址信息")
    public ApiResponse<UserAddress> findUserAddressById(
            @Parameter(description = "用户地址ID", required = true) @PathVariable int id) {
        return userAddressService.findUserAddressById(id);
    }

    /**
     * 根据用户ID查询用户地址列表
     *
     * @param userId 用户ID
     * @return 返回用户地址列表
     */
    @GetMapping("/findByUserId/{userId}")
    @Operation(summary = "根据用户ID查询用户地址列表", description = "根据用户ID查询该用户的所有地址")
    public ApiResponse<List<UserAddress>> findUserAddressByUserId(
            @Parameter(description = "用户ID", required = true) @PathVariable int userId) {
        return userAddressService.findUserAddressByUserId(userId);
    }

    /**
     * 更新用户地址
     *
     * @param userAddress 用户地址对象
     * @return 返回操作结果
     */
    @PutMapping("/update")
    @Operation(summary = "更新用户地址", description = "更新用户地址信息")
    public ApiResponse<Void> updateUserAddress(
            @Parameter(description = "用户地址对象", required = true) @RequestBody UserAddress userAddress) {
        return userAddressService.updateUserAddress(userAddress);
    }

    /**
     * 根据ID删除用户地址
     *
     * @param id 用户地址ID
     * @return 返回操作结果
     */
    @DeleteMapping("/delete/{id}")
    @Operation(summary = "根据ID删除用户地址", description = "根据用户地址ID删除用户地址")
    public ApiResponse<Void> deleteUserAddressById(
            @Parameter(description = "用户地址ID", required = true) @PathVariable int id) {
        return userAddressService.deleteUserAddressById(id);
    }
}