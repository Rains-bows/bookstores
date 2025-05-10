package com.example.oldproject.Service.Impl;

import com.example.oldproject.Mapper.CartMapper;
import com.example.oldproject.PoJo.Cart;
import com.example.oldproject.Service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CartServiceImpl implements CartService {

    @Autowired
    private CartMapper cartMapper;

    @Override
    public Cart addToCart(Cart cart) {
        cartMapper.insertCart(cart);
        return cart;
    }

    @Override
    public List<Cart> getCartByUserId(int userId) {
        return cartMapper.findByUserId(userId);
    }

    @Override
    public Optional<Cart> getCartById(int id) {
        return Optional.ofNullable(cartMapper.findById(id));
    }

    @Override
    public Cart updateCart(Cart cart) {
        cartMapper.updateCart(cart);
        return cart;
    }

    @Override
    public void deleteCart(int id) {
        cartMapper.deleteCart(id);
    }
}