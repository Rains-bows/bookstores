package com.example.oldproject.Service.Impl;

import com.example.oldproject.Mapper.ProductMapper;
import com.example.oldproject.PoJo.Product;
import com.example.oldproject.Service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    // Redis 缓存键前缀
    private static final String PRODUCT_CACHE_PREFIX = "product:";
    private static final String ALL_PRODUCTS_CACHE_KEY = "products:all";

    @Override
    public Product createProduct(Product product) {
        productMapper.insertProduct(product); // 插入商品
        clearCache(); // 清除缓存，确保数据一致性
        return product;
    }

    @Override
    public List<Product> getAllProducts() {
        // 先从缓存中获取
        List<Product> cachedProducts = (List<Product>) redisTemplate.opsForValue().get(ALL_PRODUCTS_CACHE_KEY);
        if (cachedProducts != null) {
            return cachedProducts;
        }

        // 缓存中没有，则从数据库查询
        List<Product> products = productMapper.findAll();
        // 将查询结果放入缓存，设置过期时间为 1 小时
        redisTemplate.opsForValue().set(ALL_PRODUCTS_CACHE_KEY, products, 1, TimeUnit.HOURS);
        return products;
    }

    @Override
    public Optional<Product> getProductById(Integer id) {
        String cacheKey = PRODUCT_CACHE_PREFIX + id;
        // 先从缓存中获取
        Product cachedProduct = (Product) redisTemplate.opsForValue().get(cacheKey);
        if (cachedProduct != null) {
            return Optional.of(cachedProduct);
        }

        // 缓存中没有，则从数据库查询
        Product product = productMapper.findById(id);
        if (product != null) {
            // 将查询结果放入缓存，设置过期时间为 1 小时
            redisTemplate.opsForValue().set(cacheKey, product, 1, TimeUnit.HOURS);
            return Optional.of(product);
        }
        return Optional.empty();
    }

    @Override
    public Product updateProduct(Product product) {
        if (getProductById(product.getId()).isPresent()) { // 检查商品是否存在
            productMapper.updateProduct(product); // 更新商品
            clearCache(); // 清除缓存，确保数据一致性
            return product;
        } else {
            throw new RuntimeException("商品未找到");
        }
    }

    @Override
    public void deleteProduct(Integer id) {
        if (getProductById(id).isPresent()) { // 检查商品是否存在
            productMapper.deleteProduct(id); // 删除商品
            clearCache(); // 清除缓存，确保数据一致性
        } else {
            throw new RuntimeException("商品未找到");
        }
    }

    /**
     * 分页查询商品
     *
     * @param pageNum  当前页码
     * @param pageSize 每页大小
     * @return 返回分页后的商品列表
     */
    public List<Product> getProductsByPage(int pageNum, int pageSize) {
        int offset = (pageNum - 1) * pageSize; // 计算偏移量
        return productMapper.findByPage(offset, pageSize);
    }

    /**
     * 清除所有商品相关的缓存
     */
    private void clearCache() {
        // 清除所有商品的缓存
        redisTemplate.delete(ALL_PRODUCTS_CACHE_KEY);
        // 清除单个商品的缓存（可以根据实际情况扩展）
        redisTemplate.keys(PRODUCT_CACHE_PREFIX + "*").forEach(redisTemplate::delete);
    }

    @Override
    public List<Product> searchByKeyword(String keyword, Integer page, Integer size) {
        // 计算偏移量
        int offset = (page - 1) * size;
        
        // 参数校验
        if (keyword == null || keyword.trim().isEmpty()) {
            throw new IllegalArgumentException("搜索关键字不能为空");
        }
        
        if (page < 1) {
            throw new IllegalArgumentException("页码必须大于0");
        }
        
        if (size < 1) {
            throw new IllegalArgumentException("每页数量必须大于0");
        }
        
        // 调用mapper进行查询
        return productMapper.searchByKeyword(keyword.trim(), offset, size);
    }
}