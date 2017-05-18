//
//  HttpTool.h
//  SpeechFrameWork
//
//  Created by begoss on 2017/4/11.
//  Copyright © 2017年 begoss. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "AFNetworking.h"


typedef NS_ENUM(NSInteger, RequestMethodType){
    RequestMethodTypePost = 1,
    RequestMethodTypeGet = 2
};

@interface AFHttpClient : AFHTTPSessionManager

+ (instancetype)sharedClient;

@end

typedef void(^HttpSuccessBlock)(id JSON);
typedef void(^HttpFailureBlock)(NSError *error);
typedef void(^ProgressBlock)(NSProgress *downloadProgress);
typedef NSURL *(^DestinationBlock)(NSURLResponse *response);
typedef void(^CompletionHandler)(NSURL *filePath);
typedef void(^DownloadFailureBlock)(NSURL *filePath);

@interface HttpTool : NSObject

/**
 *  AFN get请求
 *
 *  @param path URL地址
 *
 *  @param params 请求参数 (NSDictionary)
 *
 *  @param success 请求成功返回值（NSArray or NSDictionary）
 *
 *  @param failure 请求失败值 (NSError)
 */
+ (void)getWithPath:(NSString *)path
             params:(NSDictionary *)params
            success:(HttpSuccessBlock)success
            failure:(HttpFailureBlock)failure;

/**
 *  AFN post请求
 *
 *  @param path URL地址
 *
 *  @param params 请求参数 (NSDictionary)
 *
 *  @param success 请求成功返回值（NSArray or NSDictionary）
 *
 *  @param failure 请求失败值 (NSError)
 */
+ (void)postWithPath:(NSString *)path
              params:(NSDictionary *)params
             success:(HttpSuccessBlock)success
             failure:(HttpFailureBlock)failure;

+ (NSURLSessionDataTask *)postSessionTaskWithPath:(NSString *)path
                                           params:(NSDictionary *)params
                                          success:(HttpSuccessBlock)success
                                          failure:(HttpFailureBlock)failure;

@end
