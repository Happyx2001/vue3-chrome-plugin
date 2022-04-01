/**
 * url: base64
 *
 */
//压缩方法
export function imageCompression(base64, w = 300, callback) {
    let newImage = new Image();
    let quality = 0.6; //压缩系数0-1之间
    newImage.src = base64;
    newImage.setAttribute('crossOrigin', 'Anonymous'); //url为外域时需要
    let imgWidth, imgHeight;
    newImage.onload = function () {
        imgWidth = this.width;
        imgHeight = this.height;
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        if (Math.max(imgWidth, imgHeight) > w) {
            if (imgWidth > imgHeight) {
                canvas.width = w;
                canvas.height = (w * imgHeight) / imgWidth;
            } else {
                canvas.height = w;
                canvas.width = (w * imgWidth) / imgHeight;
            }
        } else {
            canvas.width = imgWidth;
            canvas.height = imgHeight;
            quality = 0.6;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
        let base64 = canvas.toDataURL('image/jpeg', quality); //压缩语句
        // 如想确保图片压缩到自己想要的尺寸,如要求在50-150kb之间，请加以下语句，quality初始值根据情况自定
        while (base64.length / 1024 > 10) {
            quality -= 0.01;
            base64 = canvas.toDataURL('image/jpeg', quality);
        }
        // 防止最后一次压缩低于最低尺寸，只要quality递减合理，无需考虑
        while (base64.length / 1024 < 5) {
            quality += 0.001;
            base64 = canvas.toDataURL('image/jpeg', quality);
        }
        callback(base64); //必须通过回调函数返回，否则无法及时拿到该值
    };
}

export function compress(base64String, w, quality) {
    var getMimeType = function (urlData) {
        var arr = urlData.split(',');
        var mime = arr[0].match(/:(.*?);/)[1];
        // return mime.replace("image/", "");
        return mime;
    };
    var newImage = new Image();
    var imgWidth, imgHeight;

    var promise = new Promise((resolve) => (newImage.onload = resolve));
    newImage.src = base64String;
    return promise.then(() => {
        imgWidth = newImage.width;
        imgHeight = newImage.height;
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        if (Math.max(imgWidth, imgHeight) > w) {
            if (imgWidth > imgHeight) {
                canvas.width = w;
                canvas.height = (w * imgHeight) / imgWidth;
            } else {
                canvas.height = w;
                canvas.width = (w * imgWidth) / imgHeight;
            }
        } else {
            canvas.width = imgWidth;
            canvas.height = imgHeight;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(newImage, 0, 0, canvas.width, canvas.height);
        var base64 = canvas.toDataURL(getMimeType(base64String), quality);
        while (base64.length > 1500) {
            quality -= 0.01;
            base64 = canvas.toDataURL(getMimeType(base64String), quality);
        }
        // 防止最后一次压缩低于最低尺寸，只要quality递减合理，无需考虑
        // while (base64.length < 500) {
        //     quality += 0.001;
        //     base64 = canvas.toDataURL(getMimeType(base64String), quality);
        // }
        console.log(base64);
        return base64;
    });
}
