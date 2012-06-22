$(document).ready(function(){
    var sidebar = $("#sidebar");
    var main = $("#main");
    var extra = $("#extra");

    var mainBase = "span10";

    var sidebarExpandQA = "span1";
    var mainExpandQA = "offset1";
    var extraExpandQA = "span4 offset11";

    var sidebarCompressQA = "span4";
    var mainCompressQA = "offset4";
    var extraCompressQA = "span1 offset14";

    // initialize
    main.addClass(mainBase);
    compressQA(0);

    var speed = 400;

    var qa = $("#qa");
    var buttons = [$("#expand-btn"), $("#questions-btn"), $("#comments-btn")];

    // TODO: fix this so it's based on a data attribute.
    _.each(buttons, function(button, i) {
        button.click( function() {
            if (qa.css("display") === "none") {
                expandQA(speed);
            } else {
                compressQA(speed);
            }
        });
    });

    function expandQA (speed) {
        $("li a", sidebar).css("visibility", "hidden");
        $("li.nav-header", sidebar).css("visibility", "hidden");
        $("#qa-compressed").hide();
        $("#qa").show();

        sidebar.switchClass(sidebarCompressQA, sidebarExpandQA, speed);
        main.switchClass(mainCompressQA, mainExpandQA, speed);
        extra.switchClass(extraCompressQA, extraExpandQA, speed);
    }

    function compressQA (speed) {
        $("li a", sidebar).css("visibility", "visible");
        $("li.nav-header", sidebar).css("visibility", "visible");
        $("#qa").hide();
        $("#qa-compressed").show();

        sidebar.switchClass(sidebarExpandQA, sidebarCompressQA, speed);
        main.switchClass(mainExpandQA, mainCompressQA, speed);
        extra.switchClass(extraExpandQA, extraCompressQA, speed);
    }

    // populate content!

    var lesson = "equations";
    var lessonDataPath = "../lessons/" + lesson + "/data.json";

    window.iconMap = {
        video: "icon-facetime-video",
        exploration: "icon-plane",
        challenge: "icon-bolt",
        practice: "icon-ok",
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
    Handlebars.registerPartial("practice-node", $("#practice-node-partial").html());
    Handlebars.registerPartial("challenge-node", $("#challenge-node-partial").html());
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
        $("#sidebar-inner", sidebar).html(sidebarTemplate(data));
        main.append(mainTemplate(data));

    }


});