//
//  UIView+HUD.m
//  Max+
//
//  Created by 郭源 on 15/10/29.
//  Copyright © 2015年 dotamax. All rights reserved.
//

#import "UIView+HUD.h"
#import <MBProgressHUD.h>

@implementation UIView (HUD)

- (void)showAlertTitle:(NSString *)title {
    MBProgressHUD *HUD = [[MBProgressHUD alloc] initWithView:self];
    [self addSubview:HUD];
    HUD.labelText = title;
    HUD.mode = MBProgressHUDModeText;
    
    HUD.cornerRadius = 5;
    HUD.square = NO;
    HUD.margin = 7;
    HUD.minSize = CGSizeMake(200, 0);
    HUD.labelFont = Font(15);
    HUD.minShowTime = 0.5;
    HUD.color = [UIColor colorWithRed:46/255.0 green:56/255.0 blue:66/255.0 alpha:0.95];
    [HUD showAnimated:YES whileExecutingBlock:^{} completionBlock:^{
        [HUD removeFromSuperview];
    }];

}

- (void)showAlertTitle:(NSString *)title duration:(CGFloat)duration{
    MBProgressHUD *HUD = [[MBProgressHUD alloc] initWithView:self];
    [self addSubview:HUD];
    HUD.labelText = title;
    HUD.mode = MBProgressHUDModeText;
    
    HUD.cornerRadius = 5;
    HUD.square = NO;
    HUD.margin = 7;
    HUD.minSize = CGSizeMake(200, 0);
    HUD.labelFont = Font(15);
    HUD.minShowTime = duration;
    HUD.color = [UIColor colorWithRed:46/255.0 green:56/255.0 blue:66/255.0 alpha:0.95];
    [HUD showAnimated:YES whileExecutingBlock:^{} completionBlock:^{
        [HUD removeFromSuperview];
    }];
}
- (void)showGoodtipsAlert:(NSString *)title {
    [self showGoodtipsAlert:title duration:1.2];
}
- (void)showBadtipsAlert:(NSString *)title  {
    [self showBadtipsAlert:title duration:1.2];
}
- (void)showBadtipsAlert:(NSString *)title duration:(CGFloat)duration{
    MBProgressHUD *HUD = [[MBProgressHUD alloc] initWithView:self];
    CGSize  size = [title boundingRectWithSize:CGSizeMake(SCREEN_WIDTH, CGFLOAT_MAX) options:NSStringDrawingUsesLineFragmentOrigin attributes:@{NSFontAttributeName:[UIFont systemFontOfSize:14]} context:nil].size;
    [self addSubview:HUD];
    HUD.mode = MBProgressHUDModeCustomView;
    CGFloat width = size.width;
    if (width >= SCREEN_WIDTH) {
        width = SCREEN_WIDTH - 40;
    }
    UIView *customeView = [[UIView alloc]initWithFrame:CGRectMake(0, 0, width+ 30, 82)];
//    [UIImage]
    UIImageView *img = [[UIImageView alloc]initWithFrame:CGRectMake(0, 0, 22, 22)];
    img.image = [UIImage imageNamed:@"error_tips"];
    img.center = CGPointMake(customeView.bounds.size.width/2, 31);
    [customeView addSubview:img];
    UILabel *lable = [[UILabel alloc]initWithFrame:CGRectMake(0, 0,width +30, 14)];
    lable.center = CGPointMake(customeView.bounds.size.width/2, 60);
    lable.textColor = [UIColor whiteColor];
    lable.text = title;
    lable.font = [UIFont systemFontOfSize:13];
    lable.textAlignment = NSTextAlignmentCenter;
    [customeView addSubview:lable];
    HUD.customView = customeView;
    HUD.minShowTime = duration;
    HUD.cornerRadius = 5;
    HUD.square = NO;
    HUD.margin = 7;
    HUD.minSize = CGSizeMake(200, 0);
    HUD.color = [UIColor colorWithRed:46/255.0 green:56/255.0 blue:66/255.0 alpha:0.95];
    [HUD showAnimated:YES whileExecutingBlock:^{} completionBlock:^{
        [HUD removeFromSuperview];
    }];

}
- (void)showGoodtipsAlert:(NSString *)title duration:(CGFloat)duration{
    MBProgressHUD *HUD = [[MBProgressHUD alloc] initWithView:self];
    CGSize  size = [title boundingRectWithSize:CGSizeMake(SCREEN_WIDTH, CGFLOAT_MAX) options:NSStringDrawingUsesLineFragmentOrigin attributes:@{NSFontAttributeName:[UIFont systemFontOfSize:14]} context:nil].size;
    [self addSubview:HUD];
    HUD.mode = MBProgressHUDModeCustomView;
    CGFloat width = size.width;
    if (width >= SCREEN_WIDTH) {
        width = SCREEN_WIDTH - 40;
    }
    UIView *customeView = [[UIView alloc]initWithFrame:CGRectMake(0, 0, width+ 30, 82)];
    //    [UIImage]
    UIImageView *img = [[UIImageView alloc]initWithFrame:CGRectMake(0, 0, 22, 22)];
    img.image = [UIImage imageNamed:@"good_tips"];
    img.center = CGPointMake(customeView.bounds.size.width/2, 31);
    [customeView addSubview:img];
    UILabel *lable = [[UILabel alloc]initWithFrame:CGRectMake(0, 0,width +10, 14)];
    lable.center = CGPointMake(customeView.bounds.size.width/2, 60);
    lable.textColor = [UIColor whiteColor];
    lable.text = title;
    lable.font = [UIFont systemFontOfSize:13];
    lable.textAlignment = NSTextAlignmentCenter;
    [customeView addSubview:lable];
    HUD.customView = customeView;
    HUD.minShowTime = duration;
    HUD.cornerRadius = 5;
    HUD.square = NO;
    HUD.margin = 7;
    HUD.minSize = CGSizeMake(200, 0);
    HUD.color = [UIColor colorWithRed:46/255.0 green:56/255.0 blue:66/255.0 alpha:0.95];
    [HUD showAnimated:YES whileExecutingBlock:^{} completionBlock:^{
        [HUD removeFromSuperview];
    }];
}
@end
