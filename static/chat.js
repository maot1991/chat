function pop(){
	value = $('select').val();
	$('select').val('select_a_user_in_a_list')[0]
	if ($('div#'+value).length<=0){
		$('#log').append('<div id="'+value+'" class="commentBox"><div class="info"><p>'+value+'</p><a name="close" href="#" onclick="close(name)">X</a></div><div class="commentList"></div><form name="'+value+'"><input class="send" type="textarea" placeholder="place message here and press enter to send"></form></div>');
		send();
		close();
		socket.emit('get_previous_comment',{data:value});
	}
}

function close(){
	$('a[name=close]').on('click',function(event){
		var obj = event.target;
		var div = $(obj).parent().parent();
		console.log(div);
		$(div).remove()
	})

}
// $(document).ready(function(){
namespace = '/test'; // change to an empty string to use the global namespace

// the socket.io documentation recommends sending an explicit package upon connection
// this is specially important when using the global namespace
var socket = io.connect('http://' + document.domain + ':' + location.port + namespace);
socket.on('connect', function() {
	return true;
});

socket.on('generate_user_list', function() {
	if ($('h2').length>0){
		console.log($('h2').attr("value"));
    	socket.emit('react_to_generate',{data:$('h2').attr("value")});
    	return false;
	}
});

socket.on('add_to_user_list', function(msg) {
	socket.emit('init2',{data:msg.data})
	return false;
});

socket.on('window_init',function(msg){
	var box = $('div#'+msg.sender)
	console.log(msg)
	for (item in msg.history){
		$(box).children('.commentList').append('<p>'+msg.history[item]+'</p>');
	}
})

// event handler for server sent data
// the data is displayed in the "Received" section of the page
socket.on('come_back', function(msg) {
	$('#register-name').val(msg.data)
    // $('#log').append('<br>Received #' + msg.count + ': ' + msg.data);
});

socket.on('add_user_title', function(msg) {
		$('#nav-bar div').prepend('<p value="'+msg.data+'">Hello '+msg.data+',</p>')
});


socket.on('useradd', function(msg) {
	if ($('h2').length>0 && $('h2').attr("value")!=msg.data){
    	$('select').append('<option value="'+msg.data+'">'+msg.data+'</option>');
    	socket.emit('addusertolist',{data:msg.data})
	}
	// socket.emit('addusertolist',{data:msg.data})
});

socket.on('init', function(msg) {
    $('select').append('<option value="'+msg.data+'">'+msg.data+'</option>');
    // socket.emit('init2',{data:msg.data})
});

socket.on('error', function(msg) {
    $('#error').text(msg.data);
    return false;
});

socket.on('receive', function(msg) {
	var value = msg.sender;
	if ($('div#'+msg.sender).length<=0){
		$('#log').append('<div id="'+msg.sender+'" class="commentBox"><div class="info"><p>'+msg.sender+'</p><a name="close" href="#" onclick="close(name)">X</a></div><div class="commentList"></div><form name="'+msg.sender+'"><input class="send" type="textarea" placeholder="place message here and press enter to send"></form></div>');
		send();
		close();
		socket.emit('get_previous_comment',{data:value});
    }
    $('div#'+msg.sender).children('.commentList').append('<p>'+msg.sender+': '+msg.data+'</p>');
    socket.emit('add_history',{data:msg.data,sender:msg.sender})
    return false;
});

$("#register-name").on('keypress',function (e){
	if (e.which == 13){
		$("#register").off('submit')
		$("#register").on('submit',function(){
			socket.emit('register',{data:$("#register-name").val()});
			return false;
		})									
	}
});




function send(){
	$(".send").on('keypress',function (e){
	if (e.which == 13){
		var form = $(this).parent();
		var id = $(form).attr("name");
		form.off('submit');
		form.on('submit',function(){
			console.log(e.target);
			var item = e.target;
			var display = $(form).parent().children('.commentList');
			$(display).append('<p>'+$('h2').attr("value")+': '+$(item).val());
			var text = $(item).val()
			$(item).val("");
			// var commentList = $(this).parent().children('.commentList');
			console.log($("div#"+id+' .commentList'))
			console.log($("div#"+id+' .commentList')[0].scrollHeight)
			$("div#"+id+' .commentList').scrollTop($("div#"+id+' .commentList')[0].scrollHeight);
			console.log($("div#"+id+' .commentList').scrollTop());
			socket.emit('send',{receiver:$(form).attr("name"),content:text});

			
			return false;
		})									
	}
})};

        