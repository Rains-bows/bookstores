package com.example.oldproject.Service;


import com.example.oldproject.PoJo.User;

public interface UserService {

   User findByUserName(String name);

    void insertUser(User user);

    boolean updateUserInfo(User user);

    boolean sendEmailCode(String username, String email);

    boolean resetPassword(String username, String newPassword);

    boolean verifyEmailCode(String username, String emailCode);

}
