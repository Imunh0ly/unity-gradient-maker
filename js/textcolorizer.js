// Utility functions
const cutHex = h => h.startsWith("#") ? h.slice(1) : h;
const hexToR = h => parseInt(cutHex(h).slice(0, 2), 16);
const hexToG = h => parseInt(cutHex(h).slice(2, 4), 16);
const hexToB = h => parseInt(cutHex(h).slice(4, 6), 16);
const toHex = n => {
    n = Math.max(0, Math.min(parseInt(n, 10) || 0, 255));
    return "0123456789ABCDEF".charAt((n >> 4)) + "0123456789ABCDEF".charAt(n & 15);
};
const rgbToHex = (R, G, B) => toHex(R) + toHex(G) + toHex(B);

// Global state
let inputs = {
    effect: "", text: "", font: "", size: "", bold: 0, italic: 0, colorword: 0,
    color1: "", color2: "", color3: "", color4: "", color5: "", color6: "", color7: "", color8: ""
};
let random_char = [];
let random_length = 0;
let update = 0;

// Random colors
function randomize_colors() {
    const length = document.getElementById("input_text").value.length;
    random_char = Array.from({ length }, () => rgbToHex(Math.random() * 255, Math.random() * 255, Math.random() * 255));
    random_length = length;
    update = 1;
}

// Get input values and detect updates
function getInput(id) {
    const el = document.getElementById(id);
    return el.type === "checkbox" ? el.checked : el.value;
}

function textcolorizer_handle() {
    // Handle effect visibility
    const newEffect = getInput("input_effect");
    if (inputs.effect !== newEffect) {
        for (let i = 1; i <= 6; i++) document.getElementById("color_select" + i).style.visibility = "hidden";
        document.getElementById("color_select" + newEffect)?.style.setProperty("visibility", "visible");
        update = 1;
    }
    inputs.effect = newEffect;

    // Check and update all inputs
    ["color1","color2","color3","color4","color5","color6","color7","color8","text","font","size"].forEach(key => {
        const val = getInput("input_" + key);
        if (inputs[key] !== val) update = 1;
        inputs[key] = val;
    });
    ["bold","italic","colorword"].forEach(key => {
        const val = getInput("input_" + key) ? 1 : 0;
        if (inputs[key] !== val) update = 1;
        inputs[key] = val;
    });

    if (update) {
        update = 0;
        let str_html = "", str_richtext = "", str_bbcode = "";
        let str_richtextend = "", str_bbcodeend = "", str_style = "";

        if (inputs.bold) { str_style += "font-weight:bold;"; str_richtext += "<b>"; str_richtextend = "</b>" + str_richtextend; str_bbcode += "[b]"; str_bbcodeend = "[/b]" + str_bbcodeend; }
        if (inputs.italic) { str_style += "font-style:italic;"; str_richtext += "<i>"; str_richtextend = "</i>" + str_richtextend; str_bbcode += "[i]"; str_bbcodeend = "[/i]" + str_bbcodeend; }
        if (inputs.font) { str_style += `font-family:"${inputs.font}";`; str_bbcode += `[font="${inputs.font}"]`; str_bbcodeend = "[/font]" + str_bbcodeend; }
        if (inputs.size && inputs.size !== "0") {
            const sizes = ["10px","12px","15px","17px","22px","27px","35px"];
            const sizePx = sizes[inputs.size-1] || "12px";
            str_style += `font-size:${sizePx};`;
            str_richtext += `<size=${inputs.size*6}>`; str_richtextend = "</size>" + str_richtextend;
            str_bbcode += `[size=${inputs.size}]`; str_bbcodeend = "[/size]" + str_bbcodeend;
        }

        if (str_style) str_html += `<span style='${str_style}'>`;

        const appendChar = (c, color) => {
            if (c === " ") { str_html+=" "; str_richtext+=" "; str_bbcode+=" "; return; }
            str_html += `<span style='color:#${color};'>${c}</span>`;
            str_richtext += `<color=#${color}>${c}</color>`;
            str_bbcode += `[color=#${color}]${c}[/color]`;
        };

        const len = inputs.text.length;
        if (inputs.effect === "1" || inputs.effect === "2" || inputs.effect === "3") {
            let colors = [];
            if (inputs.effect === "1") colors = [inputs.color1, inputs.color2];
            if (inputs.effect === "2") colors = [inputs.color3, inputs.color4];
            if (inputs.effect === "3") colors = [inputs.color5, inputs.color6, inputs.color7];

            let r = hexToR(colors[0]), g = hexToG(colors[0]), b = hexToB(colors[0]);
            let rinc, ginc, binc;
            let r2, g2, b2, rinc2, ginc2, binc2;
            if (inputs.effect === "3") {
                r2 = hexToR(colors[1]); g2 = hexToG(colors[1]); b2 = hexToB(colors[1]);
                rinc = (hexToR(colors[2])-r)/Math.floor(len/2);
                ginc = (hexToG(colors[2])-g)/Math.floor(len/2);
                binc = (hexToB(colors[2])-b)/Math.floor(len/2);
                rinc2 = (hexToR(colors[2])-r2)/Math.floor(len/2);
                ginc2 = (hexToG(colors[2])-g2)/Math.floor(len/2);
                binc2 = (hexToB(colors[2])-b2)/Math.floor(len/2);
            } else {
                rinc = (hexToR(colors[1])-r)/(inputs.effect === "1" ? len : Math.floor(len/2));
                ginc = (hexToG(colors[1])-g)/(inputs.effect === "1" ? len : Math.floor(len/2));
                binc = (hexToB(colors[1])-b)/(inputs.effect === "1" ? len : Math.floor(len/2));
            }

            for (let i = 0; i < len; i++) {
                appendChar(inputs.text[i], rgbToHex(r,g,b));
                if (inputs.effect === "1") { r+=rinc; g+=ginc; b+=binc; }
                else if (inputs.effect === "2") { if(i<Math.floor(len/2)){r+=rinc;g+=ginc;b+=binc;} else {r-=rinc;g-=ginc;b-=binc;} }
                else if (inputs.effect === "3") { if(i<Math.floor(len/2)){r+=rinc;g+=ginc;b+=binc;} else {r+=rinc2;g+=ginc2;b+=binc2;} }
            }
        } else if (inputs.effect === "4") {
            str_html += `<span style='color:${inputs.color8}'>${inputs.text}</span>`;
            str_richtext += `<color=${inputs.color8}>${inputs.text}</color>`;
            str_bbcode += `[color=${inputs.color8}]${inputs.text}[/color]`;
        } else if (inputs.effect === "5") {
            let i = 0;
            for (let a = 0; a < len; a++) {
                const ccol = random_char[i];
                if (!inputs.colorword || (inputs.colorword && inputs.text[a] === " ")) i++;
                if (a >= random_length) appendChar(inputs.text[a], "");
                else if (!inputs.colorword) appendChar(inputs.text[a], ccol);
                else {
                    if(a===0 || inputs.text[a-1]==" ") str_html+=`<span style='color:#${ccol}'>${inputs.text[a]}`, str_richtext+=`<color=#${ccol}>${inputs.text[a]}`, str_bbcode+=`[color=#${ccol}]${inputs.text[a]}`;
                    else if(a===len-1 || inputs.text[a]==" ") str_html+=inputs.text[a]+"</span>", str_richtext+=inputs.text[a]+"</color>", str_bbcode+=inputs.text[a]+"[/color]";
                    else str_html+=inputs.text[a], str_richtext+=inputs.text[a], str_bbcode+=inputs.text[a];
                }
            }
        } else if (inputs.effect === "6") {
            const s = 1/6;
            for (let a = 0; a < len; a++) {
                const i = a/len;
                const p = (i % s)/s;
                let ccol;
                if (i >= s*5) ccol = rgbToHex(255,0,255*(1-p));
                else if (i >= s*4) ccol = rgbToHex(255*p,0,255);
                else if (i >= s*3) ccol = rgbToHex(0,255*(1-p),255);
                else if (i >= s*2) ccol = rgbToHex(0,255,255*p);
                else if (i >= s*1) ccol = rgbToHex(255*(1-p),255,0);
                else ccol = rgbToHex(255,255*p,0);
                appendChar(inputs.text[a], ccol);
            }
        }

        if (str_style) str_html += "</span>";
        document.getElementById("div_preview").innerHTML = "<span style='font-size:12px'>" + str_html + "</span>";
        document.getElementById("output_bbcode").value = str_bbcode + str_bbcodeend;
        document.getElementById("output_richtext").value = str_richtext + str_richtextend;
        document.getElementById("output_html").value = str_html;
    }

    setTimeout(textcolorizer_handle, 50);
}
