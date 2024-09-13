document.addEventListener("DOMContentLoaded", () => {
    const loader = document.getElementById("loader");
    const content = document.getElementById("content");

    // 5秒後にローディング画面を隠してコンテンツを表示する
    setTimeout(() => {
        loader.style.display = "none";
        content.style.display = "block";
    }, 1500); // ローディング画面の表示時間（ミリ秒）
});

