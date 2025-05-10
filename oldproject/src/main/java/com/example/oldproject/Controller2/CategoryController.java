package com.example.oldproject.Controller2;

import com.example.oldproject.PoJo.Category;
import com.example.oldproject.Service.CategoryService;
import com.example.oldproject.Util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@Tag(name = "分类管理")
@CrossOrigin
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @PostMapping
    @Operation(summary = "创建分类")
    public ApiResponse<Category> create(@RequestBody Category category) {
        return ApiResponse.success(categoryService.create(category));
    }

    @GetMapping
    @Operation(summary = "获取所有分类及其商品")
    public ApiResponse<List<Category>> getAll() {
        return ApiResponse.success(categoryService.getAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "根据ID获取分类及其商品")
    public ApiResponse<Category> getById(@PathVariable Integer id) {
        return ApiResponse.success(categoryService.getById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新分类")
    public ApiResponse<Category> update(@PathVariable Integer id, @RequestBody Category category) {
        category.setId(id);
        return ApiResponse.success(categoryService.update(category));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除分类")
    public ApiResponse<Void> delete(@PathVariable Integer id) {
        categoryService.delete(id);
        return ApiResponse.success(null);
    }
} 