package com.example.oldproject.Controller;

import com.example.oldproject.Service.Impl.SystemAnalysisServiceImpl;
import com.example.oldproject.Util.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/system/analysis")
public class SystemAnalysisController {

    @Autowired
    private SystemAnalysisServiceImpl systemAnalysisService;

    @GetMapping("/device")
    public ApiResponse<Map<String, Object>> getDeviceAnalysis(
            @RequestParam(required = false) Integer days) {
        return ApiResponse.success(systemAnalysisService.analyzeDeviceUsage(days));
    }

    @GetMapping("/location")
    public ApiResponse<Map<String, Object>> getLocationAnalysis(
            @RequestParam(required = false) Integer days) {
        return ApiResponse.success(systemAnalysisService.analyzeLocation(days));
    }

    @GetMapping("/purchase")
    public ApiResponse<Map<String, Object>> getPurchaseAnalysis(
            @RequestParam(required = false) Integer days) {
        return ApiResponse.success(systemAnalysisService.analyzePurchase(days));
    }

    @GetMapping("/login")
    public ApiResponse<Map<String, Object>> getLoginAnalysis(
            @RequestParam(required = false) Integer days) {
        return ApiResponse.success(systemAnalysisService.analyzeLogin(days));
    }

    @GetMapping("/user-activity")
    public ApiResponse<Map<String, Object>> getUserActivityAnalysis(
            @RequestParam(required = false) Integer days) {
        return ApiResponse.success(systemAnalysisService.analyzeUserActivity(days));
    }
}