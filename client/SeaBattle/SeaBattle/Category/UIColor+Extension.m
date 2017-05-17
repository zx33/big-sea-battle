//
//  UIColor+Extension.m
//  HaiZhan
//
//  Created by dotamax on 17/3/1.
//  Copyright © 2017年 dotamax. All rights reserved.
//

#import "UIColor+Extension.h"

@implementation UIColor (Extension)

+ (UIColor *)buttonBgColor1 {
    return Color(190, 200, 210);
}

+ (UIColor *)buttonBgColor2 {
    return Color(238, 210, 238);
}

+ (UIColor *)emptyCellColor {
    return Color(255, 255, 204);
}

+ (UIColor *)deployingShipCellColor {
    return Color(204, 204, 204);
}

+ (UIColor *)deployedShipCellColor {
    return Color(204, 255, 102);
}

+ (UIColor *)destroyShipCellColor {
    return Color(255, 0, 51);
}

+ (UIColor *)noShipCellColor {
    return Color(204, 255, 204);
}

+ (UIColor *)lineColor {
    return Color(142, 229, 238);
}

@end
