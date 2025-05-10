package com.example.oldproject.Util;

public class ApiResponse<T> {

    // 状态码，0 失败，1 成功
    private int code;

    // 返回消息，成功或失败的描述
    private String message;

    // 泛型数据，可以是任意类型的返回数据
    private T data;

    // 无参构造方法
    public ApiResponse() {}

    // 带参构造方法
    public ApiResponse(int code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    // 返回成功的结果
    public static <T> ApiResponse<T> success(T data) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setCode(1);
        response.setMessage("success");
        response.setData(data);
        return response;
    }

    // 返回失败的结果
    public static <T> ApiResponse<T> failure(String message) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setCode(0);
        response.setMessage(message);
        return response;
    }

    // Getter 和 Setter 方法
    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    @Override
    public String toString() {
        return "ApiResponse{" +
                "code=" + code +
                ", message='" + message + '\'' +
                ", data=" + data +
                '}';
    }
}
