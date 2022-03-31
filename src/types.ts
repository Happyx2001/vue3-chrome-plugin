// typescript 类型文件
// 集锦的数据结构
// data = [
//     {
//         id: 1,
//         name: '...',
//         img_url: '...',
//         length: 1,
//         children: [
//             {
//                 cId: '...',
//                 title: '..',
//                 url: '...',
//                 img_url: '...',
//             },
//         ],
//     },
// ];
// 集锦接口
export interface IMainData {
    id: number | string;
    name: string;
    img_url: string;
    length: number;
    children: Array<ITabData> | [];
}

// 集锦页面接口
export interface ITabData {
    cId: number;
    title: string;
    url: string;
    img_url: string;
}
