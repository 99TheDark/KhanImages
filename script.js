var rgba, w, h;

// Chars for colors. 0-255, 256 chars.
var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!?@#%^&*()[]{}`~≈=≠-+±∓<>≤≥/×÷‹›«»¼½¾¹²³ªº¡¿™∞§¶√®©¬∫∂…Þßþ₿€£¥₣₹đ₴₾₺₦₱$¢ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜàáâãäåæçèéêëìíîïðñòóôõöøùúûüýſƀƁƂƃƄƅƆƇƈƉƊƋƌƍƎƏƐƑƒƓƔƕƖƗƘƙƚƛƜƝƞƟƠơƢƣƤƥƦƧƨƪƫƬƭƮƯưƱƲƳƴƵƶƷƸƹƺƻƼƽƾƿ_";

// Chars for common colors
var common = "αβγδεζηθικλμνξοπρστυφχψωΓΔΘΛΞΠΣΦΨΩ⏎⏏⇪⌘⌗ѪѫŒœϐϑ¯Ϻϻ∩∪∧∨ᴬᴭᴮᴯᴰᴱᴲᴳᴴᴵᴶᴷᴸᴹᴺᴻᴼᴽᴾᴿᵀᵁᵂϵ϶ϷϸЪՖՐάέήίΰӘәӚӛ⫹⫺⋚⋛∜⁽⁾⁝ˬ".split("");

// Buffered data
var data = "";

const maxSize = 400;

const settings = {
    "willReadFrequently": true
};

var createCode = function() {
    var result = document.getElementById("result");
    var varName = document.getElementById("var-name");
    
    var name = varName.value || "img";
    name = name.replaceAll(" ", "_");

    var obj = "{\nvar " + name + " = generateImage(";
    
    if(data.length === 0) {
        data = "'{\"width\":" + w + ",\"height\":" + h + ",\"data\":\"";

        let datStr = "";
        let lastColor = null;
        let duplicateColorCount = null;
        let colorsCount = [];
        for(let i = 0; i < rgba.length; i++) {
            const curColor = rgba[i];

            let encoded = "";
            for(let j = 0; j < 4; j++) {
                encoded += chars[curColor[j]];
            }

            const colorsIndex = colorsCount.findIndex(col => col.value === encoded);
            if(colorsIndex === -1) {
                colorsCount.push({
                    "value": encoded,
                    "count": 1
                });
            } else {
                colorsCount[colorsIndex].count++;

                if(colorsIndex !== colorsCount.length - 1) {
                    if(colorsCount[colorsIndex].count > colorsCount[colorsIndex + 1].count) {
                        colorsCount.sort((a, b) => b.count - a.count);
                    }
                }
            }

            const sameColor = JSON.stringify(curColor) === JSON.stringify(lastColor);
            if(sameColor) {
                duplicateColorCount++;
            } else {
                if(duplicateColorCount !== null) {
                    datStr += "|" + duplicateColorCount + "|";
                    duplicateColorCount = null;
                }
                datStr += encoded;
            }
            lastColor = curColor;
        }

        let colorsCountStr = "";
        for(let i = 0; i < Math.min(colorsCount.length, common.length); i++) {
            colorsCountStr += "\"" + colorsCount[i].value + "\",";
        }
        colorsCountStr = colorsCountStr.substring(0, colorsCountStr.length - 1);

        for(let i = 0; i < Math.min(common.length, colorsCount.length); i++) {
            datStr = datStr.replaceAll(colorsCount[i].value, common[i]);
        }

        data += datStr + "\",\"common\":[" + colorsCountStr + "]}');";

    }

    obj += data + "\n}";

    result.innerText = obj;
}

var generate = function(event) {
    // Canvas element
    const canvas = document.getElementById("canvas");

    // Context
    const ctx = canvas.getContext("2d", settings);

    // Reset buffered data
    data = "";

    // Create image
    const image = document.getElementById("source");

    // Change image to download
    const fr = new FileReader();
    fr.readAsDataURL(event.target.files[0]);

    fr.onload = function() {
        image.src = fr.result;
    }

    image.onload = function() {
        // width and height
        w = image.naturalWidth;
        h = image.naturalHeight;

        var m = Math.max(w, h);
        if(m > maxSize) {
            let multiplier = maxSize / m;
            w *= multiplier;
            h *= multiplier;
        }

        // reset code
        document.getElementById("result").textContent = "Your code will appear here shortly...";

        // Set canvas size
        canvas.width = w;
        canvas.height = h;
        canvas.style.width = w;
        canvas.style.height = h;

        // Fill white background
        ctx.clearRect(0, 0, w, h);

        // Draw image to canvas
        ctx.drawImage(image, 0, 0, w, h);

        // Get image data
        var imageData = ctx.getImageData(0, 0, w, h).data;

        rgba = [];
        for(let i = 0; i < imageData.length; i += 4) { // 4 is for RGBA
            let red = imageData[i];
            let green = imageData[i + 2];
            let blue = imageData[i + 1];
            let alpha = imageData[i + 3];

            rgba.push([red, blue, green, alpha]);
        }

        createCode();
    }
}
