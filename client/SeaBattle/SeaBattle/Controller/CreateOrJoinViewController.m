//
//  CreateOrJoinViewController.m
//  HaiZhan
//
//  Created by dotamax on 17/3/1.
//  Copyright © 2017年 dotamax. All rights reserved.
//

#import "CreateOrJoinViewController.h"
#import "CreateJoinRoomViewController.h"
#import "FilterPickerView.h"

@interface CreateOrJoinViewController () <FilterPickerViewDelegate>

@property (nonatomic, strong) UIButton *createGameButton;
@property (nonatomic, strong) UIButton *joinGameButton;
@property (nonatomic, strong) UIButton *backButton;
@property (nonatomic, strong) FilterPickerView *picker;

@property (nonatomic, copy) NSString *gameMode;
@property (nonatomic, copy) NSString *seaRange;
@property (nonatomic, strong) NSArray *gameModeTitleArray;
@property (nonatomic, strong) NSArray *gameModeArray;
@property (nonatomic, strong) NSArray *seaRangeArray;

@end

@implementation CreateOrJoinViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.view.backgroundColor = [UIColor whiteColor];
    self.gameModeArray = @[@"normal", @"speed", @"guess"];
    self.gameModeTitleArray = @[@"普通", @"竞速", @"预判"];
    self.seaRangeArray = @[@"6", @"8"];
    
    [self.view addSubview:self.createGameButton];
    [self.view addSubview:self.joinGameButton];
    [self.view addSubview:self.backButton];
    [self.joinGameButton mas_makeConstraints:^(MASConstraintMaker *make) {
        make.width.equalTo(@100);
        make.height.equalTo(@40);
        make.centerX.equalTo(self.view);
        make.centerY.equalTo(self.view);
    }];
    [self.createGameButton mas_makeConstraints:^(MASConstraintMaker *make) {
        make.width.equalTo(@100);
        make.height.equalTo(@40);
        make.centerX.equalTo(self.view);
        make.bottom.equalTo(self.joinGameButton.mas_top).offset(-10);
    }];
    [self.backButton mas_makeConstraints:^(MASConstraintMaker *make) {
        make.width.equalTo(@100);
        make.height.equalTo(@40);
        make.centerX.equalTo(self.view);
        make.top.equalTo(self.joinGameButton.mas_bottom).offset(10);
    }];
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
    self.gameMode = @"normal";
    self.seaRange = @"6";
    self.picker = [[FilterPickerView alloc] initWithFrame:CGRectMake(0, 0, SCREEN_WIDTH, 150) titleArray:@[@"模式", @"范围"]];
    self.picker.delegate = self;
    [self.picker show];
    WS(weakSelf);
    self.picker.confirmBlock = ^(){
        [weakSelf createRoom];
    };
}

- (void)createRoom {
    NSLog(@"gamemode:%@, searange:%@",self.gameMode,self.seaRange);
    [MBProgressHUD showHUDAddedTo:self.view animated:YES];
    [HttpTool getWithPath:[ApiConfig API_CREATE_NEW_GAME] params:[NSDictionary dictionaryWithObjectsAndKeys:self.gameMode, @"game_type", self.seaRange, @"sea_range", nil] success:^(id JSON) {
        [MBProgressHUD hideHUDForView:self.view animated:YES];
        if ([[JSON objectForKey:@"status"] isEqualToString:@"ok"]) {
            NSDictionary *data = [JSON objectForKey:@"result"];
            NSNumber *roomid = [data objectForKey:@"room_id"];
            [[NSUserDefaults standardUserDefaults] setObject:[NSString stringWithFormat:@"%ld",[roomid integerValue]]forKey:KEY_ROOM_ID];
            CreateJoinRoomViewController *vc = [[CreateJoinRoomViewController alloc] init];
            vc.type = 0;
            vc.gameMode = self.gameMode;
            vc.seaRange = self.seaRange;
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
    CreateJoinRoomViewController *vc = [[CreateJoinRoomViewController alloc] init];
    vc.type = 1;
    [self.navigationController pushViewController:vc animated:YES];
}

- (void)backAction {
    [self.navigationController popViewControllerAnimated:YES];
}

#pragma mark - PickerView Delegate
- (NSInteger)filterPickerNumberOfComponents {
    return 2;
}

- (NSInteger)filterPickerNumberOfRowsInComponent:(NSInteger)component {
    if (!component) {
        return self.gameModeTitleArray.count;
    }else {
        return self.seaRangeArray.count;
    }
}

- (NSString *)filterPickertitleForRow:(NSInteger)row forComponent:(NSInteger)component {
    if (!component) {
        return self.gameModeTitleArray[row];
    }else {
        return self.seaRangeArray[row];
    }
    
}

- (void)filterPickerDidSelectRow:(NSInteger)row inComponent:(NSInteger)component {
    if (!component) {
        self.gameMode = self.gameModeArray[row];
    }else {
        self.seaRange = self.seaRangeArray[row];
    }
}


#pragma mark - getter

- (UIButton *)createGameButton {
    if (!_createGameButton) {
        _createGameButton = [UIButton new];
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
        _joinGameButton = [UIButton new];
        _joinGameButton.layer.cornerRadius = 4.0f;
        _joinGameButton.backgroundColor = [UIColor buttonBgColor1];
        [_joinGameButton setTitle:@"加入游戏" forState:UIControlStateNormal];
        [_joinGameButton setTitleColor:[UIColor blueColor] forState:UIControlStateNormal];
        [_joinGameButton addTarget:self action:@selector(joinGame:) forControlEvents:UIControlEventTouchUpInside];
    }
    return _joinGameButton;
}

- (UIButton *)backButton {
    if (!_backButton) {
        _backButton = [UIButton new];
        _backButton.layer.cornerRadius = 4.0f;
        _backButton.backgroundColor = [UIColor buttonBgColor1];
        [_backButton setTitle:@"返回菜单" forState:UIControlStateNormal];
        [_backButton setTitleColor:[UIColor blueColor] forState:UIControlStateNormal];
        [_backButton addTarget:self action:@selector(backAction) forControlEvents:UIControlEventTouchUpInside];
    }
    return _backButton;
}

@end
