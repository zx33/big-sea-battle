//
//  NetGameViewController.m
//  SeaBattle
//
//  Created by begoss on 2017/5/15.
//  Copyright © 2017年 begoss. All rights reserved.
//

#import "NetGameViewController.h"
#import "BoardCell.h"
#import "ShipLocationModel.h"
#import "GameOpModel.h"
#import "StatusModel.h"
#import "PlayersModel.h"
#import "TipsModel.h"
#import "WinnerModel.h"

@interface NetGameViewController () <UICollectionViewDataSource,UICollectionViewDelegate,UICollectionViewDelegateFlowLayout,UIAlertViewDelegate> {
    int _enemyBoardArray[8][8];
    int _ourBoardArray[8][8];
}

@property (nonatomic, strong) UILabel *enemyLabel;
@property (nonatomic, strong) UILabel *ourArmyLabel;
@property (nonatomic, strong) UILabel *guideLabel;
@property (nonatomic, strong) UICollectionView *enemyBoard;
@property (nonatomic, strong) UICollectionView *ourArmyBoard;
@property (nonatomic, strong) UIButton *endGameButton;
@property (nonatomic, strong) UIButton *tipsButton;

@property (nonatomic, assign) NSInteger gameStatus;
@property (nonatomic, assign) NSInteger currOpCnt;
@property (nonatomic, assign) NSInteger opCntResult;
@property (nonatomic, assign) BOOL gameStart;
@property (nonatomic, assign) BOOL gameEnd;
@property (nonatomic, assign) BOOL isOurTurn;
@property (nonatomic, copy) NSString *turns;
@property (nonatomic, strong) NSMutableArray *tipsArray;

@property (nonatomic, weak) NSTimer *timer;

@end

@implementation NetGameViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.view.backgroundColor = [UIColor whiteColor];
    self.gameStatus = 0;
    self.currOpCnt = -1;
    self.opCntResult = -1;
    self.gameStart = NO;
    self.gameEnd = NO;
    self.isOurTurn = NO;
    self.tipsArray = [NSMutableArray new];
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
    [self.view addSubview:self.tipsButton];
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
    [self.tipsButton mas_makeConstraints:^(MASConstraintMaker *make) {
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
    if (self.gameStatus < 2) {
        self.guideLabel.text = @"等待对面玩家";
        [HttpTool getWithPath:[ApiConfig API_GET_STATUS] params:nil success:^(id JSON) {
            if ([[JSON objectForKey:@"status"] isEqualToString:@"ok"]) {
                StatusModel *model = [StatusModel mj_objectWithKeyValues:JSON];
                self.gameStatus = model.result.status;
            }
        } failure:^(NSError *error) {}];
    }else if (self.gameStatus == 2) {
        if (!self.gameStart) {
            self.gameStart = YES;
            self.guideLabel.text = @"敌方就绪，可以开始！";
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
        }else {
            [self getCurrentOperationCount];
        }
    }else {
        [HttpTool getWithPath:[ApiConfig API_GET_WINNER] params:nil success:^(id JSON) {
            if ([[JSON objectForKey:@"status"] isEqualToString:@"ok"]) {
                WinnerModel *model = [WinnerModel mj_objectWithKeyValues:JSON];
                for (NSInteger i=0; i<model.result.map_info.count; i++) {
                    NSInteger x = i/BOARD_SIZE;
                    NSInteger y = i%BOARD_SIZE;
                    if ([model.result.map_info[i] integerValue] == 1) {
                        _enemyBoardArray[x][y] = STATE_DEPLOYED;
                    }
                    [self.enemyBoard reloadData];
                }
                if (!model.result.has_winner) {
                    self.guideLabel.text = @"平局！";
                }else {
                    if ([model.result.winner isEqualToString:NICKNAME]) {
                        self.guideLabel.text = @"你获胜了！";
                    }else {
                        self.guideLabel.text = @"你失败了！";
                    }
                }
                self.gameEnd = YES;
                [_timer invalidate];
            }
        } failure:^(NSError *error) {
            
        }];
    }
}

- (void)getCurrentOperationCount {
    [HttpTool getWithPath:[ApiConfig API_CURR_OP_CNT] params:nil success:^(id JSON) {
        if ([[JSON objectForKey:@"status"] isEqualToString:@"ok"]) {
            NSDictionary *data = [JSON objectForKey:@"result"];
            NSNumber *opCnt = [data objectForKey:@"op_cnt"];
            self.opCntResult = [opCnt integerValue];
            if (self.opCntResult > self.currOpCnt) {
                [self getCurrentOperation];
            }else {
                if (!self.gameEnd) {
                    if ([self.turns isEqualToString:NICKNAME]) {
                        self.guideLabel.text = @"你的回合";
                        self.isOurTurn = YES;
                    }else {
                        self.guideLabel.text = @"敌方回合";
                        self.isOurTurn = NO;
                    }
                }
            }
        }
    } failure:^(NSError *error) {
        
    }];
}

- (void)getCurrentOperation {
    [HttpTool getWithPath:[ApiConfig API_GET_OP] params:[NSDictionary dictionaryWithObjectsAndKeys:@(++self.currOpCnt), @"op_cnt", nil] success:^(id JSON) {
        if ([[JSON objectForKey:@"status"] isEqualToString:@"ok"]) {
            if (self.gameEnd) {
                return;
            }
            GameOpModel *model = [GameOpModel mj_objectWithKeyValues:JSON];
            self.turns = model.result.turns;
            if (model.result.op.nickname.length) {
                if ([model.result.op.nickname isEqualToString:NICKNAME]) {
                    if (model.result.op.bingo) {
                        self.guideLabel.text = @"你击中了敌方！";
                        _enemyBoardArray[model.result.op.x][model.result.op.y] = STATE_DESTROYED;
                        [self.enemyBoard reloadData];
                    }else {
                        self.guideLabel.text = @"你没打中敌方。";
                        _enemyBoardArray[model.result.op.x][model.result.op.y] = STATE_NO_SHIP;
                        [self.enemyBoard reloadData];
                    }
                }else {
                    if (model.result.op.bingo) {
                        self.guideLabel.text = @"敌人击中了你！";
                        _ourBoardArray[model.result.op.x][model.result.op.y] = STATE_DESTROYED;
                        [self.ourArmyBoard reloadData];
                    }else {
                        self.guideLabel.text = @"敌人没打中你。";
                        _ourBoardArray[model.result.op.x][model.result.op.y] = STATE_NO_SHIP;
                        [self.ourArmyBoard reloadData];
                    }
                }
            }
            if (model.result.is_end) {
                self.gameStatus = 3;
            }
        }
    } failure:^(NSError *error) {
        
    }];
}

- (void)ourTurnToAttack:(NSIndexPath *)indexPath {
    NSInteger x = indexPath.section;
    NSInteger y = indexPath.row;
    if (_enemyBoardArray[x][y] == STATE_DESTROYED || _enemyBoardArray[x][y] == STATE_NO_SHIP) {
        return;
    }
    if (self.tipsArray.count) {
        for (int i=0; i<self.tipsArray.count; i++) {
            NSString *x = self.tipsArray[i][0];
            NSString *y = self.tipsArray[i][1];
            _enemyBoardArray[[x integerValue]][[y integerValue]] = STATE_EMPTY;
        }
        [self.tipsArray removeAllObjects];
    }
    [HttpTool postWithPath:[ApiConfig API_SET_OP] params:[NSDictionary dictionaryWithObjectsAndKeys:@(indexPath.section), @"x", @(indexPath.row), @"y", nil] success:^(id JSON) {
        if ([[JSON objectForKey:@"status"] isEqualToString:@"ok"]) {
            [self getCurrentOperation];
        }
    } failure:^(NSError *error) {
    }];
}

- (void)guessAction {
    
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
        if (self.isOurTurn) {
            [self ourTurnToAttack:indexPath];
        }
    }
}

#pragma mark - Setter

- (UICollectionView *)ourArmyBoard {
    if (!_ourArmyBoard) {
        _ourArmyBoard = [[UICollectionView alloc] initWithFrame:CGRectMake(SCREEN_WIDTH/2 - (21*BOARD_SIZE+1), SCREEN_HEIGHT - (26*BOARD_SIZE+1+15), 26*BOARD_SIZE+1, 26*BOARD_SIZE+1) collectionViewLayout:[[UICollectionViewFlowLayout alloc] init]];
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
        _enemyBoard = [[UICollectionView alloc] initWithFrame:CGRectMake(SCREEN_WIDTH/2 - (21*BOARD_SIZE+1), 38, 42*BOARD_SIZE+2, 42*BOARD_SIZE+2) collectionViewLayout:[[UICollectionViewFlowLayout alloc] init]];
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

- (UIButton *)tipsButton {
    if (!_tipsButton) {
        _tipsButton = [UIButton new];
        _tipsButton.backgroundColor = [UIColor buttonBgColor1];
        _tipsButton.layer.cornerRadius = 3.0f;
        [_tipsButton setTitle:@"提示" forState:UIControlStateNormal];
        [_tipsButton setTitleColor:[UIColor blueColor] forState:UIControlStateNormal];
        [_tipsButton addTarget:self action:@selector(guessAction) forControlEvents:UIControlEventTouchUpInside];
    }
    return _tipsButton;
}

@end
