//
//  ApiConfig.m
//  SeaBattle
//
//  Created by begoss on 2017/5/13.
//  Copyright © 2017年 begoss. All rights reserved.
//

#import "ApiConfig.h"

@implementation ApiConfig

+ (NSString *)API_CREATE_NEW_GAME {
    return [NSString stringWithFormat:@"%@:%@%@", SB_HOST, SB_PORT, @"/2.0/new_game"];
}

+ (NSString *)API_JOIN_GAME {
    return [NSString stringWithFormat:@"%@:%@%@", SB_HOST, SB_PORT, @"/2.0/join_game"];
}

+ (NSString *)API_SET_MAP {
    return [NSString stringWithFormat:@"%@:%@%@", SB_HOST, SB_PORT, @"/2.0/set_map"];
}

+ (NSString *)API_CURR_OP_CNT {
    return [NSString stringWithFormat:@"%@:%@%@", SB_HOST, SB_PORT, @"/2.0/curr_op_cnt"];
}

+ (NSString *)API_SET_OP {
    return [NSString stringWithFormat:@"%@:%@%@", SB_HOST, SB_PORT, @"/2.0/set_op"];
}

+ (NSString *)API_GET_OP {
    return [NSString stringWithFormat:@"%@:%@%@", SB_HOST, SB_PORT, @"/2.0/get_op"];
}

+ (NSString *)API_GET_STATUS {
    return [NSString stringWithFormat:@"%@:%@%@", SB_HOST, SB_PORT, @"/2.0/get_status"];
}

+ (NSString *)API_GET_PLAYERS {
    return [NSString stringWithFormat:@"%@:%@%@", SB_HOST, SB_PORT, @"/2.0/get_players"];
}

+ (NSString *)API_GET_TIPS {
    return [NSString stringWithFormat:@"%@:%@%@", SB_HOST, SB_PORT, @"/2.0/get_tips"];
}

+ (NSString *)API_GET_WINNER {
    return [NSString stringWithFormat:@"%@:%@%@", SB_HOST, SB_PORT, @"/2.0/get_winner"];
}

+ (NSString *)API_GUESS {
    return [NSString stringWithFormat:@"%@:%@%@", SB_HOST, SB_PORT, @"/2.0/guess"];
}

@end
