package com.example.oldproject.PoJo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.sql.Timestamp;


@Data
public class User {
    private Integer id;                          // 用户ID
    private String username;                 // 用户名（账号，需唯一）
    private String password;                 // 密码（加密存储）
    private String name;                     // 姓名
    private int age;                         // 年龄
    private String gender;                   // 性别
    private String phone;                    // 联系电话
    private String email;                    // 电子邮件
    private String profilePicture;           // 用户头像路径
    private String preferences;// 用户偏好设置（JSON格式）
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Timestamp createdAt;             // 创建时间
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Timestamp updatedAt;             // 更新时间

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }
}
