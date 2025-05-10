package com.example.oldproject.Service.Impl;

import com.example.oldproject.Mapper.CategoryMapper;
import com.example.oldproject.PoJo.Category;
import com.example.oldproject.Service.CategoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryServiceImpl implements CategoryService {
    
    private static final Logger logger = LoggerFactory.getLogger(CategoryServiceImpl.class);
    
    @Autowired
    private CategoryMapper categoryMapper;

    @Override
    public Category create(Category category) {
        logger.info("创建分类: {}", category.getName());
        categoryMapper.insert(category);
        return category;
    }

    @Override
    public List<Category> getAll() {
        logger.info("查询所有分类及其商品");
        return categoryMapper.selectAll();
    }

    @Override
    public Category getById(Integer id) {
        logger.info("查询分类及其商品, id: {}", id);
        Category category = categoryMapper.selectById(id);
        if (category == null) {
            logger.warn("分类不存在, id: {}", id);
            throw new RuntimeException("分类不存在");
        }
        return category;
    }

    @Override
    public Category update(Category category) {
        logger.info("更新分类, id: {}", category.getId());
        // 先检查分类是否存在
        Category existingCategory = getById(category.getId());
        categoryMapper.update(category);
        return category;
    }

    @Override
    public void delete(Integer id) {
        logger.info("删除分类, id: {}", id);
        // 先检查分类是否存在
        Category existingCategory = getById(id);
        categoryMapper.delete(id);
    }
} 