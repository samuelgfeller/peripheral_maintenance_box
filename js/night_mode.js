document.getElementById('darkThemeImg').addEventListener('click', switchTheme, false);

const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;

if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);

    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById("darkThemeImg").src="img/day-mode.png";
    }
}

function switchTheme(e) {

    if (document.documentElement.getAttribute('data-theme') === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        document.getElementById("darkThemeImg").src="img/night-mode.png";

        localStorage.setItem('theme', 'light');
    }else {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById("darkThemeImg").src = "img/day-mode.png";

        localStorage.setItem('theme', 'dark');
    }
}

