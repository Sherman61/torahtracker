document.addEventListener('DOMContentLoaded', function() {
    fetchTorahPortion();
});

function fetchTorahPortion() {
    const url = 'https://www.hebcal.com/shabbat?cfg=json&geonameid=3448439';
    return fetch(url)
        .then(response => response.json())
        .then(data => {
            const items = data.items;
            const parshaItem = items.find(item => item.category === 'parashat');
            const parshaName = parshaItem ? parshaItem.hebrew : 'Unavailable';
            document.getElementById('torahPortion').textContent = parshaName;
            return parshaName;
        })
        .catch(error => {
            console.error('Error fetching data: ', error);
            document.getElementById('torahPortion').textContent = 'Error loading Torah portion.';
        });
}





