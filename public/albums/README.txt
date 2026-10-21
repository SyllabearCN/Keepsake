Keepsake 本地相册使用说明

1. 在 public/albums 下按旅行或年份新建文件夹，例如：
   public/albums/2027-spring/

2. 把图片放进对应文件夹。

3. 打开 app/data/albums.ts，在 gallery 数组里添加一条记录：
   {
     id: "spring-rain",
     src: "/albums/2027-spring/spring-rain.jpg",
     alt: "雨后的山间小路",
     title: { zh: "春天下过雨", en: "After the rain" },
     caption: { zh: "一句中文说明", en: "An English note" },
     date: "2027-04-08",
     location: { zh: "杭州", en: "Hangzhou" },
     album: "2027-spring",
     width: 1600,
     height: 1100
   }

4. 如果新增了相册分类，再在同一个文件的 albums 数组中添加相册名称。

照片建议：
- 横图宽高比约 4:3 或 16:10
- 竖图宽高比约 4:5 或 3:4
- 单张文件尽量控制在 1-3 MB
- 文件名使用英文、数字和连字符
