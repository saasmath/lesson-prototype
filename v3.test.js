$(document).ready(function(){
    var sidebar = $("#sidebar");
    var main = $("#main");
    var extra = $("#extra");

    var sidebarExpandQA = "span1";
    var mainExpandQA = "span10 offset1";
    var extraExpandQA = "span4 offset11";

    var sidebarCompressQA = "span4";
    var mainCompressQA = "span10 offset4";
    var extraCompressQA = "span1 offset14";

    // initialize
    expandQA();

    sidebar.toggle(function() {
        compressQA();
    }, function() {
        expandQA();
    });

    // TODO: fix this so it's based on a data attribute.
    extra.toggle(function() {
        compressQA();
    }, function() {
        expandQA();
    });

    function expandQA () {
        sidebar.removeClass(sidebarCompressQA);
        main.removeClass(mainCompressQA);
        extra.removeClass(extraCompressQA);

        sidebar.addClass(sidebarExpandQA);
        main.addClass(mainExpandQA);
        extra.addClass(extraExpandQA);
    }

    function compressQA () {
        sidebar.removeClass(sidebarExpandQA);
        main.removeClass(mainExpandQA);
        extra.removeClass(extraExpandQA);

        sidebar.addClass(sidebarCompressQA);
        main.addClass(mainCompressQA);
        extra.addClass(extraCompressQA);
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