var a = document.querySelector('.tbb');
var userDivs;
var blockQuotes = false;
if(a){
	userDivs = document.querySelectorAll('form[name=REPLIER] > dl');
	chrome.storage.sync.get('blockQuotes', function(data){
		blockQuotes = data && data.blockQuotes;
		blockUsers(blockQuotes);
	});

	addButtons();
}

function addButtons(){
	for(var i =0;i < userDivs.length-1;i++){
		var userDiv = userDivs[i];
		var links = userDiv.querySelector('.fR.links');
		var blockLink = document.createElement('a');
		
		if(!links || !blockLink)
			continue;
			
		var nameAnchor = userDiv.querySelector('dt a');
		var start = nameAnchor.href.indexOf('user.php?i=');
		var userId = nameAnchor.href.substring(start+11,nameAnchor.length);
		var userName = nameAnchor.textContent;
		(function(userId,userName){
			blockLink.addEventListener('click',function() {
				blockUser(userId,userName);
			});
		})(userId,userName);

		blockLink.textContent = "Block";
		blockLink.style.cursor = "pointer";
		links.appendChild(blockLink);
	}
}

function blockUsers(blockQuotes){
	console.log('starting');
	chrome.storage.sync.get('blockedUsers', function(data){
		if(!data || !data.blockedUsers)
			var blockedUsers = {};
		else
			var blockedUsers = data.blockedUsers;
		
		userDivs = document.querySelectorAll('form[name=REPLIER] > dl');
		for(var i =0;i < userDivs.length-1;i++){
			var userDiv = userDivs[i];
			var nameAnchor = userDiv.querySelector('dt a');
			var start = nameAnchor.href.indexOf('user.php?i=');
			var userId = nameAnchor.href.substring(start+11,nameAnchor.length);
			if(blockedUsers[userId]){
				userDiv.parentNode.removeChild(userDiv);
			}else if(blockQuotes){
				var quoteDivs = userDiv.querySelectorAll('.quote1'),
                    quoteDiv,
                    userName,
                    match;
				for(var j = 0;j<quoteDivs.length;j++){
					quoteDiv = quoteDivs[j];
                    match = quoteDiv.textContent.match(/Quote\s\(([^\s]+)/);
                    if(!match)
                        return;
                    userName = match[1];
					for(var prop in blockedUsers) {
						if(blockedUsers.hasOwnProperty(prop)) {
							if(blockedUsers[prop] === userName) {
								var quote = quoteDiv.nextSibling;
								quoteDiv.parentNode.removeChild(quoteDiv);
								quote.parentNode.removeChild(quote);
							}
						}
					}
				}
			}
		}
	});	
}

function blockUser(userId,userName){
	chrome.storage.sync.get('blockedUsers', function(data){
		if(!data || !data.blockedUsers)
			var blockedUsers = {};
		else
			var blockedUsers = data.blockedUsers;
		
		blockedUsers[userId] = userName;
		chrome.storage.sync.set({'blockedUsers': blockedUsers},function(){
			blockUsers(blockQuotes);
		});
	});
}