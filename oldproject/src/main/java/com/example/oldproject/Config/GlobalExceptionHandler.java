package com.example.oldproject.Config;//package com.oldpro.Config;
//
//import com.oldpro.Util.ApiResponse;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.ExceptionHandler;
//import org.springframework.web.bind.annotation.ControllerAdvice;
//
//
//import jakarta.servlet.http.HttpServletRequest; // Jakarta EE 改变了包名
//
//@ControllerAdvice  // 表示这是一个全局异常处理器
//public class GlobalExceptionHandler {
//
//
//    // 处理系统异常
//    @ExceptionHandler(Exception.class)
//    public ResponseEntity<ApiResponse<String>> handleException(Exception ex, HttpServletRequest request) {
//        ApiResponse<String> response = new ApiResponse<>(0, "系统异常，请稍后重试", null);
//        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
//    }
//
//    // 处理特定的异常 (例如空指针异常)
//    @ExceptionHandler(NullPointerException.class)
//    public ResponseEntity<ApiResponse<String>> handleNullPointerException(NullPointerException ex, HttpServletRequest request) {
//        ApiResponse<String> response = new ApiResponse<>(0, "请求的资源不存在", null);
//        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
//    }
//
//    // 捕获所有类型的异常，返回统一的错误信息
//    @ExceptionHandler(Throwable.class)
//    public ResponseEntity<ApiResponse<String>> handleThrowable(Throwable ex, HttpServletRequest request) {
//        ApiResponse<String> response = new ApiResponse<>(0, "未知错误，请稍后重试", null);
//        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
//    }
//
//    @ExceptionHandler(RuntimeException.class)
//    public ResponseEntity<?> handleRuntimeException(RuntimeException ex) {
//        if (ex.getMessage().equals("用户未登录")) {
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
//                .body(ApiResponse.failure("用户未登录或登录已过期"));
//        }
//        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                .body(ApiResponse.failure("服务器内部错误"));
//    }
//
//}
