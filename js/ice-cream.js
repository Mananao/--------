$(function(){
	// もどるボタン
	$("#back").on("click", function(){
		window.location.href = 'index.html';
	});

	/* メッセージ */
	function Message(){
		/* プロパティ */
		let index = $("#message_num");

		/* メソッド */
		// 待機
		this.initialSpeak = function(){
			index.val(0);
			const amount = Number($("#inserted_amount").val());
			const min = Number($("#min_price").val());
			if ( amount >= min ){
				$('#message').html("商品を購入してください('▽'*)");
				$('#message').css("color", "orange");
			} else {
				$('#message').html("お金を入れてください(*^^*)");
				$('#message').css("color", "#ff7a7a");
			}
		}
		this.initialSpeakWithCheck = function(i){
			if ( i == index.val() || i.length == 0 ){
				this.initialSpeak();
			}
		}
		// 投入不可
		this.maxAmountError = function(max){
			index.val(1);
			$('#message').html(max + " 円以上は投入できません(･ω･`;)");
			$('#message').css("color", "cornflowerblue");
		}
		// 在庫なし
		this.soldOutError = function(){
			index.val(2);	
			$('#message').html("売り切れです…(･ω･`;)");
			$('#message').css("color", "cornflowerblue");
		}
		// 金額が足りない
		this.shortOfMoneyError = function(){
			index.val(3);
			$('#message').html("金額が足りません(´;ω;｀)");
			$('#message').css("color", "cornflowerblue");
		}
		// 表示可能アイスの上限に到達
		this.maxIceError = function(){
			index.val(4);
			$('#message').html("はやくたべないとアイスがとけちゃう～(;´･ω･)");
			$('#message').css("color", "orange");
		}
		// アイスが溶ける
		this.meltIceSpeak = function(){
			index.val(5);
			$('#message').html("あ〜とけちゃった～(´;ω;｀)");
			$('#message').css("color", "cornflowerblue");
		}
		// 利用終了
		this.endSpeak = function(){
			index.val(6);
			$('#message').html("ご利用ありがとうございました♪(*´▽｀*)");
			$('#message').css("color", "#ff7a7a");
		}
		// おつりの出し過ぎ（場におつりがある）
		this.maxChangeExistError = function(){
			index.val(7);
			$('#message').html("おつりがつまってます…(･ω･`;)<br> \
								おつりをすべて回収してください");
			$('#message').css("color", "cornflowerblue");
		}
		// おつりの出し過ぎ（場におつりがない）
		this.maxChangeError = function(){
			index.val(8);
			$('#message').html("おつりが多くて出せません…(･ω･`;)<br> \
								商品を購入してください");
			$('#message').css("color", "cornflowerblue");
		}
		// 食べた
		this.eatSpeak = function(){
			index.val(9);
			$('#message').html("あ〜おいしかった♪(*´▽｀*)");
			$('#message').css("color", "orange");
		}
		// 食べるアイスがない
		this.eatError = function(){
			index.val(10);
			$('#message').html("たべるアイスがありません(;´･ω･)");
			$('#message').css("color", "cornflowerblue");
		}


		// 初期処理
		this.initialSpeak();
	}

	/* 自動販売機 */
	function VendingMachine(){
		Message.call(this);
		/* プロパティ */
		// 投入可能金額
		const maxInsertAmount = 1500;
		// 投入金額
		let insertedAmount = 0;
		// 在庫
		let stockTable = {
			'mint'	: { price: 110, stock: 5 }, 
			'berry'	: { price: 140, stock: 5 },
			'orange': { price: 170, stock: 5 },
		};
		// 最低金額
		minPrice = Math.min(...Object.values(stockTable).map(item => item.price));
		$("#min_price").val(minPrice);
		/* メソッド */
		this.reset = function(){
			for (var icekey in stockTable) {
				stockTable[icekey].stock = 5;
			}
			this.setInsertedAmount(0);
			this.initialSpeak();
			this.updatePurchaseButton();
		}
		//自動販売機終了状態
		this.end = function(){
			this.setInsertedAmount(0);
			this.updatePurchaseButton();
			this.endSpeak();
			setTimeout(() => {
				this.initialSpeakWithCheck(6);
			}, 3000);
		}
		this.getInsertedAmount = function(){
			return insertedAmount;
		}
		this.setInsertedAmount = function(amount){
			insertedAmount = amount;
			this.showAmount();
			this.initialSpeak();
			// 購入ボタン更新
			this.updatePurchaseButton();
		}
		this.getPrice = function(icename){
			return stockTable[icename].price;
		}
		this.getMinPrice = function(){
			return minPrice;
		}
		this.showInitialSpeak = function(i){
			this.initialSpeakWithCheck(i);
		}
		// 商品の値段表示
		this.showPrice = function(){
			for (var icekey in stockTable) {
				const price = stockTable[icekey].price;
				$("#" + icekey).text(price);
			}
		}
		// 投入金額の表示
		this.showAmount = function(){
			$("#inserted_amount").val(insertedAmount);
		}
		// 上限金額チェック
		this.canInsertCoin = function(amount){
			return new Promise((resolve, reject) => {
				if ( amount > maxInsertAmount ){
					// メッセージを 3 秒表示
					this.maxAmountError(maxInsertAmount);
					setTimeout(() => {
						this.initialSpeakWithCheck(1);
						reject(new Error('error'));
					}, 3000);
				} else {
					resolve(1);
				}
			});
		}
		// 販売可能チェック
		this.canSell = function(icename){
			return new Promise((resolve, reject) => {
				const price = stockTable[icename].price;
				const stock = stockTable[icename].stock;
				if ( stock <= 0 ){
					// 在庫がない
					this.soldOutError();
					setTimeout(() => {
						this.initialSpeakWithCheck(2);
						reject(new Error('error'));
					}, 3000);
				} else if ( insertedAmount - price < 0 ){
					// 金額が足りない
					this.shortOfMoneyError();
					setTimeout(() => {
						this.initialSpeakWithCheck(3);
						reject(new Error('error'));
					}, 3000);
				} else {
					resolve(1);
				}
			});
		}
		// 購入ボタン状態表示
		this.updatePurchaseButton = function(){
			for (var icekey in stockTable) {
				if ( stockTable[icekey].stock <= 0 ){
					// 在庫不足
					$("#" + icekey).addClass('no-stock');
					$("#" + icekey).removeClass('can-buy cannot-buy');
				} else if ( insertedAmount - stockTable[icekey].price < 0 ){
					// 残高不足
					$("#" + icekey).addClass('cannot-buy');
					$("#" + icekey).removeClass('no-stock can-buy');
				} else if ( insertedAmount - stockTable[icekey].price >= 0 ){
					// 購入可能
					$("#" + icekey).addClass('can-buy');
					$("#" + icekey).removeClass('no-stock cannot-buy');
				}
			}

			// 在庫ありのうち最小金額を計算
			const minValue = $('.can-buy, .cannot-buy').map(function() {
				return Number($(this).text());
			}).get().reduce((a, b) => Math.min(a, b));
			$("#min_price").val(minValue);
		}
		this.stocktaking = function(icename){
			stockTable[icename].stock--;
			// 購入ボタン更新
			this.updatePurchaseButton();
		}

		// 初期処理
		this.showPrice();
		this.updatePurchaseButton();
	}

	/* 購入済みアイス */
	function PurchasedIce(){
		Message.call(this);
		/* プロパティ */
		const maxIceCone = 12;
		// 購入済みアイス（表示中アイス）の数
		let iceCone			= 0;
		// アイス画像の表示位置
		let iceRow			= 0;
		let iceLine			= 0;

		/* メソッド */
		this.getIceCone = function(){
			return iceCone;
		}
		this.showInitialSpeak = function(i){
			this.initialSpeakWithCheck(i);
		}
		// 購入可能アイスの上限チェック
		this.canPurchase = function(machine){
			return new Promise((resolve, reject) => {
				if ( iceCone >= maxIceCone ){
					// 表示数が上限越え
					this.maxIceError();
					setTimeout(() => {
						this.initialSpeakWithCheck(4);
						reject(new Error('error'));
					}, 3000);
				} else {
					resolve(1);
				}
			});
		}
		// 購入したアイス画像の表示
		this.appendIce = function(icename){
			//縦横位置設定
			const posi = {
				"left" : (iceRow * 4) + "dvw",
				"bottom" : (2 + iceLine * 10) + "dvh"
			}
			// アイスの表示
			$(".purchased_ice_area").append('<img id="ice_' + iceCone + '" class="purchased_ice" \
				src="img/vending_machine/' + icename + '_ice.png" alt="' + icename + '">');
			$("#ice_" + iceCone).css(posi);

			iceCone++;
			// 次のアイス表示位置の更新				
			iceRow++;
			if ( iceRow % 3 === 0 ){
				iceLine++;
				iceRow = 0;
			}
		}
		// 表示可能アイスの上限到達チェック
		this.isMaxIce = function(machine){
			return new Promise((resolve, reject) => {
				if ( iceCone >= maxIceCone ){
					// メッセージを 5 秒表示
					this.maxIceError(maxIceCone);
					setTimeout(() => {
						if ( iceCone > 0 ){
							// アイスが溶ける
							this.rmIce();
							// メッセージを 3 秒表示
							this.meltIceSpeak();
							setTimeout(() => {
								this.initialSpeakWithCheck(5);
								resolve(1);
							}, 3000);
						} else {
							this.initialSpeakWithCheck(4);
							resolve(1);
						}
					}, 5000);
				} else {
					resolve(1);
				}
			});
		}
		// アイス表示を消す
		this.rmIce = function(){
			this.rmIceImg();
			this.rmIceStock();
		}
		// アイス表示を消す
		this.rmIceImg = function(){
			$(".purchased_ice").remove();
			iceCone = 0;
			iceRow = 0;
			iceLine = 0;
		}
	}

	/* おつり */
	function Change(){
		Message.call(this);
		/* プロパティ */
		// 表示中おつりの数
		const maxChange		= 10;
		let change			= 0;
		// アイス画像の表示位置
		let coinPosi		= 0;

		/* メソッド */
		this.getChange = function(){
			return change;
		}
		// おつりを出せるかチェック
		this.canChange = function(addChange){
			return new Promise((resolve, reject) => {
				if ( coinPosi + addChange > maxChange ){
					if ( coinPosi != 0 ){
						// コイン未回収
						this.maxChangeExistError();
						setTimeout(() => {
							this.initialSpeakWithCheck(7);
							reject(new Error('error'));
						}, 3000);
					} else {
						// コインが場にない
						this.maxChangeError();
						setTimeout(() => {
							this.initialSpeakWithCheck(8);
							reject(new Error('error'));
						}, 3000);
					}
				} else {
					resolve(1);
				}
			});
		}
		// 購入したアイス画像の表示
		this.appendChange = function(yen, cnt){
			for (let i = 0; i < cnt; i++){
				//縦横位置設定
				const posi = {
					"bottom" : (2 + coinPosi * 2) + "dvh"
				}
				// コインの表示
				$(".change_area").append('<img id="change_' + change + '" class="coin coin_' + yen + 'yen" \
					src="img/vending_machine/' + yen + 'yen.png" alt="' + yen + 'yen">');
				$("#change_" + change).css(posi);

				change++;
				// 次のアイス表示位置の更新				
				coinPosi++;
			}
		}
		// おつりを回収する
		this.countChange = function(){
			change = $(".change_area").children(".coin").length;
			if (change == 0){
				coinPosi = 0;
			}
		}
		// おつり表示を消す
		this.reset = function(){
			$(".change_area").children(".coin").remove();
			change = 0;
			coinPosi = 0;
		}
	}
	
	/* 人 */
	function Person(){
		PurchasedIce.call(this);
		/* プロパティ */
		// 所持品
		let iceTable = {
			'mint'	: { buy: 0, yet:0, eat: 0 }, 
			'berry'	: { buy: 0, yet:0, eat: 0 },
			'orange': { buy: 0, yet:0, eat: 0 },
		};

		/* メソッド */
		this.reset = function(){
			this.rmIce();
			for (var icekey in iceTable) {
				iceTable[icekey].buy = 0;
				iceTable[icekey].yet = 0;
				iceTable[icekey].eat = 0;
			}
		}
		// 購入したアイスを在庫に増やす
		this.increaseStock = function(icename){
			iceTable[icename].buy++;
			iceTable[icename].yet++;
		}
		// 食べたアイスをカウント
		this.countEatIce = function(){
			let updatedIceTable = {};
			for (let icekey in iceTable) {
				updatedIceTable[icekey] = {
					eat: iceTable[icekey].eat + iceTable[icekey].yet,
					yet: 0
				};
			}
			iceTable = updatedIceTable;
		}
		// たべた数を表示
		this.showEatIce = function(){
			const mint = iceTable['mint'].eat;
			const berry = iceTable['berry'].eat;
			const orange = iceTable['orange'].eat;
			$("#eat_count").text('たべた数 ミント: ' + mint + ', ベリー: ' + berry + ', オレンジ: ' + orange + '');
		}
		// たべる
		this.eatIce = function(){
			if ( this.getIceCone() != 0 ){
				// 食べた数をカウント
				this.countEatIce();
				// 食べた数を表示
				this.showEatIce();
				console.log("mint eat : " + iceTable['mint'].eat);
				console.log("mint yet : " + iceTable['mint'].yet);
				// アイスを消す
				this.rmIce();
				this.eatSpeak();
				setTimeout(() => {
					this.initialSpeakWithCheck(9);
				}, 3000);
			} else {
				// たべるアイスがない
				this.eatError();
				setTimeout(() => {
					this.initialSpeakWithCheck(10);
				}, 3000);
			}
		}
		// アイスを消す
		this.rmIceStock = function(){
			for (var icekey in iceTable) {
				iceTable[icekey].yet = 0;
			}
		}
	}


	/* インスタンス生成 */
	const vendingMachine = new VendingMachine();
	const person = new Person();
	const change = new Change();
	
	/* コイン投入 */
	$(".coin_area").children().on('click', function(){
		// 投入金額上限チェック
		const amount = vendingMachine.getInsertedAmount();
		const input = Number($(this).val());

		vendingMachine.canInsertCoin(amount + input)
		.then(result => {
			// 投入
			vendingMachine.setInsertedAmount(amount + input);
			// メッセージ更新
			vendingMachine.initialSpeak();
		})
		.catch(error => {
		});
	});

	/* 購入 */
	$(".buy").on('click', function(){
		const amount = vendingMachine.getInsertedAmount();
		const icename = $(this).attr('id');
		const price = vendingMachine.getPrice(icename);

		// 購入可能かチェック
		person.canPurchase(vendingMachine)
		.then(result => {
			// 販売可能かチェック
			vendingMachine.canSell(icename)
			.then(result => {
				// 残高更新
				vendingMachine.setInsertedAmount(amount - price);
				// 在庫管理
				vendingMachine.stocktaking(icename);

				// 購入済みアイスの表示
				person.appendIce(icename);
				// 購入数増加
				person.increaseStock(icename);
				// 表示可能最大数チェック
				person.isMaxIce(vendingMachine)
				.then(result => {
				})
				.catch(error => {
				});
			})
			.catch(error => {
			});
		})
		.catch(error => {
		});
	});

	/* たべる */
	$("#eat_button").on("click", function(){
		person.eatIce();
	});

	/* おつりレバー */
	$("#change_button").on("click", function(){
		const amount = vendingMachine.getInsertedAmount();
		// これから出す硬貨の枚数
		const five_hundred	= Math.floor(amount / 500);
		const hundred 		= Math.floor((amount % 500) / 100);
		const ten			= Math.floor((amount % 100) / 10);

		// 返却可能か
		change.canChange(hundred + ten)
		.then(result => {
			// おつりを返却する
			change.appendChange(500, five_hundred);
			change.appendChange(100, hundred);
			change.appendChange(10, ten);

			// 自販機の利用を終了
			vendingMachine.end();
		})
		.catch(error => {
		});
	});

	/* おつりを回収可能に */
	$(".change_area").on("click", ".coin", function(){
		$(this).remove();
		change.countChange();
	});

	/* はじめから */
	$("#retry").on("click", function(){
		vendingMachine.reset();
		person.reset();
		change.reset();
	});

});
