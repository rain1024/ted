$(document).ready(function () {
    function Video(data) {
        this.data = data;

        this.getVideo = function () {
            return './data/' + this.data.name + '.mp4';
        };

        this.getThumbnail = function () {
            return './data/' + this.data.name + '.jpg';
        };

        this.getSubtitle = function () {
            return './data/' + this.data.name + '.vtt';

        };

        this.createDOM = function () {
            return $('<a href="' + this.getVideo() + '">' +
                '<img src="' + this.getThumbnail() + '">' +
                '</a>')
        }
    };

    $.getJSON('./data/items.json', function (items) {
        items = _.first(items, 3);
        // create first video
        var firstItem = new Video(items[0]);
        $('#video_container').html(
            '<video controls id="video" poster="' + firstItem.getThumbnail() + '">' +
            '<source src="' + firstItem.getVideo() + '" type="video/mp4">' +
            '<track id="track" label="English" kind="subtitles" srclang="en" src="' + firstItem.getSubtitle() + '" default>' +
            '</video>'
        );
        // create figcaption
        for (var i = 0; i < items.length; i++) {
            $('figcaption').append(new Video(items[i]).createDOM());
        }

        var video_player = document.getElementById("video_player");
        video = video_player.getElementsByTagName("video")[0],
            video_links = video_player.getElementsByTagName("figcaption")[0],
            source = video.getElementsByTagName("source")[0],
            track = video.getElementsByTagName("track")[0],
            link_list = [],
            currentVid = 0,
            allLnks = video_links.children,
            lnkNum = allLnks.length;
        video.removeAttribute("controls");
        video.removeAttribute("poster");

        (function () {
            function playVid(index) {
                video_links.children[index].classList.add("currentvid");
                source.src = "./data/" + link_list[index] + ".mp4";
                video.addEventListener("loadedmetadata", function () {
                    this.removeChild(document.getElementById("track"));
                    var track = document.createElement("track");
                    track.kind = "captions",
                        track.id = "track",
                        track.label = "English",
                        track.srclang = "en",
                        track.src = './data/' + link_list[index] + ".vtt";
                    track.addEventListener("load", function () {
                        this.mode = "showing";
                        video.textTracks[0].mode = "showing"; // thanks Firefox
                    });
                    this.appendChild(track);
                });
                currentVid = index;
                video.load();
                video.play();
            }

            for (var i = 0; i < lnkNum; i++) {
                var filename = allLnks[i].href;
                link_list[i] = filename.match(/([^\/]+)(?=\.\w+$)/)[0];
                (function (index) {
                    allLnks[i].onclick = function (i) {
                        i.preventDefault();
                        for (var i = 0; i < lnkNum; i++) {
                            allLnks[i].classList.remove("currentvid");
                        }
                        playVid(index);
                    }
                })(i);
            }
            video.addEventListener('ended', function () {
                allLnks[currentVid].classList.remove("currentvid");
                if ((currentVid + 1) >= lnkNum) {
                    nextVid = 0
                } else {
                    nextVid = currentVid + 1
                }
                playVid(nextVid);
            })

            video.addEventListener('mouseenter', function () {
                video.setAttribute("controls", "true");
            })

            video.addEventListener('mouseleave', function () {
                video.removeAttribute("controls");
            })

            var indexOf = function (needle) {
                if (typeof Array.prototype.indexOf === 'function') {
                    indexOf = Array.prototype.indexOf;
                } else {
                    indexOf = function (needle) {
                        var i = -1, index = -1;
                        for (i = 0; i < this.length; i++) {
                            if (this[i] === needle) {
                                index = i;
                                break;
                            }
                        }
                        return index;
                    };
                }
                return indexOf.call(this, needle);
            };
            var focusedLink = document.activeElement;
            index = indexOf.call(allLnks, focusedLink);

            document.addEventListener('keydown', function (e) {
                if (index) {
                    var focusedElement = document.activeElement;
                    if (e.keyCode == 40 || e.keyCode == 39) { // down or right cursor
                        var nextNode = focusedElement.nextElementSibling;
                        if (nextNode) {
                            nextNode.focus();
                        } else {
                            video_links.firstElementChild.focus();
                        }
                    }
                    if (e.keyCode == 38 || e.keyCode == 37) { // up or left cursor
                        var previousNode = focusedElement.previousElementSibling;
                        if (previousNode) {
                            previousNode.focus();
                        } else {
                            video_links.lastElementChild.focus();
                        }
                    }
                }
            });
        })();
    });
});
