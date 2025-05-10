package com.example.oldproject.PoJo;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;
import lombok.Data;

@Data
public class Product implements Serializable {

    // 商品ID，主键，自动增长
    private Integer id;

    // 商品名称，不可为空
    private String name;

    // 商品描述，允许为空
    private String description;

    // 商品价格，必须为大数值型，包含两位小数
    private BigDecimal price;

    // 商品分类ID，允许为空，关联到分类表
    private Integer categoryId;

    // 商品图片路径，允许为空
    private String image;

    // 商品库存，默认为0
    private Integer stock;

    // 商品是否激活，1表示激活，0表示未激活，默认为1
    private Boolean isActive = true;

    // Getter 和 Setter 方法
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    // 重写 toString() 方法
    @Override
    public String toString() {
        return "Product{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", price=" + price +
                ", categoryId=" + categoryId +
                ", image='" + image + '\'' +
                ", stock=" + stock +
                ", isActive=" + isActive +
                '}';
    }

    // 重写 equals() 和 hashCode() 方法
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Product product = (Product) o;

        return Objects.equals(id, product.id);
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }
}