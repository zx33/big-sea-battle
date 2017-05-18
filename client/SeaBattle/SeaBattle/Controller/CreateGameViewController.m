//
//  CreateGameViewController.m
//  SeaBattle
//
//  Created by begoss on 2017/5/13.
//  Copyright © 2017年 begoss. All rights reserved.
//

#import "CreateGameViewController.h"
#import "DeployShipViewController.h"

@interface CreateGameViewController ()

@property (nonatomic, strong) UITextField *roomIdTF;
@property (nonatomic, strong) UITextField *nicknameTF;
@property (nonatomic, strong) UIButton *startButton;
@property (nonatomic, strong) UIButton *backButton;
@property (nonatomic, strong) UILabel *roomIdLabel;

@end

@implementation CreateGameViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.view.backgroundColor = [UIColor whiteColor];
    if (self.type == 0) {
        [self.view addSubview:self.roomIdLabel];
        self.roomIdLabel.text = [NSString stringWithFormat:@"  房间id：%@",[[NSUserDefaults standardUserDefaults] objectForKey:KEY_ROOM_ID]];
    }else {
        [self.view addSubview:self.roomIdTF];
    }
    [self.view addSubview:self.nicknameTF];
    [self.view addSubview:self.startButton];
    [self.view addSubview:self.backButton];
    
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)startGame {
    NSString *roomId;
    if (self.type == 0) {
        roomId = [[NSUserDefaults standardUserDefaults] objectForKey:KEY_ROOM_ID];
    }else {
        if (!self.roomIdTF.text.length) {
            UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"请输入房间id"
                                                            message:@""
                                                           delegate:self
                                                  cancelButtonTitle:@"确定"
                                                  otherButtonTitles:nil];
            [alert show];
            return;
        }else {
            roomId = self.roomIdTF.text;
        }
    }
    if (!self.nicknameTF.text.length) {
        UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"请输入昵称"
                                                        message:@""
                                                       delegate:self
                                              cancelButtonTitle:@"确定"
                                              otherButtonTitles:nil];
        [alert show];
        return;
    }
    [MBProgressHUD showHUDAddedTo:self.view animated:YES];
    [HttpTool getWithPath:[ApiConfig API_JOIN_GAME] params:[NSDictionary dictionaryWithObjectsAndKeys:roomId, @"room_id", self.nicknameTF.text, @"nickname", nil] success:^(id JSON) {
        [MBProgressHUD hideHUDForView:self.view animated:YES];
        if ([[JSON objectForKey:@"status"] isEqualToString:@"ok"]) {
            NSDictionary *data = [JSON objectForKey:@"result"];
            [[NSUserDefaults standardUserDefaults] setObject:roomId forKey:KEY_ROOM_ID];
            [[NSUserDefaults standardUserDefaults] setObject:[data objectForKey:@"password"] forKey:KEY_PASSWORD];
            [[NSUserDefaults standardUserDefaults] setObject:self.nicknameTF.text forKey:KEY_NICKNAME];
            DeployShipViewController *vc = [[DeployShipViewController alloc] init];
            [self.navigationController pushViewController:vc animated:YES];
        }else {
            [self.view showBadtipsAlert:[JSON objectForKey:@"msg"]];
        }
    } failure:^(NSError *error) {
        [MBProgressHUD hideHUDForView:self.view animated:YES];
        [self.view showBadtipsAlert:@"请求超时"];
    }];
}
- (void)backAction {
    [self.navigationController popViewControllerAnimated:YES];
}

#pragma mark - getter

- (UITextField *)roomIdTF {
    if (!_roomIdTF) {
        _roomIdTF = [[UITextField alloc] initWithFrame:CGRectMake(SCREEN_WIDTH/2 - 100, SCREEN_HEIGHT/2 - 90, 200, 40)];
        _roomIdTF.placeholder = @"输入房间id";
        _roomIdTF.keyboardType = UIKeyboardTypeNumberPad;
        _roomIdTF.borderStyle = UITextBorderStyleRoundedRect;
        _roomIdTF.autocorrectionType = UITextAutocorrectionTypeNo;
        _roomIdTF.autocapitalizationType = UITextAutocapitalizationTypeNone;
    }
    return _roomIdTF;
}

- (UITextField *)nicknameTF {
    if (!_nicknameTF) {
        _nicknameTF = [[UITextField alloc] initWithFrame:CGRectMake(SCREEN_WIDTH/2 - 100, SCREEN_HEIGHT/2 - 40, 200, 40)];
        _nicknameTF.placeholder = @"输入昵称";
        _nicknameTF.borderStyle = UITextBorderStyleRoundedRect;
        _nicknameTF.autocorrectionType = UITextAutocorrectionTypeNo;
        _nicknameTF.autocapitalizationType = UITextAutocapitalizationTypeNone;
    }
    return _nicknameTF;
}

- (UIButton *)startButton {
    if (!_startButton) {
        _startButton = [[UIButton alloc] initWithFrame:CGRectMake(SCREEN_WIDTH/2 + 20, SCREEN_HEIGHT/2 + 10, 80, 40)];
        _startButton.layer.cornerRadius = 4.0f;
        _startButton.backgroundColor = [UIColor buttonBgColor1];
        [_startButton setTitle:@"进 入" forState:UIControlStateNormal];
        [_startButton setTitleColor:[UIColor blueColor] forState:UIControlStateNormal];
        [_startButton addTarget:self action:@selector(startGame) forControlEvents:UIControlEventTouchUpInside];
    }
    return _startButton;
}

- (UIButton *)backButton {
    if (!_backButton) {
        _backButton = [[UIButton alloc] initWithFrame:CGRectMake(SCREEN_WIDTH/2 - 100, SCREEN_HEIGHT/2 + 10, 80, 40)];
        _backButton.layer.cornerRadius = 4.0f;
        _backButton.backgroundColor = [UIColor buttonBgColor1];
        [_backButton setTitle:@"返 回" forState:UIControlStateNormal];
        [_backButton setTitleColor:[UIColor blueColor] forState:UIControlStateNormal];
        [_backButton addTarget:self action:@selector(backAction) forControlEvents:UIControlEventTouchUpInside];
    }
    return _backButton;
}

- (UILabel *)roomIdLabel {
    if (!_roomIdLabel) {
        _roomIdLabel = [[UILabel alloc] initWithFrame:CGRectMake(SCREEN_WIDTH/2 - 100, SCREEN_HEIGHT/2 - 90, 200, 40)];
        _roomIdLabel.font = Font(15);
        _roomIdLabel.textColor = [UIColor purpleColor];
    }
    return _roomIdLabel;
}

@end
