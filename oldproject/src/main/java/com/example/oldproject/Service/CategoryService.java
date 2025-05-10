package com.example.oldproject.Service;

import com.example.oldproject.PoJo.Category;
import java.util.List;

public interface CategoryService {
    /**
     * 创建分类
     */
    Category create(Category category);
    
    /**
     * 获取所有分类（包含商品）
     */
    List<Category> getAll();
    
    /**
     * 根据ID获取分类（包含商品）
     */
    Category getById(Integer id);
    
    /**
     * 更新分类
     */
    Category update(Category category);
    
    /**
     * 删除分类
     */
    void delete(Integer id);
} 