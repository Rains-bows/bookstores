package com.example.oldproject.Service;

import com.example.oldproject.PoJo.Product;

import java.util.List;
import java.util.Optional;

public interface ProductService {

    /**
     * 创建商品
     *
     * @param product 商品对象
     * @return 返回创建的商品对象
     */
    Product createProduct(Product product);
    List<Product> getProductsByPage(int pageNum, int pageSize);
    /**
     * 获取所有商品
     *
     * @return 返回所有商品的列表
     */
    List<Product> getAllProducts();

    /**
     * 根据ID获取单个商品
     *
     * @param id 商品ID
     * @return 返回包含商品的 Optional 对象
     */
    Optional<Product> getProductById(Integer id);

    /**
     * 更新商品
     *
     * @param product 商品对象
     * @return 返回更新后的商品对象
     */
    Product updateProduct(Product product);

    /**
     * 删除商品
     *
     * @param id 商品ID
     */
    void deleteProduct(Integer id);

    /**
     * 根据关键字搜索商品
     *
     * @param keyword 搜索关键字
     * @param page    页码
     * @param size    每页数量
     * @return 商品列表
     */
    List<Product> searchByKeyword(String keyword, Integer page, Integer size);
}