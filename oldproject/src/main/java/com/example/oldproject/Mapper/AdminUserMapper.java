package com.example.oldproject.Mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.oldproject.PoJo.AdminUser;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface AdminUserMapper extends BaseMapper<AdminUser> {
}