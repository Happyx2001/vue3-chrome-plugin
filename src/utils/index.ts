//压缩方法
export function compress(
    base64String: string,
    w: number = 300,
    quality: number
): Promise<string> {
    let getMimeType = function (urlData: string) {
        let arr: string[] = urlData.split(',');
        let mime = (arr[0].match(/:(.*?);/) as string[])[1];
        // return mime.replace("image/", "");
        return mime;
    };
    let newImage: HTMLImageElement = new Image();
    let imgWidth: number, imgHeight: number;

    let promise = new Promise((resolve) => (newImage.onload = resolve));
    newImage.src = base64String;
    return promise.then(() => {
        imgWidth = newImage.width;
        imgHeight = newImage.height;
        let canvas: HTMLCanvasElement = document.createElement('canvas');
        let ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
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
        let base64 = canvas.toDataURL(getMimeType(base64String), quality);
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
