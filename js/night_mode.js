const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');

const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;

if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark') {
        toggleSwitch.checked = true;
    }
}

toggleSwitch.addEventListener('change', switchTheme, false);




function switchTheme(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark'); //add this
    }
    else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light'); //add this
    }
}

/*
document.getElementById('darkThemeImg').addEventListener('click', switchTheme, false);

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
}*/

