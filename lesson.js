$(document).ready(function () {

    var lesson = "test";
    var lessonDataPath = "../lessons/" + lesson + "/data.json";

    window.iconMap = {
        video: "icon-facetime-video",
        exploration: "icon-plane",
        exercise: "icon-bar-chart",
        quiz: "icon-list-alt",
        glue: "icon-align-left",
        text: "icon-align-left"
    };

    // register helpers
    Handlebars.registerHelper("equal", function (lvalue, rvalue, options) {
        if (arguments.length < 3) {
            throw new Error("Handlebars Helper equal needs 2 parameters");
        }
        if ( lvalue !== rvalue ) {
            return options.inverse(this);
        } else {
            return options.fn(this);
        }
    });

    Handlebars.registerHelper('eachIndexed', function (context, options) {
        var fn = options.fn, inverse = options.inverse;
        var ret = "";

        if (context && context.length > 0) {
            for (var i=0, j=context.length; i<j; i++) {
                context[i]["index"] = i+1;
                ret = ret + fn(context[i]);
            }
        } else {
            ret = inverse(this);
        }
        return ret;
    });

    // register partials
    Handlebars.registerPartial("video-node", $("#video-node-partial").html());
    Handlebars.registerPartial("exercise-node", $("#exercise-node-partial").html());
    Handlebars.registerPartial("exploration-node", $("#exploration-node-partial").html());
    Handlebars.registerPartial("quiz-node", $("#quiz-node-partial").html());
    Handlebars.registerPartial("multiple-choice", $("#multiple-choice-partial").html());
    Handlebars.registerPartial("glue-node", $("#glue-node-partial").html());
    Handlebars.registerPartial("richtext-node", $("#text-node-partial").html());

    // compile templates
    window.sidebarTemplate = Handlebars.compile($("#sidebar-template").html());
    window.mainTemplate = Handlebars.compile($("#main-template").html());

    $.ajax({
        type: "GET",
        dataType: "json",
        url: lessonDataPath,
        success: renderPage
    });

    function renderPage (data) {

        _.each(data.modules, function (module, i) {
            // preprocess data (add nodes and icons)
            module.nodes = _.map(module.nodes, function (nodeID, i) {
                var node = data.nodeList[nodeID];
                var type = node.nodeType;
                node.icon = iconMap[type];
                return node;
            });
        });

        // store elements in variables
        var $sidebar = $("#sidebar");
        var $main = $("#main");
        var $extra = $("#extra");

        // render templates
        $sidebar.html(sidebarTemplate(data));
        $main.append(mainTemplate(data));

        // add scrollspy
        // for some reason, this doesn't work with $("#sidebar").scrollspy()
        // somewhat related SO answer that pointed to this workaround: http://stackoverflow.com/questions/10602445/bootstrap-scrollspy-works-strange
        // TODO: this is not working yet.
        $main.scrollspy("refresh");

        // STICKY SIDEBAR AND NODE HEADINGS
        function isWithinRange(val, min, max) {
            return ((val > min) && (val < max)) ? true : false;
        }

        function printVals(arr){
            var msg = _.reduce(arr, function (memo, i) {
                return memo + " " + i;
            }, "");
            console.log(msg);
        }

        function updateStickySidebar(y, min) {
            if (y > min) {
                $sidebar.addClass("fixed").removeClass("absolute");
            } else {
                $sidebar.addClass("absolute").removeClass("fixed");
            }
        }

        function updateStickyNodeHeading(y) {
            if (y > minArr[0]) {
                $stickyNodeHeading.show();
            } else {
                $stickyNodeHeading.hide();
            }

            _.each($(".persist-area"), function (el, i) {
                var title = $(".node-heading span", $(el)).text();
                var update = isWithinRange(y, minArr[i], maxArr[i]);
                if (update) {
                    $("span", $stickyNodeHeading).text(title);
                }
            });
        }

        // these need to be outside updateStickyElems since $sidebar.offset()
        // is different when position is fixed vs. absolute
        var $stickyNodeHeading = $("#sticky-node-heading");
        var buffer = -40;
        var sidebarBuffer = -50;
        var sidebarMin = $sidebar.offset().top + sidebarBuffer;
        var minArr = [];
        var maxArr = [];

        _.each($(".persist-area"), function (el, i) {
            minArr.push($(el).offset().top + buffer);
            maxArr.push($(el).offset().top + $(el).height() + buffer);
        });

        function updateStickyElems () {
            var y = $(window).scrollTop();
            updateStickySidebar(y, sidebarMin);
            updateStickyNodeHeading(y);
        }

        // on scroll, update the sticky elements
        $(window)
            .scroll(updateStickyElems)
            .trigger("scroll");

        // click fullscreen icons to expand to full view
        $fullscreen = $(".expand-fullscreen", $stickyNodeHeading);
        $iconEnlarge = $(".icon-fullscreen", $fullscreen);
        $iconShrink = $(".icon-resize-small", $fullscreen);
        $fullscreen.toggle(function() {
            $main.removeClass("span8 offset4").addClass("span12");
            $sidebar.hide();
            $iconEnlarge.hide();
            // treat iconShrink differently b/c it is hidden by default
            $iconShrink.removeClass("hidden");
        }, function() {
            $main.removeClass("span12").addClass("span8 offset4");
            $sidebar.show();
            $iconEnlarge.show();
            $iconShrink.addClass("hidden");
        });

    }
});
