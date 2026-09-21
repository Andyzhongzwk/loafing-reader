// Jump button: prompt for a target line index and re-render from there.
elements.jump.addEventListener('click', function (e) {
    let value = prompt('跳转到？', fileInfo.bookmark);
    value = parseInt(value);
    if (!isNaN(value) && fileInfo.content && fileInfo.length >= value) {
        jump(value);
    }
    else {
        alert('输入有误，跳转失败');
    }
});
