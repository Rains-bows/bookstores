package com.example.oldproject.Mapper;

import com.example.oldproject.PoJo.Product;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
@Mapper
public interface ProductMapper {

    // 插入商品
    void insertProduct(Product product);

    // 查询所有商品
    List<Product> findAll();

    // 根据ID查询商品
    Product findById(Integer id);

    // 更新商品
    void updateProduct(Product product);

    // 删除商品
    void deleteProduct(Integer id);
    // 根据分类ID查询商品
    @Select("SELECT * FROM product WHERE category_id = #{categoryId}")
    List<Product> findByCategoryId(Integer categoryId);

    // 分页查询商品
    List<Product> findByPage(@Param("offset") int offset, @Param("pageSize") int pageSize);

    /**
     * 根据关键字搜索商品
     *
     * @param keyword 搜索关键字
     * @param offset 偏移量
     * @param size 每页数量
     * @return 商品列表
     */
    List<Product> searchByKeyword(
        @Param("keyword") String keyword,
        @Param("offset") Integer offset,
        @Param("size") Integer size
    );
}