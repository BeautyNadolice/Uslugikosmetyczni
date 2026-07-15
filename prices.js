// Cennik usług dla Darii - tutaj możesz łatwo zmieniać ceny i nazwy zabiegów
const cennikData = [
    {
        categoryTitle: "Kosmetyka i Pielęgnacja Twarzy",
        items: [
            { name: "Masaż twarzy (autorski zabieg pielęgnacyjny)", price: "od 150 zł" },
            { name: "Oczyszczanie kombinowane twarzy", price: "200 zł" },
            { name: "Zabieg pielęgnacyjny dobrany do potrzeb skóry", price: "250 zł" }
        ]
    },
    {
        categoryTitle: "Stylizacja Oczu (Henna)",
        items: [
            { name: "Architektura brwi + koloryzacja henną", price: "90 zł" },
            { name: "Koloryzacja rzęs henną", price: "60 zł" }
        ]
    },
    {
        categoryTitle: "Manicure i Pedicure",
        items: [
            { name: "Manicure z pielęgnacją i kolorem", price: "120 zł" },
            { name: "Pedicure estetyczny", price: "160 zł" }
        ]
    }
];

// Funkcja, która automatycznie generuje cennik na stronie HTML
document.addEventListener("DOMContentLoaded", function() {
    const priceSection = document.getElementById("dynamic-price-section");
    if (!priceSection) return;

    let htmlContent = '<h2>Usługi i Cennik</h2>';

    cennikData.forEach(category => {
        htmlContent += `<div class="price-category">`;
        htmlContent += `<div class="category-title">${category.categoryTitle}</div>`;
        
        category.items.forEach(item => {
            htmlContent += `
                <div class="price-item">
                    <span class="price-name">${item.name}</span>
                    <span class="price-filler"></span>
                    <span class="price-value">${item.price}</span>
                </div>
            `;
        });
        
        htmlContent += `</div>`;
    });

    priceSection.innerHTML = htmlContent;
});
