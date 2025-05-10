package com.example.oldproject.Mapper;

import com.example.oldproject.PoJo.Category;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface CategoryMapper {
    // 创建分类
    void insert(Category category);
    
    // 查询所有分类（包含商品）
    List<Category> selectAll();
    
    // 根据ID查询分类（包含商品）
    Category selectById(Integer id);
    
    // 更新分类
    void update(Category category);
    
    // 删除分类
    void delete(Integer id);
} 