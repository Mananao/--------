$(function(){
	// 画像バージョン
	/*$("#back").on("click", function(){
		window.location.href = 'index.html';
	});*/
	// 文字バージョン
	$(".about-me_back").on("click", function(){
		window.location.href = 'index.html';
	});

	// 改行文字置換処理
	let text = $(".text").text();
	let newText = text.replace(/\n/g,'<br>');
	$(".text").html(newText);

});
