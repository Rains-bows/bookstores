package com.example.oldproject.Config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "epay")
public class EpayConfig {
    private String apiurl = "https://pay.guur.cn/";
    private String pid;
    private String key;
    private String notifyUrl;
    private String returnUrl;
    private String sitename;
    
    // getters and setters
    public String getApiurl() { return apiurl; }
    public void setApiurl(String apiurl) { this.apiurl = apiurl; }
    public String getPid() { return pid; }
    public void setPid(String pid) { this.pid = pid; }
    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }
    public String getNotifyUrl() { return notifyUrl; }
    public void setNotifyUrl(String notifyUrl) { this.notifyUrl = notifyUrl; }
    public String getReturnUrl() { return returnUrl; }
    public void setReturnUrl(String returnUrl) { this.returnUrl = returnUrl; }
    public String getSitename() { return sitename; }
    public void setSitename(String sitename) { this.sitename = sitename; }
} 