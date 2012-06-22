$(document).ready( function () {

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

        // store elements in variables
        var $sidebar = $("#sidebar");
        var $main = $("#main");
        var $extra = $("#extra");

        // render templates
        $sidebar.html(sidebarTemplate(data));
        $main.append(mainTemplate(data));

        var mainClass = "span7 offset2";
        var extraClass = "offset9";

        var sidebarClassCollapsed = "span0 offset1 collapsed";
        var extraClassCollapsed = "span1 collapsed";

        var sidebarClassExpanded = "span2";
        var extraClassExpanded = "span3 expanded";

        collapseSidebar(0);
        $main.addClass(mainClass);
        $extra.addClass(extraClass);
        collapseExtra(0);

        var speed = 400;
        $extra.toggle(function () {
            expandExtra(speed);
        }, function () {
            collapseExtra(speed);
        });

        function expandExtra (speed) {
            $extra.switchClass(extraClassCollapsed, extraClassExpanded, speed);
        }

        function collapseExtra (speed) {
            $extra.switchClass(extraClassExpanded, extraClassCollapsed, speed);
        }

        
        $sidebar.toggle(function () {
            expandSidebar(speed);
        }, function () {
            collapseSidebar(speed);
        });

        function expandSidebar (speed) {
            $sidebar.switchClass(sidebarClassCollapsed, sidebarClassExpanded, speed);
        }

        function collapseSidebar (speed) {
            $sidebar.switchClass(sidebarClassExpanded, sidebarClassCollapsed, speed);
        }
    }

});