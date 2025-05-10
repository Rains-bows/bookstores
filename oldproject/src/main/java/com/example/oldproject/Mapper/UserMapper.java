package com.example.oldproject.Mapper;

import com.example.oldproject.PoJo.User;
import org.apache.ibatis.annotations.*;

@Mapper
public interface UserMapper {
    @Select("SELECT * FROM users WHERE username = #{username}")
    User findByUserName(String username);

    @Insert("INSERT INTO users (username, password, name, age, gender, phone, email, profile_picture, preferences, created_at, updated_at) " +
            "VALUES (#{username}, #{password}, #{name}, #{age}, #{gender}, #{phone}, #{email}, #{profilePicture}, #{preferences}, #{createdAt}, #{updatedAt})")
    void insertUser(User user);


    int updateUser(User user);

    // 使用 @Update 注解来更新密码

    int updatePassword(String username, String encryptedPassword);
}
