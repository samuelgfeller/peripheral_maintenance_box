// document.getElementById('darkThemeCheckbox').addEventListener('change', switchTheme, false);
document.getElementById('darkThemeImg').addEventListener('click', switchTheme, false);
// document.body.addEventListener('dblclick', switchTheme, false);

function switchTheme(e) {


    if (document.documentElement.getAttribute('data-theme') === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        document.getElementById("darkThemeImg").src="img/night-mode.png";

        localStorage.setItem('theme', 'light'); //add this
    }else {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById("darkThemeImg").src="img/day-mode.png";

        localStorage.setItem('theme', 'dark'); //add this

    }

/*    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark'); //add this
    }
    else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light'); //add this
    }*/
}