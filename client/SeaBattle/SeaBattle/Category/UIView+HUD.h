//
//  UIView+HUD.h
//  Max+
//
//  Created by 郭源 on 15/10/29.
//  Copyright © 2015年 dotamax. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface UIView (HUD)

- (void)showAlertTitle:(NSString *)title;
- (void)showAlertTitle:(NSString *)title duration:(CGFloat)duration;
- (void)showBadtipsAlert:(NSString *)title duration:(CGFloat)duration;
- (void)showGoodtipsAlert:(NSString *)title duration:(CGFloat)duration;
- (void)showGoodtipsAlert:(NSString *)title;
- (void)showBadtipsAlert:(NSString *)title ;
@end
