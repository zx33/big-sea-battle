//
//  ViewController.m
//  HaiZhan
//
//  Created by dotamax on 17/3/1.
//  Copyright © 2017年 dotamax. All rights reserved.
//

#import "ViewController.h"
#import "CreateGameViewController.h"

@interface ViewController ()

@property (nonatomic, strong) UIButton *createGameButton;
@property (nonatomic, strong) UIButton *joinGameButton;

@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.view.backgroundColor = [UIColor whiteColor];
    [self.view addSubview:self.createGameButton];
    [self.view addSubview:self.joinGameButton];
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:YES];
    [[NSUserDefaults standardUserDefaults] setObject:@"0" forKey:KEY_PASSWORD];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)creatGame:(UIButton *)button {
    [MBProgressHUD showHUDAddedTo:self.view animated:YES];
    [HttpTool getWithPath:[ApiConfig API_CREATE_NEW_GAME] params:nil success:^(id JSON) {
        [MBProgressHUD hideHUDForView:self.view animated:YES];
        if ([[JSON objectForKey:@"status"] isEqualToString:@"ok"]) {
            NSDictionary *data = [JSON objectForKey:@"result"];
            NSNumber *roomid = [data objectForKey:@"room_id"];
            [[NSUserDefaults standardUserDefaults] setObject:[NSString stringWithFormat:@"%ld",[roomid integerValue]] forKey:KEY_ROOM_ID];
            CreateGameViewController *vc = [[CreateGameViewController alloc] init];
            vc.type = 0;
            [self.navigationController pushViewController:vc animated:YES];
        }else {
            [self.view showBadtipsAlert:[JSON objectForKey:@"msg"]];
        }
    } failure:^(NSError *error) {
        [MBProgressHUD hideHUDForView:self.view animated:YES];
        [self.view showBadtipsAlert:@"请求超时"];
    }];
}

- (void)joinGame:(UIButton *)button {
    CreateGameViewController *vc = [[CreateGameViewController alloc] init];
    vc.type = 1;
    [self.navigationController pushViewController:vc animated:YES];
}

- (UIButton *)createGameButton {
    if (!_createGameButton) {
        _createGameButton = [[UIButton alloc] initWithFrame:CGRectMake(SCREEN_WIDTH/2 - 50, SCREEN_HEIGHT/2 - 50, 100, 40)];
        _createGameButton.layer.cornerRadius = 4.0f;
        _createGameButton.backgroundColor = [UIColor buttonBgColor1];
        [_createGameButton setTitle:@"创建游戏" forState:UIControlStateNormal];
        [_createGameButton setTitleColor:[UIColor blueColor] forState:UIControlStateNormal];
        [_createGameButton addTarget:self action:@selector(creatGame:) forControlEvents:UIControlEventTouchUpInside];
    }
    return _createGameButton;
}

- (UIButton *)joinGameButton {
    if (!_joinGameButton) {
        _joinGameButton = [[UIButton alloc] initWithFrame:CGRectMake(SCREEN_WIDTH/2 - 50, SCREEN_HEIGHT/2 + 10, 100, 40)];
        _joinGameButton.layer.cornerRadius = 4.0f;
        _joinGameButton.backgroundColor = [UIColor buttonBgColor1];
        [_joinGameButton setTitle:@"加入游戏" forState:UIControlStateNormal];
        [_joinGameButton setTitleColor:[UIColor blueColor] forState:UIControlStateNormal];
        [_joinGameButton addTarget:self action:@selector(joinGame:) forControlEvents:UIControlEventTouchUpInside];
    }
    return _joinGameButton;
}

@end
