if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global = uni.requireGlobal();
  ArrayBuffer = global.ArrayBuffer;
  Int8Array = global.Int8Array;
  Uint8Array = global.Uint8Array;
  Uint8ClampedArray = global.Uint8ClampedArray;
  Int16Array = global.Int16Array;
  Uint16Array = global.Uint16Array;
  Int32Array = global.Int32Array;
  Uint32Array = global.Uint32Array;
  Float32Array = global.Float32Array;
  Float64Array = global.Float64Array;
  BigInt64Array = global.BigInt64Array;
  BigUint64Array = global.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue, shared) {
  "use strict";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  function resolveEasycom(component, easycom) {
    return typeof component === "string" ? easycom : component;
  }
  const dev = {
    baseURL: "http://localhost:8080"
    // 确保使用完整的URL格式
  };
  const baseURL$1 = dev.baseURL;
  const whiteList = [
    "/pages/login/login",
    "/pages/register/register",
    "/pages/reset-password/reset-password",
    "/pages/mall/mall",
    "/pages/category/category",
    "/pages/cart/cart"
  ];
  const httpInterceptor = {
    invoke(options) {
      let url = baseURL$1;
      if (!url.endsWith("/") && !options.url.startsWith("/")) {
        url += "/";
      }
      url += options.url;
      if (options.method === "GET" && options.params) {
        if (!url.endsWith("?")) {
          url += "?";
        }
        Object.keys(options.params).forEach((key, index) => {
          if (index > 0) {
            url += "&";
          }
          url += `${encodeURIComponent(key)}=${encodeURIComponent(options.params[key])}`;
        });
      }
      options.url = url;
      options.timeout = 1e4;
      options.header = {
        ...options.header,
        "source-client": "miniapp"
      };
      const token = uni.getStorageSync("token");
      if (token) {
        options.header.Authorization = token.trim();
      }
      formatAppLog("log", "at utils/request.js:45", "请求URL:", options.url);
      formatAppLog("log", "at utils/request.js:46", "请求参数:", options.params);
    }
  };
  uni.addInterceptor("request", httpInterceptor);
  uni.addInterceptor("uploadFile", httpInterceptor);
  const request = (options) => {
    return new Promise((resolve, reject) => {
      uni.request({
        ...options,
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const response = res.data;
            if (response.code === 1) {
              resolve(response);
            } else {
              uni.showToast({
                icon: "none",
                title: response.message || "请求失败"
              });
              reject(new Error(response.message));
            }
          } else if (res.statusCode === 401) {
            uni.removeStorageSync("token");
            uni.removeStorageSync("userInfo");
            uni.navigateTo({ url: "/pages/login/login" });
            reject(new Error("未授权"));
          } else {
            const message = res.message || "请求失败";
            uni.showToast({
              icon: "none",
              title: message
            });
            reject(new Error(message));
          }
        },
        fail: (err) => {
          uni.showToast({
            icon: "none",
            title: "网络错误,请稍后重试"
          });
          reject(err);
        }
      });
    });
  };
  const getProductList = (params) => {
    return request({
      url: "/products/page",
      method: "GET",
      params
    });
  };
  const getProductDetail = (id) => {
    return request({
      url: `/products/${id}`,
      method: "GET"
    });
  };
  const getCategoryList$1 = () => {
    return request({
      url: "/categories",
      method: "GET"
    });
  };
  const searchProducts = (keyword, page = 1, size = 10) => {
    return request({
      url: "/products/search",
      method: "GET",
      params: {
        keyword,
        page,
        size
      }
    });
  };
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$m = {
    data() {
      return {
        banners: [
          { image: "/images/bg1.png" },
          { image: "/images/bg2.jpg" },
          { image: "/images/bg3.jpg" }
        ],
        categories: [],
        currentCategory: null,
        recommendProducts: [],
        searchKeyword: ""
      };
    },
    onLoad() {
      this.getCategories();
      this.getRecommendProducts();
    },
    onPullDownRefresh() {
      this.getRecommendProducts();
      setTimeout(() => {
        uni.stopPullDownRefresh();
      }, 1e3);
    },
    methods: {
      async getRecommendProducts() {
        try {
          if (this.searchKeyword) {
            const res = await searchProducts(this.searchKeyword);
            if (res.code === 1 && res.data) {
              this.recommendProducts = res.data.map((item) => ({
                ...item,
                soldCount: Math.floor(Math.random() * (100 - 20 + 1)) + 20
              }));
            }
          } else {
            const res = await getProductList();
            if (res.code === 1 && res.data && res.data.length > 0) {
              this.recommendProducts = this.getRandomItems(res.data, 5).map((item) => ({
                ...item,
                soldCount: Math.floor(Math.random() * (100 - 20 + 1)) + 20
              }));
            }
          }
          formatAppLog("log", "at pages/mall/mall.vue:116", "推荐商品:", this.recommendProducts);
        } catch (e) {
          formatAppLog("error", "at pages/mall/mall.vue:118", "获取商品失败:", e);
          uni.showToast({
            title: "获取商品失败",
            icon: "none"
          });
        }
      },
      // 从数组中随机获取指定数量的元素
      getRandomItems(array, count) {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
      },
      goSearch() {
        uni.navigateTo({
          url: "/pages/search/search"
        });
      },
      goDetail(id) {
        uni.navigateTo({
          url: `/pages/product/detail?id=${id}`
        });
      },
      async getCategories() {
        try {
          const res = await getCategoryList$1();
          if (res.code === 1 && res.data) {
            this.categories = res.data;
            if (this.categories.length > 0) {
              this.currentCategory = this.categories[0].id;
            }
          }
        } catch (e) {
          formatAppLog("error", "at pages/mall/mall.vue:154", "获取分类失败:", e);
        }
      },
      goCategory(id) {
        this.currentCategory = id;
        uni.setStorageSync("selectedCategoryId", id);
        uni.switchTab({
          url: "/pages/category/category",
          fail: (err) => {
            formatAppLog("error", "at pages/mall/mall.vue:166", "跳转失败:", err);
            uni.showToast({
              title: "跳转失败",
              icon: "none"
            });
          }
        });
      },
      // 处理搜索
      handleSearch(keyword) {
        this.searchKeyword = keyword;
        this.getRecommendProducts();
      }
    }
  };
  function _sfc_render$m(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 搜索栏 "),
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", { class: "search-bar" }, [
          vue.createElementVNode("view", {
            class: "search-input",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.goSearch && $options.goSearch(...args))
          }, [
            vue.createElementVNode("text", { class: "iconfont icon-search" }),
            vue.createElementVNode("text", { class: "placeholder" }, "搜索商品")
          ])
        ])
      ]),
      vue.createCommentVNode(" 轮播图 "),
      vue.createElementVNode("swiper", {
        class: "banner animate__animated animate__fadeIn",
        "indicator-dots": true,
        autoplay: true,
        interval: 3e3,
        duration: 500,
        "indicator-active-color": "#FFC300"
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.banners, (item, index) => {
            return vue.openBlock(), vue.createElementBlock("swiper-item", {
              key: index,
              class: "animate__animated animate__fadeIn"
            }, [
              vue.createElementVNode("image", {
                src: item.image,
                mode: "aspectFill"
              }, null, 8, ["src"])
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      vue.createCommentVNode(" 分类导航 "),
      vue.createElementVNode("view", { class: "category-nav" }, [
        vue.createElementVNode("scroll-view", {
          "scroll-x": "",
          class: "category-scroll"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.categories, (item) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: vue.normalizeClass(["category-item", { "active": $data.currentCategory === item.id }]),
                key: item.id,
                onClick: ($event) => $options.goCategory(item.id)
              }, [
                vue.createElementVNode("image", {
                  src: item.icon || "/static/images/category-default.png",
                  mode: "aspectFit"
                }, null, 8, ["src"]),
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString(item.name),
                  1
                  /* TEXT */
                )
              ], 10, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      vue.createCommentVNode(" 推荐商品 "),
      vue.createElementVNode("view", { class: "recommend" }, [
        vue.createElementVNode("view", { class: "section-title" }, [
          vue.createElementVNode("text", { class: "title" }, "猜你喜欢"),
          vue.createElementVNode("text", { class: "subtitle" }, "为你精选好物")
        ]),
        vue.createElementVNode("view", { class: "product-list" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.recommendProducts, (item) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "product-item",
                key: item.id,
                onClick: ($event) => $options.goDetail(item.id)
              }, [
                vue.createElementVNode("image", {
                  src: item.image || "/static/images/default.png",
                  mode: "aspectFill"
                }, null, 8, ["src"]),
                vue.createElementVNode("view", { class: "info" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "name" },
                    vue.toDisplayString(item.name),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("view", { class: "price-wrap" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "price" },
                      "¥" + vue.toDisplayString(item.price),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "sold" },
                      "已售" + vue.toDisplayString(item.soldCount || 0) + "件",
                      1
                      /* TEXT */
                    )
                  ])
                ])
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])
    ]);
  }
  const PagesMallMall = /* @__PURE__ */ _export_sfc(_sfc_main$m, [["render", _sfc_render$m], ["__file", "C:/Users/shiba/Desktop/情趣用品/qingqu/pages/mall/mall.vue"]]);
  const getCategoryList = () => {
    return request({
      url: "/categories",
      method: "GET"
    });
  };
  const login = (data) => {
    return request({
      url: "/user/login",
      method: "POST",
      data
    });
  };
  const register = (data) => {
    return request({
      url: "/user/register",
      method: "POST",
      header: {
        "Content-Type": "application/json"
      },
      data
    });
  };
  const getUserInfo = (username) => {
    return request({
      url: "/user/info",
      method: "GET",
      data: { username }
    });
  };
  const updateUserInfo = (data) => {
    return request({
      url: "/user/update",
      method: "PUT",
      data
    });
  };
  const sendEmailCode = (data) => {
    return request({
      url: "/user/send-email-code",
      method: "POST",
      data: `username=${data.username}&email=${data.email}`,
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
  };
  const resetPassword = (data) => {
    return request({
      url: "/user/reset-password",
      method: "POST",
      data: `username=${data.username}&newPassword=${data.newPassword}&emailCode=${data.emailCode}`,
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
  };
  const _sfc_main$l = {
    data() {
      return {
        categories: [],
        currentCategory: {},
        products: [],
        loading: false,
        scrollTop: 0,
        productScrollTop: 0,
        defaultCategoryId: null
      };
    },
    onShow() {
      if (this.categories.length === 0) {
        this.getCategories();
      }
      const selectedId = uni.getStorageSync("selectedCategoryId");
      if (selectedId) {
        const category = this.categories.find((item) => item.id === selectedId);
        if (category) {
          this.switchCategory(category);
        }
        uni.removeStorageSync("selectedCategoryId");
      }
    },
    onLoad(options) {
      if (options.id) {
        this.defaultCategoryId = Number(options.id);
      }
      this.getCategories(options.id);
    },
    onTabItemTap() {
      if (this.categories.length === 0) {
        this.getCategories();
      }
    },
    onHide() {
      uni.setStorageSync("categoryData", {
        categories: this.categories,
        currentCategory: this.currentCategory,
        products: this.products
      });
    },
    onShow() {
      const savedData = uni.getStorageSync("categoryData");
      if (savedData) {
        this.categories = savedData.categories;
        this.currentCategory = savedData.currentCategory;
        this.products = savedData.products;
        if (this.defaultCategoryId) {
          const category = this.categories.find((item) => item.id === this.defaultCategoryId);
          if (category) {
            this.switchCategory(category);
          }
          this.defaultCategoryId = null;
        }
      } else if (this.categories.length === 0) {
        this.getCategories();
      }
    },
    methods: {
      onScroll(e) {
        this.scrollTop = e.detail.scrollTop;
      },
      onProductScroll(e) {
        this.productScrollTop = e.detail.scrollTop;
      },
      async getCategories(defaultId) {
        this.loading = true;
        try {
          const res = await getCategoryList();
          if (res.code === 1 && res.data && res.data.length > 0) {
            this.categories = res.data.filter((item) => item.isActive);
            if (defaultId) {
              this.currentCategory = this.categories.find((item) => item.id === Number(defaultId)) || this.categories[0];
            } else {
              this.currentCategory = this.categories[0];
            }
            this.updateProducts();
          } else {
            uni.showToast({
              title: "暂无分类数据",
              icon: "none"
            });
          }
        } catch (e) {
          formatAppLog("error", "at pages/category/category.vue:164", "获取分类失败:", e);
          uni.showToast({
            title: "获取分类失败",
            icon: "none"
          });
        } finally {
          this.loading = false;
        }
      },
      updateProducts() {
        if (!this.currentCategory || !this.currentCategory.id) {
          if (this.categories.length > 0) {
            this.currentCategory = this.categories[0];
          } else {
            this.products = [];
            return;
          }
        }
        this.products = this.currentCategory.products || [];
      },
      switchCategory(item) {
        if (!item || !item.id)
          return;
        this.currentCategory = item;
        this.updateProducts();
      },
      goDetail(id) {
        uni.navigateTo({
          url: `/pages/product/detail?id=${id}`,
          fail: (err) => {
            formatAppLog("error", "at pages/category/category.vue:196", "跳转失败:", err);
            uni.showToast({
              title: "页面跳转失败",
              icon: "none"
            });
          }
        });
      },
      // 发送邮箱验证码
      async handleSendEmailCode(username, email) {
        try {
          const res = await sendEmailCode({
            username,
            email
          });
          if (res.code === 1) {
            uni.showToast({
              title: res.message || "验证码已发送",
              icon: "success"
            });
          } else {
            uni.showToast({
              title: res.message || "发送失败",
              icon: "none"
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/category/category.vue:223", "发送验证码失败:", error);
          uni.showToast({
            title: "发送失败，请重试",
            icon: "none"
          });
        }
      }
    }
  };
  function _sfc_render$l(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 顶部导航栏 "),
      vue.createElementVNode("view", { class: "nav-bar" }, [
        vue.createElementVNode("text", null, "商品分类")
      ]),
      vue.createCommentVNode(" 加载状态 "),
      $data.loading ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "loading"
      }, [
        vue.createElementVNode("text", null, "加载中...")
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 主体内容区 "),
      vue.createElementVNode("view", { class: "content" }, [
        vue.createCommentVNode(" 左侧分类列表 "),
        vue.createElementVNode("scroll-view", {
          class: "category-list",
          "scroll-y": "",
          "scroll-top": $data.scrollTop,
          onScroll: _cache[0] || (_cache[0] = (...args) => $options.onScroll && $options.onScroll(...args))
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.categories, (item) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: vue.normalizeClass(["category-item", { active: $data.currentCategory.id === item.id }]),
                key: item.id,
                onClick: ($event) => $options.switchCategory(item)
              }, [
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString(item.name),
                  1
                  /* TEXT */
                )
              ], 10, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ], 40, ["scroll-top"]),
        vue.createCommentVNode(" 右侧商品列表 "),
        vue.createElementVNode("scroll-view", {
          class: "product-list",
          "scroll-y": "",
          "scroll-top": $data.productScrollTop,
          onScroll: _cache[1] || (_cache[1] = (...args) => $options.onProductScroll && $options.onProductScroll(...args)),
          onScrolltolower: _cache[2] || (_cache[2] = (...args) => _ctx.loadMore && _ctx.loadMore(...args)),
          "refresher-enabled": "",
          "refresher-triggered": _ctx.isRefreshing,
          onRefresherrefresh: _cache[3] || (_cache[3] = (...args) => _ctx.onRefresh && _ctx.onRefresh(...args))
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.products, (item) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "product-item",
                key: item.id,
                onClick: ($event) => $options.goDetail(item.id)
              }, [
                vue.createElementVNode("image", {
                  src: item.image || "/static/images/default.png",
                  mode: "aspectFill"
                }, null, 8, ["src"]),
                vue.createElementVNode("view", { class: "info" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "name" },
                    vue.toDisplayString(item.name),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "price" },
                    "¥" + vue.toDisplayString(item.price),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "desc" },
                    vue.toDisplayString(item.description),
                    1
                    /* TEXT */
                  )
                ])
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          )),
          vue.createCommentVNode(" 空状态 "),
          $data.products.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "empty"
          }, [
            vue.createElementVNode("text", null, "暂无商品")
          ])) : vue.createCommentVNode("v-if", true)
        ], 40, ["scroll-top", "refresher-triggered"])
      ])
    ]);
  }
  const PagesCategoryCategory = /* @__PURE__ */ _export_sfc(_sfc_main$l, [["render", _sfc_render$l], ["__file", "C:/Users/shiba/Desktop/情趣用品/qingqu/pages/category/category.vue"]]);
  const getCartList = (userId) => {
    return request({
      url: `/cart/user/${userId}`,
      method: "GET"
    });
  };
  const updateCartItem = (data) => {
    return request({
      url: "/cart/update",
      method: "PUT",
      data
    });
  };
  const removeFromCart = (id) => {
    return request({
      url: `/cart/${id}`,
      method: "DELETE"
    });
  };
  const _imports_0$1 = "/static/images/empty-cart.png";
  const _sfc_main$k = {
    data() {
      return {
        cartItems: [],
        isAllSelected: false
      };
    },
    computed: {
      selectedCount() {
        return this.cartItems.filter((item) => item.checked).length;
      },
      totalAmount() {
        return this.cartItems.filter((item) => item.checked).reduce((total, item) => {
          return total + Number(item.product.price) * Number(item.quantity);
        }, 0).toFixed(2);
      }
    },
    onShow() {
      this.getCartList();
    },
    methods: {
      async getCartList() {
        try {
          const userInfo = uni.getStorageSync("userInfo");
          if (!userInfo || !userInfo.id) {
            uni.showToast({
              title: "请先登录",
              icon: "none"
            });
            return;
          }
          const res = await getCartList(userInfo.id);
          if (res.code === 1 && res.data) {
            this.cartItems = res.data.map((item) => ({
              ...item,
              checked: false
            }));
          }
        } catch (e) {
          formatAppLog("error", "at pages/cart/cart.vue:99", "获取购物车失败:", e);
          uni.showToast({
            title: "获取购物车失败",
            icon: "none"
          });
        }
      },
      toggleSelect(item) {
        item.checked = !item.checked;
        this.updateAllSelectedStatus();
      },
      toggleSelectAll() {
        this.isAllSelected = !this.isAllSelected;
        this.cartItems.forEach((item) => {
          item.checked = this.isAllSelected;
        });
      },
      updateAllSelectedStatus() {
        this.isAllSelected = this.cartItems.length > 0 && this.cartItems.every((item) => item.checked);
      },
      async updateQuantity(item, delta) {
        const newQuantity = item.quantity + delta;
        if (newQuantity < 1)
          return;
        try {
          const res = await updateCartItem({
            id: item.id,
            quantity: newQuantity
          });
          if (res.code === 1) {
            item.quantity = newQuantity;
          }
        } catch (e) {
          formatAppLog("error", "at pages/cart/cart.vue:138", "更新数量失败:", e);
        }
      },
      async handleDelete(id) {
        uni.showModal({
          title: "提示",
          content: "确定要删除这个商品吗？",
          success: async (res) => {
            if (res.confirm) {
              try {
                const res2 = await removeFromCart(id);
                if (res2.code === 1) {
                  this.cartItems = this.cartItems.filter((item) => item.id !== id);
                  uni.showToast({
                    title: "删除成功",
                    icon: "success"
                  });
                }
              } catch (e) {
                formatAppLog("error", "at pages/cart/cart.vue:158", "删除失败:", e);
              }
            }
          }
        });
      },
      submitOrder() {
        const selectedItems = this.cartItems.filter((item) => item.checked);
        if (selectedItems.length === 0)
          return;
        const orderInfo = {
          products: selectedItems.map((item) => ({
            id: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
            name: item.product.name,
            image: item.product.image
          }))
        };
        uni.navigateTo({
          url: `/pages/order/create?orderInfo=${encodeURIComponent(JSON.stringify(orderInfo))}`
        });
      },
      goShopping() {
        uni.switchTab({
          url: "/pages/mall/mall"
        });
      }
    }
  };
  function _sfc_render$k(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 购物车列表 "),
      $data.cartItems.length > 0 ? (vue.openBlock(), vue.createElementBlock("scroll-view", {
        key: 0,
        "scroll-y": "",
        class: "cart-list"
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.cartItems, (item) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "cart-item",
              key: item.id
            }, [
              vue.createElementVNode("checkbox", {
                checked: item.checked,
                onClick: ($event) => $options.toggleSelect(item)
              }, null, 8, ["checked", "onClick"]),
              vue.createElementVNode("image", {
                src: item.product.image || "/static/images/default.png",
                mode: "aspectFill"
              }, null, 8, ["src"]),
              vue.createElementVNode("view", { class: "info" }, [
                vue.createElementVNode(
                  "text",
                  { class: "name" },
                  vue.toDisplayString(item.product.name),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", { class: "price-wrap" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "price" },
                    "¥" + vue.toDisplayString(item.product.price),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("view", { class: "quantity-control" }, [
                    vue.createElementVNode("text", {
                      class: "minus",
                      onClick: ($event) => $options.updateQuantity(item, -1)
                    }, "-", 8, ["onClick"]),
                    vue.createElementVNode(
                      "text",
                      { class: "quantity" },
                      vue.toDisplayString(item.quantity),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("text", {
                      class: "plus",
                      onClick: ($event) => $options.updateQuantity(item, 1)
                    }, "+", 8, ["onClick"])
                  ])
                ])
              ]),
              vue.createElementVNode("text", {
                class: "delete",
                onClick: ($event) => $options.handleDelete(item.id)
              }, "×", 8, ["onClick"])
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : (vue.openBlock(), vue.createElementBlock(
        vue.Fragment,
        { key: 1 },
        [
          vue.createCommentVNode(" 空购物车 "),
          vue.createElementVNode("view", { class: "empty" }, [
            vue.createElementVNode("image", {
              src: _imports_0$1,
              mode: "aspectFit"
            }),
            vue.createElementVNode("text", null, "购物车是空的"),
            vue.createElementVNode("button", {
              class: "go-shopping",
              onClick: _cache[0] || (_cache[0] = (...args) => $options.goShopping && $options.goShopping(...args))
            }, "去逛逛")
          ])
        ],
        2112
        /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
      )),
      vue.createCommentVNode(" 底部结算栏 "),
      $data.cartItems.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "submit-bar safe-area-bottom"
      }, [
        vue.createElementVNode("view", { class: "left" }, [
          vue.createElementVNode("checkbox", {
            checked: $data.isAllSelected,
            onClick: _cache[1] || (_cache[1] = (...args) => $options.toggleSelectAll && $options.toggleSelectAll(...args))
          }, null, 8, ["checked"]),
          vue.createElementVNode("text", null, "全选")
        ]),
        vue.createElementVNode("view", { class: "right" }, [
          vue.createElementVNode("view", { class: "total" }, [
            vue.createElementVNode("text", null, "合计："),
            vue.createElementVNode(
              "text",
              { class: "price" },
              "¥" + vue.toDisplayString($options.totalAmount),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("button", {
            class: "submit-btn",
            disabled: $options.selectedCount === 0,
            onClick: _cache[2] || (_cache[2] = (...args) => $options.submitOrder && $options.submitOrder(...args))
          }, " 结算(" + vue.toDisplayString($options.selectedCount) + ") ", 9, ["disabled"])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesCartCart = /* @__PURE__ */ _export_sfc(_sfc_main$k, [["render", _sfc_render$k], ["__file", "C:/Users/shiba/Desktop/情趣用品/qingqu/pages/cart/cart.vue"]]);
  const _sfc_main$j = {
    data() {
      return {
        userInfo: {}
      };
    },
    onShow() {
      this.getUserInfo();
    },
    methods: {
      async getUserInfo() {
        try {
          const userInfo = uni.getStorageSync("userInfo");
          if (!userInfo) {
            return;
          }
          const res = await getUserInfo(userInfo.username);
          if (res.code === 1) {
            this.userInfo = res.data;
          }
        } catch (e) {
          formatAppLog("error", "at pages/user/user.vue:61", "获取用户信息失败:", e);
        }
      },
      goOrders() {
        uni.navigateTo({
          url: "/pages/order/list"
        });
      },
      goAddress() {
        uni.navigateTo({
          url: "/pages/address/list"
        });
      },
      goSettings() {
        uni.navigateTo({
          url: "/pages/user/settings"
        });
      }
    }
  };
  function _sfc_render$j(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 用户信息卡片 "),
      vue.createElementVNode("view", { class: "user-card" }, [
        vue.createElementVNode("view", { class: "avatar" }, [
          vue.createElementVNode("image", {
            src: $data.userInfo.profilePicture || "/static/images/default-avatar.png",
            mode: "aspectFill"
          }, null, 8, ["src"])
        ]),
        vue.createElementVNode("view", { class: "info" }, [
          vue.createElementVNode(
            "text",
            { class: "username" },
            vue.toDisplayString($data.userInfo.username || "未登录"),
            1
            /* TEXT */
          )
        ])
      ]),
      vue.createCommentVNode(" 功能菜单 "),
      vue.createElementVNode("view", { class: "menu-list" }, [
        vue.createElementVNode("view", {
          class: "menu-item",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.goOrders && $options.goOrders(...args))
        }, [
          vue.createElementVNode("text", { class: "iconfont icon-order" }),
          vue.createElementVNode("text", null, "我的订单"),
          vue.createElementVNode("text", { class: "iconfont icon-right" })
        ]),
        vue.createElementVNode("view", {
          class: "menu-item",
          onClick: _cache[1] || (_cache[1] = (...args) => $options.goAddress && $options.goAddress(...args))
        }, [
          vue.createElementVNode("text", { class: "iconfont icon-address" }),
          vue.createElementVNode("text", null, "收货地址"),
          vue.createElementVNode("text", { class: "iconfont icon-right" })
        ]),
        vue.createElementVNode("view", {
          class: "menu-item",
          onClick: _cache[2] || (_cache[2] = (...args) => $options.goSettings && $options.goSettings(...args))
        }, [
          vue.createElementVNode("text", { class: "iconfont icon-settings" }),
          vue.createElementVNode("text", null, "设置"),
          vue.createElementVNode("text", { class: "iconfont icon-right" })
        ])
      ])
    ]);
  }
  const PagesUserUser = /* @__PURE__ */ _export_sfc(_sfc_main$j, [["render", _sfc_render$j], ["__file", "C:/Users/shiba/Desktop/情趣用品/qingqu/pages/user/user.vue"]]);
  const _sfc_main$i = {
    data() {
      return {
        form: {
          username: "",
          password: ""
        }
      };
    },
    methods: {
      async handleLogin() {
        if (!this.form.username || !this.form.password) {
          uni.showToast({
            title: "请输入用户名和密码",
            icon: "none"
          });
          return;
        }
        try {
          const res = await login(this.form);
          formatAppLog("log", "at pages/login/login.vue:51", "登录响应:", res);
          if (res.code === 1 && res.data) {
            const { token, userId, username } = res.data;
            uni.setStorageSync("token", token);
            uni.setStorageSync("userInfo", {
              id: userId,
              username
            });
            uni.showToast({
              title: "登录成功",
              icon: "success"
            });
            setTimeout(() => {
              uni.switchTab({
                url: "/pages/user/user"
              });
            }, 1500);
          } else {
            uni.showToast({
              title: res.message || "登录失败",
              icon: "none"
            });
          }
        } catch (e) {
          formatAppLog("error", "at pages/login/login.vue:80", "登录失败:", e);
          uni.showToast({
            title: "登录失败",
            icon: "none"
          });
        }
      },
      goRegister() {
        uni.navigateTo({
          url: "/pages/register/register"
        });
      },
      goResetPassword() {
        uni.navigateTo({
          url: "/pages/reset-password/reset-password"
        });
      }
    }
  };
  function _sfc_render$i(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "form" }, [
        vue.createElementVNode("view", { class: "input-group" }, [
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              type: "text",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.form.username = $event),
              placeholder: "请输入用户名"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.form.username]
          ])
        ]),
        vue.createElementVNode("view", { class: "input-group" }, [
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              type: "password",
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.form.password = $event),
              placeholder: "请输入密码"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.form.password]
          ])
        ]),
        vue.createElementVNode("button", {
          class: "login-btn",
          onClick: _cache[2] || (_cache[2] = (...args) => $options.handleLogin && $options.handleLogin(...args))
        }, "登录"),
        vue.createElementVNode("view", { class: "actions" }, [
          vue.createElementVNode("text", {
            onClick: _cache[3] || (_cache[3] = (...args) => $options.goRegister && $options.goRegister(...args))
          }, "注册账号"),
          vue.createElementVNode("text", {
            onClick: _cache[4] || (_cache[4] = (...args) => $options.goResetPassword && $options.goResetPassword(...args))
          }, "忘记密码")
        ])
      ])
    ]);
  }
  const PagesLoginLogin = /* @__PURE__ */ _export_sfc(_sfc_main$i, [["render", _sfc_render$i], ["__file", "C:/Users/shiba/Desktop/情趣用品/qingqu/pages/login/login.vue"]]);
  const _sfc_main$h = {
    data() {
      return {
        form: {
          username: "",
          password: "",
          name: "",
          age: "",
          gender: "male",
          phone: "",
          email: "",
          profilePicture: ""
        },
        confirmPassword: "",
        showPassword: false,
        showConfirmPassword: false
      };
    },
    methods: {
      handleGenderChange(e) {
        this.form.gender = e.detail.value;
        this.form.profilePicture = `/images/default_${e.detail.value}.jpg`;
      },
      togglePassword() {
        this.showPassword = !this.showPassword;
      },
      toggleConfirmPassword() {
        this.showConfirmPassword = !this.showConfirmPassword;
      },
      async handleRegister() {
        if (!this.form.username) {
          uni.showToast({
            title: "请输入用户名",
            icon: "none"
          });
          return;
        }
        if (!this.form.password) {
          uni.showToast({
            title: "请输入密码",
            icon: "none"
          });
          return;
        }
        if (this.form.password !== this.confirmPassword) {
          uni.showToast({
            title: "两次密码不一致",
            icon: "none"
          });
          return;
        }
        try {
          const res = await register(this.form);
          formatAppLog("log", "at pages/register/register.vue:125", "注册响应:", res);
          if (res.status == 1) {
            uni.showToast({
              title: "注册成功",
              icon: "success"
            });
            setTimeout(() => {
              uni.redirectTo({
                url: "/pages/login/login"
              });
            }, 1e3);
          } else {
            uni.showToast({
              title: res.message || "注册失败",
              icon: "none"
            });
          }
        } catch (e) {
          formatAppLog("error", "at pages/register/register.vue:146", "注册错误:", e);
          uni.showToast({
            title: e.message || "注册失败",
            icon: "none"
          });
        }
      },
      goLogin() {
        uni.redirectTo({
          url: "/pages/login/login"
        });
      }
    }
  };
  function _sfc_render$h(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "title" }, "注册账号"),
      vue.createElementVNode("view", { class: "form" }, [
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "label" }, "用户名"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              type: "text",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.form.username = $event),
              placeholder: "请输入用户名"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.form.username]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "label" }, "手机号"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              type: "number",
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.form.phone = $event),
              placeholder: "请输入手机号"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.form.phone]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "label" }, "性别"),
          vue.createElementVNode(
            "radio-group",
            {
              onChange: _cache[2] || (_cache[2] = (...args) => $options.handleGenderChange && $options.handleGenderChange(...args))
            },
            [
              vue.createElementVNode("label", { class: "radio" }, [
                vue.createElementVNode("radio", {
                  value: "male",
                  checked: $data.form.gender === "male"
                }, null, 8, ["checked"]),
                vue.createTextVNode("男 ")
              ]),
              vue.createElementVNode("label", { class: "radio" }, [
                vue.createElementVNode("radio", {
                  value: "female",
                  checked: $data.form.gender === "female"
                }, null, 8, ["checked"]),
                vue.createTextVNode("女 ")
              ])
            ],
            32
            /* NEED_HYDRATION */
          )
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "label" }, "邮箱"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              type: "text",
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.form.email = $event),
              placeholder: "请输入邮箱"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.form.email]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "label" }, "密码"),
          vue.createElementVNode("view", { class: "password-input" }, [
            vue.withDirectives(vue.createElementVNode("input", {
              type: $data.showPassword ? "text" : "password",
              "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $data.form.password = $event),
              placeholder: "请输入密码"
            }, null, 8, ["type"]), [
              [vue.vModelDynamic, $data.form.password]
            ]),
            vue.createElementVNode(
              "text",
              {
                class: vue.normalizeClass(["iconfont", $data.showPassword ? "icon-eye" : "icon-eye-close"]),
                onClick: _cache[5] || (_cache[5] = (...args) => $options.togglePassword && $options.togglePassword(...args))
              },
              null,
              2
              /* CLASS */
            )
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "label" }, "确认密码"),
          vue.createElementVNode("view", { class: "password-input" }, [
            vue.withDirectives(vue.createElementVNode("input", {
              type: $data.showConfirmPassword ? "text" : "password",
              "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => $data.confirmPassword = $event),
              placeholder: "请再次输入密码"
            }, null, 8, ["type"]), [
              [vue.vModelDynamic, $data.confirmPassword]
            ]),
            vue.createElementVNode(
              "text",
              {
                class: vue.normalizeClass(["iconfont", $data.showConfirmPassword ? "icon-eye" : "icon-eye-close"]),
                onClick: _cache[7] || (_cache[7] = (...args) => $options.toggleConfirmPassword && $options.toggleConfirmPassword(...args))
              },
              null,
              2
              /* CLASS */
            )
          ])
        ])
      ]),
      vue.createElementVNode("button", {
        class: "submit-btn",
        onClick: _cache[8] || (_cache[8] = (...args) => $options.handleRegister && $options.handleRegister(...args))
      }, "注册"),
      vue.createElementVNode("view", { class: "login-link" }, [
        vue.createTextVNode(" 已有账号？"),
        vue.createElementVNode("text", {
          onClick: _cache[9] || (_cache[9] = (...args) => $options.goLogin && $options.goLogin(...args))
        }, "去登录")
      ])
    ]);
  }
  const PagesRegisterRegister = /* @__PURE__ */ _export_sfc(_sfc_main$h, [["render", _sfc_render$h], ["__file", "C:/Users/shiba/Desktop/情趣用品/qingqu/pages/register/register.vue"]]);
  const _sfc_main$g = {
    data() {
      return {
        product: {},
        cartCount: 0
      };
    },
    onLoad(options) {
      if (options.id) {
        this.getDetail(options.id);
      }
    },
    methods: {
      goBack() {
        uni.navigateBack();
      },
      async getDetail(id) {
        try {
          const res = await getProductDetail(id);
          if (res.code === 1 && res.data) {
            this.product = res.data;
          }
        } catch (e) {
          formatAppLog("error", "at pages/product/detail.vue:111", "获取商品详情失败:", e);
          uni.showToast({
            title: "获取商品详情失败",
            icon: "none"
          });
        }
      },
      goCart() {
        uni.switchTab({
          url: "/pages/cart/cart"
        });
      },
      addToCart() {
        uni.showToast({
          title: "加入购物车成功",
          icon: "success"
        });
      },
      buyNow() {
        const orderInfo = {
          products: [{
            id: this.product.id,
            quantity: 1,
            price: this.product.price,
            name: this.product.name,
            image: this.product.image
          }]
        };
        uni.navigateTo({
          url: `/pages/order/create?orderInfo=${encodeURIComponent(JSON.stringify(orderInfo))}`
        });
      }
    }
  };
  function _sfc_render$g(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "page-container" }, [
      vue.createCommentVNode(" 顶部导航 "),
      vue.createElementVNode("view", { class: "mt-header" }, [
        vue.createElementVNode("view", { class: "header-content" }, [
          vue.createElementVNode("text", {
            class: "iconfont icon-back back-icon",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
          }),
          vue.createElementVNode("text", { class: "title" }, "商品详情")
        ])
      ]),
      vue.createCommentVNode(" 商品信息 "),
      vue.createElementVNode("scroll-view", {
        "scroll-y": "",
        class: "detail-container",
        style: { paddingTop: "88rpx" }
      }, [
        vue.createCommentVNode(" 商品主图 "),
        vue.createElementVNode("swiper", {
          class: "product-swiper animate__animated animate__fadeIn",
          "indicator-dots": true,
          autoplay: true,
          interval: 3e3,
          duration: 500,
          "indicator-active-color": "#FFC300"
        }, [
          vue.createElementVNode("swiper-item", { class: "animate__animated animate__zoomIn animate__slow" }, [
            vue.createElementVNode("image", {
              src: $data.product.image || "/static/images/default.png",
              mode: "aspectFill"
            }, null, 8, ["src"])
          ])
        ]),
        vue.createCommentVNode(" 商品基本信息 "),
        vue.createElementVNode("view", { class: "product-info mt-card animate__animated animate__fadeInUp animate__delay-1" }, [
          vue.createElementVNode("view", { class: "price-row" }, [
            vue.createElementVNode(
              "text",
              { class: "mt-price" },
              vue.toDisplayString($data.product.price),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "sold" },
              "已售 " + vue.toDisplayString($data.product.soldCount || 0),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode(
            "view",
            { class: "name" },
            vue.toDisplayString($data.product.name),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "view",
            { class: "desc" },
            vue.toDisplayString($data.product.description),
            1
            /* TEXT */
          )
        ]),
        vue.createCommentVNode(" 商品参数 "),
        vue.createElementVNode("view", { class: "product-params mt-card animate__animated animate__fadeInUp animate__delay-2" }, [
          vue.createElementVNode("view", { class: "section-title" }, [
            vue.createElementVNode("text", null, "商品参数")
          ]),
          vue.createElementVNode("view", { class: "param-list" }, [
            vue.createElementVNode("view", { class: "param-item" }, [
              vue.createElementVNode("text", { class: "label" }, "品牌"),
              vue.createElementVNode(
                "text",
                { class: "value" },
                vue.toDisplayString($data.product.brand || "暂无"),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "param-item" }, [
              vue.createElementVNode("text", { class: "label" }, "规格"),
              vue.createElementVNode(
                "text",
                { class: "value" },
                vue.toDisplayString($data.product.spec || "暂无"),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "param-item" }, [
              vue.createElementVNode("text", { class: "label" }, "产地"),
              vue.createElementVNode(
                "text",
                { class: "value" },
                vue.toDisplayString($data.product.origin || "暂无"),
                1
                /* TEXT */
              )
            ])
          ])
        ]),
        vue.createCommentVNode(" 商品详情 "),
        vue.createElementVNode("view", { class: "product-detail mt-card" }, [
          vue.createElementVNode("view", { class: "section-title" }, [
            vue.createElementVNode("text", null, "商品详情")
          ]),
          vue.createElementVNode("rich-text", {
            nodes: $data.product.detail || "暂无详细信息"
          }, null, 8, ["nodes"])
        ])
      ]),
      vue.createCommentVNode(" 底部操作栏 "),
      vue.createElementVNode("view", { class: "action-bar safe-area-bottom" }, [
        vue.createElementVNode("view", { class: "left" }, [
          vue.createElementVNode("view", {
            class: "action-item",
            onClick: _cache[1] || (_cache[1] = (...args) => $options.goCart && $options.goCart(...args))
          }, [
            vue.createElementVNode("text", { class: "iconfont icon-cart" }),
            vue.createElementVNode("text", null, "购物车"),
            $data.cartCount > 0 ? (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 0,
                class: "mt-badge"
              },
              vue.toDisplayString($data.cartCount),
              1
              /* TEXT */
            )) : vue.createCommentVNode("v-if", true)
          ])
        ]),
        vue.createElementVNode("view", { class: "right" }, [
          vue.createElementVNode("view", {
            class: "mt-button plain",
            onClick: _cache[2] || (_cache[2] = (...args) => $options.addToCart && $options.addToCart(...args))
          }, "加入购物车"),
          vue.createElementVNode("view", {
            class: "mt-button",
            onClick: _cache[3] || (_cache[3] = (...args) => $options.buyNow && $options.buyNow(...args))
          }, "立即购买")
        ])
      ])
    ]);
  }
  const PagesProductDetail = /* @__PURE__ */ _export_sfc(_sfc_main$g, [["render", _sfc_render$g], ["__file", "C:/Users/shiba/Desktop/情趣用品/qingqu/pages/product/detail.vue"]]);
  const createOrder = (data) => {
    return request({
      url: "/order/create",
      method: "POST",
      data
    });
  };
  const getOrderList = (params) => {
    return request({
      url: "/order/list",
      method: "GET",
      params
    });
  };
  const cancelOrder = (orderId) => {
    return request({
      url: `/order/cancel/${orderId}`,
      method: "POST"
    });
  };
  const confirmOrder = (orderId) => {
    return request({
      url: `/order/confirm/${orderId}`,
      method: "POST"
    });
  };
  const _sfc_main$f = {
    data() {
      return {
        currentStatus: "",
        statusList: [
          { label: "全部", value: "" },
          { label: "待付款", value: "0" },
          { label: "待发货", value: "1" },
          { label: "待收货", value: "3" },
          { label: "已完成", value: "4" }
        ],
        orderList: []
      };
    },
    onShow() {
      this.getOrders();
    },
    methods: {
      async getOrders() {
        try {
          const userInfo = uni.getStorageSync("userInfo");
          if (!userInfo || !userInfo.id) {
            uni.showToast({
              title: "请先登录",
              icon: "none"
            });
            return;
          }
          const res = await getOrderList();
          if (res.code === 1 && res.data) {
            this.orderList = res.data.map((order) => ({
              ...order,
              statusText: this.getStatusText(order.status || "待支付"),
              totalAmount: Number(order.totalAmount).toFixed(2),
              createTime: this.formatDate(order.createdAt)
            }));
          } else {
            uni.showToast({
              title: res.message || "获取订单失败",
              icon: "none"
            });
          }
        } catch (e) {
          formatAppLog("error", "at pages/order/list.vue:108", "获取订单列表失败:", e);
          uni.showToast({
            title: "获取订单失败",
            icon: "none"
          });
        }
      },
      switchStatus(status) {
        this.currentStatus = status;
        this.getOrders();
      },
      getStatusText(status) {
        const statusMap = {
          "待支付": "待付款",
          "待发货": "待发货",
          "待收货": "待收货",
          "已完成": "已完成",
          "已取消": "已取消"
        };
        return statusMap[status] || status;
      },
      goDetail(id) {
        uni.navigateTo({
          url: `/pages/order/detail?id=${id}`
        });
      },
      async goPay(order) {
        try {
          const payParams = {
            pid: "164878717",
            type: "alipay",
            out_trade_no: order.id,
            notify_url: "/epay/notify",
            return_url: "/epay/return",
            name: order.name || "商品订单",
            money: Number(order.totalAmount).toFixed(2),
            sitename: "情趣商城"
          };
          const res = await getPayLink(payParams);
          if (res.code === 1 && res.data) {
            window.location.href = res.data.payUrl || res.data;
          } else {
            uni.showToast({
              title: res.message || "获取支付链接失败",
              icon: "none"
            });
          }
        } catch (e) {
          formatAppLog("error", "at pages/order/list.vue:158", "发起支付失败:", e);
          uni.showToast({
            title: "发起支付失败",
            icon: "none"
          });
        }
      },
      async cancelOrder(id) {
        try {
          const res = await cancelOrder(id);
          if (res.status === 1) {
            uni.showToast({
              title: "取消成功",
              icon: "success"
            });
            this.getOrders();
          }
        } catch (e) {
          formatAppLog("error", "at pages/order/list.vue:176", "取消订单失败:", e);
        }
      },
      async confirmOrder(id) {
        try {
          const res = await confirmOrder(id);
          if (res.status === 1) {
            uni.showToast({
              title: "确认收货成功",
              icon: "success"
            });
            this.getOrders();
          }
        } catch (e) {
          formatAppLog("error", "at pages/order/list.vue:190", "确认收货失败:", e);
        }
      },
      formatDate(dateStr) {
        if (!dateStr)
          return "";
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hour = String(date.getHours()).padStart(2, "0");
        const minute = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day} ${hour}:${minute}`;
      },
      async handleCancel(id) {
        try {
          const res = await cancelOrder(id);
          if (res.code === 1) {
            uni.showToast({
              title: "取消成功",
              icon: "success"
            });
            this.getOrders();
          }
        } catch (e) {
          formatAppLog("error", "at pages/order/list.vue:214", "取消订单失败:", e);
          uni.showToast({
            title: "取消订单失败",
            icon: "none"
          });
        }
      },
      async handleConfirm(id) {
        try {
          const res = await confirmOrder(id);
          if (res.code === 1) {
            uni.showToast({
              title: "确认成功",
              icon: "success"
            });
            this.getOrders();
          }
        } catch (e) {
          formatAppLog("error", "at pages/order/list.vue:232", "确认收货失败:", e);
          uni.showToast({
            title: "确认收货失败",
            icon: "none"
          });
        }
      },
      async handleDelete(orderId) {
        try {
          const res = await deleteOrder(orderId);
          if (res.code === 1) {
            uni.showToast({
              title: "删除成功",
              icon: "success"
            });
            this.getOrders();
          }
        } catch (e) {
          formatAppLog("error", "at pages/order/list.vue:250", "删除订单失败:", e);
        }
      }
    }
  };
  function _sfc_render$f(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "page-container" }, [
      vue.createCommentVNode(" 订单状态切换 "),
      vue.createElementVNode("view", { class: "status-tabs" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.statusList, (item, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: vue.normalizeClass(["tab-item", { active: $data.currentStatus === item.value }]),
              key: index,
              onClick: ($event) => $options.switchStatus(item.value)
            }, vue.toDisplayString(item.label), 11, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      vue.createElementVNode("scroll-view", {
        class: "scroll-container",
        "scroll-y": ""
      }, [
        vue.createCommentVNode(" 订单列表 "),
        vue.createElementVNode("view", { class: "order-list" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.orderList, (item) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "order-item",
                key: item.id,
                onClick: ($event) => $options.goDetail(item.id)
              }, [
                vue.createCommentVNode(" 订单头部 "),
                vue.createElementVNode("view", { class: "order-header" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "order-no" },
                    "订单号：" + vue.toDisplayString(item.id),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "order-status" },
                    vue.toDisplayString($options.getStatusText(item.status)),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createCommentVNode(" 订单商品 "),
                vue.createElementVNode("view", { class: "order-goods" }, [
                  vue.createElementVNode("image", {
                    src: item.image,
                    mode: "aspectFill"
                  }, null, 8, ["src"]),
                  vue.createElementVNode("view", { class: "goods-info" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "name" },
                      vue.toDisplayString(item.name),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "price" },
                      "¥" + vue.toDisplayString(item.totalAmount),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                vue.createCommentVNode(" 订单操作 "),
                vue.createElementVNode("view", { class: "order-actions" }, [
                  item.status === "0" ? (vue.openBlock(), vue.createElementBlock(
                    vue.Fragment,
                    { key: 0 },
                    [
                      vue.createElementVNode("button", {
                        class: "btn",
                        onClick: vue.withModifiers(($event) => $options.cancelOrder(item.id), ["stop"])
                      }, "取消订单", 8, ["onClick"]),
                      vue.createElementVNode("button", {
                        class: "btn primary",
                        onClick: vue.withModifiers(($event) => $options.goPay(item), ["stop"])
                      }, "去支付", 8, ["onClick"])
                    ],
                    64
                    /* STABLE_FRAGMENT */
                  )) : vue.createCommentVNode("v-if", true),
                  item.status === "3" ? (vue.openBlock(), vue.createElementBlock("button", {
                    key: 1,
                    class: "btn primary",
                    onClick: vue.withModifiers(($event) => $options.confirmOrder(item.id), ["stop"])
                  }, "确认收货", 8, ["onClick"])) : vue.createCommentVNode("v-if", true)
                ])
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        vue.createCommentVNode(" 空状态 "),
        $data.orderList.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "empty"
        }, [
          vue.createElementVNode("text", null, "暂无订单")
        ])) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesOrderList = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["render", _sfc_render$f], ["__file", "C:/Users/shiba/Desktop/情趣用品/qingqu/pages/order/list.vue"]]);
  const getOrderDetail = (id) => {
    return request({
      url: `/orderDetails/${id}`,
      method: "GET"
    });
  };
  const _sfc_main$e = {
    data() {
      return {
        id: "",
        orderDetail: {
          id: "",
          orderId: "",
          productId: "",
          quantity: 0,
          price: 0,
          userAddressId: "",
          // 关联数据
          product: {},
          address: {}
        }
      };
    },
    computed: {
      orderStatusText() {
        return "订单状态";
      }
    },
    onLoad(options) {
      this.id = options.id;
      this.loadData();
    },
    methods: {
      async loadData() {
        try {
          const res = await getOrderDetail(this.id);
          if (res.status === 1) {
            this.orderDetail = res.data;
          }
        } catch (e) {
        }
      }
    }
  };
  function _sfc_render$e(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 订单状态 "),
      vue.createElementVNode("view", { class: "order-status" }, [
        vue.createElementVNode(
          "text",
          null,
          vue.toDisplayString($options.orderStatusText),
          1
          /* TEXT */
        )
      ]),
      vue.createCommentVNode(" 收货地址 "),
      vue.createElementVNode("view", { class: "address-section" }, [
        vue.createElementVNode("view", { class: "info" }, [
          vue.createElementVNode(
            "text",
            { class: "name" },
            vue.toDisplayString($data.orderDetail.address.recipientName),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            { class: "phone" },
            vue.toDisplayString($data.orderDetail.address.phone),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode(
          "text",
          { class: "detail" },
          vue.toDisplayString($data.orderDetail.address.address),
          1
          /* TEXT */
        )
      ]),
      vue.createCommentVNode(" 商品列表 "),
      vue.createElementVNode("view", { class: "goods-list" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.orderDetail.items, (item) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "goods-item",
              key: item.id
            }, [
              vue.createElementVNode("image", {
                src: item.product.image,
                mode: "aspectFill"
              }, null, 8, ["src"]),
              vue.createElementVNode("view", { class: "info" }, [
                vue.createElementVNode(
                  "text",
                  { class: "name" },
                  vue.toDisplayString(item.product.name),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "price" },
                  "¥" + vue.toDisplayString(item.price),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "quantity" },
                  "x" + vue.toDisplayString(item.quantity),
                  1
                  /* TEXT */
                )
              ])
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      vue.createCommentVNode(" 订单信息 "),
      vue.createElementVNode("view", { class: "order-info" }, [
        vue.createElementVNode("view", { class: "item" }, [
          vue.createElementVNode("text", null, "订单编号"),
          vue.createElementVNode(
            "text",
            null,
            vue.toDisplayString($data.orderDetail.orderId),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "item" }, [
          vue.createElementVNode("text", null, "创建时间"),
          vue.createElementVNode(
            "text",
            null,
            vue.toDisplayString($data.orderDetail.createTime),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "item" }, [
          vue.createElementVNode("text", null, "支付方式"),
          vue.createElementVNode(
            "text",
            null,
            vue.toDisplayString($data.orderDetail.paymentMethod),
            1
            /* TEXT */
          )
        ])
      ])
    ]);
  }
  const PagesOrderDetail = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["render", _sfc_render$e], ["__file", "C:/Users/shiba/Desktop/情趣用品/qingqu/pages/order/detail.vue"]]);
  const _sfc_main$d = {
    data() {
      return {
        form: {
          username: "",
          email: "",
          code: "",
          newPassword: ""
        },
        counting: false,
        count: 60
      };
    },
    methods: {
      async sendCode() {
        try {
          const res = await sendEmailCode({
            username: this.form.username,
            email: this.form.email
          });
          if (res.status === 1) {
            this.counting = true;
            const timer = setInterval(() => {
              if (this.count > 0) {
                this.count--;
              } else {
                clearInterval(timer);
                this.counting = false;
                this.count = 60;
              }
            }, 1e3);
          }
        } catch (e) {
        }
      },
      async handleReset() {
        try {
          const res = await resetPassword({
            username: this.form.username,
            newPassword: this.form.newPassword,
            emailCode: this.form.code
          });
          if (res.status === 1) {
            uni.showToast({
              title: "重置成功",
              icon: "success"
            });
            setTimeout(() => {
              uni.reLaunch({
                url: "/pages/login/login"
              });
            }, 1500);
          }
        } catch (e) {
        }
      }
    }
  };
  function _sfc_render$d(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "title" }, "重置密码"),
      vue.createElementVNode("view", { class: "form" }, [
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "label" }, "用户名"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              type: "text",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.form.username = $event),
              placeholder: "请输入用户名"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.form.username]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "label" }, "邮箱"),
          vue.createElementVNode("view", { class: "code-input" }, [
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                type: "text",
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.form.email = $event),
                placeholder: "请输入邮箱"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.form.email]
            ]),
            vue.createElementVNode("button", {
              class: "code-btn",
              disabled: $data.counting,
              onClick: _cache[2] || (_cache[2] = (...args) => $options.sendCode && $options.sendCode(...args))
            }, vue.toDisplayString($data.counting ? `${$data.count}s` : "获取验证码"), 9, ["disabled"])
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "label" }, "验证码"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              type: "text",
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.form.code = $event),
              placeholder: "请输入验证码"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.form.code]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "label" }, "新密码"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              type: "password",
              "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $data.form.newPassword = $event),
              placeholder: "请输入新密码"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.form.newPassword]
          ])
        ])
      ]),
      vue.createElementVNode("button", {
        class: "submit-btn",
        onClick: _cache[5] || (_cache[5] = (...args) => $options.handleReset && $options.handleReset(...args))
      }, "确认重置")
    ]);
  }
  const PagesResetPasswordResetPassword = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["render", _sfc_render$d], ["__file", "C:/Users/shiba/Desktop/情趣用品/qingqu/pages/reset-password/reset-password.vue"]]);
  const addAddress$1 = (data) => {
    return request({
      url: "/userAddress/insert",
      method: "POST",
      data
    });
  };
  const getAddressList$1 = (userId) => {
    return request({
      url: `/userAddress/findByUserId/${userId}`,
      method: "GET"
    });
  };
  const updateAddress$1 = (data) => {
    return request({
      url: "/userAddress/update",
      method: "PUT",
      data
    });
  };
  const deleteAddress$1 = (id) => {
    return request({
      url: `/userAddress/delete/${id}`,
      method: "DELETE"
    });
  };
  function getPayLink$1(params) {
    return request({
      url: "/epay/getPayLink",
      method: "GET",
      params,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
  }
  const queryPayStatus = (orderId) => {
    return request({
      url: "/epay/queryOrder",
      method: "GET",
      params: {
        outTradeNo: orderId
      }
    });
  };
  const notifyPayment = (params) => {
    return request({
      url: "/epay/notify",
      method: "POST",
      data: params,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      responseType: "text"
    });
  };
  const _sfc_main$c = {
    // 使用 easycom 自动导入，无需手动引入和注册
    data() {
      return {
        orderInfo: {
          products: [],
          totalAmount: 0
        },
        deliveryInfo: {
          type: "",
          // delivery-外卖配送，self-到店自提
          address: null,
          store: null
        },
        // 预设的自提柜信息
        lockerInfo: {
          name: "24小时自提柜",
          address: "北京市朝阳区三里屯SOHO B座1层",
          code: "SELF_PICKUP_001"
        },
        addressList: [],
        freight: 0,
        // 运费
        payTimer: null,
        // 支付状态查询定时器
        queryCount: 0,
        // 查询次数
        maxQueryCount: 60,
        // 最大查询次数（10分钟）
        orderId: ""
        // 当前支付的订单ID
      };
    },
    computed: {
      // 商品总额
      goodsAmount() {
        return this.orderInfo.products.reduce((total, item) => {
          return total + Number(item.price) * Number(item.quantity);
        }, 0).toFixed(2);
      },
      // 实付金额
      actualAmount() {
        return (Number(this.goodsAmount) + Number(this.freight)).toFixed(2);
      }
    },
    onLoad(options) {
      if (options.orderInfo) {
        try {
          this.orderInfo = JSON.parse(decodeURIComponent(options.orderInfo));
          formatAppLog("log", "at pages/order/create.vue:158", "订单信息:", this.orderInfo);
        } catch (e) {
          formatAppLog("error", "at pages/order/create.vue:160", "解析订单信息失败:", e);
          uni.showToast({
            title: "订单信息错误",
            icon: "none"
          });
        }
      }
      this.loadAddressList();
      this.showDeliveryTypeModal();
    },
    onUnload() {
      this.stopQueryPayStatus();
      uni.setStorageSync("tempOrderInfo", this.orderInfo);
    },
    methods: {
      // 获取订单商品名称
      getOrderName() {
        if (!this.orderInfo.products || this.orderInfo.products.length === 0) {
          return "商品订单";
        }
        const firstProduct = this.orderInfo.products[0];
        if (this.orderInfo.products.length === 1) {
          return firstProduct.name;
        }
        return `${firstProduct.name}等${this.orderInfo.products.length}件商品`;
      },
      // 加载地址列表
      async loadAddressList() {
        try {
          const userInfo = uni.getStorageSync("userInfo");
          if (!userInfo) {
            uni.showToast({
              title: "请先登录",
              icon: "none"
            });
            return;
          }
          const res = await getAddressList$1(userInfo.id);
          if (res.status === 1) {
            this.addressList = res.data;
            const defaultAddress = this.addressList.find((item) => item.isDefault);
            this.deliveryInfo.address = defaultAddress || this.addressList[0];
          }
        } catch (e) {
          formatAppLog("error", "at pages/order/create.vue:211", "获取地址列表失败:", e);
        }
      },
      // 显示配送方式选择弹窗
      showDeliveryTypeModal() {
        uni.showModal({
          title: "选择配送方式",
          content: "请选择您的配送方式",
          cancelText: "外卖配送",
          confirmText: "自提柜",
          success: (res) => {
            if (res.confirm) {
              this.deliveryInfo = {
                type: "self",
                store: this.lockerInfo,
                address: null
              };
              this.freight = 0;
            } else {
              this.deliveryInfo.type = "delivery";
              this.loadAddressList();
            }
          },
          fail: () => {
            this.deliveryInfo.type = "delivery";
            this.loadAddressList();
          }
        });
      },
      // 选择地址
      chooseAddress() {
        if (this.deliveryInfo.type === "self") {
          return;
        }
        uni.navigateTo({
          url: "/pages/address/address?type=select",
          events: {
            selectAddress: (data) => {
              this.deliveryInfo = data;
            }
          }
        });
      },
      // 提交订单
      async submitOrder() {
        if (this.deliveryInfo.type === "delivery" && !this.deliveryInfo.address) {
          uni.showToast({
            title: "请选择收货地址",
            icon: "none"
          });
          return;
        }
        try {
          const timestamp = Date.now();
          const random = Math.floor(Math.random() * 1e4);
          const orderId = `${timestamp}${random}`;
          const orderData = {
            id: orderId,
            // 添加订单ID
            userId: uni.getStorageSync("userInfo").id,
            totalAmount: this.actualAmount,
            address: this.deliveryInfo.address,
            products: this.orderInfo.products,
            deliveryType: this.deliveryInfo.type,
            freight: this.freight
          };
          const res = await createOrder(orderData);
          if (res.code === 1) {
            this.goPay(orderData.id);
          } else {
            uni.showToast({
              title: res.message || "创建订单失败",
              icon: "none"
            });
          }
        } catch (e) {
          formatAppLog("error", "at pages/order/create.vue:298", "创建订单失败:", e);
          uni.showToast({
            title: "创建订单失败",
            icon: "none"
          });
        }
      },
      // 去支付
      async goPay(orderId) {
        try {
          const payParams = {
            pid: "164878717",
            type: "alipay",
            out_trade_no: orderId,
            notify_url: "/epay/notify",
            return_url: "/epay/return",
            name: this.getOrderName(),
            // 获取商品名称
            money: Number(this.actualAmount).toFixed(2),
            sitename: "情趣商城"
          };
          const res = await getPayLink$1(payParams);
          formatAppLog("log", "at pages/order/create.vue:322", "支付响应:", res);
          if (res.code === 1) {
            window.open(res.data);
            uni.navigateTo({
              url: `/pages/payment/result?orderId=${orderId}&amount=${this.actualAmount}`
            });
          } else {
            uni.showToast({
              title: res.message || "获取支付链接失败",
              icon: "none"
            });
          }
        } catch (e) {
          formatAppLog("error", "at pages/order/create.vue:337", "发起支付失败:", e);
          uni.showToast({
            title: "发起支付失败",
            icon: "none"
          });
        }
      },
      // 开始查询支付状态
      startQueryPayStatus() {
        if (!this.orderId) {
          formatAppLog("error", "at pages/order/create.vue:348", "没有订单ID，无法查询支付状态");
          return;
        }
        this.queryCount = 0;
        this.queryPayStatus();
      },
      // 查询支付状态
      async queryPayStatus() {
        try {
          formatAppLog("log", "at pages/order/create.vue:358", "查询订单状态:", this.orderId);
          const res = await queryPayStatus(this.orderId);
          formatAppLog("log", "at pages/order/create.vue:360", "支付状态查询结果:", res);
          if (res.code === 1) {
            if (res.data && res.data.status === 1) {
              this.stopQueryPayStatus();
              uni.showToast({
                title: "支付成功",
                icon: "success"
              });
              setTimeout(() => {
                uni.redirectTo({
                  url: "/pages/order/list"
                });
              }, 1500);
              return;
            }
          }
          this.queryCount++;
          if (this.queryCount < this.maxQueryCount) {
            this.payTimer = setTimeout(() => {
              this.queryPayStatus();
            }, 3e3);
          } else {
            this.stopQueryPayStatus();
            uni.showModal({
              title: "支付超时",
              content: "是否继续支付?",
              success: (result) => {
                if (result.confirm) {
                  this.startQueryPayStatus();
                } else {
                  uni.navigateBack();
                }
              }
            });
          }
        } catch (e) {
          formatAppLog("error", "at pages/order/create.vue:402", "查询支付状态失败:", e);
          this.queryCount++;
          if (this.queryCount < this.maxQueryCount) {
            this.payTimer = setTimeout(() => {
              this.queryPayStatus();
            }, 3e3);
          }
        }
      },
      // 停止查询
      stopQueryPayStatus() {
        if (this.payTimer) {
          clearTimeout(this.payTimer);
          this.payTimer = null;
        }
      },
      // 打开支付链接
      openPayUrl() {
        if (this.payUrl) {
          window.location.href = this.payUrl;
        }
      },
      // 取消支付
      cancelPay() {
        this.stopQueryPayStatus();
        this.$refs.payPopup.close();
        uni.showModal({
          title: "提示",
          content: "是否放弃支付?",
          success: (res) => {
            if (res.confirm) {
              uni.navigateBack();
            } else {
              this.startQueryPayStatus();
            }
          }
        });
      }
    },
    onShow() {
      const payingOrderId = uni.getStorageSync("paying_order_id");
      if (payingOrderId) {
        this.queryPayStatus(payingOrderId);
      }
    },
    onHide() {
      this.stopQueryPayStatus();
    },
    onUnload() {
      this.stopQueryPayStatus();
      uni.setStorageSync("tempOrderInfo", this.orderInfo);
    }
  };
  function _sfc_render$c(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      vue.Fragment,
      null,
      [
        vue.createElementVNode("view", { class: "container" }, [
          vue.createCommentVNode(" 配送方式选择 "),
          vue.createElementVNode("view", { class: "delivery-type" }, [
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["type-item", { active: $data.deliveryInfo.type === "delivery" }]),
                onClick: _cache[0] || (_cache[0] = ($event) => _ctx.changeDeliveryType("delivery"))
              },
              [
                vue.createElementVNode("view", { class: "icon-wrap" }, [
                  vue.createElementVNode("text", { class: "iconfont icon-waimai" })
                ]),
                vue.createElementVNode("text", { class: "type-name" }, "外卖配送"),
                vue.createElementVNode("text", { class: "desc" }, "约30分钟送达")
              ],
              2
              /* CLASS */
            ),
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["type-item", { active: $data.deliveryInfo.type === "self" }]),
                onClick: _cache[1] || (_cache[1] = ($event) => _ctx.changeDeliveryType("self"))
              },
              [
                vue.createElementVNode("view", { class: "icon-wrap" }, [
                  vue.createElementVNode("text", { class: "iconfont icon-ziti" })
                ]),
                vue.createElementVNode("text", { class: "type-name" }, "自提柜取餐"),
                vue.createElementVNode("text", { class: "desc" }, "24小时自助取餐")
              ],
              2
              /* CLASS */
            )
          ]),
          vue.createCommentVNode(" 收货地址 "),
          $data.deliveryInfo.type === "delivery" ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "address-section",
            onClick: _cache[2] || (_cache[2] = (...args) => $options.chooseAddress && $options.chooseAddress(...args))
          }, [
            vue.createElementVNode("view", { class: "section-title" }, [
              vue.createElementVNode("text", { class: "iconfont icon-location" }),
              vue.createElementVNode("text", null, "配送地址")
            ]),
            $data.deliveryInfo.address ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "address-info"
            }, [
              vue.createElementVNode("view", { class: "user-info" }, [
                vue.createElementVNode(
                  "text",
                  { class: "name" },
                  vue.toDisplayString($data.deliveryInfo.address.recipient_name),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "phone" },
                  vue.toDisplayString($data.deliveryInfo.address.phone),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode(
                "view",
                { class: "address" },
                vue.toDisplayString($data.deliveryInfo.address.address),
                1
                /* TEXT */
              )
            ])) : (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "no-address"
            }, [
              vue.createElementVNode("text", null, "请选择收货地址")
            ])),
            vue.createElementVNode("text", { class: "arrow" }, ">")
          ])) : vue.createCommentVNode("v-if", true),
          vue.createCommentVNode(" 自提柜信息 "),
          $data.deliveryInfo.type === "self" ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "address-section"
          }, [
            vue.createElementVNode("view", { class: "section-title" }, [
              vue.createElementVNode("text", { class: "iconfont icon-locker" }),
              vue.createElementVNode("text", null, "自提柜信息")
            ]),
            $data.deliveryInfo.store ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "address-info"
            }, [
              vue.createElementVNode("view", { class: "user-info" }, [
                vue.createElementVNode(
                  "text",
                  { class: "name" },
                  vue.toDisplayString($data.deliveryInfo.store.name),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", { class: "tag" }, "24h"),
                vue.createElementVNode("text", { class: "time" }, "自助取餐")
              ]),
              vue.createElementVNode(
                "view",
                { class: "address" },
                vue.toDisplayString($data.deliveryInfo.store.address),
                1
                /* TEXT */
              )
            ])) : vue.createCommentVNode("v-if", true)
          ])) : vue.createCommentVNode("v-if", true),
          vue.createCommentVNode(" 商品列表 "),
          vue.createElementVNode("view", { class: "products-section" }, [
            vue.createElementVNode("view", { class: "section-title" }, [
              vue.createElementVNode("text", { class: "iconfont icon-shop" }),
              vue.createElementVNode("text", null, "商品信息")
            ]),
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.orderInfo.products, (item) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: "product-item",
                  key: item.id
                }, [
                  vue.createElementVNode("image", {
                    src: item.image,
                    mode: "aspectFill"
                  }, null, 8, ["src"]),
                  vue.createElementVNode("view", { class: "info" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "name" },
                      vue.toDisplayString(item.name),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("view", { class: "price-qty" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "price" },
                        "¥" + vue.toDisplayString(item.price),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "quantity" },
                        "x" + vue.toDisplayString(item.quantity),
                        1
                        /* TEXT */
                      )
                    ])
                  ])
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          vue.createCommentVNode(" 订单金额 "),
          vue.createElementVNode("view", { class: "amount-section" }, [
            vue.createElementVNode("view", { class: "amount-item" }, [
              vue.createElementVNode("text", null, "商品总额"),
              vue.createElementVNode(
                "text",
                null,
                "¥" + vue.toDisplayString($options.goodsAmount),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "amount-item" }, [
              vue.createElementVNode("text", null, "配送费"),
              vue.createElementVNode(
                "text",
                null,
                vue.toDisplayString($data.deliveryInfo.type === "self" ? "免配送费" : `¥${$data.freight}`),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "total" }, [
              vue.createElementVNode("text", null, "实付款"),
              vue.createElementVNode(
                "text",
                { class: "price" },
                "¥" + vue.toDisplayString($options.actualAmount),
                1
                /* TEXT */
              )
            ])
          ])
        ]),
        vue.createCommentVNode(" 底部提交栏 "),
        vue.createElementVNode("view", { class: "submit-bar" }, [
          vue.createElementVNode("view", { class: "total-amount" }, [
            vue.createElementVNode("text", null, "合计"),
            vue.createElementVNode(
              "text",
              { class: "price" },
              "¥" + vue.toDisplayString($options.actualAmount),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("button", {
            class: "submit-btn",
            onClick: _cache[3] || (_cache[3] = (...args) => $options.submitOrder && $options.submitOrder(...args))
          }, "提交订单")
        ])
      ],
      64
      /* STABLE_FRAGMENT */
    );
  }
  const PagesOrderCreate = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["render", _sfc_render$c], ["__file", "C:/Users/shiba/Desktop/情趣用品/qingqu/pages/order/create.vue"]]);
  const getAddressList = async (userId) => {
    try {
      const res = await request({
        url: `/userAddress/findByUserId/${userId}`,
        method: "GET"
      });
      return {
        code: res.code || 1,
        message: res.message || "success",
        data: res.data || []
      };
    } catch (error) {
      return {
        code: 0,
        message: error.message || "获取地址列表失败",
        data: null
      };
    }
  };
  const getAddressDetail = async (id) => {
    try {
      const res = await request({
        url: `/userAddress/findById/${id}`,
        method: "GET"
      });
      return {
        code: res.code || 1,
        message: res.message || "success",
        data: res.data || null
      };
    } catch (error) {
      return {
        code: 0,
        message: error.message || "获取地址详情失败",
        data: null
      };
    }
  };
  const addAddress = async (data) => {
    try {
      const res = await request({
        url: "/userAddress/insert",
        method: "POST",
        data
      });
      return {
        code: res.code || 1,
        message: res.message || "success",
        data: res.data || null
      };
    } catch (error) {
      return {
        code: 0,
        message: error.message || "新增地址失败",
        data: null
      };
    }
  };
  const updateAddress = async (data) => {
    try {
      const res = await request({
        url: "/userAddress/update",
        method: "PUT",
        data
      });
      return {
        code: res.code || 1,
        message: res.message || "success",
        data: res.data || null
      };
    } catch (error) {
      return {
        code: 0,
        message: error.message || "更新地址失败",
        data: null
      };
    }
  };
  const deleteAddress = async (id) => {
    try {
      const res = await request({
        url: `/userAddress/delete/${id}`,
        method: "DELETE"
      });
      return {
        code: res.code || 1,
        message: res.message || "success",
        data: null
      };
    } catch (error) {
      return {
        code: 0,
        message: error.message || "删除地址失败",
        data: null
      };
    }
  };
  const _sfc_main$b = {
    data() {
      return {
        addressList: [],
        fromOrder: false
        // 是否从订单页面进入
      };
    },
    onLoad(options) {
      if (options.from === "order") {
        this.fromOrder = true;
      }
    },
    onShow() {
      this.getAddresses();
    },
    methods: {
      async getAddresses() {
        try {
          const userInfo = uni.getStorageSync("userInfo");
          if (!userInfo)
            return;
          const res = await getAddressList(userInfo.id);
          if (res.code === 1) {
            this.addressList = res.data || [];
          } else {
            uni.showToast({
              title: res.message || "获取地址列表失败",
              icon: "none"
            });
          }
        } catch (e) {
          formatAppLog("error", "at pages/address/list.vue:69", "获取地址列表失败:", e);
          uni.showToast({
            title: "获取地址列表失败",
            icon: "none"
          });
        }
      },
      addAddress() {
        uni.navigateTo({
          url: "/pages/address/edit"
        });
      },
      editAddress(item) {
        uni.navigateTo({
          url: `/pages/address/edit?id=${item.id}`
        });
      },
      async deleteAddress(id) {
        uni.showModal({
          title: "提示",
          content: "确定要删除该地址吗？",
          success: async (res) => {
            if (res.confirm) {
              try {
                const res2 = await deleteAddress(id);
                if (res2.code === 1) {
                  uni.showToast({
                    title: "删除成功",
                    icon: "success"
                  });
                  this.getAddresses();
                } else {
                  uni.showToast({
                    title: res2.message || "删除失败",
                    icon: "none"
                  });
                }
              } catch (e) {
                formatAppLog("error", "at pages/address/list.vue:107", "删除地址失败:", e);
                uni.showToast({
                  title: "删除失败",
                  icon: "none"
                });
              }
            }
          }
        });
      },
      selectAddress(item) {
        if (this.fromOrder) {
          const pages = getCurrentPages();
          const prevPage = pages[pages.length - 2];
          prevPage.$vm.setAddress(item);
          uni.navigateBack();
        }
      }
    }
  };
  function _sfc_render$b(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 地址列表 "),
      vue.createElementVNode("view", { class: "address-list" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.addressList, (item) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "address-item",
              key: item.id,
              onClick: ($event) => $options.selectAddress(item)
            }, [
              vue.createElementVNode("view", { class: "info" }, [
                vue.createElementVNode("view", { class: "user" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "name" },
                    vue.toDisplayString(item.recipientName),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "phone" },
                    vue.toDisplayString(item.phone),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode(
                  "view",
                  { class: "address" },
                  vue.toDisplayString(item.address),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "actions" }, [
                vue.createElementVNode("text", {
                  class: "edit",
                  onClick: vue.withModifiers(($event) => $options.editAddress(item), ["stop"])
                }, "编辑", 8, ["onClick"]),
                vue.createElementVNode("text", {
                  class: "delete",
                  onClick: vue.withModifiers(($event) => $options.deleteAddress(item.id), ["stop"])
                }, "删除", 8, ["onClick"])
              ])
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      vue.createCommentVNode(" 空状态 "),
      $data.addressList.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "empty"
      }, [
        vue.createElementVNode("text", null, "暂无收货地址")
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 添加按钮 "),
      vue.createElementVNode("button", {
        class: "add-btn",
        onClick: _cache[0] || (_cache[0] = (...args) => $options.addAddress && $options.addAddress(...args))
      }, "新增地址")
    ]);
  }
  const PagesAddressList = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["render", _sfc_render$b], ["__file", "C:/Users/shiba/Desktop/情趣用品/qingqu/pages/address/list.vue"]]);
  const _sfc_main$a = {
    data() {
      return {
        form: {
          recipientName: "",
          phone: "",
          address: "",
          userId: ""
        },
        id: null
        // 编辑时的地址ID
      };
    },
    onLoad(options) {
      if (options.id) {
        this.id = options.id;
        this.getDetail();
      }
      const userInfo = uni.getStorageSync("userInfo");
      if (userInfo) {
        this.form.userId = userInfo.id;
      }
    },
    methods: {
      async getDetail() {
        try {
          const res = await getAddressDetail(this.id);
          if (res.code === 1) {
            this.form = res.data || {};
          } else {
            uni.showToast({
              title: res.message || "获取地址详情失败",
              icon: "none"
            });
          }
        } catch (e) {
          formatAppLog("error", "at pages/address/edit.vue:74", "获取地址详情失败:", e);
          uni.showToast({
            title: "获取地址详情失败",
            icon: "none"
          });
        }
      },
      async handleSubmit() {
        if (!this.form.recipientName) {
          uni.showToast({
            title: "请输入收货人姓名",
            icon: "none"
          });
          return;
        }
        if (!this.form.phone) {
          uni.showToast({
            title: "请输入手机号码",
            icon: "none"
          });
          return;
        }
        if (!this.form.address) {
          uni.showToast({
            title: "请输入详细地址",
            icon: "none"
          });
          return;
        }
        try {
          const api = this.id ? updateAddress : addAddress;
          const res = await api(this.form);
          if (res.code === 1) {
            uni.showToast({
              title: this.id ? "修改成功" : "添加成功",
              icon: "success"
            });
            setTimeout(() => {
              uni.navigateBack();
            }, 1500);
          } else {
            uni.showToast({
              title: res.message || (this.id ? "修改失败" : "添加失败"),
              icon: "none"
            });
          }
        } catch (e) {
          formatAppLog("error", "at pages/address/edit.vue:123", "保存地址失败:", e);
          uni.showToast({
            title: this.id ? "修改失败" : "添加失败",
            icon: "none"
          });
        }
      }
    }
  };
  function _sfc_render$a(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "form" }, [
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "label" }, "收货人"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              type: "text",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.form.recipientName = $event),
              placeholder: "请输入收货人姓名"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.form.recipientName]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "label" }, "手机号码"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              type: "number",
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.form.phone = $event),
              placeholder: "请输入手机号码"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.form.phone]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "label" }, "详细地址"),
          vue.withDirectives(vue.createElementVNode(
            "textarea",
            {
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.form.address = $event),
              placeholder: "请输入详细地址"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.form.address]
          ])
        ])
      ]),
      vue.createElementVNode("button", {
        class: "submit-btn",
        onClick: _cache[3] || (_cache[3] = (...args) => $options.handleSubmit && $options.handleSubmit(...args))
      }, "保存")
    ]);
  }
  const PagesAddressEdit = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$a], ["__file", "C:/Users/shiba/Desktop/情趣用品/qingqu/pages/address/edit.vue"]]);
  const _sfc_main$9 = {
    data() {
      return {
        orderNo: "",
        orderAmount: 0,
        selectedMethod: "wxpay",
        paymentMethods: [
          {
            id: "wxpay",
            name: "微信支付",
            icon: "/static/images/payment/wxpay.png"
          },
          {
            id: "alipay",
            name: "支付宝支付",
            icon: "/static/images/payment/alipay.png"
          }
        ]
      };
    },
    onLoad(options) {
      if (options.orderNo && options.amount) {
        this.orderNo = options.orderNo;
        this.orderAmount = options.amount;
      } else {
        uni.showToast({
          title: "订单信息错误",
          icon: "none"
        });
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      }
    },
    methods: {
      selectMethod(item) {
        this.selectedMethod = item.id;
      },
      async handlePay() {
        if (!this.selectedMethod) {
          uni.showToast({
            title: "请选择支付方式",
            icon: "none"
          });
          return;
        }
        try {
          const paymentData = {
            pid: "164878717",
            type: this.selectedMethod === "wxpay" ? "wxpay" : "alipay",
            out_trade_no: this.orderNo,
            notify_url: "/epay/notify",
            return_url: "/epay/return",
            name: "商品订单",
            money: Number(this.orderAmount).toFixed(2),
            sitename: "情趣商城"
          };
          const res = await getPayLink$1(paymentData);
          if (res.code === 1) {
            window.location.href = res.data;
          } else {
            throw new Error(res.message || "创建支付失败");
          }
        } catch (e) {
          formatAppLog("error", "at pages/payment/index.vue:106", "创建支付记录失败:", e);
          this.payFail();
        }
      },
      payFail() {
        uni.showToast({
          title: "支付失败",
          icon: "none"
        });
      }
    }
  };
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 订单信息 "),
      vue.createElementVNode("view", { class: "order-info" }, [
        vue.createElementVNode("view", { class: "amount" }, [
          vue.createElementVNode("text", { class: "label" }, "支付金额"),
          vue.createElementVNode(
            "text",
            { class: "value" },
            "¥" + vue.toDisplayString($data.orderAmount),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "order-no" }, [
          vue.createElementVNode("text", { class: "label" }, "订单编号"),
          vue.createElementVNode(
            "text",
            { class: "value" },
            vue.toDisplayString($data.orderNo),
            1
            /* TEXT */
          )
        ])
      ]),
      vue.createCommentVNode(" 支付方式 "),
      vue.createElementVNode("view", { class: "payment-methods" }, [
        vue.createElementVNode("view", { class: "title" }, "选择支付方式"),
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.paymentMethods, (item, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "method-item",
              key: index,
              onClick: ($event) => $options.selectMethod(item)
            }, [
              vue.createElementVNode("image", {
                src: item.icon,
                mode: "aspectFit",
                class: "icon"
              }, null, 8, ["src"]),
              vue.createElementVNode(
                "text",
                { class: "name" },
                vue.toDisplayString(item.name),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                {
                  class: vue.normalizeClass(["iconfont icon-check", { active: $data.selectedMethod === item.id }])
                },
                null,
                2
                /* CLASS */
              )
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      vue.createCommentVNode(" 支付按钮 "),
      vue.createElementVNode("button", {
        class: "pay-btn",
        onClick: _cache[0] || (_cache[0] = (...args) => $options.handlePay && $options.handlePay(...args))
      }, "确认支付")
    ]);
  }
  const PagesPaymentIndex = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$9], ["__file", "C:/Users/shiba/Desktop/情趣用品/qingqu/pages/payment/index.vue"]]);
  const _sfc_main$8 = {
    data() {
      return {
        keyword: "",
        searchResults: [],
        hasSearched: false
      };
    },
    methods: {
      async handleSearch() {
        if (!this.keyword.trim())
          return;
        try {
          formatAppLog("log", "at pages/search/search.vue:62", "搜索参数:", {
            keyword: this.keyword.trim(),
            page: 1,
            size: 10
          });
          const res = await searchProducts(
            this.keyword.trim(),
            1,
            10
          );
          this.hasSearched = true;
          if (res.code === 1 && res.data) {
            this.searchResults = res.data.map((item) => ({
              ...item,
              image: item.image || "/static/images/default.png"
            }));
            formatAppLog("log", "at pages/search/search.vue:80", "搜索结果:", this.searchResults);
          } else {
            this.searchResults = [];
            formatAppLog("log", "at pages/search/search.vue:83", "搜索返回空结果");
          }
        } catch (e) {
          formatAppLog("error", "at pages/search/search.vue:86", "搜索失败:", e);
          uni.showToast({
            title: "搜索失败",
            icon: "none"
          });
        }
      },
      goDetail(id) {
        uni.navigateTo({
          url: `/pages/product/detail?id=${id}`
        });
      }
    }
  };
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 搜索框 "),
      vue.createElementVNode("view", { class: "search-header" }, [
        vue.createElementVNode("view", { class: "search-input" }, [
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              type: "text",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.keyword = $event),
              placeholder: "搜索商品",
              onConfirm: _cache[1] || (_cache[1] = (...args) => $options.handleSearch && $options.handleSearch(...args)),
              focus: ""
            },
            null,
            544
            /* NEED_HYDRATION, NEED_PATCH */
          ), [
            [vue.vModelText, $data.keyword]
          ]),
          vue.createElementVNode("text", {
            class: "search-btn",
            onClick: _cache[2] || (_cache[2] = (...args) => $options.handleSearch && $options.handleSearch(...args))
          }, "搜索")
        ])
      ]),
      vue.createCommentVNode(" 搜索结果 "),
      $data.searchResults.length > 0 ? (vue.openBlock(), vue.createElementBlock("scroll-view", {
        key: 0,
        "scroll-y": "",
        class: "search-results"
      }, [
        vue.createElementVNode("view", { class: "product-list" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.searchResults, (item) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "product-item",
                key: item.id,
                onClick: ($event) => $options.goDetail(item.id)
              }, [
                vue.createElementVNode("image", {
                  src: item.image || "/static/images/default.png",
                  mode: "aspectFill"
                }, null, 8, ["src"]),
                vue.createElementVNode("view", { class: "info" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "name" },
                    vue.toDisplayString(item.name),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "desc" },
                    vue.toDisplayString(item.description),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("view", { class: "price-wrap" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "price" },
                      "¥" + vue.toDisplayString(item.price),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "stock" },
                      "库存: " + vue.toDisplayString(item.stock),
                      1
                      /* TEXT */
                    )
                  ])
                ])
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])) : $data.hasSearched ? (vue.openBlock(), vue.createElementBlock(
        vue.Fragment,
        { key: 1 },
        [
          vue.createCommentVNode(" 空状态 "),
          vue.createElementVNode("view", { class: "empty" }, [
            vue.createElementVNode("text", null, "未找到相关商品")
          ])
        ],
        2112
        /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
      )) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesSearchSearch = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$8], ["__file", "C:/Users/shiba/Desktop/情趣用品/qingqu/pages/search/search.vue"]]);
  const _imports_0 = "/static/images/logo.png";
  const _sfc_main$7 = {};
  function _sfc_render$7(_ctx, _cache) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "logo" }, [
        vue.createElementVNode("image", {
          src: _imports_0,
          mode: "aspectFit"
        })
      ]),
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("view", { class: "title" }, "关于我们"),
        vue.createElementVNode("view", { class: "text" }, " 这是一个示例商城应用，提供商品浏览、购物车、订单管理等功能。 "),
        vue.createElementVNode("view", { class: "version" }, [
          vue.createElementVNode("text", null, "当前版本: v1.0.0")
        ])
      ])
    ]);
  }
  const PagesAboutAbout = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$7], ["__file", "C:/Users/shiba/Desktop/情趣用品/qingqu/pages/about/about.vue"]]);
  const _sfc_main$6 = {
    data() {
      return {
        notificationEnabled: true
      };
    },
    methods: {
      goProfile() {
        uni.navigateTo({
          url: "/pages/user/profile"
        });
      },
      goSecurity() {
        uni.navigateTo({
          url: "/pages/user/security"
        });
      },
      toggleNotification(e) {
        this.notificationEnabled = e.detail.value;
      },
      clearCache() {
        uni.showModal({
          title: "提示",
          content: "确定要清除缓存吗？",
          success: (res) => {
            if (res.confirm) {
              uni.clearStorageSync();
              uni.showToast({
                title: "清除成功",
                icon: "success"
              });
            }
          }
        });
      },
      logout() {
        uni.showModal({
          title: "提示",
          content: "确定要退出登录吗？",
          success: (res) => {
            if (res.confirm) {
              uni.clearStorageSync();
              uni.reLaunch({
                url: "/pages/login/login"
              });
            }
          }
        });
      }
    }
  };
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "list" }, [
        vue.createCommentVNode(" 个人信息 "),
        vue.createElementVNode("view", {
          class: "item",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.goProfile && $options.goProfile(...args))
        }, [
          vue.createElementVNode("text", null, "个人信息"),
          vue.createElementVNode("text", { class: "iconfont icon-right" })
        ]),
        vue.createCommentVNode(" 账号安全 "),
        vue.createElementVNode("view", {
          class: "item",
          onClick: _cache[1] || (_cache[1] = (...args) => $options.goSecurity && $options.goSecurity(...args))
        }, [
          vue.createElementVNode("text", null, "账号安全"),
          vue.createElementVNode("text", { class: "iconfont icon-right" })
        ]),
        vue.createCommentVNode(" 通知设置 "),
        vue.createElementVNode("view", { class: "item" }, [
          vue.createElementVNode("text", null, "推送通知"),
          vue.createElementVNode("switch", {
            checked: $data.notificationEnabled,
            onChange: _cache[2] || (_cache[2] = (...args) => $options.toggleNotification && $options.toggleNotification(...args))
          }, null, 40, ["checked"])
        ]),
        vue.createCommentVNode(" 清除缓存 "),
        vue.createElementVNode("view", {
          class: "item",
          onClick: _cache[3] || (_cache[3] = (...args) => $options.clearCache && $options.clearCache(...args))
        }, [
          vue.createElementVNode("text", null, "清除缓存"),
          vue.createElementVNode("text", { class: "iconfont icon-right" })
        ])
      ]),
      vue.createCommentVNode(" 退出登录 "),
      vue.createElementVNode("button", {
        class: "logout-btn",
        onClick: _cache[4] || (_cache[4] = (...args) => $options.logout && $options.logout(...args))
      }, "退出登录")
    ]);
  }
  const PagesUserSettings = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$6], ["__file", "C:/Users/shiba/Desktop/情趣用品/qingqu/pages/user/settings.vue"]]);
  const uploadFile = (file) => {
    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: baseURL + "/upload",
        // 从配置中获取baseURL
        filePath: file,
        name: "image",
        success: (res) => {
          try {
            const data = JSON.parse(res.data);
            if (data.status === 1) {
              resolve(data);
            } else {
              uni.showToast({
                title: data.message || "上传失败",
                icon: "none"
              });
              reject(new Error(data.message));
            }
          } catch (e) {
            uni.showToast({
              title: "上传失败",
              icon: "none"
            });
            reject(e);
          }
        },
        fail: (err) => {
          uni.showToast({
            title: "上传失败",
            icon: "none"
          });
          reject(err);
        }
      });
    });
  };
  const chooseImage = (count = 1) => {
    return new Promise((resolve, reject) => {
      uni.chooseImage({
        count,
        sizeType: ["original", "compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          resolve(res.tempFilePaths);
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  };
  const _sfc_main$5 = {
    data() {
      return {
        userInfo: {},
        form: {
          name: "",
          phone: "",
          email: ""
        }
      };
    },
    onShow() {
      this.getUserInfo();
    },
    methods: {
      async getUserInfo() {
        try {
          const username = uni.getStorageSync("username");
          if (!username)
            return;
          const res = await getUserInfo(username);
          if (res.status === 1) {
            this.userInfo = res.data;
            this.form = {
              name: res.data.name || "",
              phone: res.data.phone || "",
              email: res.data.email || ""
            };
          }
        } catch (e) {
          formatAppLog("error", "at pages/user/profile.vue:88", "获取用户信息失败:", e);
        }
      },
      async changeAvatar() {
        try {
          const files = await chooseImage(1);
          if (files.length > 0) {
            uni.showLoading({
              title: "上传中..."
            });
            const res = await uploadFile(files[0]);
            if (res.status === 1) {
              await updateUserInfo({
                ...this.userInfo,
                profilePicture: res.data
              });
              this.getUserInfo();
              uni.showToast({
                title: "更新成功",
                icon: "success"
              });
            }
          }
        } catch (e) {
          formatAppLog("error", "at pages/user/profile.vue:116", "更换头像失败:", e);
        } finally {
          uni.hideLoading();
        }
      },
      async handleSave() {
        try {
          const res = await updateUserInfo({
            ...this.userInfo,
            ...this.form
          });
          if (res.status === 1) {
            uni.showToast({
              title: "保存成功",
              icon: "success"
            });
            setTimeout(() => {
              uni.navigateBack();
            }, 1500);
          }
        } catch (e) {
          formatAppLog("error", "at pages/user/profile.vue:138", "保存失败:", e);
        }
      }
    }
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 头像 "),
      vue.createElementVNode("view", { class: "avatar-box" }, [
        vue.createElementVNode("image", {
          src: $data.userInfo.profilePicture || "/static/images/default-avatar.png",
          mode: "aspectFill",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.changeAvatar && $options.changeAvatar(...args))
        }, null, 8, ["src"]),
        vue.createElementVNode("text", null, "点击更换头像")
      ]),
      vue.createCommentVNode(" 个人信息表单 "),
      vue.createElementVNode("view", { class: "form" }, [
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "label" }, "用户名"),
          vue.createElementVNode(
            "text",
            { class: "value" },
            vue.toDisplayString($data.userInfo.username),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "label" }, "昵称"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              type: "text",
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.form.name = $event),
              placeholder: "请输入昵称"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.form.name]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "label" }, "手机号"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              type: "number",
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.form.phone = $event),
              placeholder: "请输入手机号"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.form.phone]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "label" }, "邮箱"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              type: "text",
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.form.email = $event),
              placeholder: "请输入邮箱"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.form.email]
          ])
        ])
      ]),
      vue.createCommentVNode(" 保存按钮 "),
      vue.createElementVNode("button", {
        class: "save-btn",
        onClick: _cache[4] || (_cache[4] = (...args) => $options.handleSave && $options.handleSave(...args))
      }, "保存")
    ]);
  }
  const PagesUserProfile = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$5], ["__file", "C:/Users/shiba/Desktop/情趣用品/qingqu/pages/user/profile.vue"]]);
  class MPAnimation {
    constructor(options, _this) {
      this.options = options;
      this.animation = uni.createAnimation({
        ...options
      });
      this.currentStepAnimates = {};
      this.next = 0;
      this.$ = _this;
    }
    _nvuePushAnimates(type, args) {
      let aniObj = this.currentStepAnimates[this.next];
      let styles = {};
      if (!aniObj) {
        styles = {
          styles: {},
          config: {}
        };
      } else {
        styles = aniObj;
      }
      if (animateTypes1.includes(type)) {
        if (!styles.styles.transform) {
          styles.styles.transform = "";
        }
        let unit = "";
        if (type === "rotate") {
          unit = "deg";
        }
        styles.styles.transform += `${type}(${args + unit}) `;
      } else {
        styles.styles[type] = `${args}`;
      }
      this.currentStepAnimates[this.next] = styles;
    }
    _animateRun(styles = {}, config = {}) {
      let ref = this.$.$refs["ani"].ref;
      if (!ref)
        return;
      return new Promise((resolve, reject) => {
        nvueAnimation.transition(ref, {
          styles,
          ...config
        }, (res) => {
          resolve();
        });
      });
    }
    _nvueNextAnimate(animates, step = 0, fn) {
      let obj = animates[step];
      if (obj) {
        let {
          styles,
          config
        } = obj;
        this._animateRun(styles, config).then(() => {
          step += 1;
          this._nvueNextAnimate(animates, step, fn);
        });
      } else {
        this.currentStepAnimates = {};
        typeof fn === "function" && fn();
        this.isEnd = true;
      }
    }
    step(config = {}) {
      this.animation.step(config);
      return this;
    }
    run(fn) {
      this.$.animationData = this.animation.export();
      this.$.timer = setTimeout(() => {
        typeof fn === "function" && fn();
      }, this.$.durationTime);
    }
  }
  const animateTypes1 = [
    "matrix",
    "matrix3d",
    "rotate",
    "rotate3d",
    "rotateX",
    "rotateY",
    "rotateZ",
    "scale",
    "scale3d",
    "scaleX",
    "scaleY",
    "scaleZ",
    "skew",
    "skewX",
    "skewY",
    "translate",
    "translate3d",
    "translateX",
    "translateY",
    "translateZ"
  ];
  const animateTypes2 = ["opacity", "backgroundColor"];
  const animateTypes3 = ["width", "height", "left", "right", "top", "bottom"];
  animateTypes1.concat(animateTypes2, animateTypes3).forEach((type) => {
    MPAnimation.prototype[type] = function(...args) {
      this.animation[type](...args);
      return this;
    };
  });
  function createAnimation(option, _this) {
    if (!_this)
      return;
    clearTimeout(_this.timer);
    return new MPAnimation(option, _this);
  }
  const _sfc_main$4 = {
    name: "uniTransition",
    emits: ["click", "change"],
    props: {
      show: {
        type: Boolean,
        default: false
      },
      modeClass: {
        type: [Array, String],
        default() {
          return "fade";
        }
      },
      duration: {
        type: Number,
        default: 300
      },
      styles: {
        type: Object,
        default() {
          return {};
        }
      },
      customClass: {
        type: String,
        default: ""
      },
      onceRender: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        isShow: false,
        transform: "",
        opacity: 1,
        animationData: {},
        durationTime: 300,
        config: {}
      };
    },
    watch: {
      show: {
        handler(newVal) {
          if (newVal) {
            this.open();
          } else {
            if (this.isShow) {
              this.close();
            }
          }
        },
        immediate: true
      }
    },
    computed: {
      // 生成样式数据
      stylesObject() {
        let styles = {
          ...this.styles,
          "transition-duration": this.duration / 1e3 + "s"
        };
        let transform = "";
        for (let i2 in styles) {
          let line = this.toLine(i2);
          transform += line + ":" + styles[i2] + ";";
        }
        return transform;
      },
      // 初始化动画条件
      transformStyles() {
        return "transform:" + this.transform + ";opacity:" + this.opacity + ";" + this.stylesObject;
      }
    },
    created() {
      this.config = {
        duration: this.duration,
        timingFunction: "ease",
        transformOrigin: "50% 50%",
        delay: 0
      };
      this.durationTime = this.duration;
    },
    methods: {
      /**
       *  ref 触发 初始化动画
       */
      init(obj = {}) {
        if (obj.duration) {
          this.durationTime = obj.duration;
        }
        this.animation = createAnimation(Object.assign(this.config, obj), this);
      },
      /**
       * 点击组件触发回调
       */
      onClick() {
        this.$emit("click", {
          detail: this.isShow
        });
      },
      /**
       * ref 触发 动画分组
       * @param {Object} obj
       */
      step(obj, config = {}) {
        if (!this.animation)
          return;
        for (let i2 in obj) {
          try {
            if (typeof obj[i2] === "object") {
              this.animation[i2](...obj[i2]);
            } else {
              this.animation[i2](obj[i2]);
            }
          } catch (e) {
            formatAppLog("error", "at node_modules/@dcloudio/uni-ui/lib/uni-transition/uni-transition.vue:148", `方法 ${i2} 不存在`);
          }
        }
        this.animation.step(config);
        return this;
      },
      /**
       *  ref 触发 执行动画
       */
      run(fn) {
        if (!this.animation)
          return;
        this.animation.run(fn);
      },
      // 开始过度动画
      open() {
        clearTimeout(this.timer);
        this.transform = "";
        this.isShow = true;
        let { opacity, transform } = this.styleInit(false);
        if (typeof opacity !== "undefined") {
          this.opacity = opacity;
        }
        this.transform = transform;
        this.$nextTick(() => {
          this.timer = setTimeout(() => {
            this.animation = createAnimation(this.config, this);
            this.tranfromInit(false).step();
            this.animation.run();
            this.$emit("change", {
              detail: this.isShow
            });
          }, 20);
        });
      },
      // 关闭过度动画
      close(type) {
        if (!this.animation)
          return;
        this.tranfromInit(true).step().run(() => {
          this.isShow = false;
          this.animationData = null;
          this.animation = null;
          let { opacity, transform } = this.styleInit(false);
          this.opacity = opacity || 1;
          this.transform = transform;
          this.$emit("change", {
            detail: this.isShow
          });
        });
      },
      // 处理动画开始前的默认样式
      styleInit(type) {
        let styles = {
          transform: ""
        };
        let buildStyle = (type2, mode) => {
          if (mode === "fade") {
            styles.opacity = this.animationType(type2)[mode];
          } else {
            styles.transform += this.animationType(type2)[mode] + " ";
          }
        };
        if (typeof this.modeClass === "string") {
          buildStyle(type, this.modeClass);
        } else {
          this.modeClass.forEach((mode) => {
            buildStyle(type, mode);
          });
        }
        return styles;
      },
      // 处理内置组合动画
      tranfromInit(type) {
        let buildTranfrom = (type2, mode) => {
          let aniNum = null;
          if (mode === "fade") {
            aniNum = type2 ? 0 : 1;
          } else {
            aniNum = type2 ? "-100%" : "0";
            if (mode === "zoom-in") {
              aniNum = type2 ? 0.8 : 1;
            }
            if (mode === "zoom-out") {
              aniNum = type2 ? 1.2 : 1;
            }
            if (mode === "slide-right") {
              aniNum = type2 ? "100%" : "0";
            }
            if (mode === "slide-bottom") {
              aniNum = type2 ? "100%" : "0";
            }
          }
          this.animation[this.animationMode()[mode]](aniNum);
        };
        if (typeof this.modeClass === "string") {
          buildTranfrom(type, this.modeClass);
        } else {
          this.modeClass.forEach((mode) => {
            buildTranfrom(type, mode);
          });
        }
        return this.animation;
      },
      animationType(type) {
        return {
          fade: type ? 0 : 1,
          "slide-top": `translateY(${type ? "0" : "-100%"})`,
          "slide-right": `translateX(${type ? "0" : "100%"})`,
          "slide-bottom": `translateY(${type ? "0" : "100%"})`,
          "slide-left": `translateX(${type ? "0" : "-100%"})`,
          "zoom-in": `scaleX(${type ? 1 : 0.8}) scaleY(${type ? 1 : 0.8})`,
          "zoom-out": `scaleX(${type ? 1 : 1.2}) scaleY(${type ? 1 : 1.2})`
        };
      },
      // 内置动画类型与实际动画对应字典
      animationMode() {
        return {
          fade: "opacity",
          "slide-top": "translateY",
          "slide-right": "translateX",
          "slide-bottom": "translateY",
          "slide-left": "translateX",
          "zoom-in": "scale",
          "zoom-out": "scale"
        };
      },
      // 驼峰转中横线
      toLine(name) {
        return name.replace(/([A-Z])/g, "-$1").toLowerCase();
      }
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.withDirectives((vue.openBlock(), vue.createElementBlock("view", {
      ref: "ani",
      animation: $data.animationData,
      class: vue.normalizeClass($props.customClass),
      style: vue.normalizeStyle($options.transformStyles),
      onClick: _cache[0] || (_cache[0] = (...args) => $options.onClick && $options.onClick(...args))
    }, [
      vue.renderSlot(_ctx.$slots, "default")
    ], 14, ["animation"])), [
      [vue.vShow, $data.isShow]
    ]);
  }
  const __easycom_0$1 = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$4], ["__file", "C:/Users/shiba/Desktop/情趣用品/qingqu/node_modules/@dcloudio/uni-ui/lib/uni-transition/uni-transition.vue"]]);
  const _sfc_main$3 = {
    name: "uniPopup",
    components: {},
    emits: ["change", "maskClick"],
    props: {
      // 开启动画
      animation: {
        type: Boolean,
        default: true
      },
      // 弹出层类型，可选值，top: 顶部弹出层；bottom：底部弹出层；center：全屏弹出层
      // message: 消息提示 ; dialog : 对话框
      type: {
        type: String,
        default: "center"
      },
      // maskClick
      isMaskClick: {
        type: Boolean,
        default: null
      },
      // TODO 2 个版本后废弃属性 ，使用 isMaskClick
      maskClick: {
        type: Boolean,
        default: null
      },
      backgroundColor: {
        type: String,
        default: "none"
      },
      safeArea: {
        type: Boolean,
        default: true
      },
      maskBackgroundColor: {
        type: String,
        default: "rgba(0, 0, 0, 0.4)"
      },
      borderRadius: {
        type: String
      }
    },
    watch: {
      /**
       * 监听type类型
       */
      type: {
        handler: function(type) {
          if (!this.config[type])
            return;
          this[this.config[type]](true);
        },
        immediate: true
      },
      isDesktop: {
        handler: function(newVal) {
          if (!this.config[newVal])
            return;
          this[this.config[this.type]](true);
        },
        immediate: true
      },
      /**
       * 监听遮罩是否可点击
       * @param {Object} val
       */
      maskClick: {
        handler: function(val) {
          this.mkclick = val;
        },
        immediate: true
      },
      isMaskClick: {
        handler: function(val) {
          this.mkclick = val;
        },
        immediate: true
      },
      // H5 下禁止底部滚动
      showPopup(show) {
      }
    },
    data() {
      return {
        duration: 300,
        ani: [],
        showPopup: false,
        showTrans: false,
        popupWidth: 0,
        popupHeight: 0,
        config: {
          top: "top",
          bottom: "bottom",
          center: "center",
          left: "left",
          right: "right",
          message: "top",
          dialog: "center",
          share: "bottom"
        },
        maskClass: {
          position: "fixed",
          bottom: 0,
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)"
        },
        transClass: {
          backgroundColor: "transparent",
          borderRadius: this.borderRadius || "0",
          position: "fixed",
          left: 0,
          right: 0
        },
        maskShow: true,
        mkclick: true,
        popupstyle: "top"
      };
    },
    computed: {
      getStyles() {
        let res = { backgroundColor: this.bg };
        if (this.borderRadius || "0") {
          res = Object.assign(res, { borderRadius: this.borderRadius });
        }
        return res;
      },
      isDesktop() {
        return this.popupWidth >= 500 && this.popupHeight >= 500;
      },
      bg() {
        if (this.backgroundColor === "" || this.backgroundColor === "none") {
          return "transparent";
        }
        return this.backgroundColor;
      }
    },
    mounted() {
      const fixSize = () => {
        const {
          windowWidth,
          windowHeight,
          windowTop,
          safeArea,
          screenHeight,
          safeAreaInsets
        } = uni.getSystemInfoSync();
        this.popupWidth = windowWidth;
        this.popupHeight = windowHeight + (windowTop || 0);
        if (safeArea && this.safeArea) {
          this.safeAreaInsets = safeAreaInsets.bottom;
        } else {
          this.safeAreaInsets = 0;
        }
      };
      fixSize();
    },
    // TODO vue3
    unmounted() {
      this.setH5Visible();
    },
    activated() {
      this.setH5Visible(!this.showPopup);
    },
    deactivated() {
      this.setH5Visible(true);
    },
    created() {
      if (this.isMaskClick === null && this.maskClick === null) {
        this.mkclick = true;
      } else {
        this.mkclick = this.isMaskClick !== null ? this.isMaskClick : this.maskClick;
      }
      if (this.animation) {
        this.duration = 300;
      } else {
        this.duration = 0;
      }
      this.messageChild = null;
      this.clearPropagation = false;
      this.maskClass.backgroundColor = this.maskBackgroundColor;
    },
    methods: {
      setH5Visible(visible = true) {
      },
      /**
       * 公用方法，不显示遮罩层
       */
      closeMask() {
        this.maskShow = false;
      },
      /**
       * 公用方法，遮罩层禁止点击
       */
      disableMask() {
        this.mkclick = false;
      },
      // TODO nvue 取消冒泡
      clear(e) {
        e.stopPropagation();
        this.clearPropagation = true;
      },
      open(direction) {
        if (this.showPopup) {
          return;
        }
        let innerType = ["top", "center", "bottom", "left", "right", "message", "dialog", "share"];
        if (!(direction && innerType.indexOf(direction) !== -1)) {
          direction = this.type;
        }
        if (!this.config[direction]) {
          formatAppLog("error", "at node_modules/@dcloudio/uni-ui/lib/uni-popup/uni-popup.vue:310", "缺少类型：", direction);
          return;
        }
        this[this.config[direction]]();
        this.$emit("change", {
          show: true,
          type: direction
        });
      },
      close(type) {
        this.showTrans = false;
        this.$emit("change", {
          show: false,
          type: this.type
        });
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.showPopup = false;
        }, 300);
      },
      // TODO 处理冒泡事件，头条的冒泡事件有问题 ，先这样兼容
      touchstart() {
        this.clearPropagation = false;
      },
      onTap() {
        if (this.clearPropagation) {
          this.clearPropagation = false;
          return;
        }
        this.$emit("maskClick");
        if (!this.mkclick)
          return;
        this.close();
      },
      /**
       * 顶部弹出样式处理
       */
      top(type) {
        this.popupstyle = this.isDesktop ? "fixforpc-top" : "top";
        this.ani = ["slide-top"];
        this.transClass = {
          position: "fixed",
          left: 0,
          right: 0,
          backgroundColor: this.bg,
          borderRadius: this.borderRadius || "0"
        };
        if (type)
          return;
        this.showPopup = true;
        this.showTrans = true;
        this.$nextTick(() => {
          this.showPoptrans();
          if (this.messageChild && this.type === "message") {
            this.messageChild.timerClose();
          }
        });
      },
      /**
       * 底部弹出样式处理
       */
      bottom(type) {
        this.popupstyle = "bottom";
        this.ani = ["slide-bottom"];
        this.transClass = {
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          paddingBottom: this.safeAreaInsets + "px",
          backgroundColor: this.bg,
          borderRadius: this.borderRadius || "0"
        };
        if (type)
          return;
        this.showPoptrans();
      },
      /**
       * 中间弹出样式处理
       */
      center(type) {
        this.popupstyle = "center";
        this.ani = ["zoom-out", "fade"];
        this.transClass = {
          position: "fixed",
          display: "flex",
          flexDirection: "column",
          bottom: 0,
          left: 0,
          right: 0,
          top: 0,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: this.borderRadius || "0"
        };
        if (type)
          return;
        this.showPoptrans();
      },
      left(type) {
        this.popupstyle = "left";
        this.ani = ["slide-left"];
        this.transClass = {
          position: "fixed",
          left: 0,
          bottom: 0,
          top: 0,
          backgroundColor: this.bg,
          borderRadius: this.borderRadius || "0",
          display: "flex",
          flexDirection: "column"
        };
        if (type)
          return;
        this.showPoptrans();
      },
      right(type) {
        this.popupstyle = "right";
        this.ani = ["slide-right"];
        this.transClass = {
          position: "fixed",
          bottom: 0,
          right: 0,
          top: 0,
          backgroundColor: this.bg,
          borderRadius: this.borderRadius || "0",
          display: "flex",
          flexDirection: "column"
        };
        if (type)
          return;
        this.showPoptrans();
      },
      showPoptrans() {
        this.$nextTick(() => {
          this.showPopup = true;
          this.showTrans = true;
        });
      }
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_transition = resolveEasycom(vue.resolveDynamicComponent("uni-transition"), __easycom_0$1);
    return $data.showPopup ? (vue.openBlock(), vue.createElementBlock(
      "view",
      {
        key: 0,
        class: vue.normalizeClass(["uni-popup", [$data.popupstyle, $options.isDesktop ? "fixforpc-z-index" : ""]])
      },
      [
        vue.createElementVNode(
          "view",
          {
            onTouchstart: _cache[1] || (_cache[1] = (...args) => $options.touchstart && $options.touchstart(...args))
          },
          [
            $data.maskShow ? (vue.openBlock(), vue.createBlock(_component_uni_transition, {
              key: "1",
              name: "mask",
              "mode-class": "fade",
              styles: $data.maskClass,
              duration: $data.duration,
              show: $data.showTrans,
              onClick: $options.onTap
            }, null, 8, ["styles", "duration", "show", "onClick"])) : vue.createCommentVNode("v-if", true),
            vue.createVNode(_component_uni_transition, {
              key: "2",
              "mode-class": $data.ani,
              name: "content",
              styles: $data.transClass,
              duration: $data.duration,
              show: $data.showTrans,
              onClick: $options.onTap
            }, {
              default: vue.withCtx(() => [
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(["uni-popup__wrapper", [$data.popupstyle]]),
                    style: vue.normalizeStyle($options.getStyles),
                    onClick: _cache[0] || (_cache[0] = (...args) => $options.clear && $options.clear(...args))
                  },
                  [
                    vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
                  ],
                  6
                  /* CLASS, STYLE */
                )
              ]),
              _: 3
              /* FORWARDED */
            }, 8, ["mode-class", "styles", "duration", "show", "onClick"])
          ],
          32
          /* NEED_HYDRATION */
        )
      ],
      2
      /* CLASS */
    )) : vue.createCommentVNode("v-if", true);
  }
  const __easycom_0 = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$3], ["__scopeId", "data-v-7db519c7"], ["__file", "C:/Users/shiba/Desktop/情趣用品/qingqu/node_modules/@dcloudio/uni-ui/lib/uni-popup/uni-popup.vue"]]);
  const r = [
    {
      code: "11",
      name: "北京市",
      children: [
        {
          code: "110101",
          name: "东城区"
        },
        {
          code: "110102",
          name: "西城区"
        },
        {
          code: "110105",
          name: "朝阳区"
        },
        {
          code: "110106",
          name: "丰台区"
        },
        {
          code: "110107",
          name: "石景山区"
        },
        {
          code: "110108",
          name: "海淀区"
        },
        {
          code: "110109",
          name: "门头沟区"
        },
        {
          code: "110111",
          name: "房山区"
        },
        {
          code: "110112",
          name: "通州区"
        },
        {
          code: "110113",
          name: "顺义区"
        },
        {
          code: "110114",
          name: "昌平区"
        },
        {
          code: "110115",
          name: "大兴区"
        },
        {
          code: "110116",
          name: "怀柔区"
        },
        {
          code: "110117",
          name: "平谷区"
        },
        {
          code: "110118",
          name: "密云区"
        },
        {
          code: "110119",
          name: "延庆区"
        }
      ]
    },
    {
      code: "12",
      name: "天津市",
      children: [
        {
          code: "120101",
          name: "和平区"
        },
        {
          code: "120102",
          name: "河东区"
        },
        {
          code: "120103",
          name: "河西区"
        },
        {
          code: "120104",
          name: "南开区"
        },
        {
          code: "120105",
          name: "河北区"
        },
        {
          code: "120106",
          name: "红桥区"
        },
        {
          code: "120110",
          name: "东丽区"
        },
        {
          code: "120111",
          name: "西青区"
        },
        {
          code: "120112",
          name: "津南区"
        },
        {
          code: "120113",
          name: "北辰区"
        },
        {
          code: "120114",
          name: "武清区"
        },
        {
          code: "120115",
          name: "宝坻区"
        },
        {
          code: "120116",
          name: "滨海新区"
        },
        {
          code: "120117",
          name: "宁河区"
        },
        {
          code: "120118",
          name: "静海区"
        },
        {
          code: "120119",
          name: "蓟州区"
        }
      ]
    },
    {
      code: "13",
      name: "河北省",
      children: [
        {
          code: "1301",
          name: "石家庄市"
        },
        {
          code: "1302",
          name: "唐山市"
        },
        {
          code: "1303",
          name: "秦皇岛市"
        },
        {
          code: "1304",
          name: "邯郸市"
        },
        {
          code: "1305",
          name: "邢台市"
        },
        {
          code: "1306",
          name: "保定市"
        },
        {
          code: "1307",
          name: "张家口市"
        },
        {
          code: "1308",
          name: "承德市"
        },
        {
          code: "1309",
          name: "沧州市"
        },
        {
          code: "1310",
          name: "廊坊市"
        },
        {
          code: "1311",
          name: "衡水市"
        }
      ]
    },
    {
      code: "14",
      name: "山西省",
      children: [
        {
          code: "1401",
          name: "太原市"
        },
        {
          code: "1402",
          name: "大同市"
        },
        {
          code: "1403",
          name: "阳泉市"
        },
        {
          code: "1404",
          name: "长治市"
        },
        {
          code: "1405",
          name: "晋城市"
        },
        {
          code: "1406",
          name: "朔州市"
        },
        {
          code: "1407",
          name: "晋中市"
        },
        {
          code: "1408",
          name: "运城市"
        },
        {
          code: "1409",
          name: "忻州市"
        },
        {
          code: "1410",
          name: "临汾市"
        },
        {
          code: "1411",
          name: "吕梁市"
        }
      ]
    },
    {
      code: "15",
      name: "内蒙古自治区",
      children: [
        {
          code: "1501",
          name: "呼和浩特市"
        },
        {
          code: "1502",
          name: "包头市"
        },
        {
          code: "1503",
          name: "乌海市"
        },
        {
          code: "1504",
          name: "赤峰市"
        },
        {
          code: "1505",
          name: "通辽市"
        },
        {
          code: "1506",
          name: "鄂尔多斯市"
        },
        {
          code: "1507",
          name: "呼伦贝尔市"
        },
        {
          code: "1508",
          name: "巴彦淖尔市"
        },
        {
          code: "1509",
          name: "乌兰察布市"
        },
        {
          code: "1522",
          name: "兴安盟"
        },
        {
          code: "1525",
          name: "锡林郭勒盟"
        },
        {
          code: "1529",
          name: "阿拉善盟"
        }
      ]
    },
    {
      code: "21",
      name: "辽宁省",
      children: [
        {
          code: "2101",
          name: "沈阳市"
        },
        {
          code: "2102",
          name: "大连市"
        },
        {
          code: "2103",
          name: "鞍山市"
        },
        {
          code: "2104",
          name: "抚顺市"
        },
        {
          code: "2105",
          name: "本溪市"
        },
        {
          code: "2106",
          name: "丹东市"
        },
        {
          code: "2107",
          name: "锦州市"
        },
        {
          code: "2108",
          name: "营口市"
        },
        {
          code: "2109",
          name: "阜新市"
        },
        {
          code: "2110",
          name: "辽阳市"
        },
        {
          code: "2111",
          name: "盘锦市"
        },
        {
          code: "2112",
          name: "铁岭市"
        },
        {
          code: "2113",
          name: "朝阳市"
        },
        {
          code: "2114",
          name: "葫芦岛市"
        }
      ]
    },
    {
      code: "22",
      name: "吉林省",
      children: [
        {
          code: "2201",
          name: "长春市"
        },
        {
          code: "2202",
          name: "吉林市"
        },
        {
          code: "2203",
          name: "四平市"
        },
        {
          code: "2204",
          name: "辽源市"
        },
        {
          code: "2205",
          name: "通化市"
        },
        {
          code: "2206",
          name: "白山市"
        },
        {
          code: "2207",
          name: "松原市"
        },
        {
          code: "2208",
          name: "白城市"
        },
        {
          code: "2224",
          name: "延边朝鲜族自治州"
        }
      ]
    },
    {
      code: "23",
      name: "黑龙江省",
      children: [
        {
          code: "2301",
          name: "哈尔滨市"
        },
        {
          code: "2302",
          name: "齐齐哈尔市"
        },
        {
          code: "2303",
          name: "鸡西市"
        },
        {
          code: "2304",
          name: "鹤岗市"
        },
        {
          code: "2305",
          name: "双鸭山市"
        },
        {
          code: "2306",
          name: "大庆市"
        },
        {
          code: "2307",
          name: "伊春市"
        },
        {
          code: "2308",
          name: "佳木斯市"
        },
        {
          code: "2309",
          name: "七台河市"
        },
        {
          code: "2310",
          name: "牡丹江市"
        },
        {
          code: "2311",
          name: "黑河市"
        },
        {
          code: "2312",
          name: "绥化市"
        },
        {
          code: "2327",
          name: "大兴安岭地区"
        }
      ]
    },
    {
      code: "31",
      name: "上海市",
      children: [
        {
          code: "310101",
          name: "黄浦区"
        },
        {
          code: "310104",
          name: "徐汇区"
        },
        {
          code: "310105",
          name: "长宁区"
        },
        {
          code: "310106",
          name: "静安区"
        },
        {
          code: "310107",
          name: "普陀区"
        },
        {
          code: "310109",
          name: "虹口区"
        },
        {
          code: "310110",
          name: "杨浦区"
        },
        {
          code: "310112",
          name: "闵行区"
        },
        {
          code: "310113",
          name: "宝山区"
        },
        {
          code: "310114",
          name: "嘉定区"
        },
        {
          code: "310115",
          name: "浦东新区"
        },
        {
          code: "310116",
          name: "金山区"
        },
        {
          code: "310117",
          name: "松江区"
        },
        {
          code: "310118",
          name: "青浦区"
        },
        {
          code: "310120",
          name: "奉贤区"
        },
        {
          code: "310151",
          name: "崇明区"
        }
      ]
    },
    {
      code: "32",
      name: "江苏省",
      children: [
        {
          code: "3201",
          name: "南京市"
        },
        {
          code: "3202",
          name: "无锡市"
        },
        {
          code: "3203",
          name: "徐州市"
        },
        {
          code: "3204",
          name: "常州市"
        },
        {
          code: "3205",
          name: "苏州市"
        },
        {
          code: "3206",
          name: "南通市"
        },
        {
          code: "3207",
          name: "连云港市"
        },
        {
          code: "3208",
          name: "淮安市"
        },
        {
          code: "3209",
          name: "盐城市"
        },
        {
          code: "3210",
          name: "扬州市"
        },
        {
          code: "3211",
          name: "镇江市"
        },
        {
          code: "3212",
          name: "泰州市"
        },
        {
          code: "3213",
          name: "宿迁市"
        }
      ]
    },
    {
      code: "33",
      name: "浙江省",
      children: [
        {
          code: "3301",
          name: "杭州市"
        },
        {
          code: "3302",
          name: "宁波市"
        },
        {
          code: "3303",
          name: "温州市"
        },
        {
          code: "3304",
          name: "嘉兴市"
        },
        {
          code: "3305",
          name: "湖州市"
        },
        {
          code: "3306",
          name: "绍兴市"
        },
        {
          code: "3307",
          name: "金华市"
        },
        {
          code: "3308",
          name: "衢州市"
        },
        {
          code: "3309",
          name: "舟山市"
        },
        {
          code: "3310",
          name: "台州市"
        },
        {
          code: "3311",
          name: "丽水市"
        }
      ]
    },
    {
      code: "34",
      name: "安徽省",
      children: [
        {
          code: "3401",
          name: "合肥市"
        },
        {
          code: "3402",
          name: "芜湖市"
        },
        {
          code: "3403",
          name: "蚌埠市"
        },
        {
          code: "3404",
          name: "淮南市"
        },
        {
          code: "3405",
          name: "马鞍山市"
        },
        {
          code: "3406",
          name: "淮北市"
        },
        {
          code: "3407",
          name: "铜陵市"
        },
        {
          code: "3408",
          name: "安庆市"
        },
        {
          code: "3410",
          name: "黄山市"
        },
        {
          code: "3411",
          name: "滁州市"
        },
        {
          code: "3412",
          name: "阜阳市"
        },
        {
          code: "3413",
          name: "宿州市"
        },
        {
          code: "3415",
          name: "六安市"
        },
        {
          code: "3416",
          name: "亳州市"
        },
        {
          code: "3417",
          name: "池州市"
        },
        {
          code: "3418",
          name: "宣城市"
        }
      ]
    },
    {
      code: "35",
      name: "福建省",
      children: [
        {
          code: "3501",
          name: "福州市"
        },
        {
          code: "3502",
          name: "厦门市"
        },
        {
          code: "3503",
          name: "莆田市"
        },
        {
          code: "3504",
          name: "三明市"
        },
        {
          code: "3505",
          name: "泉州市"
        },
        {
          code: "3506",
          name: "漳州市"
        },
        {
          code: "3507",
          name: "南平市"
        },
        {
          code: "3508",
          name: "龙岩市"
        },
        {
          code: "3509",
          name: "宁德市"
        }
      ]
    },
    {
      code: "36",
      name: "江西省",
      children: [
        {
          code: "3601",
          name: "南昌市"
        },
        {
          code: "3602",
          name: "景德镇市"
        },
        {
          code: "3603",
          name: "萍乡市"
        },
        {
          code: "3604",
          name: "九江市"
        },
        {
          code: "3605",
          name: "新余市"
        },
        {
          code: "3606",
          name: "鹰潭市"
        },
        {
          code: "3607",
          name: "赣州市"
        },
        {
          code: "3608",
          name: "吉安市"
        },
        {
          code: "3609",
          name: "宜春市"
        },
        {
          code: "3610",
          name: "抚州市"
        },
        {
          code: "3611",
          name: "上饶市"
        }
      ]
    },
    {
      code: "37",
      name: "山东省",
      children: [
        {
          code: "3701",
          name: "济南市"
        },
        {
          code: "3702",
          name: "青岛市"
        },
        {
          code: "3703",
          name: "淄博市"
        },
        {
          code: "3704",
          name: "枣庄市"
        },
        {
          code: "3705",
          name: "东营市"
        },
        {
          code: "3706",
          name: "烟台市"
        },
        {
          code: "3707",
          name: "潍坊市"
        },
        {
          code: "3708",
          name: "济宁市"
        },
        {
          code: "3709",
          name: "泰安市"
        },
        {
          code: "3710",
          name: "威海市"
        },
        {
          code: "3711",
          name: "日照市"
        },
        {
          code: "3713",
          name: "临沂市"
        },
        {
          code: "3714",
          name: "德州市"
        },
        {
          code: "3715",
          name: "聊城市"
        },
        {
          code: "3716",
          name: "滨州市"
        },
        {
          code: "3717",
          name: "菏泽市"
        }
      ]
    },
    {
      code: "41",
      name: "河南省",
      children: [
        {
          code: "4101",
          name: "郑州市"
        },
        {
          code: "4102",
          name: "开封市"
        },
        {
          code: "4103",
          name: "洛阳市"
        },
        {
          code: "4104",
          name: "平顶山市"
        },
        {
          code: "4105",
          name: "安阳市"
        },
        {
          code: "4106",
          name: "鹤壁市"
        },
        {
          code: "4107",
          name: "新乡市"
        },
        {
          code: "4108",
          name: "焦作市"
        },
        {
          code: "4109",
          name: "濮阳市"
        },
        {
          code: "4110",
          name: "许昌市"
        },
        {
          code: "4111",
          name: "漯河市"
        },
        {
          code: "4112",
          name: "三门峡市"
        },
        {
          code: "4113",
          name: "南阳市"
        },
        {
          code: "4114",
          name: "商丘市"
        },
        {
          code: "4115",
          name: "信阳市"
        },
        {
          code: "4116",
          name: "周口市"
        },
        {
          code: "4117",
          name: "驻马店市"
        },
        {
          code: "419001",
          name: "济源市"
        }
      ]
    },
    {
      code: "42",
      name: "湖北省",
      children: [
        {
          code: "4201",
          name: "武汉市"
        },
        {
          code: "4202",
          name: "黄石市"
        },
        {
          code: "4203",
          name: "十堰市"
        },
        {
          code: "4205",
          name: "宜昌市"
        },
        {
          code: "4206",
          name: "襄阳市"
        },
        {
          code: "4207",
          name: "鄂州市"
        },
        {
          code: "4208",
          name: "荆门市"
        },
        {
          code: "4209",
          name: "孝感市"
        },
        {
          code: "4210",
          name: "荆州市"
        },
        {
          code: "4211",
          name: "黄冈市"
        },
        {
          code: "4212",
          name: "咸宁市"
        },
        {
          code: "4213",
          name: "随州市"
        },
        {
          code: "4228",
          name: "恩施土家族苗族自治州"
        },
        {
          code: "429004",
          name: "仙桃市"
        },
        {
          code: "429005",
          name: "潜江市"
        },
        {
          code: "429006",
          name: "天门市"
        },
        {
          code: "429021",
          name: "神农架林区"
        }
      ]
    },
    {
      code: "43",
      name: "湖南省",
      children: [
        {
          code: "4301",
          name: "长沙市"
        },
        {
          code: "4302",
          name: "株洲市"
        },
        {
          code: "4303",
          name: "湘潭市"
        },
        {
          code: "4304",
          name: "衡阳市"
        },
        {
          code: "4305",
          name: "邵阳市"
        },
        {
          code: "4306",
          name: "岳阳市"
        },
        {
          code: "4307",
          name: "常德市"
        },
        {
          code: "4308",
          name: "张家界市"
        },
        {
          code: "4309",
          name: "益阳市"
        },
        {
          code: "4310",
          name: "郴州市"
        },
        {
          code: "4311",
          name: "永州市"
        },
        {
          code: "4312",
          name: "怀化市"
        },
        {
          code: "4313",
          name: "娄底市"
        },
        {
          code: "4331",
          name: "湘西土家族苗族自治州"
        }
      ]
    },
    {
      code: "44",
      name: "广东省",
      children: [
        {
          code: "4401",
          name: "广州市"
        },
        {
          code: "4402",
          name: "韶关市"
        },
        {
          code: "4403",
          name: "深圳市"
        },
        {
          code: "4404",
          name: "珠海市"
        },
        {
          code: "4405",
          name: "汕头市"
        },
        {
          code: "4406",
          name: "佛山市"
        },
        {
          code: "4407",
          name: "江门市"
        },
        {
          code: "4408",
          name: "湛江市"
        },
        {
          code: "4409",
          name: "茂名市"
        },
        {
          code: "4412",
          name: "肇庆市"
        },
        {
          code: "4413",
          name: "惠州市"
        },
        {
          code: "4414",
          name: "梅州市"
        },
        {
          code: "4415",
          name: "汕尾市"
        },
        {
          code: "4416",
          name: "河源市"
        },
        {
          code: "4417",
          name: "阳江市"
        },
        {
          code: "4418",
          name: "清远市"
        },
        {
          code: "4419",
          name: "东莞市"
        },
        {
          code: "4420",
          name: "中山市"
        },
        {
          code: "4451",
          name: "潮州市"
        },
        {
          code: "4452",
          name: "揭阳市"
        },
        {
          code: "4453",
          name: "云浮市"
        }
      ]
    },
    {
      code: "45",
      name: "广西壮族自治区",
      children: [
        {
          code: "4501",
          name: "南宁市"
        },
        {
          code: "4502",
          name: "柳州市"
        },
        {
          code: "4503",
          name: "桂林市"
        },
        {
          code: "4504",
          name: "梧州市"
        },
        {
          code: "4505",
          name: "北海市"
        },
        {
          code: "4506",
          name: "防城港市"
        },
        {
          code: "4507",
          name: "钦州市"
        },
        {
          code: "4508",
          name: "贵港市"
        },
        {
          code: "4509",
          name: "玉林市"
        },
        {
          code: "4510",
          name: "百色市"
        },
        {
          code: "4511",
          name: "贺州市"
        },
        {
          code: "4512",
          name: "河池市"
        },
        {
          code: "4513",
          name: "来宾市"
        },
        {
          code: "4514",
          name: "崇左市"
        }
      ]
    },
    {
      code: "46",
      name: "海南省",
      children: [
        {
          code: "4601",
          name: "海口市"
        },
        {
          code: "4602",
          name: "三亚市"
        },
        {
          code: "4603",
          name: "三沙市"
        },
        {
          code: "4604",
          name: "儋州市"
        },
        {
          code: "469001",
          name: "五指山市"
        },
        {
          code: "469002",
          name: "琼海市"
        },
        {
          code: "469005",
          name: "文昌市"
        },
        {
          code: "469006",
          name: "万宁市"
        },
        {
          code: "469007",
          name: "东方市"
        },
        {
          code: "469021",
          name: "定安县"
        },
        {
          code: "469022",
          name: "屯昌县"
        },
        {
          code: "469023",
          name: "澄迈县"
        },
        {
          code: "469024",
          name: "临高县"
        },
        {
          code: "469025",
          name: "白沙黎族自治县"
        },
        {
          code: "469026",
          name: "昌江黎族自治县"
        },
        {
          code: "469027",
          name: "乐东黎族自治县"
        },
        {
          code: "469028",
          name: "陵水黎族自治县"
        },
        {
          code: "469029",
          name: "保亭黎族苗族自治县"
        },
        {
          code: "469030",
          name: "琼中黎族苗族自治县"
        }
      ]
    },
    {
      code: "50",
      name: "重庆市",
      children: [
        {
          code: "500101",
          name: "万州区"
        },
        {
          code: "500102",
          name: "涪陵区"
        },
        {
          code: "500103",
          name: "渝中区"
        },
        {
          code: "500104",
          name: "大渡口区"
        },
        {
          code: "500105",
          name: "江北区"
        },
        {
          code: "500106",
          name: "沙坪坝区"
        },
        {
          code: "500107",
          name: "九龙坡区"
        },
        {
          code: "500108",
          name: "南岸区"
        },
        {
          code: "500109",
          name: "北碚区"
        },
        {
          code: "500110",
          name: "綦江区"
        },
        {
          code: "500111",
          name: "大足区"
        },
        {
          code: "500112",
          name: "渝北区"
        },
        {
          code: "500113",
          name: "巴南区"
        },
        {
          code: "500114",
          name: "黔江区"
        },
        {
          code: "500115",
          name: "长寿区"
        },
        {
          code: "500116",
          name: "江津区"
        },
        {
          code: "500117",
          name: "合川区"
        },
        {
          code: "500118",
          name: "永川区"
        },
        {
          code: "500119",
          name: "南川区"
        },
        {
          code: "500120",
          name: "璧山区"
        },
        {
          code: "500151",
          name: "铜梁区"
        },
        {
          code: "500152",
          name: "潼南区"
        },
        {
          code: "500153",
          name: "荣昌区"
        },
        {
          code: "500154",
          name: "开州区"
        },
        {
          code: "500155",
          name: "梁平区"
        },
        {
          code: "500156",
          name: "武隆区"
        },
        {
          code: "500229",
          name: "城口县"
        },
        {
          code: "500230",
          name: "丰都县"
        },
        {
          code: "500231",
          name: "垫江县"
        },
        {
          code: "500233",
          name: "忠县"
        },
        {
          code: "500235",
          name: "云阳县"
        },
        {
          code: "500236",
          name: "奉节县"
        },
        {
          code: "500237",
          name: "巫山县"
        },
        {
          code: "500238",
          name: "巫溪县"
        },
        {
          code: "500240",
          name: "石柱土家族自治县"
        },
        {
          code: "500241",
          name: "秀山土家族苗族自治县"
        },
        {
          code: "500242",
          name: "酉阳土家族苗族自治县"
        },
        {
          code: "500243",
          name: "彭水苗族土家族自治县"
        }
      ]
    },
    {
      code: "51",
      name: "四川省",
      children: [
        {
          code: "5101",
          name: "成都市"
        },
        {
          code: "5103",
          name: "自贡市"
        },
        {
          code: "5104",
          name: "攀枝花市"
        },
        {
          code: "5105",
          name: "泸州市"
        },
        {
          code: "5106",
          name: "德阳市"
        },
        {
          code: "5107",
          name: "绵阳市"
        },
        {
          code: "5108",
          name: "广元市"
        },
        {
          code: "5109",
          name: "遂宁市"
        },
        {
          code: "5110",
          name: "内江市"
        },
        {
          code: "5111",
          name: "乐山市"
        },
        {
          code: "5113",
          name: "南充市"
        },
        {
          code: "5114",
          name: "眉山市"
        },
        {
          code: "5115",
          name: "宜宾市"
        },
        {
          code: "5116",
          name: "广安市"
        },
        {
          code: "5117",
          name: "达州市"
        },
        {
          code: "5118",
          name: "雅安市"
        },
        {
          code: "5119",
          name: "巴中市"
        },
        {
          code: "5120",
          name: "资阳市"
        },
        {
          code: "5132",
          name: "阿坝藏族羌族自治州"
        },
        {
          code: "5133",
          name: "甘孜藏族自治州"
        },
        {
          code: "5134",
          name: "凉山彝族自治州"
        }
      ]
    },
    {
      code: "52",
      name: "贵州省",
      children: [
        {
          code: "5201",
          name: "贵阳市"
        },
        {
          code: "5202",
          name: "六盘水市"
        },
        {
          code: "5203",
          name: "遵义市"
        },
        {
          code: "5204",
          name: "安顺市"
        },
        {
          code: "5205",
          name: "毕节市"
        },
        {
          code: "5206",
          name: "铜仁市"
        },
        {
          code: "5223",
          name: "黔西南布依族苗族自治州"
        },
        {
          code: "5226",
          name: "黔东南苗族侗族自治州"
        },
        {
          code: "5227",
          name: "黔南布依族苗族自治州"
        }
      ]
    },
    {
      code: "53",
      name: "云南省",
      children: [
        {
          code: "5301",
          name: "昆明市"
        },
        {
          code: "5303",
          name: "曲靖市"
        },
        {
          code: "5304",
          name: "玉溪市"
        },
        {
          code: "5305",
          name: "保山市"
        },
        {
          code: "5306",
          name: "昭通市"
        },
        {
          code: "5307",
          name: "丽江市"
        },
        {
          code: "5308",
          name: "普洱市"
        },
        {
          code: "5309",
          name: "临沧市"
        },
        {
          code: "5323",
          name: "楚雄彝族自治州"
        },
        {
          code: "5325",
          name: "红河哈尼族彝族自治州"
        },
        {
          code: "5326",
          name: "文山壮族苗族自治州"
        },
        {
          code: "5328",
          name: "西双版纳傣族自治州"
        },
        {
          code: "5329",
          name: "大理白族自治州"
        },
        {
          code: "5331",
          name: "德宏傣族景颇族自治州"
        },
        {
          code: "5333",
          name: "怒江傈僳族自治州"
        },
        {
          code: "5334",
          name: "迪庆藏族自治州"
        }
      ]
    },
    {
      code: "54",
      name: "西藏自治区",
      children: [
        {
          code: "5401",
          name: "拉萨市"
        },
        {
          code: "5402",
          name: "日喀则市"
        },
        {
          code: "5403",
          name: "昌都市"
        },
        {
          code: "5404",
          name: "林芝市"
        },
        {
          code: "5405",
          name: "山南市"
        },
        {
          code: "5406",
          name: "那曲市"
        },
        {
          code: "5425",
          name: "阿里地区"
        }
      ]
    },
    {
      code: "61",
      name: "陕西省",
      children: [
        {
          code: "6101",
          name: "西安市"
        },
        {
          code: "6102",
          name: "铜川市"
        },
        {
          code: "6103",
          name: "宝鸡市"
        },
        {
          code: "6104",
          name: "咸阳市"
        },
        {
          code: "6105",
          name: "渭南市"
        },
        {
          code: "6106",
          name: "延安市"
        },
        {
          code: "6107",
          name: "汉中市"
        },
        {
          code: "6108",
          name: "榆林市"
        },
        {
          code: "6109",
          name: "安康市"
        },
        {
          code: "6110",
          name: "商洛市"
        }
      ]
    },
    {
      code: "62",
      name: "甘肃省",
      children: [
        {
          code: "6201",
          name: "兰州市"
        },
        {
          code: "6202",
          name: "嘉峪关市"
        },
        {
          code: "6203",
          name: "金昌市"
        },
        {
          code: "6204",
          name: "白银市"
        },
        {
          code: "6205",
          name: "天水市"
        },
        {
          code: "6206",
          name: "武威市"
        },
        {
          code: "6207",
          name: "张掖市"
        },
        {
          code: "6208",
          name: "平凉市"
        },
        {
          code: "6209",
          name: "酒泉市"
        },
        {
          code: "6210",
          name: "庆阳市"
        },
        {
          code: "6211",
          name: "定西市"
        },
        {
          code: "6212",
          name: "陇南市"
        },
        {
          code: "6229",
          name: "临夏回族自治州"
        },
        {
          code: "6230",
          name: "甘南藏族自治州"
        }
      ]
    },
    {
      code: "63",
      name: "青海省",
      children: [
        {
          code: "6301",
          name: "西宁市"
        },
        {
          code: "6302",
          name: "海东市"
        },
        {
          code: "6322",
          name: "海北藏族自治州"
        },
        {
          code: "6323",
          name: "黄南藏族自治州"
        },
        {
          code: "6325",
          name: "海南藏族自治州"
        },
        {
          code: "6326",
          name: "果洛藏族自治州"
        },
        {
          code: "6327",
          name: "玉树藏族自治州"
        },
        {
          code: "6328",
          name: "海西蒙古族藏族自治州"
        }
      ]
    },
    {
      code: "64",
      name: "宁夏回族自治区",
      children: [
        {
          code: "6401",
          name: "银川市"
        },
        {
          code: "6402",
          name: "石嘴山市"
        },
        {
          code: "6403",
          name: "吴忠市"
        },
        {
          code: "6404",
          name: "固原市"
        },
        {
          code: "6405",
          name: "中卫市"
        }
      ]
    },
    {
      code: "65",
      name: "新疆维吾尔自治区",
      children: [
        {
          code: "6501",
          name: "乌鲁木齐市"
        },
        {
          code: "6502",
          name: "克拉玛依市"
        },
        {
          code: "6504",
          name: "吐鲁番市"
        },
        {
          code: "6505",
          name: "哈密市"
        },
        {
          code: "6523",
          name: "昌吉回族自治州"
        },
        {
          code: "6527",
          name: "博尔塔拉蒙古自治州"
        },
        {
          code: "6528",
          name: "巴音郭楞蒙古自治州"
        },
        {
          code: "6529",
          name: "阿克苏地区"
        },
        {
          code: "6530",
          name: "克孜勒苏柯尔克孜自治州"
        },
        {
          code: "6531",
          name: "喀什地区"
        },
        {
          code: "6532",
          name: "和田地区"
        },
        {
          code: "6540",
          name: "伊犁哈萨克自治州"
        },
        {
          code: "6542",
          name: "塔城地区"
        },
        {
          code: "6543",
          name: "阿勒泰地区"
        },
        {
          code: "659001",
          name: "石河子市"
        },
        {
          code: "659002",
          name: "阿拉尔市"
        },
        {
          code: "659003",
          name: "图木舒克市"
        },
        {
          code: "659004",
          name: "五家渠市"
        },
        {
          code: "659005",
          name: "北屯市"
        },
        {
          code: "659006",
          name: "铁门关市"
        },
        {
          code: "659007",
          name: "双河市"
        },
        {
          code: "659008",
          name: "可克达拉市"
        },
        {
          code: "659009",
          name: "昆玉市"
        },
        {
          code: "659010",
          name: "胡杨河市"
        },
        {
          code: "659011",
          name: "新星市"
        },
        {
          code: "659012",
          name: "白杨市"
        }
      ]
    }
  ], m = [
    {
      code: "11",
      name: "北京市",
      children: [
        {
          code: "1101",
          name: "市辖区",
          children: [
            {
              code: "110101",
              name: "东城区"
            },
            {
              code: "110102",
              name: "西城区"
            },
            {
              code: "110105",
              name: "朝阳区"
            },
            {
              code: "110106",
              name: "丰台区"
            },
            {
              code: "110107",
              name: "石景山区"
            },
            {
              code: "110108",
              name: "海淀区"
            },
            {
              code: "110109",
              name: "门头沟区"
            },
            {
              code: "110111",
              name: "房山区"
            },
            {
              code: "110112",
              name: "通州区"
            },
            {
              code: "110113",
              name: "顺义区"
            },
            {
              code: "110114",
              name: "昌平区"
            },
            {
              code: "110115",
              name: "大兴区"
            },
            {
              code: "110116",
              name: "怀柔区"
            },
            {
              code: "110117",
              name: "平谷区"
            },
            {
              code: "110118",
              name: "密云区"
            },
            {
              code: "110119",
              name: "延庆区"
            }
          ]
        }
      ]
    },
    {
      code: "12",
      name: "天津市",
      children: [
        {
          code: "1201",
          name: "市辖区",
          children: [
            {
              code: "120101",
              name: "和平区"
            },
            {
              code: "120102",
              name: "河东区"
            },
            {
              code: "120103",
              name: "河西区"
            },
            {
              code: "120104",
              name: "南开区"
            },
            {
              code: "120105",
              name: "河北区"
            },
            {
              code: "120106",
              name: "红桥区"
            },
            {
              code: "120110",
              name: "东丽区"
            },
            {
              code: "120111",
              name: "西青区"
            },
            {
              code: "120112",
              name: "津南区"
            },
            {
              code: "120113",
              name: "北辰区"
            },
            {
              code: "120114",
              name: "武清区"
            },
            {
              code: "120115",
              name: "宝坻区"
            },
            {
              code: "120116",
              name: "滨海新区"
            },
            {
              code: "120117",
              name: "宁河区"
            },
            {
              code: "120118",
              name: "静海区"
            },
            {
              code: "120119",
              name: "蓟州区"
            }
          ]
        }
      ]
    },
    {
      code: "13",
      name: "河北省",
      children: [
        {
          code: "1301",
          name: "石家庄市",
          children: [
            {
              code: "130102",
              name: "长安区"
            },
            {
              code: "130104",
              name: "桥西区"
            },
            {
              code: "130105",
              name: "新华区"
            },
            {
              code: "130107",
              name: "井陉矿区"
            },
            {
              code: "130108",
              name: "裕华区"
            },
            {
              code: "130109",
              name: "藁城区"
            },
            {
              code: "130110",
              name: "鹿泉区"
            },
            {
              code: "130111",
              name: "栾城区"
            },
            {
              code: "130121",
              name: "井陉县"
            },
            {
              code: "130123",
              name: "正定县"
            },
            {
              code: "130125",
              name: "行唐县"
            },
            {
              code: "130126",
              name: "灵寿县"
            },
            {
              code: "130127",
              name: "高邑县"
            },
            {
              code: "130128",
              name: "深泽县"
            },
            {
              code: "130129",
              name: "赞皇县"
            },
            {
              code: "130130",
              name: "无极县"
            },
            {
              code: "130131",
              name: "平山县"
            },
            {
              code: "130132",
              name: "元氏县"
            },
            {
              code: "130133",
              name: "赵县"
            },
            {
              code: "130171",
              name: "石家庄高新技术产业开发区"
            },
            {
              code: "130172",
              name: "石家庄循环化工园区"
            },
            {
              code: "130181",
              name: "辛集市"
            },
            {
              code: "130183",
              name: "晋州市"
            },
            {
              code: "130184",
              name: "新乐市"
            }
          ]
        },
        {
          code: "1302",
          name: "唐山市",
          children: [
            {
              code: "130202",
              name: "路南区"
            },
            {
              code: "130203",
              name: "路北区"
            },
            {
              code: "130204",
              name: "古冶区"
            },
            {
              code: "130205",
              name: "开平区"
            },
            {
              code: "130207",
              name: "丰南区"
            },
            {
              code: "130208",
              name: "丰润区"
            },
            {
              code: "130209",
              name: "曹妃甸区"
            },
            {
              code: "130224",
              name: "滦南县"
            },
            {
              code: "130225",
              name: "乐亭县"
            },
            {
              code: "130227",
              name: "迁西县"
            },
            {
              code: "130229",
              name: "玉田县"
            },
            {
              code: "130271",
              name: "河北唐山芦台经济开发区"
            },
            {
              code: "130272",
              name: "唐山市汉沽管理区"
            },
            {
              code: "130273",
              name: "唐山高新技术产业开发区"
            },
            {
              code: "130274",
              name: "河北唐山海港经济开发区"
            },
            {
              code: "130281",
              name: "遵化市"
            },
            {
              code: "130283",
              name: "迁安市"
            },
            {
              code: "130284",
              name: "滦州市"
            }
          ]
        },
        {
          code: "1303",
          name: "秦皇岛市",
          children: [
            {
              code: "130302",
              name: "海港区"
            },
            {
              code: "130303",
              name: "山海关区"
            },
            {
              code: "130304",
              name: "北戴河区"
            },
            {
              code: "130306",
              name: "抚宁区"
            },
            {
              code: "130321",
              name: "青龙满族自治县"
            },
            {
              code: "130322",
              name: "昌黎县"
            },
            {
              code: "130324",
              name: "卢龙县"
            },
            {
              code: "130371",
              name: "秦皇岛市经济技术开发区"
            },
            {
              code: "130372",
              name: "北戴河新区"
            }
          ]
        },
        {
          code: "1304",
          name: "邯郸市",
          children: [
            {
              code: "130402",
              name: "邯山区"
            },
            {
              code: "130403",
              name: "丛台区"
            },
            {
              code: "130404",
              name: "复兴区"
            },
            {
              code: "130406",
              name: "峰峰矿区"
            },
            {
              code: "130407",
              name: "肥乡区"
            },
            {
              code: "130408",
              name: "永年区"
            },
            {
              code: "130423",
              name: "临漳县"
            },
            {
              code: "130424",
              name: "成安县"
            },
            {
              code: "130425",
              name: "大名县"
            },
            {
              code: "130426",
              name: "涉县"
            },
            {
              code: "130427",
              name: "磁县"
            },
            {
              code: "130430",
              name: "邱县"
            },
            {
              code: "130431",
              name: "鸡泽县"
            },
            {
              code: "130432",
              name: "广平县"
            },
            {
              code: "130433",
              name: "馆陶县"
            },
            {
              code: "130434",
              name: "魏县"
            },
            {
              code: "130435",
              name: "曲周县"
            },
            {
              code: "130471",
              name: "邯郸经济技术开发区"
            },
            {
              code: "130473",
              name: "邯郸冀南新区"
            },
            {
              code: "130481",
              name: "武安市"
            }
          ]
        },
        {
          code: "1305",
          name: "邢台市",
          children: [
            {
              code: "130502",
              name: "襄都区"
            },
            {
              code: "130503",
              name: "信都区"
            },
            {
              code: "130505",
              name: "任泽区"
            },
            {
              code: "130506",
              name: "南和区"
            },
            {
              code: "130522",
              name: "临城县"
            },
            {
              code: "130523",
              name: "内丘县"
            },
            {
              code: "130524",
              name: "柏乡县"
            },
            {
              code: "130525",
              name: "隆尧县"
            },
            {
              code: "130528",
              name: "宁晋县"
            },
            {
              code: "130529",
              name: "巨鹿县"
            },
            {
              code: "130530",
              name: "新河县"
            },
            {
              code: "130531",
              name: "广宗县"
            },
            {
              code: "130532",
              name: "平乡县"
            },
            {
              code: "130533",
              name: "威县"
            },
            {
              code: "130534",
              name: "清河县"
            },
            {
              code: "130535",
              name: "临西县"
            },
            {
              code: "130571",
              name: "河北邢台经济开发区"
            },
            {
              code: "130581",
              name: "南宫市"
            },
            {
              code: "130582",
              name: "沙河市"
            }
          ]
        },
        {
          code: "1306",
          name: "保定市",
          children: [
            {
              code: "130602",
              name: "竞秀区"
            },
            {
              code: "130606",
              name: "莲池区"
            },
            {
              code: "130607",
              name: "满城区"
            },
            {
              code: "130608",
              name: "清苑区"
            },
            {
              code: "130609",
              name: "徐水区"
            },
            {
              code: "130623",
              name: "涞水县"
            },
            {
              code: "130624",
              name: "阜平县"
            },
            {
              code: "130626",
              name: "定兴县"
            },
            {
              code: "130627",
              name: "唐县"
            },
            {
              code: "130628",
              name: "高阳县"
            },
            {
              code: "130629",
              name: "容城县"
            },
            {
              code: "130630",
              name: "涞源县"
            },
            {
              code: "130631",
              name: "望都县"
            },
            {
              code: "130632",
              name: "安新县"
            },
            {
              code: "130633",
              name: "易县"
            },
            {
              code: "130634",
              name: "曲阳县"
            },
            {
              code: "130635",
              name: "蠡县"
            },
            {
              code: "130636",
              name: "顺平县"
            },
            {
              code: "130637",
              name: "博野县"
            },
            {
              code: "130638",
              name: "雄县"
            },
            {
              code: "130671",
              name: "保定高新技术产业开发区"
            },
            {
              code: "130672",
              name: "保定白沟新城"
            },
            {
              code: "130681",
              name: "涿州市"
            },
            {
              code: "130682",
              name: "定州市"
            },
            {
              code: "130683",
              name: "安国市"
            },
            {
              code: "130684",
              name: "高碑店市"
            }
          ]
        },
        {
          code: "1307",
          name: "张家口市",
          children: [
            {
              code: "130702",
              name: "桥东区"
            },
            {
              code: "130703",
              name: "桥西区"
            },
            {
              code: "130705",
              name: "宣化区"
            },
            {
              code: "130706",
              name: "下花园区"
            },
            {
              code: "130708",
              name: "万全区"
            },
            {
              code: "130709",
              name: "崇礼区"
            },
            {
              code: "130722",
              name: "张北县"
            },
            {
              code: "130723",
              name: "康保县"
            },
            {
              code: "130724",
              name: "沽源县"
            },
            {
              code: "130725",
              name: "尚义县"
            },
            {
              code: "130726",
              name: "蔚县"
            },
            {
              code: "130727",
              name: "阳原县"
            },
            {
              code: "130728",
              name: "怀安县"
            },
            {
              code: "130730",
              name: "怀来县"
            },
            {
              code: "130731",
              name: "涿鹿县"
            },
            {
              code: "130732",
              name: "赤城县"
            },
            {
              code: "130771",
              name: "张家口经济开发区"
            },
            {
              code: "130772",
              name: "张家口市察北管理区"
            },
            {
              code: "130773",
              name: "张家口市塞北管理区"
            }
          ]
        },
        {
          code: "1308",
          name: "承德市",
          children: [
            {
              code: "130802",
              name: "双桥区"
            },
            {
              code: "130803",
              name: "双滦区"
            },
            {
              code: "130804",
              name: "鹰手营子矿区"
            },
            {
              code: "130821",
              name: "承德县"
            },
            {
              code: "130822",
              name: "兴隆县"
            },
            {
              code: "130824",
              name: "滦平县"
            },
            {
              code: "130825",
              name: "隆化县"
            },
            {
              code: "130826",
              name: "丰宁满族自治县"
            },
            {
              code: "130827",
              name: "宽城满族自治县"
            },
            {
              code: "130828",
              name: "围场满族蒙古族自治县"
            },
            {
              code: "130871",
              name: "承德高新技术产业开发区"
            },
            {
              code: "130881",
              name: "平泉市"
            }
          ]
        },
        {
          code: "1309",
          name: "沧州市",
          children: [
            {
              code: "130902",
              name: "新华区"
            },
            {
              code: "130903",
              name: "运河区"
            },
            {
              code: "130921",
              name: "沧县"
            },
            {
              code: "130922",
              name: "青县"
            },
            {
              code: "130923",
              name: "东光县"
            },
            {
              code: "130924",
              name: "海兴县"
            },
            {
              code: "130925",
              name: "盐山县"
            },
            {
              code: "130926",
              name: "肃宁县"
            },
            {
              code: "130927",
              name: "南皮县"
            },
            {
              code: "130928",
              name: "吴桥县"
            },
            {
              code: "130929",
              name: "献县"
            },
            {
              code: "130930",
              name: "孟村回族自治县"
            },
            {
              code: "130971",
              name: "河北沧州经济开发区"
            },
            {
              code: "130972",
              name: "沧州高新技术产业开发区"
            },
            {
              code: "130973",
              name: "沧州渤海新区"
            },
            {
              code: "130981",
              name: "泊头市"
            },
            {
              code: "130982",
              name: "任丘市"
            },
            {
              code: "130983",
              name: "黄骅市"
            },
            {
              code: "130984",
              name: "河间市"
            }
          ]
        },
        {
          code: "1310",
          name: "廊坊市",
          children: [
            {
              code: "131002",
              name: "安次区"
            },
            {
              code: "131003",
              name: "广阳区"
            },
            {
              code: "131022",
              name: "固安县"
            },
            {
              code: "131023",
              name: "永清县"
            },
            {
              code: "131024",
              name: "香河县"
            },
            {
              code: "131025",
              name: "大城县"
            },
            {
              code: "131026",
              name: "文安县"
            },
            {
              code: "131028",
              name: "大厂回族自治县"
            },
            {
              code: "131071",
              name: "廊坊经济技术开发区"
            },
            {
              code: "131081",
              name: "霸州市"
            },
            {
              code: "131082",
              name: "三河市"
            }
          ]
        },
        {
          code: "1311",
          name: "衡水市",
          children: [
            {
              code: "131102",
              name: "桃城区"
            },
            {
              code: "131103",
              name: "冀州区"
            },
            {
              code: "131121",
              name: "枣强县"
            },
            {
              code: "131122",
              name: "武邑县"
            },
            {
              code: "131123",
              name: "武强县"
            },
            {
              code: "131124",
              name: "饶阳县"
            },
            {
              code: "131125",
              name: "安平县"
            },
            {
              code: "131126",
              name: "故城县"
            },
            {
              code: "131127",
              name: "景县"
            },
            {
              code: "131128",
              name: "阜城县"
            },
            {
              code: "131171",
              name: "河北衡水高新技术产业开发区"
            },
            {
              code: "131172",
              name: "衡水滨湖新区"
            },
            {
              code: "131182",
              name: "深州市"
            }
          ]
        }
      ]
    },
    {
      code: "14",
      name: "山西省",
      children: [
        {
          code: "1401",
          name: "太原市",
          children: [
            {
              code: "140105",
              name: "小店区"
            },
            {
              code: "140106",
              name: "迎泽区"
            },
            {
              code: "140107",
              name: "杏花岭区"
            },
            {
              code: "140108",
              name: "尖草坪区"
            },
            {
              code: "140109",
              name: "万柏林区"
            },
            {
              code: "140110",
              name: "晋源区"
            },
            {
              code: "140121",
              name: "清徐县"
            },
            {
              code: "140122",
              name: "阳曲县"
            },
            {
              code: "140123",
              name: "娄烦县"
            },
            {
              code: "140171",
              name: "山西转型综合改革示范区"
            },
            {
              code: "140181",
              name: "古交市"
            }
          ]
        },
        {
          code: "1402",
          name: "大同市",
          children: [
            {
              code: "140212",
              name: "新荣区"
            },
            {
              code: "140213",
              name: "平城区"
            },
            {
              code: "140214",
              name: "云冈区"
            },
            {
              code: "140215",
              name: "云州区"
            },
            {
              code: "140221",
              name: "阳高县"
            },
            {
              code: "140222",
              name: "天镇县"
            },
            {
              code: "140223",
              name: "广灵县"
            },
            {
              code: "140224",
              name: "灵丘县"
            },
            {
              code: "140225",
              name: "浑源县"
            },
            {
              code: "140226",
              name: "左云县"
            },
            {
              code: "140271",
              name: "山西大同经济开发区"
            }
          ]
        },
        {
          code: "1403",
          name: "阳泉市",
          children: [
            {
              code: "140302",
              name: "城区"
            },
            {
              code: "140303",
              name: "矿区"
            },
            {
              code: "140311",
              name: "郊区"
            },
            {
              code: "140321",
              name: "平定县"
            },
            {
              code: "140322",
              name: "盂县"
            }
          ]
        },
        {
          code: "1404",
          name: "长治市",
          children: [
            {
              code: "140403",
              name: "潞州区"
            },
            {
              code: "140404",
              name: "上党区"
            },
            {
              code: "140405",
              name: "屯留区"
            },
            {
              code: "140406",
              name: "潞城区"
            },
            {
              code: "140423",
              name: "襄垣县"
            },
            {
              code: "140425",
              name: "平顺县"
            },
            {
              code: "140426",
              name: "黎城县"
            },
            {
              code: "140427",
              name: "壶关县"
            },
            {
              code: "140428",
              name: "长子县"
            },
            {
              code: "140429",
              name: "武乡县"
            },
            {
              code: "140430",
              name: "沁县"
            },
            {
              code: "140431",
              name: "沁源县"
            }
          ]
        },
        {
          code: "1405",
          name: "晋城市",
          children: [
            {
              code: "140502",
              name: "城区"
            },
            {
              code: "140521",
              name: "沁水县"
            },
            {
              code: "140522",
              name: "阳城县"
            },
            {
              code: "140524",
              name: "陵川县"
            },
            {
              code: "140525",
              name: "泽州县"
            },
            {
              code: "140581",
              name: "高平市"
            }
          ]
        },
        {
          code: "1406",
          name: "朔州市",
          children: [
            {
              code: "140602",
              name: "朔城区"
            },
            {
              code: "140603",
              name: "平鲁区"
            },
            {
              code: "140621",
              name: "山阴县"
            },
            {
              code: "140622",
              name: "应县"
            },
            {
              code: "140623",
              name: "右玉县"
            },
            {
              code: "140671",
              name: "山西朔州经济开发区"
            },
            {
              code: "140681",
              name: "怀仁市"
            }
          ]
        },
        {
          code: "1407",
          name: "晋中市",
          children: [
            {
              code: "140702",
              name: "榆次区"
            },
            {
              code: "140703",
              name: "太谷区"
            },
            {
              code: "140721",
              name: "榆社县"
            },
            {
              code: "140722",
              name: "左权县"
            },
            {
              code: "140723",
              name: "和顺县"
            },
            {
              code: "140724",
              name: "昔阳县"
            },
            {
              code: "140725",
              name: "寿阳县"
            },
            {
              code: "140727",
              name: "祁县"
            },
            {
              code: "140728",
              name: "平遥县"
            },
            {
              code: "140729",
              name: "灵石县"
            },
            {
              code: "140781",
              name: "介休市"
            }
          ]
        },
        {
          code: "1408",
          name: "运城市",
          children: [
            {
              code: "140802",
              name: "盐湖区"
            },
            {
              code: "140821",
              name: "临猗县"
            },
            {
              code: "140822",
              name: "万荣县"
            },
            {
              code: "140823",
              name: "闻喜县"
            },
            {
              code: "140824",
              name: "稷山县"
            },
            {
              code: "140825",
              name: "新绛县"
            },
            {
              code: "140826",
              name: "绛县"
            },
            {
              code: "140827",
              name: "垣曲县"
            },
            {
              code: "140828",
              name: "夏县"
            },
            {
              code: "140829",
              name: "平陆县"
            },
            {
              code: "140830",
              name: "芮城县"
            },
            {
              code: "140881",
              name: "永济市"
            },
            {
              code: "140882",
              name: "河津市"
            }
          ]
        },
        {
          code: "1409",
          name: "忻州市",
          children: [
            {
              code: "140902",
              name: "忻府区"
            },
            {
              code: "140921",
              name: "定襄县"
            },
            {
              code: "140922",
              name: "五台县"
            },
            {
              code: "140923",
              name: "代县"
            },
            {
              code: "140924",
              name: "繁峙县"
            },
            {
              code: "140925",
              name: "宁武县"
            },
            {
              code: "140926",
              name: "静乐县"
            },
            {
              code: "140927",
              name: "神池县"
            },
            {
              code: "140928",
              name: "五寨县"
            },
            {
              code: "140929",
              name: "岢岚县"
            },
            {
              code: "140930",
              name: "河曲县"
            },
            {
              code: "140931",
              name: "保德县"
            },
            {
              code: "140932",
              name: "偏关县"
            },
            {
              code: "140971",
              name: "五台山风景名胜区"
            },
            {
              code: "140981",
              name: "原平市"
            }
          ]
        },
        {
          code: "1410",
          name: "临汾市",
          children: [
            {
              code: "141002",
              name: "尧都区"
            },
            {
              code: "141021",
              name: "曲沃县"
            },
            {
              code: "141022",
              name: "翼城县"
            },
            {
              code: "141023",
              name: "襄汾县"
            },
            {
              code: "141024",
              name: "洪洞县"
            },
            {
              code: "141025",
              name: "古县"
            },
            {
              code: "141026",
              name: "安泽县"
            },
            {
              code: "141027",
              name: "浮山县"
            },
            {
              code: "141028",
              name: "吉县"
            },
            {
              code: "141029",
              name: "乡宁县"
            },
            {
              code: "141030",
              name: "大宁县"
            },
            {
              code: "141031",
              name: "隰县"
            },
            {
              code: "141032",
              name: "永和县"
            },
            {
              code: "141033",
              name: "蒲县"
            },
            {
              code: "141034",
              name: "汾西县"
            },
            {
              code: "141081",
              name: "侯马市"
            },
            {
              code: "141082",
              name: "霍州市"
            }
          ]
        },
        {
          code: "1411",
          name: "吕梁市",
          children: [
            {
              code: "141102",
              name: "离石区"
            },
            {
              code: "141121",
              name: "文水县"
            },
            {
              code: "141122",
              name: "交城县"
            },
            {
              code: "141123",
              name: "兴县"
            },
            {
              code: "141124",
              name: "临县"
            },
            {
              code: "141125",
              name: "柳林县"
            },
            {
              code: "141126",
              name: "石楼县"
            },
            {
              code: "141127",
              name: "岚县"
            },
            {
              code: "141128",
              name: "方山县"
            },
            {
              code: "141129",
              name: "中阳县"
            },
            {
              code: "141130",
              name: "交口县"
            },
            {
              code: "141181",
              name: "孝义市"
            },
            {
              code: "141182",
              name: "汾阳市"
            }
          ]
        }
      ]
    },
    {
      code: "15",
      name: "内蒙古自治区",
      children: [
        {
          code: "1501",
          name: "呼和浩特市",
          children: [
            {
              code: "150102",
              name: "新城区"
            },
            {
              code: "150103",
              name: "回民区"
            },
            {
              code: "150104",
              name: "玉泉区"
            },
            {
              code: "150105",
              name: "赛罕区"
            },
            {
              code: "150121",
              name: "土默特左旗"
            },
            {
              code: "150122",
              name: "托克托县"
            },
            {
              code: "150123",
              name: "和林格尔县"
            },
            {
              code: "150124",
              name: "清水河县"
            },
            {
              code: "150125",
              name: "武川县"
            },
            {
              code: "150172",
              name: "呼和浩特经济技术开发区"
            }
          ]
        },
        {
          code: "1502",
          name: "包头市",
          children: [
            {
              code: "150202",
              name: "东河区"
            },
            {
              code: "150203",
              name: "昆都仑区"
            },
            {
              code: "150204",
              name: "青山区"
            },
            {
              code: "150205",
              name: "石拐区"
            },
            {
              code: "150206",
              name: "白云鄂博矿区"
            },
            {
              code: "150207",
              name: "九原区"
            },
            {
              code: "150221",
              name: "土默特右旗"
            },
            {
              code: "150222",
              name: "固阳县"
            },
            {
              code: "150223",
              name: "达尔罕茂明安联合旗"
            },
            {
              code: "150271",
              name: "包头稀土高新技术产业开发区"
            }
          ]
        },
        {
          code: "1503",
          name: "乌海市",
          children: [
            {
              code: "150302",
              name: "海勃湾区"
            },
            {
              code: "150303",
              name: "海南区"
            },
            {
              code: "150304",
              name: "乌达区"
            }
          ]
        },
        {
          code: "1504",
          name: "赤峰市",
          children: [
            {
              code: "150402",
              name: "红山区"
            },
            {
              code: "150403",
              name: "元宝山区"
            },
            {
              code: "150404",
              name: "松山区"
            },
            {
              code: "150421",
              name: "阿鲁科尔沁旗"
            },
            {
              code: "150422",
              name: "巴林左旗"
            },
            {
              code: "150423",
              name: "巴林右旗"
            },
            {
              code: "150424",
              name: "林西县"
            },
            {
              code: "150425",
              name: "克什克腾旗"
            },
            {
              code: "150426",
              name: "翁牛特旗"
            },
            {
              code: "150428",
              name: "喀喇沁旗"
            },
            {
              code: "150429",
              name: "宁城县"
            },
            {
              code: "150430",
              name: "敖汉旗"
            }
          ]
        },
        {
          code: "1505",
          name: "通辽市",
          children: [
            {
              code: "150502",
              name: "科尔沁区"
            },
            {
              code: "150521",
              name: "科尔沁左翼中旗"
            },
            {
              code: "150522",
              name: "科尔沁左翼后旗"
            },
            {
              code: "150523",
              name: "开鲁县"
            },
            {
              code: "150524",
              name: "库伦旗"
            },
            {
              code: "150525",
              name: "奈曼旗"
            },
            {
              code: "150526",
              name: "扎鲁特旗"
            },
            {
              code: "150571",
              name: "通辽经济技术开发区"
            },
            {
              code: "150581",
              name: "霍林郭勒市"
            }
          ]
        },
        {
          code: "1506",
          name: "鄂尔多斯市",
          children: [
            {
              code: "150602",
              name: "东胜区"
            },
            {
              code: "150603",
              name: "康巴什区"
            },
            {
              code: "150621",
              name: "达拉特旗"
            },
            {
              code: "150622",
              name: "准格尔旗"
            },
            {
              code: "150623",
              name: "鄂托克前旗"
            },
            {
              code: "150624",
              name: "鄂托克旗"
            },
            {
              code: "150625",
              name: "杭锦旗"
            },
            {
              code: "150626",
              name: "乌审旗"
            },
            {
              code: "150627",
              name: "伊金霍洛旗"
            }
          ]
        },
        {
          code: "1507",
          name: "呼伦贝尔市",
          children: [
            {
              code: "150702",
              name: "海拉尔区"
            },
            {
              code: "150703",
              name: "扎赉诺尔区"
            },
            {
              code: "150721",
              name: "阿荣旗"
            },
            {
              code: "150722",
              name: "莫力达瓦达斡尔族自治旗"
            },
            {
              code: "150723",
              name: "鄂伦春自治旗"
            },
            {
              code: "150724",
              name: "鄂温克族自治旗"
            },
            {
              code: "150725",
              name: "陈巴尔虎旗"
            },
            {
              code: "150726",
              name: "新巴尔虎左旗"
            },
            {
              code: "150727",
              name: "新巴尔虎右旗"
            },
            {
              code: "150781",
              name: "满洲里市"
            },
            {
              code: "150782",
              name: "牙克石市"
            },
            {
              code: "150783",
              name: "扎兰屯市"
            },
            {
              code: "150784",
              name: "额尔古纳市"
            },
            {
              code: "150785",
              name: "根河市"
            }
          ]
        },
        {
          code: "1508",
          name: "巴彦淖尔市",
          children: [
            {
              code: "150802",
              name: "临河区"
            },
            {
              code: "150821",
              name: "五原县"
            },
            {
              code: "150822",
              name: "磴口县"
            },
            {
              code: "150823",
              name: "乌拉特前旗"
            },
            {
              code: "150824",
              name: "乌拉特中旗"
            },
            {
              code: "150825",
              name: "乌拉特后旗"
            },
            {
              code: "150826",
              name: "杭锦后旗"
            }
          ]
        },
        {
          code: "1509",
          name: "乌兰察布市",
          children: [
            {
              code: "150902",
              name: "集宁区"
            },
            {
              code: "150921",
              name: "卓资县"
            },
            {
              code: "150922",
              name: "化德县"
            },
            {
              code: "150923",
              name: "商都县"
            },
            {
              code: "150924",
              name: "兴和县"
            },
            {
              code: "150925",
              name: "凉城县"
            },
            {
              code: "150926",
              name: "察哈尔右翼前旗"
            },
            {
              code: "150927",
              name: "察哈尔右翼中旗"
            },
            {
              code: "150928",
              name: "察哈尔右翼后旗"
            },
            {
              code: "150929",
              name: "四子王旗"
            },
            {
              code: "150981",
              name: "丰镇市"
            }
          ]
        },
        {
          code: "1522",
          name: "兴安盟",
          children: [
            {
              code: "152201",
              name: "乌兰浩特市"
            },
            {
              code: "152202",
              name: "阿尔山市"
            },
            {
              code: "152221",
              name: "科尔沁右翼前旗"
            },
            {
              code: "152222",
              name: "科尔沁右翼中旗"
            },
            {
              code: "152223",
              name: "扎赉特旗"
            },
            {
              code: "152224",
              name: "突泉县"
            }
          ]
        },
        {
          code: "1525",
          name: "锡林郭勒盟",
          children: [
            {
              code: "152501",
              name: "二连浩特市"
            },
            {
              code: "152502",
              name: "锡林浩特市"
            },
            {
              code: "152522",
              name: "阿巴嘎旗"
            },
            {
              code: "152523",
              name: "苏尼特左旗"
            },
            {
              code: "152524",
              name: "苏尼特右旗"
            },
            {
              code: "152525",
              name: "东乌珠穆沁旗"
            },
            {
              code: "152526",
              name: "西乌珠穆沁旗"
            },
            {
              code: "152527",
              name: "太仆寺旗"
            },
            {
              code: "152528",
              name: "镶黄旗"
            },
            {
              code: "152529",
              name: "正镶白旗"
            },
            {
              code: "152530",
              name: "正蓝旗"
            },
            {
              code: "152531",
              name: "多伦县"
            },
            {
              code: "152571",
              name: "乌拉盖管理区管委会"
            }
          ]
        },
        {
          code: "1529",
          name: "阿拉善盟",
          children: [
            {
              code: "152921",
              name: "阿拉善左旗"
            },
            {
              code: "152922",
              name: "阿拉善右旗"
            },
            {
              code: "152923",
              name: "额济纳旗"
            },
            {
              code: "152971",
              name: "内蒙古阿拉善高新技术产业开发区"
            }
          ]
        }
      ]
    },
    {
      code: "21",
      name: "辽宁省",
      children: [
        {
          code: "2101",
          name: "沈阳市",
          children: [
            {
              code: "210102",
              name: "和平区"
            },
            {
              code: "210103",
              name: "沈河区"
            },
            {
              code: "210104",
              name: "大东区"
            },
            {
              code: "210105",
              name: "皇姑区"
            },
            {
              code: "210106",
              name: "铁西区"
            },
            {
              code: "210111",
              name: "苏家屯区"
            },
            {
              code: "210112",
              name: "浑南区"
            },
            {
              code: "210113",
              name: "沈北新区"
            },
            {
              code: "210114",
              name: "于洪区"
            },
            {
              code: "210115",
              name: "辽中区"
            },
            {
              code: "210123",
              name: "康平县"
            },
            {
              code: "210124",
              name: "法库县"
            },
            {
              code: "210181",
              name: "新民市"
            }
          ]
        },
        {
          code: "2102",
          name: "大连市",
          children: [
            {
              code: "210202",
              name: "中山区"
            },
            {
              code: "210203",
              name: "西岗区"
            },
            {
              code: "210204",
              name: "沙河口区"
            },
            {
              code: "210211",
              name: "甘井子区"
            },
            {
              code: "210212",
              name: "旅顺口区"
            },
            {
              code: "210213",
              name: "金州区"
            },
            {
              code: "210214",
              name: "普兰店区"
            },
            {
              code: "210224",
              name: "长海县"
            },
            {
              code: "210281",
              name: "瓦房店市"
            },
            {
              code: "210283",
              name: "庄河市"
            }
          ]
        },
        {
          code: "2103",
          name: "鞍山市",
          children: [
            {
              code: "210302",
              name: "铁东区"
            },
            {
              code: "210303",
              name: "铁西区"
            },
            {
              code: "210304",
              name: "立山区"
            },
            {
              code: "210311",
              name: "千山区"
            },
            {
              code: "210321",
              name: "台安县"
            },
            {
              code: "210323",
              name: "岫岩满族自治县"
            },
            {
              code: "210381",
              name: "海城市"
            }
          ]
        },
        {
          code: "2104",
          name: "抚顺市",
          children: [
            {
              code: "210402",
              name: "新抚区"
            },
            {
              code: "210403",
              name: "东洲区"
            },
            {
              code: "210404",
              name: "望花区"
            },
            {
              code: "210411",
              name: "顺城区"
            },
            {
              code: "210421",
              name: "抚顺县"
            },
            {
              code: "210422",
              name: "新宾满族自治县"
            },
            {
              code: "210423",
              name: "清原满族自治县"
            }
          ]
        },
        {
          code: "2105",
          name: "本溪市",
          children: [
            {
              code: "210502",
              name: "平山区"
            },
            {
              code: "210503",
              name: "溪湖区"
            },
            {
              code: "210504",
              name: "明山区"
            },
            {
              code: "210505",
              name: "南芬区"
            },
            {
              code: "210521",
              name: "本溪满族自治县"
            },
            {
              code: "210522",
              name: "桓仁满族自治县"
            }
          ]
        },
        {
          code: "2106",
          name: "丹东市",
          children: [
            {
              code: "210602",
              name: "元宝区"
            },
            {
              code: "210603",
              name: "振兴区"
            },
            {
              code: "210604",
              name: "振安区"
            },
            {
              code: "210624",
              name: "宽甸满族自治县"
            },
            {
              code: "210681",
              name: "东港市"
            },
            {
              code: "210682",
              name: "凤城市"
            }
          ]
        },
        {
          code: "2107",
          name: "锦州市",
          children: [
            {
              code: "210702",
              name: "古塔区"
            },
            {
              code: "210703",
              name: "凌河区"
            },
            {
              code: "210711",
              name: "太和区"
            },
            {
              code: "210726",
              name: "黑山县"
            },
            {
              code: "210727",
              name: "义县"
            },
            {
              code: "210781",
              name: "凌海市"
            },
            {
              code: "210782",
              name: "北镇市"
            }
          ]
        },
        {
          code: "2108",
          name: "营口市",
          children: [
            {
              code: "210802",
              name: "站前区"
            },
            {
              code: "210803",
              name: "西市区"
            },
            {
              code: "210804",
              name: "鲅鱼圈区"
            },
            {
              code: "210811",
              name: "老边区"
            },
            {
              code: "210881",
              name: "盖州市"
            },
            {
              code: "210882",
              name: "大石桥市"
            }
          ]
        },
        {
          code: "2109",
          name: "阜新市",
          children: [
            {
              code: "210902",
              name: "海州区"
            },
            {
              code: "210903",
              name: "新邱区"
            },
            {
              code: "210904",
              name: "太平区"
            },
            {
              code: "210905",
              name: "清河门区"
            },
            {
              code: "210911",
              name: "细河区"
            },
            {
              code: "210921",
              name: "阜新蒙古族自治县"
            },
            {
              code: "210922",
              name: "彰武县"
            }
          ]
        },
        {
          code: "2110",
          name: "辽阳市",
          children: [
            {
              code: "211002",
              name: "白塔区"
            },
            {
              code: "211003",
              name: "文圣区"
            },
            {
              code: "211004",
              name: "宏伟区"
            },
            {
              code: "211005",
              name: "弓长岭区"
            },
            {
              code: "211011",
              name: "太子河区"
            },
            {
              code: "211021",
              name: "辽阳县"
            },
            {
              code: "211081",
              name: "灯塔市"
            }
          ]
        },
        {
          code: "2111",
          name: "盘锦市",
          children: [
            {
              code: "211102",
              name: "双台子区"
            },
            {
              code: "211103",
              name: "兴隆台区"
            },
            {
              code: "211104",
              name: "大洼区"
            },
            {
              code: "211122",
              name: "盘山县"
            }
          ]
        },
        {
          code: "2112",
          name: "铁岭市",
          children: [
            {
              code: "211202",
              name: "银州区"
            },
            {
              code: "211204",
              name: "清河区"
            },
            {
              code: "211221",
              name: "铁岭县"
            },
            {
              code: "211223",
              name: "西丰县"
            },
            {
              code: "211224",
              name: "昌图县"
            },
            {
              code: "211281",
              name: "调兵山市"
            },
            {
              code: "211282",
              name: "开原市"
            }
          ]
        },
        {
          code: "2113",
          name: "朝阳市",
          children: [
            {
              code: "211302",
              name: "双塔区"
            },
            {
              code: "211303",
              name: "龙城区"
            },
            {
              code: "211321",
              name: "朝阳县"
            },
            {
              code: "211322",
              name: "建平县"
            },
            {
              code: "211324",
              name: "喀喇沁左翼蒙古族自治县"
            },
            {
              code: "211381",
              name: "北票市"
            },
            {
              code: "211382",
              name: "凌源市"
            }
          ]
        },
        {
          code: "2114",
          name: "葫芦岛市",
          children: [
            {
              code: "211402",
              name: "连山区"
            },
            {
              code: "211403",
              name: "龙港区"
            },
            {
              code: "211404",
              name: "南票区"
            },
            {
              code: "211421",
              name: "绥中县"
            },
            {
              code: "211422",
              name: "建昌县"
            },
            {
              code: "211481",
              name: "兴城市"
            }
          ]
        }
      ]
    },
    {
      code: "22",
      name: "吉林省",
      children: [
        {
          code: "2201",
          name: "长春市",
          children: [
            {
              code: "220102",
              name: "南关区"
            },
            {
              code: "220103",
              name: "宽城区"
            },
            {
              code: "220104",
              name: "朝阳区"
            },
            {
              code: "220105",
              name: "二道区"
            },
            {
              code: "220106",
              name: "绿园区"
            },
            {
              code: "220112",
              name: "双阳区"
            },
            {
              code: "220113",
              name: "九台区"
            },
            {
              code: "220122",
              name: "农安县"
            },
            {
              code: "220171",
              name: "长春经济技术开发区"
            },
            {
              code: "220172",
              name: "长春净月高新技术产业开发区"
            },
            {
              code: "220173",
              name: "长春高新技术产业开发区"
            },
            {
              code: "220174",
              name: "长春汽车经济技术开发区"
            },
            {
              code: "220182",
              name: "榆树市"
            },
            {
              code: "220183",
              name: "德惠市"
            },
            {
              code: "220184",
              name: "公主岭市"
            }
          ]
        },
        {
          code: "2202",
          name: "吉林市",
          children: [
            {
              code: "220202",
              name: "昌邑区"
            },
            {
              code: "220203",
              name: "龙潭区"
            },
            {
              code: "220204",
              name: "船营区"
            },
            {
              code: "220211",
              name: "丰满区"
            },
            {
              code: "220221",
              name: "永吉县"
            },
            {
              code: "220271",
              name: "吉林经济开发区"
            },
            {
              code: "220272",
              name: "吉林高新技术产业开发区"
            },
            {
              code: "220273",
              name: "吉林中国新加坡食品区"
            },
            {
              code: "220281",
              name: "蛟河市"
            },
            {
              code: "220282",
              name: "桦甸市"
            },
            {
              code: "220283",
              name: "舒兰市"
            },
            {
              code: "220284",
              name: "磐石市"
            }
          ]
        },
        {
          code: "2203",
          name: "四平市",
          children: [
            {
              code: "220302",
              name: "铁西区"
            },
            {
              code: "220303",
              name: "铁东区"
            },
            {
              code: "220322",
              name: "梨树县"
            },
            {
              code: "220323",
              name: "伊通满族自治县"
            },
            {
              code: "220382",
              name: "双辽市"
            }
          ]
        },
        {
          code: "2204",
          name: "辽源市",
          children: [
            {
              code: "220402",
              name: "龙山区"
            },
            {
              code: "220403",
              name: "西安区"
            },
            {
              code: "220421",
              name: "东丰县"
            },
            {
              code: "220422",
              name: "东辽县"
            }
          ]
        },
        {
          code: "2205",
          name: "通化市",
          children: [
            {
              code: "220502",
              name: "东昌区"
            },
            {
              code: "220503",
              name: "二道江区"
            },
            {
              code: "220521",
              name: "通化县"
            },
            {
              code: "220523",
              name: "辉南县"
            },
            {
              code: "220524",
              name: "柳河县"
            },
            {
              code: "220581",
              name: "梅河口市"
            },
            {
              code: "220582",
              name: "集安市"
            }
          ]
        },
        {
          code: "2206",
          name: "白山市",
          children: [
            {
              code: "220602",
              name: "浑江区"
            },
            {
              code: "220605",
              name: "江源区"
            },
            {
              code: "220621",
              name: "抚松县"
            },
            {
              code: "220622",
              name: "靖宇县"
            },
            {
              code: "220623",
              name: "长白朝鲜族自治县"
            },
            {
              code: "220681",
              name: "临江市"
            }
          ]
        },
        {
          code: "2207",
          name: "松原市",
          children: [
            {
              code: "220702",
              name: "宁江区"
            },
            {
              code: "220721",
              name: "前郭尔罗斯蒙古族自治县"
            },
            {
              code: "220722",
              name: "长岭县"
            },
            {
              code: "220723",
              name: "乾安县"
            },
            {
              code: "220771",
              name: "吉林松原经济开发区"
            },
            {
              code: "220781",
              name: "扶余市"
            }
          ]
        },
        {
          code: "2208",
          name: "白城市",
          children: [
            {
              code: "220802",
              name: "洮北区"
            },
            {
              code: "220821",
              name: "镇赉县"
            },
            {
              code: "220822",
              name: "通榆县"
            },
            {
              code: "220871",
              name: "吉林白城经济开发区"
            },
            {
              code: "220881",
              name: "洮南市"
            },
            {
              code: "220882",
              name: "大安市"
            }
          ]
        },
        {
          code: "2224",
          name: "延边朝鲜族自治州",
          children: [
            {
              code: "222401",
              name: "延吉市"
            },
            {
              code: "222402",
              name: "图们市"
            },
            {
              code: "222403",
              name: "敦化市"
            },
            {
              code: "222404",
              name: "珲春市"
            },
            {
              code: "222405",
              name: "龙井市"
            },
            {
              code: "222406",
              name: "和龙市"
            },
            {
              code: "222424",
              name: "汪清县"
            },
            {
              code: "222426",
              name: "安图县"
            }
          ]
        }
      ]
    },
    {
      code: "23",
      name: "黑龙江省",
      children: [
        {
          code: "2301",
          name: "哈尔滨市",
          children: [
            {
              code: "230102",
              name: "道里区"
            },
            {
              code: "230103",
              name: "南岗区"
            },
            {
              code: "230104",
              name: "道外区"
            },
            {
              code: "230108",
              name: "平房区"
            },
            {
              code: "230109",
              name: "松北区"
            },
            {
              code: "230110",
              name: "香坊区"
            },
            {
              code: "230111",
              name: "呼兰区"
            },
            {
              code: "230112",
              name: "阿城区"
            },
            {
              code: "230113",
              name: "双城区"
            },
            {
              code: "230123",
              name: "依兰县"
            },
            {
              code: "230124",
              name: "方正县"
            },
            {
              code: "230125",
              name: "宾县"
            },
            {
              code: "230126",
              name: "巴彦县"
            },
            {
              code: "230127",
              name: "木兰县"
            },
            {
              code: "230128",
              name: "通河县"
            },
            {
              code: "230129",
              name: "延寿县"
            },
            {
              code: "230183",
              name: "尚志市"
            },
            {
              code: "230184",
              name: "五常市"
            }
          ]
        },
        {
          code: "2302",
          name: "齐齐哈尔市",
          children: [
            {
              code: "230202",
              name: "龙沙区"
            },
            {
              code: "230203",
              name: "建华区"
            },
            {
              code: "230204",
              name: "铁锋区"
            },
            {
              code: "230205",
              name: "昂昂溪区"
            },
            {
              code: "230206",
              name: "富拉尔基区"
            },
            {
              code: "230207",
              name: "碾子山区"
            },
            {
              code: "230208",
              name: "梅里斯达斡尔族区"
            },
            {
              code: "230221",
              name: "龙江县"
            },
            {
              code: "230223",
              name: "依安县"
            },
            {
              code: "230224",
              name: "泰来县"
            },
            {
              code: "230225",
              name: "甘南县"
            },
            {
              code: "230227",
              name: "富裕县"
            },
            {
              code: "230229",
              name: "克山县"
            },
            {
              code: "230230",
              name: "克东县"
            },
            {
              code: "230231",
              name: "拜泉县"
            },
            {
              code: "230281",
              name: "讷河市"
            }
          ]
        },
        {
          code: "2303",
          name: "鸡西市",
          children: [
            {
              code: "230302",
              name: "鸡冠区"
            },
            {
              code: "230303",
              name: "恒山区"
            },
            {
              code: "230304",
              name: "滴道区"
            },
            {
              code: "230305",
              name: "梨树区"
            },
            {
              code: "230306",
              name: "城子河区"
            },
            {
              code: "230307",
              name: "麻山区"
            },
            {
              code: "230321",
              name: "鸡东县"
            },
            {
              code: "230381",
              name: "虎林市"
            },
            {
              code: "230382",
              name: "密山市"
            }
          ]
        },
        {
          code: "2304",
          name: "鹤岗市",
          children: [
            {
              code: "230402",
              name: "向阳区"
            },
            {
              code: "230403",
              name: "工农区"
            },
            {
              code: "230404",
              name: "南山区"
            },
            {
              code: "230405",
              name: "兴安区"
            },
            {
              code: "230406",
              name: "东山区"
            },
            {
              code: "230407",
              name: "兴山区"
            },
            {
              code: "230421",
              name: "萝北县"
            },
            {
              code: "230422",
              name: "绥滨县"
            }
          ]
        },
        {
          code: "2305",
          name: "双鸭山市",
          children: [
            {
              code: "230502",
              name: "尖山区"
            },
            {
              code: "230503",
              name: "岭东区"
            },
            {
              code: "230505",
              name: "四方台区"
            },
            {
              code: "230506",
              name: "宝山区"
            },
            {
              code: "230521",
              name: "集贤县"
            },
            {
              code: "230522",
              name: "友谊县"
            },
            {
              code: "230523",
              name: "宝清县"
            },
            {
              code: "230524",
              name: "饶河县"
            }
          ]
        },
        {
          code: "2306",
          name: "大庆市",
          children: [
            {
              code: "230602",
              name: "萨尔图区"
            },
            {
              code: "230603",
              name: "龙凤区"
            },
            {
              code: "230604",
              name: "让胡路区"
            },
            {
              code: "230605",
              name: "红岗区"
            },
            {
              code: "230606",
              name: "大同区"
            },
            {
              code: "230621",
              name: "肇州县"
            },
            {
              code: "230622",
              name: "肇源县"
            },
            {
              code: "230623",
              name: "林甸县"
            },
            {
              code: "230624",
              name: "杜尔伯特蒙古族自治县"
            },
            {
              code: "230671",
              name: "大庆高新技术产业开发区"
            }
          ]
        },
        {
          code: "2307",
          name: "伊春市",
          children: [
            {
              code: "230717",
              name: "伊美区"
            },
            {
              code: "230718",
              name: "乌翠区"
            },
            {
              code: "230719",
              name: "友好区"
            },
            {
              code: "230722",
              name: "嘉荫县"
            },
            {
              code: "230723",
              name: "汤旺县"
            },
            {
              code: "230724",
              name: "丰林县"
            },
            {
              code: "230725",
              name: "大箐山县"
            },
            {
              code: "230726",
              name: "南岔县"
            },
            {
              code: "230751",
              name: "金林区"
            },
            {
              code: "230781",
              name: "铁力市"
            }
          ]
        },
        {
          code: "2308",
          name: "佳木斯市",
          children: [
            {
              code: "230803",
              name: "向阳区"
            },
            {
              code: "230804",
              name: "前进区"
            },
            {
              code: "230805",
              name: "东风区"
            },
            {
              code: "230811",
              name: "郊区"
            },
            {
              code: "230822",
              name: "桦南县"
            },
            {
              code: "230826",
              name: "桦川县"
            },
            {
              code: "230828",
              name: "汤原县"
            },
            {
              code: "230881",
              name: "同江市"
            },
            {
              code: "230882",
              name: "富锦市"
            },
            {
              code: "230883",
              name: "抚远市"
            }
          ]
        },
        {
          code: "2309",
          name: "七台河市",
          children: [
            {
              code: "230902",
              name: "新兴区"
            },
            {
              code: "230903",
              name: "桃山区"
            },
            {
              code: "230904",
              name: "茄子河区"
            },
            {
              code: "230921",
              name: "勃利县"
            }
          ]
        },
        {
          code: "2310",
          name: "牡丹江市",
          children: [
            {
              code: "231002",
              name: "东安区"
            },
            {
              code: "231003",
              name: "阳明区"
            },
            {
              code: "231004",
              name: "爱民区"
            },
            {
              code: "231005",
              name: "西安区"
            },
            {
              code: "231025",
              name: "林口县"
            },
            {
              code: "231081",
              name: "绥芬河市"
            },
            {
              code: "231083",
              name: "海林市"
            },
            {
              code: "231084",
              name: "宁安市"
            },
            {
              code: "231085",
              name: "穆棱市"
            },
            {
              code: "231086",
              name: "东宁市"
            }
          ]
        },
        {
          code: "2311",
          name: "黑河市",
          children: [
            {
              code: "231102",
              name: "爱辉区"
            },
            {
              code: "231123",
              name: "逊克县"
            },
            {
              code: "231124",
              name: "孙吴县"
            },
            {
              code: "231181",
              name: "北安市"
            },
            {
              code: "231182",
              name: "五大连池市"
            },
            {
              code: "231183",
              name: "嫩江市"
            }
          ]
        },
        {
          code: "2312",
          name: "绥化市",
          children: [
            {
              code: "231202",
              name: "北林区"
            },
            {
              code: "231221",
              name: "望奎县"
            },
            {
              code: "231222",
              name: "兰西县"
            },
            {
              code: "231223",
              name: "青冈县"
            },
            {
              code: "231224",
              name: "庆安县"
            },
            {
              code: "231225",
              name: "明水县"
            },
            {
              code: "231226",
              name: "绥棱县"
            },
            {
              code: "231281",
              name: "安达市"
            },
            {
              code: "231282",
              name: "肇东市"
            },
            {
              code: "231283",
              name: "海伦市"
            }
          ]
        },
        {
          code: "2327",
          name: "大兴安岭地区",
          children: [
            {
              code: "232701",
              name: "漠河市"
            },
            {
              code: "232721",
              name: "呼玛县"
            },
            {
              code: "232722",
              name: "塔河县"
            },
            {
              code: "232761",
              name: "加格达奇区"
            },
            {
              code: "232762",
              name: "松岭区"
            },
            {
              code: "232763",
              name: "新林区"
            },
            {
              code: "232764",
              name: "呼中区"
            }
          ]
        }
      ]
    },
    {
      code: "31",
      name: "上海市",
      children: [
        {
          code: "3101",
          name: "市辖区",
          children: [
            {
              code: "310101",
              name: "黄浦区"
            },
            {
              code: "310104",
              name: "徐汇区"
            },
            {
              code: "310105",
              name: "长宁区"
            },
            {
              code: "310106",
              name: "静安区"
            },
            {
              code: "310107",
              name: "普陀区"
            },
            {
              code: "310109",
              name: "虹口区"
            },
            {
              code: "310110",
              name: "杨浦区"
            },
            {
              code: "310112",
              name: "闵行区"
            },
            {
              code: "310113",
              name: "宝山区"
            },
            {
              code: "310114",
              name: "嘉定区"
            },
            {
              code: "310115",
              name: "浦东新区"
            },
            {
              code: "310116",
              name: "金山区"
            },
            {
              code: "310117",
              name: "松江区"
            },
            {
              code: "310118",
              name: "青浦区"
            },
            {
              code: "310120",
              name: "奉贤区"
            },
            {
              code: "310151",
              name: "崇明区"
            }
          ]
        }
      ]
    },
    {
      code: "32",
      name: "江苏省",
      children: [
        {
          code: "3201",
          name: "南京市",
          children: [
            {
              code: "320102",
              name: "玄武区"
            },
            {
              code: "320104",
              name: "秦淮区"
            },
            {
              code: "320105",
              name: "建邺区"
            },
            {
              code: "320106",
              name: "鼓楼区"
            },
            {
              code: "320111",
              name: "浦口区"
            },
            {
              code: "320113",
              name: "栖霞区"
            },
            {
              code: "320114",
              name: "雨花台区"
            },
            {
              code: "320115",
              name: "江宁区"
            },
            {
              code: "320116",
              name: "六合区"
            },
            {
              code: "320117",
              name: "溧水区"
            },
            {
              code: "320118",
              name: "高淳区"
            }
          ]
        },
        {
          code: "3202",
          name: "无锡市",
          children: [
            {
              code: "320205",
              name: "锡山区"
            },
            {
              code: "320206",
              name: "惠山区"
            },
            {
              code: "320211",
              name: "滨湖区"
            },
            {
              code: "320213",
              name: "梁溪区"
            },
            {
              code: "320214",
              name: "新吴区"
            },
            {
              code: "320281",
              name: "江阴市"
            },
            {
              code: "320282",
              name: "宜兴市"
            }
          ]
        },
        {
          code: "3203",
          name: "徐州市",
          children: [
            {
              code: "320302",
              name: "鼓楼区"
            },
            {
              code: "320303",
              name: "云龙区"
            },
            {
              code: "320305",
              name: "贾汪区"
            },
            {
              code: "320311",
              name: "泉山区"
            },
            {
              code: "320312",
              name: "铜山区"
            },
            {
              code: "320321",
              name: "丰县"
            },
            {
              code: "320322",
              name: "沛县"
            },
            {
              code: "320324",
              name: "睢宁县"
            },
            {
              code: "320371",
              name: "徐州经济技术开发区"
            },
            {
              code: "320381",
              name: "新沂市"
            },
            {
              code: "320382",
              name: "邳州市"
            }
          ]
        },
        {
          code: "3204",
          name: "常州市",
          children: [
            {
              code: "320402",
              name: "天宁区"
            },
            {
              code: "320404",
              name: "钟楼区"
            },
            {
              code: "320411",
              name: "新北区"
            },
            {
              code: "320412",
              name: "武进区"
            },
            {
              code: "320413",
              name: "金坛区"
            },
            {
              code: "320481",
              name: "溧阳市"
            }
          ]
        },
        {
          code: "3205",
          name: "苏州市",
          children: [
            {
              code: "320505",
              name: "虎丘区"
            },
            {
              code: "320506",
              name: "吴中区"
            },
            {
              code: "320507",
              name: "相城区"
            },
            {
              code: "320508",
              name: "姑苏区"
            },
            {
              code: "320509",
              name: "吴江区"
            },
            {
              code: "320576",
              name: "苏州工业园区"
            },
            {
              code: "320581",
              name: "常熟市"
            },
            {
              code: "320582",
              name: "张家港市"
            },
            {
              code: "320583",
              name: "昆山市"
            },
            {
              code: "320585",
              name: "太仓市"
            }
          ]
        },
        {
          code: "3206",
          name: "南通市",
          children: [
            {
              code: "320612",
              name: "通州区"
            },
            {
              code: "320613",
              name: "崇川区"
            },
            {
              code: "320614",
              name: "海门区"
            },
            {
              code: "320623",
              name: "如东县"
            },
            {
              code: "320671",
              name: "南通经济技术开发区"
            },
            {
              code: "320681",
              name: "启东市"
            },
            {
              code: "320682",
              name: "如皋市"
            },
            {
              code: "320685",
              name: "海安市"
            }
          ]
        },
        {
          code: "3207",
          name: "连云港市",
          children: [
            {
              code: "320703",
              name: "连云区"
            },
            {
              code: "320706",
              name: "海州区"
            },
            {
              code: "320707",
              name: "赣榆区"
            },
            {
              code: "320722",
              name: "东海县"
            },
            {
              code: "320723",
              name: "灌云县"
            },
            {
              code: "320724",
              name: "灌南县"
            },
            {
              code: "320771",
              name: "连云港经济技术开发区"
            }
          ]
        },
        {
          code: "3208",
          name: "淮安市",
          children: [
            {
              code: "320803",
              name: "淮安区"
            },
            {
              code: "320804",
              name: "淮阴区"
            },
            {
              code: "320812",
              name: "清江浦区"
            },
            {
              code: "320813",
              name: "洪泽区"
            },
            {
              code: "320826",
              name: "涟水县"
            },
            {
              code: "320830",
              name: "盱眙县"
            },
            {
              code: "320831",
              name: "金湖县"
            },
            {
              code: "320871",
              name: "淮安经济技术开发区"
            }
          ]
        },
        {
          code: "3209",
          name: "盐城市",
          children: [
            {
              code: "320902",
              name: "亭湖区"
            },
            {
              code: "320903",
              name: "盐都区"
            },
            {
              code: "320904",
              name: "大丰区"
            },
            {
              code: "320921",
              name: "响水县"
            },
            {
              code: "320922",
              name: "滨海县"
            },
            {
              code: "320923",
              name: "阜宁县"
            },
            {
              code: "320924",
              name: "射阳县"
            },
            {
              code: "320925",
              name: "建湖县"
            },
            {
              code: "320971",
              name: "盐城经济技术开发区"
            },
            {
              code: "320981",
              name: "东台市"
            }
          ]
        },
        {
          code: "3210",
          name: "扬州市",
          children: [
            {
              code: "321002",
              name: "广陵区"
            },
            {
              code: "321003",
              name: "邗江区"
            },
            {
              code: "321012",
              name: "江都区"
            },
            {
              code: "321023",
              name: "宝应县"
            },
            {
              code: "321071",
              name: "扬州经济技术开发区"
            },
            {
              code: "321081",
              name: "仪征市"
            },
            {
              code: "321084",
              name: "高邮市"
            }
          ]
        },
        {
          code: "3211",
          name: "镇江市",
          children: [
            {
              code: "321102",
              name: "京口区"
            },
            {
              code: "321111",
              name: "润州区"
            },
            {
              code: "321112",
              name: "丹徒区"
            },
            {
              code: "321171",
              name: "镇江新区"
            },
            {
              code: "321181",
              name: "丹阳市"
            },
            {
              code: "321182",
              name: "扬中市"
            },
            {
              code: "321183",
              name: "句容市"
            }
          ]
        },
        {
          code: "3212",
          name: "泰州市",
          children: [
            {
              code: "321202",
              name: "海陵区"
            },
            {
              code: "321203",
              name: "高港区"
            },
            {
              code: "321204",
              name: "姜堰区"
            },
            {
              code: "321281",
              name: "兴化市"
            },
            {
              code: "321282",
              name: "靖江市"
            },
            {
              code: "321283",
              name: "泰兴市"
            }
          ]
        },
        {
          code: "3213",
          name: "宿迁市",
          children: [
            {
              code: "321302",
              name: "宿城区"
            },
            {
              code: "321311",
              name: "宿豫区"
            },
            {
              code: "321322",
              name: "沭阳县"
            },
            {
              code: "321323",
              name: "泗阳县"
            },
            {
              code: "321324",
              name: "泗洪县"
            },
            {
              code: "321371",
              name: "宿迁经济技术开发区"
            }
          ]
        }
      ]
    },
    {
      code: "33",
      name: "浙江省",
      children: [
        {
          code: "3301",
          name: "杭州市",
          children: [
            {
              code: "330102",
              name: "上城区"
            },
            {
              code: "330105",
              name: "拱墅区"
            },
            {
              code: "330106",
              name: "西湖区"
            },
            {
              code: "330108",
              name: "滨江区"
            },
            {
              code: "330109",
              name: "萧山区"
            },
            {
              code: "330110",
              name: "余杭区"
            },
            {
              code: "330111",
              name: "富阳区"
            },
            {
              code: "330112",
              name: "临安区"
            },
            {
              code: "330113",
              name: "临平区"
            },
            {
              code: "330114",
              name: "钱塘区"
            },
            {
              code: "330122",
              name: "桐庐县"
            },
            {
              code: "330127",
              name: "淳安县"
            },
            {
              code: "330182",
              name: "建德市"
            }
          ]
        },
        {
          code: "3302",
          name: "宁波市",
          children: [
            {
              code: "330203",
              name: "海曙区"
            },
            {
              code: "330205",
              name: "江北区"
            },
            {
              code: "330206",
              name: "北仑区"
            },
            {
              code: "330211",
              name: "镇海区"
            },
            {
              code: "330212",
              name: "鄞州区"
            },
            {
              code: "330213",
              name: "奉化区"
            },
            {
              code: "330225",
              name: "象山县"
            },
            {
              code: "330226",
              name: "宁海县"
            },
            {
              code: "330281",
              name: "余姚市"
            },
            {
              code: "330282",
              name: "慈溪市"
            }
          ]
        },
        {
          code: "3303",
          name: "温州市",
          children: [
            {
              code: "330302",
              name: "鹿城区"
            },
            {
              code: "330303",
              name: "龙湾区"
            },
            {
              code: "330304",
              name: "瓯海区"
            },
            {
              code: "330305",
              name: "洞头区"
            },
            {
              code: "330324",
              name: "永嘉县"
            },
            {
              code: "330326",
              name: "平阳县"
            },
            {
              code: "330327",
              name: "苍南县"
            },
            {
              code: "330328",
              name: "文成县"
            },
            {
              code: "330329",
              name: "泰顺县"
            },
            {
              code: "330381",
              name: "瑞安市"
            },
            {
              code: "330382",
              name: "乐清市"
            },
            {
              code: "330383",
              name: "龙港市"
            }
          ]
        },
        {
          code: "3304",
          name: "嘉兴市",
          children: [
            {
              code: "330402",
              name: "南湖区"
            },
            {
              code: "330411",
              name: "秀洲区"
            },
            {
              code: "330421",
              name: "嘉善县"
            },
            {
              code: "330424",
              name: "海盐县"
            },
            {
              code: "330481",
              name: "海宁市"
            },
            {
              code: "330482",
              name: "平湖市"
            },
            {
              code: "330483",
              name: "桐乡市"
            }
          ]
        },
        {
          code: "3305",
          name: "湖州市",
          children: [
            {
              code: "330502",
              name: "吴兴区"
            },
            {
              code: "330503",
              name: "南浔区"
            },
            {
              code: "330521",
              name: "德清县"
            },
            {
              code: "330522",
              name: "长兴县"
            },
            {
              code: "330523",
              name: "安吉县"
            }
          ]
        },
        {
          code: "3306",
          name: "绍兴市",
          children: [
            {
              code: "330602",
              name: "越城区"
            },
            {
              code: "330603",
              name: "柯桥区"
            },
            {
              code: "330604",
              name: "上虞区"
            },
            {
              code: "330624",
              name: "新昌县"
            },
            {
              code: "330681",
              name: "诸暨市"
            },
            {
              code: "330683",
              name: "嵊州市"
            }
          ]
        },
        {
          code: "3307",
          name: "金华市",
          children: [
            {
              code: "330702",
              name: "婺城区"
            },
            {
              code: "330703",
              name: "金东区"
            },
            {
              code: "330723",
              name: "武义县"
            },
            {
              code: "330726",
              name: "浦江县"
            },
            {
              code: "330727",
              name: "磐安县"
            },
            {
              code: "330781",
              name: "兰溪市"
            },
            {
              code: "330782",
              name: "义乌市"
            },
            {
              code: "330783",
              name: "东阳市"
            },
            {
              code: "330784",
              name: "永康市"
            }
          ]
        },
        {
          code: "3308",
          name: "衢州市",
          children: [
            {
              code: "330802",
              name: "柯城区"
            },
            {
              code: "330803",
              name: "衢江区"
            },
            {
              code: "330822",
              name: "常山县"
            },
            {
              code: "330824",
              name: "开化县"
            },
            {
              code: "330825",
              name: "龙游县"
            },
            {
              code: "330881",
              name: "江山市"
            }
          ]
        },
        {
          code: "3309",
          name: "舟山市",
          children: [
            {
              code: "330902",
              name: "定海区"
            },
            {
              code: "330903",
              name: "普陀区"
            },
            {
              code: "330921",
              name: "岱山县"
            },
            {
              code: "330922",
              name: "嵊泗县"
            }
          ]
        },
        {
          code: "3310",
          name: "台州市",
          children: [
            {
              code: "331002",
              name: "椒江区"
            },
            {
              code: "331003",
              name: "黄岩区"
            },
            {
              code: "331004",
              name: "路桥区"
            },
            {
              code: "331022",
              name: "三门县"
            },
            {
              code: "331023",
              name: "天台县"
            },
            {
              code: "331024",
              name: "仙居县"
            },
            {
              code: "331081",
              name: "温岭市"
            },
            {
              code: "331082",
              name: "临海市"
            },
            {
              code: "331083",
              name: "玉环市"
            }
          ]
        },
        {
          code: "3311",
          name: "丽水市",
          children: [
            {
              code: "331102",
              name: "莲都区"
            },
            {
              code: "331121",
              name: "青田县"
            },
            {
              code: "331122",
              name: "缙云县"
            },
            {
              code: "331123",
              name: "遂昌县"
            },
            {
              code: "331124",
              name: "松阳县"
            },
            {
              code: "331125",
              name: "云和县"
            },
            {
              code: "331126",
              name: "庆元县"
            },
            {
              code: "331127",
              name: "景宁畲族自治县"
            },
            {
              code: "331181",
              name: "龙泉市"
            }
          ]
        }
      ]
    },
    {
      code: "34",
      name: "安徽省",
      children: [
        {
          code: "3401",
          name: "合肥市",
          children: [
            {
              code: "340102",
              name: "瑶海区"
            },
            {
              code: "340103",
              name: "庐阳区"
            },
            {
              code: "340104",
              name: "蜀山区"
            },
            {
              code: "340111",
              name: "包河区"
            },
            {
              code: "340121",
              name: "长丰县"
            },
            {
              code: "340122",
              name: "肥东县"
            },
            {
              code: "340123",
              name: "肥西县"
            },
            {
              code: "340124",
              name: "庐江县"
            },
            {
              code: "340176",
              name: "合肥高新技术产业开发区"
            },
            {
              code: "340177",
              name: "合肥经济技术开发区"
            },
            {
              code: "340178",
              name: "合肥新站高新技术产业开发区"
            },
            {
              code: "340181",
              name: "巢湖市"
            }
          ]
        },
        {
          code: "3402",
          name: "芜湖市",
          children: [
            {
              code: "340202",
              name: "镜湖区"
            },
            {
              code: "340207",
              name: "鸠江区"
            },
            {
              code: "340209",
              name: "弋江区"
            },
            {
              code: "340210",
              name: "湾沚区"
            },
            {
              code: "340212",
              name: "繁昌区"
            },
            {
              code: "340223",
              name: "南陵县"
            },
            {
              code: "340271",
              name: "芜湖经济技术开发区"
            },
            {
              code: "340272",
              name: "安徽芜湖三山经济开发区"
            },
            {
              code: "340281",
              name: "无为市"
            }
          ]
        },
        {
          code: "3403",
          name: "蚌埠市",
          children: [
            {
              code: "340302",
              name: "龙子湖区"
            },
            {
              code: "340303",
              name: "蚌山区"
            },
            {
              code: "340304",
              name: "禹会区"
            },
            {
              code: "340311",
              name: "淮上区"
            },
            {
              code: "340321",
              name: "怀远县"
            },
            {
              code: "340322",
              name: "五河县"
            },
            {
              code: "340323",
              name: "固镇县"
            },
            {
              code: "340371",
              name: "蚌埠市高新技术开发区"
            },
            {
              code: "340372",
              name: "蚌埠市经济开发区"
            }
          ]
        },
        {
          code: "3404",
          name: "淮南市",
          children: [
            {
              code: "340402",
              name: "大通区"
            },
            {
              code: "340403",
              name: "田家庵区"
            },
            {
              code: "340404",
              name: "谢家集区"
            },
            {
              code: "340405",
              name: "八公山区"
            },
            {
              code: "340406",
              name: "潘集区"
            },
            {
              code: "340421",
              name: "凤台县"
            },
            {
              code: "340422",
              name: "寿县"
            }
          ]
        },
        {
          code: "3405",
          name: "马鞍山市",
          children: [
            {
              code: "340503",
              name: "花山区"
            },
            {
              code: "340504",
              name: "雨山区"
            },
            {
              code: "340506",
              name: "博望区"
            },
            {
              code: "340521",
              name: "当涂县"
            },
            {
              code: "340522",
              name: "含山县"
            },
            {
              code: "340523",
              name: "和县"
            }
          ]
        },
        {
          code: "3406",
          name: "淮北市",
          children: [
            {
              code: "340602",
              name: "杜集区"
            },
            {
              code: "340603",
              name: "相山区"
            },
            {
              code: "340604",
              name: "烈山区"
            },
            {
              code: "340621",
              name: "濉溪县"
            }
          ]
        },
        {
          code: "3407",
          name: "铜陵市",
          children: [
            {
              code: "340705",
              name: "铜官区"
            },
            {
              code: "340706",
              name: "义安区"
            },
            {
              code: "340711",
              name: "郊区"
            },
            {
              code: "340722",
              name: "枞阳县"
            }
          ]
        },
        {
          code: "3408",
          name: "安庆市",
          children: [
            {
              code: "340802",
              name: "迎江区"
            },
            {
              code: "340803",
              name: "大观区"
            },
            {
              code: "340811",
              name: "宜秀区"
            },
            {
              code: "340822",
              name: "怀宁县"
            },
            {
              code: "340825",
              name: "太湖县"
            },
            {
              code: "340826",
              name: "宿松县"
            },
            {
              code: "340827",
              name: "望江县"
            },
            {
              code: "340828",
              name: "岳西县"
            },
            {
              code: "340871",
              name: "安徽安庆经济开发区"
            },
            {
              code: "340881",
              name: "桐城市"
            },
            {
              code: "340882",
              name: "潜山市"
            }
          ]
        },
        {
          code: "3410",
          name: "黄山市",
          children: [
            {
              code: "341002",
              name: "屯溪区"
            },
            {
              code: "341003",
              name: "黄山区"
            },
            {
              code: "341004",
              name: "徽州区"
            },
            {
              code: "341021",
              name: "歙县"
            },
            {
              code: "341022",
              name: "休宁县"
            },
            {
              code: "341023",
              name: "黟县"
            },
            {
              code: "341024",
              name: "祁门县"
            }
          ]
        },
        {
          code: "3411",
          name: "滁州市",
          children: [
            {
              code: "341102",
              name: "琅琊区"
            },
            {
              code: "341103",
              name: "南谯区"
            },
            {
              code: "341122",
              name: "来安县"
            },
            {
              code: "341124",
              name: "全椒县"
            },
            {
              code: "341125",
              name: "定远县"
            },
            {
              code: "341126",
              name: "凤阳县"
            },
            {
              code: "341171",
              name: "中新苏滁高新技术产业开发区"
            },
            {
              code: "341172",
              name: "滁州经济技术开发区"
            },
            {
              code: "341181",
              name: "天长市"
            },
            {
              code: "341182",
              name: "明光市"
            }
          ]
        },
        {
          code: "3412",
          name: "阜阳市",
          children: [
            {
              code: "341202",
              name: "颍州区"
            },
            {
              code: "341203",
              name: "颍东区"
            },
            {
              code: "341204",
              name: "颍泉区"
            },
            {
              code: "341221",
              name: "临泉县"
            },
            {
              code: "341222",
              name: "太和县"
            },
            {
              code: "341225",
              name: "阜南县"
            },
            {
              code: "341226",
              name: "颍上县"
            },
            {
              code: "341271",
              name: "阜阳合肥现代产业园区"
            },
            {
              code: "341272",
              name: "阜阳经济技术开发区"
            },
            {
              code: "341282",
              name: "界首市"
            }
          ]
        },
        {
          code: "3413",
          name: "宿州市",
          children: [
            {
              code: "341302",
              name: "埇桥区"
            },
            {
              code: "341321",
              name: "砀山县"
            },
            {
              code: "341322",
              name: "萧县"
            },
            {
              code: "341323",
              name: "灵璧县"
            },
            {
              code: "341324",
              name: "泗县"
            },
            {
              code: "341371",
              name: "宿州马鞍山现代产业园区"
            },
            {
              code: "341372",
              name: "宿州经济技术开发区"
            }
          ]
        },
        {
          code: "3415",
          name: "六安市",
          children: [
            {
              code: "341502",
              name: "金安区"
            },
            {
              code: "341503",
              name: "裕安区"
            },
            {
              code: "341504",
              name: "叶集区"
            },
            {
              code: "341522",
              name: "霍邱县"
            },
            {
              code: "341523",
              name: "舒城县"
            },
            {
              code: "341524",
              name: "金寨县"
            },
            {
              code: "341525",
              name: "霍山县"
            }
          ]
        },
        {
          code: "3416",
          name: "亳州市",
          children: [
            {
              code: "341602",
              name: "谯城区"
            },
            {
              code: "341621",
              name: "涡阳县"
            },
            {
              code: "341622",
              name: "蒙城县"
            },
            {
              code: "341623",
              name: "利辛县"
            }
          ]
        },
        {
          code: "3417",
          name: "池州市",
          children: [
            {
              code: "341702",
              name: "贵池区"
            },
            {
              code: "341721",
              name: "东至县"
            },
            {
              code: "341722",
              name: "石台县"
            },
            {
              code: "341723",
              name: "青阳县"
            }
          ]
        },
        {
          code: "3418",
          name: "宣城市",
          children: [
            {
              code: "341802",
              name: "宣州区"
            },
            {
              code: "341821",
              name: "郎溪县"
            },
            {
              code: "341823",
              name: "泾县"
            },
            {
              code: "341824",
              name: "绩溪县"
            },
            {
              code: "341825",
              name: "旌德县"
            },
            {
              code: "341871",
              name: "宣城市经济开发区"
            },
            {
              code: "341881",
              name: "宁国市"
            },
            {
              code: "341882",
              name: "广德市"
            }
          ]
        }
      ]
    },
    {
      code: "35",
      name: "福建省",
      children: [
        {
          code: "3501",
          name: "福州市",
          children: [
            {
              code: "350102",
              name: "鼓楼区"
            },
            {
              code: "350103",
              name: "台江区"
            },
            {
              code: "350104",
              name: "仓山区"
            },
            {
              code: "350105",
              name: "马尾区"
            },
            {
              code: "350111",
              name: "晋安区"
            },
            {
              code: "350112",
              name: "长乐区"
            },
            {
              code: "350121",
              name: "闽侯县"
            },
            {
              code: "350122",
              name: "连江县"
            },
            {
              code: "350123",
              name: "罗源县"
            },
            {
              code: "350124",
              name: "闽清县"
            },
            {
              code: "350125",
              name: "永泰县"
            },
            {
              code: "350128",
              name: "平潭县"
            },
            {
              code: "350181",
              name: "福清市"
            }
          ]
        },
        {
          code: "3502",
          name: "厦门市",
          children: [
            {
              code: "350203",
              name: "思明区"
            },
            {
              code: "350205",
              name: "海沧区"
            },
            {
              code: "350206",
              name: "湖里区"
            },
            {
              code: "350211",
              name: "集美区"
            },
            {
              code: "350212",
              name: "同安区"
            },
            {
              code: "350213",
              name: "翔安区"
            }
          ]
        },
        {
          code: "3503",
          name: "莆田市",
          children: [
            {
              code: "350302",
              name: "城厢区"
            },
            {
              code: "350303",
              name: "涵江区"
            },
            {
              code: "350304",
              name: "荔城区"
            },
            {
              code: "350305",
              name: "秀屿区"
            },
            {
              code: "350322",
              name: "仙游县"
            }
          ]
        },
        {
          code: "3504",
          name: "三明市",
          children: [
            {
              code: "350404",
              name: "三元区"
            },
            {
              code: "350405",
              name: "沙县区"
            },
            {
              code: "350421",
              name: "明溪县"
            },
            {
              code: "350423",
              name: "清流县"
            },
            {
              code: "350424",
              name: "宁化县"
            },
            {
              code: "350425",
              name: "大田县"
            },
            {
              code: "350426",
              name: "尤溪县"
            },
            {
              code: "350428",
              name: "将乐县"
            },
            {
              code: "350429",
              name: "泰宁县"
            },
            {
              code: "350430",
              name: "建宁县"
            },
            {
              code: "350481",
              name: "永安市"
            }
          ]
        },
        {
          code: "3505",
          name: "泉州市",
          children: [
            {
              code: "350502",
              name: "鲤城区"
            },
            {
              code: "350503",
              name: "丰泽区"
            },
            {
              code: "350504",
              name: "洛江区"
            },
            {
              code: "350505",
              name: "泉港区"
            },
            {
              code: "350521",
              name: "惠安县"
            },
            {
              code: "350524",
              name: "安溪县"
            },
            {
              code: "350525",
              name: "永春县"
            },
            {
              code: "350526",
              name: "德化县"
            },
            {
              code: "350527",
              name: "金门县"
            },
            {
              code: "350581",
              name: "石狮市"
            },
            {
              code: "350582",
              name: "晋江市"
            },
            {
              code: "350583",
              name: "南安市"
            }
          ]
        },
        {
          code: "3506",
          name: "漳州市",
          children: [
            {
              code: "350602",
              name: "芗城区"
            },
            {
              code: "350603",
              name: "龙文区"
            },
            {
              code: "350604",
              name: "龙海区"
            },
            {
              code: "350605",
              name: "长泰区"
            },
            {
              code: "350622",
              name: "云霄县"
            },
            {
              code: "350623",
              name: "漳浦县"
            },
            {
              code: "350624",
              name: "诏安县"
            },
            {
              code: "350626",
              name: "东山县"
            },
            {
              code: "350627",
              name: "南靖县"
            },
            {
              code: "350628",
              name: "平和县"
            },
            {
              code: "350629",
              name: "华安县"
            }
          ]
        },
        {
          code: "3507",
          name: "南平市",
          children: [
            {
              code: "350702",
              name: "延平区"
            },
            {
              code: "350703",
              name: "建阳区"
            },
            {
              code: "350721",
              name: "顺昌县"
            },
            {
              code: "350722",
              name: "浦城县"
            },
            {
              code: "350723",
              name: "光泽县"
            },
            {
              code: "350724",
              name: "松溪县"
            },
            {
              code: "350725",
              name: "政和县"
            },
            {
              code: "350781",
              name: "邵武市"
            },
            {
              code: "350782",
              name: "武夷山市"
            },
            {
              code: "350783",
              name: "建瓯市"
            }
          ]
        },
        {
          code: "3508",
          name: "龙岩市",
          children: [
            {
              code: "350802",
              name: "新罗区"
            },
            {
              code: "350803",
              name: "永定区"
            },
            {
              code: "350821",
              name: "长汀县"
            },
            {
              code: "350823",
              name: "上杭县"
            },
            {
              code: "350824",
              name: "武平县"
            },
            {
              code: "350825",
              name: "连城县"
            },
            {
              code: "350881",
              name: "漳平市"
            }
          ]
        },
        {
          code: "3509",
          name: "宁德市",
          children: [
            {
              code: "350902",
              name: "蕉城区"
            },
            {
              code: "350921",
              name: "霞浦县"
            },
            {
              code: "350922",
              name: "古田县"
            },
            {
              code: "350923",
              name: "屏南县"
            },
            {
              code: "350924",
              name: "寿宁县"
            },
            {
              code: "350925",
              name: "周宁县"
            },
            {
              code: "350926",
              name: "柘荣县"
            },
            {
              code: "350981",
              name: "福安市"
            },
            {
              code: "350982",
              name: "福鼎市"
            }
          ]
        }
      ]
    },
    {
      code: "36",
      name: "江西省",
      children: [
        {
          code: "3601",
          name: "南昌市",
          children: [
            {
              code: "360102",
              name: "东湖区"
            },
            {
              code: "360103",
              name: "西湖区"
            },
            {
              code: "360104",
              name: "青云谱区"
            },
            {
              code: "360111",
              name: "青山湖区"
            },
            {
              code: "360112",
              name: "新建区"
            },
            {
              code: "360113",
              name: "红谷滩区"
            },
            {
              code: "360121",
              name: "南昌县"
            },
            {
              code: "360123",
              name: "安义县"
            },
            {
              code: "360124",
              name: "进贤县"
            }
          ]
        },
        {
          code: "3602",
          name: "景德镇市",
          children: [
            {
              code: "360202",
              name: "昌江区"
            },
            {
              code: "360203",
              name: "珠山区"
            },
            {
              code: "360222",
              name: "浮梁县"
            },
            {
              code: "360281",
              name: "乐平市"
            }
          ]
        },
        {
          code: "3603",
          name: "萍乡市",
          children: [
            {
              code: "360302",
              name: "安源区"
            },
            {
              code: "360313",
              name: "湘东区"
            },
            {
              code: "360321",
              name: "莲花县"
            },
            {
              code: "360322",
              name: "上栗县"
            },
            {
              code: "360323",
              name: "芦溪县"
            }
          ]
        },
        {
          code: "3604",
          name: "九江市",
          children: [
            {
              code: "360402",
              name: "濂溪区"
            },
            {
              code: "360403",
              name: "浔阳区"
            },
            {
              code: "360404",
              name: "柴桑区"
            },
            {
              code: "360423",
              name: "武宁县"
            },
            {
              code: "360424",
              name: "修水县"
            },
            {
              code: "360425",
              name: "永修县"
            },
            {
              code: "360426",
              name: "德安县"
            },
            {
              code: "360428",
              name: "都昌县"
            },
            {
              code: "360429",
              name: "湖口县"
            },
            {
              code: "360430",
              name: "彭泽县"
            },
            {
              code: "360481",
              name: "瑞昌市"
            },
            {
              code: "360482",
              name: "共青城市"
            },
            {
              code: "360483",
              name: "庐山市"
            }
          ]
        },
        {
          code: "3605",
          name: "新余市",
          children: [
            {
              code: "360502",
              name: "渝水区"
            },
            {
              code: "360521",
              name: "分宜县"
            }
          ]
        },
        {
          code: "3606",
          name: "鹰潭市",
          children: [
            {
              code: "360602",
              name: "月湖区"
            },
            {
              code: "360603",
              name: "余江区"
            },
            {
              code: "360681",
              name: "贵溪市"
            }
          ]
        },
        {
          code: "3607",
          name: "赣州市",
          children: [
            {
              code: "360702",
              name: "章贡区"
            },
            {
              code: "360703",
              name: "南康区"
            },
            {
              code: "360704",
              name: "赣县区"
            },
            {
              code: "360722",
              name: "信丰县"
            },
            {
              code: "360723",
              name: "大余县"
            },
            {
              code: "360724",
              name: "上犹县"
            },
            {
              code: "360725",
              name: "崇义县"
            },
            {
              code: "360726",
              name: "安远县"
            },
            {
              code: "360728",
              name: "定南县"
            },
            {
              code: "360729",
              name: "全南县"
            },
            {
              code: "360730",
              name: "宁都县"
            },
            {
              code: "360731",
              name: "于都县"
            },
            {
              code: "360732",
              name: "兴国县"
            },
            {
              code: "360733",
              name: "会昌县"
            },
            {
              code: "360734",
              name: "寻乌县"
            },
            {
              code: "360735",
              name: "石城县"
            },
            {
              code: "360781",
              name: "瑞金市"
            },
            {
              code: "360783",
              name: "龙南市"
            }
          ]
        },
        {
          code: "3608",
          name: "吉安市",
          children: [
            {
              code: "360802",
              name: "吉州区"
            },
            {
              code: "360803",
              name: "青原区"
            },
            {
              code: "360821",
              name: "吉安县"
            },
            {
              code: "360822",
              name: "吉水县"
            },
            {
              code: "360823",
              name: "峡江县"
            },
            {
              code: "360824",
              name: "新干县"
            },
            {
              code: "360825",
              name: "永丰县"
            },
            {
              code: "360826",
              name: "泰和县"
            },
            {
              code: "360827",
              name: "遂川县"
            },
            {
              code: "360828",
              name: "万安县"
            },
            {
              code: "360829",
              name: "安福县"
            },
            {
              code: "360830",
              name: "永新县"
            },
            {
              code: "360881",
              name: "井冈山市"
            }
          ]
        },
        {
          code: "3609",
          name: "宜春市",
          children: [
            {
              code: "360902",
              name: "袁州区"
            },
            {
              code: "360921",
              name: "奉新县"
            },
            {
              code: "360922",
              name: "万载县"
            },
            {
              code: "360923",
              name: "上高县"
            },
            {
              code: "360924",
              name: "宜丰县"
            },
            {
              code: "360925",
              name: "靖安县"
            },
            {
              code: "360926",
              name: "铜鼓县"
            },
            {
              code: "360981",
              name: "丰城市"
            },
            {
              code: "360982",
              name: "樟树市"
            },
            {
              code: "360983",
              name: "高安市"
            }
          ]
        },
        {
          code: "3610",
          name: "抚州市",
          children: [
            {
              code: "361002",
              name: "临川区"
            },
            {
              code: "361003",
              name: "东乡区"
            },
            {
              code: "361021",
              name: "南城县"
            },
            {
              code: "361022",
              name: "黎川县"
            },
            {
              code: "361023",
              name: "南丰县"
            },
            {
              code: "361024",
              name: "崇仁县"
            },
            {
              code: "361025",
              name: "乐安县"
            },
            {
              code: "361026",
              name: "宜黄县"
            },
            {
              code: "361027",
              name: "金溪县"
            },
            {
              code: "361028",
              name: "资溪县"
            },
            {
              code: "361030",
              name: "广昌县"
            }
          ]
        },
        {
          code: "3611",
          name: "上饶市",
          children: [
            {
              code: "361102",
              name: "信州区"
            },
            {
              code: "361103",
              name: "广丰区"
            },
            {
              code: "361104",
              name: "广信区"
            },
            {
              code: "361123",
              name: "玉山县"
            },
            {
              code: "361124",
              name: "铅山县"
            },
            {
              code: "361125",
              name: "横峰县"
            },
            {
              code: "361126",
              name: "弋阳县"
            },
            {
              code: "361127",
              name: "余干县"
            },
            {
              code: "361128",
              name: "鄱阳县"
            },
            {
              code: "361129",
              name: "万年县"
            },
            {
              code: "361130",
              name: "婺源县"
            },
            {
              code: "361181",
              name: "德兴市"
            }
          ]
        }
      ]
    },
    {
      code: "37",
      name: "山东省",
      children: [
        {
          code: "3701",
          name: "济南市",
          children: [
            {
              code: "370102",
              name: "历下区"
            },
            {
              code: "370103",
              name: "市中区"
            },
            {
              code: "370104",
              name: "槐荫区"
            },
            {
              code: "370105",
              name: "天桥区"
            },
            {
              code: "370112",
              name: "历城区"
            },
            {
              code: "370113",
              name: "长清区"
            },
            {
              code: "370114",
              name: "章丘区"
            },
            {
              code: "370115",
              name: "济阳区"
            },
            {
              code: "370116",
              name: "莱芜区"
            },
            {
              code: "370117",
              name: "钢城区"
            },
            {
              code: "370124",
              name: "平阴县"
            },
            {
              code: "370126",
              name: "商河县"
            },
            {
              code: "370176",
              name: "济南高新技术产业开发区"
            }
          ]
        },
        {
          code: "3702",
          name: "青岛市",
          children: [
            {
              code: "370202",
              name: "市南区"
            },
            {
              code: "370203",
              name: "市北区"
            },
            {
              code: "370211",
              name: "黄岛区"
            },
            {
              code: "370212",
              name: "崂山区"
            },
            {
              code: "370213",
              name: "李沧区"
            },
            {
              code: "370214",
              name: "城阳区"
            },
            {
              code: "370215",
              name: "即墨区"
            },
            {
              code: "370281",
              name: "胶州市"
            },
            {
              code: "370283",
              name: "平度市"
            },
            {
              code: "370285",
              name: "莱西市"
            }
          ]
        },
        {
          code: "3703",
          name: "淄博市",
          children: [
            {
              code: "370302",
              name: "淄川区"
            },
            {
              code: "370303",
              name: "张店区"
            },
            {
              code: "370304",
              name: "博山区"
            },
            {
              code: "370305",
              name: "临淄区"
            },
            {
              code: "370306",
              name: "周村区"
            },
            {
              code: "370321",
              name: "桓台县"
            },
            {
              code: "370322",
              name: "高青县"
            },
            {
              code: "370323",
              name: "沂源县"
            }
          ]
        },
        {
          code: "3704",
          name: "枣庄市",
          children: [
            {
              code: "370402",
              name: "市中区"
            },
            {
              code: "370403",
              name: "薛城区"
            },
            {
              code: "370404",
              name: "峄城区"
            },
            {
              code: "370405",
              name: "台儿庄区"
            },
            {
              code: "370406",
              name: "山亭区"
            },
            {
              code: "370481",
              name: "滕州市"
            }
          ]
        },
        {
          code: "3705",
          name: "东营市",
          children: [
            {
              code: "370502",
              name: "东营区"
            },
            {
              code: "370503",
              name: "河口区"
            },
            {
              code: "370505",
              name: "垦利区"
            },
            {
              code: "370522",
              name: "利津县"
            },
            {
              code: "370523",
              name: "广饶县"
            },
            {
              code: "370571",
              name: "东营经济技术开发区"
            },
            {
              code: "370572",
              name: "东营港经济开发区"
            }
          ]
        },
        {
          code: "3706",
          name: "烟台市",
          children: [
            {
              code: "370602",
              name: "芝罘区"
            },
            {
              code: "370611",
              name: "福山区"
            },
            {
              code: "370612",
              name: "牟平区"
            },
            {
              code: "370613",
              name: "莱山区"
            },
            {
              code: "370614",
              name: "蓬莱区"
            },
            {
              code: "370671",
              name: "烟台高新技术产业开发区"
            },
            {
              code: "370676",
              name: "烟台经济技术开发区"
            },
            {
              code: "370681",
              name: "龙口市"
            },
            {
              code: "370682",
              name: "莱阳市"
            },
            {
              code: "370683",
              name: "莱州市"
            },
            {
              code: "370685",
              name: "招远市"
            },
            {
              code: "370686",
              name: "栖霞市"
            },
            {
              code: "370687",
              name: "海阳市"
            }
          ]
        },
        {
          code: "3707",
          name: "潍坊市",
          children: [
            {
              code: "370702",
              name: "潍城区"
            },
            {
              code: "370703",
              name: "寒亭区"
            },
            {
              code: "370704",
              name: "坊子区"
            },
            {
              code: "370705",
              name: "奎文区"
            },
            {
              code: "370724",
              name: "临朐县"
            },
            {
              code: "370725",
              name: "昌乐县"
            },
            {
              code: "370772",
              name: "潍坊滨海经济技术开发区"
            },
            {
              code: "370781",
              name: "青州市"
            },
            {
              code: "370782",
              name: "诸城市"
            },
            {
              code: "370783",
              name: "寿光市"
            },
            {
              code: "370784",
              name: "安丘市"
            },
            {
              code: "370785",
              name: "高密市"
            },
            {
              code: "370786",
              name: "昌邑市"
            }
          ]
        },
        {
          code: "3708",
          name: "济宁市",
          children: [
            {
              code: "370811",
              name: "任城区"
            },
            {
              code: "370812",
              name: "兖州区"
            },
            {
              code: "370826",
              name: "微山县"
            },
            {
              code: "370827",
              name: "鱼台县"
            },
            {
              code: "370828",
              name: "金乡县"
            },
            {
              code: "370829",
              name: "嘉祥县"
            },
            {
              code: "370830",
              name: "汶上县"
            },
            {
              code: "370831",
              name: "泗水县"
            },
            {
              code: "370832",
              name: "梁山县"
            },
            {
              code: "370871",
              name: "济宁高新技术产业开发区"
            },
            {
              code: "370881",
              name: "曲阜市"
            },
            {
              code: "370883",
              name: "邹城市"
            }
          ]
        },
        {
          code: "3709",
          name: "泰安市",
          children: [
            {
              code: "370902",
              name: "泰山区"
            },
            {
              code: "370911",
              name: "岱岳区"
            },
            {
              code: "370921",
              name: "宁阳县"
            },
            {
              code: "370923",
              name: "东平县"
            },
            {
              code: "370982",
              name: "新泰市"
            },
            {
              code: "370983",
              name: "肥城市"
            }
          ]
        },
        {
          code: "3710",
          name: "威海市",
          children: [
            {
              code: "371002",
              name: "环翠区"
            },
            {
              code: "371003",
              name: "文登区"
            },
            {
              code: "371071",
              name: "威海火炬高技术产业开发区"
            },
            {
              code: "371072",
              name: "威海经济技术开发区"
            },
            {
              code: "371073",
              name: "威海临港经济技术开发区"
            },
            {
              code: "371082",
              name: "荣成市"
            },
            {
              code: "371083",
              name: "乳山市"
            }
          ]
        },
        {
          code: "3711",
          name: "日照市",
          children: [
            {
              code: "371102",
              name: "东港区"
            },
            {
              code: "371103",
              name: "岚山区"
            },
            {
              code: "371121",
              name: "五莲县"
            },
            {
              code: "371122",
              name: "莒县"
            },
            {
              code: "371171",
              name: "日照经济技术开发区"
            }
          ]
        },
        {
          code: "3713",
          name: "临沂市",
          children: [
            {
              code: "371302",
              name: "兰山区"
            },
            {
              code: "371311",
              name: "罗庄区"
            },
            {
              code: "371312",
              name: "河东区"
            },
            {
              code: "371321",
              name: "沂南县"
            },
            {
              code: "371322",
              name: "郯城县"
            },
            {
              code: "371323",
              name: "沂水县"
            },
            {
              code: "371324",
              name: "兰陵县"
            },
            {
              code: "371325",
              name: "费县"
            },
            {
              code: "371326",
              name: "平邑县"
            },
            {
              code: "371327",
              name: "莒南县"
            },
            {
              code: "371328",
              name: "蒙阴县"
            },
            {
              code: "371329",
              name: "临沭县"
            },
            {
              code: "371371",
              name: "临沂高新技术产业开发区"
            }
          ]
        },
        {
          code: "3714",
          name: "德州市",
          children: [
            {
              code: "371402",
              name: "德城区"
            },
            {
              code: "371403",
              name: "陵城区"
            },
            {
              code: "371422",
              name: "宁津县"
            },
            {
              code: "371423",
              name: "庆云县"
            },
            {
              code: "371424",
              name: "临邑县"
            },
            {
              code: "371425",
              name: "齐河县"
            },
            {
              code: "371426",
              name: "平原县"
            },
            {
              code: "371427",
              name: "夏津县"
            },
            {
              code: "371428",
              name: "武城县"
            },
            {
              code: "371471",
              name: "德州天衢新区"
            },
            {
              code: "371481",
              name: "乐陵市"
            },
            {
              code: "371482",
              name: "禹城市"
            }
          ]
        },
        {
          code: "3715",
          name: "聊城市",
          children: [
            {
              code: "371502",
              name: "东昌府区"
            },
            {
              code: "371503",
              name: "茌平区"
            },
            {
              code: "371521",
              name: "阳谷县"
            },
            {
              code: "371522",
              name: "莘县"
            },
            {
              code: "371524",
              name: "东阿县"
            },
            {
              code: "371525",
              name: "冠县"
            },
            {
              code: "371526",
              name: "高唐县"
            },
            {
              code: "371581",
              name: "临清市"
            }
          ]
        },
        {
          code: "3716",
          name: "滨州市",
          children: [
            {
              code: "371602",
              name: "滨城区"
            },
            {
              code: "371603",
              name: "沾化区"
            },
            {
              code: "371621",
              name: "惠民县"
            },
            {
              code: "371622",
              name: "阳信县"
            },
            {
              code: "371623",
              name: "无棣县"
            },
            {
              code: "371625",
              name: "博兴县"
            },
            {
              code: "371681",
              name: "邹平市"
            }
          ]
        },
        {
          code: "3717",
          name: "菏泽市",
          children: [
            {
              code: "371702",
              name: "牡丹区"
            },
            {
              code: "371703",
              name: "定陶区"
            },
            {
              code: "371721",
              name: "曹县"
            },
            {
              code: "371722",
              name: "单县"
            },
            {
              code: "371723",
              name: "成武县"
            },
            {
              code: "371724",
              name: "巨野县"
            },
            {
              code: "371725",
              name: "郓城县"
            },
            {
              code: "371726",
              name: "鄄城县"
            },
            {
              code: "371728",
              name: "东明县"
            },
            {
              code: "371771",
              name: "菏泽经济技术开发区"
            },
            {
              code: "371772",
              name: "菏泽高新技术开发区"
            }
          ]
        }
      ]
    },
    {
      code: "41",
      name: "河南省",
      children: [
        {
          code: "4101",
          name: "郑州市",
          children: [
            {
              code: "410102",
              name: "中原区"
            },
            {
              code: "410103",
              name: "二七区"
            },
            {
              code: "410104",
              name: "管城回族区"
            },
            {
              code: "410105",
              name: "金水区"
            },
            {
              code: "410106",
              name: "上街区"
            },
            {
              code: "410108",
              name: "惠济区"
            },
            {
              code: "410122",
              name: "中牟县"
            },
            {
              code: "410171",
              name: "郑州经济技术开发区"
            },
            {
              code: "410172",
              name: "郑州高新技术产业开发区"
            },
            {
              code: "410173",
              name: "郑州航空港经济综合实验区"
            },
            {
              code: "410181",
              name: "巩义市"
            },
            {
              code: "410182",
              name: "荥阳市"
            },
            {
              code: "410183",
              name: "新密市"
            },
            {
              code: "410184",
              name: "新郑市"
            },
            {
              code: "410185",
              name: "登封市"
            }
          ]
        },
        {
          code: "4102",
          name: "开封市",
          children: [
            {
              code: "410202",
              name: "龙亭区"
            },
            {
              code: "410203",
              name: "顺河回族区"
            },
            {
              code: "410204",
              name: "鼓楼区"
            },
            {
              code: "410205",
              name: "禹王台区"
            },
            {
              code: "410212",
              name: "祥符区"
            },
            {
              code: "410221",
              name: "杞县"
            },
            {
              code: "410222",
              name: "通许县"
            },
            {
              code: "410223",
              name: "尉氏县"
            },
            {
              code: "410225",
              name: "兰考县"
            }
          ]
        },
        {
          code: "4103",
          name: "洛阳市",
          children: [
            {
              code: "410302",
              name: "老城区"
            },
            {
              code: "410303",
              name: "西工区"
            },
            {
              code: "410304",
              name: "瀍河回族区"
            },
            {
              code: "410305",
              name: "涧西区"
            },
            {
              code: "410307",
              name: "偃师区"
            },
            {
              code: "410308",
              name: "孟津区"
            },
            {
              code: "410311",
              name: "洛龙区"
            },
            {
              code: "410323",
              name: "新安县"
            },
            {
              code: "410324",
              name: "栾川县"
            },
            {
              code: "410325",
              name: "嵩县"
            },
            {
              code: "410326",
              name: "汝阳县"
            },
            {
              code: "410327",
              name: "宜阳县"
            },
            {
              code: "410328",
              name: "洛宁县"
            },
            {
              code: "410329",
              name: "伊川县"
            },
            {
              code: "410371",
              name: "洛阳高新技术产业开发区"
            }
          ]
        },
        {
          code: "4104",
          name: "平顶山市",
          children: [
            {
              code: "410402",
              name: "新华区"
            },
            {
              code: "410403",
              name: "卫东区"
            },
            {
              code: "410404",
              name: "石龙区"
            },
            {
              code: "410411",
              name: "湛河区"
            },
            {
              code: "410421",
              name: "宝丰县"
            },
            {
              code: "410422",
              name: "叶县"
            },
            {
              code: "410423",
              name: "鲁山县"
            },
            {
              code: "410425",
              name: "郏县"
            },
            {
              code: "410471",
              name: "平顶山高新技术产业开发区"
            },
            {
              code: "410472",
              name: "平顶山市城乡一体化示范区"
            },
            {
              code: "410481",
              name: "舞钢市"
            },
            {
              code: "410482",
              name: "汝州市"
            }
          ]
        },
        {
          code: "4105",
          name: "安阳市",
          children: [
            {
              code: "410502",
              name: "文峰区"
            },
            {
              code: "410503",
              name: "北关区"
            },
            {
              code: "410505",
              name: "殷都区"
            },
            {
              code: "410506",
              name: "龙安区"
            },
            {
              code: "410522",
              name: "安阳县"
            },
            {
              code: "410523",
              name: "汤阴县"
            },
            {
              code: "410526",
              name: "滑县"
            },
            {
              code: "410527",
              name: "内黄县"
            },
            {
              code: "410571",
              name: "安阳高新技术产业开发区"
            },
            {
              code: "410581",
              name: "林州市"
            }
          ]
        },
        {
          code: "4106",
          name: "鹤壁市",
          children: [
            {
              code: "410602",
              name: "鹤山区"
            },
            {
              code: "410603",
              name: "山城区"
            },
            {
              code: "410611",
              name: "淇滨区"
            },
            {
              code: "410621",
              name: "浚县"
            },
            {
              code: "410622",
              name: "淇县"
            },
            {
              code: "410671",
              name: "鹤壁经济技术开发区"
            }
          ]
        },
        {
          code: "4107",
          name: "新乡市",
          children: [
            {
              code: "410702",
              name: "红旗区"
            },
            {
              code: "410703",
              name: "卫滨区"
            },
            {
              code: "410704",
              name: "凤泉区"
            },
            {
              code: "410711",
              name: "牧野区"
            },
            {
              code: "410721",
              name: "新乡县"
            },
            {
              code: "410724",
              name: "获嘉县"
            },
            {
              code: "410725",
              name: "原阳县"
            },
            {
              code: "410726",
              name: "延津县"
            },
            {
              code: "410727",
              name: "封丘县"
            },
            {
              code: "410771",
              name: "新乡高新技术产业开发区"
            },
            {
              code: "410772",
              name: "新乡经济技术开发区"
            },
            {
              code: "410773",
              name: "新乡市平原城乡一体化示范区"
            },
            {
              code: "410781",
              name: "卫辉市"
            },
            {
              code: "410782",
              name: "辉县市"
            },
            {
              code: "410783",
              name: "长垣市"
            }
          ]
        },
        {
          code: "4108",
          name: "焦作市",
          children: [
            {
              code: "410802",
              name: "解放区"
            },
            {
              code: "410803",
              name: "中站区"
            },
            {
              code: "410804",
              name: "马村区"
            },
            {
              code: "410811",
              name: "山阳区"
            },
            {
              code: "410821",
              name: "修武县"
            },
            {
              code: "410822",
              name: "博爱县"
            },
            {
              code: "410823",
              name: "武陟县"
            },
            {
              code: "410825",
              name: "温县"
            },
            {
              code: "410871",
              name: "焦作城乡一体化示范区"
            },
            {
              code: "410882",
              name: "沁阳市"
            },
            {
              code: "410883",
              name: "孟州市"
            }
          ]
        },
        {
          code: "4109",
          name: "濮阳市",
          children: [
            {
              code: "410902",
              name: "华龙区"
            },
            {
              code: "410922",
              name: "清丰县"
            },
            {
              code: "410923",
              name: "南乐县"
            },
            {
              code: "410926",
              name: "范县"
            },
            {
              code: "410927",
              name: "台前县"
            },
            {
              code: "410928",
              name: "濮阳县"
            },
            {
              code: "410971",
              name: "河南濮阳工业园区"
            },
            {
              code: "410972",
              name: "濮阳经济技术开发区"
            }
          ]
        },
        {
          code: "4110",
          name: "许昌市",
          children: [
            {
              code: "411002",
              name: "魏都区"
            },
            {
              code: "411003",
              name: "建安区"
            },
            {
              code: "411024",
              name: "鄢陵县"
            },
            {
              code: "411025",
              name: "襄城县"
            },
            {
              code: "411071",
              name: "许昌经济技术开发区"
            },
            {
              code: "411081",
              name: "禹州市"
            },
            {
              code: "411082",
              name: "长葛市"
            }
          ]
        },
        {
          code: "4111",
          name: "漯河市",
          children: [
            {
              code: "411102",
              name: "源汇区"
            },
            {
              code: "411103",
              name: "郾城区"
            },
            {
              code: "411104",
              name: "召陵区"
            },
            {
              code: "411121",
              name: "舞阳县"
            },
            {
              code: "411122",
              name: "临颍县"
            },
            {
              code: "411171",
              name: "漯河经济技术开发区"
            }
          ]
        },
        {
          code: "4112",
          name: "三门峡市",
          children: [
            {
              code: "411202",
              name: "湖滨区"
            },
            {
              code: "411203",
              name: "陕州区"
            },
            {
              code: "411221",
              name: "渑池县"
            },
            {
              code: "411224",
              name: "卢氏县"
            },
            {
              code: "411271",
              name: "河南三门峡经济开发区"
            },
            {
              code: "411281",
              name: "义马市"
            },
            {
              code: "411282",
              name: "灵宝市"
            }
          ]
        },
        {
          code: "4113",
          name: "南阳市",
          children: [
            {
              code: "411302",
              name: "宛城区"
            },
            {
              code: "411303",
              name: "卧龙区"
            },
            {
              code: "411321",
              name: "南召县"
            },
            {
              code: "411322",
              name: "方城县"
            },
            {
              code: "411323",
              name: "西峡县"
            },
            {
              code: "411324",
              name: "镇平县"
            },
            {
              code: "411325",
              name: "内乡县"
            },
            {
              code: "411326",
              name: "淅川县"
            },
            {
              code: "411327",
              name: "社旗县"
            },
            {
              code: "411328",
              name: "唐河县"
            },
            {
              code: "411329",
              name: "新野县"
            },
            {
              code: "411330",
              name: "桐柏县"
            },
            {
              code: "411371",
              name: "南阳高新技术产业开发区"
            },
            {
              code: "411372",
              name: "南阳市城乡一体化示范区"
            },
            {
              code: "411381",
              name: "邓州市"
            }
          ]
        },
        {
          code: "4114",
          name: "商丘市",
          children: [
            {
              code: "411402",
              name: "梁园区"
            },
            {
              code: "411403",
              name: "睢阳区"
            },
            {
              code: "411421",
              name: "民权县"
            },
            {
              code: "411422",
              name: "睢县"
            },
            {
              code: "411423",
              name: "宁陵县"
            },
            {
              code: "411424",
              name: "柘城县"
            },
            {
              code: "411425",
              name: "虞城县"
            },
            {
              code: "411426",
              name: "夏邑县"
            },
            {
              code: "411471",
              name: "豫东综合物流产业聚集区"
            },
            {
              code: "411472",
              name: "河南商丘经济开发区"
            },
            {
              code: "411481",
              name: "永城市"
            }
          ]
        },
        {
          code: "4115",
          name: "信阳市",
          children: [
            {
              code: "411502",
              name: "浉河区"
            },
            {
              code: "411503",
              name: "平桥区"
            },
            {
              code: "411521",
              name: "罗山县"
            },
            {
              code: "411522",
              name: "光山县"
            },
            {
              code: "411523",
              name: "新县"
            },
            {
              code: "411524",
              name: "商城县"
            },
            {
              code: "411525",
              name: "固始县"
            },
            {
              code: "411526",
              name: "潢川县"
            },
            {
              code: "411527",
              name: "淮滨县"
            },
            {
              code: "411528",
              name: "息县"
            },
            {
              code: "411571",
              name: "信阳高新技术产业开发区"
            }
          ]
        },
        {
          code: "4116",
          name: "周口市",
          children: [
            {
              code: "411602",
              name: "川汇区"
            },
            {
              code: "411603",
              name: "淮阳区"
            },
            {
              code: "411621",
              name: "扶沟县"
            },
            {
              code: "411622",
              name: "西华县"
            },
            {
              code: "411623",
              name: "商水县"
            },
            {
              code: "411624",
              name: "沈丘县"
            },
            {
              code: "411625",
              name: "郸城县"
            },
            {
              code: "411627",
              name: "太康县"
            },
            {
              code: "411628",
              name: "鹿邑县"
            },
            {
              code: "411671",
              name: "周口临港开发区"
            },
            {
              code: "411681",
              name: "项城市"
            }
          ]
        },
        {
          code: "4117",
          name: "驻马店市",
          children: [
            {
              code: "411702",
              name: "驿城区"
            },
            {
              code: "411721",
              name: "西平县"
            },
            {
              code: "411722",
              name: "上蔡县"
            },
            {
              code: "411723",
              name: "平舆县"
            },
            {
              code: "411724",
              name: "正阳县"
            },
            {
              code: "411725",
              name: "确山县"
            },
            {
              code: "411726",
              name: "泌阳县"
            },
            {
              code: "411727",
              name: "汝南县"
            },
            {
              code: "411728",
              name: "遂平县"
            },
            {
              code: "411729",
              name: "新蔡县"
            },
            {
              code: "411771",
              name: "河南驻马店经济开发区"
            }
          ]
        },
        {
          code: "4190",
          name: "省直辖县级行政区划",
          children: [
            {
              code: "419001",
              name: "济源市"
            }
          ]
        }
      ]
    },
    {
      code: "42",
      name: "湖北省",
      children: [
        {
          code: "4201",
          name: "武汉市",
          children: [
            {
              code: "420102",
              name: "江岸区"
            },
            {
              code: "420103",
              name: "江汉区"
            },
            {
              code: "420104",
              name: "硚口区"
            },
            {
              code: "420105",
              name: "汉阳区"
            },
            {
              code: "420106",
              name: "武昌区"
            },
            {
              code: "420107",
              name: "青山区"
            },
            {
              code: "420111",
              name: "洪山区"
            },
            {
              code: "420112",
              name: "东西湖区"
            },
            {
              code: "420113",
              name: "汉南区"
            },
            {
              code: "420114",
              name: "蔡甸区"
            },
            {
              code: "420115",
              name: "江夏区"
            },
            {
              code: "420116",
              name: "黄陂区"
            },
            {
              code: "420117",
              name: "新洲区"
            }
          ]
        },
        {
          code: "4202",
          name: "黄石市",
          children: [
            {
              code: "420202",
              name: "黄石港区"
            },
            {
              code: "420203",
              name: "西塞山区"
            },
            {
              code: "420204",
              name: "下陆区"
            },
            {
              code: "420205",
              name: "铁山区"
            },
            {
              code: "420222",
              name: "阳新县"
            },
            {
              code: "420281",
              name: "大冶市"
            }
          ]
        },
        {
          code: "4203",
          name: "十堰市",
          children: [
            {
              code: "420302",
              name: "茅箭区"
            },
            {
              code: "420303",
              name: "张湾区"
            },
            {
              code: "420304",
              name: "郧阳区"
            },
            {
              code: "420322",
              name: "郧西县"
            },
            {
              code: "420323",
              name: "竹山县"
            },
            {
              code: "420324",
              name: "竹溪县"
            },
            {
              code: "420325",
              name: "房县"
            },
            {
              code: "420381",
              name: "丹江口市"
            }
          ]
        },
        {
          code: "4205",
          name: "宜昌市",
          children: [
            {
              code: "420502",
              name: "西陵区"
            },
            {
              code: "420503",
              name: "伍家岗区"
            },
            {
              code: "420504",
              name: "点军区"
            },
            {
              code: "420505",
              name: "猇亭区"
            },
            {
              code: "420506",
              name: "夷陵区"
            },
            {
              code: "420525",
              name: "远安县"
            },
            {
              code: "420526",
              name: "兴山县"
            },
            {
              code: "420527",
              name: "秭归县"
            },
            {
              code: "420528",
              name: "长阳土家族自治县"
            },
            {
              code: "420529",
              name: "五峰土家族自治县"
            },
            {
              code: "420581",
              name: "宜都市"
            },
            {
              code: "420582",
              name: "当阳市"
            },
            {
              code: "420583",
              name: "枝江市"
            }
          ]
        },
        {
          code: "4206",
          name: "襄阳市",
          children: [
            {
              code: "420602",
              name: "襄城区"
            },
            {
              code: "420606",
              name: "樊城区"
            },
            {
              code: "420607",
              name: "襄州区"
            },
            {
              code: "420624",
              name: "南漳县"
            },
            {
              code: "420625",
              name: "谷城县"
            },
            {
              code: "420626",
              name: "保康县"
            },
            {
              code: "420682",
              name: "老河口市"
            },
            {
              code: "420683",
              name: "枣阳市"
            },
            {
              code: "420684",
              name: "宜城市"
            }
          ]
        },
        {
          code: "4207",
          name: "鄂州市",
          children: [
            {
              code: "420702",
              name: "梁子湖区"
            },
            {
              code: "420703",
              name: "华容区"
            },
            {
              code: "420704",
              name: "鄂城区"
            }
          ]
        },
        {
          code: "4208",
          name: "荆门市",
          children: [
            {
              code: "420802",
              name: "东宝区"
            },
            {
              code: "420804",
              name: "掇刀区"
            },
            {
              code: "420822",
              name: "沙洋县"
            },
            {
              code: "420881",
              name: "钟祥市"
            },
            {
              code: "420882",
              name: "京山市"
            }
          ]
        },
        {
          code: "4209",
          name: "孝感市",
          children: [
            {
              code: "420902",
              name: "孝南区"
            },
            {
              code: "420921",
              name: "孝昌县"
            },
            {
              code: "420922",
              name: "大悟县"
            },
            {
              code: "420923",
              name: "云梦县"
            },
            {
              code: "420981",
              name: "应城市"
            },
            {
              code: "420982",
              name: "安陆市"
            },
            {
              code: "420984",
              name: "汉川市"
            }
          ]
        },
        {
          code: "4210",
          name: "荆州市",
          children: [
            {
              code: "421002",
              name: "沙市区"
            },
            {
              code: "421003",
              name: "荆州区"
            },
            {
              code: "421022",
              name: "公安县"
            },
            {
              code: "421024",
              name: "江陵县"
            },
            {
              code: "421071",
              name: "荆州经济技术开发区"
            },
            {
              code: "421081",
              name: "石首市"
            },
            {
              code: "421083",
              name: "洪湖市"
            },
            {
              code: "421087",
              name: "松滋市"
            },
            {
              code: "421088",
              name: "监利市"
            }
          ]
        },
        {
          code: "4211",
          name: "黄冈市",
          children: [
            {
              code: "421102",
              name: "黄州区"
            },
            {
              code: "421121",
              name: "团风县"
            },
            {
              code: "421122",
              name: "红安县"
            },
            {
              code: "421123",
              name: "罗田县"
            },
            {
              code: "421124",
              name: "英山县"
            },
            {
              code: "421125",
              name: "浠水县"
            },
            {
              code: "421126",
              name: "蕲春县"
            },
            {
              code: "421127",
              name: "黄梅县"
            },
            {
              code: "421171",
              name: "龙感湖管理区"
            },
            {
              code: "421181",
              name: "麻城市"
            },
            {
              code: "421182",
              name: "武穴市"
            }
          ]
        },
        {
          code: "4212",
          name: "咸宁市",
          children: [
            {
              code: "421202",
              name: "咸安区"
            },
            {
              code: "421221",
              name: "嘉鱼县"
            },
            {
              code: "421222",
              name: "通城县"
            },
            {
              code: "421223",
              name: "崇阳县"
            },
            {
              code: "421224",
              name: "通山县"
            },
            {
              code: "421281",
              name: "赤壁市"
            }
          ]
        },
        {
          code: "4213",
          name: "随州市",
          children: [
            {
              code: "421303",
              name: "曾都区"
            },
            {
              code: "421321",
              name: "随县"
            },
            {
              code: "421381",
              name: "广水市"
            }
          ]
        },
        {
          code: "4228",
          name: "恩施土家族苗族自治州",
          children: [
            {
              code: "422801",
              name: "恩施市"
            },
            {
              code: "422802",
              name: "利川市"
            },
            {
              code: "422822",
              name: "建始县"
            },
            {
              code: "422823",
              name: "巴东县"
            },
            {
              code: "422825",
              name: "宣恩县"
            },
            {
              code: "422826",
              name: "咸丰县"
            },
            {
              code: "422827",
              name: "来凤县"
            },
            {
              code: "422828",
              name: "鹤峰县"
            }
          ]
        },
        {
          code: "4290",
          name: "省直辖县级行政区划",
          children: [
            {
              code: "429004",
              name: "仙桃市"
            },
            {
              code: "429005",
              name: "潜江市"
            },
            {
              code: "429006",
              name: "天门市"
            },
            {
              code: "429021",
              name: "神农架林区"
            }
          ]
        }
      ]
    },
    {
      code: "43",
      name: "湖南省",
      children: [
        {
          code: "4301",
          name: "长沙市",
          children: [
            {
              code: "430102",
              name: "芙蓉区"
            },
            {
              code: "430103",
              name: "天心区"
            },
            {
              code: "430104",
              name: "岳麓区"
            },
            {
              code: "430105",
              name: "开福区"
            },
            {
              code: "430111",
              name: "雨花区"
            },
            {
              code: "430112",
              name: "望城区"
            },
            {
              code: "430121",
              name: "长沙县"
            },
            {
              code: "430181",
              name: "浏阳市"
            },
            {
              code: "430182",
              name: "宁乡市"
            }
          ]
        },
        {
          code: "4302",
          name: "株洲市",
          children: [
            {
              code: "430202",
              name: "荷塘区"
            },
            {
              code: "430203",
              name: "芦淞区"
            },
            {
              code: "430204",
              name: "石峰区"
            },
            {
              code: "430211",
              name: "天元区"
            },
            {
              code: "430212",
              name: "渌口区"
            },
            {
              code: "430223",
              name: "攸县"
            },
            {
              code: "430224",
              name: "茶陵县"
            },
            {
              code: "430225",
              name: "炎陵县"
            },
            {
              code: "430281",
              name: "醴陵市"
            }
          ]
        },
        {
          code: "4303",
          name: "湘潭市",
          children: [
            {
              code: "430302",
              name: "雨湖区"
            },
            {
              code: "430304",
              name: "岳塘区"
            },
            {
              code: "430321",
              name: "湘潭县"
            },
            {
              code: "430371",
              name: "湖南湘潭高新技术产业园区"
            },
            {
              code: "430372",
              name: "湘潭昭山示范区"
            },
            {
              code: "430373",
              name: "湘潭九华示范区"
            },
            {
              code: "430381",
              name: "湘乡市"
            },
            {
              code: "430382",
              name: "韶山市"
            }
          ]
        },
        {
          code: "4304",
          name: "衡阳市",
          children: [
            {
              code: "430405",
              name: "珠晖区"
            },
            {
              code: "430406",
              name: "雁峰区"
            },
            {
              code: "430407",
              name: "石鼓区"
            },
            {
              code: "430408",
              name: "蒸湘区"
            },
            {
              code: "430412",
              name: "南岳区"
            },
            {
              code: "430421",
              name: "衡阳县"
            },
            {
              code: "430422",
              name: "衡南县"
            },
            {
              code: "430423",
              name: "衡山县"
            },
            {
              code: "430424",
              name: "衡东县"
            },
            {
              code: "430426",
              name: "祁东县"
            },
            {
              code: "430473",
              name: "湖南衡阳松木经济开发区"
            },
            {
              code: "430476",
              name: "湖南衡阳高新技术产业园区"
            },
            {
              code: "430481",
              name: "耒阳市"
            },
            {
              code: "430482",
              name: "常宁市"
            }
          ]
        },
        {
          code: "4305",
          name: "邵阳市",
          children: [
            {
              code: "430502",
              name: "双清区"
            },
            {
              code: "430503",
              name: "大祥区"
            },
            {
              code: "430511",
              name: "北塔区"
            },
            {
              code: "430522",
              name: "新邵县"
            },
            {
              code: "430523",
              name: "邵阳县"
            },
            {
              code: "430524",
              name: "隆回县"
            },
            {
              code: "430525",
              name: "洞口县"
            },
            {
              code: "430527",
              name: "绥宁县"
            },
            {
              code: "430528",
              name: "新宁县"
            },
            {
              code: "430529",
              name: "城步苗族自治县"
            },
            {
              code: "430581",
              name: "武冈市"
            },
            {
              code: "430582",
              name: "邵东市"
            }
          ]
        },
        {
          code: "4306",
          name: "岳阳市",
          children: [
            {
              code: "430602",
              name: "岳阳楼区"
            },
            {
              code: "430603",
              name: "云溪区"
            },
            {
              code: "430611",
              name: "君山区"
            },
            {
              code: "430621",
              name: "岳阳县"
            },
            {
              code: "430623",
              name: "华容县"
            },
            {
              code: "430624",
              name: "湘阴县"
            },
            {
              code: "430626",
              name: "平江县"
            },
            {
              code: "430671",
              name: "岳阳市屈原管理区"
            },
            {
              code: "430681",
              name: "汨罗市"
            },
            {
              code: "430682",
              name: "临湘市"
            }
          ]
        },
        {
          code: "4307",
          name: "常德市",
          children: [
            {
              code: "430702",
              name: "武陵区"
            },
            {
              code: "430703",
              name: "鼎城区"
            },
            {
              code: "430721",
              name: "安乡县"
            },
            {
              code: "430722",
              name: "汉寿县"
            },
            {
              code: "430723",
              name: "澧县"
            },
            {
              code: "430724",
              name: "临澧县"
            },
            {
              code: "430725",
              name: "桃源县"
            },
            {
              code: "430726",
              name: "石门县"
            },
            {
              code: "430771",
              name: "常德市西洞庭管理区"
            },
            {
              code: "430781",
              name: "津市市"
            }
          ]
        },
        {
          code: "4308",
          name: "张家界市",
          children: [
            {
              code: "430802",
              name: "永定区"
            },
            {
              code: "430811",
              name: "武陵源区"
            },
            {
              code: "430821",
              name: "慈利县"
            },
            {
              code: "430822",
              name: "桑植县"
            }
          ]
        },
        {
          code: "4309",
          name: "益阳市",
          children: [
            {
              code: "430902",
              name: "资阳区"
            },
            {
              code: "430903",
              name: "赫山区"
            },
            {
              code: "430921",
              name: "南县"
            },
            {
              code: "430922",
              name: "桃江县"
            },
            {
              code: "430923",
              name: "安化县"
            },
            {
              code: "430971",
              name: "益阳市大通湖管理区"
            },
            {
              code: "430972",
              name: "湖南益阳高新技术产业园区"
            },
            {
              code: "430981",
              name: "沅江市"
            }
          ]
        },
        {
          code: "4310",
          name: "郴州市",
          children: [
            {
              code: "431002",
              name: "北湖区"
            },
            {
              code: "431003",
              name: "苏仙区"
            },
            {
              code: "431021",
              name: "桂阳县"
            },
            {
              code: "431022",
              name: "宜章县"
            },
            {
              code: "431023",
              name: "永兴县"
            },
            {
              code: "431024",
              name: "嘉禾县"
            },
            {
              code: "431025",
              name: "临武县"
            },
            {
              code: "431026",
              name: "汝城县"
            },
            {
              code: "431027",
              name: "桂东县"
            },
            {
              code: "431028",
              name: "安仁县"
            },
            {
              code: "431081",
              name: "资兴市"
            }
          ]
        },
        {
          code: "4311",
          name: "永州市",
          children: [
            {
              code: "431102",
              name: "零陵区"
            },
            {
              code: "431103",
              name: "冷水滩区"
            },
            {
              code: "431122",
              name: "东安县"
            },
            {
              code: "431123",
              name: "双牌县"
            },
            {
              code: "431124",
              name: "道县"
            },
            {
              code: "431125",
              name: "江永县"
            },
            {
              code: "431126",
              name: "宁远县"
            },
            {
              code: "431127",
              name: "蓝山县"
            },
            {
              code: "431128",
              name: "新田县"
            },
            {
              code: "431129",
              name: "江华瑶族自治县"
            },
            {
              code: "431171",
              name: "永州经济技术开发区"
            },
            {
              code: "431173",
              name: "永州市回龙圩管理区"
            },
            {
              code: "431181",
              name: "祁阳市"
            }
          ]
        },
        {
          code: "4312",
          name: "怀化市",
          children: [
            {
              code: "431202",
              name: "鹤城区"
            },
            {
              code: "431221",
              name: "中方县"
            },
            {
              code: "431222",
              name: "沅陵县"
            },
            {
              code: "431223",
              name: "辰溪县"
            },
            {
              code: "431224",
              name: "溆浦县"
            },
            {
              code: "431225",
              name: "会同县"
            },
            {
              code: "431226",
              name: "麻阳苗族自治县"
            },
            {
              code: "431227",
              name: "新晃侗族自治县"
            },
            {
              code: "431228",
              name: "芷江侗族自治县"
            },
            {
              code: "431229",
              name: "靖州苗族侗族自治县"
            },
            {
              code: "431230",
              name: "通道侗族自治县"
            },
            {
              code: "431271",
              name: "怀化市洪江管理区"
            },
            {
              code: "431281",
              name: "洪江市"
            }
          ]
        },
        {
          code: "4313",
          name: "娄底市",
          children: [
            {
              code: "431302",
              name: "娄星区"
            },
            {
              code: "431321",
              name: "双峰县"
            },
            {
              code: "431322",
              name: "新化县"
            },
            {
              code: "431381",
              name: "冷水江市"
            },
            {
              code: "431382",
              name: "涟源市"
            }
          ]
        },
        {
          code: "4331",
          name: "湘西土家族苗族自治州",
          children: [
            {
              code: "433101",
              name: "吉首市"
            },
            {
              code: "433122",
              name: "泸溪县"
            },
            {
              code: "433123",
              name: "凤凰县"
            },
            {
              code: "433124",
              name: "花垣县"
            },
            {
              code: "433125",
              name: "保靖县"
            },
            {
              code: "433126",
              name: "古丈县"
            },
            {
              code: "433127",
              name: "永顺县"
            },
            {
              code: "433130",
              name: "龙山县"
            }
          ]
        }
      ]
    },
    {
      code: "44",
      name: "广东省",
      children: [
        {
          code: "4401",
          name: "广州市",
          children: [
            {
              code: "440103",
              name: "荔湾区"
            },
            {
              code: "440104",
              name: "越秀区"
            },
            {
              code: "440105",
              name: "海珠区"
            },
            {
              code: "440106",
              name: "天河区"
            },
            {
              code: "440111",
              name: "白云区"
            },
            {
              code: "440112",
              name: "黄埔区"
            },
            {
              code: "440113",
              name: "番禺区"
            },
            {
              code: "440114",
              name: "花都区"
            },
            {
              code: "440115",
              name: "南沙区"
            },
            {
              code: "440117",
              name: "从化区"
            },
            {
              code: "440118",
              name: "增城区"
            }
          ]
        },
        {
          code: "4402",
          name: "韶关市",
          children: [
            {
              code: "440203",
              name: "武江区"
            },
            {
              code: "440204",
              name: "浈江区"
            },
            {
              code: "440205",
              name: "曲江区"
            },
            {
              code: "440222",
              name: "始兴县"
            },
            {
              code: "440224",
              name: "仁化县"
            },
            {
              code: "440229",
              name: "翁源县"
            },
            {
              code: "440232",
              name: "乳源瑶族自治县"
            },
            {
              code: "440233",
              name: "新丰县"
            },
            {
              code: "440281",
              name: "乐昌市"
            },
            {
              code: "440282",
              name: "南雄市"
            }
          ]
        },
        {
          code: "4403",
          name: "深圳市",
          children: [
            {
              code: "440303",
              name: "罗湖区"
            },
            {
              code: "440304",
              name: "福田区"
            },
            {
              code: "440305",
              name: "南山区"
            },
            {
              code: "440306",
              name: "宝安区"
            },
            {
              code: "440307",
              name: "龙岗区"
            },
            {
              code: "440308",
              name: "盐田区"
            },
            {
              code: "440309",
              name: "龙华区"
            },
            {
              code: "440310",
              name: "坪山区"
            },
            {
              code: "440311",
              name: "光明区"
            }
          ]
        },
        {
          code: "4404",
          name: "珠海市",
          children: [
            {
              code: "440402",
              name: "香洲区"
            },
            {
              code: "440403",
              name: "斗门区"
            },
            {
              code: "440404",
              name: "金湾区"
            }
          ]
        },
        {
          code: "4405",
          name: "汕头市",
          children: [
            {
              code: "440507",
              name: "龙湖区"
            },
            {
              code: "440511",
              name: "金平区"
            },
            {
              code: "440512",
              name: "濠江区"
            },
            {
              code: "440513",
              name: "潮阳区"
            },
            {
              code: "440514",
              name: "潮南区"
            },
            {
              code: "440515",
              name: "澄海区"
            },
            {
              code: "440523",
              name: "南澳县"
            }
          ]
        },
        {
          code: "4406",
          name: "佛山市",
          children: [
            {
              code: "440604",
              name: "禅城区"
            },
            {
              code: "440605",
              name: "南海区"
            },
            {
              code: "440606",
              name: "顺德区"
            },
            {
              code: "440607",
              name: "三水区"
            },
            {
              code: "440608",
              name: "高明区"
            }
          ]
        },
        {
          code: "4407",
          name: "江门市",
          children: [
            {
              code: "440703",
              name: "蓬江区"
            },
            {
              code: "440704",
              name: "江海区"
            },
            {
              code: "440705",
              name: "新会区"
            },
            {
              code: "440781",
              name: "台山市"
            },
            {
              code: "440783",
              name: "开平市"
            },
            {
              code: "440784",
              name: "鹤山市"
            },
            {
              code: "440785",
              name: "恩平市"
            }
          ]
        },
        {
          code: "4408",
          name: "湛江市",
          children: [
            {
              code: "440802",
              name: "赤坎区"
            },
            {
              code: "440803",
              name: "霞山区"
            },
            {
              code: "440804",
              name: "坡头区"
            },
            {
              code: "440811",
              name: "麻章区"
            },
            {
              code: "440823",
              name: "遂溪县"
            },
            {
              code: "440825",
              name: "徐闻县"
            },
            {
              code: "440881",
              name: "廉江市"
            },
            {
              code: "440882",
              name: "雷州市"
            },
            {
              code: "440883",
              name: "吴川市"
            }
          ]
        },
        {
          code: "4409",
          name: "茂名市",
          children: [
            {
              code: "440902",
              name: "茂南区"
            },
            {
              code: "440904",
              name: "电白区"
            },
            {
              code: "440981",
              name: "高州市"
            },
            {
              code: "440982",
              name: "化州市"
            },
            {
              code: "440983",
              name: "信宜市"
            }
          ]
        },
        {
          code: "4412",
          name: "肇庆市",
          children: [
            {
              code: "441202",
              name: "端州区"
            },
            {
              code: "441203",
              name: "鼎湖区"
            },
            {
              code: "441204",
              name: "高要区"
            },
            {
              code: "441223",
              name: "广宁县"
            },
            {
              code: "441224",
              name: "怀集县"
            },
            {
              code: "441225",
              name: "封开县"
            },
            {
              code: "441226",
              name: "德庆县"
            },
            {
              code: "441284",
              name: "四会市"
            }
          ]
        },
        {
          code: "4413",
          name: "惠州市",
          children: [
            {
              code: "441302",
              name: "惠城区"
            },
            {
              code: "441303",
              name: "惠阳区"
            },
            {
              code: "441322",
              name: "博罗县"
            },
            {
              code: "441323",
              name: "惠东县"
            },
            {
              code: "441324",
              name: "龙门县"
            }
          ]
        },
        {
          code: "4414",
          name: "梅州市",
          children: [
            {
              code: "441402",
              name: "梅江区"
            },
            {
              code: "441403",
              name: "梅县区"
            },
            {
              code: "441422",
              name: "大埔县"
            },
            {
              code: "441423",
              name: "丰顺县"
            },
            {
              code: "441424",
              name: "五华县"
            },
            {
              code: "441426",
              name: "平远县"
            },
            {
              code: "441427",
              name: "蕉岭县"
            },
            {
              code: "441481",
              name: "兴宁市"
            }
          ]
        },
        {
          code: "4415",
          name: "汕尾市",
          children: [
            {
              code: "441502",
              name: "城区"
            },
            {
              code: "441521",
              name: "海丰县"
            },
            {
              code: "441523",
              name: "陆河县"
            },
            {
              code: "441581",
              name: "陆丰市"
            }
          ]
        },
        {
          code: "4416",
          name: "河源市",
          children: [
            {
              code: "441602",
              name: "源城区"
            },
            {
              code: "441621",
              name: "紫金县"
            },
            {
              code: "441622",
              name: "龙川县"
            },
            {
              code: "441623",
              name: "连平县"
            },
            {
              code: "441624",
              name: "和平县"
            },
            {
              code: "441625",
              name: "东源县"
            }
          ]
        },
        {
          code: "4417",
          name: "阳江市",
          children: [
            {
              code: "441702",
              name: "江城区"
            },
            {
              code: "441704",
              name: "阳东区"
            },
            {
              code: "441721",
              name: "阳西县"
            },
            {
              code: "441781",
              name: "阳春市"
            }
          ]
        },
        {
          code: "4418",
          name: "清远市",
          children: [
            {
              code: "441802",
              name: "清城区"
            },
            {
              code: "441803",
              name: "清新区"
            },
            {
              code: "441821",
              name: "佛冈县"
            },
            {
              code: "441823",
              name: "阳山县"
            },
            {
              code: "441825",
              name: "连山壮族瑶族自治县"
            },
            {
              code: "441826",
              name: "连南瑶族自治县"
            },
            {
              code: "441881",
              name: "英德市"
            },
            {
              code: "441882",
              name: "连州市"
            }
          ]
        },
        {
          code: "4419",
          name: "东莞市",
          children: [
            {
              code: "441900003",
              name: "东城街道"
            },
            {
              code: "441900004",
              name: "南城街道"
            },
            {
              code: "441900005",
              name: "万江街道"
            },
            {
              code: "441900006",
              name: "莞城街道"
            },
            {
              code: "441900101",
              name: "石碣镇"
            },
            {
              code: "441900102",
              name: "石龙镇"
            },
            {
              code: "441900103",
              name: "茶山镇"
            },
            {
              code: "441900104",
              name: "石排镇"
            },
            {
              code: "441900105",
              name: "企石镇"
            },
            {
              code: "441900106",
              name: "横沥镇"
            },
            {
              code: "441900107",
              name: "桥头镇"
            },
            {
              code: "441900108",
              name: "谢岗镇"
            },
            {
              code: "441900109",
              name: "东坑镇"
            },
            {
              code: "441900110",
              name: "常平镇"
            },
            {
              code: "441900111",
              name: "寮步镇"
            },
            {
              code: "441900112",
              name: "樟木头镇"
            },
            {
              code: "441900113",
              name: "大朗镇"
            },
            {
              code: "441900114",
              name: "黄江镇"
            },
            {
              code: "441900115",
              name: "清溪镇"
            },
            {
              code: "441900116",
              name: "塘厦镇"
            },
            {
              code: "441900117",
              name: "凤岗镇"
            },
            {
              code: "441900118",
              name: "大岭山镇"
            },
            {
              code: "441900119",
              name: "长安镇"
            },
            {
              code: "441900121",
              name: "虎门镇"
            },
            {
              code: "441900122",
              name: "厚街镇"
            },
            {
              code: "441900123",
              name: "沙田镇"
            },
            {
              code: "441900124",
              name: "道滘镇"
            },
            {
              code: "441900125",
              name: "洪梅镇"
            },
            {
              code: "441900126",
              name: "麻涌镇"
            },
            {
              code: "441900127",
              name: "望牛墩镇"
            },
            {
              code: "441900128",
              name: "中堂镇"
            },
            {
              code: "441900129",
              name: "高埗镇"
            },
            {
              code: "441900401",
              name: "松山湖"
            },
            {
              code: "441900402",
              name: "东莞港"
            },
            {
              code: "441900403",
              name: "东莞生态园"
            },
            {
              code: "441900404",
              name: "东莞滨海湾新区"
            }
          ]
        },
        {
          code: "4420",
          name: "中山市",
          children: [
            {
              code: "442000001",
              name: "石岐街道"
            },
            {
              code: "442000002",
              name: "东区街道"
            },
            {
              code: "442000003",
              name: "中山港街道"
            },
            {
              code: "442000004",
              name: "西区街道"
            },
            {
              code: "442000005",
              name: "南区街道"
            },
            {
              code: "442000006",
              name: "五桂山街道"
            },
            {
              code: "442000007",
              name: "民众街道"
            },
            {
              code: "442000008",
              name: "南朗街道"
            },
            {
              code: "442000101",
              name: "黄圃镇"
            },
            {
              code: "442000103",
              name: "东凤镇"
            },
            {
              code: "442000105",
              name: "古镇镇"
            },
            {
              code: "442000106",
              name: "沙溪镇"
            },
            {
              code: "442000107",
              name: "坦洲镇"
            },
            {
              code: "442000108",
              name: "港口镇"
            },
            {
              code: "442000109",
              name: "三角镇"
            },
            {
              code: "442000110",
              name: "横栏镇"
            },
            {
              code: "442000111",
              name: "南头镇"
            },
            {
              code: "442000112",
              name: "阜沙镇"
            },
            {
              code: "442000114",
              name: "三乡镇"
            },
            {
              code: "442000115",
              name: "板芙镇"
            },
            {
              code: "442000116",
              name: "大涌镇"
            },
            {
              code: "442000117",
              name: "神湾镇"
            },
            {
              code: "442000118",
              name: "小榄镇"
            }
          ]
        },
        {
          code: "4451",
          name: "潮州市",
          children: [
            {
              code: "445102",
              name: "湘桥区"
            },
            {
              code: "445103",
              name: "潮安区"
            },
            {
              code: "445122",
              name: "饶平县"
            }
          ]
        },
        {
          code: "4452",
          name: "揭阳市",
          children: [
            {
              code: "445202",
              name: "榕城区"
            },
            {
              code: "445203",
              name: "揭东区"
            },
            {
              code: "445222",
              name: "揭西县"
            },
            {
              code: "445224",
              name: "惠来县"
            },
            {
              code: "445281",
              name: "普宁市"
            }
          ]
        },
        {
          code: "4453",
          name: "云浮市",
          children: [
            {
              code: "445302",
              name: "云城区"
            },
            {
              code: "445303",
              name: "云安区"
            },
            {
              code: "445321",
              name: "新兴县"
            },
            {
              code: "445322",
              name: "郁南县"
            },
            {
              code: "445381",
              name: "罗定市"
            }
          ]
        }
      ]
    },
    {
      code: "45",
      name: "广西壮族自治区",
      children: [
        {
          code: "4501",
          name: "南宁市",
          children: [
            {
              code: "450102",
              name: "兴宁区"
            },
            {
              code: "450103",
              name: "青秀区"
            },
            {
              code: "450105",
              name: "江南区"
            },
            {
              code: "450107",
              name: "西乡塘区"
            },
            {
              code: "450108",
              name: "良庆区"
            },
            {
              code: "450109",
              name: "邕宁区"
            },
            {
              code: "450110",
              name: "武鸣区"
            },
            {
              code: "450123",
              name: "隆安县"
            },
            {
              code: "450124",
              name: "马山县"
            },
            {
              code: "450125",
              name: "上林县"
            },
            {
              code: "450126",
              name: "宾阳县"
            },
            {
              code: "450181",
              name: "横州市"
            }
          ]
        },
        {
          code: "4502",
          name: "柳州市",
          children: [
            {
              code: "450202",
              name: "城中区"
            },
            {
              code: "450203",
              name: "鱼峰区"
            },
            {
              code: "450204",
              name: "柳南区"
            },
            {
              code: "450205",
              name: "柳北区"
            },
            {
              code: "450206",
              name: "柳江区"
            },
            {
              code: "450222",
              name: "柳城县"
            },
            {
              code: "450223",
              name: "鹿寨县"
            },
            {
              code: "450224",
              name: "融安县"
            },
            {
              code: "450225",
              name: "融水苗族自治县"
            },
            {
              code: "450226",
              name: "三江侗族自治县"
            }
          ]
        },
        {
          code: "4503",
          name: "桂林市",
          children: [
            {
              code: "450302",
              name: "秀峰区"
            },
            {
              code: "450303",
              name: "叠彩区"
            },
            {
              code: "450304",
              name: "象山区"
            },
            {
              code: "450305",
              name: "七星区"
            },
            {
              code: "450311",
              name: "雁山区"
            },
            {
              code: "450312",
              name: "临桂区"
            },
            {
              code: "450321",
              name: "阳朔县"
            },
            {
              code: "450323",
              name: "灵川县"
            },
            {
              code: "450324",
              name: "全州县"
            },
            {
              code: "450325",
              name: "兴安县"
            },
            {
              code: "450326",
              name: "永福县"
            },
            {
              code: "450327",
              name: "灌阳县"
            },
            {
              code: "450328",
              name: "龙胜各族自治县"
            },
            {
              code: "450329",
              name: "资源县"
            },
            {
              code: "450330",
              name: "平乐县"
            },
            {
              code: "450332",
              name: "恭城瑶族自治县"
            },
            {
              code: "450381",
              name: "荔浦市"
            }
          ]
        },
        {
          code: "4504",
          name: "梧州市",
          children: [
            {
              code: "450403",
              name: "万秀区"
            },
            {
              code: "450405",
              name: "长洲区"
            },
            {
              code: "450406",
              name: "龙圩区"
            },
            {
              code: "450421",
              name: "苍梧县"
            },
            {
              code: "450422",
              name: "藤县"
            },
            {
              code: "450423",
              name: "蒙山县"
            },
            {
              code: "450481",
              name: "岑溪市"
            }
          ]
        },
        {
          code: "4505",
          name: "北海市",
          children: [
            {
              code: "450502",
              name: "海城区"
            },
            {
              code: "450503",
              name: "银海区"
            },
            {
              code: "450512",
              name: "铁山港区"
            },
            {
              code: "450521",
              name: "合浦县"
            }
          ]
        },
        {
          code: "4506",
          name: "防城港市",
          children: [
            {
              code: "450602",
              name: "港口区"
            },
            {
              code: "450603",
              name: "防城区"
            },
            {
              code: "450621",
              name: "上思县"
            },
            {
              code: "450681",
              name: "东兴市"
            }
          ]
        },
        {
          code: "4507",
          name: "钦州市",
          children: [
            {
              code: "450702",
              name: "钦南区"
            },
            {
              code: "450703",
              name: "钦北区"
            },
            {
              code: "450721",
              name: "灵山县"
            },
            {
              code: "450722",
              name: "浦北县"
            }
          ]
        },
        {
          code: "4508",
          name: "贵港市",
          children: [
            {
              code: "450802",
              name: "港北区"
            },
            {
              code: "450803",
              name: "港南区"
            },
            {
              code: "450804",
              name: "覃塘区"
            },
            {
              code: "450821",
              name: "平南县"
            },
            {
              code: "450881",
              name: "桂平市"
            }
          ]
        },
        {
          code: "4509",
          name: "玉林市",
          children: [
            {
              code: "450902",
              name: "玉州区"
            },
            {
              code: "450903",
              name: "福绵区"
            },
            {
              code: "450921",
              name: "容县"
            },
            {
              code: "450922",
              name: "陆川县"
            },
            {
              code: "450923",
              name: "博白县"
            },
            {
              code: "450924",
              name: "兴业县"
            },
            {
              code: "450981",
              name: "北流市"
            }
          ]
        },
        {
          code: "4510",
          name: "百色市",
          children: [
            {
              code: "451002",
              name: "右江区"
            },
            {
              code: "451003",
              name: "田阳区"
            },
            {
              code: "451022",
              name: "田东县"
            },
            {
              code: "451024",
              name: "德保县"
            },
            {
              code: "451026",
              name: "那坡县"
            },
            {
              code: "451027",
              name: "凌云县"
            },
            {
              code: "451028",
              name: "乐业县"
            },
            {
              code: "451029",
              name: "田林县"
            },
            {
              code: "451030",
              name: "西林县"
            },
            {
              code: "451031",
              name: "隆林各族自治县"
            },
            {
              code: "451081",
              name: "靖西市"
            },
            {
              code: "451082",
              name: "平果市"
            }
          ]
        },
        {
          code: "4511",
          name: "贺州市",
          children: [
            {
              code: "451102",
              name: "八步区"
            },
            {
              code: "451103",
              name: "平桂区"
            },
            {
              code: "451121",
              name: "昭平县"
            },
            {
              code: "451122",
              name: "钟山县"
            },
            {
              code: "451123",
              name: "富川瑶族自治县"
            }
          ]
        },
        {
          code: "4512",
          name: "河池市",
          children: [
            {
              code: "451202",
              name: "金城江区"
            },
            {
              code: "451203",
              name: "宜州区"
            },
            {
              code: "451221",
              name: "南丹县"
            },
            {
              code: "451222",
              name: "天峨县"
            },
            {
              code: "451223",
              name: "凤山县"
            },
            {
              code: "451224",
              name: "东兰县"
            },
            {
              code: "451225",
              name: "罗城仫佬族自治县"
            },
            {
              code: "451226",
              name: "环江毛南族自治县"
            },
            {
              code: "451227",
              name: "巴马瑶族自治县"
            },
            {
              code: "451228",
              name: "都安瑶族自治县"
            },
            {
              code: "451229",
              name: "大化瑶族自治县"
            }
          ]
        },
        {
          code: "4513",
          name: "来宾市",
          children: [
            {
              code: "451302",
              name: "兴宾区"
            },
            {
              code: "451321",
              name: "忻城县"
            },
            {
              code: "451322",
              name: "象州县"
            },
            {
              code: "451323",
              name: "武宣县"
            },
            {
              code: "451324",
              name: "金秀瑶族自治县"
            },
            {
              code: "451381",
              name: "合山市"
            }
          ]
        },
        {
          code: "4514",
          name: "崇左市",
          children: [
            {
              code: "451402",
              name: "江州区"
            },
            {
              code: "451421",
              name: "扶绥县"
            },
            {
              code: "451422",
              name: "宁明县"
            },
            {
              code: "451423",
              name: "龙州县"
            },
            {
              code: "451424",
              name: "大新县"
            },
            {
              code: "451425",
              name: "天等县"
            },
            {
              code: "451481",
              name: "凭祥市"
            }
          ]
        }
      ]
    },
    {
      code: "46",
      name: "海南省",
      children: [
        {
          code: "4601",
          name: "海口市",
          children: [
            {
              code: "460105",
              name: "秀英区"
            },
            {
              code: "460106",
              name: "龙华区"
            },
            {
              code: "460107",
              name: "琼山区"
            },
            {
              code: "460108",
              name: "美兰区"
            }
          ]
        },
        {
          code: "4602",
          name: "三亚市",
          children: [
            {
              code: "460202",
              name: "海棠区"
            },
            {
              code: "460203",
              name: "吉阳区"
            },
            {
              code: "460204",
              name: "天涯区"
            },
            {
              code: "460205",
              name: "崖州区"
            }
          ]
        },
        {
          code: "4603",
          name: "三沙市",
          children: [
            {
              code: "460321",
              name: "西沙群岛"
            },
            {
              code: "460322",
              name: "南沙群岛"
            },
            {
              code: "460323",
              name: "中沙群岛的岛礁及其海域"
            }
          ]
        },
        {
          code: "4604",
          name: "儋州市",
          children: [
            {
              code: "460400100",
              name: "那大镇"
            },
            {
              code: "460400101",
              name: "和庆镇"
            },
            {
              code: "460400102",
              name: "南丰镇"
            },
            {
              code: "460400103",
              name: "大成镇"
            },
            {
              code: "460400104",
              name: "雅星镇"
            },
            {
              code: "460400105",
              name: "兰洋镇"
            },
            {
              code: "460400106",
              name: "光村镇"
            },
            {
              code: "460400107",
              name: "木棠镇"
            },
            {
              code: "460400108",
              name: "海头镇"
            },
            {
              code: "460400109",
              name: "峨蔓镇"
            },
            {
              code: "460400111",
              name: "王五镇"
            },
            {
              code: "460400112",
              name: "白马井镇"
            },
            {
              code: "460400113",
              name: "中和镇"
            },
            {
              code: "460400114",
              name: "排浦镇"
            },
            {
              code: "460400115",
              name: "东成镇"
            },
            {
              code: "460400116",
              name: "新州镇"
            },
            {
              code: "460400499",
              name: "洋浦经济开发区"
            },
            {
              code: "460400500",
              name: "华南热作学院"
            }
          ]
        },
        {
          code: "4690",
          name: "省直辖县级行政区划",
          children: [
            {
              code: "469001",
              name: "五指山市"
            },
            {
              code: "469002",
              name: "琼海市"
            },
            {
              code: "469005",
              name: "文昌市"
            },
            {
              code: "469006",
              name: "万宁市"
            },
            {
              code: "469007",
              name: "东方市"
            },
            {
              code: "469021",
              name: "定安县"
            },
            {
              code: "469022",
              name: "屯昌县"
            },
            {
              code: "469023",
              name: "澄迈县"
            },
            {
              code: "469024",
              name: "临高县"
            },
            {
              code: "469025",
              name: "白沙黎族自治县"
            },
            {
              code: "469026",
              name: "昌江黎族自治县"
            },
            {
              code: "469027",
              name: "乐东黎族自治县"
            },
            {
              code: "469028",
              name: "陵水黎族自治县"
            },
            {
              code: "469029",
              name: "保亭黎族苗族自治县"
            },
            {
              code: "469030",
              name: "琼中黎族苗族自治县"
            }
          ]
        }
      ]
    },
    {
      code: "50",
      name: "重庆市",
      children: [
        {
          code: "5001",
          name: "市辖区",
          children: [
            {
              code: "500101",
              name: "万州区"
            },
            {
              code: "500102",
              name: "涪陵区"
            },
            {
              code: "500103",
              name: "渝中区"
            },
            {
              code: "500104",
              name: "大渡口区"
            },
            {
              code: "500105",
              name: "江北区"
            },
            {
              code: "500106",
              name: "沙坪坝区"
            },
            {
              code: "500107",
              name: "九龙坡区"
            },
            {
              code: "500108",
              name: "南岸区"
            },
            {
              code: "500109",
              name: "北碚区"
            },
            {
              code: "500110",
              name: "綦江区"
            },
            {
              code: "500111",
              name: "大足区"
            },
            {
              code: "500112",
              name: "渝北区"
            },
            {
              code: "500113",
              name: "巴南区"
            },
            {
              code: "500114",
              name: "黔江区"
            },
            {
              code: "500115",
              name: "长寿区"
            },
            {
              code: "500116",
              name: "江津区"
            },
            {
              code: "500117",
              name: "合川区"
            },
            {
              code: "500118",
              name: "永川区"
            },
            {
              code: "500119",
              name: "南川区"
            },
            {
              code: "500120",
              name: "璧山区"
            },
            {
              code: "500151",
              name: "铜梁区"
            },
            {
              code: "500152",
              name: "潼南区"
            },
            {
              code: "500153",
              name: "荣昌区"
            },
            {
              code: "500154",
              name: "开州区"
            },
            {
              code: "500155",
              name: "梁平区"
            },
            {
              code: "500156",
              name: "武隆区"
            }
          ]
        },
        {
          code: "5002",
          name: "县",
          children: [
            {
              code: "500229",
              name: "城口县"
            },
            {
              code: "500230",
              name: "丰都县"
            },
            {
              code: "500231",
              name: "垫江县"
            },
            {
              code: "500233",
              name: "忠县"
            },
            {
              code: "500235",
              name: "云阳县"
            },
            {
              code: "500236",
              name: "奉节县"
            },
            {
              code: "500237",
              name: "巫山县"
            },
            {
              code: "500238",
              name: "巫溪县"
            },
            {
              code: "500240",
              name: "石柱土家族自治县"
            },
            {
              code: "500241",
              name: "秀山土家族苗族自治县"
            },
            {
              code: "500242",
              name: "酉阳土家族苗族自治县"
            },
            {
              code: "500243",
              name: "彭水苗族土家族自治县"
            }
          ]
        }
      ]
    },
    {
      code: "51",
      name: "四川省",
      children: [
        {
          code: "5101",
          name: "成都市",
          children: [
            {
              code: "510104",
              name: "锦江区"
            },
            {
              code: "510105",
              name: "青羊区"
            },
            {
              code: "510106",
              name: "金牛区"
            },
            {
              code: "510107",
              name: "武侯区"
            },
            {
              code: "510108",
              name: "成华区"
            },
            {
              code: "510112",
              name: "龙泉驿区"
            },
            {
              code: "510113",
              name: "青白江区"
            },
            {
              code: "510114",
              name: "新都区"
            },
            {
              code: "510115",
              name: "温江区"
            },
            {
              code: "510116",
              name: "双流区"
            },
            {
              code: "510117",
              name: "郫都区"
            },
            {
              code: "510118",
              name: "新津区"
            },
            {
              code: "510121",
              name: "金堂县"
            },
            {
              code: "510129",
              name: "大邑县"
            },
            {
              code: "510131",
              name: "蒲江县"
            },
            {
              code: "510181",
              name: "都江堰市"
            },
            {
              code: "510182",
              name: "彭州市"
            },
            {
              code: "510183",
              name: "邛崃市"
            },
            {
              code: "510184",
              name: "崇州市"
            },
            {
              code: "510185",
              name: "简阳市"
            }
          ]
        },
        {
          code: "5103",
          name: "自贡市",
          children: [
            {
              code: "510302",
              name: "自流井区"
            },
            {
              code: "510303",
              name: "贡井区"
            },
            {
              code: "510304",
              name: "大安区"
            },
            {
              code: "510311",
              name: "沿滩区"
            },
            {
              code: "510321",
              name: "荣县"
            },
            {
              code: "510322",
              name: "富顺县"
            }
          ]
        },
        {
          code: "5104",
          name: "攀枝花市",
          children: [
            {
              code: "510402",
              name: "东区"
            },
            {
              code: "510403",
              name: "西区"
            },
            {
              code: "510411",
              name: "仁和区"
            },
            {
              code: "510421",
              name: "米易县"
            },
            {
              code: "510422",
              name: "盐边县"
            }
          ]
        },
        {
          code: "5105",
          name: "泸州市",
          children: [
            {
              code: "510502",
              name: "江阳区"
            },
            {
              code: "510503",
              name: "纳溪区"
            },
            {
              code: "510504",
              name: "龙马潭区"
            },
            {
              code: "510521",
              name: "泸县"
            },
            {
              code: "510522",
              name: "合江县"
            },
            {
              code: "510524",
              name: "叙永县"
            },
            {
              code: "510525",
              name: "古蔺县"
            }
          ]
        },
        {
          code: "5106",
          name: "德阳市",
          children: [
            {
              code: "510603",
              name: "旌阳区"
            },
            {
              code: "510604",
              name: "罗江区"
            },
            {
              code: "510623",
              name: "中江县"
            },
            {
              code: "510681",
              name: "广汉市"
            },
            {
              code: "510682",
              name: "什邡市"
            },
            {
              code: "510683",
              name: "绵竹市"
            }
          ]
        },
        {
          code: "5107",
          name: "绵阳市",
          children: [
            {
              code: "510703",
              name: "涪城区"
            },
            {
              code: "510704",
              name: "游仙区"
            },
            {
              code: "510705",
              name: "安州区"
            },
            {
              code: "510722",
              name: "三台县"
            },
            {
              code: "510723",
              name: "盐亭县"
            },
            {
              code: "510725",
              name: "梓潼县"
            },
            {
              code: "510726",
              name: "北川羌族自治县"
            },
            {
              code: "510727",
              name: "平武县"
            },
            {
              code: "510781",
              name: "江油市"
            }
          ]
        },
        {
          code: "5108",
          name: "广元市",
          children: [
            {
              code: "510802",
              name: "利州区"
            },
            {
              code: "510811",
              name: "昭化区"
            },
            {
              code: "510812",
              name: "朝天区"
            },
            {
              code: "510821",
              name: "旺苍县"
            },
            {
              code: "510822",
              name: "青川县"
            },
            {
              code: "510823",
              name: "剑阁县"
            },
            {
              code: "510824",
              name: "苍溪县"
            }
          ]
        },
        {
          code: "5109",
          name: "遂宁市",
          children: [
            {
              code: "510903",
              name: "船山区"
            },
            {
              code: "510904",
              name: "安居区"
            },
            {
              code: "510921",
              name: "蓬溪县"
            },
            {
              code: "510923",
              name: "大英县"
            },
            {
              code: "510981",
              name: "射洪市"
            }
          ]
        },
        {
          code: "5110",
          name: "内江市",
          children: [
            {
              code: "511002",
              name: "市中区"
            },
            {
              code: "511011",
              name: "东兴区"
            },
            {
              code: "511024",
              name: "威远县"
            },
            {
              code: "511025",
              name: "资中县"
            },
            {
              code: "511083",
              name: "隆昌市"
            }
          ]
        },
        {
          code: "5111",
          name: "乐山市",
          children: [
            {
              code: "511102",
              name: "市中区"
            },
            {
              code: "511111",
              name: "沙湾区"
            },
            {
              code: "511112",
              name: "五通桥区"
            },
            {
              code: "511113",
              name: "金口河区"
            },
            {
              code: "511123",
              name: "犍为县"
            },
            {
              code: "511124",
              name: "井研县"
            },
            {
              code: "511126",
              name: "夹江县"
            },
            {
              code: "511129",
              name: "沐川县"
            },
            {
              code: "511132",
              name: "峨边彝族自治县"
            },
            {
              code: "511133",
              name: "马边彝族自治县"
            },
            {
              code: "511181",
              name: "峨眉山市"
            }
          ]
        },
        {
          code: "5113",
          name: "南充市",
          children: [
            {
              code: "511302",
              name: "顺庆区"
            },
            {
              code: "511303",
              name: "高坪区"
            },
            {
              code: "511304",
              name: "嘉陵区"
            },
            {
              code: "511321",
              name: "南部县"
            },
            {
              code: "511322",
              name: "营山县"
            },
            {
              code: "511323",
              name: "蓬安县"
            },
            {
              code: "511324",
              name: "仪陇县"
            },
            {
              code: "511325",
              name: "西充县"
            },
            {
              code: "511381",
              name: "阆中市"
            }
          ]
        },
        {
          code: "5114",
          name: "眉山市",
          children: [
            {
              code: "511402",
              name: "东坡区"
            },
            {
              code: "511403",
              name: "彭山区"
            },
            {
              code: "511421",
              name: "仁寿县"
            },
            {
              code: "511423",
              name: "洪雅县"
            },
            {
              code: "511424",
              name: "丹棱县"
            },
            {
              code: "511425",
              name: "青神县"
            }
          ]
        },
        {
          code: "5115",
          name: "宜宾市",
          children: [
            {
              code: "511502",
              name: "翠屏区"
            },
            {
              code: "511503",
              name: "南溪区"
            },
            {
              code: "511504",
              name: "叙州区"
            },
            {
              code: "511523",
              name: "江安县"
            },
            {
              code: "511524",
              name: "长宁县"
            },
            {
              code: "511525",
              name: "高县"
            },
            {
              code: "511526",
              name: "珙县"
            },
            {
              code: "511527",
              name: "筠连县"
            },
            {
              code: "511528",
              name: "兴文县"
            },
            {
              code: "511529",
              name: "屏山县"
            }
          ]
        },
        {
          code: "5116",
          name: "广安市",
          children: [
            {
              code: "511602",
              name: "广安区"
            },
            {
              code: "511603",
              name: "前锋区"
            },
            {
              code: "511621",
              name: "岳池县"
            },
            {
              code: "511622",
              name: "武胜县"
            },
            {
              code: "511623",
              name: "邻水县"
            },
            {
              code: "511681",
              name: "华蓥市"
            }
          ]
        },
        {
          code: "5117",
          name: "达州市",
          children: [
            {
              code: "511702",
              name: "通川区"
            },
            {
              code: "511703",
              name: "达川区"
            },
            {
              code: "511722",
              name: "宣汉县"
            },
            {
              code: "511723",
              name: "开江县"
            },
            {
              code: "511724",
              name: "大竹县"
            },
            {
              code: "511725",
              name: "渠县"
            },
            {
              code: "511781",
              name: "万源市"
            }
          ]
        },
        {
          code: "5118",
          name: "雅安市",
          children: [
            {
              code: "511802",
              name: "雨城区"
            },
            {
              code: "511803",
              name: "名山区"
            },
            {
              code: "511822",
              name: "荥经县"
            },
            {
              code: "511823",
              name: "汉源县"
            },
            {
              code: "511824",
              name: "石棉县"
            },
            {
              code: "511825",
              name: "天全县"
            },
            {
              code: "511826",
              name: "芦山县"
            },
            {
              code: "511827",
              name: "宝兴县"
            }
          ]
        },
        {
          code: "5119",
          name: "巴中市",
          children: [
            {
              code: "511902",
              name: "巴州区"
            },
            {
              code: "511903",
              name: "恩阳区"
            },
            {
              code: "511921",
              name: "通江县"
            },
            {
              code: "511922",
              name: "南江县"
            },
            {
              code: "511923",
              name: "平昌县"
            }
          ]
        },
        {
          code: "5120",
          name: "资阳市",
          children: [
            {
              code: "512002",
              name: "雁江区"
            },
            {
              code: "512021",
              name: "安岳县"
            },
            {
              code: "512022",
              name: "乐至县"
            }
          ]
        },
        {
          code: "5132",
          name: "阿坝藏族羌族自治州",
          children: [
            {
              code: "513201",
              name: "马尔康市"
            },
            {
              code: "513221",
              name: "汶川县"
            },
            {
              code: "513222",
              name: "理县"
            },
            {
              code: "513223",
              name: "茂县"
            },
            {
              code: "513224",
              name: "松潘县"
            },
            {
              code: "513225",
              name: "九寨沟县"
            },
            {
              code: "513226",
              name: "金川县"
            },
            {
              code: "513227",
              name: "小金县"
            },
            {
              code: "513228",
              name: "黑水县"
            },
            {
              code: "513230",
              name: "壤塘县"
            },
            {
              code: "513231",
              name: "阿坝县"
            },
            {
              code: "513232",
              name: "若尔盖县"
            },
            {
              code: "513233",
              name: "红原县"
            }
          ]
        },
        {
          code: "5133",
          name: "甘孜藏族自治州",
          children: [
            {
              code: "513301",
              name: "康定市"
            },
            {
              code: "513322",
              name: "泸定县"
            },
            {
              code: "513323",
              name: "丹巴县"
            },
            {
              code: "513324",
              name: "九龙县"
            },
            {
              code: "513325",
              name: "雅江县"
            },
            {
              code: "513326",
              name: "道孚县"
            },
            {
              code: "513327",
              name: "炉霍县"
            },
            {
              code: "513328",
              name: "甘孜县"
            },
            {
              code: "513329",
              name: "新龙县"
            },
            {
              code: "513330",
              name: "德格县"
            },
            {
              code: "513331",
              name: "白玉县"
            },
            {
              code: "513332",
              name: "石渠县"
            },
            {
              code: "513333",
              name: "色达县"
            },
            {
              code: "513334",
              name: "理塘县"
            },
            {
              code: "513335",
              name: "巴塘县"
            },
            {
              code: "513336",
              name: "乡城县"
            },
            {
              code: "513337",
              name: "稻城县"
            },
            {
              code: "513338",
              name: "得荣县"
            }
          ]
        },
        {
          code: "5134",
          name: "凉山彝族自治州",
          children: [
            {
              code: "513401",
              name: "西昌市"
            },
            {
              code: "513402",
              name: "会理市"
            },
            {
              code: "513422",
              name: "木里藏族自治县"
            },
            {
              code: "513423",
              name: "盐源县"
            },
            {
              code: "513424",
              name: "德昌县"
            },
            {
              code: "513426",
              name: "会东县"
            },
            {
              code: "513427",
              name: "宁南县"
            },
            {
              code: "513428",
              name: "普格县"
            },
            {
              code: "513429",
              name: "布拖县"
            },
            {
              code: "513430",
              name: "金阳县"
            },
            {
              code: "513431",
              name: "昭觉县"
            },
            {
              code: "513432",
              name: "喜德县"
            },
            {
              code: "513433",
              name: "冕宁县"
            },
            {
              code: "513434",
              name: "越西县"
            },
            {
              code: "513435",
              name: "甘洛县"
            },
            {
              code: "513436",
              name: "美姑县"
            },
            {
              code: "513437",
              name: "雷波县"
            }
          ]
        }
      ]
    },
    {
      code: "52",
      name: "贵州省",
      children: [
        {
          code: "5201",
          name: "贵阳市",
          children: [
            {
              code: "520102",
              name: "南明区"
            },
            {
              code: "520103",
              name: "云岩区"
            },
            {
              code: "520111",
              name: "花溪区"
            },
            {
              code: "520112",
              name: "乌当区"
            },
            {
              code: "520113",
              name: "白云区"
            },
            {
              code: "520115",
              name: "观山湖区"
            },
            {
              code: "520121",
              name: "开阳县"
            },
            {
              code: "520122",
              name: "息烽县"
            },
            {
              code: "520123",
              name: "修文县"
            },
            {
              code: "520181",
              name: "清镇市"
            }
          ]
        },
        {
          code: "5202",
          name: "六盘水市",
          children: [
            {
              code: "520201",
              name: "钟山区"
            },
            {
              code: "520203",
              name: "六枝特区"
            },
            {
              code: "520204",
              name: "水城区"
            },
            {
              code: "520281",
              name: "盘州市"
            }
          ]
        },
        {
          code: "5203",
          name: "遵义市",
          children: [
            {
              code: "520302",
              name: "红花岗区"
            },
            {
              code: "520303",
              name: "汇川区"
            },
            {
              code: "520304",
              name: "播州区"
            },
            {
              code: "520322",
              name: "桐梓县"
            },
            {
              code: "520323",
              name: "绥阳县"
            },
            {
              code: "520324",
              name: "正安县"
            },
            {
              code: "520325",
              name: "道真仡佬族苗族自治县"
            },
            {
              code: "520326",
              name: "务川仡佬族苗族自治县"
            },
            {
              code: "520327",
              name: "凤冈县"
            },
            {
              code: "520328",
              name: "湄潭县"
            },
            {
              code: "520329",
              name: "余庆县"
            },
            {
              code: "520330",
              name: "习水县"
            },
            {
              code: "520381",
              name: "赤水市"
            },
            {
              code: "520382",
              name: "仁怀市"
            }
          ]
        },
        {
          code: "5204",
          name: "安顺市",
          children: [
            {
              code: "520402",
              name: "西秀区"
            },
            {
              code: "520403",
              name: "平坝区"
            },
            {
              code: "520422",
              name: "普定县"
            },
            {
              code: "520423",
              name: "镇宁布依族苗族自治县"
            },
            {
              code: "520424",
              name: "关岭布依族苗族自治县"
            },
            {
              code: "520425",
              name: "紫云苗族布依族自治县"
            }
          ]
        },
        {
          code: "5205",
          name: "毕节市",
          children: [
            {
              code: "520502",
              name: "七星关区"
            },
            {
              code: "520521",
              name: "大方县"
            },
            {
              code: "520523",
              name: "金沙县"
            },
            {
              code: "520524",
              name: "织金县"
            },
            {
              code: "520525",
              name: "纳雍县"
            },
            {
              code: "520526",
              name: "威宁彝族回族苗族自治县"
            },
            {
              code: "520527",
              name: "赫章县"
            },
            {
              code: "520581",
              name: "黔西市"
            }
          ]
        },
        {
          code: "5206",
          name: "铜仁市",
          children: [
            {
              code: "520602",
              name: "碧江区"
            },
            {
              code: "520603",
              name: "万山区"
            },
            {
              code: "520621",
              name: "江口县"
            },
            {
              code: "520622",
              name: "玉屏侗族自治县"
            },
            {
              code: "520623",
              name: "石阡县"
            },
            {
              code: "520624",
              name: "思南县"
            },
            {
              code: "520625",
              name: "印江土家族苗族自治县"
            },
            {
              code: "520626",
              name: "德江县"
            },
            {
              code: "520627",
              name: "沿河土家族自治县"
            },
            {
              code: "520628",
              name: "松桃苗族自治县"
            }
          ]
        },
        {
          code: "5223",
          name: "黔西南布依族苗族自治州",
          children: [
            {
              code: "522301",
              name: "兴义市"
            },
            {
              code: "522302",
              name: "兴仁市"
            },
            {
              code: "522323",
              name: "普安县"
            },
            {
              code: "522324",
              name: "晴隆县"
            },
            {
              code: "522325",
              name: "贞丰县"
            },
            {
              code: "522326",
              name: "望谟县"
            },
            {
              code: "522327",
              name: "册亨县"
            },
            {
              code: "522328",
              name: "安龙县"
            }
          ]
        },
        {
          code: "5226",
          name: "黔东南苗族侗族自治州",
          children: [
            {
              code: "522601",
              name: "凯里市"
            },
            {
              code: "522622",
              name: "黄平县"
            },
            {
              code: "522623",
              name: "施秉县"
            },
            {
              code: "522624",
              name: "三穗县"
            },
            {
              code: "522625",
              name: "镇远县"
            },
            {
              code: "522626",
              name: "岑巩县"
            },
            {
              code: "522627",
              name: "天柱县"
            },
            {
              code: "522628",
              name: "锦屏县"
            },
            {
              code: "522629",
              name: "剑河县"
            },
            {
              code: "522630",
              name: "台江县"
            },
            {
              code: "522631",
              name: "黎平县"
            },
            {
              code: "522632",
              name: "榕江县"
            },
            {
              code: "522633",
              name: "从江县"
            },
            {
              code: "522634",
              name: "雷山县"
            },
            {
              code: "522635",
              name: "麻江县"
            },
            {
              code: "522636",
              name: "丹寨县"
            }
          ]
        },
        {
          code: "5227",
          name: "黔南布依族苗族自治州",
          children: [
            {
              code: "522701",
              name: "都匀市"
            },
            {
              code: "522702",
              name: "福泉市"
            },
            {
              code: "522722",
              name: "荔波县"
            },
            {
              code: "522723",
              name: "贵定县"
            },
            {
              code: "522725",
              name: "瓮安县"
            },
            {
              code: "522726",
              name: "独山县"
            },
            {
              code: "522727",
              name: "平塘县"
            },
            {
              code: "522728",
              name: "罗甸县"
            },
            {
              code: "522729",
              name: "长顺县"
            },
            {
              code: "522730",
              name: "龙里县"
            },
            {
              code: "522731",
              name: "惠水县"
            },
            {
              code: "522732",
              name: "三都水族自治县"
            }
          ]
        }
      ]
    },
    {
      code: "53",
      name: "云南省",
      children: [
        {
          code: "5301",
          name: "昆明市",
          children: [
            {
              code: "530102",
              name: "五华区"
            },
            {
              code: "530103",
              name: "盘龙区"
            },
            {
              code: "530111",
              name: "官渡区"
            },
            {
              code: "530112",
              name: "西山区"
            },
            {
              code: "530113",
              name: "东川区"
            },
            {
              code: "530114",
              name: "呈贡区"
            },
            {
              code: "530115",
              name: "晋宁区"
            },
            {
              code: "530124",
              name: "富民县"
            },
            {
              code: "530125",
              name: "宜良县"
            },
            {
              code: "530126",
              name: "石林彝族自治县"
            },
            {
              code: "530127",
              name: "嵩明县"
            },
            {
              code: "530128",
              name: "禄劝彝族苗族自治县"
            },
            {
              code: "530129",
              name: "寻甸回族彝族自治县"
            },
            {
              code: "530181",
              name: "安宁市"
            }
          ]
        },
        {
          code: "5303",
          name: "曲靖市",
          children: [
            {
              code: "530302",
              name: "麒麟区"
            },
            {
              code: "530303",
              name: "沾益区"
            },
            {
              code: "530304",
              name: "马龙区"
            },
            {
              code: "530322",
              name: "陆良县"
            },
            {
              code: "530323",
              name: "师宗县"
            },
            {
              code: "530324",
              name: "罗平县"
            },
            {
              code: "530325",
              name: "富源县"
            },
            {
              code: "530326",
              name: "会泽县"
            },
            {
              code: "530381",
              name: "宣威市"
            }
          ]
        },
        {
          code: "5304",
          name: "玉溪市",
          children: [
            {
              code: "530402",
              name: "红塔区"
            },
            {
              code: "530403",
              name: "江川区"
            },
            {
              code: "530423",
              name: "通海县"
            },
            {
              code: "530424",
              name: "华宁县"
            },
            {
              code: "530425",
              name: "易门县"
            },
            {
              code: "530426",
              name: "峨山彝族自治县"
            },
            {
              code: "530427",
              name: "新平彝族傣族自治县"
            },
            {
              code: "530428",
              name: "元江哈尼族彝族傣族自治县"
            },
            {
              code: "530481",
              name: "澄江市"
            }
          ]
        },
        {
          code: "5305",
          name: "保山市",
          children: [
            {
              code: "530502",
              name: "隆阳区"
            },
            {
              code: "530521",
              name: "施甸县"
            },
            {
              code: "530523",
              name: "龙陵县"
            },
            {
              code: "530524",
              name: "昌宁县"
            },
            {
              code: "530581",
              name: "腾冲市"
            }
          ]
        },
        {
          code: "5306",
          name: "昭通市",
          children: [
            {
              code: "530602",
              name: "昭阳区"
            },
            {
              code: "530621",
              name: "鲁甸县"
            },
            {
              code: "530622",
              name: "巧家县"
            },
            {
              code: "530623",
              name: "盐津县"
            },
            {
              code: "530624",
              name: "大关县"
            },
            {
              code: "530625",
              name: "永善县"
            },
            {
              code: "530626",
              name: "绥江县"
            },
            {
              code: "530627",
              name: "镇雄县"
            },
            {
              code: "530628",
              name: "彝良县"
            },
            {
              code: "530629",
              name: "威信县"
            },
            {
              code: "530681",
              name: "水富市"
            }
          ]
        },
        {
          code: "5307",
          name: "丽江市",
          children: [
            {
              code: "530702",
              name: "古城区"
            },
            {
              code: "530721",
              name: "玉龙纳西族自治县"
            },
            {
              code: "530722",
              name: "永胜县"
            },
            {
              code: "530723",
              name: "华坪县"
            },
            {
              code: "530724",
              name: "宁蒗彝族自治县"
            }
          ]
        },
        {
          code: "5308",
          name: "普洱市",
          children: [
            {
              code: "530802",
              name: "思茅区"
            },
            {
              code: "530821",
              name: "宁洱哈尼族彝族自治县"
            },
            {
              code: "530822",
              name: "墨江哈尼族自治县"
            },
            {
              code: "530823",
              name: "景东彝族自治县"
            },
            {
              code: "530824",
              name: "景谷傣族彝族自治县"
            },
            {
              code: "530825",
              name: "镇沅彝族哈尼族拉祜族自治县"
            },
            {
              code: "530826",
              name: "江城哈尼族彝族自治县"
            },
            {
              code: "530827",
              name: "孟连傣族拉祜族佤族自治县"
            },
            {
              code: "530828",
              name: "澜沧拉祜族自治县"
            },
            {
              code: "530829",
              name: "西盟佤族自治县"
            }
          ]
        },
        {
          code: "5309",
          name: "临沧市",
          children: [
            {
              code: "530902",
              name: "临翔区"
            },
            {
              code: "530921",
              name: "凤庆县"
            },
            {
              code: "530922",
              name: "云县"
            },
            {
              code: "530923",
              name: "永德县"
            },
            {
              code: "530924",
              name: "镇康县"
            },
            {
              code: "530925",
              name: "双江拉祜族佤族布朗族傣族自治县"
            },
            {
              code: "530926",
              name: "耿马傣族佤族自治县"
            },
            {
              code: "530927",
              name: "沧源佤族自治县"
            }
          ]
        },
        {
          code: "5323",
          name: "楚雄彝族自治州",
          children: [
            {
              code: "532301",
              name: "楚雄市"
            },
            {
              code: "532302",
              name: "禄丰市"
            },
            {
              code: "532322",
              name: "双柏县"
            },
            {
              code: "532323",
              name: "牟定县"
            },
            {
              code: "532324",
              name: "南华县"
            },
            {
              code: "532325",
              name: "姚安县"
            },
            {
              code: "532326",
              name: "大姚县"
            },
            {
              code: "532327",
              name: "永仁县"
            },
            {
              code: "532328",
              name: "元谋县"
            },
            {
              code: "532329",
              name: "武定县"
            }
          ]
        },
        {
          code: "5325",
          name: "红河哈尼族彝族自治州",
          children: [
            {
              code: "532501",
              name: "个旧市"
            },
            {
              code: "532502",
              name: "开远市"
            },
            {
              code: "532503",
              name: "蒙自市"
            },
            {
              code: "532504",
              name: "弥勒市"
            },
            {
              code: "532523",
              name: "屏边苗族自治县"
            },
            {
              code: "532524",
              name: "建水县"
            },
            {
              code: "532525",
              name: "石屏县"
            },
            {
              code: "532527",
              name: "泸西县"
            },
            {
              code: "532528",
              name: "元阳县"
            },
            {
              code: "532529",
              name: "红河县"
            },
            {
              code: "532530",
              name: "金平苗族瑶族傣族自治县"
            },
            {
              code: "532531",
              name: "绿春县"
            },
            {
              code: "532532",
              name: "河口瑶族自治县"
            }
          ]
        },
        {
          code: "5326",
          name: "文山壮族苗族自治州",
          children: [
            {
              code: "532601",
              name: "文山市"
            },
            {
              code: "532622",
              name: "砚山县"
            },
            {
              code: "532623",
              name: "西畴县"
            },
            {
              code: "532624",
              name: "麻栗坡县"
            },
            {
              code: "532625",
              name: "马关县"
            },
            {
              code: "532626",
              name: "丘北县"
            },
            {
              code: "532627",
              name: "广南县"
            },
            {
              code: "532628",
              name: "富宁县"
            }
          ]
        },
        {
          code: "5328",
          name: "西双版纳傣族自治州",
          children: [
            {
              code: "532801",
              name: "景洪市"
            },
            {
              code: "532822",
              name: "勐海县"
            },
            {
              code: "532823",
              name: "勐腊县"
            }
          ]
        },
        {
          code: "5329",
          name: "大理白族自治州",
          children: [
            {
              code: "532901",
              name: "大理市"
            },
            {
              code: "532922",
              name: "漾濞彝族自治县"
            },
            {
              code: "532923",
              name: "祥云县"
            },
            {
              code: "532924",
              name: "宾川县"
            },
            {
              code: "532925",
              name: "弥渡县"
            },
            {
              code: "532926",
              name: "南涧彝族自治县"
            },
            {
              code: "532927",
              name: "巍山彝族回族自治县"
            },
            {
              code: "532928",
              name: "永平县"
            },
            {
              code: "532929",
              name: "云龙县"
            },
            {
              code: "532930",
              name: "洱源县"
            },
            {
              code: "532931",
              name: "剑川县"
            },
            {
              code: "532932",
              name: "鹤庆县"
            }
          ]
        },
        {
          code: "5331",
          name: "德宏傣族景颇族自治州",
          children: [
            {
              code: "533102",
              name: "瑞丽市"
            },
            {
              code: "533103",
              name: "芒市"
            },
            {
              code: "533122",
              name: "梁河县"
            },
            {
              code: "533123",
              name: "盈江县"
            },
            {
              code: "533124",
              name: "陇川县"
            }
          ]
        },
        {
          code: "5333",
          name: "怒江傈僳族自治州",
          children: [
            {
              code: "533301",
              name: "泸水市"
            },
            {
              code: "533323",
              name: "福贡县"
            },
            {
              code: "533324",
              name: "贡山独龙族怒族自治县"
            },
            {
              code: "533325",
              name: "兰坪白族普米族自治县"
            }
          ]
        },
        {
          code: "5334",
          name: "迪庆藏族自治州",
          children: [
            {
              code: "533401",
              name: "香格里拉市"
            },
            {
              code: "533422",
              name: "德钦县"
            },
            {
              code: "533423",
              name: "维西傈僳族自治县"
            }
          ]
        }
      ]
    },
    {
      code: "54",
      name: "西藏自治区",
      children: [
        {
          code: "5401",
          name: "拉萨市",
          children: [
            {
              code: "540102",
              name: "城关区"
            },
            {
              code: "540103",
              name: "堆龙德庆区"
            },
            {
              code: "540104",
              name: "达孜区"
            },
            {
              code: "540121",
              name: "林周县"
            },
            {
              code: "540122",
              name: "当雄县"
            },
            {
              code: "540123",
              name: "尼木县"
            },
            {
              code: "540124",
              name: "曲水县"
            },
            {
              code: "540127",
              name: "墨竹工卡县"
            },
            {
              code: "540171",
              name: "格尔木藏青工业园区"
            },
            {
              code: "540172",
              name: "拉萨经济技术开发区"
            },
            {
              code: "540173",
              name: "西藏文化旅游创意园区"
            },
            {
              code: "540174",
              name: "达孜工业园区"
            }
          ]
        },
        {
          code: "5402",
          name: "日喀则市",
          children: [
            {
              code: "540202",
              name: "桑珠孜区"
            },
            {
              code: "540221",
              name: "南木林县"
            },
            {
              code: "540222",
              name: "江孜县"
            },
            {
              code: "540223",
              name: "定日县"
            },
            {
              code: "540224",
              name: "萨迦县"
            },
            {
              code: "540225",
              name: "拉孜县"
            },
            {
              code: "540226",
              name: "昂仁县"
            },
            {
              code: "540227",
              name: "谢通门县"
            },
            {
              code: "540228",
              name: "白朗县"
            },
            {
              code: "540229",
              name: "仁布县"
            },
            {
              code: "540230",
              name: "康马县"
            },
            {
              code: "540231",
              name: "定结县"
            },
            {
              code: "540232",
              name: "仲巴县"
            },
            {
              code: "540233",
              name: "亚东县"
            },
            {
              code: "540234",
              name: "吉隆县"
            },
            {
              code: "540235",
              name: "聂拉木县"
            },
            {
              code: "540236",
              name: "萨嘎县"
            },
            {
              code: "540237",
              name: "岗巴县"
            }
          ]
        },
        {
          code: "5403",
          name: "昌都市",
          children: [
            {
              code: "540302",
              name: "卡若区"
            },
            {
              code: "540321",
              name: "江达县"
            },
            {
              code: "540322",
              name: "贡觉县"
            },
            {
              code: "540323",
              name: "类乌齐县"
            },
            {
              code: "540324",
              name: "丁青县"
            },
            {
              code: "540325",
              name: "察雅县"
            },
            {
              code: "540326",
              name: "八宿县"
            },
            {
              code: "540327",
              name: "左贡县"
            },
            {
              code: "540328",
              name: "芒康县"
            },
            {
              code: "540329",
              name: "洛隆县"
            },
            {
              code: "540330",
              name: "边坝县"
            }
          ]
        },
        {
          code: "5404",
          name: "林芝市",
          children: [
            {
              code: "540402",
              name: "巴宜区"
            },
            {
              code: "540421",
              name: "工布江达县"
            },
            {
              code: "540423",
              name: "墨脱县"
            },
            {
              code: "540424",
              name: "波密县"
            },
            {
              code: "540425",
              name: "察隅县"
            },
            {
              code: "540426",
              name: "朗县"
            },
            {
              code: "540481",
              name: "米林市"
            }
          ]
        },
        {
          code: "5405",
          name: "山南市",
          children: [
            {
              code: "540502",
              name: "乃东区"
            },
            {
              code: "540521",
              name: "扎囊县"
            },
            {
              code: "540522",
              name: "贡嘎县"
            },
            {
              code: "540523",
              name: "桑日县"
            },
            {
              code: "540524",
              name: "琼结县"
            },
            {
              code: "540525",
              name: "曲松县"
            },
            {
              code: "540526",
              name: "措美县"
            },
            {
              code: "540527",
              name: "洛扎县"
            },
            {
              code: "540528",
              name: "加查县"
            },
            {
              code: "540529",
              name: "隆子县"
            },
            {
              code: "540531",
              name: "浪卡子县"
            },
            {
              code: "540581",
              name: "错那市"
            }
          ]
        },
        {
          code: "5406",
          name: "那曲市",
          children: [
            {
              code: "540602",
              name: "色尼区"
            },
            {
              code: "540621",
              name: "嘉黎县"
            },
            {
              code: "540622",
              name: "比如县"
            },
            {
              code: "540623",
              name: "聂荣县"
            },
            {
              code: "540624",
              name: "安多县"
            },
            {
              code: "540625",
              name: "申扎县"
            },
            {
              code: "540626",
              name: "索县"
            },
            {
              code: "540627",
              name: "班戈县"
            },
            {
              code: "540628",
              name: "巴青县"
            },
            {
              code: "540629",
              name: "尼玛县"
            },
            {
              code: "540630",
              name: "双湖县"
            }
          ]
        },
        {
          code: "5425",
          name: "阿里地区",
          children: [
            {
              code: "542521",
              name: "普兰县"
            },
            {
              code: "542522",
              name: "札达县"
            },
            {
              code: "542523",
              name: "噶尔县"
            },
            {
              code: "542524",
              name: "日土县"
            },
            {
              code: "542525",
              name: "革吉县"
            },
            {
              code: "542526",
              name: "改则县"
            },
            {
              code: "542527",
              name: "措勤县"
            }
          ]
        }
      ]
    },
    {
      code: "61",
      name: "陕西省",
      children: [
        {
          code: "6101",
          name: "西安市",
          children: [
            {
              code: "610102",
              name: "新城区"
            },
            {
              code: "610103",
              name: "碑林区"
            },
            {
              code: "610104",
              name: "莲湖区"
            },
            {
              code: "610111",
              name: "灞桥区"
            },
            {
              code: "610112",
              name: "未央区"
            },
            {
              code: "610113",
              name: "雁塔区"
            },
            {
              code: "610114",
              name: "阎良区"
            },
            {
              code: "610115",
              name: "临潼区"
            },
            {
              code: "610116",
              name: "长安区"
            },
            {
              code: "610117",
              name: "高陵区"
            },
            {
              code: "610118",
              name: "鄠邑区"
            },
            {
              code: "610122",
              name: "蓝田县"
            },
            {
              code: "610124",
              name: "周至县"
            }
          ]
        },
        {
          code: "6102",
          name: "铜川市",
          children: [
            {
              code: "610202",
              name: "王益区"
            },
            {
              code: "610203",
              name: "印台区"
            },
            {
              code: "610204",
              name: "耀州区"
            },
            {
              code: "610222",
              name: "宜君县"
            }
          ]
        },
        {
          code: "6103",
          name: "宝鸡市",
          children: [
            {
              code: "610302",
              name: "渭滨区"
            },
            {
              code: "610303",
              name: "金台区"
            },
            {
              code: "610304",
              name: "陈仓区"
            },
            {
              code: "610305",
              name: "凤翔区"
            },
            {
              code: "610323",
              name: "岐山县"
            },
            {
              code: "610324",
              name: "扶风县"
            },
            {
              code: "610326",
              name: "眉县"
            },
            {
              code: "610327",
              name: "陇县"
            },
            {
              code: "610328",
              name: "千阳县"
            },
            {
              code: "610329",
              name: "麟游县"
            },
            {
              code: "610330",
              name: "凤县"
            },
            {
              code: "610331",
              name: "太白县"
            }
          ]
        },
        {
          code: "6104",
          name: "咸阳市",
          children: [
            {
              code: "610402",
              name: "秦都区"
            },
            {
              code: "610403",
              name: "杨陵区"
            },
            {
              code: "610404",
              name: "渭城区"
            },
            {
              code: "610422",
              name: "三原县"
            },
            {
              code: "610423",
              name: "泾阳县"
            },
            {
              code: "610424",
              name: "乾县"
            },
            {
              code: "610425",
              name: "礼泉县"
            },
            {
              code: "610426",
              name: "永寿县"
            },
            {
              code: "610428",
              name: "长武县"
            },
            {
              code: "610429",
              name: "旬邑县"
            },
            {
              code: "610430",
              name: "淳化县"
            },
            {
              code: "610431",
              name: "武功县"
            },
            {
              code: "610481",
              name: "兴平市"
            },
            {
              code: "610482",
              name: "彬州市"
            }
          ]
        },
        {
          code: "6105",
          name: "渭南市",
          children: [
            {
              code: "610502",
              name: "临渭区"
            },
            {
              code: "610503",
              name: "华州区"
            },
            {
              code: "610522",
              name: "潼关县"
            },
            {
              code: "610523",
              name: "大荔县"
            },
            {
              code: "610524",
              name: "合阳县"
            },
            {
              code: "610525",
              name: "澄城县"
            },
            {
              code: "610526",
              name: "蒲城县"
            },
            {
              code: "610527",
              name: "白水县"
            },
            {
              code: "610528",
              name: "富平县"
            },
            {
              code: "610581",
              name: "韩城市"
            },
            {
              code: "610582",
              name: "华阴市"
            }
          ]
        },
        {
          code: "6106",
          name: "延安市",
          children: [
            {
              code: "610602",
              name: "宝塔区"
            },
            {
              code: "610603",
              name: "安塞区"
            },
            {
              code: "610621",
              name: "延长县"
            },
            {
              code: "610622",
              name: "延川县"
            },
            {
              code: "610625",
              name: "志丹县"
            },
            {
              code: "610626",
              name: "吴起县"
            },
            {
              code: "610627",
              name: "甘泉县"
            },
            {
              code: "610628",
              name: "富县"
            },
            {
              code: "610629",
              name: "洛川县"
            },
            {
              code: "610630",
              name: "宜川县"
            },
            {
              code: "610631",
              name: "黄龙县"
            },
            {
              code: "610632",
              name: "黄陵县"
            },
            {
              code: "610681",
              name: "子长市"
            }
          ]
        },
        {
          code: "6107",
          name: "汉中市",
          children: [
            {
              code: "610702",
              name: "汉台区"
            },
            {
              code: "610703",
              name: "南郑区"
            },
            {
              code: "610722",
              name: "城固县"
            },
            {
              code: "610723",
              name: "洋县"
            },
            {
              code: "610724",
              name: "西乡县"
            },
            {
              code: "610725",
              name: "勉县"
            },
            {
              code: "610726",
              name: "宁强县"
            },
            {
              code: "610727",
              name: "略阳县"
            },
            {
              code: "610728",
              name: "镇巴县"
            },
            {
              code: "610729",
              name: "留坝县"
            },
            {
              code: "610730",
              name: "佛坪县"
            }
          ]
        },
        {
          code: "6108",
          name: "榆林市",
          children: [
            {
              code: "610802",
              name: "榆阳区"
            },
            {
              code: "610803",
              name: "横山区"
            },
            {
              code: "610822",
              name: "府谷县"
            },
            {
              code: "610824",
              name: "靖边县"
            },
            {
              code: "610825",
              name: "定边县"
            },
            {
              code: "610826",
              name: "绥德县"
            },
            {
              code: "610827",
              name: "米脂县"
            },
            {
              code: "610828",
              name: "佳县"
            },
            {
              code: "610829",
              name: "吴堡县"
            },
            {
              code: "610830",
              name: "清涧县"
            },
            {
              code: "610831",
              name: "子洲县"
            },
            {
              code: "610881",
              name: "神木市"
            }
          ]
        },
        {
          code: "6109",
          name: "安康市",
          children: [
            {
              code: "610902",
              name: "汉滨区"
            },
            {
              code: "610921",
              name: "汉阴县"
            },
            {
              code: "610922",
              name: "石泉县"
            },
            {
              code: "610923",
              name: "宁陕县"
            },
            {
              code: "610924",
              name: "紫阳县"
            },
            {
              code: "610925",
              name: "岚皋县"
            },
            {
              code: "610926",
              name: "平利县"
            },
            {
              code: "610927",
              name: "镇坪县"
            },
            {
              code: "610929",
              name: "白河县"
            },
            {
              code: "610981",
              name: "旬阳市"
            }
          ]
        },
        {
          code: "6110",
          name: "商洛市",
          children: [
            {
              code: "611002",
              name: "商州区"
            },
            {
              code: "611021",
              name: "洛南县"
            },
            {
              code: "611022",
              name: "丹凤县"
            },
            {
              code: "611023",
              name: "商南县"
            },
            {
              code: "611024",
              name: "山阳县"
            },
            {
              code: "611025",
              name: "镇安县"
            },
            {
              code: "611026",
              name: "柞水县"
            }
          ]
        }
      ]
    },
    {
      code: "62",
      name: "甘肃省",
      children: [
        {
          code: "6201",
          name: "兰州市",
          children: [
            {
              code: "620102",
              name: "城关区"
            },
            {
              code: "620103",
              name: "七里河区"
            },
            {
              code: "620104",
              name: "西固区"
            },
            {
              code: "620105",
              name: "安宁区"
            },
            {
              code: "620111",
              name: "红古区"
            },
            {
              code: "620121",
              name: "永登县"
            },
            {
              code: "620122",
              name: "皋兰县"
            },
            {
              code: "620123",
              name: "榆中县"
            },
            {
              code: "620171",
              name: "兰州新区"
            }
          ]
        },
        {
          code: "6202",
          name: "嘉峪关市",
          children: [
            {
              code: "620201001",
              name: "雄关街道"
            },
            {
              code: "620201002",
              name: "钢城街道"
            },
            {
              code: "620201100",
              name: "新城镇"
            },
            {
              code: "620201101",
              name: "峪泉镇"
            },
            {
              code: "620201102",
              name: "文殊镇"
            }
          ]
        },
        {
          code: "6203",
          name: "金昌市",
          children: [
            {
              code: "620302",
              name: "金川区"
            },
            {
              code: "620321",
              name: "永昌县"
            }
          ]
        },
        {
          code: "6204",
          name: "白银市",
          children: [
            {
              code: "620402",
              name: "白银区"
            },
            {
              code: "620403",
              name: "平川区"
            },
            {
              code: "620421",
              name: "靖远县"
            },
            {
              code: "620422",
              name: "会宁县"
            },
            {
              code: "620423",
              name: "景泰县"
            }
          ]
        },
        {
          code: "6205",
          name: "天水市",
          children: [
            {
              code: "620502",
              name: "秦州区"
            },
            {
              code: "620503",
              name: "麦积区"
            },
            {
              code: "620521",
              name: "清水县"
            },
            {
              code: "620522",
              name: "秦安县"
            },
            {
              code: "620523",
              name: "甘谷县"
            },
            {
              code: "620524",
              name: "武山县"
            },
            {
              code: "620525",
              name: "张家川回族自治县"
            }
          ]
        },
        {
          code: "6206",
          name: "武威市",
          children: [
            {
              code: "620602",
              name: "凉州区"
            },
            {
              code: "620621",
              name: "民勤县"
            },
            {
              code: "620622",
              name: "古浪县"
            },
            {
              code: "620623",
              name: "天祝藏族自治县"
            }
          ]
        },
        {
          code: "6207",
          name: "张掖市",
          children: [
            {
              code: "620702",
              name: "甘州区"
            },
            {
              code: "620721",
              name: "肃南裕固族自治县"
            },
            {
              code: "620722",
              name: "民乐县"
            },
            {
              code: "620723",
              name: "临泽县"
            },
            {
              code: "620724",
              name: "高台县"
            },
            {
              code: "620725",
              name: "山丹县"
            }
          ]
        },
        {
          code: "6208",
          name: "平凉市",
          children: [
            {
              code: "620802",
              name: "崆峒区"
            },
            {
              code: "620821",
              name: "泾川县"
            },
            {
              code: "620822",
              name: "灵台县"
            },
            {
              code: "620823",
              name: "崇信县"
            },
            {
              code: "620825",
              name: "庄浪县"
            },
            {
              code: "620826",
              name: "静宁县"
            },
            {
              code: "620881",
              name: "华亭市"
            }
          ]
        },
        {
          code: "6209",
          name: "酒泉市",
          children: [
            {
              code: "620902",
              name: "肃州区"
            },
            {
              code: "620921",
              name: "金塔县"
            },
            {
              code: "620922",
              name: "瓜州县"
            },
            {
              code: "620923",
              name: "肃北蒙古族自治县"
            },
            {
              code: "620924",
              name: "阿克塞哈萨克族自治县"
            },
            {
              code: "620981",
              name: "玉门市"
            },
            {
              code: "620982",
              name: "敦煌市"
            }
          ]
        },
        {
          code: "6210",
          name: "庆阳市",
          children: [
            {
              code: "621002",
              name: "西峰区"
            },
            {
              code: "621021",
              name: "庆城县"
            },
            {
              code: "621022",
              name: "环县"
            },
            {
              code: "621023",
              name: "华池县"
            },
            {
              code: "621024",
              name: "合水县"
            },
            {
              code: "621025",
              name: "正宁县"
            },
            {
              code: "621026",
              name: "宁县"
            },
            {
              code: "621027",
              name: "镇原县"
            }
          ]
        },
        {
          code: "6211",
          name: "定西市",
          children: [
            {
              code: "621102",
              name: "安定区"
            },
            {
              code: "621121",
              name: "通渭县"
            },
            {
              code: "621122",
              name: "陇西县"
            },
            {
              code: "621123",
              name: "渭源县"
            },
            {
              code: "621124",
              name: "临洮县"
            },
            {
              code: "621125",
              name: "漳县"
            },
            {
              code: "621126",
              name: "岷县"
            }
          ]
        },
        {
          code: "6212",
          name: "陇南市",
          children: [
            {
              code: "621202",
              name: "武都区"
            },
            {
              code: "621221",
              name: "成县"
            },
            {
              code: "621222",
              name: "文县"
            },
            {
              code: "621223",
              name: "宕昌县"
            },
            {
              code: "621224",
              name: "康县"
            },
            {
              code: "621225",
              name: "西和县"
            },
            {
              code: "621226",
              name: "礼县"
            },
            {
              code: "621227",
              name: "徽县"
            },
            {
              code: "621228",
              name: "两当县"
            }
          ]
        },
        {
          code: "6229",
          name: "临夏回族自治州",
          children: [
            {
              code: "622901",
              name: "临夏市"
            },
            {
              code: "622921",
              name: "临夏县"
            },
            {
              code: "622922",
              name: "康乐县"
            },
            {
              code: "622923",
              name: "永靖县"
            },
            {
              code: "622924",
              name: "广河县"
            },
            {
              code: "622925",
              name: "和政县"
            },
            {
              code: "622926",
              name: "东乡族自治县"
            },
            {
              code: "622927",
              name: "积石山保安族东乡族撒拉族自治县"
            }
          ]
        },
        {
          code: "6230",
          name: "甘南藏族自治州",
          children: [
            {
              code: "623001",
              name: "合作市"
            },
            {
              code: "623021",
              name: "临潭县"
            },
            {
              code: "623022",
              name: "卓尼县"
            },
            {
              code: "623023",
              name: "舟曲县"
            },
            {
              code: "623024",
              name: "迭部县"
            },
            {
              code: "623025",
              name: "玛曲县"
            },
            {
              code: "623026",
              name: "碌曲县"
            },
            {
              code: "623027",
              name: "夏河县"
            }
          ]
        }
      ]
    },
    {
      code: "63",
      name: "青海省",
      children: [
        {
          code: "6301",
          name: "西宁市",
          children: [
            {
              code: "630102",
              name: "城东区"
            },
            {
              code: "630103",
              name: "城中区"
            },
            {
              code: "630104",
              name: "城西区"
            },
            {
              code: "630105",
              name: "城北区"
            },
            {
              code: "630106",
              name: "湟中区"
            },
            {
              code: "630121",
              name: "大通回族土族自治县"
            },
            {
              code: "630123",
              name: "湟源县"
            }
          ]
        },
        {
          code: "6302",
          name: "海东市",
          children: [
            {
              code: "630202",
              name: "乐都区"
            },
            {
              code: "630203",
              name: "平安区"
            },
            {
              code: "630222",
              name: "民和回族土族自治县"
            },
            {
              code: "630223",
              name: "互助土族自治县"
            },
            {
              code: "630224",
              name: "化隆回族自治县"
            },
            {
              code: "630225",
              name: "循化撒拉族自治县"
            }
          ]
        },
        {
          code: "6322",
          name: "海北藏族自治州",
          children: [
            {
              code: "632221",
              name: "门源回族自治县"
            },
            {
              code: "632222",
              name: "祁连县"
            },
            {
              code: "632223",
              name: "海晏县"
            },
            {
              code: "632224",
              name: "刚察县"
            }
          ]
        },
        {
          code: "6323",
          name: "黄南藏族自治州",
          children: [
            {
              code: "632301",
              name: "同仁市"
            },
            {
              code: "632322",
              name: "尖扎县"
            },
            {
              code: "632323",
              name: "泽库县"
            },
            {
              code: "632324",
              name: "河南蒙古族自治县"
            }
          ]
        },
        {
          code: "6325",
          name: "海南藏族自治州",
          children: [
            {
              code: "632521",
              name: "共和县"
            },
            {
              code: "632522",
              name: "同德县"
            },
            {
              code: "632523",
              name: "贵德县"
            },
            {
              code: "632524",
              name: "兴海县"
            },
            {
              code: "632525",
              name: "贵南县"
            }
          ]
        },
        {
          code: "6326",
          name: "果洛藏族自治州",
          children: [
            {
              code: "632621",
              name: "玛沁县"
            },
            {
              code: "632622",
              name: "班玛县"
            },
            {
              code: "632623",
              name: "甘德县"
            },
            {
              code: "632624",
              name: "达日县"
            },
            {
              code: "632625",
              name: "久治县"
            },
            {
              code: "632626",
              name: "玛多县"
            }
          ]
        },
        {
          code: "6327",
          name: "玉树藏族自治州",
          children: [
            {
              code: "632701",
              name: "玉树市"
            },
            {
              code: "632722",
              name: "杂多县"
            },
            {
              code: "632723",
              name: "称多县"
            },
            {
              code: "632724",
              name: "治多县"
            },
            {
              code: "632725",
              name: "囊谦县"
            },
            {
              code: "632726",
              name: "曲麻莱县"
            }
          ]
        },
        {
          code: "6328",
          name: "海西蒙古族藏族自治州",
          children: [
            {
              code: "632801",
              name: "格尔木市"
            },
            {
              code: "632802",
              name: "德令哈市"
            },
            {
              code: "632803",
              name: "茫崖市"
            },
            {
              code: "632821",
              name: "乌兰县"
            },
            {
              code: "632822",
              name: "都兰县"
            },
            {
              code: "632823",
              name: "天峻县"
            },
            {
              code: "632857",
              name: "大柴旦行政委员会"
            }
          ]
        }
      ]
    },
    {
      code: "64",
      name: "宁夏回族自治区",
      children: [
        {
          code: "6401",
          name: "银川市",
          children: [
            {
              code: "640104",
              name: "兴庆区"
            },
            {
              code: "640105",
              name: "西夏区"
            },
            {
              code: "640106",
              name: "金凤区"
            },
            {
              code: "640121",
              name: "永宁县"
            },
            {
              code: "640122",
              name: "贺兰县"
            },
            {
              code: "640181",
              name: "灵武市"
            }
          ]
        },
        {
          code: "6402",
          name: "石嘴山市",
          children: [
            {
              code: "640202",
              name: "大武口区"
            },
            {
              code: "640205",
              name: "惠农区"
            },
            {
              code: "640221",
              name: "平罗县"
            }
          ]
        },
        {
          code: "6403",
          name: "吴忠市",
          children: [
            {
              code: "640302",
              name: "利通区"
            },
            {
              code: "640303",
              name: "红寺堡区"
            },
            {
              code: "640323",
              name: "盐池县"
            },
            {
              code: "640324",
              name: "同心县"
            },
            {
              code: "640381",
              name: "青铜峡市"
            }
          ]
        },
        {
          code: "6404",
          name: "固原市",
          children: [
            {
              code: "640402",
              name: "原州区"
            },
            {
              code: "640422",
              name: "西吉县"
            },
            {
              code: "640423",
              name: "隆德县"
            },
            {
              code: "640424",
              name: "泾源县"
            },
            {
              code: "640425",
              name: "彭阳县"
            }
          ]
        },
        {
          code: "6405",
          name: "中卫市",
          children: [
            {
              code: "640502",
              name: "沙坡头区"
            },
            {
              code: "640521",
              name: "中宁县"
            },
            {
              code: "640522",
              name: "海原县"
            }
          ]
        }
      ]
    },
    {
      code: "65",
      name: "新疆维吾尔自治区",
      children: [
        {
          code: "6501",
          name: "乌鲁木齐市",
          children: [
            {
              code: "650102",
              name: "天山区"
            },
            {
              code: "650103",
              name: "沙依巴克区"
            },
            {
              code: "650104",
              name: "新市区"
            },
            {
              code: "650105",
              name: "水磨沟区"
            },
            {
              code: "650106",
              name: "头屯河区"
            },
            {
              code: "650107",
              name: "达坂城区"
            },
            {
              code: "650109",
              name: "米东区"
            },
            {
              code: "650121",
              name: "乌鲁木齐县"
            }
          ]
        },
        {
          code: "6502",
          name: "克拉玛依市",
          children: [
            {
              code: "650202",
              name: "独山子区"
            },
            {
              code: "650203",
              name: "克拉玛依区"
            },
            {
              code: "650204",
              name: "白碱滩区"
            },
            {
              code: "650205",
              name: "乌尔禾区"
            }
          ]
        },
        {
          code: "6504",
          name: "吐鲁番市",
          children: [
            {
              code: "650402",
              name: "高昌区"
            },
            {
              code: "650421",
              name: "鄯善县"
            },
            {
              code: "650422",
              name: "托克逊县"
            }
          ]
        },
        {
          code: "6505",
          name: "哈密市",
          children: [
            {
              code: "650502",
              name: "伊州区"
            },
            {
              code: "650521",
              name: "巴里坤哈萨克自治县"
            },
            {
              code: "650522",
              name: "伊吾县"
            }
          ]
        },
        {
          code: "6523",
          name: "昌吉回族自治州",
          children: [
            {
              code: "652301",
              name: "昌吉市"
            },
            {
              code: "652302",
              name: "阜康市"
            },
            {
              code: "652323",
              name: "呼图壁县"
            },
            {
              code: "652324",
              name: "玛纳斯县"
            },
            {
              code: "652325",
              name: "奇台县"
            },
            {
              code: "652327",
              name: "吉木萨尔县"
            },
            {
              code: "652328",
              name: "木垒哈萨克自治县"
            }
          ]
        },
        {
          code: "6527",
          name: "博尔塔拉蒙古自治州",
          children: [
            {
              code: "652701",
              name: "博乐市"
            },
            {
              code: "652702",
              name: "阿拉山口市"
            },
            {
              code: "652722",
              name: "精河县"
            },
            {
              code: "652723",
              name: "温泉县"
            }
          ]
        },
        {
          code: "6528",
          name: "巴音郭楞蒙古自治州",
          children: [
            {
              code: "652801",
              name: "库尔勒市"
            },
            {
              code: "652822",
              name: "轮台县"
            },
            {
              code: "652823",
              name: "尉犁县"
            },
            {
              code: "652824",
              name: "若羌县"
            },
            {
              code: "652825",
              name: "且末县"
            },
            {
              code: "652826",
              name: "焉耆回族自治县"
            },
            {
              code: "652827",
              name: "和静县"
            },
            {
              code: "652828",
              name: "和硕县"
            },
            {
              code: "652829",
              name: "博湖县"
            }
          ]
        },
        {
          code: "6529",
          name: "阿克苏地区",
          children: [
            {
              code: "652901",
              name: "阿克苏市"
            },
            {
              code: "652902",
              name: "库车市"
            },
            {
              code: "652922",
              name: "温宿县"
            },
            {
              code: "652924",
              name: "沙雅县"
            },
            {
              code: "652925",
              name: "新和县"
            },
            {
              code: "652926",
              name: "拜城县"
            },
            {
              code: "652927",
              name: "乌什县"
            },
            {
              code: "652928",
              name: "阿瓦提县"
            },
            {
              code: "652929",
              name: "柯坪县"
            }
          ]
        },
        {
          code: "6530",
          name: "克孜勒苏柯尔克孜自治州",
          children: [
            {
              code: "653001",
              name: "阿图什市"
            },
            {
              code: "653022",
              name: "阿克陶县"
            },
            {
              code: "653023",
              name: "阿合奇县"
            },
            {
              code: "653024",
              name: "乌恰县"
            }
          ]
        },
        {
          code: "6531",
          name: "喀什地区",
          children: [
            {
              code: "653101",
              name: "喀什市"
            },
            {
              code: "653121",
              name: "疏附县"
            },
            {
              code: "653122",
              name: "疏勒县"
            },
            {
              code: "653123",
              name: "英吉沙县"
            },
            {
              code: "653124",
              name: "泽普县"
            },
            {
              code: "653125",
              name: "莎车县"
            },
            {
              code: "653126",
              name: "叶城县"
            },
            {
              code: "653127",
              name: "麦盖提县"
            },
            {
              code: "653128",
              name: "岳普湖县"
            },
            {
              code: "653129",
              name: "伽师县"
            },
            {
              code: "653130",
              name: "巴楚县"
            },
            {
              code: "653131",
              name: "塔什库尔干塔吉克自治县"
            }
          ]
        },
        {
          code: "6532",
          name: "和田地区",
          children: [
            {
              code: "653201",
              name: "和田市"
            },
            {
              code: "653221",
              name: "和田县"
            },
            {
              code: "653222",
              name: "墨玉县"
            },
            {
              code: "653223",
              name: "皮山县"
            },
            {
              code: "653224",
              name: "洛浦县"
            },
            {
              code: "653225",
              name: "策勒县"
            },
            {
              code: "653226",
              name: "于田县"
            },
            {
              code: "653227",
              name: "民丰县"
            }
          ]
        },
        {
          code: "6540",
          name: "伊犁哈萨克自治州",
          children: [
            {
              code: "654002",
              name: "伊宁市"
            },
            {
              code: "654003",
              name: "奎屯市"
            },
            {
              code: "654004",
              name: "霍尔果斯市"
            },
            {
              code: "654021",
              name: "伊宁县"
            },
            {
              code: "654022",
              name: "察布查尔锡伯自治县"
            },
            {
              code: "654023",
              name: "霍城县"
            },
            {
              code: "654024",
              name: "巩留县"
            },
            {
              code: "654025",
              name: "新源县"
            },
            {
              code: "654026",
              name: "昭苏县"
            },
            {
              code: "654027",
              name: "特克斯县"
            },
            {
              code: "654028",
              name: "尼勒克县"
            }
          ]
        },
        {
          code: "6542",
          name: "塔城地区",
          children: [
            {
              code: "654201",
              name: "塔城市"
            },
            {
              code: "654202",
              name: "乌苏市"
            },
            {
              code: "654203",
              name: "沙湾市"
            },
            {
              code: "654221",
              name: "额敏县"
            },
            {
              code: "654224",
              name: "托里县"
            },
            {
              code: "654225",
              name: "裕民县"
            },
            {
              code: "654226",
              name: "和布克赛尔蒙古自治县"
            }
          ]
        },
        {
          code: "6543",
          name: "阿勒泰地区",
          children: [
            {
              code: "654301",
              name: "阿勒泰市"
            },
            {
              code: "654321",
              name: "布尔津县"
            },
            {
              code: "654322",
              name: "富蕴县"
            },
            {
              code: "654323",
              name: "福海县"
            },
            {
              code: "654324",
              name: "哈巴河县"
            },
            {
              code: "654325",
              name: "青河县"
            },
            {
              code: "654326",
              name: "吉木乃县"
            }
          ]
        },
        {
          code: "6590",
          name: "自治区直辖县级行政区划",
          children: [
            {
              code: "659001",
              name: "石河子市"
            },
            {
              code: "659002",
              name: "阿拉尔市"
            },
            {
              code: "659003",
              name: "图木舒克市"
            },
            {
              code: "659004",
              name: "五家渠市"
            },
            {
              code: "659005",
              name: "北屯市"
            },
            {
              code: "659006",
              name: "铁门关市"
            },
            {
              code: "659007",
              name: "双河市"
            },
            {
              code: "659008",
              name: "可克达拉市"
            },
            {
              code: "659009",
              name: "昆玉市"
            },
            {
              code: "659010",
              name: "胡杨河市"
            },
            {
              code: "659011",
              name: "新星市"
            },
            {
              code: "659012",
              name: "白杨市"
            }
          ]
        }
      ]
    }
  ], h = {
    北京市: [
      "东城区",
      "西城区",
      "朝阳区",
      "丰台区",
      "石景山区",
      "海淀区",
      "门头沟区",
      "房山区",
      "通州区",
      "顺义区",
      "昌平区",
      "大兴区",
      "怀柔区",
      "平谷区",
      "密云区",
      "延庆区"
    ],
    天津市: [
      "和平区",
      "河东区",
      "河西区",
      "南开区",
      "河北区",
      "红桥区",
      "东丽区",
      "西青区",
      "津南区",
      "北辰区",
      "武清区",
      "宝坻区",
      "滨海新区",
      "宁河区",
      "静海区",
      "蓟州区"
    ],
    河北省: [
      "石家庄市",
      "唐山市",
      "秦皇岛市",
      "邯郸市",
      "邢台市",
      "保定市",
      "张家口市",
      "承德市",
      "沧州市",
      "廊坊市",
      "衡水市"
    ],
    山西省: [
      "太原市",
      "大同市",
      "阳泉市",
      "长治市",
      "晋城市",
      "朔州市",
      "晋中市",
      "运城市",
      "忻州市",
      "临汾市",
      "吕梁市"
    ],
    内蒙古自治区: [
      "呼和浩特市",
      "包头市",
      "乌海市",
      "赤峰市",
      "通辽市",
      "鄂尔多斯市",
      "呼伦贝尔市",
      "巴彦淖尔市",
      "乌兰察布市",
      "兴安盟",
      "锡林郭勒盟",
      "阿拉善盟"
    ],
    辽宁省: [
      "沈阳市",
      "大连市",
      "鞍山市",
      "抚顺市",
      "本溪市",
      "丹东市",
      "锦州市",
      "营口市",
      "阜新市",
      "辽阳市",
      "盘锦市",
      "铁岭市",
      "朝阳市",
      "葫芦岛市"
    ],
    吉林省: [
      "长春市",
      "吉林市",
      "四平市",
      "辽源市",
      "通化市",
      "白山市",
      "松原市",
      "白城市",
      "延边朝鲜族自治州"
    ],
    黑龙江省: [
      "哈尔滨市",
      "齐齐哈尔市",
      "鸡西市",
      "鹤岗市",
      "双鸭山市",
      "大庆市",
      "伊春市",
      "佳木斯市",
      "七台河市",
      "牡丹江市",
      "黑河市",
      "绥化市",
      "大兴安岭地区"
    ],
    上海市: [
      "黄浦区",
      "徐汇区",
      "长宁区",
      "静安区",
      "普陀区",
      "虹口区",
      "杨浦区",
      "闵行区",
      "宝山区",
      "嘉定区",
      "浦东新区",
      "金山区",
      "松江区",
      "青浦区",
      "奉贤区",
      "崇明区"
    ],
    江苏省: [
      "南京市",
      "无锡市",
      "徐州市",
      "常州市",
      "苏州市",
      "南通市",
      "连云港市",
      "淮安市",
      "盐城市",
      "扬州市",
      "镇江市",
      "泰州市",
      "宿迁市"
    ],
    浙江省: [
      "杭州市",
      "宁波市",
      "温州市",
      "嘉兴市",
      "湖州市",
      "绍兴市",
      "金华市",
      "衢州市",
      "舟山市",
      "台州市",
      "丽水市"
    ],
    安徽省: [
      "合肥市",
      "芜湖市",
      "蚌埠市",
      "淮南市",
      "马鞍山市",
      "淮北市",
      "铜陵市",
      "安庆市",
      "黄山市",
      "滁州市",
      "阜阳市",
      "宿州市",
      "六安市",
      "亳州市",
      "池州市",
      "宣城市"
    ],
    福建省: [
      "福州市",
      "厦门市",
      "莆田市",
      "三明市",
      "泉州市",
      "漳州市",
      "南平市",
      "龙岩市",
      "宁德市"
    ],
    江西省: [
      "南昌市",
      "景德镇市",
      "萍乡市",
      "九江市",
      "新余市",
      "鹰潭市",
      "赣州市",
      "吉安市",
      "宜春市",
      "抚州市",
      "上饶市"
    ],
    山东省: [
      "济南市",
      "青岛市",
      "淄博市",
      "枣庄市",
      "东营市",
      "烟台市",
      "潍坊市",
      "济宁市",
      "泰安市",
      "威海市",
      "日照市",
      "临沂市",
      "德州市",
      "聊城市",
      "滨州市",
      "菏泽市"
    ],
    河南省: [
      "郑州市",
      "开封市",
      "洛阳市",
      "平顶山市",
      "安阳市",
      "鹤壁市",
      "新乡市",
      "焦作市",
      "濮阳市",
      "许昌市",
      "漯河市",
      "三门峡市",
      "南阳市",
      "商丘市",
      "信阳市",
      "周口市",
      "驻马店市",
      "济源市"
    ],
    湖北省: [
      "武汉市",
      "黄石市",
      "十堰市",
      "宜昌市",
      "襄阳市",
      "鄂州市",
      "荆门市",
      "孝感市",
      "荆州市",
      "黄冈市",
      "咸宁市",
      "随州市",
      "恩施土家族苗族自治州",
      "仙桃市",
      "潜江市",
      "天门市",
      "神农架林区"
    ],
    湖南省: [
      "长沙市",
      "株洲市",
      "湘潭市",
      "衡阳市",
      "邵阳市",
      "岳阳市",
      "常德市",
      "张家界市",
      "益阳市",
      "郴州市",
      "永州市",
      "怀化市",
      "娄底市",
      "湘西土家族苗族自治州"
    ],
    广东省: [
      "广州市",
      "韶关市",
      "深圳市",
      "珠海市",
      "汕头市",
      "佛山市",
      "江门市",
      "湛江市",
      "茂名市",
      "肇庆市",
      "惠州市",
      "梅州市",
      "汕尾市",
      "河源市",
      "阳江市",
      "清远市",
      "东莞市",
      "中山市",
      "潮州市",
      "揭阳市",
      "云浮市"
    ],
    广西壮族自治区: [
      "南宁市",
      "柳州市",
      "桂林市",
      "梧州市",
      "北海市",
      "防城港市",
      "钦州市",
      "贵港市",
      "玉林市",
      "百色市",
      "贺州市",
      "河池市",
      "来宾市",
      "崇左市"
    ],
    海南省: [
      "海口市",
      "三亚市",
      "三沙市",
      "儋州市",
      "五指山市",
      "琼海市",
      "文昌市",
      "万宁市",
      "东方市",
      "定安县",
      "屯昌县",
      "澄迈县",
      "临高县",
      "白沙黎族自治县",
      "昌江黎族自治县",
      "乐东黎族自治县",
      "陵水黎族自治县",
      "保亭黎族苗族自治县",
      "琼中黎族苗族自治县"
    ],
    重庆市: [
      "万州区",
      "涪陵区",
      "渝中区",
      "大渡口区",
      "江北区",
      "沙坪坝区",
      "九龙坡区",
      "南岸区",
      "北碚区",
      "綦江区",
      "大足区",
      "渝北区",
      "巴南区",
      "黔江区",
      "长寿区",
      "江津区",
      "合川区",
      "永川区",
      "南川区",
      "璧山区",
      "铜梁区",
      "潼南区",
      "荣昌区",
      "开州区",
      "梁平区",
      "武隆区",
      "城口县",
      "丰都县",
      "垫江县",
      "忠县",
      "云阳县",
      "奉节县",
      "巫山县",
      "巫溪县",
      "石柱土家族自治县",
      "秀山土家族苗族自治县",
      "酉阳土家族苗族自治县",
      "彭水苗族土家族自治县"
    ],
    四川省: [
      "成都市",
      "自贡市",
      "攀枝花市",
      "泸州市",
      "德阳市",
      "绵阳市",
      "广元市",
      "遂宁市",
      "内江市",
      "乐山市",
      "南充市",
      "眉山市",
      "宜宾市",
      "广安市",
      "达州市",
      "雅安市",
      "巴中市",
      "资阳市",
      "阿坝藏族羌族自治州",
      "甘孜藏族自治州",
      "凉山彝族自治州"
    ],
    贵州省: [
      "贵阳市",
      "六盘水市",
      "遵义市",
      "安顺市",
      "毕节市",
      "铜仁市",
      "黔西南布依族苗族自治州",
      "黔东南苗族侗族自治州",
      "黔南布依族苗族自治州"
    ],
    云南省: [
      "昆明市",
      "曲靖市",
      "玉溪市",
      "保山市",
      "昭通市",
      "丽江市",
      "普洱市",
      "临沧市",
      "楚雄彝族自治州",
      "红河哈尼族彝族自治州",
      "文山壮族苗族自治州",
      "西双版纳傣族自治州",
      "大理白族自治州",
      "德宏傣族景颇族自治州",
      "怒江傈僳族自治州",
      "迪庆藏族自治州"
    ],
    西藏自治区: [
      "拉萨市",
      "日喀则市",
      "昌都市",
      "林芝市",
      "山南市",
      "那曲市",
      "阿里地区"
    ],
    陕西省: [
      "西安市",
      "铜川市",
      "宝鸡市",
      "咸阳市",
      "渭南市",
      "延安市",
      "汉中市",
      "榆林市",
      "安康市",
      "商洛市"
    ],
    甘肃省: [
      "兰州市",
      "嘉峪关市",
      "金昌市",
      "白银市",
      "天水市",
      "武威市",
      "张掖市",
      "平凉市",
      "酒泉市",
      "庆阳市",
      "定西市",
      "陇南市",
      "临夏回族自治州",
      "甘南藏族自治州"
    ],
    青海省: [
      "西宁市",
      "海东市",
      "海北藏族自治州",
      "黄南藏族自治州",
      "海南藏族自治州",
      "果洛藏族自治州",
      "玉树藏族自治州",
      "海西蒙古族藏族自治州"
    ],
    宁夏回族自治区: [
      "银川市",
      "石嘴山市",
      "吴忠市",
      "固原市",
      "中卫市"
    ],
    新疆维吾尔自治区: [
      "乌鲁木齐市",
      "克拉玛依市",
      "吐鲁番市",
      "哈密市",
      "昌吉回族自治州",
      "博尔塔拉蒙古自治州",
      "巴音郭楞蒙古自治州",
      "阿克苏地区",
      "克孜勒苏柯尔克孜自治州",
      "喀什地区",
      "和田地区",
      "伊犁哈萨克自治州",
      "塔城地区",
      "阿勒泰地区",
      "石河子市",
      "阿拉尔市",
      "图木舒克市",
      "五家渠市",
      "北屯市",
      "铁门关市",
      "双河市",
      "可克达拉市",
      "昆玉市",
      "胡杨河市",
      "新星市",
      "白杨市"
    ]
  }, i = {
    北京市: {
      市辖区: [
        "东城区",
        "西城区",
        "朝阳区",
        "丰台区",
        "石景山区",
        "海淀区",
        "门头沟区",
        "房山区",
        "通州区",
        "顺义区",
        "昌平区",
        "大兴区",
        "怀柔区",
        "平谷区",
        "密云区",
        "延庆区"
      ]
    },
    天津市: {
      市辖区: [
        "和平区",
        "河东区",
        "河西区",
        "南开区",
        "河北区",
        "红桥区",
        "东丽区",
        "西青区",
        "津南区",
        "北辰区",
        "武清区",
        "宝坻区",
        "滨海新区",
        "宁河区",
        "静海区",
        "蓟州区"
      ]
    },
    河北省: {
      石家庄市: [
        "长安区",
        "桥西区",
        "新华区",
        "井陉矿区",
        "裕华区",
        "藁城区",
        "鹿泉区",
        "栾城区",
        "井陉县",
        "正定县",
        "行唐县",
        "灵寿县",
        "高邑县",
        "深泽县",
        "赞皇县",
        "无极县",
        "平山县",
        "元氏县",
        "赵县",
        "石家庄高新技术产业开发区",
        "石家庄循环化工园区",
        "辛集市",
        "晋州市",
        "新乐市"
      ],
      唐山市: [
        "路南区",
        "路北区",
        "古冶区",
        "开平区",
        "丰南区",
        "丰润区",
        "曹妃甸区",
        "滦南县",
        "乐亭县",
        "迁西县",
        "玉田县",
        "河北唐山芦台经济开发区",
        "唐山市汉沽管理区",
        "唐山高新技术产业开发区",
        "河北唐山海港经济开发区",
        "遵化市",
        "迁安市",
        "滦州市"
      ],
      秦皇岛市: [
        "海港区",
        "山海关区",
        "北戴河区",
        "抚宁区",
        "青龙满族自治县",
        "昌黎县",
        "卢龙县",
        "秦皇岛市经济技术开发区",
        "北戴河新区"
      ],
      邯郸市: [
        "邯山区",
        "丛台区",
        "复兴区",
        "峰峰矿区",
        "肥乡区",
        "永年区",
        "临漳县",
        "成安县",
        "大名县",
        "涉县",
        "磁县",
        "邱县",
        "鸡泽县",
        "广平县",
        "馆陶县",
        "魏县",
        "曲周县",
        "邯郸经济技术开发区",
        "邯郸冀南新区",
        "武安市"
      ],
      邢台市: [
        "襄都区",
        "信都区",
        "任泽区",
        "南和区",
        "临城县",
        "内丘县",
        "柏乡县",
        "隆尧县",
        "宁晋县",
        "巨鹿县",
        "新河县",
        "广宗县",
        "平乡县",
        "威县",
        "清河县",
        "临西县",
        "河北邢台经济开发区",
        "南宫市",
        "沙河市"
      ],
      保定市: [
        "竞秀区",
        "莲池区",
        "满城区",
        "清苑区",
        "徐水区",
        "涞水县",
        "阜平县",
        "定兴县",
        "唐县",
        "高阳县",
        "容城县",
        "涞源县",
        "望都县",
        "安新县",
        "易县",
        "曲阳县",
        "蠡县",
        "顺平县",
        "博野县",
        "雄县",
        "保定高新技术产业开发区",
        "保定白沟新城",
        "涿州市",
        "定州市",
        "安国市",
        "高碑店市"
      ],
      张家口市: [
        "桥东区",
        "桥西区",
        "宣化区",
        "下花园区",
        "万全区",
        "崇礼区",
        "张北县",
        "康保县",
        "沽源县",
        "尚义县",
        "蔚县",
        "阳原县",
        "怀安县",
        "怀来县",
        "涿鹿县",
        "赤城县",
        "张家口经济开发区",
        "张家口市察北管理区",
        "张家口市塞北管理区"
      ],
      承德市: [
        "双桥区",
        "双滦区",
        "鹰手营子矿区",
        "承德县",
        "兴隆县",
        "滦平县",
        "隆化县",
        "丰宁满族自治县",
        "宽城满族自治县",
        "围场满族蒙古族自治县",
        "承德高新技术产业开发区",
        "平泉市"
      ],
      沧州市: [
        "新华区",
        "运河区",
        "沧县",
        "青县",
        "东光县",
        "海兴县",
        "盐山县",
        "肃宁县",
        "南皮县",
        "吴桥县",
        "献县",
        "孟村回族自治县",
        "河北沧州经济开发区",
        "沧州高新技术产业开发区",
        "沧州渤海新区",
        "泊头市",
        "任丘市",
        "黄骅市",
        "河间市"
      ],
      廊坊市: [
        "安次区",
        "广阳区",
        "固安县",
        "永清县",
        "香河县",
        "大城县",
        "文安县",
        "大厂回族自治县",
        "廊坊经济技术开发区",
        "霸州市",
        "三河市"
      ],
      衡水市: [
        "桃城区",
        "冀州区",
        "枣强县",
        "武邑县",
        "武强县",
        "饶阳县",
        "安平县",
        "故城县",
        "景县",
        "阜城县",
        "河北衡水高新技术产业开发区",
        "衡水滨湖新区",
        "深州市"
      ]
    },
    山西省: {
      太原市: [
        "小店区",
        "迎泽区",
        "杏花岭区",
        "尖草坪区",
        "万柏林区",
        "晋源区",
        "清徐县",
        "阳曲县",
        "娄烦县",
        "山西转型综合改革示范区",
        "古交市"
      ],
      大同市: [
        "新荣区",
        "平城区",
        "云冈区",
        "云州区",
        "阳高县",
        "天镇县",
        "广灵县",
        "灵丘县",
        "浑源县",
        "左云县",
        "山西大同经济开发区"
      ],
      阳泉市: [
        "城区",
        "矿区",
        "郊区",
        "平定县",
        "盂县"
      ],
      长治市: [
        "潞州区",
        "上党区",
        "屯留区",
        "潞城区",
        "襄垣县",
        "平顺县",
        "黎城县",
        "壶关县",
        "长子县",
        "武乡县",
        "沁县",
        "沁源县"
      ],
      晋城市: [
        "城区",
        "沁水县",
        "阳城县",
        "陵川县",
        "泽州县",
        "高平市"
      ],
      朔州市: [
        "朔城区",
        "平鲁区",
        "山阴县",
        "应县",
        "右玉县",
        "山西朔州经济开发区",
        "怀仁市"
      ],
      晋中市: [
        "榆次区",
        "太谷区",
        "榆社县",
        "左权县",
        "和顺县",
        "昔阳县",
        "寿阳县",
        "祁县",
        "平遥县",
        "灵石县",
        "介休市"
      ],
      运城市: [
        "盐湖区",
        "临猗县",
        "万荣县",
        "闻喜县",
        "稷山县",
        "新绛县",
        "绛县",
        "垣曲县",
        "夏县",
        "平陆县",
        "芮城县",
        "永济市",
        "河津市"
      ],
      忻州市: [
        "忻府区",
        "定襄县",
        "五台县",
        "代县",
        "繁峙县",
        "宁武县",
        "静乐县",
        "神池县",
        "五寨县",
        "岢岚县",
        "河曲县",
        "保德县",
        "偏关县",
        "五台山风景名胜区",
        "原平市"
      ],
      临汾市: [
        "尧都区",
        "曲沃县",
        "翼城县",
        "襄汾县",
        "洪洞县",
        "古县",
        "安泽县",
        "浮山县",
        "吉县",
        "乡宁县",
        "大宁县",
        "隰县",
        "永和县",
        "蒲县",
        "汾西县",
        "侯马市",
        "霍州市"
      ],
      吕梁市: [
        "离石区",
        "文水县",
        "交城县",
        "兴县",
        "临县",
        "柳林县",
        "石楼县",
        "岚县",
        "方山县",
        "中阳县",
        "交口县",
        "孝义市",
        "汾阳市"
      ]
    },
    内蒙古自治区: {
      呼和浩特市: [
        "新城区",
        "回民区",
        "玉泉区",
        "赛罕区",
        "土默特左旗",
        "托克托县",
        "和林格尔县",
        "清水河县",
        "武川县",
        "呼和浩特经济技术开发区"
      ],
      包头市: [
        "东河区",
        "昆都仑区",
        "青山区",
        "石拐区",
        "白云鄂博矿区",
        "九原区",
        "土默特右旗",
        "固阳县",
        "达尔罕茂明安联合旗",
        "包头稀土高新技术产业开发区"
      ],
      乌海市: [
        "海勃湾区",
        "海南区",
        "乌达区"
      ],
      赤峰市: [
        "红山区",
        "元宝山区",
        "松山区",
        "阿鲁科尔沁旗",
        "巴林左旗",
        "巴林右旗",
        "林西县",
        "克什克腾旗",
        "翁牛特旗",
        "喀喇沁旗",
        "宁城县",
        "敖汉旗"
      ],
      通辽市: [
        "科尔沁区",
        "科尔沁左翼中旗",
        "科尔沁左翼后旗",
        "开鲁县",
        "库伦旗",
        "奈曼旗",
        "扎鲁特旗",
        "通辽经济技术开发区",
        "霍林郭勒市"
      ],
      鄂尔多斯市: [
        "东胜区",
        "康巴什区",
        "达拉特旗",
        "准格尔旗",
        "鄂托克前旗",
        "鄂托克旗",
        "杭锦旗",
        "乌审旗",
        "伊金霍洛旗"
      ],
      呼伦贝尔市: [
        "海拉尔区",
        "扎赉诺尔区",
        "阿荣旗",
        "莫力达瓦达斡尔族自治旗",
        "鄂伦春自治旗",
        "鄂温克族自治旗",
        "陈巴尔虎旗",
        "新巴尔虎左旗",
        "新巴尔虎右旗",
        "满洲里市",
        "牙克石市",
        "扎兰屯市",
        "额尔古纳市",
        "根河市"
      ],
      巴彦淖尔市: [
        "临河区",
        "五原县",
        "磴口县",
        "乌拉特前旗",
        "乌拉特中旗",
        "乌拉特后旗",
        "杭锦后旗"
      ],
      乌兰察布市: [
        "集宁区",
        "卓资县",
        "化德县",
        "商都县",
        "兴和县",
        "凉城县",
        "察哈尔右翼前旗",
        "察哈尔右翼中旗",
        "察哈尔右翼后旗",
        "四子王旗",
        "丰镇市"
      ],
      兴安盟: [
        "乌兰浩特市",
        "阿尔山市",
        "科尔沁右翼前旗",
        "科尔沁右翼中旗",
        "扎赉特旗",
        "突泉县"
      ],
      锡林郭勒盟: [
        "二连浩特市",
        "锡林浩特市",
        "阿巴嘎旗",
        "苏尼特左旗",
        "苏尼特右旗",
        "东乌珠穆沁旗",
        "西乌珠穆沁旗",
        "太仆寺旗",
        "镶黄旗",
        "正镶白旗",
        "正蓝旗",
        "多伦县",
        "乌拉盖管理区管委会"
      ],
      阿拉善盟: [
        "阿拉善左旗",
        "阿拉善右旗",
        "额济纳旗",
        "内蒙古阿拉善高新技术产业开发区"
      ]
    },
    辽宁省: {
      沈阳市: [
        "和平区",
        "沈河区",
        "大东区",
        "皇姑区",
        "铁西区",
        "苏家屯区",
        "浑南区",
        "沈北新区",
        "于洪区",
        "辽中区",
        "康平县",
        "法库县",
        "新民市"
      ],
      大连市: [
        "中山区",
        "西岗区",
        "沙河口区",
        "甘井子区",
        "旅顺口区",
        "金州区",
        "普兰店区",
        "长海县",
        "瓦房店市",
        "庄河市"
      ],
      鞍山市: [
        "铁东区",
        "铁西区",
        "立山区",
        "千山区",
        "台安县",
        "岫岩满族自治县",
        "海城市"
      ],
      抚顺市: [
        "新抚区",
        "东洲区",
        "望花区",
        "顺城区",
        "抚顺县",
        "新宾满族自治县",
        "清原满族自治县"
      ],
      本溪市: [
        "平山区",
        "溪湖区",
        "明山区",
        "南芬区",
        "本溪满族自治县",
        "桓仁满族自治县"
      ],
      丹东市: [
        "元宝区",
        "振兴区",
        "振安区",
        "宽甸满族自治县",
        "东港市",
        "凤城市"
      ],
      锦州市: [
        "古塔区",
        "凌河区",
        "太和区",
        "黑山县",
        "义县",
        "凌海市",
        "北镇市"
      ],
      营口市: [
        "站前区",
        "西市区",
        "鲅鱼圈区",
        "老边区",
        "盖州市",
        "大石桥市"
      ],
      阜新市: [
        "海州区",
        "新邱区",
        "太平区",
        "清河门区",
        "细河区",
        "阜新蒙古族自治县",
        "彰武县"
      ],
      辽阳市: [
        "白塔区",
        "文圣区",
        "宏伟区",
        "弓长岭区",
        "太子河区",
        "辽阳县",
        "灯塔市"
      ],
      盘锦市: [
        "双台子区",
        "兴隆台区",
        "大洼区",
        "盘山县"
      ],
      铁岭市: [
        "银州区",
        "清河区",
        "铁岭县",
        "西丰县",
        "昌图县",
        "调兵山市",
        "开原市"
      ],
      朝阳市: [
        "双塔区",
        "龙城区",
        "朝阳县",
        "建平县",
        "喀喇沁左翼蒙古族自治县",
        "北票市",
        "凌源市"
      ],
      葫芦岛市: [
        "连山区",
        "龙港区",
        "南票区",
        "绥中县",
        "建昌县",
        "兴城市"
      ]
    },
    吉林省: {
      长春市: [
        "南关区",
        "宽城区",
        "朝阳区",
        "二道区",
        "绿园区",
        "双阳区",
        "九台区",
        "农安县",
        "长春经济技术开发区",
        "长春净月高新技术产业开发区",
        "长春高新技术产业开发区",
        "长春汽车经济技术开发区",
        "榆树市",
        "德惠市",
        "公主岭市"
      ],
      吉林市: [
        "昌邑区",
        "龙潭区",
        "船营区",
        "丰满区",
        "永吉县",
        "吉林经济开发区",
        "吉林高新技术产业开发区",
        "吉林中国新加坡食品区",
        "蛟河市",
        "桦甸市",
        "舒兰市",
        "磐石市"
      ],
      四平市: [
        "铁西区",
        "铁东区",
        "梨树县",
        "伊通满族自治县",
        "双辽市"
      ],
      辽源市: [
        "龙山区",
        "西安区",
        "东丰县",
        "东辽县"
      ],
      通化市: [
        "东昌区",
        "二道江区",
        "通化县",
        "辉南县",
        "柳河县",
        "梅河口市",
        "集安市"
      ],
      白山市: [
        "浑江区",
        "江源区",
        "抚松县",
        "靖宇县",
        "长白朝鲜族自治县",
        "临江市"
      ],
      松原市: [
        "宁江区",
        "前郭尔罗斯蒙古族自治县",
        "长岭县",
        "乾安县",
        "吉林松原经济开发区",
        "扶余市"
      ],
      白城市: [
        "洮北区",
        "镇赉县",
        "通榆县",
        "吉林白城经济开发区",
        "洮南市",
        "大安市"
      ],
      延边朝鲜族自治州: [
        "延吉市",
        "图们市",
        "敦化市",
        "珲春市",
        "龙井市",
        "和龙市",
        "汪清县",
        "安图县"
      ]
    },
    黑龙江省: {
      哈尔滨市: [
        "道里区",
        "南岗区",
        "道外区",
        "平房区",
        "松北区",
        "香坊区",
        "呼兰区",
        "阿城区",
        "双城区",
        "依兰县",
        "方正县",
        "宾县",
        "巴彦县",
        "木兰县",
        "通河县",
        "延寿县",
        "尚志市",
        "五常市"
      ],
      齐齐哈尔市: [
        "龙沙区",
        "建华区",
        "铁锋区",
        "昂昂溪区",
        "富拉尔基区",
        "碾子山区",
        "梅里斯达斡尔族区",
        "龙江县",
        "依安县",
        "泰来县",
        "甘南县",
        "富裕县",
        "克山县",
        "克东县",
        "拜泉县",
        "讷河市"
      ],
      鸡西市: [
        "鸡冠区",
        "恒山区",
        "滴道区",
        "梨树区",
        "城子河区",
        "麻山区",
        "鸡东县",
        "虎林市",
        "密山市"
      ],
      鹤岗市: [
        "向阳区",
        "工农区",
        "南山区",
        "兴安区",
        "东山区",
        "兴山区",
        "萝北县",
        "绥滨县"
      ],
      双鸭山市: [
        "尖山区",
        "岭东区",
        "四方台区",
        "宝山区",
        "集贤县",
        "友谊县",
        "宝清县",
        "饶河县"
      ],
      大庆市: [
        "萨尔图区",
        "龙凤区",
        "让胡路区",
        "红岗区",
        "大同区",
        "肇州县",
        "肇源县",
        "林甸县",
        "杜尔伯特蒙古族自治县",
        "大庆高新技术产业开发区"
      ],
      伊春市: [
        "伊美区",
        "乌翠区",
        "友好区",
        "嘉荫县",
        "汤旺县",
        "丰林县",
        "大箐山县",
        "南岔县",
        "金林区",
        "铁力市"
      ],
      佳木斯市: [
        "向阳区",
        "前进区",
        "东风区",
        "郊区",
        "桦南县",
        "桦川县",
        "汤原县",
        "同江市",
        "富锦市",
        "抚远市"
      ],
      七台河市: [
        "新兴区",
        "桃山区",
        "茄子河区",
        "勃利县"
      ],
      牡丹江市: [
        "东安区",
        "阳明区",
        "爱民区",
        "西安区",
        "林口县",
        "绥芬河市",
        "海林市",
        "宁安市",
        "穆棱市",
        "东宁市"
      ],
      黑河市: [
        "爱辉区",
        "逊克县",
        "孙吴县",
        "北安市",
        "五大连池市",
        "嫩江市"
      ],
      绥化市: [
        "北林区",
        "望奎县",
        "兰西县",
        "青冈县",
        "庆安县",
        "明水县",
        "绥棱县",
        "安达市",
        "肇东市",
        "海伦市"
      ],
      大兴安岭地区: [
        "漠河市",
        "呼玛县",
        "塔河县",
        "加格达奇区",
        "松岭区",
        "新林区",
        "呼中区"
      ]
    },
    上海市: {
      市辖区: [
        "黄浦区",
        "徐汇区",
        "长宁区",
        "静安区",
        "普陀区",
        "虹口区",
        "杨浦区",
        "闵行区",
        "宝山区",
        "嘉定区",
        "浦东新区",
        "金山区",
        "松江区",
        "青浦区",
        "奉贤区",
        "崇明区"
      ]
    },
    江苏省: {
      南京市: [
        "玄武区",
        "秦淮区",
        "建邺区",
        "鼓楼区",
        "浦口区",
        "栖霞区",
        "雨花台区",
        "江宁区",
        "六合区",
        "溧水区",
        "高淳区"
      ],
      无锡市: [
        "锡山区",
        "惠山区",
        "滨湖区",
        "梁溪区",
        "新吴区",
        "江阴市",
        "宜兴市"
      ],
      徐州市: [
        "鼓楼区",
        "云龙区",
        "贾汪区",
        "泉山区",
        "铜山区",
        "丰县",
        "沛县",
        "睢宁县",
        "徐州经济技术开发区",
        "新沂市",
        "邳州市"
      ],
      常州市: [
        "天宁区",
        "钟楼区",
        "新北区",
        "武进区",
        "金坛区",
        "溧阳市"
      ],
      苏州市: [
        "虎丘区",
        "吴中区",
        "相城区",
        "姑苏区",
        "吴江区",
        "苏州工业园区",
        "常熟市",
        "张家港市",
        "昆山市",
        "太仓市"
      ],
      南通市: [
        "通州区",
        "崇川区",
        "海门区",
        "如东县",
        "南通经济技术开发区",
        "启东市",
        "如皋市",
        "海安市"
      ],
      连云港市: [
        "连云区",
        "海州区",
        "赣榆区",
        "东海县",
        "灌云县",
        "灌南县",
        "连云港经济技术开发区"
      ],
      淮安市: [
        "淮安区",
        "淮阴区",
        "清江浦区",
        "洪泽区",
        "涟水县",
        "盱眙县",
        "金湖县",
        "淮安经济技术开发区"
      ],
      盐城市: [
        "亭湖区",
        "盐都区",
        "大丰区",
        "响水县",
        "滨海县",
        "阜宁县",
        "射阳县",
        "建湖县",
        "盐城经济技术开发区",
        "东台市"
      ],
      扬州市: [
        "广陵区",
        "邗江区",
        "江都区",
        "宝应县",
        "扬州经济技术开发区",
        "仪征市",
        "高邮市"
      ],
      镇江市: [
        "京口区",
        "润州区",
        "丹徒区",
        "镇江新区",
        "丹阳市",
        "扬中市",
        "句容市"
      ],
      泰州市: [
        "海陵区",
        "高港区",
        "姜堰区",
        "兴化市",
        "靖江市",
        "泰兴市"
      ],
      宿迁市: [
        "宿城区",
        "宿豫区",
        "沭阳县",
        "泗阳县",
        "泗洪县",
        "宿迁经济技术开发区"
      ]
    },
    浙江省: {
      杭州市: [
        "上城区",
        "拱墅区",
        "西湖区",
        "滨江区",
        "萧山区",
        "余杭区",
        "富阳区",
        "临安区",
        "临平区",
        "钱塘区",
        "桐庐县",
        "淳安县",
        "建德市"
      ],
      宁波市: [
        "海曙区",
        "江北区",
        "北仑区",
        "镇海区",
        "鄞州区",
        "奉化区",
        "象山县",
        "宁海县",
        "余姚市",
        "慈溪市"
      ],
      温州市: [
        "鹿城区",
        "龙湾区",
        "瓯海区",
        "洞头区",
        "永嘉县",
        "平阳县",
        "苍南县",
        "文成县",
        "泰顺县",
        "瑞安市",
        "乐清市",
        "龙港市"
      ],
      嘉兴市: [
        "南湖区",
        "秀洲区",
        "嘉善县",
        "海盐县",
        "海宁市",
        "平湖市",
        "桐乡市"
      ],
      湖州市: [
        "吴兴区",
        "南浔区",
        "德清县",
        "长兴县",
        "安吉县"
      ],
      绍兴市: [
        "越城区",
        "柯桥区",
        "上虞区",
        "新昌县",
        "诸暨市",
        "嵊州市"
      ],
      金华市: [
        "婺城区",
        "金东区",
        "武义县",
        "浦江县",
        "磐安县",
        "兰溪市",
        "义乌市",
        "东阳市",
        "永康市"
      ],
      衢州市: [
        "柯城区",
        "衢江区",
        "常山县",
        "开化县",
        "龙游县",
        "江山市"
      ],
      舟山市: [
        "定海区",
        "普陀区",
        "岱山县",
        "嵊泗县"
      ],
      台州市: [
        "椒江区",
        "黄岩区",
        "路桥区",
        "三门县",
        "天台县",
        "仙居县",
        "温岭市",
        "临海市",
        "玉环市"
      ],
      丽水市: [
        "莲都区",
        "青田县",
        "缙云县",
        "遂昌县",
        "松阳县",
        "云和县",
        "庆元县",
        "景宁畲族自治县",
        "龙泉市"
      ]
    },
    安徽省: {
      合肥市: [
        "瑶海区",
        "庐阳区",
        "蜀山区",
        "包河区",
        "长丰县",
        "肥东县",
        "肥西县",
        "庐江县",
        "合肥高新技术产业开发区",
        "合肥经济技术开发区",
        "合肥新站高新技术产业开发区",
        "巢湖市"
      ],
      芜湖市: [
        "镜湖区",
        "鸠江区",
        "弋江区",
        "湾沚区",
        "繁昌区",
        "南陵县",
        "芜湖经济技术开发区",
        "安徽芜湖三山经济开发区",
        "无为市"
      ],
      蚌埠市: [
        "龙子湖区",
        "蚌山区",
        "禹会区",
        "淮上区",
        "怀远县",
        "五河县",
        "固镇县",
        "蚌埠市高新技术开发区",
        "蚌埠市经济开发区"
      ],
      淮南市: [
        "大通区",
        "田家庵区",
        "谢家集区",
        "八公山区",
        "潘集区",
        "凤台县",
        "寿县"
      ],
      马鞍山市: [
        "花山区",
        "雨山区",
        "博望区",
        "当涂县",
        "含山县",
        "和县"
      ],
      淮北市: [
        "杜集区",
        "相山区",
        "烈山区",
        "濉溪县"
      ],
      铜陵市: [
        "铜官区",
        "义安区",
        "郊区",
        "枞阳县"
      ],
      安庆市: [
        "迎江区",
        "大观区",
        "宜秀区",
        "怀宁县",
        "太湖县",
        "宿松县",
        "望江县",
        "岳西县",
        "安徽安庆经济开发区",
        "桐城市",
        "潜山市"
      ],
      黄山市: [
        "屯溪区",
        "黄山区",
        "徽州区",
        "歙县",
        "休宁县",
        "黟县",
        "祁门县"
      ],
      滁州市: [
        "琅琊区",
        "南谯区",
        "来安县",
        "全椒县",
        "定远县",
        "凤阳县",
        "中新苏滁高新技术产业开发区",
        "滁州经济技术开发区",
        "天长市",
        "明光市"
      ],
      阜阳市: [
        "颍州区",
        "颍东区",
        "颍泉区",
        "临泉县",
        "太和县",
        "阜南县",
        "颍上县",
        "阜阳合肥现代产业园区",
        "阜阳经济技术开发区",
        "界首市"
      ],
      宿州市: [
        "埇桥区",
        "砀山县",
        "萧县",
        "灵璧县",
        "泗县",
        "宿州马鞍山现代产业园区",
        "宿州经济技术开发区"
      ],
      六安市: [
        "金安区",
        "裕安区",
        "叶集区",
        "霍邱县",
        "舒城县",
        "金寨县",
        "霍山县"
      ],
      亳州市: [
        "谯城区",
        "涡阳县",
        "蒙城县",
        "利辛县"
      ],
      池州市: [
        "贵池区",
        "东至县",
        "石台县",
        "青阳县"
      ],
      宣城市: [
        "宣州区",
        "郎溪县",
        "泾县",
        "绩溪县",
        "旌德县",
        "宣城市经济开发区",
        "宁国市",
        "广德市"
      ]
    },
    福建省: {
      福州市: [
        "鼓楼区",
        "台江区",
        "仓山区",
        "马尾区",
        "晋安区",
        "长乐区",
        "闽侯县",
        "连江县",
        "罗源县",
        "闽清县",
        "永泰县",
        "平潭县",
        "福清市"
      ],
      厦门市: [
        "思明区",
        "海沧区",
        "湖里区",
        "集美区",
        "同安区",
        "翔安区"
      ],
      莆田市: [
        "城厢区",
        "涵江区",
        "荔城区",
        "秀屿区",
        "仙游县"
      ],
      三明市: [
        "三元区",
        "沙县区",
        "明溪县",
        "清流县",
        "宁化县",
        "大田县",
        "尤溪县",
        "将乐县",
        "泰宁县",
        "建宁县",
        "永安市"
      ],
      泉州市: [
        "鲤城区",
        "丰泽区",
        "洛江区",
        "泉港区",
        "惠安县",
        "安溪县",
        "永春县",
        "德化县",
        "金门县",
        "石狮市",
        "晋江市",
        "南安市"
      ],
      漳州市: [
        "芗城区",
        "龙文区",
        "龙海区",
        "长泰区",
        "云霄县",
        "漳浦县",
        "诏安县",
        "东山县",
        "南靖县",
        "平和县",
        "华安县"
      ],
      南平市: [
        "延平区",
        "建阳区",
        "顺昌县",
        "浦城县",
        "光泽县",
        "松溪县",
        "政和县",
        "邵武市",
        "武夷山市",
        "建瓯市"
      ],
      龙岩市: [
        "新罗区",
        "永定区",
        "长汀县",
        "上杭县",
        "武平县",
        "连城县",
        "漳平市"
      ],
      宁德市: [
        "蕉城区",
        "霞浦县",
        "古田县",
        "屏南县",
        "寿宁县",
        "周宁县",
        "柘荣县",
        "福安市",
        "福鼎市"
      ]
    },
    江西省: {
      南昌市: [
        "东湖区",
        "西湖区",
        "青云谱区",
        "青山湖区",
        "新建区",
        "红谷滩区",
        "南昌县",
        "安义县",
        "进贤县"
      ],
      景德镇市: [
        "昌江区",
        "珠山区",
        "浮梁县",
        "乐平市"
      ],
      萍乡市: [
        "安源区",
        "湘东区",
        "莲花县",
        "上栗县",
        "芦溪县"
      ],
      九江市: [
        "濂溪区",
        "浔阳区",
        "柴桑区",
        "武宁县",
        "修水县",
        "永修县",
        "德安县",
        "都昌县",
        "湖口县",
        "彭泽县",
        "瑞昌市",
        "共青城市",
        "庐山市"
      ],
      新余市: [
        "渝水区",
        "分宜县"
      ],
      鹰潭市: [
        "月湖区",
        "余江区",
        "贵溪市"
      ],
      赣州市: [
        "章贡区",
        "南康区",
        "赣县区",
        "信丰县",
        "大余县",
        "上犹县",
        "崇义县",
        "安远县",
        "定南县",
        "全南县",
        "宁都县",
        "于都县",
        "兴国县",
        "会昌县",
        "寻乌县",
        "石城县",
        "瑞金市",
        "龙南市"
      ],
      吉安市: [
        "吉州区",
        "青原区",
        "吉安县",
        "吉水县",
        "峡江县",
        "新干县",
        "永丰县",
        "泰和县",
        "遂川县",
        "万安县",
        "安福县",
        "永新县",
        "井冈山市"
      ],
      宜春市: [
        "袁州区",
        "奉新县",
        "万载县",
        "上高县",
        "宜丰县",
        "靖安县",
        "铜鼓县",
        "丰城市",
        "樟树市",
        "高安市"
      ],
      抚州市: [
        "临川区",
        "东乡区",
        "南城县",
        "黎川县",
        "南丰县",
        "崇仁县",
        "乐安县",
        "宜黄县",
        "金溪县",
        "资溪县",
        "广昌县"
      ],
      上饶市: [
        "信州区",
        "广丰区",
        "广信区",
        "玉山县",
        "铅山县",
        "横峰县",
        "弋阳县",
        "余干县",
        "鄱阳县",
        "万年县",
        "婺源县",
        "德兴市"
      ]
    },
    山东省: {
      济南市: [
        "历下区",
        "市中区",
        "槐荫区",
        "天桥区",
        "历城区",
        "长清区",
        "章丘区",
        "济阳区",
        "莱芜区",
        "钢城区",
        "平阴县",
        "商河县",
        "济南高新技术产业开发区"
      ],
      青岛市: [
        "市南区",
        "市北区",
        "黄岛区",
        "崂山区",
        "李沧区",
        "城阳区",
        "即墨区",
        "胶州市",
        "平度市",
        "莱西市"
      ],
      淄博市: [
        "淄川区",
        "张店区",
        "博山区",
        "临淄区",
        "周村区",
        "桓台县",
        "高青县",
        "沂源县"
      ],
      枣庄市: [
        "市中区",
        "薛城区",
        "峄城区",
        "台儿庄区",
        "山亭区",
        "滕州市"
      ],
      东营市: [
        "东营区",
        "河口区",
        "垦利区",
        "利津县",
        "广饶县",
        "东营经济技术开发区",
        "东营港经济开发区"
      ],
      烟台市: [
        "芝罘区",
        "福山区",
        "牟平区",
        "莱山区",
        "蓬莱区",
        "烟台高新技术产业开发区",
        "烟台经济技术开发区",
        "龙口市",
        "莱阳市",
        "莱州市",
        "招远市",
        "栖霞市",
        "海阳市"
      ],
      潍坊市: [
        "潍城区",
        "寒亭区",
        "坊子区",
        "奎文区",
        "临朐县",
        "昌乐县",
        "潍坊滨海经济技术开发区",
        "青州市",
        "诸城市",
        "寿光市",
        "安丘市",
        "高密市",
        "昌邑市"
      ],
      济宁市: [
        "任城区",
        "兖州区",
        "微山县",
        "鱼台县",
        "金乡县",
        "嘉祥县",
        "汶上县",
        "泗水县",
        "梁山县",
        "济宁高新技术产业开发区",
        "曲阜市",
        "邹城市"
      ],
      泰安市: [
        "泰山区",
        "岱岳区",
        "宁阳县",
        "东平县",
        "新泰市",
        "肥城市"
      ],
      威海市: [
        "环翠区",
        "文登区",
        "威海火炬高技术产业开发区",
        "威海经济技术开发区",
        "威海临港经济技术开发区",
        "荣成市",
        "乳山市"
      ],
      日照市: [
        "东港区",
        "岚山区",
        "五莲县",
        "莒县",
        "日照经济技术开发区"
      ],
      临沂市: [
        "兰山区",
        "罗庄区",
        "河东区",
        "沂南县",
        "郯城县",
        "沂水县",
        "兰陵县",
        "费县",
        "平邑县",
        "莒南县",
        "蒙阴县",
        "临沭县",
        "临沂高新技术产业开发区"
      ],
      德州市: [
        "德城区",
        "陵城区",
        "宁津县",
        "庆云县",
        "临邑县",
        "齐河县",
        "平原县",
        "夏津县",
        "武城县",
        "德州天衢新区",
        "乐陵市",
        "禹城市"
      ],
      聊城市: [
        "东昌府区",
        "茌平区",
        "阳谷县",
        "莘县",
        "东阿县",
        "冠县",
        "高唐县",
        "临清市"
      ],
      滨州市: [
        "滨城区",
        "沾化区",
        "惠民县",
        "阳信县",
        "无棣县",
        "博兴县",
        "邹平市"
      ],
      菏泽市: [
        "牡丹区",
        "定陶区",
        "曹县",
        "单县",
        "成武县",
        "巨野县",
        "郓城县",
        "鄄城县",
        "东明县",
        "菏泽经济技术开发区",
        "菏泽高新技术开发区"
      ]
    },
    河南省: {
      郑州市: [
        "中原区",
        "二七区",
        "管城回族区",
        "金水区",
        "上街区",
        "惠济区",
        "中牟县",
        "郑州经济技术开发区",
        "郑州高新技术产业开发区",
        "郑州航空港经济综合实验区",
        "巩义市",
        "荥阳市",
        "新密市",
        "新郑市",
        "登封市"
      ],
      开封市: [
        "龙亭区",
        "顺河回族区",
        "鼓楼区",
        "禹王台区",
        "祥符区",
        "杞县",
        "通许县",
        "尉氏县",
        "兰考县"
      ],
      洛阳市: [
        "老城区",
        "西工区",
        "瀍河回族区",
        "涧西区",
        "偃师区",
        "孟津区",
        "洛龙区",
        "新安县",
        "栾川县",
        "嵩县",
        "汝阳县",
        "宜阳县",
        "洛宁县",
        "伊川县",
        "洛阳高新技术产业开发区"
      ],
      平顶山市: [
        "新华区",
        "卫东区",
        "石龙区",
        "湛河区",
        "宝丰县",
        "叶县",
        "鲁山县",
        "郏县",
        "平顶山高新技术产业开发区",
        "平顶山市城乡一体化示范区",
        "舞钢市",
        "汝州市"
      ],
      安阳市: [
        "文峰区",
        "北关区",
        "殷都区",
        "龙安区",
        "安阳县",
        "汤阴县",
        "滑县",
        "内黄县",
        "安阳高新技术产业开发区",
        "林州市"
      ],
      鹤壁市: [
        "鹤山区",
        "山城区",
        "淇滨区",
        "浚县",
        "淇县",
        "鹤壁经济技术开发区"
      ],
      新乡市: [
        "红旗区",
        "卫滨区",
        "凤泉区",
        "牧野区",
        "新乡县",
        "获嘉县",
        "原阳县",
        "延津县",
        "封丘县",
        "新乡高新技术产业开发区",
        "新乡经济技术开发区",
        "新乡市平原城乡一体化示范区",
        "卫辉市",
        "辉县市",
        "长垣市"
      ],
      焦作市: [
        "解放区",
        "中站区",
        "马村区",
        "山阳区",
        "修武县",
        "博爱县",
        "武陟县",
        "温县",
        "焦作城乡一体化示范区",
        "沁阳市",
        "孟州市"
      ],
      濮阳市: [
        "华龙区",
        "清丰县",
        "南乐县",
        "范县",
        "台前县",
        "濮阳县",
        "河南濮阳工业园区",
        "濮阳经济技术开发区"
      ],
      许昌市: [
        "魏都区",
        "建安区",
        "鄢陵县",
        "襄城县",
        "许昌经济技术开发区",
        "禹州市",
        "长葛市"
      ],
      漯河市: [
        "源汇区",
        "郾城区",
        "召陵区",
        "舞阳县",
        "临颍县",
        "漯河经济技术开发区"
      ],
      三门峡市: [
        "湖滨区",
        "陕州区",
        "渑池县",
        "卢氏县",
        "河南三门峡经济开发区",
        "义马市",
        "灵宝市"
      ],
      南阳市: [
        "宛城区",
        "卧龙区",
        "南召县",
        "方城县",
        "西峡县",
        "镇平县",
        "内乡县",
        "淅川县",
        "社旗县",
        "唐河县",
        "新野县",
        "桐柏县",
        "南阳高新技术产业开发区",
        "南阳市城乡一体化示范区",
        "邓州市"
      ],
      商丘市: [
        "梁园区",
        "睢阳区",
        "民权县",
        "睢县",
        "宁陵县",
        "柘城县",
        "虞城县",
        "夏邑县",
        "豫东综合物流产业聚集区",
        "河南商丘经济开发区",
        "永城市"
      ],
      信阳市: [
        "浉河区",
        "平桥区",
        "罗山县",
        "光山县",
        "新县",
        "商城县",
        "固始县",
        "潢川县",
        "淮滨县",
        "息县",
        "信阳高新技术产业开发区"
      ],
      周口市: [
        "川汇区",
        "淮阳区",
        "扶沟县",
        "西华县",
        "商水县",
        "沈丘县",
        "郸城县",
        "太康县",
        "鹿邑县",
        "周口临港开发区",
        "项城市"
      ],
      驻马店市: [
        "驿城区",
        "西平县",
        "上蔡县",
        "平舆县",
        "正阳县",
        "确山县",
        "泌阳县",
        "汝南县",
        "遂平县",
        "新蔡县",
        "河南驻马店经济开发区"
      ],
      省直辖县级行政区划: [
        "济源市"
      ]
    },
    湖北省: {
      武汉市: [
        "江岸区",
        "江汉区",
        "硚口区",
        "汉阳区",
        "武昌区",
        "青山区",
        "洪山区",
        "东西湖区",
        "汉南区",
        "蔡甸区",
        "江夏区",
        "黄陂区",
        "新洲区"
      ],
      黄石市: [
        "黄石港区",
        "西塞山区",
        "下陆区",
        "铁山区",
        "阳新县",
        "大冶市"
      ],
      十堰市: [
        "茅箭区",
        "张湾区",
        "郧阳区",
        "郧西县",
        "竹山县",
        "竹溪县",
        "房县",
        "丹江口市"
      ],
      宜昌市: [
        "西陵区",
        "伍家岗区",
        "点军区",
        "猇亭区",
        "夷陵区",
        "远安县",
        "兴山县",
        "秭归县",
        "长阳土家族自治县",
        "五峰土家族自治县",
        "宜都市",
        "当阳市",
        "枝江市"
      ],
      襄阳市: [
        "襄城区",
        "樊城区",
        "襄州区",
        "南漳县",
        "谷城县",
        "保康县",
        "老河口市",
        "枣阳市",
        "宜城市"
      ],
      鄂州市: [
        "梁子湖区",
        "华容区",
        "鄂城区"
      ],
      荆门市: [
        "东宝区",
        "掇刀区",
        "沙洋县",
        "钟祥市",
        "京山市"
      ],
      孝感市: [
        "孝南区",
        "孝昌县",
        "大悟县",
        "云梦县",
        "应城市",
        "安陆市",
        "汉川市"
      ],
      荆州市: [
        "沙市区",
        "荆州区",
        "公安县",
        "江陵县",
        "荆州经济技术开发区",
        "石首市",
        "洪湖市",
        "松滋市",
        "监利市"
      ],
      黄冈市: [
        "黄州区",
        "团风县",
        "红安县",
        "罗田县",
        "英山县",
        "浠水县",
        "蕲春县",
        "黄梅县",
        "龙感湖管理区",
        "麻城市",
        "武穴市"
      ],
      咸宁市: [
        "咸安区",
        "嘉鱼县",
        "通城县",
        "崇阳县",
        "通山县",
        "赤壁市"
      ],
      随州市: [
        "曾都区",
        "随县",
        "广水市"
      ],
      恩施土家族苗族自治州: [
        "恩施市",
        "利川市",
        "建始县",
        "巴东县",
        "宣恩县",
        "咸丰县",
        "来凤县",
        "鹤峰县"
      ],
      省直辖县级行政区划: [
        "仙桃市",
        "潜江市",
        "天门市",
        "神农架林区"
      ]
    },
    湖南省: {
      长沙市: [
        "芙蓉区",
        "天心区",
        "岳麓区",
        "开福区",
        "雨花区",
        "望城区",
        "长沙县",
        "浏阳市",
        "宁乡市"
      ],
      株洲市: [
        "荷塘区",
        "芦淞区",
        "石峰区",
        "天元区",
        "渌口区",
        "攸县",
        "茶陵县",
        "炎陵县",
        "醴陵市"
      ],
      湘潭市: [
        "雨湖区",
        "岳塘区",
        "湘潭县",
        "湖南湘潭高新技术产业园区",
        "湘潭昭山示范区",
        "湘潭九华示范区",
        "湘乡市",
        "韶山市"
      ],
      衡阳市: [
        "珠晖区",
        "雁峰区",
        "石鼓区",
        "蒸湘区",
        "南岳区",
        "衡阳县",
        "衡南县",
        "衡山县",
        "衡东县",
        "祁东县",
        "湖南衡阳松木经济开发区",
        "湖南衡阳高新技术产业园区",
        "耒阳市",
        "常宁市"
      ],
      邵阳市: [
        "双清区",
        "大祥区",
        "北塔区",
        "新邵县",
        "邵阳县",
        "隆回县",
        "洞口县",
        "绥宁县",
        "新宁县",
        "城步苗族自治县",
        "武冈市",
        "邵东市"
      ],
      岳阳市: [
        "岳阳楼区",
        "云溪区",
        "君山区",
        "岳阳县",
        "华容县",
        "湘阴县",
        "平江县",
        "岳阳市屈原管理区",
        "汨罗市",
        "临湘市"
      ],
      常德市: [
        "武陵区",
        "鼎城区",
        "安乡县",
        "汉寿县",
        "澧县",
        "临澧县",
        "桃源县",
        "石门县",
        "常德市西洞庭管理区",
        "津市市"
      ],
      张家界市: [
        "永定区",
        "武陵源区",
        "慈利县",
        "桑植县"
      ],
      益阳市: [
        "资阳区",
        "赫山区",
        "南县",
        "桃江县",
        "安化县",
        "益阳市大通湖管理区",
        "湖南益阳高新技术产业园区",
        "沅江市"
      ],
      郴州市: [
        "北湖区",
        "苏仙区",
        "桂阳县",
        "宜章县",
        "永兴县",
        "嘉禾县",
        "临武县",
        "汝城县",
        "桂东县",
        "安仁县",
        "资兴市"
      ],
      永州市: [
        "零陵区",
        "冷水滩区",
        "东安县",
        "双牌县",
        "道县",
        "江永县",
        "宁远县",
        "蓝山县",
        "新田县",
        "江华瑶族自治县",
        "永州经济技术开发区",
        "永州市回龙圩管理区",
        "祁阳市"
      ],
      怀化市: [
        "鹤城区",
        "中方县",
        "沅陵县",
        "辰溪县",
        "溆浦县",
        "会同县",
        "麻阳苗族自治县",
        "新晃侗族自治县",
        "芷江侗族自治县",
        "靖州苗族侗族自治县",
        "通道侗族自治县",
        "怀化市洪江管理区",
        "洪江市"
      ],
      娄底市: [
        "娄星区",
        "双峰县",
        "新化县",
        "冷水江市",
        "涟源市"
      ],
      湘西土家族苗族自治州: [
        "吉首市",
        "泸溪县",
        "凤凰县",
        "花垣县",
        "保靖县",
        "古丈县",
        "永顺县",
        "龙山县"
      ]
    },
    广东省: {
      广州市: [
        "荔湾区",
        "越秀区",
        "海珠区",
        "天河区",
        "白云区",
        "黄埔区",
        "番禺区",
        "花都区",
        "南沙区",
        "从化区",
        "增城区"
      ],
      韶关市: [
        "武江区",
        "浈江区",
        "曲江区",
        "始兴县",
        "仁化县",
        "翁源县",
        "乳源瑶族自治县",
        "新丰县",
        "乐昌市",
        "南雄市"
      ],
      深圳市: [
        "罗湖区",
        "福田区",
        "南山区",
        "宝安区",
        "龙岗区",
        "盐田区",
        "龙华区",
        "坪山区",
        "光明区"
      ],
      珠海市: [
        "香洲区",
        "斗门区",
        "金湾区"
      ],
      汕头市: [
        "龙湖区",
        "金平区",
        "濠江区",
        "潮阳区",
        "潮南区",
        "澄海区",
        "南澳县"
      ],
      佛山市: [
        "禅城区",
        "南海区",
        "顺德区",
        "三水区",
        "高明区"
      ],
      江门市: [
        "蓬江区",
        "江海区",
        "新会区",
        "台山市",
        "开平市",
        "鹤山市",
        "恩平市"
      ],
      湛江市: [
        "赤坎区",
        "霞山区",
        "坡头区",
        "麻章区",
        "遂溪县",
        "徐闻县",
        "廉江市",
        "雷州市",
        "吴川市"
      ],
      茂名市: [
        "茂南区",
        "电白区",
        "高州市",
        "化州市",
        "信宜市"
      ],
      肇庆市: [
        "端州区",
        "鼎湖区",
        "高要区",
        "广宁县",
        "怀集县",
        "封开县",
        "德庆县",
        "四会市"
      ],
      惠州市: [
        "惠城区",
        "惠阳区",
        "博罗县",
        "惠东县",
        "龙门县"
      ],
      梅州市: [
        "梅江区",
        "梅县区",
        "大埔县",
        "丰顺县",
        "五华县",
        "平远县",
        "蕉岭县",
        "兴宁市"
      ],
      汕尾市: [
        "城区",
        "海丰县",
        "陆河县",
        "陆丰市"
      ],
      河源市: [
        "源城区",
        "紫金县",
        "龙川县",
        "连平县",
        "和平县",
        "东源县"
      ],
      阳江市: [
        "江城区",
        "阳东区",
        "阳西县",
        "阳春市"
      ],
      清远市: [
        "清城区",
        "清新区",
        "佛冈县",
        "阳山县",
        "连山壮族瑶族自治县",
        "连南瑶族自治县",
        "英德市",
        "连州市"
      ],
      东莞市: [
        "东城街道",
        "南城街道",
        "万江街道",
        "莞城街道",
        "石碣镇",
        "石龙镇",
        "茶山镇",
        "石排镇",
        "企石镇",
        "横沥镇",
        "桥头镇",
        "谢岗镇",
        "东坑镇",
        "常平镇",
        "寮步镇",
        "樟木头镇",
        "大朗镇",
        "黄江镇",
        "清溪镇",
        "塘厦镇",
        "凤岗镇",
        "大岭山镇",
        "长安镇",
        "虎门镇",
        "厚街镇",
        "沙田镇",
        "道滘镇",
        "洪梅镇",
        "麻涌镇",
        "望牛墩镇",
        "中堂镇",
        "高埗镇",
        "松山湖",
        "东莞港",
        "东莞生态园",
        "东莞滨海湾新区"
      ],
      中山市: [
        "石岐街道",
        "东区街道",
        "中山港街道",
        "西区街道",
        "南区街道",
        "五桂山街道",
        "民众街道",
        "南朗街道",
        "黄圃镇",
        "东凤镇",
        "古镇镇",
        "沙溪镇",
        "坦洲镇",
        "港口镇",
        "三角镇",
        "横栏镇",
        "南头镇",
        "阜沙镇",
        "三乡镇",
        "板芙镇",
        "大涌镇",
        "神湾镇",
        "小榄镇"
      ],
      潮州市: [
        "湘桥区",
        "潮安区",
        "饶平县"
      ],
      揭阳市: [
        "榕城区",
        "揭东区",
        "揭西县",
        "惠来县",
        "普宁市"
      ],
      云浮市: [
        "云城区",
        "云安区",
        "新兴县",
        "郁南县",
        "罗定市"
      ]
    },
    广西壮族自治区: {
      南宁市: [
        "兴宁区",
        "青秀区",
        "江南区",
        "西乡塘区",
        "良庆区",
        "邕宁区",
        "武鸣区",
        "隆安县",
        "马山县",
        "上林县",
        "宾阳县",
        "横州市"
      ],
      柳州市: [
        "城中区",
        "鱼峰区",
        "柳南区",
        "柳北区",
        "柳江区",
        "柳城县",
        "鹿寨县",
        "融安县",
        "融水苗族自治县",
        "三江侗族自治县"
      ],
      桂林市: [
        "秀峰区",
        "叠彩区",
        "象山区",
        "七星区",
        "雁山区",
        "临桂区",
        "阳朔县",
        "灵川县",
        "全州县",
        "兴安县",
        "永福县",
        "灌阳县",
        "龙胜各族自治县",
        "资源县",
        "平乐县",
        "恭城瑶族自治县",
        "荔浦市"
      ],
      梧州市: [
        "万秀区",
        "长洲区",
        "龙圩区",
        "苍梧县",
        "藤县",
        "蒙山县",
        "岑溪市"
      ],
      北海市: [
        "海城区",
        "银海区",
        "铁山港区",
        "合浦县"
      ],
      防城港市: [
        "港口区",
        "防城区",
        "上思县",
        "东兴市"
      ],
      钦州市: [
        "钦南区",
        "钦北区",
        "灵山县",
        "浦北县"
      ],
      贵港市: [
        "港北区",
        "港南区",
        "覃塘区",
        "平南县",
        "桂平市"
      ],
      玉林市: [
        "玉州区",
        "福绵区",
        "容县",
        "陆川县",
        "博白县",
        "兴业县",
        "北流市"
      ],
      百色市: [
        "右江区",
        "田阳区",
        "田东县",
        "德保县",
        "那坡县",
        "凌云县",
        "乐业县",
        "田林县",
        "西林县",
        "隆林各族自治县",
        "靖西市",
        "平果市"
      ],
      贺州市: [
        "八步区",
        "平桂区",
        "昭平县",
        "钟山县",
        "富川瑶族自治县"
      ],
      河池市: [
        "金城江区",
        "宜州区",
        "南丹县",
        "天峨县",
        "凤山县",
        "东兰县",
        "罗城仫佬族自治县",
        "环江毛南族自治县",
        "巴马瑶族自治县",
        "都安瑶族自治县",
        "大化瑶族自治县"
      ],
      来宾市: [
        "兴宾区",
        "忻城县",
        "象州县",
        "武宣县",
        "金秀瑶族自治县",
        "合山市"
      ],
      崇左市: [
        "江州区",
        "扶绥县",
        "宁明县",
        "龙州县",
        "大新县",
        "天等县",
        "凭祥市"
      ]
    },
    海南省: {
      海口市: [
        "秀英区",
        "龙华区",
        "琼山区",
        "美兰区"
      ],
      三亚市: [
        "海棠区",
        "吉阳区",
        "天涯区",
        "崖州区"
      ],
      三沙市: [
        "西沙群岛",
        "南沙群岛",
        "中沙群岛的岛礁及其海域"
      ],
      儋州市: [
        "那大镇",
        "和庆镇",
        "南丰镇",
        "大成镇",
        "雅星镇",
        "兰洋镇",
        "光村镇",
        "木棠镇",
        "海头镇",
        "峨蔓镇",
        "王五镇",
        "白马井镇",
        "中和镇",
        "排浦镇",
        "东成镇",
        "新州镇",
        "洋浦经济开发区",
        "华南热作学院"
      ],
      省直辖县级行政区划: [
        "五指山市",
        "琼海市",
        "文昌市",
        "万宁市",
        "东方市",
        "定安县",
        "屯昌县",
        "澄迈县",
        "临高县",
        "白沙黎族自治县",
        "昌江黎族自治县",
        "乐东黎族自治县",
        "陵水黎族自治县",
        "保亭黎族苗族自治县",
        "琼中黎族苗族自治县"
      ]
    },
    重庆市: {
      市辖区: [
        "万州区",
        "涪陵区",
        "渝中区",
        "大渡口区",
        "江北区",
        "沙坪坝区",
        "九龙坡区",
        "南岸区",
        "北碚区",
        "綦江区",
        "大足区",
        "渝北区",
        "巴南区",
        "黔江区",
        "长寿区",
        "江津区",
        "合川区",
        "永川区",
        "南川区",
        "璧山区",
        "铜梁区",
        "潼南区",
        "荣昌区",
        "开州区",
        "梁平区",
        "武隆区"
      ],
      县: [
        "城口县",
        "丰都县",
        "垫江县",
        "忠县",
        "云阳县",
        "奉节县",
        "巫山县",
        "巫溪县",
        "石柱土家族自治县",
        "秀山土家族苗族自治县",
        "酉阳土家族苗族自治县",
        "彭水苗族土家族自治县"
      ]
    },
    四川省: {
      成都市: [
        "锦江区",
        "青羊区",
        "金牛区",
        "武侯区",
        "成华区",
        "龙泉驿区",
        "青白江区",
        "新都区",
        "温江区",
        "双流区",
        "郫都区",
        "新津区",
        "金堂县",
        "大邑县",
        "蒲江县",
        "都江堰市",
        "彭州市",
        "邛崃市",
        "崇州市",
        "简阳市"
      ],
      自贡市: [
        "自流井区",
        "贡井区",
        "大安区",
        "沿滩区",
        "荣县",
        "富顺县"
      ],
      攀枝花市: [
        "东区",
        "西区",
        "仁和区",
        "米易县",
        "盐边县"
      ],
      泸州市: [
        "江阳区",
        "纳溪区",
        "龙马潭区",
        "泸县",
        "合江县",
        "叙永县",
        "古蔺县"
      ],
      德阳市: [
        "旌阳区",
        "罗江区",
        "中江县",
        "广汉市",
        "什邡市",
        "绵竹市"
      ],
      绵阳市: [
        "涪城区",
        "游仙区",
        "安州区",
        "三台县",
        "盐亭县",
        "梓潼县",
        "北川羌族自治县",
        "平武县",
        "江油市"
      ],
      广元市: [
        "利州区",
        "昭化区",
        "朝天区",
        "旺苍县",
        "青川县",
        "剑阁县",
        "苍溪县"
      ],
      遂宁市: [
        "船山区",
        "安居区",
        "蓬溪县",
        "大英县",
        "射洪市"
      ],
      内江市: [
        "市中区",
        "东兴区",
        "威远县",
        "资中县",
        "隆昌市"
      ],
      乐山市: [
        "市中区",
        "沙湾区",
        "五通桥区",
        "金口河区",
        "犍为县",
        "井研县",
        "夹江县",
        "沐川县",
        "峨边彝族自治县",
        "马边彝族自治县",
        "峨眉山市"
      ],
      南充市: [
        "顺庆区",
        "高坪区",
        "嘉陵区",
        "南部县",
        "营山县",
        "蓬安县",
        "仪陇县",
        "西充县",
        "阆中市"
      ],
      眉山市: [
        "东坡区",
        "彭山区",
        "仁寿县",
        "洪雅县",
        "丹棱县",
        "青神县"
      ],
      宜宾市: [
        "翠屏区",
        "南溪区",
        "叙州区",
        "江安县",
        "长宁县",
        "高县",
        "珙县",
        "筠连县",
        "兴文县",
        "屏山县"
      ],
      广安市: [
        "广安区",
        "前锋区",
        "岳池县",
        "武胜县",
        "邻水县",
        "华蓥市"
      ],
      达州市: [
        "通川区",
        "达川区",
        "宣汉县",
        "开江县",
        "大竹县",
        "渠县",
        "万源市"
      ],
      雅安市: [
        "雨城区",
        "名山区",
        "荥经县",
        "汉源县",
        "石棉县",
        "天全县",
        "芦山县",
        "宝兴县"
      ],
      巴中市: [
        "巴州区",
        "恩阳区",
        "通江县",
        "南江县",
        "平昌县"
      ],
      资阳市: [
        "雁江区",
        "安岳县",
        "乐至县"
      ],
      阿坝藏族羌族自治州: [
        "马尔康市",
        "汶川县",
        "理县",
        "茂县",
        "松潘县",
        "九寨沟县",
        "金川县",
        "小金县",
        "黑水县",
        "壤塘县",
        "阿坝县",
        "若尔盖县",
        "红原县"
      ],
      甘孜藏族自治州: [
        "康定市",
        "泸定县",
        "丹巴县",
        "九龙县",
        "雅江县",
        "道孚县",
        "炉霍县",
        "甘孜县",
        "新龙县",
        "德格县",
        "白玉县",
        "石渠县",
        "色达县",
        "理塘县",
        "巴塘县",
        "乡城县",
        "稻城县",
        "得荣县"
      ],
      凉山彝族自治州: [
        "西昌市",
        "会理市",
        "木里藏族自治县",
        "盐源县",
        "德昌县",
        "会东县",
        "宁南县",
        "普格县",
        "布拖县",
        "金阳县",
        "昭觉县",
        "喜德县",
        "冕宁县",
        "越西县",
        "甘洛县",
        "美姑县",
        "雷波县"
      ]
    },
    贵州省: {
      贵阳市: [
        "南明区",
        "云岩区",
        "花溪区",
        "乌当区",
        "白云区",
        "观山湖区",
        "开阳县",
        "息烽县",
        "修文县",
        "清镇市"
      ],
      六盘水市: [
        "钟山区",
        "六枝特区",
        "水城区",
        "盘州市"
      ],
      遵义市: [
        "红花岗区",
        "汇川区",
        "播州区",
        "桐梓县",
        "绥阳县",
        "正安县",
        "道真仡佬族苗族自治县",
        "务川仡佬族苗族自治县",
        "凤冈县",
        "湄潭县",
        "余庆县",
        "习水县",
        "赤水市",
        "仁怀市"
      ],
      安顺市: [
        "西秀区",
        "平坝区",
        "普定县",
        "镇宁布依族苗族自治县",
        "关岭布依族苗族自治县",
        "紫云苗族布依族自治县"
      ],
      毕节市: [
        "七星关区",
        "大方县",
        "金沙县",
        "织金县",
        "纳雍县",
        "威宁彝族回族苗族自治县",
        "赫章县",
        "黔西市"
      ],
      铜仁市: [
        "碧江区",
        "万山区",
        "江口县",
        "玉屏侗族自治县",
        "石阡县",
        "思南县",
        "印江土家族苗族自治县",
        "德江县",
        "沿河土家族自治县",
        "松桃苗族自治县"
      ],
      黔西南布依族苗族自治州: [
        "兴义市",
        "兴仁市",
        "普安县",
        "晴隆县",
        "贞丰县",
        "望谟县",
        "册亨县",
        "安龙县"
      ],
      黔东南苗族侗族自治州: [
        "凯里市",
        "黄平县",
        "施秉县",
        "三穗县",
        "镇远县",
        "岑巩县",
        "天柱县",
        "锦屏县",
        "剑河县",
        "台江县",
        "黎平县",
        "榕江县",
        "从江县",
        "雷山县",
        "麻江县",
        "丹寨县"
      ],
      黔南布依族苗族自治州: [
        "都匀市",
        "福泉市",
        "荔波县",
        "贵定县",
        "瓮安县",
        "独山县",
        "平塘县",
        "罗甸县",
        "长顺县",
        "龙里县",
        "惠水县",
        "三都水族自治县"
      ]
    },
    云南省: {
      昆明市: [
        "五华区",
        "盘龙区",
        "官渡区",
        "西山区",
        "东川区",
        "呈贡区",
        "晋宁区",
        "富民县",
        "宜良县",
        "石林彝族自治县",
        "嵩明县",
        "禄劝彝族苗族自治县",
        "寻甸回族彝族自治县",
        "安宁市"
      ],
      曲靖市: [
        "麒麟区",
        "沾益区",
        "马龙区",
        "陆良县",
        "师宗县",
        "罗平县",
        "富源县",
        "会泽县",
        "宣威市"
      ],
      玉溪市: [
        "红塔区",
        "江川区",
        "通海县",
        "华宁县",
        "易门县",
        "峨山彝族自治县",
        "新平彝族傣族自治县",
        "元江哈尼族彝族傣族自治县",
        "澄江市"
      ],
      保山市: [
        "隆阳区",
        "施甸县",
        "龙陵县",
        "昌宁县",
        "腾冲市"
      ],
      昭通市: [
        "昭阳区",
        "鲁甸县",
        "巧家县",
        "盐津县",
        "大关县",
        "永善县",
        "绥江县",
        "镇雄县",
        "彝良县",
        "威信县",
        "水富市"
      ],
      丽江市: [
        "古城区",
        "玉龙纳西族自治县",
        "永胜县",
        "华坪县",
        "宁蒗彝族自治县"
      ],
      普洱市: [
        "思茅区",
        "宁洱哈尼族彝族自治县",
        "墨江哈尼族自治县",
        "景东彝族自治县",
        "景谷傣族彝族自治县",
        "镇沅彝族哈尼族拉祜族自治县",
        "江城哈尼族彝族自治县",
        "孟连傣族拉祜族佤族自治县",
        "澜沧拉祜族自治县",
        "西盟佤族自治县"
      ],
      临沧市: [
        "临翔区",
        "凤庆县",
        "云县",
        "永德县",
        "镇康县",
        "双江拉祜族佤族布朗族傣族自治县",
        "耿马傣族佤族自治县",
        "沧源佤族自治县"
      ],
      楚雄彝族自治州: [
        "楚雄市",
        "禄丰市",
        "双柏县",
        "牟定县",
        "南华县",
        "姚安县",
        "大姚县",
        "永仁县",
        "元谋县",
        "武定县"
      ],
      红河哈尼族彝族自治州: [
        "个旧市",
        "开远市",
        "蒙自市",
        "弥勒市",
        "屏边苗族自治县",
        "建水县",
        "石屏县",
        "泸西县",
        "元阳县",
        "红河县",
        "金平苗族瑶族傣族自治县",
        "绿春县",
        "河口瑶族自治县"
      ],
      文山壮族苗族自治州: [
        "文山市",
        "砚山县",
        "西畴县",
        "麻栗坡县",
        "马关县",
        "丘北县",
        "广南县",
        "富宁县"
      ],
      西双版纳傣族自治州: [
        "景洪市",
        "勐海县",
        "勐腊县"
      ],
      大理白族自治州: [
        "大理市",
        "漾濞彝族自治县",
        "祥云县",
        "宾川县",
        "弥渡县",
        "南涧彝族自治县",
        "巍山彝族回族自治县",
        "永平县",
        "云龙县",
        "洱源县",
        "剑川县",
        "鹤庆县"
      ],
      德宏傣族景颇族自治州: [
        "瑞丽市",
        "芒市",
        "梁河县",
        "盈江县",
        "陇川县"
      ],
      怒江傈僳族自治州: [
        "泸水市",
        "福贡县",
        "贡山独龙族怒族自治县",
        "兰坪白族普米族自治县"
      ],
      迪庆藏族自治州: [
        "香格里拉市",
        "德钦县",
        "维西傈僳族自治县"
      ]
    },
    西藏自治区: {
      拉萨市: [
        "城关区",
        "堆龙德庆区",
        "达孜区",
        "林周县",
        "当雄县",
        "尼木县",
        "曲水县",
        "墨竹工卡县",
        "格尔木藏青工业园区",
        "拉萨经济技术开发区",
        "西藏文化旅游创意园区",
        "达孜工业园区"
      ],
      日喀则市: [
        "桑珠孜区",
        "南木林县",
        "江孜县",
        "定日县",
        "萨迦县",
        "拉孜县",
        "昂仁县",
        "谢通门县",
        "白朗县",
        "仁布县",
        "康马县",
        "定结县",
        "仲巴县",
        "亚东县",
        "吉隆县",
        "聂拉木县",
        "萨嘎县",
        "岗巴县"
      ],
      昌都市: [
        "卡若区",
        "江达县",
        "贡觉县",
        "类乌齐县",
        "丁青县",
        "察雅县",
        "八宿县",
        "左贡县",
        "芒康县",
        "洛隆县",
        "边坝县"
      ],
      林芝市: [
        "巴宜区",
        "工布江达县",
        "墨脱县",
        "波密县",
        "察隅县",
        "朗县",
        "米林市"
      ],
      山南市: [
        "乃东区",
        "扎囊县",
        "贡嘎县",
        "桑日县",
        "琼结县",
        "曲松县",
        "措美县",
        "洛扎县",
        "加查县",
        "隆子县",
        "浪卡子县",
        "错那市"
      ],
      那曲市: [
        "色尼区",
        "嘉黎县",
        "比如县",
        "聂荣县",
        "安多县",
        "申扎县",
        "索县",
        "班戈县",
        "巴青县",
        "尼玛县",
        "双湖县"
      ],
      阿里地区: [
        "普兰县",
        "札达县",
        "噶尔县",
        "日土县",
        "革吉县",
        "改则县",
        "措勤县"
      ]
    },
    陕西省: {
      西安市: [
        "新城区",
        "碑林区",
        "莲湖区",
        "灞桥区",
        "未央区",
        "雁塔区",
        "阎良区",
        "临潼区",
        "长安区",
        "高陵区",
        "鄠邑区",
        "蓝田县",
        "周至县"
      ],
      铜川市: [
        "王益区",
        "印台区",
        "耀州区",
        "宜君县"
      ],
      宝鸡市: [
        "渭滨区",
        "金台区",
        "陈仓区",
        "凤翔区",
        "岐山县",
        "扶风县",
        "眉县",
        "陇县",
        "千阳县",
        "麟游县",
        "凤县",
        "太白县"
      ],
      咸阳市: [
        "秦都区",
        "杨陵区",
        "渭城区",
        "三原县",
        "泾阳县",
        "乾县",
        "礼泉县",
        "永寿县",
        "长武县",
        "旬邑县",
        "淳化县",
        "武功县",
        "兴平市",
        "彬州市"
      ],
      渭南市: [
        "临渭区",
        "华州区",
        "潼关县",
        "大荔县",
        "合阳县",
        "澄城县",
        "蒲城县",
        "白水县",
        "富平县",
        "韩城市",
        "华阴市"
      ],
      延安市: [
        "宝塔区",
        "安塞区",
        "延长县",
        "延川县",
        "志丹县",
        "吴起县",
        "甘泉县",
        "富县",
        "洛川县",
        "宜川县",
        "黄龙县",
        "黄陵县",
        "子长市"
      ],
      汉中市: [
        "汉台区",
        "南郑区",
        "城固县",
        "洋县",
        "西乡县",
        "勉县",
        "宁强县",
        "略阳县",
        "镇巴县",
        "留坝县",
        "佛坪县"
      ],
      榆林市: [
        "榆阳区",
        "横山区",
        "府谷县",
        "靖边县",
        "定边县",
        "绥德县",
        "米脂县",
        "佳县",
        "吴堡县",
        "清涧县",
        "子洲县",
        "神木市"
      ],
      安康市: [
        "汉滨区",
        "汉阴县",
        "石泉县",
        "宁陕县",
        "紫阳县",
        "岚皋县",
        "平利县",
        "镇坪县",
        "白河县",
        "旬阳市"
      ],
      商洛市: [
        "商州区",
        "洛南县",
        "丹凤县",
        "商南县",
        "山阳县",
        "镇安县",
        "柞水县"
      ]
    },
    甘肃省: {
      兰州市: [
        "城关区",
        "七里河区",
        "西固区",
        "安宁区",
        "红古区",
        "永登县",
        "皋兰县",
        "榆中县",
        "兰州新区"
      ],
      嘉峪关市: [
        "雄关街道",
        "钢城街道",
        "新城镇",
        "峪泉镇",
        "文殊镇"
      ],
      金昌市: [
        "金川区",
        "永昌县"
      ],
      白银市: [
        "白银区",
        "平川区",
        "靖远县",
        "会宁县",
        "景泰县"
      ],
      天水市: [
        "秦州区",
        "麦积区",
        "清水县",
        "秦安县",
        "甘谷县",
        "武山县",
        "张家川回族自治县"
      ],
      武威市: [
        "凉州区",
        "民勤县",
        "古浪县",
        "天祝藏族自治县"
      ],
      张掖市: [
        "甘州区",
        "肃南裕固族自治县",
        "民乐县",
        "临泽县",
        "高台县",
        "山丹县"
      ],
      平凉市: [
        "崆峒区",
        "泾川县",
        "灵台县",
        "崇信县",
        "庄浪县",
        "静宁县",
        "华亭市"
      ],
      酒泉市: [
        "肃州区",
        "金塔县",
        "瓜州县",
        "肃北蒙古族自治县",
        "阿克塞哈萨克族自治县",
        "玉门市",
        "敦煌市"
      ],
      庆阳市: [
        "西峰区",
        "庆城县",
        "环县",
        "华池县",
        "合水县",
        "正宁县",
        "宁县",
        "镇原县"
      ],
      定西市: [
        "安定区",
        "通渭县",
        "陇西县",
        "渭源县",
        "临洮县",
        "漳县",
        "岷县"
      ],
      陇南市: [
        "武都区",
        "成县",
        "文县",
        "宕昌县",
        "康县",
        "西和县",
        "礼县",
        "徽县",
        "两当县"
      ],
      临夏回族自治州: [
        "临夏市",
        "临夏县",
        "康乐县",
        "永靖县",
        "广河县",
        "和政县",
        "东乡族自治县",
        "积石山保安族东乡族撒拉族自治县"
      ],
      甘南藏族自治州: [
        "合作市",
        "临潭县",
        "卓尼县",
        "舟曲县",
        "迭部县",
        "玛曲县",
        "碌曲县",
        "夏河县"
      ]
    },
    青海省: {
      西宁市: [
        "城东区",
        "城中区",
        "城西区",
        "城北区",
        "湟中区",
        "大通回族土族自治县",
        "湟源县"
      ],
      海东市: [
        "乐都区",
        "平安区",
        "民和回族土族自治县",
        "互助土族自治县",
        "化隆回族自治县",
        "循化撒拉族自治县"
      ],
      海北藏族自治州: [
        "门源回族自治县",
        "祁连县",
        "海晏县",
        "刚察县"
      ],
      黄南藏族自治州: [
        "同仁市",
        "尖扎县",
        "泽库县",
        "河南蒙古族自治县"
      ],
      海南藏族自治州: [
        "共和县",
        "同德县",
        "贵德县",
        "兴海县",
        "贵南县"
      ],
      果洛藏族自治州: [
        "玛沁县",
        "班玛县",
        "甘德县",
        "达日县",
        "久治县",
        "玛多县"
      ],
      玉树藏族自治州: [
        "玉树市",
        "杂多县",
        "称多县",
        "治多县",
        "囊谦县",
        "曲麻莱县"
      ],
      海西蒙古族藏族自治州: [
        "格尔木市",
        "德令哈市",
        "茫崖市",
        "乌兰县",
        "都兰县",
        "天峻县",
        "大柴旦行政委员会"
      ]
    },
    宁夏回族自治区: {
      银川市: [
        "兴庆区",
        "西夏区",
        "金凤区",
        "永宁县",
        "贺兰县",
        "灵武市"
      ],
      石嘴山市: [
        "大武口区",
        "惠农区",
        "平罗县"
      ],
      吴忠市: [
        "利通区",
        "红寺堡区",
        "盐池县",
        "同心县",
        "青铜峡市"
      ],
      固原市: [
        "原州区",
        "西吉县",
        "隆德县",
        "泾源县",
        "彭阳县"
      ],
      中卫市: [
        "沙坡头区",
        "中宁县",
        "海原县"
      ]
    },
    新疆维吾尔自治区: {
      乌鲁木齐市: [
        "天山区",
        "沙依巴克区",
        "新市区",
        "水磨沟区",
        "头屯河区",
        "达坂城区",
        "米东区",
        "乌鲁木齐县"
      ],
      克拉玛依市: [
        "独山子区",
        "克拉玛依区",
        "白碱滩区",
        "乌尔禾区"
      ],
      吐鲁番市: [
        "高昌区",
        "鄯善县",
        "托克逊县"
      ],
      哈密市: [
        "伊州区",
        "巴里坤哈萨克自治县",
        "伊吾县"
      ],
      昌吉回族自治州: [
        "昌吉市",
        "阜康市",
        "呼图壁县",
        "玛纳斯县",
        "奇台县",
        "吉木萨尔县",
        "木垒哈萨克自治县"
      ],
      博尔塔拉蒙古自治州: [
        "博乐市",
        "阿拉山口市",
        "精河县",
        "温泉县"
      ],
      巴音郭楞蒙古自治州: [
        "库尔勒市",
        "轮台县",
        "尉犁县",
        "若羌县",
        "且末县",
        "焉耆回族自治县",
        "和静县",
        "和硕县",
        "博湖县"
      ],
      阿克苏地区: [
        "阿克苏市",
        "库车市",
        "温宿县",
        "沙雅县",
        "新和县",
        "拜城县",
        "乌什县",
        "阿瓦提县",
        "柯坪县"
      ],
      克孜勒苏柯尔克孜自治州: [
        "阿图什市",
        "阿克陶县",
        "阿合奇县",
        "乌恰县"
      ],
      喀什地区: [
        "喀什市",
        "疏附县",
        "疏勒县",
        "英吉沙县",
        "泽普县",
        "莎车县",
        "叶城县",
        "麦盖提县",
        "岳普湖县",
        "伽师县",
        "巴楚县",
        "塔什库尔干塔吉克自治县"
      ],
      和田地区: [
        "和田市",
        "和田县",
        "墨玉县",
        "皮山县",
        "洛浦县",
        "策勒县",
        "于田县",
        "民丰县"
      ],
      伊犁哈萨克自治州: [
        "伊宁市",
        "奎屯市",
        "霍尔果斯市",
        "伊宁县",
        "察布查尔锡伯自治县",
        "霍城县",
        "巩留县",
        "新源县",
        "昭苏县",
        "特克斯县",
        "尼勒克县"
      ],
      塔城地区: [
        "塔城市",
        "乌苏市",
        "沙湾市",
        "额敏县",
        "托里县",
        "裕民县",
        "和布克赛尔蒙古自治县"
      ],
      阿勒泰地区: [
        "阿勒泰市",
        "布尔津县",
        "富蕴县",
        "福海县",
        "哈巴河县",
        "青河县",
        "吉木乃县"
      ],
      自治区直辖县级行政区划: [
        "石河子市",
        "阿拉尔市",
        "图木舒克市",
        "五家渠市",
        "北屯市",
        "铁门关市",
        "双河市",
        "可克达拉市",
        "昆玉市",
        "胡杨河市",
        "新星市",
        "白杨市"
      ]
    }
  }, a = (c) => c.map((e) => {
    const n = e.children ? a(e.children) : void 0;
    return {
      value: e.code,
      label: e.name,
      children: n
    };
  });
  a(r);
  const s = a(m), d = {};
  m.forEach((c) => {
    d[c.code] = c.name, c.children.forEach((e) => {
      d[e.code] = e.name, e.children.forEach((n) => {
        d[n.code] = n.name;
      });
    });
  });
  Object.entries(h).map(([c, e]) => ({
    label: c,
    value: c,
    children: e.map((n) => ({
      label: n,
      value: n
    }))
  }));
  Object.entries(i).map(
    ([c, e]) => ({
      label: c,
      value: c,
      children: Object.entries(e).map(([n, l]) => ({
        label: n,
        value: n,
        children: l.map((o) => ({
          label: o,
          value: o
        }))
      }))
    })
  );
  const getRegionLabels = () => {
    const provinces = s.map((province) => province.label);
    const cities = {};
    const districts = {};
    s.forEach((province) => {
      cities[province.label] = province.children.map((city) => city.label);
      province.children.forEach((city) => {
        districts[city.label] = city.children.map((district) => district.label);
      });
    });
    return {
      provinces,
      cities,
      districts
    };
  };
  let regionCache = null;
  const getRegionDataFromCache = () => {
    if (!regionCache) {
      regionCache = getRegionLabels();
    }
    return regionCache;
  };
  const _sfc_main$2 = {
    data() {
      return {
        type: "",
        // 页面类型：normal-普通模式，select-选择模式
        addressList: [],
        formData: {
          recipientName: "",
          phone: "",
          province: "",
          city: "",
          district: "",
          detailAddress: "",
          user_id: null,
          address: ""
        },
        // 用于存储转换后的地区数据
        provinces: s,
        cities: [],
        districts: [],
        selectedProvince: null,
        selectedCity: null,
        selectedDistrict: null
      };
    },
    computed: {
      currentList() {
        switch (this.currentTab) {
          case 0:
            return this.provinces;
          case 1:
            return this.cities;
          case 2:
            return this.districts;
          default:
            return [];
        }
      }
    },
    onShow() {
      this.loadAddressList();
    },
    onLoad(options) {
      this.type = options.type || "normal";
    },
    created() {
      const data = getRegionDataFromCache();
      this.provinces = data.provinces;
    },
    methods: {
      // 加载地址列表
      async loadAddressList() {
        try {
          const userInfo = uni.getStorageSync("userInfo");
          if (!userInfo) {
            uni.showToast({
              title: "请先登录",
              icon: "none"
            });
            return;
          }
          const res = await getAddressList$1(userInfo.userId);
          if (res.code === 1) {
            this.addressList = res.data || [];
          } else {
            uni.showToast({
              title: res.message || "获取地址列表失败",
              icon: "none"
            });
          }
        } catch (e) {
          formatAppLog("error", "at pages/address/address.vue:220", "获取地址列表失败:", e);
          uni.showToast({
            title: "获取地址列表失败",
            icon: "none"
          });
        }
      },
      // 显示地址表单
      showAddressForm() {
        const userInfo = uni.getStorageSync("userInfo");
        if (!userInfo) {
          uni.showToast({
            title: "请先登录",
            icon: "none"
          });
          return;
        }
        this.formData = {
          recipientName: "",
          phone: "",
          province: "",
          city: "",
          district: "",
          detailAddress: "",
          user_id: userInfo.id
        };
        this.provinces = s;
        this.cities = [];
        this.districts = [];
        this.selectedProvince = null;
        this.selectedCity = null;
        this.selectedDistrict = null;
        this.$refs.popup.open();
      },
      // 关闭表单
      closeForm() {
        this.formData = {
          recipientName: "",
          phone: "",
          province: "",
          city: "",
          district: "",
          detailAddress: "",
          user_id: null,
          address: ""
        };
        this.provinces = s;
        this.cities = [];
        this.districts = [];
        this.selectedProvince = null;
        this.selectedCity = null;
        this.selectedDistrict = null;
        this.$refs.popup.close();
      },
      // 显示地区选择器
      showRegionPicker() {
        this.$refs.regionPopup.open();
      },
      // 关闭地区选择器
      closeRegionPicker() {
        this.$refs.regionPopup.close();
      },
      // 选择省份
      selectProvince(province) {
        this.selectedProvince = province;
        this.cities = province.children;
        this.districts = [];
        this.selectedCity = null;
        this.selectedDistrict = null;
      },
      // 选择城市
      selectCity(city) {
        this.selectedCity = city;
        this.districts = city.children;
        this.selectedDistrict = null;
      },
      // 选择区县
      selectDistrict(district) {
        this.selectedDistrict = district;
      },
      // 确认选择
      confirmRegion() {
        if (this.selectedProvince && this.selectedCity && this.selectedDistrict) {
          this.formData.province = this.selectedProvince.label;
          this.formData.city = this.selectedCity.label;
          this.formData.district = this.selectedDistrict.label;
          this.formData.address = `${this.formData.province}${this.formData.city}${this.formData.district}${this.formData.detailAddress || ""}`;
          this.closeRegionPicker();
        } else {
          uni.showToast({
            title: "请选择完整的地区信息",
            icon: "none"
          });
        }
      },
      // 提交表单
      async handleSubmit() {
        try {
          if (!this.validateForm())
            return;
          const userInfo = uni.getStorageSync("userInfo");
          if (!userInfo || !userInfo.id) {
            uni.showToast({
              title: "用户信息异常，请重新登录",
              icon: "none"
            });
            return;
          }
          this.formData.address = `${this.formData.province}${this.formData.city}${this.formData.district}${this.formData.detailAddress}`;
          const submitData = {
            user_id: parseInt(userInfo.id),
            address: this.formData.address,
            phone: this.formData.phone,
            recipient_name: this.formData.recipientName
          };
          const api = this.formData.id ? updateAddress$1 : addAddress$1;
          const res = await api(submitData);
          if (res.code === 1) {
            uni.showToast({
              title: this.formData.id ? "修改成功" : "添加成功",
              icon: "success"
            });
            this.closeForm();
            this.loadAddressList();
          } else {
            uni.showToast({
              title: res.message || (this.formData.id ? "修改失败" : "添加失败"),
              icon: "none"
            });
          }
        } catch (e) {
          formatAppLog("error", "at pages/address/address.vue:370", "保存地址失败:", e);
          uni.showToast({
            title: e.message || "保存失败",
            icon: "none"
          });
        }
      },
      // 表单验证
      validateForm() {
        if (!this.formData.recipientName) {
          uni.showToast({
            title: "请输入收货人姓名",
            icon: "none"
          });
          return false;
        }
        if (!this.formData.phone) {
          uni.showToast({
            title: "请输入手机号码",
            icon: "none"
          });
          return false;
        }
        if (!/^1[3-9]\d{9}$/.test(this.formData.phone)) {
          uni.showToast({
            title: "请输入正确的手机号码",
            icon: "none"
          });
          return false;
        }
        if (!this.formData.province || !this.formData.city || !this.formData.district) {
          uni.showToast({
            title: "请选择所在地区",
            icon: "none"
          });
          return false;
        }
        if (!this.formData.detailAddress) {
          uni.showToast({
            title: "请输入详细地址",
            icon: "none"
          });
          return false;
        }
        return true;
      },
      // 编辑地址
      editAddress(address, event) {
        if (event) {
          event.stopPropagation();
        }
        this.formData = { ...address };
        if (address.province && address.city && address.district) {
          const province = s.find((p) => p.label === address.province);
          if (province) {
            this.selectedProvince = province;
            this.cities = province.children;
            const city = province.children.find((c) => c.label === address.city);
            if (city) {
              this.selectedCity = city;
              this.districts = city.children;
              const district = city.children.find((d2) => d2.label === address.district);
              if (district) {
                this.selectedDistrict = district;
              }
            }
          }
        } else {
          this.provinces = s;
          this.cities = [];
          this.districts = [];
          this.selectedProvince = null;
          this.selectedCity = null;
          this.selectedDistrict = null;
        }
        this.$refs.popup.open();
      },
      // 删除地址
      async handleDelete(id, event) {
        if (event) {
          event.stopPropagation();
        }
        uni.showModal({
          title: "提示",
          content: "确定要删除该地址吗？",
          success: async (res) => {
            if (res.confirm) {
              try {
                const res2 = await deleteAddress$1(id);
                if (res2.code === 1) {
                  uni.showToast({
                    title: "删除成功",
                    icon: "success"
                  });
                  this.loadAddressList();
                } else {
                  uni.showToast({
                    title: res2.message || "删除失败",
                    icon: "none"
                  });
                }
              } catch (e) {
                formatAppLog("error", "at pages/address/address.vue:486", "删除地址失败:", e);
                uni.showToast({
                  title: "删除失败",
                  icon: "none"
                });
              }
            }
          }
        });
      },
      // 修改地址列表项的点击事件
      handleAddressClick(address) {
        if (this.type === "select") {
          const eventChannel = this.getOpenerEventChannel();
          eventChannel.emit("selectAddress", {
            type: "delivery",
            address: {
              recipient_name: address.recipient_name,
              phone: address.phone,
              address: address.address
            }
          });
          uni.navigateBack();
        } else {
          this.editAddress(address);
        }
      }
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_popup = resolveEasycom(vue.resolveDynamicComponent("uni-popup"), __easycom_0);
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 地址列表 "),
      vue.createElementVNode("scroll-view", {
        "scroll-y": "",
        class: "address-list"
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.addressList, (item) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "address-item",
              key: item.id,
              onClick: ($event) => $options.handleAddressClick(item)
            }, [
              vue.createElementVNode("view", { class: "left" }, [
                vue.createElementVNode("text", { class: "iconfont icon-location" })
              ]),
              vue.createElementVNode("view", { class: "info" }, [
                vue.createElementVNode("view", { class: "user-info" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "name" },
                    vue.toDisplayString(item.recipient_name),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "phone" },
                    vue.toDisplayString(item.phone),
                    1
                    /* TEXT */
                  ),
                  item.isDefault ? (vue.openBlock(), vue.createElementBlock("text", {
                    key: 0,
                    class: "mt-label primary"
                  }, "默认")) : vue.createCommentVNode("v-if", true)
                ]),
                vue.createElementVNode(
                  "view",
                  { class: "address" },
                  vue.toDisplayString(item.address),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "right" }, [
                vue.createElementVNode("view", { class: "actions" }, [
                  vue.createElementVNode("text", {
                    class: "edit",
                    onClick: vue.withModifiers(($event) => $options.editAddress(item), ["stop"])
                  }, "编辑", 8, ["onClick"]),
                  vue.createElementVNode("text", {
                    class: "delete",
                    onClick: vue.withModifiers(($event) => $options.handleDelete(item.id), ["stop"])
                  }, "删除", 8, ["onClick"])
                ])
              ])
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      vue.createCommentVNode(" 底部添加按钮 "),
      vue.createElementVNode("view", { class: "mt-bottom-btn" }, [
        vue.createElementVNode("button", {
          class: "mt-btn",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.showAddressForm && $options.showAddressForm(...args))
        }, "+ 新增收货地址")
      ]),
      vue.createCommentVNode(" 地址表单弹窗 "),
      vue.createVNode(
        _component_uni_popup,
        {
          ref: "popup",
          type: "bottom"
        },
        {
          default: vue.withCtx(() => [
            vue.createElementVNode("view", { class: "form-container" }, [
              vue.createElementVNode("view", { class: "form-header" }, [
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString($data.formData.id ? "编辑地址" : "新增地址"),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", {
                  class: "close",
                  onClick: _cache[1] || (_cache[1] = (...args) => $options.closeForm && $options.closeForm(...args))
                }, "关闭")
              ]),
              vue.createElementVNode("view", { class: "form" }, [
                vue.createElementVNode("view", { class: "form-item" }, [
                  vue.createElementVNode("text", { class: "label" }, "收货人"),
                  vue.withDirectives(vue.createElementVNode(
                    "input",
                    {
                      type: "text",
                      "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.formData.recipientName = $event),
                      placeholder: "请输入收货人姓名"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [vue.vModelText, $data.formData.recipientName]
                  ])
                ]),
                vue.createElementVNode("view", { class: "form-item" }, [
                  vue.createElementVNode("text", { class: "label" }, "手机号码"),
                  vue.withDirectives(vue.createElementVNode(
                    "input",
                    {
                      type: "number",
                      "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.formData.phone = $event),
                      placeholder: "请输入手机号码"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [vue.vModelText, $data.formData.phone]
                  ])
                ]),
                vue.createElementVNode("view", { class: "form-item" }, [
                  vue.createElementVNode("text", { class: "label" }, "所在地区"),
                  vue.createElementVNode("view", {
                    class: "picker",
                    onClick: _cache[4] || (_cache[4] = (...args) => $options.showRegionPicker && $options.showRegionPicker(...args))
                  }, [
                    vue.createElementVNode(
                      "text",
                      {
                        class: vue.normalizeClass({ placeholder: !$data.formData.province })
                      },
                      vue.toDisplayString($data.formData.province ? `${$data.formData.province} ${$data.formData.city} ${$data.formData.district}` : "请选择所在地区"),
                      3
                      /* TEXT, CLASS */
                    ),
                    vue.createElementVNode("text", { class: "arrow" }, ">")
                  ])
                ]),
                vue.createElementVNode("view", { class: "form-item" }, [
                  vue.createElementVNode("text", { class: "label" }, "详细地址"),
                  vue.withDirectives(vue.createElementVNode(
                    "textarea",
                    {
                      "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => $data.formData.detailAddress = $event),
                      placeholder: "请输入详细地址"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [vue.vModelText, $data.formData.detailAddress]
                  ])
                ])
              ]),
              vue.createElementVNode("button", {
                class: "submit-btn",
                onClick: _cache[6] || (_cache[6] = (...args) => $options.handleSubmit && $options.handleSubmit(...args))
              }, "保存")
            ])
          ]),
          _: 1
          /* STABLE */
        },
        512
        /* NEED_PATCH */
      ),
      vue.createCommentVNode(" 地区选择弹窗 "),
      vue.createVNode(
        _component_uni_popup,
        {
          ref: "regionPopup",
          type: "bottom"
        },
        {
          default: vue.withCtx(() => [
            vue.createElementVNode("view", { class: "region-picker" }, [
              vue.createElementVNode("view", { class: "region-header" }, [
                vue.createElementVNode("text", {
                  class: "cancel",
                  onClick: _cache[7] || (_cache[7] = (...args) => $options.closeRegionPicker && $options.closeRegionPicker(...args))
                }, "取消"),
                vue.createElementVNode("text", { class: "title" }, "选择地区"),
                vue.createElementVNode("text", {
                  class: "confirm",
                  onClick: _cache[8] || (_cache[8] = (...args) => $options.confirmRegion && $options.confirmRegion(...args))
                }, "确定")
              ]),
              vue.createElementVNode("view", { class: "region-content" }, [
                vue.createCommentVNode(" 省份列表 "),
                vue.createElementVNode("scroll-view", {
                  "scroll-y": "",
                  class: "region-column"
                }, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($data.provinces, (item) => {
                      return vue.openBlock(), vue.createElementBlock("view", {
                        class: vue.normalizeClass(["region-item", { active: $data.selectedProvince && $data.selectedProvince.value === item.value }]),
                        key: item.value,
                        onClick: ($event) => $options.selectProvince(item)
                      }, vue.toDisplayString(item.label), 11, ["onClick"]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ]),
                vue.createCommentVNode(" 城市列表 "),
                vue.createElementVNode("scroll-view", {
                  "scroll-y": "",
                  class: "region-column"
                }, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($data.cities, (item) => {
                      return vue.openBlock(), vue.createElementBlock("view", {
                        class: vue.normalizeClass(["region-item", { active: $data.selectedCity && $data.selectedCity.value === item.value }]),
                        key: item.value,
                        onClick: ($event) => $options.selectCity(item)
                      }, vue.toDisplayString(item.label), 11, ["onClick"]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ]),
                vue.createCommentVNode(" 区县列表 "),
                vue.createElementVNode("scroll-view", {
                  "scroll-y": "",
                  class: "region-column"
                }, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($data.districts, (item) => {
                      return vue.openBlock(), vue.createElementBlock("view", {
                        class: vue.normalizeClass(["region-item", { active: $data.selectedDistrict && $data.selectedDistrict.value === item.value }]),
                        key: item.value,
                        onClick: ($event) => $options.selectDistrict(item)
                      }, vue.toDisplayString(item.label), 11, ["onClick"]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ])
            ])
          ]),
          _: 1
          /* STABLE */
        },
        512
        /* NEED_PATCH */
      )
    ]);
  }
  const PagesAddressAddress = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$2], ["__file", "C:/Users/shiba/Desktop/情趣用品/qingqu/pages/address/address.vue"]]);
  const _sfc_main$1 = {
    data() {
      return {
        orderId: "",
        amount: "0.00",
        paymentSuccess: false,
        queryCount: 0,
        maxQueryCount: 60,
        payTimer: null,
        orderInfo: null
        // 保存订单信息
      };
    },
    computed: {
      statusText() {
        return this.paymentSuccess ? "支付成功" : "等待支付结果";
      }
    },
    onLoad(options) {
      if (options.orderId && options.amount) {
        this.orderId = options.orderId;
        this.amount = options.amount;
        this.startQueryPayStatus();
      } else {
        uni.showToast({
          title: "参数错误",
          icon: "none"
        });
        setTimeout(() => {
          this.goBack();
        }, 1500);
      }
    },
    onUnload() {
      this.stopQueryPayStatus();
    },
    methods: {
      // 开始查询支付状态
      startQueryPayStatus() {
        if (!this.orderId) {
          formatAppLog("error", "at pages/payment/result.vue:66", "没有订单ID，无法查询支付状态");
          return;
        }
        this.queryCount = 0;
        this.queryPayStatus();
      },
      // 查询支付状态
      async queryPayStatus() {
        try {
          formatAppLog("log", "at pages/payment/result.vue:76", "查询订单状态:", this.orderId);
          const res = await queryPayStatus(this.orderId);
          formatAppLog("log", "at pages/payment/result.vue:78", "支付状态查询结果:", res);
          if (res.code === 1 && res.data) {
            this.orderInfo = res.data;
            if (res.data.status === "1") {
              this.paymentSuccess = true;
              this.stopQueryPayStatus();
              uni.showToast({
                title: "支付成功",
                icon: "success"
              });
              return;
            }
            if (res.data.code === 1) {
              try {
                const notifyRes = await notifyPayment({
                  trade_no: res.data.trade_no,
                  out_trade_no: res.data.out_trade_no,
                  type: res.data.type,
                  pid: res.data.pid,
                  name: res.data.name,
                  money: res.data.money,
                  status: res.data.status
                });
                formatAppLog("log", "at pages/payment/result.vue:109", "支付通知结果:", notifyRes);
                if (notifyRes === "success") {
                  this.queryPayStatus();
                  return;
                }
              } catch (notifyError) {
                formatAppLog("error", "at pages/payment/result.vue:117", "调用支付通知接口失败:", notifyError);
              }
            }
          }
          this.queryCount++;
          if (this.queryCount < this.maxQueryCount) {
            this.payTimer = setTimeout(() => {
              this.queryPayStatus();
            }, 3e3);
          } else {
            this.stopQueryPayStatus();
            uni.showModal({
              title: "支付超时",
              content: "是否继续查询支付结果?",
              success: (result) => {
                if (result.confirm) {
                  this.startQueryPayStatus();
                }
              }
            });
          }
        } catch (e) {
          formatAppLog("error", "at pages/payment/result.vue:142", "查询支付状态失败:", e);
          this.queryCount++;
          if (this.queryCount < this.maxQueryCount) {
            this.payTimer = setTimeout(() => {
              this.queryPayStatus();
            }, 3e3);
          }
        }
      },
      // 停止查询
      stopQueryPayStatus() {
        if (this.payTimer) {
          clearTimeout(this.payTimer);
          this.payTimer = null;
        }
      },
      // 手动检查支付状态
      checkPaymentStatus() {
        this.startQueryPayStatus();
      },
      // 跳转到订单列表
      goToOrderList() {
        uni.redirectTo({
          url: "/pages/order/list"
        });
      },
      // 返回
      goBack() {
        uni.navigateBack();
      }
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "payment-status" }, [
        vue.createElementVNode("view", { class: "status-icon" }, [
          vue.createElementVNode(
            "text",
            {
              class: vue.normalizeClass(["iconfont", $data.paymentSuccess ? "icon-success" : "icon-loading"])
            },
            null,
            2
            /* CLASS */
          )
        ]),
        vue.createElementVNode(
          "view",
          { class: "status-text" },
          vue.toDisplayString($options.statusText),
          1
          /* TEXT */
        ),
        vue.createElementVNode(
          "view",
          { class: "amount" },
          "￥" + vue.toDisplayString($data.amount),
          1
          /* TEXT */
        )
      ]),
      vue.createElementVNode("view", { class: "actions" }, [
        !$data.paymentSuccess ? (vue.openBlock(), vue.createElementBlock("button", {
          key: 0,
          class: "btn primary",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.checkPaymentStatus && $options.checkPaymentStatus(...args))
        }, "重新查询")) : vue.createCommentVNode("v-if", true),
        $data.paymentSuccess ? (vue.openBlock(), vue.createElementBlock("button", {
          key: 1,
          class: "btn",
          onClick: _cache[1] || (_cache[1] = (...args) => $options.goToOrderList && $options.goToOrderList(...args))
        }, "查看订单")) : vue.createCommentVNode("v-if", true),
        vue.createElementVNode("button", {
          class: "btn",
          onClick: _cache[2] || (_cache[2] = (...args) => $options.goBack && $options.goBack(...args))
        }, "返回")
      ])
    ]);
  }
  const PagesPaymentResult = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render$1], ["__file", "C:/Users/shiba/Desktop/情趣用品/qingqu/pages/payment/result.vue"]]);
  __definePage("pages/mall/mall", PagesMallMall);
  __definePage("pages/category/category", PagesCategoryCategory);
  __definePage("pages/cart/cart", PagesCartCart);
  __definePage("pages/user/user", PagesUserUser);
  __definePage("pages/login/login", PagesLoginLogin);
  __definePage("pages/register/register", PagesRegisterRegister);
  __definePage("pages/product/detail", PagesProductDetail);
  __definePage("pages/order/list", PagesOrderList);
  __definePage("pages/order/detail", PagesOrderDetail);
  __definePage("pages/reset-password/reset-password", PagesResetPasswordResetPassword);
  __definePage("pages/order/create", PagesOrderCreate);
  __definePage("pages/address/list", PagesAddressList);
  __definePage("pages/address/edit", PagesAddressEdit);
  __definePage("pages/payment/index", PagesPaymentIndex);
  __definePage("pages/search/search", PagesSearchSearch);
  __definePage("pages/about/about", PagesAboutAbout);
  __definePage("pages/user/settings", PagesUserSettings);
  __definePage("pages/user/profile", PagesUserProfile);
  __definePage("pages/address/address", PagesAddressAddress);
  __definePage("pages/payment/result", PagesPaymentResult);
  const configProviderContextKey = Symbol();
  const namespaceContextKey = Symbol("namespaceContextKey");
  function fromPairs(pairs) {
    var index = -1, length = pairs == null ? 0 : pairs.length, result = {};
    while (++index < length) {
      var pair = pairs[index];
      result[pair[0]] = pair[1];
    }
    return result;
  }
  class ElementPlusError extends Error {
    constructor(m2) {
      super(m2);
      this.name = "ElementPlusError";
    }
  }
  function debugWarn(scope, message) {
    {
      const error = shared.isString(scope) ? new ElementPlusError(`[${scope}] ${message}`) : scope;
      formatAppLog("warn", "at node_modules/element-plus/es/utils/error.mjs:15", error);
    }
  }
  vue.ref(0);
  const zIndexContextKey = Symbol("zIndexContextKey");
  const localeContextKey = Symbol("localeContextKey");
  const epPropKey = "__epPropKey";
  const definePropType = (val) => val;
  const isEpProp = (val) => shared.isObject(val) && !!val[epPropKey];
  const buildProp = (prop, key) => {
    if (!shared.isObject(prop) || isEpProp(prop))
      return prop;
    const { values, required, default: defaultValue, type, validator } = prop;
    const _validator = values || validator ? (val) => {
      let valid = false;
      let allowedValues = [];
      if (values) {
        allowedValues = Array.from(values);
        if (shared.hasOwn(prop, "default")) {
          allowedValues.push(defaultValue);
        }
        valid || (valid = allowedValues.includes(val));
      }
      if (validator)
        valid || (valid = validator(val));
      if (!valid && allowedValues.length > 0) {
        const allowValuesText = [...new Set(allowedValues)].map((value) => JSON.stringify(value)).join(", ");
        vue.warn(`Invalid prop: validation failed${key ? ` for prop "${key}"` : ""}. Expected one of [${allowValuesText}], got value ${JSON.stringify(val)}.`);
      }
      return valid;
    } : void 0;
    const epProp = {
      type,
      required: !!required,
      validator: _validator,
      [epPropKey]: true
    };
    if (shared.hasOwn(prop, "default"))
      epProp.default = defaultValue;
    return epProp;
  };
  const buildProps = (props) => fromPairs(Object.entries(props).map(([key, option]) => [
    key,
    buildProp(option, key)
  ]));
  const componentSizes = ["", "default", "small", "large"];
  const useSizeProp = buildProp({
    type: String,
    values: componentSizes,
    required: false
  });
  const SIZE_INJECTION_KEY = Symbol("size");
  const emptyValuesContextKey = Symbol("emptyValuesContextKey");
  const useEmptyValuesProps = buildProps({
    emptyValues: Array,
    valueOnClear: {
      type: [String, Number, Boolean, Function],
      default: void 0,
      validator: (val) => shared.isFunction(val) ? !val() : !val
    }
  });
  const keysOf = (arr) => Object.keys(arr);
  const globalConfig = vue.ref();
  function useGlobalConfig(key, defaultValue = void 0) {
    const config = vue.getCurrentInstance() ? vue.inject(configProviderContextKey, globalConfig) : globalConfig;
    if (key) {
      return vue.computed(() => {
        var _a, _b;
        return (_b = (_a = config.value) == null ? void 0 : _a[key]) != null ? _b : defaultValue;
      });
    } else {
      return config;
    }
  }
  const provideGlobalConfig = (config, app, global = false) => {
    var _a;
    const inSetup = !!vue.getCurrentInstance();
    const oldConfig = inSetup ? useGlobalConfig() : void 0;
    const provideFn = (_a = app == null ? void 0 : app.provide) != null ? _a : inSetup ? vue.provide : void 0;
    if (!provideFn) {
      debugWarn("provideGlobalConfig", "provideGlobalConfig() can only be used inside setup().");
      return;
    }
    const context = vue.computed(() => {
      const cfg = vue.unref(config);
      if (!(oldConfig == null ? void 0 : oldConfig.value))
        return cfg;
      return mergeConfig(oldConfig.value, cfg);
    });
    provideFn(configProviderContextKey, context);
    provideFn(localeContextKey, vue.computed(() => context.value.locale));
    provideFn(namespaceContextKey, vue.computed(() => context.value.namespace));
    provideFn(zIndexContextKey, vue.computed(() => context.value.zIndex));
    provideFn(SIZE_INJECTION_KEY, {
      size: vue.computed(() => context.value.size || "")
    });
    provideFn(emptyValuesContextKey, vue.computed(() => ({
      emptyValues: context.value.emptyValues,
      valueOnClear: context.value.valueOnClear
    })));
    if (global || !globalConfig.value) {
      globalConfig.value = context.value;
    }
    return context;
  };
  const mergeConfig = (a2, b) => {
    const keys = [.../* @__PURE__ */ new Set([...keysOf(a2), ...keysOf(b)])];
    const obj = {};
    for (const key of keys) {
      obj[key] = b[key] !== void 0 ? b[key] : a2[key];
    }
    return obj;
  };
  const withInstall = (main, extra) => {
    main.install = (app) => {
      for (const comp of [main, ...Object.values(extra != null ? extra : {})]) {
        app.component(comp.name, comp);
      }
    };
    if (extra) {
      for (const [key, comp] of Object.entries(extra)) {
        main[key] = comp;
      }
    }
    return main;
  };
  const configProviderProps = buildProps({
    a11y: {
      type: Boolean,
      default: true
    },
    locale: {
      type: definePropType(Object)
    },
    size: useSizeProp,
    button: {
      type: definePropType(Object)
    },
    experimentalFeatures: {
      type: definePropType(Object)
    },
    keyboardNavigation: {
      type: Boolean,
      default: true
    },
    message: {
      type: definePropType(Object)
    },
    zIndex: Number,
    namespace: {
      type: String,
      default: "el"
    },
    ...useEmptyValuesProps
  });
  const messageConfig = {};
  const ConfigProvider = vue.defineComponent({
    name: "ElConfigProvider",
    props: configProviderProps,
    setup(props, { slots }) {
      vue.watch(() => props.message, (val) => {
        Object.assign(messageConfig, val != null ? val : {});
      }, { immediate: true, deep: true });
      const config = provideGlobalConfig(props);
      return () => vue.renderSlot(slots, "default", { config: config == null ? void 0 : config.value });
    }
  });
  const ElConfigProvider = withInstall(ConfigProvider);
  const _sfc_main = {
    components: {
      ElConfigProvider
    },
    setup() {
      const zhCn = vue.ref(null);
      return {
        zhCn
      };
    },
    data() {
      return {
        // 用户相关
        user: null,
        // 当前登录用户信息
        token: "",
        // 用户登录token
        // 购物车相关
        cartCount: 0,
        // 购物车商品数量
        cartList: [],
        // 购物车列表
        // 订单相关 
        orderList: [],
        // 订单列表
        currentOrder: null,
        // 当前订单
        // 商品相关
        productList: [],
        // 商品列表
        currentProduct: null,
        // 当前商品详情
        // 分类相关
        categoryList: [],
        // 分类列表
        // 地址相关
        addressList: [],
        // 用户地址列表
        currentAddress: null,
        // 当前选中地址
        // 支付相关
        paymentList: [],
        // 支付记录列表
        // 全局loading
        loading: false,
        // 全局消息提示
        message: "",
        messageType: "success"
        // success/warning/error
      };
    },
    onLaunch: function() {
      formatAppLog("log", "at App.vue:59", "App Launch");
      const systemInfo = uni.getSystemInfoSync();
      const statusBarHeight = systemInfo.statusBarHeight;
      document.documentElement.style.setProperty("--status-bar-height", `${statusBarHeight}px`);
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:66", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:69", "App Hide");
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_router_view = vue.resolveComponent("router-view");
    const _component_el_config_provider = vue.resolveComponent("el-config-provider");
    return vue.openBlock(), vue.createBlock(_component_el_config_provider, { locale: $setup.zhCn }, {
      default: vue.withCtx(() => [
        vue.createVNode(_component_router_view)
      ]),
      _: 1
      /* STABLE */
    }, 8, ["locale"]);
  }
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["__file", "C:/Users/shiba/Desktop/情趣用品/qingqu/App.vue"]]);
  const routeInterceptor = {
    invoke(args) {
      const url = args.url.split("?")[0];
      if (whiteList.includes(url)) {
        return true;
      }
      const token = uni.getStorageSync("token");
      if (!token) {
        uni.showToast({
          title: "请先登录",
          icon: "none"
        });
        uni.redirectTo({
          url: "/pages/login/login"
        });
        return false;
      }
      return true;
    }
  };
  uni.addInterceptor("navigateTo", routeInterceptor);
  uni.addInterceptor("switchTab", routeInterceptor);
  function createApp() {
    const app = vue.createVueApp(App);
    app.config.errorHandler = (err, vm, info) => {
      formatAppLog("error", "at main.js:41", "Global Error:", err);
    };
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue, uni.VueShared);
