package com.example.oldproject.Service.Impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.oldproject.Mapper.AdminUserMapper;
import com.example.oldproject.PoJo.AdminUser;
import com.example.oldproject.Service.AdminUserService;
import org.springframework.stereotype.Service;

@Service
public class AdminUserServiceImpl extends ServiceImpl<AdminUserMapper, AdminUser> implements AdminUserService {
}