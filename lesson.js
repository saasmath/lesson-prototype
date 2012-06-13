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
        if ( lvalue != rvalue ) {
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

        // render templates
        $sidebar = $("#sidebar");
        $main = $("#main");
        $extra = $("#extra");
        $sidebar.html(sidebarTemplate(data));
        $main.append(mainTemplate(data));

        // add scrollspy
        // for some reason, this doesn't work with $("#sidebar").scrollspy()
        // somewhat related SO answer that pointed to this workaround: http://stackoverflow.com/questions/10602445/bootstrap-scrollspy-works-strange
        $main.scrollspy("refresh");

        // temporary: click #main to expand to full view
        $main.toggle( function () {
            $(this).removeClass("span8").addClass("span12");
            $("#sidebar").css("display", "none");
        }, function () {
            $(this).removeClass("span12").addClass("span8");
            $("#sidebar").css("display", "block");
        });

        // STICKY SIDEBAR AND NODE HEADINGS

        function makeStickyClone($origEl, stickyClass) {
            $origEl
                .before($origEl.clone())
                .css("width", $origEl.width())
                .addClass(stickyClass);
        }

        /*
         * $origEl: jquery element used to determine offset boundaries
         * $scrollEl: jquery element within which scroll is registered
         * buffer: amount to add/subtract from offset.top to ensure the sticky clone is triggered at the right time. ex: the buffer is -40 to account for the topbar.
         * min:
         * max:
         * hideOrigEl: if true, hide the origin element used to determine offset boundaries
         */
        function updateStickyClone($origEl, $scrollEl, buffer, min, max, hideOrigEl) {

            var scrollTop = $scrollEl.scrollTop();
            var stickyClone = $(".sticky-clone", $origEl);

            console.log(scrollTop + ", min: " + min + ", max: " + max);
            min = min + buffer;
            max = max + buffer;

            if ((scrollTop > min) && (scrollTop < max)) {
                stickyClone.css({
                    "visibility": "visible"
                });
                if (hideOrigEl) {
                    $origEl.css({
                        "visibility": "hidden"
                    });
                }
            } else {
                stickyClone.css({
                    "visibility": "hidden"
                });
                if (hideOrigEl) {
                    $origEl.css({
                        "visibility": "visible"
                    });
                }
            }
        }

        // buffer necessary due to topbar and margin
        function updateStickySidebar() {

            var buffer = -50;
            var $origEl = $("#sidebar");
            var min = $origEl.offset().top;
            var max = $("body").height();

            updateStickyClone($origEl, $(window), buffer, min, max, true);
        }

        function updateStickyHeaders() {
           $(".persist-area").each(function() {

                var buffer = -40;
                var $origEl = $(this);
                var min = $origEl.offset().top;
                var max = min + $origEl.height();

                updateStickyClone($origEl, $(window), buffer, min, max, false);
            });
        }

        // make clones
        $(".persist-area").each(function() {
            makeStickyClone($(".persist-header", this), "sticky-clone");
        });
        makeStickyClone($("#sidebar .sticky-orig"), "sticky-clone");

        // make
        $(window)
            .scroll(updateStickyHeaders)
            .scroll(updateStickySidebar)
            .trigger("scroll");
    }
});
