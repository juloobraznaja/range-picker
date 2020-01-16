const supportsTemplate = ("content" in document.createElement("template"));

export let createElement = supportsTemplate ?
    function(html) {
        const template = document.createElement('template');
        template.innerHTML = html;
        return template.content.firstElementChild;
    } :
    function(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.firstElementChild;
    };

