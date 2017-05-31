//
//  GuessGameViewController.m
//  SeaBattle
//
//  Created by begoss on 2017/5/30.
//  Copyright © 2017年 begoss. All rights reserved.
//

#import "GuessGameViewController.h"
#import "BoardCell.h"
#import "ShipLocationModel.h"
#import "GameOpModel.h"
#import "StatusModel.h"
#import "PlayersModel.h"
#import "GuessModel.h"
#import "WinnerModel.h"

@interface GuessGameViewController ()<UICollectionViewDataSource,UICollectionViewDelegate,UICollectionViewDelegateFlowLayout,UIAlertViewDelegate> {
    int _enemyBoardArray[8][8];
    int _ourBoardArray[8][8];
}

@property (nonatomic, strong) UILabel *enemyLabel;
@property (nonatomic, strong) UILabel *ourArmyLabel;
@property (nonatomic, strong) UILabel *guideLabel;
@property (nonatomic, strong) UICollectionView *enemyBoard;
@property (nonatomic, strong) UICollectionView *ourArmyBoard;
@property (nonatomic, strong) UIButton *endGameButton;
@property (nonatomic, strong) UIButton *guessButton;

@property (nonatomic, assign) NSInteger gameStatus;
@property (nonatomic, assign) BOOL gameStart;
@property (nonatomic, assign) BOOL hasSubmitted;
@property (nonatomic, assign) NSInteger guessRemain;

@property (nonatomic, weak) NSTimer *timer;

@end

@implementation GuessGameViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.view.backgroundColor = [UIColor whiteColor];
    self.gameStatus = 0;
    self.gameStart = NO;
    self.hasSubmitted = NO;
    if (BOARD_SIZE == 6) {
        self.guessRemain = 10;
    }else if (BOARD_SIZE == 8) {
        self.guessRemain = 20;
    }
    [self setUI];
    [self loadOurBoard];
    _timer = [NSTimer scheduledTimerWithTimeInterval:2.0f
                                              target:self
                                            selector:@selector(gameLoop)
                                            userInfo:nil
                                             repeats:YES];
    [_timer fire];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)setUI {
    [self.view addSubview:self.enemyLabel];
    [self.view addSubview:self.ourArmyLabel];
    [self.view addSubview:self.guideLabel];
    [self.view addSubview:self.endGameButton];
    [self.view addSubview:self.ourArmyBoard];
    [self.view addSubview:self.enemyBoard];
    [self.view addSubview:self.guessButton];
    [self.enemyLabel mas_makeConstraints:^(MASConstraintMaker *make) {
        make.left.equalTo(self.ourArmyBoard.mas_left);
        make.bottom.equalTo(self.enemyBoard.mas_top).offset(-6);
    }];
    [self.ourArmyLabel mas_makeConstraints:^(MASConstraintMaker *make) {
        make.left.equalTo(self.ourArmyBoard.mas_left);
        make.bottom.equalTo(self.ourArmyBoard.mas_top).offset(-6);
    }];
    [self.guideLabel mas_makeConstraints:^(MASConstraintMaker *make) {
        make.right.equalTo(self.enemyBoard.mas_right);
        make.top.equalTo(self.enemyBoard.mas_bottom).offset(10);
        make.left.equalTo(self.enemyBoard.mas_left);
    }];
    [self.endGameButton mas_makeConstraints:^(MASConstraintMaker *make) {
        make.right.equalTo(self.enemyBoard.mas_right);
        make.bottom.equalTo(self.ourArmyBoard.mas_bottom);
        make.height.equalTo(@40);
        make.width.equalTo(@60);
    }];
    [self.guessButton mas_makeConstraints:^(MASConstraintMaker *make) {
        make.right.equalTo(self.enemyBoard.mas_right);
        make.top.equalTo(self.ourArmyBoard.mas_top);
        make.height.equalTo(@40);
        make.width.equalTo(@60);
    }];
}

- (void)loadOurBoard {
    for (int i=0; i<self.playerShipLocationArray.count; i++) {
        ShipLocationModel *model = self.playerShipLocationArray[i];
        for (int j=0; j<model.location.count; j++) {
            _ourBoardArray[model.location[j].x][model.location[j].y] = STATE_DEPLOYED;
        }
    }
}

- (void)gameLoop {
    NSLog(@"循环。。。");
    [HttpTool getWithPath:[ApiConfig API_GET_STATUS] params:nil success:^(id JSON) {
        if ([[JSON objectForKey:@"status"] isEqualToString:@"ok"]) {
            StatusModel *model = [StatusModel mj_objectWithKeyValues:JSON];
            self.gameStatus = model.result.status;
        }
    } failure:^(NSError *error) {}];
    if (self.gameStatus < 2) {
        self.guideLabel.text = @"等待对面玩家";
    }else if (self.gameStatus == 2) {
        if (!self.gameStart) {
            self.gameStart = YES;
            self.guideLabel.text = [NSString stringWithFormat:@"敌方就绪，可以开始预判!还需选%ld格",self.guessRemain];
            [HttpTool getWithPath:[ApiConfig API_GET_PLAYERS] params:nil success:^(id JSON) {
                if ([[JSON objectForKey:@"status"] isEqualToString:@"ok"]) {
                    PlayersModel *model = [PlayersModel mj_objectWithKeyValues:JSON];
                    for (int i=0; i<model.result.players.count; i++) {
                        if (![model.result.players[i] isEqualToString:NICKNAME]) {
                            self.enemyLabel.text = [NSString stringWithFormat:@"敌方海域(%@)",model.result.players[i]];
                        }
                    }
                }
            } failure:^(NSError *error) {
            }];
        }
    }else {
        [HttpTool getWithPath:[ApiConfig API_GET_WINNER] params:nil success:^(id JSON) {
            if ([[JSON objectForKey:@"status"] isEqualToString:@"ok"]) {
                WinnerModel *model = [WinnerModel mj_objectWithKeyValues:JSON];
                for (NSInteger i=0; i<model.result.map_info.count; i++) {
                    NSInteger x = i/BOARD_SIZE;
                    NSInteger y = i%BOARD_SIZE;
                    if ([model.result.map_info[i] integerValue] == 1) {
                        if (_ourBoardArray[x][y] == STATE_EMPTY) {
                            _ourBoardArray[x][y] = STATE_NO_SHIP;
                        }else if (_ourBoardArray[x][y] == STATE_DEPLOYED) {
                            _ourBoardArray[x][y] = STATE_DESTROYED;
                        }
                    }
                }
                [self.ourArmyBoard reloadData];
                if (!model.result.has_winner) {
                    self.guideLabel.text = @"平局！";
                }else {
                    if ([model.result.winner isEqualToString:NICKNAME]) {
                        self.guideLabel.text = @"你获胜了！";
                    }else {
                        self.guideLabel.text = @"你失败了！";
                    }
                }
                [_timer invalidate];
            }
        } failure:^(NSError *error) {
            
        }];
    }
}

- (void)submitGuess {
    if (self.guessRemain) {
        UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"还未预判完成"
                                                        message:@""
                                                       delegate:self
                                              cancelButtonTitle:@"确定"
                                              otherButtonTitles:nil];
        [alert show];
    }else {
        [MBProgressHUD showHUDAddedTo:self.view animated:YES];
        NSString *mapInfo = @"";
        for (int i=0; i<BOARD_SIZE; i++) {
            for (int j=0; j<BOARD_SIZE; j++) {
                if (_enemyBoardArray[i][j] == STATE_EMPTY) {
                    mapInfo = [mapInfo stringByAppendingString:@"0"];
                }else if (_enemyBoardArray[i][j] == STATE_DEPLOYING) {
                    mapInfo = [mapInfo stringByAppendingString:@"1"];
                }
            }
        }
        [HttpTool postWithPath:[ApiConfig API_GUESS] params:[NSDictionary dictionaryWithObjectsAndKeys:mapInfo, @"map_info", nil] success:^(id JSON) {
            [MBProgressHUD hideHUDForView:self.view animated:YES];
            if ([[JSON objectForKey:@"status"] isEqualToString:@"ok"]) {
                GuessModel *model = [GuessModel mj_objectWithKeyValues:JSON];
                [self showGuessResultWithEnemyMap:model.result.rival_map bingoCount:model.result.bingo_cnt];
            }else {
                [self.view showBadtipsAlert:[JSON objectForKey:@"msg"]];
            }
        } failure:^(NSError *error) {
            [MBProgressHUD hideHUDForView:self.view animated:YES];
            [self.view showBadtipsAlert:@"请求超时"];
        }];
    }
}

- (void)showGuessResultWithEnemyMap:(NSArray *)enemyMap bingoCount:(NSInteger)bingoCount {
    for (NSInteger i=0; i<enemyMap.count; i++) {
        NSInteger x = i / BOARD_SIZE;
        NSInteger y = i % BOARD_SIZE;
        NSInteger num = [enemyMap[i] integerValue];
        if (num == 1) {
            if (_enemyBoardArray[x][y] == STATE_EMPTY) {
                _enemyBoardArray[x][y] = STATE_DEPLOYED;
            }else if (_enemyBoardArray[x][y] == STATE_DEPLOYING) {
                _enemyBoardArray[x][y] = STATE_DESTROYED;
            }
        }else if (num == 0) {
            if (_enemyBoardArray[x][y] == STATE_DEPLOYING) {
                _enemyBoardArray[x][y] = STATE_NO_SHIP;
            }
        }
    }
    [self.enemyBoard reloadData];
    self.guideLabel.text = [NSString stringWithFormat:@"你击中了%ld格",bingoCount];
}

- (void)guessAction:(NSIndexPath *)indexPath {
    if (_enemyBoardArray[indexPath.section][indexPath.row] == STATE_EMPTY) {
        if (self.guessRemain) {
            _enemyBoardArray[indexPath.section][indexPath.row] = STATE_DEPLOYING;
            [self.enemyBoard reloadData];
            self.guessRemain--;
            if (self.guessRemain) {
                self.guideLabel.text = [NSString stringWithFormat:@"还需选%ld格",self.guessRemain];
            }else {
                self.guideLabel.text = @"可以提交";
            }
        }
    }else if (_enemyBoardArray[indexPath.section][indexPath.row] == STATE_DEPLOYING) {
        _enemyBoardArray[indexPath.section][indexPath.row] = STATE_EMPTY;
        [self.enemyBoard reloadData];
        self.guessRemain++;
        self.guideLabel.text = [NSString stringWithFormat:@"还需选%ld格",self.guessRemain];
    }
}

- (void)endGame:(UIButton *)button {
    UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"你确定要结束游戏吗"
                                                    message:@""
                                                   delegate:self
                                          cancelButtonTitle:@"取消"
                                          otherButtonTitles:@"确定", nil];
    alert.tag = 1001;
    [alert show];
}

#pragma mark - AlertView Delegate

- (void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex {
    if (alertView.tag == 1001) {
        if (buttonIndex == 1) {
            [_timer invalidate];
            [self.navigationController popToRootViewControllerAnimated:YES];
        }
    }
}

#pragma mark - CollectionView Delegate

- (NSInteger)numberOfSectionsInCollectionView:(UICollectionView *)collectionView {
    return BOARD_SIZE;
}

- (NSInteger)collectionView:(UICollectionView *)collectionView numberOfItemsInSection:(NSInteger)section{
    return BOARD_SIZE;
}

- (UICollectionViewCell *)collectionView:(UICollectionView *)collectionView cellForItemAtIndexPath:(NSIndexPath *)indexPath{
    BoardCell *cell = [collectionView dequeueReusableCellWithReuseIdentifier:NSStringFromClass([BoardCell class]) forIndexPath:indexPath];
    if (collectionView.tag == 101) {
        [cell setColor:_ourBoardArray[indexPath.section][indexPath.row]];
    }else {
        [cell setColor:_enemyBoardArray[indexPath.section][indexPath.row]];
    }
    return cell;
}

- (CGSize)collectionView:(UICollectionView *)collectionView layout:(UICollectionViewLayout *)collectionViewLayout sizeForItemAtIndexPath:(NSIndexPath *)indexPath{
    if (collectionView.tag == 101) {
        return CGSizeMake(25, 25);
    }else {
        return CGSizeMake(40, 40);
    }
}


- (CGFloat)collectionView:(UICollectionView *)collectionView layout:(UICollectionViewLayout*)collectionViewLayout minimumLineSpacingForSectionAtIndex:(NSInteger)section{
    if (collectionView.tag == 101) {
        return 1;
    }else {
        return 2;
    }
}
- (CGFloat)collectionView:(UICollectionView *)collectionView layout:(UICollectionViewLayout*)collectionViewLayout minimumInteritemSpacingForSectionAtIndex:(NSInteger)section{
    if (collectionView.tag == 101) {
        return 1;
    }else {
        return 2;
    }
}

- (UIEdgeInsets)collectionView:(UICollectionView *)collectionView layout:(UICollectionViewLayout *)collectionViewLayout insetForSectionAtIndex:(NSInteger)section{
    if (collectionView.tag == 101) {
        if (section == BOARD_SIZE-1) {
            return UIEdgeInsetsMake(1, 1, 1, 1);
        }
        return UIEdgeInsetsMake(1, 1, 0, 1);
    }else {
        if (section == BOARD_SIZE-1) {
            return UIEdgeInsetsMake(2, 2, 2, 2);
        }
        return UIEdgeInsetsMake(2, 2, 0, 2);
    }
}

- (void)collectionView:(UICollectionView *)collectionView didSelectItemAtIndexPath:(NSIndexPath *)indexPath{
    [collectionView deselectItemAtIndexPath:indexPath animated:YES];
    NSLog(@"section:%ld,row:%ld",indexPath.section,indexPath.row);
    if (collectionView.tag == 102) {
        if (self.gameStatus == 2 && !self.hasSubmitted) {
            [self guessAction:indexPath];
        }
    }
}

#pragma mark - Setter

- (UICollectionView *)ourArmyBoard {
    if (!_ourArmyBoard) {
        _ourArmyBoard = [[UICollectionView alloc] initWithFrame:CGRectMake(SCREEN_WIDTH/2 - (21*BOARD_SIZE+1), SCREEN_HEIGHT - (26*BOARD_SIZE+1+12), 26*BOARD_SIZE+1, 26*BOARD_SIZE+1) collectionViewLayout:[[UICollectionViewFlowLayout alloc] init]];
        _ourArmyBoard.dataSource = self;
        _ourArmyBoard.delegate = self;
        _ourArmyBoard.scrollEnabled = NO;
        _ourArmyBoard.tag = 101;
        _ourArmyBoard.backgroundColor = [UIColor lineColor];
        _ourArmyBoard.alwaysBounceVertical = YES;
        [_ourArmyBoard registerClass:[BoardCell class] forCellWithReuseIdentifier:NSStringFromClass([BoardCell class])];
    }
    return _ourArmyBoard;
}

- (UICollectionView *)enemyBoard {
    if (!_enemyBoard) {
        _enemyBoard = [[UICollectionView alloc] initWithFrame:CGRectMake(SCREEN_WIDTH/2 - (21*BOARD_SIZE+1), 45, 42*BOARD_SIZE+2, 42*BOARD_SIZE+2) collectionViewLayout:[[UICollectionViewFlowLayout alloc] init]];
        _enemyBoard.dataSource = self;
        _enemyBoard.delegate = self;
        _enemyBoard.scrollEnabled = NO;
        _enemyBoard.tag = 102;
        _enemyBoard.backgroundColor = [UIColor lineColor];
        _enemyBoard.alwaysBounceVertical = YES;
        [_enemyBoard registerClass:[BoardCell class] forCellWithReuseIdentifier:NSStringFromClass([BoardCell class])];
    }
    return _enemyBoard;
}

- (UILabel *)enemyLabel {
    if (!_enemyLabel) {
        _enemyLabel = [UILabel new];
        _enemyLabel.font = Font(14);
        _enemyLabel.textColor = [UIColor purpleColor];
        _enemyLabel.text = @"敌方海域";
    }
    return _enemyLabel;
}

- (UILabel *)ourArmyLabel {
    if (!_ourArmyLabel) {
        _ourArmyLabel = [UILabel new];
        _ourArmyLabel.font = Font(14);
        _ourArmyLabel.textColor = [UIColor purpleColor];
        _ourArmyLabel.text = [NSString stringWithFormat:@"你的海域(%@)",NICKNAME];
    }
    return _ourArmyLabel;
}

- (UILabel *)guideLabel {
    if (!_guideLabel) {
        _guideLabel = [UILabel new];
        _guideLabel.font = BoldFont(15);
        _guideLabel.textColor = [UIColor blackColor];
        _guideLabel.textAlignment = UITextAlignmentLeft;
        _guideLabel.numberOfLines = 2;
        _guideLabel.text = @"等待敌方玩家";
    }
    return _guideLabel;
}

- (UIButton *)endGameButton {
    if (!_endGameButton) {
        _endGameButton = [UIButton new];
        _endGameButton.backgroundColor = [UIColor buttonBgColor1];
        _endGameButton.layer.cornerRadius = 3.0f;
        [_endGameButton setTitle:@"结束" forState:UIControlStateNormal];
        [_endGameButton setTitleColor:[UIColor blueColor] forState:UIControlStateNormal];
        [_endGameButton addTarget:self action:@selector(endGame:) forControlEvents:UIControlEventTouchUpInside];
    }
    return _endGameButton;
}

- (UIButton *)guessButton {
    if (!_guessButton) {
        _guessButton = [UIButton new];
        _guessButton.backgroundColor = [UIColor buttonBgColor1];
        _guessButton.layer.cornerRadius = 3.0f;
        [_guessButton setTitle:@"提交" forState:UIControlStateNormal];
        [_guessButton setTitleColor:[UIColor blueColor] forState:UIControlStateNormal];
        [_guessButton addTarget:self action:@selector(submitGuess) forControlEvents:UIControlEventTouchUpInside];
    }
    return _guessButton;
}

@end
