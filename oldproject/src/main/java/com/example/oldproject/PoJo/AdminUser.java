package com.example.oldproject.PoJo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.sql.Timestamp;

@Data
@TableName("admin_users")
public class AdminUser {
    @TableId(type = IdType.AUTO)
    private Integer id;
    private String username;
    private String password;
    private String name;
    private String email;
    private Boolean isSuperAdmin;
    private Timestamp lastLoginTime;
    private Timestamp createdAt;
    private Timestamp updatedAt;
}