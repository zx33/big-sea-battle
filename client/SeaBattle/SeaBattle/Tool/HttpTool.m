//
//  HttpTool.m
//  SpeechFrameWork
//
//  Created by begoss on 2017/4/11.
//  Copyright © 2017年 begoss. All rights reserved.
//

#import "HttpTool.h"
#import "AFNetworking.h"

@implementation AFHttpClient

+ (instancetype)sharedClient {
    static AFHttpClient *client = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        client = [AFHttpClient manager];
        client.responseSerializer = [AFJSONResponseSerializer serializer];
        //        client.requestSerializer = [AFJSONRequestSerializer serializer];
        client.responseSerializer.acceptableContentTypes = [NSSet setWithObjects:@"application/json",@"text/html", @"text/json", @"text/javascript",@"text/plain",@"image/gif", nil];
        client.securityPolicy = [AFSecurityPolicy policyWithPinningMode:AFSSLPinningModeNone];
        [client.requestSerializer setValue:@"zh-cn" forHTTPHeaderField:@"Accept-Language"];
        [client.requestSerializer setValue:@"Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.118 Safari/537.36 ApiMaxJia/1.0" forHTTPHeaderField:@"User-Agent"];
        client.requestSerializer.timeoutInterval = 20;
    });
    
    if (![PASSWORD isEqualToString:@"0"]) {
        NSString *cookieStr = [NSString stringWithFormat:@"room_id=%@;nickname=%@;password=%@",ROOM_ID,NICKNAME,PASSWORD];
        cookieStr = [cookieStr stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
        NSLog(@"Cookies:%@",cookieStr);
        [client.requestSerializer setValue:cookieStr forHTTPHeaderField:@"Cookie"];
    }
    
    return client;
}

@end

@implementation HttpTool


+ (void)getWithPath:(NSString *)path
             params:(NSDictionary *)params
            success:(HttpSuccessBlock)success
            failure:(HttpFailureBlock)failure {
    AFHttpClient *manager = [AFHttpClient sharedClient];
    NSLog(@"url=%@, params=%@",  path, params);
    [manager GET:path parameters:params success:^(NSURLSessionDataTask *task, id JSON) {
        if (success == nil)
            return;
        success(JSON);
    } failure:^(NSURLSessionDataTask *task, NSError *error) {
        
        if (failure == nil) return;
        failure(error);
        
    }];
    
}

#pragma mark - POST请求
+ (void)postWithPath:(NSString *)path
              params:(NSDictionary *)params
             success:(HttpSuccessBlock)success
             failure:(HttpFailureBlock)failure {
    AFHttpClient *manager = [AFHttpClient sharedClient];
    NSLog(@"%@%@",path,params);
    [manager POST:path parameters:params success:^(NSURLSessionDataTask *task, id JSON) {
        
        if (success == nil) return;
        success(JSON);
        
    } failure:^(NSURLSessionDataTask *task, NSError *error) {
        if (failure == nil) return;
        failure(error);
        
    }];
}
#pragma mark - POST请求
+ (NSURLSessionDataTask *)postSessionTaskWithPath:(NSString *)path
                                           params:(NSDictionary *)params
                                          success:(HttpSuccessBlock)success
                                          failure:(HttpFailureBlock)failure {
    AFHttpClient *manager = [AFHttpClient sharedClient];
    NSLog(@"%@%@",path,params);
    return [manager POST:path parameters:params success:^(NSURLSessionDataTask *task, id JSON) {
        
        if (success == nil) return;
        success(JSON);
        
    } failure:^(NSURLSessionDataTask *task, NSError *error) {
        if (failure == nil) return;
        failure(error);
        
    }];
}
#pragma mark - 下载文件
+ (NSURLSessionDownloadTask *)downloadWithPath:(NSString *)path
                                      progress:(ProgressBlock)progress
                                   destination:(DestinationBlock)destination
                             completionHandler:(CompletionHandler)handler
                                       failure:(DownloadFailureBlock)failure {
    AFHttpClient *manager = [AFHttpClient sharedClient];
    NSLog(@"downloadUrl=%@",  path);
    NSURL *URL = [NSURL URLWithString:path];
    NSURLRequest *request = [NSURLRequest requestWithURL:URL];
    NSURLSessionDownloadTask *downloadTask;
    downloadTask = [manager downloadTaskWithRequest:request progress:^(NSProgress * _Nonnull downloadProgress) {
        progress(downloadProgress);
    } destination:^NSURL * _Nonnull(NSURL * _Nonnull targetPath, NSURLResponse * _Nonnull response) {
        return destination(response);
    } completionHandler:^(NSURLResponse * _Nonnull response, NSURL * _Nullable filePath, NSError * _Nullable error) {
        if (!error) {
            handler(filePath);
        }else {
            NSLog(@"%@ download failed",response.suggestedFilename);
            failure(filePath);
        }
    }];
    return  downloadTask;
}

@end

