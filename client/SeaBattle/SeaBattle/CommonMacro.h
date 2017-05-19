//
//  CommonMacro.h
//  SeaBattle
//
//  Created by begoss on 2017/5/13.
//  Copyright © 2017年 begoss. All rights reserved.
//

#ifndef CommonMacro_h
#define CommonMacro_h

//Screen
#define SCREEN_WIDTH [UIScreen mainScreen].bounds.size.width
#define SCREEN_HEIGHT [UIScreen mainScreen].bounds.size.height

//Color
#define Color(R,G,B)   [UIColor colorWithRed:R/255.0 green:G/255.0 blue:B/255.0 alpha:1]
#define ColorWithAlpha(R,G,B,A)   [UIColor colorWithRed:R/255.0 green:G/255.0 blue:B/255.0 alpha:A]

//Font
#define Font(S)         [UIFont systemFontOfSize:S]
#define MediumFont(S)   ([[[UIDevice currentDevice] systemVersion] floatValue] >= 8.2)?[UIFont systemFontOfSize:S weight:UIFontWeightMedium]:[UIFont boldSystemFontOfSize:S]
#define BoldFont(S)     [UIFont boldSystemFontOfSize:S]

//Game Config
#define BOARD_SIZE 6
#define SHIP_LIFE 5

//Cell State
#define STATE_EMPTY 0
#define STATE_DEPLOYING 1
#define STATE_DEPLOYED 2
#define STATE_DESTROYED 3
#define STATE_NO_SHIP 4
#define STATE_HAS_ENEMYSHIP 5

//User Check
#define KEY_ROOM_ID @"key_room_id"
#define KEY_NICKNAME @"key_nickname"
#define KEY_PASSWORD @"key_password"
#define NICKNAME [[NSUserDefaults standardUserDefaults] objectForKey:KEY_NICKNAME]
#define ROOM_ID [[NSUserDefaults standardUserDefaults] objectForKey:KEY_ROOM_ID]
#define PASSWORD [[NSUserDefaults standardUserDefaults] objectForKey:KEY_PASSWORD]

#endif /* CommonMacro_h */
