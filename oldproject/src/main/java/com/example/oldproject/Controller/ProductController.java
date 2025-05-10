package com.example.oldproject.Controller;

import com.example.oldproject.PoJo.Product;
import com.example.oldproject.Service.ProductService;
import com.example.oldproject.Util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Collections;
@CrossOrigin
@RestController
@RequestMapping("/api/products")
@Tag(name = "商品管理", description = "商品的增删改查操作")
public class ProductController {

    @Autowired
    private ProductService productService;

    /**
     * 创建商品
     *
     * @param product 商品对象
     * @return 返回创建的商品对象
     */
    @PostMapping
    @Operation(summary = "创建商品", description = "创建一个新的商品")
    public ApiResponse<Product> createProduct(
            @Parameter(description = "商品对象", required = true) @RequestBody Product product) {
        try {
            Product createdProduct = productService.createProduct(product);
            return ApiResponse.success(createdProduct); // 使用 success(T data) 方法
        } catch (Exception e) {
            return ApiResponse.failure("商品创建失败: " + e.getMessage()); // 使用 failure(String message) 方法
        }
    }

    /**
     * 获取所有商品
     *
     * @return 返回所有商品的列表
     */
    @GetMapping
    @Operation(summary = "获取所有商品", description = "返回所有商品的列表")
    public ApiResponse<List<Product>> getAllProducts() {
        try {
            List<Product> products = productService.getAllProducts();
            return ApiResponse.success(products); // 使用 success(T data) 方法
        } catch (Exception e) {
            return ApiResponse.failure("商品列表获取失败: " + e.getMessage()); // 使用 failure(String message) 方法
        }
    }

    /**
     * 分页查询商品
     *
     * @param pageNum  当前页码
     * @param pageSize 每页大小
     * @return 返回分页后的商品列表
     */
    @GetMapping("/page")
    @Operation(summary = "分页查询商品", description = "根据页码和每页大小分页查询商品")
    public ApiResponse<List<Product>> getProductsByPage(
            @Parameter(description = "当前页码", example = "1") @RequestParam(defaultValue = "1") int pageNum,
            @Parameter(description = "每页大小", example = "10") @RequestParam(defaultValue = "10") int pageSize) {
        try {
            List<Product> products = productService.getProductsByPage(pageNum, pageSize);
            return ApiResponse.success(products); // 使用 success(T data) 方法
        } catch (Exception e) {
            return ApiResponse.failure("分页查询失败: " + e.getMessage()); // 使用 failure(String message) 方法
        }
    }

    /**
     * 根据ID获取单个商品
     *
     * @param id 商品ID
     * @return 返回查询到的商品对象
     */
    @GetMapping("/{id}")
    @Operation(summary = "根据ID获取商品", description = "根据商品ID查询商品信息")
    public ApiResponse<Product> getProductById(
            @Parameter(description = "商品ID", required = true) @PathVariable Integer id) {
        try {
            Optional<Product> product = productService.getProductById(id);

            if (product.isPresent()) {
                return ApiResponse.success(product.get()); // 使用 success(T data) 方法
            } else {
                return ApiResponse.failure("商品未找到"); // 使用 failure(String message) 方法
            }
        } catch (Exception e) {
            return ApiResponse.failure("商品获取失败: " + e.getMessage()); // 使用 failure(String message) 方法
        }
    }

    /**
     * 更新商品
     *
     * @param id      商品ID
     * @param product 商品对象
     * @return 返回更新后的商品对象
     */
    @PutMapping("/{id}")
    @Operation(summary = "更新商品", description = "根据商品ID更新商品信息")
    public ApiResponse<Product> updateProduct(
            @Parameter(description = "商品ID", required = true) @PathVariable Integer id,
            @Parameter(description = "商品对象", required = true) @RequestBody Product product) {
        try {
            Optional<Product> existingProduct = productService.getProductById(id);
            if (existingProduct.isPresent()) {
                product.setId(id); // 设置ID确保更新的是正确的商品
                Product updatedProduct = productService.updateProduct(product);
                return ApiResponse.success(updatedProduct); // 使用 success(T data) 方法
            } else {
                return ApiResponse.failure("商品未找到"); // 使用 failure(String message) 方法
            }
        } catch (Exception e) {
            return ApiResponse.failure("商品更新失败: " + e.getMessage()); // 使用 failure(String message) 方法
        }
    }

    /**
     * 删除商品
     *
     * @param id 商品ID
     * @return 返回操作结果
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除商品", description = "根据商品ID删除商品")
    public ApiResponse<Void> deleteProduct(
            @Parameter(description = "商品ID", required = true) @PathVariable Integer id) {
        try {
            Optional<Product> product = productService.getProductById(id);
            if (product.isPresent()) {
                productService.deleteProduct(id);
                return ApiResponse.success(null); // 使用 success(T data) 方法，data 为 null
            } else {
                return ApiResponse.failure("商品未找到"); // 使用 failure(String message) 方法
            }
        } catch (Exception e) {
            return ApiResponse.failure("商品删除失败: " + e.getMessage()); // 使用 failure(String message) 方法
        }
    }

    /**
     * 搜索商品
     *
     * @param keyword 搜索关键字
     * @param page    页码
     * @param size    每页数量
     * @return 返回搜索结果
     */
    @GetMapping("/search")
    @Operation(summary = "搜索产品", description = "根据关键字模糊查询产品")
    public ApiResponse<List<Product>> searchProducts(
            @Parameter(description = "搜索关键字", required = true) 
            @RequestParam String keyword,
            @Parameter(description = "页码", required = false) 
            @RequestParam(defaultValue = "1") Integer page,
            @Parameter(description = "每页数量", required = false) 
            @RequestParam(defaultValue = "10") Integer size) {
        try {
            System.out.println(keyword);
            List<Product> products = productService.searchByKeyword(keyword, page, size);
            if (products != null && !products.isEmpty()) {
                return ApiResponse.success(products);
            }
            return ApiResponse.success(Collections.emptyList());
        } catch (Exception e) {
            return ApiResponse.failure("商品搜索失败: " + e.getMessage());
        }
    }
}