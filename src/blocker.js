var replies = document.querySelector('.tbb'),
    blockQuotes = false,
    autoload = false,
    loading = false,
    originalPage = 0,
    currentPage = 0,
    userDivs;

if (replies) {
    var queryDict = {};
    location.search.substr(1).split("&").forEach(function(item) {queryDict[item.split("=")[0]] = item.split("=")[1]});

    originalPage = currentPage = parseInt(queryDict.o) || false;

    userDivs = document.querySelectorAll('form[name=REPLIER] > dl');
    chrome.storage.sync.get('hunsubSettings', function (data) {
        blockQuotes = data && data.hunsubSettings && data && data.hunsubSettings.blockQuotes;
        autoload = data && data.hunsubSettings && data && data.hunsubSettings.autoLoad;
        blockUsers(blockQuotes);
        if(autoload){
            window.addEventListener('scroll', onScroll);
        }
    });

    addButtons();
    //addUserFinder();
}

function onScroll(){
    var scrollHeight   = window.document.body.scrollHeight - window.innerHeight,
        scrollPosition = window.document.body.scrollTop,
        $posts         = $('form[name="REPLIER"] > dl'),
        $footerDiv     = $($posts[$posts.length - 2]),
        nextPageUrl    = undefined;

    if(!loading && scrollPosition > scrollHeight - 400){
        loading = true;
        currentPage += 10;
        nextPageUrl = window.location.href.replace('o=' + originalPage, 'o=' + currentPage);
        $.get(nextPageUrl, function(data){
            var $newReplies = $(data).find('form[name="REPLIER"] > dl');
            if($newReplies.length > 2){
                delete $newReplies[$newReplies.length-1];
                delete $newReplies[$newReplies.length-2];
                $newReplies.length = $newReplies.length - 2 ;
                $footerDiv.prepend($newReplies);
            }
            loading = false;
        });
    }
}

function addButtons() {
    for (var i = 0; i < userDivs.length - 1; i++) {
        var userDiv = userDivs[i];
        var links = userDiv.querySelector('.fR.links');
        var blockLink = document.createElement('a');

        if (!links || !blockLink)
            continue;

        var nameAnchor = userDiv.querySelector('dt a');
        var start = nameAnchor.href.indexOf('user.php?i=');
        var userId = nameAnchor.href.substring(start + 11, nameAnchor.length);
        var userName = nameAnchor.textContent;
        (function (userId, userName) {
            blockLink.addEventListener('click', function () {
                blockUser(userId, userName);
            });
        })(userId, userName);

        blockLink.textContent = "Block";
        blockLink.style.cursor = "pointer";
        links.appendChild(blockLink);
    }
}

function blockUsers(blockQuotes) {
    console.log('starting');
    chrome.storage.sync.get('blockedUsers', function (data) {
        if (!data || !data.blockedUsers)
            var blockedUsers = {};
        else
            var blockedUsers = data.blockedUsers;

        userDivs = document.querySelectorAll('form[name=REPLIER] > dl');
        for (var i = 0; i < userDivs.length - 1; i++) {
            var userDiv = userDivs[i];
            var nameAnchor = userDiv.querySelector('dt a');
            var start = nameAnchor.href.indexOf('user.php?i=');
            var userId = nameAnchor.href.substring(start + 11, nameAnchor.length);
            if (blockedUsers[userId]) {
                userDiv.parentNode.removeChild(userDiv);
            } else if (blockQuotes) {
                var quoteDivs = userDiv.querySelectorAll('.quote1'),
                    quoteDiv,
                    userName,
                    match;
                for (var j = 0; j < quoteDivs.length; j++) {
                    quoteDiv = quoteDivs[j];
                    match = quoteDiv.textContent.match(/Quote\s\(([^\s]+)/);
                    if (!match)
                        continue;
                    userName = match[1];
                    for (var prop in blockedUsers) {
                        if (blockedUsers.hasOwnProperty(prop)) {
                            if (blockedUsers[prop] === userName) {
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

function blockUser(userId, userName) {
    chrome.storage.sync.get('blockedUsers', function (data) {
        if (!data || !data.blockedUsers)
            var blockedUsers = {};
        else
            var blockedUsers = data.blockedUsers;

        blockedUsers[userId] = userName;
        chrome.storage.sync.set({'blockedUsers': blockedUsers}, function () {
            blockUsers(blockQuotes);
        });
    });
}

function addUserFinder() {
    var formData = new FormData();
    formData.append("c", 13);
    formData.append("un", name);
    formData.append("desc", '');
    formData.append("add", 'Add User to Address Book');

    $.ajax({
        method: 'POST',
        url: 'http://forums.d2jsp.org/pm.php',
        data: {
            'c' : 13,
            'uN': name,
            'desc': '',
            'add': 'Add User to Address Book'
        },
        success: function(response){
            var $nameAnchors = $(response).find('table#mLT.ftb > tbody > tr > td > a');

            $nameAnchors.each(function (index, element) {
                var userName = element.innerText;
                if (userName.toLowerCase().indexOf(name.toLowerCase()) > -1) {
                    console.log('MEGTALÁLTAM');
                }
            });
        }
    });
}