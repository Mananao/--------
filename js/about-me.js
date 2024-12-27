$(function(){
	$("#back").on("click", function(){
		window.location.href = 'index.html';
	})

	// 改行文字置換処理
	let text = $(".text").text();
	let newText = text.replace(/\n/g,'<br>');
	$(".text").html(newText);

});
