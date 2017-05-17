//
//  PlayersModel.h
//  SeaBattle
//
//  Created by begoss on 2017/5/17.
//  Copyright © 2017年 begoss. All rights reserved.
//

#import <Foundation/Foundation.h>

@class PlayersModelResult;

@interface PlayersModel : NSObject

@property (nonatomic, copy) NSString *msg;

@property (nonatomic, copy) NSString *status;

@property (nonatomic, strong) PlayersModelResult *result;

@end

@interface PlayersModelResult : NSObject

@property (nonatomic, strong) NSArray <NSString *> *players;

@end
